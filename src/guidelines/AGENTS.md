# Guidelines / docs authoring

Follow this when working under `src/guidelines/`, docs manifests, or the docs shell.

Mobile*, Call*, and `ChannelShell` live in **`@mattermost/compass-proto`** (unpublished). Prefer importing those from `compass-proto`, not `compass-ui`. Soft-label them as non-core / prototyping when writing docs voice.

## Adding a topic

Every docs entry is a **topic** in `src/manifests/topics.ts` (prose + optional specimen) at `/<category>/<slug>`.

Procedure (step-by-step): use the skill [.cursor/skills/add-docs-topic/SKILL.md](../../.cursor/skills/add-docs-topic/SKILL.md).

Invariants:

- Category is one of Foundations / Components / Patterns / Layouts.
- Every topic needs MDX guidelines; specimen is optional.
- Sidebar grouping lives in `src/manifests/sections.ts`; Foundations bento placement is separate (`FoundationsBento.tsx`).

## Foundation specimen token rows

Shared chrome: `.foundations` in `src/styles/library-demo/foundations.module.scss`.

- No duplicate short-name column next to the token string.
- Token/value text: readable size, mono where appropriate, full `var(--center-channel-color)` — not tiny or low-opacity.
- Descriptions: `rgba(var(--center-channel-color-rgb), 0.72)` minimum for text.
- Elevation / shape rows: use `foundations__elevation-*` / `foundations__shape-*` patterns.

## Doc shell: prose vs. non-prose

- Shell layout: `DocShell` (hero 1180px, body 960px) — layout only.
- MDX prose: wrap with `.doc-page__prose` (`DocPage.module.scss`). Rules use `:not([class])` so classed components are safe.
- Live UI in docs: wrap in `compass-doc-embed` via `DocUiEmbed`, `AnatomyStage`, or `Preview`.
- Components must never render bare `<h2>`, `<p>`, `<li>`, etc. without a CSS-module className.

## Guideline MDX voice

- **Bold sparingly** — in anatomy lists, bold only the short label before the em dash; otherwise prefer `` `backticks` `` for components/props/paths.
- **No CSS/tokens in prose** (outside code samples) — describe appearance in plain language; reserve token names for Foundations or explicit Implementation sections.
- **Product voice** — describe Mattermost/Compass behavior, not “the playground” or local demo wiring. Linking to the Specimen tab is fine.
