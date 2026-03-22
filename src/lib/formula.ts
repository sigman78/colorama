import { type OKLCH, mixOklch } from './color';

export class FormulaError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'FormulaError';
  }
}

// ---- Lexer ----

type TT =
  | 'Num'
  | 'Ident'
  | 'Dollar'
  | 'Dot'
  | 'Plus'
  | 'Minus'
  | 'Star'
  | 'Slash'
  | 'LParen'
  | 'RParen'
  | 'Comma'
  | 'EOF';
interface Token {
  type: TT;
  value?: string | number;
}

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '$') {
      tokens.push({ type: 'Dollar' });
      i++;
      continue;
    }
    if (ch === '.') {
      tokens.push({ type: 'Dot' });
      i++;
      continue;
    }
    if (ch === '+') {
      tokens.push({ type: 'Plus' });
      i++;
      continue;
    }
    if (ch === '-') {
      tokens.push({ type: 'Minus' });
      i++;
      continue;
    }
    if (ch === '*') {
      tokens.push({ type: 'Star' });
      i++;
      continue;
    }
    if (ch === '/') {
      tokens.push({ type: 'Slash' });
      i++;
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'LParen' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RParen' });
      i++;
      continue;
    }
    if (ch === ',') {
      tokens.push({ type: 'Comma' });
      i++;
      continue;
    }
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      let num = '';
      while (i < src.length && /[0-9.]/.test(src[i])) num += src[i++];
      tokens.push({ type: 'Num', value: parseFloat(num) });
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let id = '';
      while (i < src.length && /[a-zA-Z0-9_]/.test(src[i])) id += src[i++];
      tokens.push({ type: 'Ident', value: id });
      continue;
    }
    throw new FormulaError(`unexpected character '${ch}'`);
  }
  tokens.push({ type: 'EOF' });
  return tokens;
}

// ---- AST ----

type Expr =
  | { k: 'Num'; v: number }
  | { k: 'Var'; name: string }
  | { k: 'Prop'; name: string; prop: 'l' | 'c' | 'h' }
  | { k: 'BinOp'; op: string; l: Expr; r: Expr }
  | { k: 'Neg'; e: Expr }
  | { k: 'Call'; fn: string; args: Expr[] };

// ---- Parser ----

function makeParser(tokens: Token[]) {
  let pos = 0;
  const peek = (): Token => tokens[pos];
  const eat = (): Token => tokens[pos++];
  const expect = (t: TT): Token => {
    const tok = eat();
    if (tok.type !== t) throw new FormulaError(`expected ${t}, got ${tok.type}`);
    return tok;
  };

  function parseExpr(): Expr {
    return parseAddSub();
  }

  function parseAddSub(): Expr {
    let left = parseMulDiv();
    while (peek().type === 'Plus' || peek().type === 'Minus') {
      const op = eat().type === 'Plus' ? '+' : '-';
      left = { k: 'BinOp', op, l: left, r: parseMulDiv() };
    }
    return left;
  }

  function parseMulDiv(): Expr {
    let left = parseUnary();
    while (peek().type === 'Star' || peek().type === 'Slash') {
      const op = eat().type === 'Star' ? '*' : '/';
      left = { k: 'BinOp', op, l: left, r: parseUnary() };
    }
    return left;
  }

  function parseUnary(): Expr {
    if (peek().type === 'Minus') {
      eat();
      return { k: 'Neg', e: parseUnary() };
    }
    return parsePrimary();
  }

  function parsePrimary(): Expr {
    const t = peek();
    if (t.type === 'Num') {
      eat();
      return { k: 'Num', v: t.value as number };
    }
    if (t.type === 'LParen') {
      eat();
      const e = parseExpr();
      expect('RParen');
      return e;
    }
    if (t.type === 'Dollar') {
      eat();
      const name = expect('Ident').value as string;
      if (peek().type === 'Dot') {
        eat();
        const prop = expect('Ident').value as string;
        if (prop !== 'l' && prop !== 'c' && prop !== 'h')
          throw new FormulaError(`unknown component '.${prop}' — use .l, .c, or .h`);
        return { k: 'Prop', name, prop: prop as 'l' | 'c' | 'h' };
      }
      return { k: 'Var', name };
    }
    if (t.type === 'Ident') {
      const fn = eat().value as string;
      expect('LParen');
      const args: Expr[] = [];
      if (peek().type !== 'RParen') {
        args.push(parseExpr());
        while (peek().type === 'Comma') {
          eat();
          args.push(parseExpr());
        }
      }
      expect('RParen');
      return { k: 'Call', fn, args };
    }
    throw new FormulaError(
      t.type === 'EOF' ? 'unexpected end of input' : `unexpected token '${t.type}'`
    );
  }

  const root = parseExpr();
  if (peek().type !== 'EOF') throw new FormulaError('unexpected content after expression');
  return root;
}

export function parseFormula(src: string): Expr {
  return makeParser(tokenize(src));
}

// ---- Evaluator ----

export interface EvalContext {
  colors: Record<string, OKLCH>;
  scalars: Record<string, number>;
}

type Val = OKLCH | number;

function isColor(v: Val): v is OKLCH {
  return typeof v === 'object';
}

