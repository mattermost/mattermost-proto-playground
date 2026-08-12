# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install deps
npm run dev          # Vite dev server (open URL it prints)
npm run build        # tsc -b && vite build (type-check is part of build)
npm run preview      # serve the production build locally
npm run lint         # eslint .
npm run format       # prettier --write .
npm run format:check # prettier --check (CI-style)
```

There is no test runner configured. Type-checking happens via `tsc -b` inside `npm run build` — there is no standalone `typecheck` script.

The Vite `base` is `/mattermost-proto-playground/` (see `vite.config.ts`). The dev server and GitHub Pages deploy both serve under that path; the `BrowserRouter` reads `import.meta.env.BASE_URL` so all routes are relative to it. Don't hard-code absolute `/foo` URLs.

Path alias: `@/` → `./src/` (configured in both `vite.config.ts` and `tsconfig.app.json`). Always import via `@/...`, never deep relatives.

CI: `.github/workflows/deploy.yml` runs `npm ci && npm run build` on push to `main` and publishes `dist/` to GitHub Pages (with `dist/index.html` copied to `dist/404.html` for SPA fallback).

## Architecture

This is a **design-system documentation site + prototype playground** for Mattermost UI work. It is a Vite + React 19 + TypeScript SPA. There is no backend.

### The Topic manifest is the spine

Every docs entry — foundation, component, pattern, or layout — is a **Topic** registered in `src/manifests/topics.ts`. A topic owns:

- `guidelinePage` (required) — a lazy import of `*.guideline.mdx` prose
- `specimenPage` (optional) — a lazy import of `*.specimen.tsx` live demo

`TopicRoute` (`src/pages/topics/TopicRoute.tsx`) renders both as Guidelines / Specimen tabs over the same URL `/<category>/<slug>`. Topics with no specimen hide the tab strip and render the guideline only.

Sidebar grouping is a separate concern: `src/manifests/sections.ts` defines `SectionGroup`s per category (Foundations: Overview / Style / Guidelines; Components: Actions / Banners / Forms and Input / etc.). Slugs not listed in a group fall through to "Other".

The Foundations index page uses a **curated bento layout** (`src/pages/topics/FoundationsBento/FoundationsBento.tsx`) with hero/medium/small slug arrays. New foundation topics not placed there get a plain-card fallback.

### Routing

`src/router/index.tsx` mounts everything under `AppShell` (which hides `TopNav` when running in an iframe — used for embedded previews):

- `/` → `Home`
- `/:category` → `CategoryRoute` (category landing)
- `/:category/:slug` → `TopicRoute` (Guidelines tab)
- `/:category/:slug/specimen` → `TopicRoute` (Specimen tab)
- `/prototypes` → `PrototypesIndex`; individual prototypes registered in the `PROTOTYPES` array in the same file
- `/resources` → `ResourcesIndex`

To add a new prototype flow, add a page under `src/pages/` and an entry to the `PROTOTYPES` array — it becomes both a sidebar nav item and a route. Also add the entry's `id` to `INITIATIVE_OF` in `src/manifests/prototypes.ts` so it groups under the right initiative on `/prototypes`; unmapped ids fall back to the "Other" initiative (a visible cue on the page to tag it). `PrototypeGroup` remains the broad category (card accent + "Recently Updated" tag); `Initiative` is the finer project axis that drives the accordion.

### Doc shell: prose vs. non-prose

All docs pages render inside `src/pages/_shell/DocShell.module.scss` (hero 1180px, body 960px — layout only). Prose typography lives in `DocPage.module.scss` under `.doc-page__prose`. Wrap MDX content in that class **only where bare HTML emitted by MDX needs styling** — TopicRoute does this for the Guidelines tab; CategoryRoute does it for category intros. Specimen tabs and category indexes do not wrap in prose.

`.doc-page__prose` selectors are all gated with `:not([class])`, so they only target bare HTML from MDX. Classed component elements (e.g. `Modal`'s `<h2 className="modal__title">`) are unaffected.

**Corollary for component authors:** never render a bare `<h2>`, `<p>`, `<li>`, etc. inside a component. Always attach a CSS-module className — otherwise the element will silently inherit prose typography when rendered on a prose page.

### Theming

`src/contexts/ThemeContext.tsx` exposes five themes (`denim`, `sapphire`, `quartz`, `indigo`, `onyx`), persisted to `localStorage` and applied as `data-theme` on `<html>`. Theme tokens are defined in `src/styles/themes.scss`; the base token set lives in `src/styles/tokens.scss`. Vite preprends `@use "@/styles/breakpoints"` and `@use "@/styles/mixins"` into every SCSS file — those identifiers are always available.

### MDX

MDX is plugged in via `@mdx-js/rollup` (pre-plugin in `vite.config.ts`) with `remark-gfm`, `rehype-slug`, and `rehype-autolink-headings` (wrap behavior, so headings become their own anchors). The MDX provider in `src/guidelines/_provider/MdxProvider.tsx` injects shared anchor styling. Reusable guideline-only React components (anatomy stages, sample grids, `<Num>` lists) live in `src/guidelines/_components/`.

### Folder map

- `src/components/ui/` — design-system components (one folder per component, with `<Name>.tsx`, `<Name>.module.scss`, `index.ts`)
- `src/components/layout/` — page chrome (`AppShell`, `TopNav`, `DocsLayout`, `DocSidebar`, `PageHero`, `OnThisPage`)
- `src/guidelines/<category>/<slug>/` — per-topic `*.guideline.mdx` + optional `*.specimen.tsx`
- `src/pages/_shell/` — `DocShell` (layout) and `DocPage` (prose) styles
- `src/pages/topics/` — `TopicRoute`, `CategoryRoute`, `FoundationsBento`
- `src/manifests/` — `topics.ts` and `sections.ts` (the only place a topic is registered for navigation)
- `src/hooks/` — shared hooks (see table below)
- `src/styles/` — `tokens.scss`, `themes.scss`, `mixins.scss`, `breakpoints.scss`, `global.scss`, `reset.scss`

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

`emphasis="Primary"` should appear **at most once per view** — it draws the eye and loses meaning if overused. Use `Secondary`, `Tertiary`, or `Quaternary` for supporting actions. Only reach for `Primary` when one action clearly outranks all others on screen.

## EmptyState: default button size is Medium

When adding an `action` to `EmptyState`, omit the `size` prop unless a Figma spec requires a different size. `Button` defaults to `Medium`, which is the correct size for empty state actions.

## Avatar components: default to fixture photos

Whenever you use an avatar component or pattern that supports a real image (`UserAvatar`, `TeamAvatar`, `UserAvatarGroup` / `UserAvatarGroupItem`, `CallParticipantAvatar`, props like `src` or `userAvatarSrc`, default data in list items, and similar), **pass an imported image from `src/assets/avatars/`** so demos and product-like UI show real faces.

Only rely on the **initials / fallback** avatar (omit `src` or equivalent) when the work explicitly calls for that state — for example documenting fallback behaviour, colour variants, or a spec that shows unnamed users.

## Adding a topic to the docs

Every docs entry — a foundation, component, pattern, or layout — is a single **topic** registered in `src/manifests/topics.ts`. A topic carries its prose (`guidelinePage`) and its live demo (`specimenPage`); the topic shell renders them as Guidelines / Specimen tabs over the same `/<category>/<slug>` URL.

To add a topic:

1. Pick the category from the four-layer model above (Foundations / Components / Patterns / Layouts) — that's the URL prefix.
2. Author an MDX guideline page under `src/guidelines/<category>/` (required — every topic has prose).
3. Author a `*.specimen.tsx` live demo under `src/guidelines/<category>/<slug>/` (optional — overview-style entries can omit it; the tab strip hides automatically).
4. Add a `Topic` entry to `TOPICS` in `topics.ts`. If the topic should appear in a specific sidebar group, list its slug under the right `topicSections[<category>]` group in `src/manifests/sections.ts`; otherwise it falls through to "Other".

The Foundations bento on `/foundations` is curated separately in `src/pages/topics/FoundationsBento/FoundationsBento.tsx` (slug arrays for hero/medium/small placement). New foundation topics that aren't placed there fall to the bento's plain-card fallback.

## Foundation specimen pages: token rows

Foundation **Specimen** tabs (`src/guidelines/foundations/*/*.specimen.tsx`) often list CSS custom properties in tables or rows. Shared styling for many of these lives under `.foundations` in `src/styles/library-demo/foundations.module.scss`.

When adding or editing token lists on specimen pages:

- **No duplicate label column** — If the token name is the copy-paste source of truth (e.g. `--spacing-xxxxs`, `--duration-quick`), do not add a separate short-name column (`xxxxs`, `Quick`) beside it. The token string is enough; a second column repeats the same idea and clutters the layout.
- **Token and value text must not look “disabled”** — Style token identifiers and primary values (`150ms`, `16px`, easing keywords) with `var(--font-size-75)` or another readable step, `var(--font-family-mono)` where appropriate, and **full** `var(--center-channel-color)`. Avoid tiny sizes (e.g. `10px`) and avoid low `opacity` on those cells — that reads as greyed-out UI instead of documentation.
- **Descriptions as secondary tier** — Supporting sentences can use `rgba(var(--center-channel-color-rgb), 0.72)` so they sit slightly behind the token/value without looking washed out.
- **Elevation** — Use `foundations__elevation-rows` / `foundations__elevation-row`: leading `<code>` token (em dash for level 0 where no variable exists), a small preview tile with the shadow applied, then the summary text. Row dividers match spacing and animation (`border-top` on the first row, `border-bottom` between rows).
- **Shape (radius)** — Use `foundations__shape-rows` / `foundations__shape-row`: token, resolved pixel value, then a preview box with `border-radius` from the token. Same row dividers as spacing and animation.

Keep new foundation token tables visually aligned with existing spacing, animation, and elevation specimen patterns unless a topic truly needs a different layout.

## Building new components: reuse existing components first

When building a new component, audit the elements it needs before writing any new code. If an existing component in `src/components/` already covers an element — especially when its name matches what Figma uses — use it directly rather than reimplementing it. Only build a new sub-component when nothing suitable exists.

## Doc shell: prose vs. non-prose

Every docs page (TopicRoute, CategoryRoute, PrototypesIndex, ResourcesIndex) renders inside the shared `DocShell` styles in `src/pages/_shell/DocShell.module.scss` — hero at 1180px, body at 960px. The shell itself is layout-only.

Prose typography lives in `src/pages/_shell/DocPage.module.scss` under the `.doc-page__prose` class. Wrap MDX content with that class wherever bare `<h2>`, `<p>`, `<code>`, etc. need styling — TopicRoute does this for the Guidelines tab; CategoryRoute does it for category intros. Specimen tabs and category indexes do **not** wrap in prose, so live components and curated lists keep their own styling.

`.doc-page__prose` rules are all gated with `:not([class])`, so they only target bare HTML emitted by MDX. Classed component elements (e.g. Modal's `<h2 className="modal__title">`) are unaffected when rendered inside a prose context.

**Doc UI embed:** live UI in guidelines or specimens must sit inside the **`compass-doc-embed`** island so `.doc-shell__body` type scale and prose bare-tag rules do not leak in. Use **`DocUiEmbed`** (`src/pages/_shell/DocUiEmbed/`), or **`AnatomyStage`** / **`Preview`** (they add `compass-doc-embed`). `TopicRoute` wraps specimen pages in `DocUiEmbed`. For ad hoc MDX blocks, use `<DocUiEmbed>…</DocUiEmbed>` (registered in `MdxProvider`). Isolation CSS lives in `DocPage.module.scss` next to `.doc-page__prose`.

**Corollary for component authors:** never render a bare `<h2>`, `<p>`, `<li>`, etc. inside a component. Always attach a CSS-module className — otherwise the element will silently inherit prose typography when the component is rendered on a prose page.

## Guideline MDX: use bold sparingly

Do not sprinkle bold through guideline prose for emphasis. Dense bold looks noisy and hides what actually matters.

- Anatomy lists: bold only the short label before the em dash in `<Num>` bullets (e.g. **Container** — …), consistent with existing component guidelines such as Button.
- Everything else: plain sentences. Use `` `backticks` `` for components, props, file paths, and literal UI copy — not bold.
- Rare exceptions: one bold phrase for a genuinely critical warning or a single standout default is fine; avoid multiple bold phrases in the same paragraph.

Headings and list structure carry hierarchy; they do not need bold reinforcement every few words.

## Guideline MDX: no CSS files or tokens in prose

Pattern and component guidelines should read as product guidance, not implementation walkthroughs. In MDX prose (outside code samples), do not reference `*.module.scss` files, CSS custom properties, or design-token identifiers such as `spacing-m`, `radius-s`, or `sidebar-header-bg`.

Describe appearance and layout in plain language instead (e.g. “dark sidebar header strip”, “compact padding”, “rounded corners aligned with avatar rows”). Reserve token and variable detail for Foundations topics or explicit “Implementation” sections when truly necessary.

## Guideline MDX: product voice, not playground voice

Guidelines describe Mattermost product behavior and Compass patterns for anyone reading the docs. Do not center prose on “the playground”, “this repo”, or how the local demo wires props — write what the pattern is and how real apps should behave.

Pointing readers to the Specimen tab as a live demo is fine. Avoid implying that this documentation site or its demo implementation is the source of truth for product wiring.

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

## Scrollbars: use the `Scrollbars` wrapper for UI components

Any scrolling region inside a Compass UI component or pattern (`src/components/ui/`, `src/guidelines/**/*.specimen.tsx`) must render through the shared `Scrollbars` component at `src/components/ui/Scrollbars/`. It wraps `simplebar-react` to produce an overlay scrollbar — the thumb floats above content (no reserved gutter), auto-hides when idle, and matches Compass theming via `--center-channel-color-rgb`.

```tsx
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';

