# Shot List — "The Team, Updating the Site" (v1)
For production/mockup planning. Cross-referenced to script beats discussed in chat.
Reuses the component library built for "Human + Machine, On the Same Team" v5
(`mattermost-proto-playground`, branch `cursor/agents-vision-prototype-c820`, PRs #62/#68).

**Build status key:** ✅ Built · 🔶 Partial / needs work · ⬜ Not built
**Last audited:** 2026-09-22 — All 20 surfaces complete. Act 5 handled as a dedicated `docs-outage` scene (DocsIncidentChannel) with full playbook RHS; agent-assigned task rows confirmed working.

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
| ✅ | `#docs-site` main channel view | `DocsChannelHome.tsx`, `ChannelIntro.tsx` | `#docs-site` is live with pre-seeded history scroll-back (`DOCS_HISTORY_ENTRIES`). |
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
| ✅ | Delegation tracker card, two rows running at once | `AgentParallelTrackerCard.tsx` | Built — staggered pulse dots per row while running, check-circle icon when done, rolls up to "N of N passed" header. |

### 4.2 — Alex approves the PR
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | GitHub PR card, approve action | `GitHubPrCard.tsx` | Required gate: the PR cannot merge without Alex's explicit approval. Approve action already present on the card (built for Alex's equivalent approval in the prior script). Now follows Coder's CI-passing report in 4.1 rather than appearing with no lead-in. |

### 4.3 — Jordan approves via embedded live preview
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | Minimized preview card, inline in post | `DocsPagePreviewCard.tsx` | Built — scaled iframe thumbnail + title/subtitle + Approve/Reject actions + expand icon. Approved state shows "Approved by Jordan" label in place of actions. |
| ✅ | Expanded full-screen/larger preview window | `DocsPreviewPopout.tsx`, `/agents-docs-preview` route | Built — full docs.mattermost.com simulation (sidebar nav, TOC, page content with SAML section); opens via `window.open` at 960×700 from the card's expand button. |
| — | — | — | Confirmed sequence: this pair **is** the final content approval gate — Jordan approves from either state, on the combined staging preview (content + component together), and that approval is what triggers the actual publish/deploy in 4.4. |

### 4.4 — Coder deploys; dissemination
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | Publish/deploy confirmation | `DocsInlineDelegation` with `PROD_DEPLOY_THINKING` steps | Built — Coder deploy uses `DocsInlineDelegation` with merge/deploy/verify-live thinking steps; `deploySettled` state fires on completion and reveals Matty's follow-up. |
| ✅ | Announcement post | `DOCS_MSG_MATTY_ANNOUNCE` + `DOCS_MSG_PRIYA_POSTS` in channel data | Built — Matty posts draft announcement text ("Page is live. Here's a support team announcement you can send…"); Priya's follow-up message: "Sent to the support team channel." Emma reacts. "Matty drafts, human sends" pattern is present. |
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
| ✅ | Playbook auto-start + RHS checklist | `DocsIncidentChannel.tsx` — dedicated `docs-outage` scene | Built as a standalone scene (scene id `docs-outage`, label "Docs Site Outage") showing the INC-4472 channel immediately after Monitor triggered the run. RHS is always-open with full playbook structure: View timeline btn, attributes block (Status/Severity/Assignee/Participants), Update due in box, 4-stage checklist (Triage ✓ / Investigation active / Resolution upcoming / Communication upcoming), 12 tasks with descriptions. Playbook name = "Website outage"; header title = "INC-4472: Docs site outage". |

### 5.3 — Task assigned to Coder
| Status | Screen | Component(s) | On-screen content needed |
|---|---|---|---|
| ✅ | Task rows in RHS show agent avatar chips as assignees | `DocsIncidentChannel.tsx` checklist tasks | Confirmed — each task uses `Chip` with `leadingAvatar` sourced from `agentAvatarChipSrc(shape, color)` for Monitor, Coder, and Matty; Priya's human avatar also works in the same row. Agent-as-assignee and human-as-assignee coexist in the same checklist card without any gaps. |

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
13. ✅ `DocsChannelHome` / `ChannelIntro` — `#docs-site` with new scroll-back history — done
14. ✅ `PlaybookRunRhs` task-list rows — agent avatar as assignee confirmed working; `DocsIncidentChannel` uses `agentAvatarChipSrc` chips for Monitor, Coder, and Matty alongside human avatars in the same lists

**Genuinely new builds:**
15. ✅ **Parallel delegation tracker card** — `AgentParallelTrackerCard.tsx`; staggered pulse rows + "N of N passed" rollup — done
16. ✅ **Embedded staging preview — minimized card** — `DocsPagePreviewCard.tsx`; scaled iframe + approve/reject + expand — done
17. ✅ **Embedded staging preview — expanded/full-screen view** — `DocsPreviewPopout.tsx` at `/agents-docs-preview` route — done
18. ✅ **Publish/deploy confirmation state** — `DocsInlineDelegation` with `PROD_DEPLOY_THINKING` steps (merge, deploy, verify live); `deploySettled` triggers Matty's follow-up
19. ✅ **Announcement/dissemination post** — Matty posts draft; Priya posts "Sent to the support team channel."; Emma reacts — done
20. ✅ **Agent-initiated playbook auto-start** — `DocsIncidentChannel.tsx`, scene id `docs-outage`; full INC-4472 channel with 4-stage/12-task playbook RHS, attributes block, update-due-in, and view timeline; playbook = "Website outage"

**Deferred / optional upgrade (not in scope unless requested):**
- **True diff view** for Writer's rewrite — moderate lift (diff library + new rendering); the plain Markdown artifact above covers the beat without it.

**Total: 20 distinct surfaces. As of 2026-09-22: 20/20 done.**

---

## Notes

- **All 20 surfaces are built.** The prototype is complete for demo purposes.
- **Act 5 auto-start is a snapshot, not a live transition.** `DocsIncidentChannel` renders the INC-4472 state after Monitor has already started the run — navigating to the `docs-outage` scene is the stand-in for the auto-trigger moment. If a live animated transition from the `later-that-week` scene into the INC-4472 channel is needed for a future cut, that would be net-new work.
- **`DocsIncidentChannel` playbook = "Website outage".** RHS header title = `"INC-4472: Docs site outage"`; `secondaryTitle` = `"Website outage"`. This differs from agents/INC-4471 where the header reads `"Run details"`.
- **Reuse carries old naming in the codebase.** Component names (`AgentApprovalCard`, `AgentInviteCard`, etc.) still reference Sentinel/Otto/Cipher/Dynamo internally. On-screen copy is correct for the demo; internal names are fine to leave as-is unless the code is extended.
