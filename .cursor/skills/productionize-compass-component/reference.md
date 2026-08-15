# Productionize Compass — reference

## Host vs library

| Lives in Compass | Stays in the Mattermost host |
| --- | --- |
| Visual chrome, hashed CSS, Figma props | `ThemeProvider` / `applyTheme` / `css-vars-ponyfill` |
| `forwardRef`, dual-stamp | Redux, Client4, routing, `trackEvent` |
| Optional later: `CompassProvider` for emoji URL hooks | `SharedProvider` bindings, `window.WebappUtils` |
| Stamp `a11y__modal` / `a11y__popup` when converting overlays | `A11yController`, `useFocusTrap`, stacked modals |

`@mattermost/shared` today: Button, WithTooltip, Emoji, ShortcutKey, SharedProvider, i18n helper, user-agent, plugin types. Compass replaces the **UI** pieces over time; `@shared` keeps non-UI leftovers.

## Button (done)

Paths:

- `packages/compass-ui/src/components/Button/Button.tsx`
- `packages/compass-ui/src/components/Button/buttonClasses.ts`
- `packages/compass-ui/src/components/Button/Button.module.scss`

Dual-stamp (mirrors `webapp/platform/shared/.../button_classes.ts`):

| Compass props | Legacy classes |
| --- | --- |
| always | `btn` |
| `emphasis="Primary"` | `btn-primary` |
| `emphasis="Secondary"` | `btn-secondary` |
| `emphasis="Tertiary"` | `btn-tertiary` |
| `emphasis="Quaternary"` | `btn-quaternary` |
| `size="X-Small"` | `btn-xs` |
| `size="Small"` | `btn-sm` |
| `size="Medium"` | *(none — shared `md` is empty)* |
| `size="Large"` | `btn-lg` |
| `destructive` | `btn-danger` |
| `appearance="Inverted"` | `btn-inverted` |
| **Primary + destructive** | drop `btn-primary` so `btn-danger` wins |

Prop adapter when swapping a shared Button call site:

- `emphasis="primary"` → `"Primary"`
- `size="md"` → `"Medium"` (omit; default)
- `variant="destructive"` → `destructive`
- `variant="inverted"` → `appearance="Inverted"`
- icons as children → `leadingIcon` / `trailingIcon` when converting (shared stuffed icons in `children`)

## Tokens

Host `applyTheme()` already writes the semantic colors Button uses: `--button-bg`, `--button-color`, `--error-text`, `--link-color`, `--center-channel-bg`, `--center-channel-color`, `--sidebar-bg`, `--sidebar-text`. Use those names directly.

`--color-danger` / `--color-neutral-1100` are Compass-only — do not use them.

Prefer `color-mix` on the hex var. Mattermost’s RGB twin for error is `--error-text-color-rgb`, not `--error-text-rgb`.

Layout tokens (`--spacing-*`, `--font-size-*`, `--duration-quick`, …) are not theme vars. Playground `/styles` sets them. Do not clobber `--radius-full` (Mattermost `50%` vs Compass `9999px`) or `--elevation-*`.

## Next primitives (suggested order)

1. **Switch** / **Radio** / **Checkbox** — native inputs, no overlay. Dual-stamp only if a stable host class exists (often none; skip dual-stamp rather than inventing `.btn`-style names).
2. **IconButton** — same Button contract; check host `.btn.btn-icon` if dual-stamping.
3. **Tag** / **UnreadBadge** / **Spinner** — no ref-to-button requirement beyond the native root.
4. **Tooltip** — restyle `WithTooltip` inner chrome; do not replace Floating UI / portal.
5. **Modal** — inner chrome for `GenericModal`; do not replace bootstrap + focus trap.

## Webapp spike

Only when the user asks. **Do not `npm link`** (React 18 webapp vs Compass React 19 devDep → duplicate React / broken hooks). Consume `dist/`, never source (`@/` + CSS modules).

```bash
cd packages/compass-ui && npm run build && npm pack

cd <mattermost>/webapp
npm install <path>/mattermost-compass-ui-0.1.0-alpha.0.tgz --workspace=channels
```

Then:

1. `import '@mattermost/compass-ui/component-styles'` in `webapp/channels/src/entry.tsx`. **Never** import `/styles` in channels.
2. Swap **one** call site. Prefer a leaf that already uses `@mattermost/shared/components/button` with `FormattedMessage` children and a `ref` (e.g. delete-post modal).
3. Add `@mattermost/compass-ui` to Jest `transformIgnorePatterns` if tests import it.
4. Restart webpack. Do not commit the spike unless asked.

`file:` to the package directory is for iteration only — alias webpack `react` / `react-dom` to the webapp copies (same pattern as `styled-components`). Prefer pack for a one-shot try.

Barrel import pulls the whole library (one JS + one CSS blob). Acceptable for a spike; production needs subpath exports later.

## Playground

`src/main.tsx` and Storybook still import `/styles` + `component-styles`. Extra dual-stamp classes are inert (no Bootstrap `.btn` CSS). After changing Compass, rebuild `dist` or use Storybook (compiles source). `predev` rebuilds UI for the Vite app.
