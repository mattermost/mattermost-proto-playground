# Package boundaries and version skew

Stable rules for translating a Compass prototype into product code. Not a full component inventory — discover exports via the consumer’s installed package.

## Buckets

| Bucket | Examples | Product action |
| --- | --- | --- |
| `@mattermost/compass-ui` | `Button`, `TextInput`, `ChannelsSidebar`, … | Keep when the consumer already adopts that leaf (or the task is adopting it). Import from **subpaths**. Confirm export exists in **consumer** `node_modules`. See overlay adoption note below for `Modal` / `Tooltip` / `PopoverMenu`. |
| `@mattermost/compass-proto` | `ChannelShell`, `Mobile*`, `CallWidget`, `CallPopout`, message/composer/header composites when imported from proto, `buildDefaultChannelsSidebarModel`, demo RHS fixtures | **Never** add as a product dependency. Decompose to ui leaves + host layout/behavior. |
| Playground chrome | `PrototypeTopNav`, `SceneSwitcher`, `DeviceFrame`, `MobileModalStage`, walkthrough runtime (`data-wt-*`, `src/walkthrough/`) | **Drop.** Wire into the consumer’s nav/shell. |
| Prototype-local | `src/pages/prototypes/<slug>/components/*` | Rebuild with ui primitives/tokens, or reuse a host surface pattern with Compass leaves. |
| Tokens / CSS vars | `--spacing-*`, `--center-channel-color`, `--duration-*`, … | Keep. Load styles per consumer kind (see INTEGRATION.md). |

## Hard rules

1. Product may depend on **`@mattermost/compass-ui` only** (plus peers such as `@mattermost/compass-icons`).
2. **Never** ship `@mattermost/compass-proto` into webapp, desktop, or plugins.
3. Compass owns **look** (props/slots). The consumer owns **behavior** (permissions, data, routing, optimistic UI).
4. Variant prop strings are **lowercase kebab-case** (`'primary'`, `'x-small'`).
5. Overlays from Compass (`Modal`, `Tooltip`, `PopoverMenu`, …) are visual chrome only — host owns open/close, portal, position, focus (exceptions: form widgets that own their menus). **Adoption note (current):** no Mattermost consumer (webapp / desktop / plugins) uses Compass `Modal`, `Tooltip`, or `PopoverMenu` yet. If the prototype uses them, map to the **host’s existing overlay patterns** for that surface; do not introduce these Compass overlays into product unless the task explicitly adopts them. Re-check consumer code / installed usage before assuming this still holds.

## Version skew

Prototypes and consumers often pin different `@mattermost/compass-ui` alphas.

| Situation | Action |
| --- | --- |
| Prototype used proto; same (or successor) export exists in consumer ui | Prefer consumer ui. |
| Prototype used ui API / variant missing from consumer | Closest consumer variant, or compose from available ui primitives. Do not invent Button/Modal chrome. Note the gap for the developer. |
| Prototype older than consumer | Prefer consumer APIs when they cover the same role. |
| Skill table vs installed `.d.ts` | **Installed `.d.ts` wins.** Tables are hints only. |

## Lookup (always — before inventing a control)

```sh
ls node_modules/@mattermost/compass-ui/dist/components/
grep -i "MenuItem" node_modules/@mattermost/compass-ui/dist/index.d.ts
# Props / variants:
# node_modules/@mattermost/compass-ui/dist/components/<kebab>/<Name>.d.ts
```

Docs (prose, not version pin): https://mattermost.github.io/compass-design/

Consumer setup: https://github.com/mattermost/compass-design/blob/main/packages/compass-ui/INTEGRATION.md

- **Webapp:** load `@mattermost/compass-ui/styles` (+ component styles as the host already does). **Do not** load `styles/standalone`.
- **Plugin / desktop / other:** follow that host’s established entry and INTEGRATION.md — never copy playground standalone blindly.

## Prefer Compass over legacy host widgets

When the consumer already depends on compass-ui and the role is a leaf control (button, input, modal, menu, badge, …), **use Compass** even if an older host widget exists. Falling back to legacy controls recreates drift. Host code wins for shells, routing, and product behavior not yet replaced leaf-first.

## Proto decompose categories (illustrative)

These names drift as packages evolve — always verify against prototype imports and consumer ui:

- **Shells / mobile suites:** `ChannelShell`, `MobileHome`, `MobileTabBar`, `MobileModal`, …
- **Calls composites:** `CallWidget`, `CallPopout`, participants panels, …
- **Fixtures:** `buildDefaultChannelsSidebarModel`, demo trees
- **Desktop composites still on proto** (if imported from proto in the prototype): replace with ui leaves when available in the consumer; otherwise host layout + ui controls

Optional intent check (never a product dependency): compass-design `packages/compass-proto` source on GitHub.
