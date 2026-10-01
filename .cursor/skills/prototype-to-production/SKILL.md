---
name: prototype-to-production
description: >-
  Translate a mattermost-proto-playground prototype into production UI in the Mattermost
  webapp, desktop app, or a plugin (Playbooks, Boards, Agents, …). Use when the
  user asks to implement a prototype, translate prototype to production, build
  from a prototype URL/slug into product code, or apply Compass UI from a
  published prototype. Process-first: resolve source, map compass-ui vs
  compass-proto vs playground chrome, must-use installed compass-ui — not a
  versioned component catalog.
---

# Prototype to production

## Purpose

Turn a **mattermost-proto-playground** prototype into product code in a consumer repo, using that consumer’s installed `@mattermost/compass-ui` and host patterns for routing/behavior. Portable: copy this skill folder into Cursor or Claude Code skill dirs (see [Install](#install)).

## When to use

- Implement / ship a prototype into webapp, desktop, or a plugin
- User provides a prototype URL, slug, or local playground path plus a target surface
- Agent must prefer Compass ui over inventing buttons/modals/inputs

## When not to use

- Scaffolding or editing prototypes inside the playground → `scaffold-prototype` / `guided-walkthrough`
- Adding design-system components → work in **compass-design**
- **Mobile app** (native iOS / Android) — not supported yet; this skill targets web consumers (webapp, desktop, plugins) that can depend on `@mattermost/compass-ui`
- Consumer has no `@mattermost/compass-ui` and the user refuses to add it → stop; do not hand-roll CSS replacements for Compass

## Install

Copy this entire folder (`.cursor/skills/prototype-to-production/`, including `references/`) into your agent’s skills directory — Cursor: `.cursor/skills/`; Claude Code: `.claude/skills/` (or the personal equivalent). Omitting `references/` breaks relative links in this playbook.

Once installed, the playground need not be open: fetch prototype source from GitHub; use the consumer’s `node_modules/@mattermost/compass-ui`.

## References (read as needed)

| File | Contents |
| --- | --- |
| [references/resolve-source.md](references/resolve-source.md) | URL/slug → GitHub or local source |
| [references/boundaries.md](references/boundaries.md) | ui vs proto vs playground drop, skew policy, lookup commands |

## Process

### 1. Lock the consumer first (required gate)

Do **not** resolve the prototype or write product code until the consumer is known.

**Infer** when obvious:

- Open repo `mattermost-plugin-*` / playbooks / boards / agents → that plugin
- Webapp layout (`channels/`, System Console paths) → webapp
- User named desktop, a plugin, or a console category

**Ask once** if ambiguous (URL only, multi-root workspace, vague “Mattermost”). Collect:

- Kind: `webapp` | `desktop` | `plugin` (which plugin) | `other`
- Target surface: route / console category / RHS / modal / etc.
- Access or licensing constraints if relevant

Do not re-ask every turn; keep the answer for the session.

**Branch from the answer:**

1. Confirm `@mattermost/compass-ui` in that consumer (`package.json` / `node_modules`). Add it or **fail fast**.
2. Style entry per [INTEGRATION.md](https://github.com/mattermost/compass-design/blob/main/packages/compass-ui/INTEGRATION.md) for that kind — **webapp: never** `styles/standalone`.
3. Scope host-pattern search to that repo’s shells and routes.
4. Shared rules always apply: no proto, drop playground chrome, must-use ui leaves.

### 2. Resolve prototype source

Follow [references/resolve-source.md](references/resolve-source.md).

- Prefer local `src/pages/prototypes/<slug>/` when available.
- Else GitHub: `mattermost/mattermost-proto-playground` → `src/pages/prototypes/<slug>/` on the correct **branch/PR/ref** (prototypes often are not on `main` — ask if unclear).
- Published URL is visual context only; hashed CSS classes are not component IDs.

### 3. Inventory imports

From orchestrator, `scenes/`, and `components/`, bucket every import:

| Bucket | Action |
| --- | --- |
| `compass-ui` | Keep if present in consumer ui |
| `compass-proto` | Decompose — never depend in product |
| Playground chrome | Drop |
| Prototype-local | Rebuild with ui / host patterns |
| Tokens / CSS vars | Keep |

Note prototype vs consumer compass-ui versions when visible. Details: [references/boundaries.md](references/boundaries.md).

### 4. Match each UI piece

Matching is a **lookup procedure**, not screenshot matching. “Structure matches” = same **role** confirmed by export name / JSDoc / props on the **consumer’s** installed package.

Per piece:

1. **compass-ui import** → confirm in consumer `node_modules/@mattermost/compass-ui/dist/components/<kebab>/`; use subpath + props from `.d.ts`. Missing variant → closest variant or compose from ui primitives; do not invent chrome.
2. **compass-proto import** → read usage intent; search consumer ui for leaf equivalents; compose leaves + **host** layout. Never add proto.
3. **Playground chrome** → drop; wire into consumer nav/shell.
4. **Prototype-local** → name the role → search consumer ui → then host surface patterns (layout/routing/data only) → else ui primitives + tokens.

**Before inventing any control:**

```sh
ls node_modules/@mattermost/compass-ui/dist/components/
grep -i "<RoleOrName>" node_modules/@mattermost/compass-ui/dist/index.d.ts
```

Read `dist/components/<kebab>/<Name>.d.ts` for props. Skill tables are hints; **installed `.d.ts` wins**.

When host and Compass both have a control: for leaf controls, **prefer Compass ui**. Host wins for shells, permissions, store, routing.

Plugins: same order; grep the **plugin** repo, not webapp System Console paths. Use the plugin’s own installed compass-ui version.

### 5. Implement in the consumer

- Follow that repo’s folder, routing, and data patterns.
- Do not copy playground scene/orchestrator structure wholesale.
- Compass = look; product = behavior.
- Subpath imports only for compass-ui; kebab-case variant strings.
- Overlay host ownership (portal, focus, escape) stays in product code. Compass `Modal` / `Tooltip` / `PopoverMenu` / `TourPoint` / `ProfilePopover` are **not adopted in consumers yet** — prefer host overlay patterns unless the task explicitly adopts them (see [references/boundaries.md](references/boundaries.md)).

### 6. Validation checklist

- [ ] Consumer kind and surface recorded for the session
- [ ] `@mattermost/compass-ui` present; no `@mattermost/compass-proto` in product deps or imports
- [ ] No playground chrome (`PrototypeTopNav`, `SceneSwitcher`, `DeviceFrame`, `MobileModalStage`, walkthrough runtime)
- [ ] Every Compass import resolves in the consumer’s installed ui
- [ ] Subpath imports only; kebab-case variants
- [ ] Style entry correct for consumer kind (webapp: no `styles/standalone`)
- [ ] Tokens / CSS variables used instead of magic spacing pixels where Compass vars apply
- [ ] Primary `emphasis="primary"` at most once per view when using Compass `Button`
- [ ] Gaps from version skew noted briefly for the developer

## Thin illustrative cheat sheet

Hints only — always verify against the consumer’s installed package.

| Role | Likely export | Import subpath |
| --- | --- | --- |
| Button | `Button` | `@mattermost/compass-ui/components/button` |
| Text | `TextInput` | `…/text-input` |
| Search | `SearchInput` | `…/search-input` |
| Menu row | `MenuItem` | `…/menu-item` |
| Empty view | `EmptyState` | `…/empty-state` |
| Tabs | `Tabs` | `…/tabs` |

Desktop overlays: Compass ships `Modal`, `Tooltip`, `PopoverMenu`, `TourPoint`, `ProfilePopover`, but **consumers do not use them yet** — keep host overlays unless explicitly adopting.

Large chrome often lives in **proto** (never a product dependency) — e.g. `ChannelsSidebar`, `TeamSidebar`, `GlobalHeader`, `AdminConsoleSidebar`, hardcoded `*Menu` recipes, `ChannelShell`, `Mobile*`, Call*. Decompose to ui leaves (`ChannelSidebarItem`, `MenuItem`, `PopoverMenu`, …) + host layout. Always `ls` the consumer’s installed ui; alphas differ.

## Example prompt shape

> Create a System Console page under \<category\> named \<name\>. Access: \<rules\>. Prototype: \<URL\>. Use prototype-to-production / Compass ui.

Or in a plugin repo:

> Implement this prototype in the Playbooks RHS: \<URL\>.
