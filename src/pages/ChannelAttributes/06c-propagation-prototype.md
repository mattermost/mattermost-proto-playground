# 06c — Channel Attributes: Propagation Surfaces (prototype)

Where channel classification markings echo across the product. This is a running
manifest for the ~14 propagation surfaces plus the shared infrastructure they
reuse. All surfaces live under one route with a scene-picker harness.

**Route:** `/prototypes/channel-attributes/propagation` (deep-link a scene via
`?scene=<id>`).

**Marking style (`?style=`):** a playground-chrome segmented control in the harness
left rail (Abbreviated | Full) sets how the compact classification pill renders
across ALL propagation scenes. Deep-linkable via `?style=abbrev|full`; default
`abbrev` (recommended). Abbreviated uses CAPCO portion marks (UNCLASSIFIED→`U`,
CONFIDENTIAL→`C`, SECRET→`S`, TOP SECRET→`TS`, TS//SCI→`TS//SCI`), with a native
`title` tooltip carrying the full term; Full uses the level word. Color is
identical in both modes (WCAG 1.4.1 — never color alone; black-on-orange /
black-on-yellow preserved for TOP SECRET / TS//SCI). The toggle lives in the
harness frame like the scene picker — it is never product chrome inside a surface.

Abbreviated mode fixes the earlier truncation where full-word pills squeezed
channel names (`Feature Proposals` collapsing toward `F`): row names now hold
their natural width (`flex: 0 0 auto`) and the compact abbrev pill leaves ample
room, so names render in full.

## Shared infrastructure (built once, reused by all surfaces)

| File | Purpose |
| --- | --- |
| `shared/channelListData.ts` | Multi-channel dataset (`CHANNEL_LIST`) + `rowHasClassification()` helper. Server-side masking modeled in the data: masked channels carry `classification: undefined` (value never reached the client). Separate from `channelAttrData.ts` (single-channel model). |
| `shared/ChannelRowPill.tsx` | The single shared way a list row renders its classification pill. Placement: after name, before ~handle. Renders nothing for DMs, masked, or unmarked rows (no-trace). Wraps the existing `ClassificationPill size="sm"` — not a fork. |
| `propagation/PropagationHarness.tsx` | `SceneHarness`-based scaffold. Surfaces 2–14 register as scenes here. |

### `CHANNEL_LIST` composition

| Row | Kind | Classification | Pill? | Note |
| --- | --- | --- | --- | --- |
| Feature Proposals | channel | UNCLASSIFIED | yes | explicit marking (absence ≠ unclassified) |
| Leonard Riley | dm | — | no | DM never carries a channel pill |
| Eliseo Finney, Jackson Mcgrath | dm (group) | — | no | group DM, count tile lead |
| Bugs | channel | `undefined` | no | **MASKED** — SECRET channel viewer isn't cleared for; server withheld value |
| Ask R&D | channel | CONFIDENTIAL | yes | |
| Operation Aurora | private | SECRET | yes | |
| Orion Launch Ops | private | TOP SECRET | yes | black-on-orange (WCAG 1.4.3) |
| Quick Wins Design Sprint | channel | `undefined` | no | genuinely unmarked — indistinguishable from masked `Bugs` |
| Town Square | channel | UNCLASSIFIED | yes | |
| Danielle Okoro | dm | — | no | |

Levels exercised: UNCLASSIFIED, CONFIDENTIAL, SECRET, TOP SECRET, plus DMs and a
masked-vs-unmarked pair proving no-trace masking.

## Surface manifest

| # | Surface | route `?scene=` | Marking placement | Masking note | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Quick channel switcher ("Find channels") | `?scene=switcher` | After channel name, before ~handle | `Bugs` (undefined) → no pill, identical to unmarked `Quick Wins` | Built |
| 2 | ~channel composer autocomplete | `?scene=autocomplete` | After channel name, before ~handle | `Bugs` (undefined) → no pill; still a valid ~ref | Built |
| 3 | Search results panel (RHS) | `?scene=search` | On each result's channel-attribution row, right after the channel name in `[Team] · [Channel] [pill]` | `Platform · Bugs` result (source `undefined`) → no pill; one result per level in one list | Built |
| 4 | Global threads view | `?scene=threads` | On each thread's channel label (the `LabelTag`), right after the channel name; also echoed on the reading-pane header secondary title | `BUGS` thread (source `undefined`) + unmarked `Quick Wins` thread → no pill | Built |
| 5–14 | Sidebar, mentions, notifications, saved, pinned, … | — | — | — | Deferred (harness scaffolded) |

## Surface #1 — Quick channel switcher

Faithful recreation of the standard Mattermost "Find channels" modal: title +
subtitle, search box, UNREAD / RECENT groups, rows = lead (globe for public,
lock for private, avatar for DM, count tile for group DM) + bold name + ~handle +
optional unread badge, one highlighted row (`Bugs`).

Addition: the compact classification pill after each channel name (before the
~handle) via `ChannelRowPill`. `Bugs` is the highlighted masked row — it shows no
pill and is visually identical to the unmarked `Quick Wins Design Sprint`,
demonstrating no-trace masking in-product (not labeled as masked anywhere in the
product UI).

## Surface #2 — ~channel composer autocomplete

Faithful recreation of the standard Mattermost `~`-channel autocomplete dropdown:
a "MY CHANNELS" section header and rows of globe (public) / lock (private) icon +
bold channel name + grey ~handle, no unread badges. Rendered anchored ABOVE a
minimal message composer showing a partially typed `~fea` with a blinking caret,
to set the "I'm typing a channel reference" context.

Addition: the same compact classification pill after each channel name (before the
~handle) via `ChannelRowPill`, honoring the `?style=` marking-style toggle.

**Server-filtered autocomplete — masking behavior (decision):** the list is what
the SERVER returned for this viewer. Cleared channels carry a classification value
and render a pill; the masked `Bugs` channel carries `classification: undefined` —
the viewer is still a MEMBER (so `~bugs` is a valid, suggestable reference) but is
not cleared for the value, so it renders with NO pill, indistinguishable from a
genuinely unmarked channel (no-trace masking). We do NOT omit `Bugs` from the
suggestions, because `CHANNEL_LIST` encodes it as a member channel, not as a
"not-cleared-to-reference" one — inventing an excluded/not-suggested state would
require an access state the shared data does not model. DMs are excluded because
`~` autocompletes channels, not direct messages. Net rule, kept simple and honest:
cleared channels show pills; member channels with undefined classification show no
pill and remain valid ~refs.

## Surface #3 — Search results panel (RHS)

Faithful recreation of the RHS "Search Results" panel: header "Search Results" +
expand/close, a query chip (`threat model`), Messages / Files tabs with counts,
and results grouped by date (Today / Yesterday). Each result is a channel-
attribution row — `[Team] · [Channel]` — above the message (author avatar + name +
timestamp + body), with a hover "Jump" affordance.

Reused (as-is, not edited): `RightSidebar` + `RightSidebarHeader` chrome for the
panel frame/header; `Message` (with `showMessageActions={false}`) for each hit,
including its `message__body-text` typography class. Recreated locally (no
standalone DS component exists): the query chip, the Messages/Files tab strip with
count pills, the date group headers, and the attribution row itself.

Addition: the compact classification pill on the attribution row, placed right
after the channel name (`[Team] · [Channel] [pill]`) via the shared
`ChannelRowPill`, honoring `?style=`.

**Cross-classification aggregation (the risk this surface exposes):** search is
the point where hits from many channels collapse into one flat list. The fixtures
deliberately span UNCLASSIFIED (`Town Square`), CONFIDENTIAL (`Ask R&D`), SECRET
(`Operation Aurora`), and TOP SECRET (`Orion Launch Ops`) in a single result set,
so the per-result marking is what keeps the level attributable at the aggregation
point. Source channels are read from `CHANNEL_LIST`, so the same rows proven
elsewhere drive results here.

**Masking:** one result's source channel is the masked `Bugs`
(`classification: undefined`) → its attribution row (`Platform · Bugs`) renders NO
pill, indistinguishable from a genuinely unmarked source. No-trace, in the
aggregation surface. (Deferred/honest note: the SECRET / TOP SECRET results sit in
the Yesterday group inside the panel's own scroll viewport — the panel is a fixed-
height `RightSidebar`, so those rows scroll within the panel rather than the page.
Content and pills are correct; only the initial fold shows the first three.)

## Surface #4 — Global threads view

Reproduction of the global Threads list layout: a left inbox (All your threads /
Unreads tabs + mark-all-read control, then thread rows) and a right reading pane.
Each thread row = optional unread dot + author + channel/team label + preview +
timestamp + participant avatars + reply count.

Reused (as-is, not edited): the reading pane is the DS `RightSidebar` (`fill`,
`alignBody="end"`) + `RightSidebarHeader` + `RightSidebarThread` + `MessageInput`
reply composer + `Tabs` for the inbox tab strip. The thread ROW is a faithful
local recreation rather than the DS `ThreadListItem`, because that component types
`channelLabel` as a plain `string` — it cannot carry an inline pill after the
channel name without editing the shared component (out of scope). The local row
reuses the same sub-components `ThreadListItem` itself uses: `LabelTag` (the
channel label), `UserAvatarGroup`, `UnreadBadge`, `IconButton`/`Icon`; the SCSS
mirrors `ThreadListItem.module.scss` metrics.

Addition: the compact classification pill placed right after the channel `LabelTag`
via `ChannelRowPill`, honoring `?style=`. The reading-pane header also carries the
selected thread's parent channel as its secondary title.

**Why this surface matters (the spillage path):** replying from the global Threads
reading pane bypasses the in-channel classification banner entirely — a reviewer
can answer a SECRET thread without ever seeing the SECRET channel header. The pill
on the thread's channel label (and echoed on the reading-pane header) is the
mitigation that keeps the level visible on the reply path.

**Cross-classification + masking:** thread sources span UNCLASSIFIED (`Town
Square`), CONFIDENTIAL (`Ask R&D`), SECRET (`Operation Aurora`), TOP SECRET (`Orion
Launch Ops`, in the All tab), plus the masked `Bugs` (`undefined` → no pill) and
the genuinely unmarked `Quick Wins Design Sprint` (All tab, no pill). Both no-pill
rows are indistinguishable — no-trace masking holds on this surface too.

## Status

- `npm run build`: passing (zero TS errors; the pre-existing >500 kB chunk-size
  note is a build warning, not an error).
- `eslint src/pages/ChannelAttributes/`: clean.
- Scenes `search` and `threads` verified in the running preview (both marking
  styles) — see screenshot review.
- New scenes register inside `PropagationHarness` (grouped under "Search &
  discovery"); the prototype manifest entry for the harness route was already
  present, so no manifest change was required this round.
- Only files under `ChannelAttributes/` were touched; `shared/channelListData.ts`,
  `hubData.ts`, `ccData.ts`, and `src/components/**` were read-only.
