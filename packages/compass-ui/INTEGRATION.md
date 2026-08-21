# Integrating `@mattermost/compass-ui`

Guide for consuming the Compass UI library in Vite apps (docs, prototypes catalog) and the Mattermost webapp (`webapp/channels`).

Mobile shells, `ChannelShell`, and Call* composites live in unpublished **`@mattermost/compass-proto`** (workspace package). Import those from `@mattermost/compass-proto`, not from `@mattermost/compass-ui`. Webapp product code should depend on `compass-ui` only.

## Install

### Published (target — after `@mattermost` npm org access)

```bash
npm install @mattermost/compass-ui @mattermost/compass-icons simplebar-react
```

Use the `alpha` dist-tag until stable:

```bash
npm install @mattermost/compass-ui@alpha
```

### Before npm publish

**Workspace (monorepo):**

```json
{
  "dependencies": {
    "@mattermost/compass-ui": "workspace:*"
  }
}
```

**Packed tarball (smoke test / local validation):**

```bash
npm run build --workspace=@mattermost/compass-ui
npm pack --workspace=@mattermost/compass-ui
npm install /path/to/mattermost-compass-ui-0.1.0-alpha.0.tgz
```

**File path (sibling repo):**

```json
"@mattermost/compass-ui": "file:../mattermost-compass-ui"
```

Run the automated smoke test from the playground repo root:

```bash
npm run smoke-test:ui
```

---

## Required setup (all consumers)

### 1. Import styles once at app entry

```tsx
// main.tsx or app entry
import '@mattermost/compass-ui/styles';
import '@mattermost/compass-ui/component-styles';
```

| Export | Contents |
|--------|----------|
| `@mattermost/compass-ui/styles` | CSS variables (tokens), themes, reset |
| `@mattermost/compass-ui/component-styles` | Component CSS modules, SimpleBar base CSS |

Components assume CSS variables are present — they do not import tokens directly.

### 2. Set a theme

```html
<html data-theme="denim">
```

Supported themes: `denim`, `sapphire`, `quartz`, `indigo`, `onyx`.

In React apps, toggle via `document.documentElement.setAttribute('data-theme', theme)` or your existing theme context.

### 3. Load fonts (recommended)

Compass typography expects Metropolis (headings) and Open Sans (body):

```bash
npm install @fontsource/metropolis @fontsource/open-sans
```

```tsx
import '@fontsource/metropolis/400.css';
import '@fontsource/metropolis/600.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
```

Fonts are not bundled in the library — consumers load them (same pattern as the playground).

### 4. Import components

```tsx
import { Button, Icon, ChannelShell } from '@mattermost/compass-ui';
```

---

## Peer dependencies

| Package | Required | Notes |
|---------|----------|-------|
| `react` | Yes | `^18.2.0` for webapp parity; `^19.0.0` works in Vite consumers |
| `react-dom` | Yes | Same range as React |
| `@mattermost/compass-icons` | Yes | Icon glyphs for `Icon`, `IconButton`, etc. |
| `simplebar-react` | Yes* | Required for `Scrollbars`; listed optional in peer meta but needed if you use scroll regions |

Ensure a single React version in the app — no duplicate React trees when linking locally.

---

## Vite consumer (docs, prototypes catalog)

Minimal `main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@mattermost/compass-ui';
import '@mattermost/compass-ui/styles';
import '@mattermost/compass-ui/component-styles';
import './app.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Button emphasis="Primary">Hello</Button>
  </StrictMode>,
);
```

**Monorepo dev:** run `npm run build:ui` (or `predev`) before `npm run dev` when consuming the built `dist/` from the workspace package.

**Do not** alias `@mattermost/compass-ui` to package source in the consumer Vite config — the monolith `@/` alias conflicts with internal package imports. Consume `dist/` via workspace or tarball.

---

## Mattermost webapp (`webapp/channels`)

### Local fast iteration (before npm publish)

Use a **testing branch** only — `file:` must not land in a mergeable PR. Switch to `@mattermost/compass-ui@alpha` after publish.

