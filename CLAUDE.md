# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SPA for designing and previewing syntax highlighting color scheme:
App shows color scheme 'preview' with selectable language (cpp, rust, js, ts, css, html, toml) which displays realistic snippet of code 
with all relevant syntax elements along with color scheme editor. Color scheme editor is 'parametric' - meaning we can define number of 
named colors 'palette' and maybe named scalars and then 'program' each color scheme color with formula based on that palette colors and
scalars expression. (Expressions are similar to css new relative color syntax). Base color format is oklch, but color picker/editor should 
allow input/conversion in rgb, hls or hex coded colors. Color scheme entries are based on highlight.js style - see @docs/solarized-dark-hljs.css 
for `.hljs-*` classes. Note that palette starts from base code color (font and background) and each color scheme entry in editor 'inherits' 
that base color, so if font or background are set as 'undefined' its taken from base.  App should support color scheme export, for starter 
in own json format and highlight.js css form. Additional function is select and add to palette some color group sample from popular swatch 
web collections, like coolors.co, paletton.com or similar.


## Expected Stack

- **Bundler** Vite.js
- **Language:** TypeScript
- **Deployer** Wrangler
- **Formatter:** Prettier (configured in `.prettierrc`)

## Code Style

Prettier is configured with:
- Semicolons enabled
- Single quotes
- 2-space indentation
- 100-character print width
- Trailing commas (ES5)
- LF line endings

Run formatting: `npx prettier --write .`

## Development

Once `package.json` and `wrangler.toml` are present, typical commands will be:

```bash
npm install           # Install dependencies
npx wrangler dev      # Start local dev server
npx wrangler deploy   # Deploy to Cloudflare Workers
npm test              # Run tests
```
