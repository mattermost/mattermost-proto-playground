# @mattermost/compass-ui

Compass design system UI components for Mattermost products.

## Install

```bash
npm install @mattermost/compass-ui
```

Peer dependencies: `react`, `react-dom`, `@mattermost/compass-icons`, and optionally `simplebar-react`.

## Usage

Import styles once at your app entry:

```tsx
import '@mattermost/compass-ui/styles';
import '@mattermost/compass-ui/component-styles';
```

Standalone hosts (Storybook, playground) also need document chrome:

```tsx
import '@mattermost/compass-ui/styles/standalone';
```

Do not load `/styles/standalone` into Mattermost webapp.

Set a theme on `<html>`:

```html
<html data-theme="denim">
```

Import components:

```tsx
import { Button } from '@mattermost/compass-ui';
```

## Development

From the monorepo root:

```bash
npm run build:ui      # build the library
npm run storybook     # component catalog on :6006
```

## Package layout

- `dist/index.js` / `dist/index.cjs` — component bundle (ESM + CJS)
- `dist/compass-ui.css` — tokens, themes, and webapp-compat defaults (`./styles`)
- `dist/compass-ui-standalone.css` — CSS reset + `body` / heading chrome for standalone hosts (`./styles/standalone`)
- `dist/index.css` — component CSS modules (injected at build; also available as `./component-styles`)

## Storybook

Storybook is the source of truth for component variants. Specimens in the docs site are thin wrappers for guideline prose.

```bash
npm run storybook --workspace=@mattermost/compass-ui
```

### Authoring stories

- Mirror the guidelines sidebar hierarchy in story `title`s: `Components/{section}/{name}` and `Foundations/Style/{name}` for foundation specimens. Keep `src/storybook/titles.ts` aligned with `src/manifests/sections.ts`; use matching string literals in `meta.title`.
- Foundation stories in `src/foundations/style/` import named `*Content` exports from guideline specimens, use `tags: ['autodocs']` with inline `meta.title`, and rely on the shared `FoundationLayout` decorator in `.storybook/preview.tsx`. Prose guidelines stay on the docs site.
- Keep story-only labels, headings, and wrapper backgrounds theme-aware. Use `var(--center-channel-color)` for text labels and `var(--center-channel-bg)` for preview surfaces.
- Use `var(--sidebar-header-bg)` for inverted story surfaces, and `var(--sidebar-text)` for labels inside those surfaces.
- Use `rgba(var(--center-channel-color-rgb), <alpha>)` only when a secondary text or border treatment intentionally needs opacity.
- Avoid neutral-only text tokens such as `--color-neutral-*` or `--color-text-secondary` in stories unless the component API specifically demonstrates a neutral palette token.
- Native `h1`-`h6` elements and story body text inherit Compass fonts via `@mattermost/compass-ui/styles/standalone` (loaded in `.storybook/preview.tsx`). Do not hardcode font families in stories.
- Storybook Docs tab chrome and Docs controls are themed in `.storybook/docs-theme.css`; keep Docs-specific overrides there so they follow the selected Compass theme.

## Integration and releases

- [INTEGRATION.md](./INTEGRATION.md) — Vite + webapp consumer setup
- [CHANGELOG.md](./CHANGELOG.md) — release history

Validate a publishable tarball from the monorepo root:

```bash
npm run smoke-test:ui
```
