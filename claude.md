# Project instructions for AI

## Design system: Foundations, Components, Patterns, and Layouts

The design system is organized in four layers, from the most basic style guidance to full screens.

### Foundations

Foundations are the most basic building blocks of the system. They include guidance on things like color, typography, or iconography, and can also include other aspects of interface design like layout or animation.

Think of foundations as a base layer of style definition for the system.

### Components

Components are reusable building blocks that make up the core elements of the interface. Components leverage the foundations. Each component meets a specific need and has been created to establish patterns and intuitive user experiences.

Some components may be a combination of other components.

Examples of components include buttons, tags, tooltips, or messages.

### Patterns

Patterns are typically larger building blocks made up of multiple components. Grouping multiple components together allows for more complex interface elements that solve common problems. Patterns can also be reusable blocks but are often used in one discrete place within the application.

Examples of patterns include the Channel Sidebar, Channel Header, and Right Sidebar.

### Layouts

Layouts are screens made up of multiple patterns and/or components. A layout is a demonstration of all the parts of the design system at work together on one screen.

## SCSS component styles: BEM + nesting

When writing or editing `*.module.scss` component styles, use a **single block as the root** and nest elements and modifiers under it. This keeps each component’s styles in one hierarchy and matches BEM.

### Structure

1. **One root block** — e.g. `.button`, `.avatar`. No other top-level selectors for that component.
2. **Elements** — Nest with `&__element` under the block (e.g. `&__label`, `&__icon-slot`).
3. **Modifiers** — Nest with `&--modifier` under the block (e.g. `&--size-small`, `&--emphasis-primary`).
4. **Modifier-specific element overrides** — Inside a modifier, target the element with the full class (e.g. `.button__label`) so the selector stays correct: modifier on block, styling the element.

### Compound modifiers (two classes on the same element)

Sass only allows `&` at the **start** of a compound selector. For combinations like `.button--destructive.button--emphasis-primary`, use **interpolation**:

```scss
#{&}--destructive#{&}--emphasis-primary {
  // ...
}
```

Do **not** write `&--destructive&--emphasis-primary` — it will trigger a Sass error.

### Example (excerpt)

```scss
.button {
  display: inline-flex;
  // ...

  &__label { line-height: 1; }
  &__icon-slot { display: inline-flex; /* ... */ }

  &--size-small {
    padding: var(--spacing-xxs) var(--spacing-l);
    .button__label {
      font-size: var(--font-size-75);
    }
  }

  &--emphasis-primary { /* ... */ }
  #{&}--destructive#{&}--emphasis-primary { /* ... */ }
}
```

Keyframes and other global at-rules can stay at the top of the file; the rest of the component lives under the single block.

## Button emphasis: use Primary sparingly

`emphasis="Primary"` should appear **at most once per view** — it draws the eye and loses meaning if overused. Use `Secondary`, `Tertiary`, or `Link` for supporting actions. Only reach for `Primary` when one action clearly outranks all others on screen.

## EmptyState: default button size is Medium

When adding an `action` to `EmptyState`, omit the `size` prop unless a Figma spec requires a different size. `Button` defaults to `Medium`, which is the correct size for empty state actions.

## Routing new additions: Patterns page vs Components page

This routing aligns with **Design system: Foundations, Components, Patterns, and Layouts** (above). When adding a new component to the playground, check the Figma file name:

- File name contains **"Patterns"** → add to `src/pages/Patterns/Patterns.tsx`
- File name contains **"Component"** → add to `src/pages/Components/Components.tsx`

## Building new components: reuse existing components first

When building a new component, audit the elements it needs before writing any new code. If an existing component in `src/components/` already covers an element — especially when its name matches what Figma uses — use it directly rather than reimplementing it. Only build a new sub-component when nothing suitable exists.

## Shared React hooks

If these hooks exist in `src/hooks/`, use them instead of duplicating logic. (They may be introduced on a long-lived feature branch and cherry-picked to `main` later.)


| Hook               | File                  | Use when                                                                                                                                                                   |
| ------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useExitAnimation` | `useExitAnimation.ts` | A panel or overlay should stay mounted for `durationMs` after `open` becomes false so CSS exit animation can run. Returns `{ rendered, exiting }`.                         |
| `useOutsideClose`  | `useOutsideClose.ts`  | A dropdown or custom menu is `open` and should close on `mousedown` outside a container `ref` (e.g. split button + menu). Pass `open` so listeners attach only while open. |


**Profile popover + positioning:** `ProfilePopover` is the **content** card. Figma-anchored placement (e.g. from a message avatar `getBoundingClientRect()`) is a **separate concern**. Do not fork `ProfilePopover` for coordinates — either compose it inside a small page-local wrapper (e.g. `PositionedProfilePopover` in a prototype) or, if multiple prototypes need the same rules, add a **layout hook** such as `useAnchoredToRect` and keep `ProfilePopover` unchanged. Merge positioning into the design system only after UX parity with the popover animation spec in this file.

**Note:** The **Outbound Calls** prototype (MM-56584) is maintained on a **feature branch only** — it is not planned for the `main` playground.

## Animation: easing and duration

Always use the animation tokens from `tokens.scss` — never hard-code durations or easing keywords directly.


| Scenario                                  | Easing token        | Duration token        |
| ----------------------------------------- | ------------------- | --------------------- |
| Element already on screen, small movement | `--ease-transition` | `--duration-quick`    |
| Element already on screen, large movement | `--ease-transition` | `--duration-moderate` |
| Entrance (element entering the screen)    | `--ease-entrance`   | `--duration-quick`    |
| Exit (element leaving the screen)         | `--ease-exit`       | `--duration-quick`    |


**"Large movement"** means the element travels a significant distance across the viewport — e.g. a panel sliding in from off-screen. A button hover shift or a toolbar expanding a fixed height are small movements.

```scss
// Small on-screen transition (e.g. hover state, short expand)
transition: opacity var(--duration-quick) var(--ease-transition);

