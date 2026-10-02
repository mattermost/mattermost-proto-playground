# Shot List — "The Team, Updating the Site" (v1)
For production/mockup planning. Cross-referenced to script beats discussed in chat.
Reuses the component library built for "Human + Machine, On the Same Team" v5
(`mattermost-proto-playground`, branch `cursor/agents-vision-prototype-c820`, PRs #62/#68).

**Build status key:** ✅ Reusable as-is or with rename only · 🔶 Reusable, needs adaptation · ⬜ New, not built

---

## Cast & Setting

- **Emma** — Support lead (human) — flags the problem
- **Priya** — PM (human) — makes the plain-language ask
- **Jordan** — Docs owner (human) — content approver
- **Alex** — Engineer (human) — code approver
- **Matty** — Orchestrator agent (existing, standing coordinator — same character as prior script)
- **Writer** — Content drafting/publishing specialist
- **Reviewer** — Proofreading specialist (grammar, style, broken links — not UX/architecture judgment)
- **Coder** — Research (product/implementation inspection) + layout/component-build + deploy specialist
- **Monitor** — Uptime/monitoring specialist, appears only in Act 5

**Setting:** `#docs-site`, an established channel. **Scenario:** the onboarding page's SSO section is stale; the team fixes it together, and along the way builds a reusable page component.

---

## Act 1 — Trigger & Ask

### 1.1 — Emma flags the problem
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| 🔶 | `#docs-site` main channel view | `ChannelsHome.tsx`, `ChannelIntro.tsx` | Repurpose the `ChannelsHome` shell (was `#service-status`) as `#docs-site`. Needs new pre-seeded scroll-back so the channel reads as lived-in — docs/site chatter, not empty. |
| ✅ | Emma's flag — plain human message | `Message`/`MessageInput` (compass-proto) | Decided: Emma's post is a normal human message, not a webhook card — she's raising a concern, not reporting an automated event. `WebhookPost.tsx` stays in reserve for other automated-trigger moments elsewhere in the demo where an actual system event fires (not used in this beat). |

### 1.2 — Team beat (humans only, no agent yet)
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | Thread reply under Emma's post | `Message`/`MessageInput` (compass-proto), `ComposerShell.tsx` | Priya replies to Emma; Jordan chimes in agreeing to loop in Matty. Pure human-to-human — no agent components needed. |

### 1.3 — The ask
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | Same thread, @-mention | `MentionMessageInput.tsx` | Priya tags Matty in plain language. Mention-chip and invite-out-of-channel-agent flow already built (from Act 1.3 commit "invite-by-mention flow"). |

---

## Act 2 — Grounding & Informed Rewrite

### 2.1 — Delegation to Coder (research)
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | "Matty sent a message to Coder" notice + DM panel | `MattyDelegationDM.tsx` | Directly reusable — this component already renders exactly this handoff pattern (was Matty→Sentinel). Rename target agent only. |
| ✅ | Coder's research report | `MarkdownArtifactRhs.tsx` | Decided: this is a larger finding, not a quick note — reuse `MarkdownArtifactRhs` (was Cipher's root-cause report) for Coder's SSO research writeup, opened as its own RHS panel. |

### 2.2 — Delegation to Writer (informed rewrite)
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | Matty's confirmation check | `AgentPost` + inline action (e.g. `AgentApprovalCard`-style yes/no) | New beat: before delegating, Matty asks in-thread — "Want me to loop in Writer to make the copy changes?" — and a human confirms. Reuses the existing approval/confirmation card pattern rather than a silent auto-delegate. |
| ✅ | Second delegation notice/DM | `MattyDelegationDM.tsx` | Same component, second use — Matty→Writer instead of Matty→Coder. Now follows the confirmation above rather than firing automatically. |
| ✅ | Writer's proposed rewrite | `MarkdownArtifactRhs.tsx` | Decided: a Markdown artifact of the proposed text changes, same component as Coder's research report. Simple, reuses what's built. |
| ⬜ *(optional upgrade)* | True diff view (line-level additions/deletions highlighted) | New: needs a diff library (e.g. `diff`) + new rendering | Not the default — moderate lift, not huge. Worth doing later if you want the extra polish; the plain Markdown artifact above ships the beat without it. |

### 2.3 — *(folded into 3.2)*
Jordan's reaction to Writer's draft now happens together with her spotting the component gap — one combined human beat rather than two separate ones. See Act 3.2.

---

## Act 3 — The Catch & Component Build

