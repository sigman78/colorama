import { code as cpp } from './cpp';
import { code as rust } from './rust';
import { code as js } from './js';
import { code as ts } from './ts';
import { code as css } from './css';
import { code as html } from './html';
import { code as md } from './md';
import { code as toml } from './toml';
import { code as diff } from './diff';
import type { PreviewLang } from '../stores/ui';

export const snippets: Record<PreviewLang, string> = {
  cpp,
  rust,
  js,
  ts,
  css,
  html,
  md,
  toml,
  diff,
};
