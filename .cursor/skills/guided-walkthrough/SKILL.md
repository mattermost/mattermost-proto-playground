---
name: guided-walkthrough
description: >-
  Author or refine a prototype guided walkthrough in mattermost-proto-playground.
  Modes: create (bootstrap from scenes), update (diff existing walkthrough vs code),
  or reshape-from-spec (align steps to a UX/Confluence spec). Use for phrases like
  “create a walkthrough for …”, “update the … walkthrough”, “reshape walkthrough from
  the UX spec”. Also used when a UX-design workflow needs a guided prototype handoff
  instead of a long screen-tour in the written spec.
---

# Guided walkthrough

## Purpose

Turn an existing playground prototype into a **walkthrough viewing mode**: Jump-to popover, sliding step narrative, fixed Back/Next + Exit, and optional ring/lightbox focus with Compass `TourPoint` design notes. Replaces much of a prose UX-spec screen tour for stakeholder handoff.

## When to use

- Prototype screens already exist (scenes / SceneSwitcher / deep-link state)
- Design needs a guided handoff for the selected option (walk the prototype instead of a long Confluence screen tour)
- Updating an existing `*Walkthrough.ts` after scenes or UX specs change

## When not to use

- To invent new product screens (scaffold/compose the prototype first)
- To publish or sync Confluence (separate publishing step)
- To add design-system components (use compass-design)

## Choose a mode (required)

Pick **one** mode before writing files. Infer from the user prompt; if unclear, ask once.

| Mode | Prompt cues | Source of truth |
| --- | --- | --- |
| **Create** | “create”, “new”, “add a walkthrough”, `/guided-walkthrough create …` | Prototype scenes / code |
| **Update** | “update”, “fix”, “add a step”, “stale anchors”, `/guided-walkthrough update …` | Existing `*Walkthrough.ts` + current scenes |
| **Reshape from spec** | “from the UX spec”, “align to Confluence”, “Phase 1/2”, spec URL/doc, `/guided-walkthrough reshape …` | UX/Confluence spec **plus** what the prototype already supports |

