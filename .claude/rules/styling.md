---
paths:
  - "**/*.module.scss"
  - "**/tokens.scss"
  - "src/styles/**/*.scss"
---

# Styling

Apply when editing styles (especially `*.module.scss`). Prefer tokens from `src/styles/tokens.scss` and theme vars (`--center-channel-color`, `--center-channel-bg`, `--button-bg`, etc.).

**Cursor twin:** keep [.cursor/rules/styling.mdc](../../.cursor/rules/styling.mdc) in sync with this file.

## SCSS: BEM + nesting

One root block per component module; nest elements and modifiers under it.

1. **One root block** — e.g. `.button`. No other top-level selectors for that component.
2. **Elements** — `&__element` under the block.
3. **Modifiers** — `&--modifier` under the block.
4. **Modifier → element** — inside a modifier, target `.block__element` (full class).

Compound modifiers on one element — interpolate (Sass requires `&` at the start only):

```scss
#{&}--destructive#{&}--emphasis-primary { /* ... */ }
```

Do not write `&--destructive&--emphasis-primary`. Keyframes may stay at file top; the component lives under the single block.

```scss
.button {
  display: inline-flex;

  &__label { line-height: 1; }

  &--size-small {
    padding: var(--spacing-xxs) var(--spacing-l);
    .button__label {
      font-size: var(--font-size-75);
    }
  }
}
```

## Prefer design tokens over hardcoded values

| Concern | Tokens |
| --- | --- |
| Spacing | `--spacing-xxxxs` (2px) … `--spacing-xxxxxl` (48px) |
| Font size | `--font-size-25` (10px) … `--font-size-1000` (40px) |
| Font weight | `--font-weight-regular` / `--font-weight-semibold` (prefer semibold over bold/`700` unless Figma requires 700) |
| Line height | `--line-height-*` |
| Radius | `--radius-xs` … `--radius-xl`; pills → `--radius-full` |
| Shadow | `--elevation-1` … `--elevation-6` |
| Icon boxes | `--icon-size-10` … `--icon-size-104` |

```scss
// ❌ BAD
padding: 12px 16px;
gap: 8px;
font-size: 14px;
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.12);
color: #386fe5;
color: var(--center-channel-color, #3f4350);

// ✅ GOOD
padding: var(--spacing-m) var(--spacing-l);
gap: var(--spacing-xs);
font-size: var(--font-size-100);
border-radius: var(--radius-m);
box-shadow: var(--elevation-2);
color: var(--color-info);
```

- Prefer nearest token or `calc()` of tokens over raw `px`.
- Do not put tokenizable spacing/font in inline `style={{}}` — use a CSS module.
- **Exceptions:** `1px` hairlines; visually-hidden `1px`/`-1px`; one-off layout widths with no token; container/media breakpoints.
- Before finishing, scan new/edited styles for leftover raw `px`, hex, numeric `font-weight`, or hardcoded `ms`/`ease`.

## Animation: easing and duration

Never hard-code durations or easing keywords — use tokens:

| Scenario | Easing | Duration |
| --- | --- | --- |
| On-screen, small movement | `--ease-transition` | `--duration-quick` |
| On-screen, large movement | `--ease-transition` | `--duration-moderate` |
| Entrance | `--ease-entrance` | `--duration-quick` |
| Exit | `--ease-exit` | `--duration-quick` |

“Large movement” = significant travel across the viewport (e.g. panel from off-screen).

## Semantic colors

Info/success/warning/danger → `--color-info|success|warning|danger` (and `-rgb` for `rgba()`). Never raw palette (e.g. `--color-blue-400`) or legacy theme vars (`--error-text`, `--online-indicator`, `--away-indicator`) when a semantic token covers it.

| Token | RGB | Resolves to |
| --- | --- | --- |
| `--color-info` | `--color-info-rgb` | `--color-blue-400` |
| `--color-success` | `--color-success-rgb` | `--color-green-500` |
| `--color-warning` | `--color-warning-rgb` | `--color-yellow-600` |
| `--color-danger` | `--color-danger-rgb` | `--color-red-500` |

## Figma opacity suffixes

Figma `token/8` → `rgba(var(--token-rgb), 0.08)` (no suffixed CSS variable). Text color alpha clamp ≥ **0.72**; icon color clamp ≥ **0.56**. Backgrounds/borders/fills may use the mapped alpha as written.

## Opacity floors

Never style **text** below **72%** opacity or **icons** below **56%** (including `rgba`/`hsla` as `color`/`fill`, and `opacity` on text/icon elements). Lower alpha is fine for backgrounds, borders, fills, overlays. Entrance/exit may fade temporarily; resting UI must meet the floors.

## Iconography: phone

Phone/call actions: filled `@mattermost/compass-icons/components/phone` — never `phone-outline`.

## Typography: semibold over bold

Use `var(--font-weight-semibold)` (600) for emphasis. Do not use bold/`700` unless Figma explicitly specifies 700.

## Popover open/close

Menus/info popovers/dropdowns: scale 90%→100% + fade in on open (`--duration-quick` / `--ease-entrance`); reverse on close (`--ease-exit`). Set `transform-origin` toward the anchor.

## Expand/collapse

In-place expand/collapse must animate — never snap. Prefer CSS grid `0fr`↔`1fr` with `--duration-moderate` / `--ease-transition`. Keep content mounted; toggle `--expanded`; `aria-expanded` / `aria-hidden` as appropriate.

```scss
.collapse {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--duration-moderate) var(--ease-transition);

  &--expanded { grid-template-rows: 1fr; }
}

.collapse__inner {
  overflow: hidden;
  min-height: 0;
}
```

## Scrollbars

Scrolling regions in Compass UI components / guideline specimens: use `Scrollbars` from `src/components/ui/Scrollbars/` (not raw overflow). Parent needs `flex: 1; min-height: 0` in a flex column; pad a child inside `Scrollbars`, not the root. Dark surfaces: `color="--sidebar-text-rgb"`.

**Exception:** docs shell layout scrollers (`AppShell`, `DocsLayout`, `DocSidebar`, `OnThisPage`) keep native `overflow: auto` + `@include minimal-scrollbar` (sticky + flex chain).
