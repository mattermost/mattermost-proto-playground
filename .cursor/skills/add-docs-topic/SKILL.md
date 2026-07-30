---
name: add-docs-topic
description: Add a new Compass docs topic (MDX guidelines, optional specimen, topics.ts, sections). Use when creating or registering a foundation, component, pattern, or layout docs entry.
---

# Add a docs topic

Every docs entry is a **topic** in `src/manifests/topics.ts` with Guidelines / Specimen tabs at `/<category>/<slug>`.

## Steps

1. Pick the category from the four-layer model: Foundations / Components / Patterns / Layouts (URL prefix).
2. Author an MDX guideline page at `src/guidelines/<category>/<slug>/<slug>.guideline.mdx` (required).
3. Optionally author a specimen file at `src/guidelines/<category>/<slug>/<slug>.specimen.tsx` (overview-style topics may omit; tab strip hides).
4. Add a `Topic` entry to `TOPICS` in `src/manifests/topics.ts`. For a sidebar group, list the slug under the right `topicSections[<category>]` in `src/manifests/sections.ts`; otherwise it falls under "Other".

## Also

- Foundations bento on `/foundations` is curated in `src/pages/topics/FoundationsBento/FoundationsBento.tsx` — place new foundation topics there or they use the plain-card fallback.
- Follow voice/prose invariants in [src/guidelines/AGENTS.md](../../../src/guidelines/AGENTS.md).
