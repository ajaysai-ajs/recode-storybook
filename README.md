# Design tokens

Figma variables are exported to `/Figma` (one folder per collection, one file per mode) and
converted to CSS custom properties by `scripts/build-tokens.mjs`.

```
npm run tokens        # Figma/*.tokens.json -> src/tokens/css/**  (also runs before storybook)
npm run storybook     # docs under "Foundations"
```

| Path | What it is |
| --- | --- |
| `Figma/` | Raw Figma export. Replace with a new export to update. |
| `src/tokens/css/index.css` | All tokens (generated, don't edit) |
| `src/tokens/css/foundations/` | Raw colours (light + dark), typography, spacing, sizing, radius, borders, opacity, shadows |
| `src/tokens/css/semantic/colors.css` | Semantic colours (`--primary`, `--border`, …) |
| `src/tokens/css/components/` | One file per component (`button.css`, `input.css`, …) |
| `src/tokens/tokens.json` | Resolved values, used by the Storybook docs pages |
| `src/styles/base.css` | Hand-written: imports tokens, base element styles, `.heading-1` … `.monospaced` classes |

Dark mode: set `data-theme="dark"` on `<html>` or any element.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
