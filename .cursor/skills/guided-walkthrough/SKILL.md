---
name: guided-walkthrough
description: >-
  Author or update a prototype guided walkthrough (viewing mode) in mattermost-proto-playground.
  Use when adding walkthrough content, focus anchors, or mode chrome for a prototype; bootstraps
  from existing scenes/code then guides refinement. Portable shape for ux-spec-process Phase 6/7.
---

# Guided walkthrough

## Purpose

Turn an existing playground prototype into a **walkthrough viewing mode**: Jump-to popover, sliding step narrative, fixed Back/Next + Exit, and optional ring/lightbox focus with Compass `TourPoint` design notes. Replaces much of a prose UX-spec screen tour for stakeholder handoff.

## When to use

- Prototype screens already exist (scenes / SceneSwitcher / deep-link state)
- Design or Phase 6 needs a guided handoff for the selected option
- Updating an existing `*Walkthrough.ts` after scenes change

## When not to use

- To invent new product screens (scaffold/compose the prototype first)
- To publish Confluence (Phase 8 / separate process)
- To add design-system components (use compass-design)

## Reference example

**Outbound Calls** is the proof implementation. Prefer copying patterns from there over inventing new chrome:

| Concern | Path |
| --- | --- |
| Content document | `src/pages/prototypes/outbound-calls/outboundCallsWalkthrough.ts` |
| `sceneState` parse + apply | `src/pages/prototypes/outbound-calls/outboundWalkthroughApply.ts` |
| Registration / `onScene` | `src/pages/prototypes/outbound-calls/OutboundCalls.tsx` |
| Shared runtime | `src/walkthrough/` |

## Inputs (content file)

Create `src/pages/prototypes/<slug>/<slug>Walkthrough.ts` exporting a `WalkthroughDocument`:

```ts
import type { WalkthroughDocument } from '@/walkthrough';

export const exampleWalkthrough: WalkthroughDocument = {
  prototypeId: 'example', // PrototypeEntry.id
  title: 'Example',
  intent: 'Optional one-liner for chrome context',
  sections: [
    { id: 'overview', label: 'Overview' },
    { id: 'flow', label: 'Flow' },
  ],
  steps: [
    {
      id: 'intro',
      section: 'overview',
      title: 'Why this exists',
      lead: '…',
      lookFor: ['…'],
      bullets: ['…', { text: '…', sub: ['…'] }],
      scene: 'existing-scene-id',
      // Optional — freeform bag; keys are per-prototype
      sceneState: { /* … */ },
      focus: {
        id: 'anchor-id', // matches data-wt-focus
        emphasis: 'lightbox', // 'ring' | 'lightbox' (lightbox includes ring); omit → ring
        note: { title: '…', points: ['…'] }, // → Compass TourPoint
      },
    },
  ],
};
```

Prefer specific focus targets (e.g. a menu row, not the whole control).

**Never ring (or lightbox) the entire view.** Focus must call out a control, row, tile, panel, or other sub-region — not the scene root, channel/app shell, fullscreen surface, or a target that fills (or nearly fills) the stage. Lightbox includes a ring, so the same ban applies. For “take in the whole screen” steps: omit `focus` and rely on lead / lookFor / bullets (optional TourPoint-free narrative only).

**One focus id → one parent box.** Each `focus.id` should match a **single** element whose box is the callout. Do **not** put the same `data-wt-focus` on a parent **and** its children (or on every row inside a group) — the focus layer draws a ring per match, so nested/sibling stamps stack into overlapping rings. For a list section (heading + rows): stamp the **group container** only; if markup has no group root, wrap the heading + list in one element and stamp that. Prefer a wrap over multi-match. Multi-match is reserved for rare non-nested co-equal siblings when a wrap would break layout — never parent + descendants.

Optional `railGroup` on a step overrides the narrative eyebrow (section label); Jump to always groups by `sections`.

### sceneState (state triggers)

Each step can declare `sceneState` — a freeform bag the prototype applies in `onScene(scene, sceneState)`. Treat it as a **declarative snapshot** for that step (open menus, seed widgets, show overlays), not a patch on the previous step. When leaving a step, omit or `null` keys so overlays clear.