<div className={styles['my-panel__body']}>
  <Scrollbars>
    {/* tall content */}
  </Scrollbars>
</div>
```

Conventions:

- **Sizing.** `Scrollbars` fills its parent. In a flex column give the parent `flex: 1; min-height: 0;`. For menus and other capped-height surfaces, pass `style={{ maxHeight }}` on the wrapper.
- **Theming.** Default thumb colour follows `--center-channel-color-rgb`. On dark surfaces (e.g. the channel sidebar) pass `color="--sidebar-text-rgb"` so the thumb stays visible.
- **Padding.** Apply layout padding to a child wrapper inside `<Scrollbars>`, not to the `Scrollbars` root — the scrollbar track sits at the wrapper's content-box edge, so padding on the wrapper pushes the thumb inward.
- **Imperative scroll.** Forward a ref to `<Scrollbars>` to receive the inner scrollable `<div>`. Use it for `.scrollTo(...)` or to read `.scrollTop` (e.g. "more unreads above/below" indicators).

### Exception: docs shell components

Layout-level scrollers in `src/components/layout/` (`AppShell`, `DocsLayout`, `DocSidebar`, `OnThisPage`) keep raw `overflow: auto` and apply `@include minimal-scrollbar;` from `src/styles/mixins.scss`. The mixin produces the same thin/translucent look as the wrapper.

These stay on native scrolling because:

1. **`position: sticky` descendants** (`OnThisPage`) need a native scrolling ancestor — sticky positioning breaks inside SimpleBar's wrapper/mask/offset DOM.
2. **Flex-driven heights** rely on a clean flex chain from `app-shell` down through `docs-layout` to the docs sidebar and main pane. Wrapping `AppShell.__content` or `DocsLayout.__content` in SimpleBar inserts a `.simplebar-content` element with no defined height, which collapses any `flex: 1; min-height: 0;` descendants.

Don't reach for the mixin in UI components; reach for `<Scrollbars>`.