### 3.1 — Reviewer's proofread pass (peer message to Writer)
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | Reviewer → Writer, visible peer message | `MattyDelegationDM.tsx` shell, reused for a non-Matty pairing | Revised: staged as a direct Reviewer→Writer exchange (reusing the same delegation-DM visual language, just peer-to-peer) rather than a post into the channel — makes agent-to-agent coordination visible without Matty mediating. Scope unchanged: proofreader only — grammar, typos, style, broken links. Comes back clean. |

### 3.2 — Human beat: Jordan spots the UX gap
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | Thread reply | `Message`/`MessageInput` | Jordan reacts to Writer's draft (folding in the old 2.3 beat) and separately notices the new SSO steps really need a **reusable collapsible section component** — a human observation about page structure, not something Reviewer would plausibly catch. Proposes it in-thread. |

### 3.3 — Delegation to Coder (component build)
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | Delegation notice/DM (third use) | `MattyDelegationDM.tsx` | Reused again — Matty (or Priya/Jordan directly) → Coder for the build task, triggered by Jordan's suggestion above rather than Reviewer's flag. |
| ✅ | Coder's PR card | `GitHubPrCard.tsx` | Built for exactly this (was Dynamo's fix PR). Rename authorship/title only: "Add reusable collapsible section component." |
| ✅ | Code preview | `CodeSnippet.tsx` | Decided: include it — a quick code snippet before the full PR card is a nice concrete beat for the demo, showing Coder's actual work rather than jumping straight to the PR summary. |

### 3.4 — Human beat: Jordan checks with Alex
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | Thread reply | `Message`/`MessageInput` | Jordan asks Alex whether the new component affects content flow; Alex replies. Plain human exchange. |

---

## Act 4 — Approval & Publish

### 4.1 — Parallel delegation tracker: Coder's CI check + Reviewer's page check
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ⬜ | Delegation tracker card, two rows running at once | New: no equivalent exists | **Genuinely new component**, styled after Claude Code's subagent UX — a single card posted by Matty with a live status row per task ("Coder: running CI checks on the merged PR" / "Reviewer: checking the combined page"), both shown running together rather than as two separate sequential posts. Rolls up to "2 of 2 passed" once both finish. Needs a visual treatment (sync pulse, shared "N running" counter) that actually reads as parallel, not just labeled as parallel — the same problem flagged in the v5 script's Act 3.2 for its Alex+Dynamo / Jordan+Otto threads. This is the demo's one explicit parallel-delegation moment; deliberately built from two checks that were already independent rather than inventing new work elsewhere. |

### 4.2 — Alex approves the PR
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | GitHub PR card, approve action | `GitHubPrCard.tsx` | Required gate: the PR cannot merge without Alex's explicit approval. Approve action already present on the card (built for Alex's equivalent approval in the prior script). Now follows Coder's CI-passing report in 4.1 rather than appearing with no lead-in. |

### 4.3 — Jordan approves via embedded live preview
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ⬜ | Minimized preview card, inline in post | New: no equivalent exists | **Biggest net-new build (part 1).** A compact card in the channel post — thumbnail/summary of the staged page, with approve/reject actions directly on the card and an "expand" action. Closest relatives (`AgentPlaybookPreview.tsx`, `MarkdownArtifactRhs.tsx`) preview *artifacts*, not a rendered page, so this is new. |
| ⬜ | Expanded full-screen/larger preview window | New: no equivalent exists | **Biggest net-new build (part 2).** Opened from the card's expand action — a larger or full-screen live, scrollable render of the staging page for closer inspection before approving. Visual reference: this will likely resemble the real docs site at https://docs.mattermost.com/ — detailed design guidance on the exact look/layout to come separately. |
| — | — | — | Confirmed sequence: this pair **is** the final content approval gate — Jordan approves from either state, on the combined staging preview (content + component together), and that approval is what triggers the actual publish/deploy in 4.4. |

### 4.4 — Coder deploys; dissemination
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ⬜ | Publish/deploy confirmation | No direct equivalent | Following Jordan's approval in 4.3 and Alex's merge in 4.2, **Coder** deploys — it already owns the PR/merge/CI mechanics from 3.3 and 4.1, so pushing the combined change (component + approved content) live is a continuation of its work, not a new agent's job. Writer's part ended at the approved draft; it doesn't deploy anything itself. Needs a visible "publishing... → live" state, not an instant cut. |
| ⬜ | Announcement post | No direct equivalent | Matty drafts a short announcement; Priya edits and posts, tagging the support team. Likely just `MentionMessageInput` + `ComposerShell` with new copy — low build cost, but the "Matty drafts, human sends" pattern itself hasn't been shown before. |
| ✅ | Emma's reaction | `ReactionsRow` (compass-ui, already migrated from `MessageReactions`) | Already built and in use. |

---

## Act 5 — Later That Week *(short, deliberately unresolved coda — not a full incident)*

