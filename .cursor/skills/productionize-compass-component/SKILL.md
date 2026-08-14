---
name: productionize-compass-component
description: Productionize a Compass UI component (or author a new one) so it matches the Mattermost @mattermost/shared production contract — host CSS variables, forwardRef, native attr passthrough, dual-stamp legacy classes, no Compass /styles reset. Use when converting Compass primitives for webapp integration, replacing @mattermost/shared UI, or making @mattermost/compass-ui plugin-safe.
---

# Productionize a Compass component

Work in `packages/compass-ui` only unless the user asks to spike the Mattermost webapp. Compass stays a **separate package** that will replace the UI bits of `@mattermost/shared`. Do not fold components into `@shared`.

Reference implementation: `packages/compass-ui/src/components/Button/`. Details in [reference.md](reference.md).

## Architecture (do not reopen)

- Compass is **not** the theme engine. Do not call `applyTheme`, touch Redux, or add a ThemeProvider / CompassProvider unless the primitive needs host-injected data (emoji URLs).
- Consume host semantic CSS variables (`--button-bg`, `--button-color`, `--error-text`, `--link-color`, `--center-channel-color` / `-rgb`, `--sidebar-*`). A Mattermost page that already ran `applyTheme()` must theme the component with no wrapper.
- Do **not** import `@mattermost/compass-ui/styles` as a requirement (reset + `:root` / `data-theme` overlays fight Bootstrap and `applyTheme()`). Ship hashed `component-styles` plus per-property fallbacks.
- Hover / destructive / disabled / focus: semantic theme vars only — never foundation palette (`--color-neutral-1100`, `--color-danger`, `--color-red-*`).
- `react-intl` is a **host** peer. Labels are `children: ReactNode` (or other `ReactNode` slots) so `<FormattedMessage>` works under the webapp `IntlProvider`. No hardcoded English copy (`"Close"`, `"Remove"`).
- Keep the Figma API (PascalCase: `emphasis="Primary"`, `size="Medium"`). Do not switch to shared’s lowercase props.
- Playground must keep working: it still loads `/styles`. Hashed classes style the control; if theme vars are unset, Denim hex / spacing fallbacks apply **on the component**, never by writing semantic colors onto `:root`.

## Chrome vs behavior

| Kind | Compass today | Production |
| --- | --- | --- |
| Presentational primitive (Button, Checkbox, Radio, Switch, Tag) | Visual chrome | Productionize in place |
| Overlay chrome (Tooltip, Modal) | Static box, no portal/focus | Keep as chrome. Do **not** replace `WithTooltip` / `GenericModal` behavior. Host owns portal, focus trap, `a11y__modal`. |
| Host-bound (Emoji, Avatar src) | Unicode / passed `src` | Inject via host later (`SharedProvider` pattern). Do not import Client4 or Redux. |

## Component contract

Apply all of these to any DOM-hosting primitive:

1. `forwardRef` to the native element (`HTMLButtonElement`, `HTMLInputElement`, …).
2. `displayName` matching the export (`'Button'`).
3. Extend the native HTML attribute type. Passthrough `className`, `id`, `data-testid`, `aria-*`, `disabled`, `type`, `onClick`, etc. Spread `{...rest}` **before** explicit `ref` / `className` / `type` / `disabled` so those win (React 19 may pass `ref` in rest).
4. Dual-stamp **stable host classes** in addition to hashed Compass modules, when the host already has a public CSS API (plugins, `.modal-footer .btn + .btn`). Look up the mapping from `@mattermost/shared` (e.g. `webapp/platform/shared/src/components/button/button_classes.ts`) including documented quirks.
5. Keep hashed Compass classes as the visual source of truth.

Named + default export so `import {Button} from '@mattermost/compass-ui'` works. Do not change unrelated primitives in the same pass.

## CSS / tokens

- BEM + CSS modules; styling rule still applies (`packages/compass-ui` + `.cursor/rules/styling.mdc`).
- Prefer `color-mix(in srgb, var(--semantic) …)` over `rgba(var(--foo-rgb), α)` so Mattermost’s `--error-text` (hex) works without `--error-text-rgb` vs `--error-text-color-rgb` mismatch.
- Local `--_*` custom properties on the **block** for theme fallbacks (e.g. `--_button-bg: var(--button-bg, #1c58d9)`). Never assign `--button-bg` / `--center-channel-color` on `:root`.
- Spacing / type / motion: `var(--spacing-s, 10px)` (and similar) so the control lays out if the host has no Compass layout tokens. Do **not** redefine `--radius-s` / `--elevation-*` / `--radius-full` on `:root` (name collisions with Mattermost).
- Do not add a tokens-only `:root` sheet in the same PR unless the user asks.

## New vs convert

**Convert:** change the existing folder in `packages/compass-ui/src/components/<Name>/`. Preserve Storybook stories and Figma props. Update `INTEGRATION.md` + `CHANGELOG.md` `[Unreleased]`.

**New:** same contract from day one. Do not ship a prototype-only primitive if the intent is webapp consumption.

Skip for a first pass: ChannelShell / sidebars / product patterns, anything that needs a portal+focus trap to be *correct*, string-only title props (fix those to `ReactNode` if you do convert them).

## Checklist

```
- [ ] Figma API unchanged (PascalCase props)
- [ ] forwardRef + displayName
- [ ] Native attr passthrough; rest before ref/className
- [ ] children / slots are ReactNode; no hardcoded English
- [ ] Semantic theme vars only; no foundation palette in themed chrome
- [ ] Component-scoped fallbacks; no :root semantic color writes
- [ ] Dual-stamp host classes if a shared mapping exists
- [ ] /styles not required; playground still works with /styles loaded
- [ ] INTEGRATION.md notes the exception; CHANGELOG Unreleased updated
- [ ] Typecheck: npm run typecheck in packages/compass-ui
```

Webapp spike (optional, only if asked): [reference.md](reference.md#webapp-spike).
