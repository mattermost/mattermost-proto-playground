# Universal Search — session handoff

Background for the next session. Requirements stay in the spec and Figma links in `README.md`. This file is the current prototype state.

## Where to start

- Branch: `prototype/universal-search` (tracks origin).
- Last pushed commit: `ec070880` — “Grow the search modal with its results and add an All mode on Compass SegmentedControl.”
- Everything after that commit is **uncommitted**. Do not commit or push unless asked.
- Route: `/prototypes/universal-search`. The dev server was last on port **5175** because 5173 and 5174 were already in use. Start with Node from nvm (`v24.15.0`) if the default Node is too old.

## Do not

- Edit `compass-design` without saying so and getting agreement. Do not switch its branch `cursor/segmented-control-1658`. Do not point the playground’s `@mattermost/compass-ui` dependency at a `file:` path.
- Rewrite the external spec title “AI Copilot Search”. The in-app label is **Agents**. The internal tab key stays `copilot`.
- Put the scene switcher back. The modal’s segmented control is the only navigation.
- Change the search field letter-spacing. It is `var(--letter-spacing-normal)` on purpose.
- Treat `npm install` as safe for this branch until Segmented Control is in the published package. See below.

## Compass package

Published `@mattermost/compass-ui` `^0.1.0-alpha.27` does not export `SegmentedControl` or Modal `headerLeading`. The playground `node_modules/@mattermost/compass-ui/dist` is a local build of Compass **main** (`858f1a6`, “Add SegmentedControl…”). Vite’s `resolve-compass-ui-from-npm` plugin always loads that folder. A fresh install replaces it and the mode tabs stop resolving.

`IconSlotContext` from that build does not reach an `Icon` imported by the playground, so the Agents glyph falls back to 24px. `UniversalSearchModal` passes `size="12"` on purpose.

## What the prototype does now

- Modal is `size="medium"` (704px), `height: auto`, `max-height: 480px`. The body scrolls after that. The search field is focused on open via `initialFocusRef`.
- Modes, in order: All, Channels, Messages, Files, People, Agents. The control is Compass `SegmentedControl` (`aria-label="Search modes"`, default small size). Its header slot is pulled left by `--spacing-xs` (8px).
- The close button is hidden in this dialog only (`display: none` on `modal-header__close`). `Modal` has no hide prop. Escape and a scrim click still close it.
- Typing filters the list for the active mode. Nothing is injected into the field. No matches use `SearchEmptyState`: Compass `EmptyState` plus the search illustration (“No results found”).
- People, empty query: a row of frequent people (avatar, status, truncated name; first card selected) and a Recent list with `@username`. Footer: “Use ⌘-Shift-K to browse for teammates or start a group message”, with the two actions as link buttons. Portraits are the prototype avatars, not the Figma stock photos.
- Messages: a query filters recent searches only. Message hits wait for Enter, which opens the right-hand results panel. `from:` opens the people filter and filters those names.
- Header Search opens All. Find channels opens Channels, but only when the dialog is closed — the overlay covers the sidebar while it is open. Find channels is wired in this prototype, not in compass-proto.

## Uncommitted files

- `UniversalSearch.tsx` — scene switcher removed; live query; no preset typing scenes.
- `universalSearchScenes.ts` — dropped `all-typing`, `channels-typing`, `people-typing`.
- `universalSearchData.ts` — Figma people names, `matchesQuery` exported, preset query strings removed.
- `PeopleCards.tsx` / `PeopleCards.module.scss` — frequent-people row.
- `SearchEmptyState.tsx` — shared no-results state.
- `SearchListRows.tsx` — `SearchOption` so cards join the same keyboard list as menu rows. Usernames render inline.
- `SearchTipBar.tsx` — people tip.
- `UniversalSearchModal.module.scss` — 8px leading nudge; hidden close button.
- Scenes: All, Channels, Files, Messages, Messages modifiers, Messages results, People. Deleted `ChannelsTypingScene.tsx` and `PeopleTypingScene.tsx`.

## Still open

- Agents matches the webapp plugin: no suggestions, a Search with picker, and Enter opens that agent’s thread.
- “All teams” does not open a menu.
- People photos do not match the Figma portraits (node `2029:44440` in Universal Search UX).
- Enter in the search field submits the query. It does not activate the highlighted row.
- A Compass `hideClose` prop does not exist. This dialog hides the button with CSS.