### 5.1 — Webhook trigger
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | Automated uptime-failure post | `WebhookPost.tsx` | First actual use of `WebhookPost` in the script — held in reserve since Act 1.1, where Emma's flag was deliberately a plain human message instead. This is the genuine automated-system-event case it was built for. |

### 5.2 — Monitor auto-starts a Playbook
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ⬜ | Playbook auto-start + RHS checklist opens | `PlaybookRunRhs.tsx` (existing), but the **auto-trigger-by-agent mechanic is new** | Reuses the existing Playbook RHS panel visually, but nothing in the library shows an agent initiating a playbook run without a human click — v5's 2.1 had Priya click "Start Playbook" explicitly. This needs a scripted/simulated auto-start state, not just reusing the panel as-is. |

### 5.3 — Task assigned to Coder
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ⬜ | Task row in RHS shows an agent as assignee | `PlaybookRunRhs.tsx` task-list rows — needs confirming they support an **agent avatar as assignee**, not just human avatars | This is the actual point of the whole act: playbook tasks assigned to agents, not only people. If the existing task-row component only supports human assignee avatars, this is a small but real UI gap to check before assuming reuse. Scene ends here — no investigation, fix, or resolution shown. |

---

## Appendix 1+2 — Matty's Floating Presence → Dedicated Agents View

| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | Floating icon + slide-in panel | `MattyFab.tsx`, `MattyPanel.tsx` | **Already fully built** — this is the exact component pair for Matty's floating presence. No new work needed beyond scripting which channel/context it appears in. |
| ✅ | "Open full view" escalation | `AgentsContext.tsx` routing, `AgentsShell.tsx` | Escalating from panel to full dedicated view is a routing/state concern already supported by the shared Agents context. |
| ✅ | Dedicated Agents view, personal chat | `AgentChat.tsx` | Existing 1:1 chat surface. |
| ✅ | Calendar OAuth flow | `AgentToolConnectCard.tsx`, `AgentToolAuthCard.tsx` | Built for exactly this (fake OAuth, status steps, streaming connect state). |
| ✅ | Multiple concurrent chat threads | Nested sessions in `AgentsContext.tsx` / LHS | Built — "Nest agent chat sessions in the LHS and add empty-chat state" commit. |

---

## Appendix 3 — All Agents View

| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | First-time "meet your first agent" | `AgentsLanding.tsx` | Built — Matty card + "Create your own" card, FTE agent shelf carousel. |
| ✅ | 1:1 chat with Coder directly | `AgentChat.tsx` | Same chat surface, different agent — no new build. |
| ✅ | "Your agents" / "All agents" tabs | Existing tab component (already built) | Corrected: tabs already exist in the prototype — no new UI needed, just confirming the roster data feeding "Your agents" vs. "All agents" matches this scenario's cast. |
| ✅ | Agent profile popover (owner/description) | `AgentProfilePopover.tsx` | Built — opens from chips and chat avatars already. |

---

## Appendix 4 — Creating a New Agent

| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | New Agent modal, chat-guided build | `NewAgentModal.tsx` | Built — appearance (shape × color), name, purpose flow. |
| ✅ | Agent settings, modal/UI mode | `AgentSettingsModal.tsx` + `AgentSettingsKnowledgePanel.tsx`, `AgentSettingsToolsPanel.tsx`, `AgentSettingsTasksPanel.tsx`, `AgentSettingsAdvancedPanel.tsx` | Fully built — Knowledge/Tools/Tasks/Advanced tabs already shipped. |
| ✅ | PDF → playbook artifact flow | `AgentArtifactCard.tsx`, `AgentPlaybookCard.tsx`, `AgentPlaybookPreview.tsx`, `PlaybookRunRhs.tsx` | Built — this is the exact "attach PDF, get playbook artifact, save to Playbooks" flow from the prior script's 1.4 scene. Only the new agent's name/purpose changes. |

---

## Appendix 5 — GM with Multiple Agents *(lowest priority)*

| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | Group-chat creation with agents | `NewAgentGroupChatModal.tsx` | Already built and scaffolded — "Add invite-by-mention flow... group-chat create" commit. |

---

## Consolidated Asset List
*Every distinct screen/surface needed, sorted by build status.*

