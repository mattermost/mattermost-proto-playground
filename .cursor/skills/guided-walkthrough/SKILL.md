---
name: guided-walkthrough
description: >-
  Author or update a prototype guided walkthrough (viewing mode) in mattermost-proto-playground.
  Use when adding walkthrough content, focus anchors, or mode chrome for a prototype; bootstraps
  from existing scenes/code then guides refinement. Portable shape for ux-spec-process Phase 6/7.
---

# Guided walkthrough

## Purpose

Turn an existing playground prototype into a **walkthrough viewing mode**: hideable jump list, sliding step narrative, fixed Back/Next + Exit, and optional ring/lightbox focus notes. Replaces much of a prose UX-spec screen tour for stakeholder handoff.

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
      focus: {
        id: 'anchor-id',
        emphasis: ['ring', 'lightbox'], // omit → ['ring']
        note: { title: '…', points: ['…'] },
      },
    },
  ],
};
```

**No** `useCase` field. **No** focus banner. Badges are optional freeform labels (`appearance` → Compass `Tag` type).

## Process

### A. Initial build from prototype code (preferred)

1. Enumerate scenes from SceneSwitcher / orchestrator scene union / `*Scenes.ts`
2. Draft one step per scene (titles from labels); group into sections
3. Suggest `data-tour-focus` ids on major regions; add attributes in JSX
4. Emit thin leads / lookFor / bullets — cite UI, do not invent long prose
5. Pause for author to reorder, merge/split steps, deepen copy, pick ring vs lightbox
6. Wire `useRegisterWalkthrough(doc, { onScene })` in the orchestrator
7. Validate: every `scene` resolves; every `focus.id` has a matching `data-tour-focus`; `?walkthrough=1&step=<id>` works

### B. Guided refine

1. Confirm prototype id and scene list
2. Edit sections / steps / focus in the content file
3. Re-validate anchors and URL mode

## Runtime contract

- Mode is **in-place** on the same route (`?walkthrough=1&step=`), not a sibling page or iframe
- Register via `useRegisterWalkthrough` from `@/walkthrough`
- Top-right nav shows Walkthrough / Exit toggle only
- Narrative sidebar owns Jump to + Step N of M, plus Back/Next/Exit; jump list is an overlay (does not permanently steal width)
- Drive scenes with the `onScene` callback when the active step changes

## Validation checklist

- [ ] `prototypeId` matches manifest
- [ ] All `step.scene` values are real scene ids
- [ ] Focus targets exist in the DOM for steps that declare `focus`
- [ ] Build passes (`npm run build`)
- [ ] Enter / Exit / Back / Next / Jump work; Exit clears query params

## Portability

This skill mirrors the eventual `ux-spec-process` plugin skill. Keep the content schema and process stable so Phase 6/7 agents can invoke the same recipe against `meta.prototype_root`.