Each prototype owns its key vocabulary and apply logic. See the [reference example](#reference-example) for one complete parse/apply shape.

## Process

### A. Initial build from prototype code (preferred)

1. Enumerate scenes from SceneSwitcher / orchestrator scene union / `*Scenes.ts`
2. Draft one step per scene (titles from labels); group into sections
3. Suggest `data-wt-focus` ids on **specific** interactive targets (never the full scene/shell); add attributes in JSX (or stamp via `useLayoutEffect` when Compass has no data-attr escape hatch)
4. Emit thin leads / lookFor / bullets — cite UI, do not invent long prose
5. Pause for author to reorder, merge/split steps, deepen copy, pick ring and/or lightbox (still never on the entire view)
6. Wire `useRegisterWalkthrough(doc, { onScene })` — apply `scene` **and** `sceneState` (reset overlays when keys are absent)
7. Validate: every `scene` resolves; every `focus.id` has a matching `data-wt-focus`; `sceneState` keys are handled; `?walkthrough=1&step=<id>` works
8. For lightbox, mark the product chrome root with `data-wt-shell` so the dim overlays the **app shell** (not stage padding around it)

### B. Update / refine

1. Diff current scenes and UI against the existing content file — preserve polished copy
2. Add/remove/reorder steps; fix stale `focus.id` anchors and `sceneState` keys
3. Re-validate anchors and URL mode

## Runtime contract

Shared chrome lives under `src/walkthrough/`. New walkthroughs should reuse it, not reimplement.

### Mode chrome

- Mode is **in-place** on the same route (`?walkthrough=1&step=`), not a sibling page or iframe
- Register via `useRegisterWalkthrough` from `@/walkthrough`
- Top-right nav: **Start walkthrough** (`map-legend` leading icon) / **Exit walkthrough** (`exit-to-app` leading icon), both `emphasis="tertiary"` `size="small"` (SceneSwitcher hidden while active)
- Narrative card (left): Jump to + Step N of M in the toolbar; body copy; Back / Next / Exit in the footer
- Drive scenes + UI state with `onScene(scene, sceneState)` when the active step changes

### Jump to

- Anchored **PopoverMenu** under the Jump to button — not a full-height left overlay
- Trigger: `Button` `emphasis="quaternary"` `size="small"`
- Sections: `MenuGroupHeading` + `MenuItem` rows; `PopoverMenuDivider` between groups
- No title inside the menu; no section status badges in the menu
- Host owns open/close, `useOutsideClose`, Escape, and **enter/exit motion** (`useExitAnimation` @ 150ms + Combobox-style scale 0.9↔1 / opacity)
- Give the menu a content-friendly `min-width` (~300px): PopoverMenu’s `width: max-content` collapses to 212px under `MenuItem`/`Scrollbar` `width: 100%`
- Avoid naming a prop `document` in components that also touch the DOM `document` (shadowing crashes listeners)

### Focus layer (ring / lightbox / TourPoint)

- Runtime: `WalkthroughFocusLayer` over the stage (`z-index` above typical prototype overlays — menus, popovers, floating widgets)
- **Ring** is drawn as an overlay rect in the focus layer (not `outline` on the target) so `overflow: hidden` ancestors cannot clip it; `border-radius` is copied from the target’s computed style
- **Lightbox** dims `[data-wt-shell]` (fallback: full stage) with a cutout over the target; `emphasis: 'lightbox'` **includes** the ring
- **Target size:** ring and lightbox are for a **sub-region** of the stage only. Do **not** set `focus` on:
  - Scene / page roots (welcome full-bleed, fullscreen guest call, whole `ChannelShell`)
  - `[data-wt-shell]` itself
  - Any node whose box is effectively the full stage (≈ full width and height)
  - “Overview” steps that only orient the viewer — omit `focus` instead
- Prefer: a button, menu row, toggle, list **group container**, floating widget, or info panel — not the full stage that contains them
- **One ring per step callout:** stamp `data-wt-focus="<id>"` on a single parent. Nested or per-child stamps with the same id cause overlapping rings (runtime draws one ring per match)
- **TourPoint** (`focus.note`): auto-placed from available space (below / above / left / right); pointer variant aims at the target; host owns enter/exit scale (suppress TourPoint’s own panel-in); restore list discs on note bullets
- Interaction:
  - Click/focus a **focus target** → hide ring + lightbox; dock TourPoint if open
  - Other stage interaction → dock TourPoint only (pointer `none`)
  - TourPoint close → dismiss note; callouts reset on step change

### Layout motion (narrative enter/exit)

- Keep the walkthrough shell **always mounted** so the prototype does not remount on mode toggle
- Do **not** paint an extra wash on the walkthrough root — `app-shell__content` already owns the stage background (a second tint double-composites and flashes)
- Animate narrative column with an **explicit width** (not `0fr`→`1fr`); `overflow: hidden` on the collapsing **slot**, not necessarily the padded clip (so Jump popovers can escape)

### Anchoring Compass UI

When Compass components lack data-attribute props, stamp `data-wt-focus` in a `useLayoutEffect` after mount. Prefer the **precise** control — or a single **group parent** when the step teaches a section — never the scene root/shell, and never the same id on parent + children. If a section has no DOM parent (heading + list as siblings), inject a temporary wrap, stamp it, and unwrap on cleanup. See the [reference example](#reference-example) for stamping patterns.

## Validation checklist

- [ ] `prototypeId` matches manifest
- [ ] All `step.scene` values are real scene ids
- [ ] Focus targets exist in the DOM for steps that declare `focus` (including after `sceneState` opens overlays)
- [ ] No `focus` rings/lightboxes the entire view (scene root, shell, fullscreen surface, or near-full-stage target)
- [ ] Each `focus.id` resolves to one parent box (no parent+child or per-row same-id stamps → no overlapping rings)
- [ ] Lightbox steps have `[data-wt-shell]` on the product chrome root
- [ ] `sceneState` triggers and clears overlays when jumping between steps
- [ ] Jump to animates open/close; Escape / outside click close it
- [ ] Build passes (`npm run build`)
- [ ] Enter / Exit / Back / Next / Jump work; Exit clears query params

## Portability

This skill mirrors the eventual `ux-spec-process` plugin skill. Keep the content schema and process stable so Phase 6/7 agents can invoke the same recipe against `meta.prototype_root`.