Shared for all modes: content schema, focus/TourPoint rules, overlay ownership, validation — do not skip the [Runtime contract](#runtime-contract) or checklist.

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
        // Optional — prefer TourPoint side when auto would overlap chrome
        // notePlacement: 'right', // 'above' | 'below' | 'left' | 'right'
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

### A. Create — initial build from prototype code

1. Enumerate scenes from SceneSwitcher / orchestrator scene union / `*Scenes.ts`
2. Draft one step per scene (titles from labels); group into sections
3. Suggest `data-wt-focus` ids on **specific** interactive targets (never the full scene/shell); add attributes in JSX (or stamp via `useLayoutEffect` when Compass has no data-attr escape hatch)
4. Emit thin leads / lookFor / bullets — cite UI, do not invent long prose; avoid domain jargon unless it is the on-screen string
5. Pause for author to reorder, merge/split steps, deepen copy, pick ring and/or lightbox (still never on the entire view)
6. Wire `useRegisterWalkthrough(doc, { onScene })` — apply `scene` **and** `sceneState` (reset overlays when keys are absent)
7. Validate: every `scene` resolves; every `focus.id` has a matching `data-wt-focus`; `sceneState` keys are handled; `?walkthrough=1&step=<id>` works
8. For lightbox, mark the product chrome root with `data-wt-shell` so the dim overlays the **app shell** (not stage padding around it)

### B. Update — refine an existing walkthrough

1. Diff current scenes and UI against the existing content file — **preserve polished copy**
2. Add/remove/reorder steps only as needed for code drift; fix stale `focus.id` anchors and `sceneState` keys
3. Re-validate anchors and URL mode
4. Do **not** wholesale rewrite structure or tone unless the user asked for reshape-from-spec

### C. Reshape from UX spec

Align (or rebuild) the walkthrough so the **story matches the UX/Confluence spec**, constrained by **UI the prototype already has**. Typical after Phase 1/2 handoff or multi-phase specs.

1. **Gather sources:** UX/Confluence page(s) (or attached plan) + current `*Walkthrough.ts` + prototype scenes/`sceneState` apply code
2. **Gap map:** for each spec flow/entry/state, mark Covered / Under-taught / Missing in prototype / Explicitly out of scope (Tier later, errors, mobile, etc.)
3. **Propose the step set** before implementing when the reshape is large: sections, step ids, scene/`sceneState`, focus targets, drop/demote list. Pause for author cuts (merge steps, skip entries, jargon)
4. **Implement** only what the playground supports — extend `sceneState`/focus stamps lightly; do **not** invent product screens to match every spec paragraph
5. Reorder for the spec’s narrative (e.g. Phase 1 entry → phone mode → Phase 2 dial pad), not the old walkthrough order
6. Copy: stakeholder-plain language; match on-screen labels; omit internal acronyms unless shown in UI
7. Validate like Create; smoke `?walkthrough=1` through the new path (overlays, dock TourPoint, outside-dismiss)

**Out of scope for this mode:** editing Confluence; shipping call cards / error toasts / mobile unless already in the prototype.

## Runtime contract

Shared chrome lives under `src/walkthrough/`. New walkthroughs should reuse it, not reimplement.

### Mode chrome

- Mode is **in-place** on the same route (`?walkthrough=1&step=`), not a sibling page or iframe
- Register via `useRegisterWalkthrough` from `@/walkthrough`
- Top-right nav: **Start walkthrough** (`map-legend` leading icon) / **Exit walkthrough** (`exit-to-app` leading icon), both `emphasis="tertiary"` `size="small"` (SceneSwitcher hidden while active)
- Narrative card (left): Jump to + Step N of M in the toolbar; body copy; Back / Next / Exit in the footer (`Exit` uses `exit-to-app` leading icon, `emphasis="tertiary"` `size="small"`)
- Drive scenes + UI state with `onScene(scene, sceneState)` when the active step changes

### Jump to

- Default (< 1920px): anchored **PopoverMenu** under the Jump to button — not a full-height left overlay
  - Trigger: `Button` `emphasis="quaternary"` `size="small"`
  - Host owns open/close, `useOutsideClose`, Escape, and **enter/exit motion** (`useExitAnimation` @ 150ms + Combobox-style scale 0.9↔1 / opacity)
  - Give the menu a content-friendly `min-width` (~300px): PopoverMenu’s `width: max-content` collapses to 212px under `MenuItem`/`Scrollbar` `width: 100%`
- Wide viewport (`min-width: 1920px`): Jump to docks as a **panel** to the left of the narrative card; both use shared `WalkthroughPanel` chrome (border, elevation, radius, bg); the narrative **Jump to** button still toggles it open/closed (defaults open on enter); step selection does not dismiss the panel
- Narrower viewports: popover under the button; step selection closes the menu
- Sections: `MenuGroupHeading` + `MenuItem` rows; dividers between groups
- No section status badges
- Avoid naming a prop `document` in components that also touch the DOM `document` (shadowing crashes listeners)

### Focus layer (ring / lightbox / TourPoint)

- Runtime: `WalkthroughFocusLayer` over the stage (`z-index` above typical prototype overlays — menus, popovers, floating widgets)
- **Ring** is drawn as an overlay rect in the focus layer (not `outline` on the target) so `overflow: hidden` ancestors cannot clip it; `border-radius` is copied from the target’s computed style
- **Lightbox** dims `[data-wt-shell]` (fallback: full stage) with a cutout over the target; `emphasis: 'lightbox'` **includes** the ring. The dimmed overlay is **clickable** — mousedown on the dim hides ring + lightbox and docks any TourPoint; the cutout stays pass-through so the focus target remains interactive
- **Target size:** ring and lightbox are for a **sub-region** of the stage only. Do **not** set `focus` on:
  - Scene / page roots (welcome full-bleed, fullscreen guest call, whole `ChannelShell`)
  - `[data-wt-shell]` itself
  - Any node whose box is effectively the full stage (≈ full width and height)
  - “Overview” steps that only orient the viewer — omit `focus` instead
- Prefer: a button, menu row, toggle, list **group container**, floating widget, or info panel — not the full stage that contains them
- **One ring per step callout:** stamp `data-wt-focus="<id>"` on a single parent. Nested or per-child stamps with the same id cause overlapping rings (runtime draws one ring per match)
- **Scroll before ring:** focus targets inside overflow/SimpleBar lists (e.g. participants roster) are scrolled into the nested scrollport before measure. Prefer group containers at the **start** of a clipped section; the layer re-scrolls on delayed place passes so restamped overlays (~180ms) do not leave the ring on clipped rows.
- **TourPoint** (`focus.note`): placed by `WalkthroughFocusLayer`; host owns enter/exit scale (suppress TourPoint’s own panel-in); restore list discs on note bullets
- **TourPoint placement + pointer** — decide with these rules (do not guess ad hoc):

  **Default (omit `notePlacement`):** runtime auto-places on the roomiest side that fits (below → above → left → right; below wins ties). Pointer aims at the target (`top-*` / `bottom-*` / `left-center` / `right-center`). Use auto for most steps.

  **Set `focus.notePlacement`** when auto would **cover the thing being taught** or a related open surface. Values: `'below'` | `'above'` | `'left'` | `'right'`. Runtime uses that side when it fits; otherwise falls back to auto. If no side fits → docks (pointer `none`).

  | Prefer | When | Pointer (set by runtime) |
  | --- | --- | --- |
  | `'right'` | Target is a **menu / popover / sheet** on the left half of the stage, or a floating panel you must keep fully visible | `left-center` (card to the right, tip on the left) |
  | `'left'` | Same, but the surface sits on the **right** half of the stage | `right-center` |
  | `'below'` | Compact control in a **header / toolbar**; open space under it | `top-*` (tip on top of card) |
  | `'above'` | Control near the **bottom** (composer, docked widget, team-rail foot) | `bottom-*` |

  **Overlap checks (author these when writing `focus.note`):**
  1. Mentally place a ~320×180 card on each side of the **focus box** (not the whole stage).
  2. If the winning auto side would sit **on top of** the focus target’s parent chrome (profile popover under a Call ▾ menu, composing PIP under a keypad tab, channel header under a menu row) → set `notePlacement` to the open side that keeps that chrome readable.
  3. Prefer **beside** stacked overlays (menu + popover) over **below/above** them — vertical placement often lands on the parent panel.
  4. Do **not** set `notePlacement` just to match Figma taste when auto already clears the target; prefer fewer overrides.
  5. Never invent pointer strings in content — only `notePlacement`; the layer maps side → TourPoint `pointerPosition`.

  **Example:** Outbound `profile-call-menu` uses `notePlacement: 'right'` so the note sits clear of the profile popover with the pointer on the left.

- **Interaction → dock (bottom-right):**
  - Click/focus a **focus target** → hide ring + lightbox; dock TourPoint (pointer `none`)
  - Click the **lightbox dim** (anywhere outside the cutout) → hide ring + lightbox; dock TourPoint
  - Other stage interaction → dock TourPoint only; keep ring/lightbox until the focus target or dim is hit
  - TourPoint close → dismiss note; callouts reset on step change
  - **Menus / ephemeral overlays:** if the focus stamp lives on a row that **unmounts on click** (Start call menu item, combobox option, etc.), the focus layer must still dock — do not rely on re-measuring a missing target. Runtime applies docked position on interact and when `noteMode === 'docked'` even if `[data-wt-focus]` is gone. When authoring: prefer stamping a **stable** control when the lesson is the entry (e.g. Call ▾ button) rather than opening the menu; stamp a **row** only when the open menu is the teaching surface.

### sceneState overlays (menus, popovers, sheets)

- Treat each step’s `sceneState` as a **snapshot**. Clear overlays when keys are omitted/`null`.
- **Walkthrough chrome clicks are outside the prototype.** Next/Back/Jump mousedown can fire host `useOutsideClose` / popover outside handlers and start a close animation whose `onClose` clears state **after** the next step re-opens the same overlay. While walkthrough is active: disable outside-dismiss on walkthrough-owned surfaces (or ignore outside events that originate in walkthrough chrome). Still pass required component callbacks (e.g. ProfilePopover `onClose`) so chrome like the close IconButton still renders — gate **outside** dismiss separately from **onClose**.
- Delayed opens (`setTimeout` / rAF until anchors paint): keep a **token/generation** and cancel stale opens when the step changes, or a late timer will re-show an overlay on the wrong step.
- Prefer highlighting a **closed** trigger when the step teaches that an entry exists; open the menu only when a specific row must be ringed.

### Copy tone

- Write for stakeholders who may not know product/domain jargon. Prefer “labeled phone number”, “outbound call”, “Call ▾” over internal labels (CPA, NIPR, SIP trunk codes) unless the prototype UI itself shows that string and you are literally pointing at it.

### Layout motion (narrative enter/exit)

- Keep the walkthrough shell **always mounted** so the prototype does not remount on mode toggle
- Do **not** paint an extra wash on the walkthrough root — `app-shell__content` already owns the stage background (a second tint double-composites and flashes)
- Animate narrative column with an **explicit width** (not `0fr`→`1fr`); `overflow: hidden` on the collapsing **slot**, not necessarily the padded clip (so Jump popovers can escape)

### Anchoring Compass UI

When Compass components lack data-attribute props, stamp `data-wt-focus` in a `useLayoutEffect` after mount. Prefer the **precise** control — or a single **group parent** when the step teaches a section — never the scene root/shell, and never the same id on parent + children. If a section has no DOM parent (heading + list as siblings), inject a temporary wrap, stamp it, and unwrap on cleanup. See the [reference example](#reference-example) for stamping patterns.

## Validation checklist

- [ ] Mode chosen (Create / Update / Reshape from spec) before edits
- [ ] Reshape-from-spec: gap map done; out-of-scope items not invented as new screens
- [ ] `prototypeId` matches manifest
- [ ] All `step.scene` values are real scene ids
- [ ] Focus targets exist in the DOM for steps that declare `focus` (including after `sceneState` opens overlays)
- [ ] No `focus` rings/lightboxes the entire view (scene root, shell, fullscreen surface, or near-full-stage target)
- [ ] Each `focus.id` resolves to one parent box (no parent+child or per-row same-id stamps → no overlapping rings)
- [ ] TourPoint notes: omit `notePlacement` unless auto would cover the taught control or its parent overlay; side matches the table above
- [ ] Lightbox dim click dismisses ring/lightbox (cutout still clickable through to the target)
- [ ] Interacting with the stage docks TourPoint to the bottom-right (including steps whose focus target unmounts on click)
- [ ] Walkthrough-owned overlays survive Next/Back (outside-dismiss gated; open requests not racing close animations)
- [ ] Compass surfaces that need `onClose` for chrome (e.g. ProfilePopover close button) still receive it
- [ ] Copy avoids unnecessary domain jargon unless the UI string is the callout
- [ ] Lightbox steps have `[data-wt-shell]` on the product chrome root
- [ ] `sceneState` triggers and clears overlays when jumping between steps
- [ ] Jump to animates open/close; Escape / outside click close it
- [ ] Build passes (`npm run build`)
- [ ] Enter / Exit / Back / Next / Jump work; Exit clears query params

## Portability

Keep the content schema and process stable so other workflows (e.g. a structured UX design pipeline that ends in prototype + written spec) can invoke the same recipe. In that pipeline this skill covers the **guided prototype handoff** around prototyping / spec drafting — not discovery, and not Confluence publish.

If a host process passes `meta.prototype_root`, resolve the walkthrough files under that root the same way as this repo’s `src/pages/prototypes/<slug>/`.