function evalExpr(e: Expr, ctx: EvalContext): Val {
  switch (e.k) {
    case 'Num':
      return e.v;
    case 'Neg': {
      const v = evalExpr(e.e, ctx);
      if (isColor(v)) throw new FormulaError('cannot negate a color');
      return -v;
    }
    case 'Var': {
      if (e.name in ctx.colors) return ctx.colors[e.name];
      if (e.name in ctx.scalars) return ctx.scalars[e.name];
      throw new FormulaError(`unknown variable '$${e.name}'`);
    }
    case 'Prop': {
      if (!(e.name in ctx.colors)) {
        if (e.name in ctx.scalars) throw new FormulaError(`'$${e.name}' is a scalar, not a color`);
        throw new FormulaError(`unknown variable '$${e.name}'`);
      }
      return ctx.colors[e.name][e.prop];
    }
    case 'BinOp': {
      const l = evalExpr(e.l, ctx),
        r = evalExpr(e.r, ctx);
      if (isColor(l) || isColor(r))
        throw new FormulaError('arithmetic on colors is not allowed — use .l, .c, .h');
      switch (e.op) {
        case '+':
          return l + r;
        case '-':
          return l - r;
        case '*':
          return l * r;
        case '/':
          return r === 0 ? 0 : l / r;
      }
      break;
    }
    case 'Call':
      return evalCall(e.fn, e.args, ctx);
  }
  throw new FormulaError('internal: unhandled expression');
}

function num(v: Val, name: string): number {
  if (isColor(v)) throw new FormulaError(`argument to ${name}() must be a number, got a color`);
  return v;
}
function col(v: Val, name: string): OKLCH {
  if (!isColor(v)) throw new FormulaError(`argument to ${name}() must be a color, got a number`);
  return v;
}

function evalCall(fn: string, rawArgs: Expr[], ctx: EvalContext): Val {
  const args = rawArgs.map((a) => evalExpr(a, ctx));

  switch (fn) {
    case 'oklch': {
      if (args.length !== 3) throw new FormulaError('oklch() requires exactly 3 arguments');
      return { l: num(args[0], 'oklch'), c: num(args[1], 'oklch'), h: num(args[2], 'oklch') };
    }
    case 'mix': {
      if (args.length !== 3) throw new FormulaError('mix() requires exactly 3 arguments');
      return mixOklch(col(args[0], 'mix'), col(args[1], 'mix'), num(args[2], 'mix'));
    }
    case 'gradient': {
      if (args.length < 3)
        throw new FormulaError('gradient() requires at least 2 color stops (plus t)');
      const t = num(args[0], 'gradient');
      const stops = args.slice(1).map((a) => col(a, 'gradient'));
      const tc = Math.max(0, Math.min(1, t));
      const seg = tc * (stops.length - 1);
      const i = Math.min(Math.floor(seg), stops.length - 2);
      return mixOklch(stops[i], stops[i + 1], seg - i);
    }
    case 'lighten': {
      if (args.length !== 2) throw new FormulaError('lighten() requires 2 arguments');
      const c = col(args[0], 'lighten'),
        a = num(args[1], 'lighten');
      return { ...c, l: c.l + a };
    }
    case 'darken': {
      if (args.length !== 2) throw new FormulaError('darken() requires 2 arguments');
      const c = col(args[0], 'darken'),
        a = num(args[1], 'darken');
      return { ...c, l: c.l - a };
    }
    case 'desaturate': {
      if (args.length !== 2) throw new FormulaError('desaturate() requires 2 arguments');
      const c = col(args[0], 'desaturate'),
        a = num(args[1], 'desaturate');
      return { ...c, c: Math.max(0, c.c - a) };
    }
    case 'clamp': {
      if (args.length !== 3) throw new FormulaError('clamp() requires 3 arguments');
      return Math.max(
        num(args[1], 'clamp'),
        Math.min(num(args[2], 'clamp'), num(args[0], 'clamp'))
      );
    }
    case 'sin': {
      if (args.length !== 1) throw new FormulaError('sin() requires 1 argument');
      return Math.sin(num(args[0], 'sin'));
    }
    case 'cos': {
      if (args.length !== 1) throw new FormulaError('cos() requires 1 argument');
      return Math.cos(num(args[0], 'cos'));
    }
    case 'pow': {
      if (args.length !== 2) throw new FormulaError('pow() requires 2 arguments');
      return Math.pow(num(args[0], 'pow'), num(args[1], 'pow'));
    }
    case 'ln': {
      if (args.length !== 1) throw new FormulaError('ln() requires 1 argument');
      return Math.log(num(args[0], 'ln'));
    }
    case 'soft': {
      if (args.length !== 1) throw new FormulaError('soft() requires 1 argument');
      const x = Math.max(0, Math.min(1, num(args[0], 'soft')));
      return 3 * x * x - 2 * x * x * x;
    }
    case 'sigmoid': {
      if (args.length !== 1) throw new FormulaError('sigmoid() requires 1 argument');
      return 1 / (1 + Math.exp(-num(args[0], 'sigmoid')));
    }
    default:
      throw new FormulaError(`unknown function '${fn}'`);
  }
}

/** Parse and evaluate a formula. Result must be an OKLCH color. */
export function evalFormula(src: string, ctx: EvalContext): OKLCH {
  const ast = parseFormula(src);
  const val = evalExpr(ast, ctx);
  if (!isColor(val)) throw new FormulaError('formula must evaluate to a color, got a number');
  return val;
}