**Fully reusable (rename/copy only):**
1. `MattyDelegationDM` — used 4× in the main scene: 3 hub delegations (Matty→Coder, Matty→Writer, →Coder again) + 1 peer-to-peer reuse (Reviewer→Writer in 3.1)
2. `GitHubPrCard` — Coder's component-build PR + Alex's approval
3. `MattyFab` / `MattyPanel` — floating Matty, Appendix 1+2
4. `AgentToolConnectCard` / `AgentToolAuthCard` — Calendar OAuth, Appendix 1
5. `AgentsLanding` — first-time agent meet, Appendix 3
6. `AgentProfilePopover` — Appendix 3
7. `NewAgentModal` + full `AgentSettings*Panel` set — Appendix 4
8. `AgentArtifactCard` / `AgentPlaybookCard` / `AgentPlaybookPreview` / `PlaybookRunRhs` — Appendix 4's PDF→playbook flow
9. `NewAgentGroupChatModal` — Appendix 5
10. `MarkdownArtifactRhs` — used 2× (Coder's SSO research report, Writer's proposed rewrite)
11. "Your agents" / "All agents" tabs — already built in the prototype, just needs correct roster data for this scenario's agents
12. `WebhookPost` — finally used, Act 5.1's outage trigger (held in reserve since Act 1, now has an honest use)

**Needs moderate adaptation:**
13. `ChannelsHome` / `ChannelIntro` — repurpose `#service-status` chrome as `#docs-site`, new scroll-back content
14. `PlaybookRunRhs` task-list rows — needs confirming they support an agent avatar as assignee, not just human avatars (Act 5.3)

**Genuinely new builds:**
15. **Parallel delegation tracker card** — Matty's two-rows-running-at-once card in 4.1 (Coder's CI check + Reviewer's page check); styled after Claude Code's subagent UX; supersedes the earlier plan to extend `GitHubPrCard` with a CI sub-state, since the checks-passing signal now lives on the tracker card instead
16. **Embedded staging preview — minimized card** — inline in the post, approve/reject actions + expand control; the biggest net-new component, nothing in the library previews a live page rather than an artifact
17. **Embedded staging preview — expanded/full-screen view** — opened from the card, larger live render for closer inspection before approving
18. **Publish/deploy confirmation state** — the "publishing... → live" transition, owned by Coder (it already has the PR/merge/CI mechanics from 3.3/4.1); no direct equivalent, though it's in the same spirit as Otto's merge/deploy beat from the prior script
19. **Announcement/dissemination post** — low build cost (likely just composer + new copy), but the "agent drafts, human sends" pattern is new
20. **Agent-initiated playbook auto-start** — Act 5.2; the RHS panel itself is reused, but nothing in the library shows a playbook starting without a human click (v5's 2.1 had Priya click "Start Playbook" explicitly)

**Deferred / optional upgrade (not in scope unless requested):**
- **True diff view** for Writer's rewrite — moderate lift (diff library + new rendering); the plain Markdown artifact above covers the beat without it.

**Total: 20 distinct surfaces — 12 fully reusable, 2 needing adaptation, 6 new — plus 1 deferred (diff view). WebhookPost is no longer held in reserve — it has an honest use in Act 5.**

---

## Flags for Whoever Builds This

- **Biggest net-new item is the embedded staging preview, now two states (#16 minimized card, #17 expanded view) — closely followed by the parallel delegation tracker (#15), also genuinely new.** Everything else in the main scene has a close or exact match in the existing library. Worth prioritizing design passes on both since they're the newest builds and carry the most narrative weight (the tracker proves real parallel delegation; the preview proves the docs-vs-code stakes asymmetry).
- **The tracker card (#15) needs its "running together" treatment designed deliberately** — a static list of two rows reads as sequential, not parallel, unless there's a visual cue (sync pulse, shared counter) that says otherwise. This is the same problem the v5 script flagged for its own parallel-thread scene and never fully resolved.
- **`PlaybookRunRhs`'s agent-as-assignee support (#14) needs a quick check before Act 5.3 is scripted further** — if task rows currently assume a human assignee, this is more than a rename job.
- **Act 5's auto-start mechanic (#20) is a genuinely new interaction pattern**, not just a new visual — worth a design conversation on what "an agent starts a playbook with no human click" actually looks like in terms of confirmation/undo, since it's a bigger trust step than anything else in either script.
- **MattyDelegationDM's peer-to-peer reuse (Reviewer↔Writer in 3.1) needs a quick UI check** — the component was built for Matty-as-hub delegations; confirm it reads sensibly with two non-Matty agents as the pair before assuming it's a pure rename job.
- **WebhookPost's reserve status is resolved — it's in active use now.** Act 1.1 confirmed a plain human message for Emma's flag; Act 5.1 gives the component its genuine automated-trigger use case.
- **Reuse carries old naming in the codebase.** Component names (`AgentApprovalCard`, `AgentInviteCard`, variable names inside `MattyDelegationDM`, etc.) still reference Sentinel/Otto/Cipher/Dynamo internally. Renaming on-screen copy is enough for the demo, but worth a note if this code is ever extended past this video.