**Terminal 1 — package watch** (rebuilds `packages/compass-ui/dist/` on save):

```bash
cd mattermost-proto-playground
npm install
npm run dev --workspace=@mattermost/compass-ui
```

**Terminal 2 — wire into webapp** in `webapp/channels/package.json` (adjust relative path to your checkout layout):

```json
"@mattermost/compass-ui": "file:../../../mattermost-proto-playground/packages/compass-ui"
```

From the webapp monorepo root (`mattermost/webapp`):

```bash
npm install
npm run dev-server
```

**App entry** (`channels/src/entry.tsx`) — import styles once next to other global CSS:

```tsx
import '@mattermost/compass-ui/styles';
import '@mattermost/compass-ui/component-styles';
```

Use components as usual:

```tsx
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import { Select, Icon, Button } from '@mattermost/compass-ui';

<Select label="Team" leadingIcon={<Icon glyph={<AccountMultipleOutlineIcon />} />} onChange={…}>
  <option value="a">Alpha</option>
  <option value="b">Bravo</option>
</Select>
```

Webapp already applies theme CSS variables; Compass tokens reuse the same names. If colors look flat/gray outside the webapp shell, set `data-theme="denim"` on `<html>`.

#### Duplicate React (required for `file:` links)

`file:` symlinks the package directory. Webpack can resolve `react` from the linked tree and create a second React copy → Invalid Hook Call or hooks that silently no-op.

1. In the playground, confirm React is not nested under the package:

```bash
ls packages/compass-ui/node_modules/react 2>/dev/null
# should be empty (workspace hoisting)
```

2. In `webapp/channels/webpack.config.js`, alias to the webapp’s React (same pattern as `styled-components`):

```js
resolve: {
  alias: {
    react: path.resolve(__dirname, '..', 'node_modules', 'react'),
    'react-dom': path.resolve(__dirname, '..', 'node_modules', 'react-dom'),
  },
}
```

3. Exclude the linked package from babel (the `file:` realpath sits outside `node_modules`):

```js
const STANDARD_EXCLUDE = [
  /node_modules/,
  /mattermost-proto-playground[\\/]packages[\\/]compass-ui/,
];
```

`compass-ui`’s dist ESM appends `.js` on icon imports and unwraps CJS `default` exports (`mod?.default ?? mod`) so webpack 5 does not treat icon components as `{ default: fn }` objects.

#### HMR

Vite rebuilds `dist/` on save; webpack ignores most of `node_modules` for watching, so expect a **manual browser refresh**. If that becomes painful, exclude the linked package from webpack `snapshot.managedPaths`.

#### Smoke panel (optional)

On the local testing branch, a floating smoke panel is **shown by default** (ported to `document.body`).

Hide:

```js
localStorage.setItem('compass_ui_smoke', '0');
location.reload();
```

Show again:

```js
localStorage.removeItem('compass_ui_smoke');
location.reload();
```

Remove the smoke component before any mergeable PR.

### Published install (mergeable PRs)

After `@mattermost` npm org publish, use the `alpha` tag until stable:

```json
"@mattermost/compass-ui": "0.1.0-alpha.0"
```

```bash
npm install @mattermost/compass-ui@alpha
```

### Import pattern

```tsx
import { Button } from '@mattermost/compass-ui';
import '@mattermost/compass-ui/styles';
import '@mattermost/compass-ui/component-styles';
```

Load styles once at the app bootstrap (same entry that loads global webapp SCSS).

### Webpack checklist

- [ ] ESM + CJS: package ships both (`module` / `main` fields).
- [ ] CSS: `@mattermost/compass-ui/styles` and `/component-styles` resolve without extra loaders beyond existing CSS pipeline.
- [ ] CSS modules: hashed class names from `component-styles` match rendered components.
- [ ] No duplicate React — webpack aliases when using `file:`; one version across workspaces.
- [ ] `@mattermost/compass-icons` already external in webapp; keep as peer, do not bundle twice. Dist ESM imports use `.js` extensions for webpack fullySpecified.
- [ ] `simplebar-react` installed if using `Scrollbars` or layout specimens that include scroll regions.
- [ ] Source maps enabled for debugging (`dist/*.map` shipped).

