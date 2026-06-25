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
- `dist/compass-ui.css` — tokens, themes, reset
- `dist/index.css` — component CSS modules (injected at build; also available as `./component-styles`)

## Storybook

Storybook is the source of truth for component variants. Specimens in the docs site are thin wrappers for guideline prose.

```bash
npm run storybook --workspace=@mattermost/compass-ui
```
