# Design: hljs Scope Name Refactor

**Date:** 2026-03-23
**Status:** Approved

## Context

`SchemeEntry.classes` currently stores raw CSS selector strings (`.hljs-title.class_`, `.hljs-meta .hljs-keyword`). These are noisy in the UI and tie the data model to one specific CSS encoding. The goal is to store semantic hljs scope names instead, making the UI cleaner and the export layer the single place responsible for CSS selector construction. This also lays groundwork for future multi-format export.

## Data Model

`SchemeEntry.classes: string[]` keeps the same TypeScript type. The **stored values** change from CSS selector strings to hljs scope names using these conventions (matching the hljs documentation):

| Kind | Convention | Example stored | Exported CSS |
|---|---|---|---|
| Simple | single token | `comment` | `.hljs-comment` |
| Subscope | dot-separated | `title.class` | `.hljs-title.class_` |
| Deep subscope | multi-dot | `title.class.inherited` | `.hljs-title.class_.inherited__` |
| Nested | space-separated | `meta keyword` | `.hljs-meta .hljs-keyword` |

No other schema fields change. `ResolvedEntry.classes` passes through unchanged.

**No migration shim.** Old JSON files with `.hljs-*` strings are invalid after this change. The default scheme (`SOLARIZED_DARK`) is the only real data at risk and is updated in-place.

## CSS Export Algorithm

A new pure function `scopeToCssSelector(scope: string, prefix = '.hljs-'): string` is added to `export.ts`:

```
"comment"               →  ".hljs-comment"
"built_in"              →  ".hljs-built_in"
"title.class"           →  ".hljs-title.class_"
"title.class.inherited" →  ".hljs-title.class_.inherited__"
"meta keyword"          →  ".hljs-meta .hljs-keyword"
```

Rules (checked in order):
- **Space present** — nested: exactly one space is valid (e.g. `meta keyword`); split on space, prepend prefix to each part, rejoin with space. Multiple spaces are not valid scope names and need not be handled.
- **Dot present** — subscope: prefix the first segment; each subsequent segment (index `i`, 0-based) gets `i+1` trailing underscores, joined with `.`
- **Neither** — simple: prepend prefix. This covers plain names (`comment`), hyphenated names (`selector-id`, `meta-keyword`), and underscored names (`built_in`).

The prefix parameter defaults to `.hljs-` and is not yet exposed in the UI.

`generateCss()` and `generateLiveCss()` currently join `entry.classes` directly as CSS selectors. Both must be updated to map each scope name through `scopeToCssSelector()` before joining:
```ts
// before:  entry.classes.join(',\n')
// after:   entry.classes.map(c => scopeToCssSelector(c)).join(',\n')
```
Same pattern for the `join(', ')` call in `generateLiveCss`.

## Updated `HLJS_CLASSES`

One entry is **removed**: `function > title` (legacy descendant selector `.hljs-function .hljs-title`, superseded by `title.function`).

All remaining entries are converted to scope names. Representative changes:

| Before | After |
|---|---|
| `.hljs-comment` | `comment` |
| `.hljs-built_in` | `built_in` |
| `.hljs-selector-id` | `selector-id` |
| `.hljs-meta-keyword` | `meta-keyword` |
| `.hljs-variable.constant_` | `variable.constant` |
| `.hljs-title.class_` | `title.class` |
| `.hljs-title.class_.inherited__` | `title.class.inherited` |
| `.hljs-title.function_` | `title.function` |
| `.hljs-function .hljs-title` | *(removed)* |
| `.hljs-meta .hljs-keyword` | `meta keyword` |
| `.hljs-meta .hljs-string` | `meta string` |

Hyphenated and underscored names (e.g. `selector-id`, `built_in`, `meta-keyword`) are simple scopes — the algorithm just prepends the prefix with no other transformation.

`SOLARIZED_DARK` in `defaults.ts` receives the same conversion. The `.hljs-function .hljs-title` entry is dropped from the `definition` entry's classes array.

## UI Display

Scope names are already human-readable. One display transform is applied wherever a scope name is rendered (tag chips and popup list options):

```ts
function displayScope(scope: string): string {
  return scope.includes(' ') ? scope.replace(' ', ' > ') : scope;
}
```

This renders `meta keyword` as `meta > keyword`, communicating the nesting relationship without changing the stored value.

The popup search filter operates on stored scope names. Typing `meta` surfaces both `meta keyword` and `meta string`. Typing `>` matches nothing — acceptable since `>` is display-only.

## Files Changed

| File | Change |
|---|---|
| `src/lib/hljs-classes.ts` | All values → scope names; `function > title` removed |
| `src/lib/export.ts` | Add `scopeToCssSelector()`; both generate functions use it |
| `src/lib/defaults.ts` | All `classes` arrays → scope names; legacy entry dropped |
| `src/components/entries/EntryBlock.svelte` | Add `displayScope()`; apply in tag chips and popup options |
| `src/lib/scheme.ts` | No change |

## Verification

1. `npx wrangler dev` — open the app, inspect entries editor: tags show `comment`, `title.class`, `meta > keyword` (no `.hljs-` prefix, no underscores)
2. Export CSS — verify generated selectors: `.hljs-title.class_`, `.hljs-meta .hljs-keyword`, no `.hljs-function .hljs-title`
3. Open add popup — search `meta` shows `meta keyword` and `meta string` as options; search `title` shows `title`, `title.class`, `title.class.inherited`, `title.function`
4. Add a class and re-export — selector appears correctly in output
5. Live preview in app — verify syntax highlighting still applies correctly with the regenerated CSS