// Large on-screen transition (e.g. panel sliding across the view)
transition: transform var(--duration-moderate) var(--ease-transition);

// Entrance
transition: opacity var(--duration-quick) var(--ease-entrance);

// Exit
transition: opacity var(--duration-quick) var(--ease-exit);
```

## Semantic color tokens

For info/success/warning/danger states, always use the semantic tokens from `tokens.scss` — never raw palette tokens (e.g. `--color-blue-400`) or Mattermost theme vars (e.g. `--error-text`, `--away-indicator`).


| Semantic token    | RGB counterpart       | Value                |
| ----------------- | --------------------- | -------------------- |
| `--color-info`    | `--color-info-rgb`    | `--color-blue-400`   |
| `--color-success` | `--color-success-rgb` | `--color-green-500`  |
| `--color-warning` | `--color-warning-rgb` | `--color-yellow-600` |
| `--color-danger`  | `--color-danger-rgb`  | `--color-red-500`    |


Use the `-rgb` counterpart when you need `rgba()`:

```scss
color: var(--color-danger);
background-color: rgba(var(--color-warning-rgb), 0.04);
border-color: rgba(var(--color-warning-rgb), 0.16);
```

## Figma color variables with opacity suffix

When a Figma color variable has a suffix (e.g. `center-channel-color-8`, `sidebar-text-24`, `button-bg-16`, `color-danger-12`), the suffix encodes an opacity percentage. Do **not** look for a suffixed CSS token — it doesn't exist. Instead, use the root token's `-rgb` counterpart inside `rgba()`, with the suffix converted to a decimal alpha (divide by 100).


| Figma variable           | CSS                                           |
| ------------------------ | --------------------------------------------- |
| `center-channel-color/8` | `rgba(var(--center-channel-color-rgb), 0.08)` |
| `sidebar-text/24`        | `rgba(var(--sidebar-text-rgb), 0.24)`         |
| `button-bg/16`           | `rgba(var(--button-bg-rgb), 0.16)`            |
| `color-danger/12`        | `rgba(var(--color-danger-rgb), 0.12)`         |


## Iconography: phone icon is always filled

For any phone/call action, use the filled compass icon `@mattermost/compass-icons/components/phone`. Never use `phone-outline`, even when another design system reference shows the outline variant.

## Typography: prefer semibold over bold

Use `var(--font-weight-semibold)` (600) wherever bold emphasis is needed. Do **not** use `var(--font-weight-bold)` (700) or `font-weight: bold` / `font-weight: 700` unless explicitly required by a Figma spec that specifies 700.

## Animation: popover panel open/close

Popover panels (menus, info popovers, dropdowns) animate on mount/unmount with a combined scale + fade:


| Phase   | Scale          | Opacity   | Duration           | Easing                      |
| ------- | -------------- | --------- | ------------------ | --------------------------- |
| Opening | `90%` → `100%` | `0` → `1` | `--duration-quick` | `--ease-entrance` (easeOut) |
| Closing | `100%` → `90%` | `1` → `0` | `--duration-quick` | `--ease-exit` (easeIn)      |


Set `transform-origin` so the scale grows from the anchor direction (e.g. `transform-origin: top left` for a popover that opens below-and-right of its trigger).

## Scrollbars: minimal style for scrolling content

Any element with `overflow: auto`, `overflow: scroll`, `overflow-y: auto|scroll`, or `overflow-x: auto|scroll` must use the minimal scrollbar treatment — thin track, subtle translucent thumb, transparent track, darker on hover. Never ship the browser-default chunky scrollbar on content regions.

```scss
scrollbar-width: thin;
scrollbar-color: rgba(var(--center-channel-color-rgb), 0.24) transparent;

&::-webkit-scrollbar {
  width: 8px;   // use `height: 8px` for horizontal scrollers
}
&::-webkit-scrollbar-track {
  background: transparent;
}
&::-webkit-scrollbar-thumb {
  background-color: rgba(var(--center-channel-color-rgb), 0.24);
  border-radius: 3px;
  border: 2px solid transparent;
  background-clip: content-box;
  transition: background-color var(--duration-quick) var(--ease-transition);
}
&::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--center-channel-color-rgb), 0.4);
}
```

Reference implementation: the `__messages` block in `src/pages/Layouts/Layouts.module.scss`. If this starts to recur in more places, extract a `@mixin minimal-scrollbar` into `src/styles/mixins.scss`.