# Compass UI (Storybook)

When adding or editing `packages/compass-ui/**/*.stories.tsx`:

- Story `title`s mirror the guidelines sidebar: `Components/{section}/{name}` and `Foundations/Style/{name}`. Keep `packages/compass-ui/src/storybook/titles.ts` aligned with `src/manifests/sections.ts`; use the same string literal in `meta.title`.
- **Proto stories** (`packages/compass-proto/**/*.stories.tsx`) use `Proto/...` titles — unpublished Mobile/Call/layout composites, not core.
- Foundation stories import named `*Content` exports from guideline specimens (visual reference only). Use `tags: ['autodocs']`, inline string-literal titles, meaningful story names. Do not port guideline MDX prose into Storybook.
- Labels/demo text: `var(--center-channel-color)` — not `--color-neutral-*` / `--color-text-secondary`.
- Preview surfaces: `var(--center-channel-bg)`. Inverted surfaces: `var(--sidebar-header-bg)` with `var(--sidebar-text)` labels.
- Secondary text/borders/fills: `rgba(var(--center-channel-color-rgb), <alpha>)`. Text alpha ≥ **0.72**; icon alpha ≥ **0.56**.
- Base fonts from `@mattermost/compass-ui/styles` + `/styles/standalone` (Storybook preview) — do not hardcode font families in stories.
- Docs tab chrome: `packages/compass-ui/.storybook/docs-theme.css`.

General styling tokens, opacity floors, and motion: see the repo styling rule (`.claude/rules/styling.md` / `.cursor/rules/styling.mdc`).
