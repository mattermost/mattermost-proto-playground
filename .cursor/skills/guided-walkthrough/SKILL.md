---
name: guided-walkthrough
description: >-
  Author or update a prototype guided walkthrough (viewing mode) in mattermost-proto-playground.
  Use when adding walkthrough content, focus anchors, or mode chrome for a prototype; bootstraps
  from existing scenes/code then guides refinement. Portable shape for ux-spec-process Phase 6/7.
---

# Guided walkthrough

## Purpose

Turn an existing playground prototype into a **walkthrough viewing mode**: hideable jump list, sliding step narrative, fixed Back/Next + Exit, and optional ring/lightbox focus with Compass `TourPoint` design notes. Replaces much of a prose UX-spec screen tour for stakeholder handoff.

## When to use

- Prototype screens already exist (scenes / SceneSwitcher / deep-link state)
- Design or Phase 6 needs a guided handoff for the selected option
- Updating an existing `*Walkthrough.ts` after scenes change

## When not to use

- To invent new product screens (scaffold/compose the prototype first)
- To publish Confluence (Phase 8 / separate process)
- To add design-system components (use compass-design)

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
    {
      id: 'flow',
      label: 'Flow',
      badge: { label: 'In review', appearance: 'warning' }, // optional, freeform
    },
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
      // Prototype-owned state applied when the step becomes active
      sceneState: {
        dialpad: true, // example — keys are per-prototype
        // call: { contactId: 'aiko', status: 'connected' },
        // popover: { contactId: 'aiko' },
        // startCallMenu: true,
      },
      focus: {
        id: 'anchor-id',
        emphasis: 'lightbox', // 'ring' | 'lightbox' — one only; omit → ring
        note: { title: '…', points: ['…'] }, // → Compass TourPoint
      },
    },
  ],
};
```

**No** `useCase` field. **No** focus banner. Badges are optional freeform labels (`appearance` → Compass `Tag` type).

### sceneState (state triggers)

Each step can declare `sceneState` — a freeform bag the prototype applies in `onScene(scene, sceneState)`. Treat it as a **declarative snapshot** for that step (open menus, seed call status, show popovers), not a patch on the previous step.

Outbound Calls keys (`outboundWalkthroughApply.ts`):

| Key | Effect |
| --- | --- |
| `dialpad: true` | Open composing softphone PIP |
| `call: { contactId, status?, keypad?, … }` | Seed PIP (`connected` preferred for stable demos) |
| `popover: { contactId }` | Open profile popover (anchor: `data-wt-popover-anchor`) |
| `startCallMenu: true` | Open channel/DM Start call menu |

Other prototypes define their own keys and apply them in the same `onScene` callback.

## Process

### A. Initial build from prototype code (preferred)

1. Enumerate scenes from SceneSwitcher / orchestrator scene union / `*Scenes.ts`
2. Draft one step per scene (titles from labels); group into sections
3. Suggest `data-tour-focus` ids on major regions; add attributes in JSX
4. Emit thin leads / lookFor / bullets — cite UI, do not invent long prose
5. Pause for author to reorder, merge/split steps, deepen copy, pick ring vs lightbox
6. Wire `useRegisterWalkthrough(doc, { onScene })` — apply `scene` **and** `sceneState` (reset overlays when keys are absent)
7. Validate: every `scene` resolves; every `focus.id` has a matching `data-wt-focus`; `sceneState` keys are handled; `?walkthrough=1&step=<id>` works
8. For lightbox, mark the product chrome root with `data-wt-shell` so the dim overlays the app shell (not the full stage padding)

### B. Guided refine

1. Confirm prototype id and scene list
2. Edit sections / steps / focus in the content file
3. Re-validate anchors and URL mode

## Runtime contract

- Mode is **in-place** on the same route (`?walkthrough=1&step=`), not a sibling page or iframe
- Register via `useRegisterWalkthrough` from `@/walkthrough`
- Top-right nav shows Start walkthrough / Exit walkthrough toggle only
- Narrative sidebar owns Jump to + Step N of M, plus Back/Next/Exit; jump list is an overlay (does not permanently steal width)
- Drive scenes with the `onScene` callback when the active step changes
- Drive UI state with `step.sceneState` via the same callback (menus, widgets, seeded data)

## Validation checklist

- [ ] `prototypeId` matches manifest
- [ ] All `step.scene` values are real scene ids
- [ ] Focus targets exist in the DOM for steps that declare `focus`
- [ ] `sceneState` triggers the intended overlays when jumping between steps
- [ ] Build passes (`npm run build`)
- [ ] Enter / Exit / Back / Next / Jump work; Exit clears query params

## Portability

This skill mirrors the eventual `ux-spec-process` plugin skill. Keep the content schema and process stable so Phase 6/7 agents can invoke the same recipe against `meta.prototype_root`.