### Migration strategy

**Leaf-first** — do not big-bang replace `@mattermost/compass-components`.

1. Add `@mattermost/compass-ui` alongside legacy package.
2. New code uses compass-ui.
3. Replace compass-components usages file-by-file (Button, Text equivalents, etc.).
4. Storybook is the variant reference — link from internal docs.

### Theme alignment

Mattermost webapp already sets theme CSS variables (`--center-channel-bg`, `--button-bg`, `--error-text`, `--online-indicator`, etc.) and fixed semantic RGB (`--semantic-color-info|success|warning|danger`).

Compass uses the **same semantic names** as webapp:

- **`webapp-compat.scss` `@layer`**: standalone defaults for `--semantic-color-*` (mapped to Compass palette RGB) and `--neutral-*`. Host unlayered values always win when embedded.
- **`tokens.scss`**: `--color-info|success|warning|danger` wrap `rgb(var(--semantic-color-*))` for authoring.
- **Components**: error / destructive UI uses `var(--error-text, var(--color-danger))`. Presence uses `--online-indicator` / `--away-indicator` / `--dnd-indicator`. Toasts / global banners use `--color-*` (fixed semantics).

Confirm host vars match Compass theme role names before wide rollout. Spike with `Button` destructive / `SectionNotice` danger / `Toast` first.

---

## Pattern components and fixtures

Tier 3 patterns (`ChannelShell`, `ThreadListItem`, `RightSidebarThread`, etc.) do **not** ship demo avatar images. Pass fixtures from your app:

```tsx
import {
  ChannelShell,
  buildDefaultChannelsSidebarModel,
  RightSidebarThread,
} from '@mattermost/compass-ui';

const model = buildDefaultChannelsSidebarModel({
  avatarAikoTan: aikoSrc,
  avatarArjunPatel: arjunSrc,
  // ...
});

<ChannelShell channelsSidebarModel={model} userAvatarSrc={leonardSrc} />
```

See `src/fixtures/rightSidebarThreadDemo.tsx` in the playground for a docs-side example.

---

## Package contents (what npm ships)

Only `dist/` is published (`files: ["dist"]`):

```
dist/index.js          # ESM bundle
dist/index.cjs         # CJS bundle
dist/index.d.ts        # Type declarations
dist/index.css         # component-styles
dist/compass-ui.css    # styles (tokens/themes)
dist/components/       # per-component .d.ts
```

Storybook, `src/`, and `*.stories.tsx` are **not** in the tarball.

---

## Versioning and releases

| Channel | Version example | npm tag |
|---------|-----------------|---------|
| Alpha | `0.1.0-alpha.0` | `alpha` |
| Beta | `0.1.0-beta.0` | `beta` |
| Stable | `0.1.0` | `latest` |

Git tag format (Mattermost platform convention): `@mattermost/compass-ui@0.1.0-alpha.0`

Publish commands (requires `@mattermost` npm org write access):

```bash
npm run build --workspace=@mattermost/compass-ui
npm publish --access=public --tag alpha --workspace=@mattermost/compass-ui
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Failed to resolve @mattermost/compass-ui/styles` | Run `npm run build:ui` — `dist/compass-ui.css` must exist |
| Unstyled components (flat gray UI) | Import both `/styles` and `/component-styles` at app entry |
| Scrollbars missing thumb/track | Ensure `simplebar-react` is installed; `component-styles` includes SimpleBar CSS |
| `@/components/Icon` errors in dev | Do not alias package to source; use built `dist/` |
| Wrong colors | Set `data-theme` on `<html>` |
| Workspace link missing | Run `npm install` from repo root, not inside `packages/compass-ui` |

---

## Related docs

- [README.md](./README.md) — quick start
- [CHANGELOG.md](./CHANGELOG.md) — release history
- [Storybook](./README.md#storybook) — component variant catalog (`npm run storybook`)
- [UI Library Extraction Plan](../../docs/UI-LIBRARY-EXTRACTION-PLAN.md) — full repo split architecture
