# Shot List — "Human + Machine, On the Same Team" (v4)
For production/mockup planning. Cross-referenced to script scene numbers.

---

## Act 1 — Meet the Team

### 1.1 — Building Sentinel
| Screen | On-screen content needed |
|---|---|
| Main channel view, `#service-status` | Active, lived-in channel with a scroll-back of historical alerting webhook posts from various monitored systems (PayForge among them) — establishes this channel already exists as the team's real status feed, not a fresh empty room. Priya + Jordan present. **Matty is already present and available** — implies Matty pre-exists as a standing/default coordinator, not something Priya builds. |
| Chat with Matty (DM or in-channel) | Priya asks Matty to create a monitoring agent. Matty creates it in the background and replies with a link/reference to the new agent — name: **Sentinel** · description: *"Watches error rates and flags anything that could affect customers"* · source connections: reliability team channels/docs. |
| Agent settings/profile review screen | Priya opens Sentinel's settings page to review before approving — name, description, and source-connection list all visible and editable. |
| Approval action | Priya approves from this settings screen. |
| Confirmation card/message, main channel | Sentinel is added to `#service-status` on approval. Preview text: *"Sentinel will have context from 47 past incidents and 12 runbooks."* |

### 1.2 — Roster pan
| Screen | On-screen content needed |
|---|---|
| Channel member list / roster sidebar | **Jordan Lee, Emma Novak, Darius Cole, Priya Shah** (humans) · **Matty** — Coordinator tag · **Sentinel** — Monitoring tag. 6 members total at this point. |

### 1.3 — *(moved — see Act 2, Scene 2.2)*
Matty suggesting Otto now happens inside the playbook-run/incident channel, not the pre-incident alerting channel. Content moved below.

### 1.4 — PDF → Playbook
| Screen | On-screen content needed |
|---|---|
| Main channel → DM transition | Priya switches out of `#service-status` into a personal DM with Matty |
| DM/chat view, Priya + Matty | Priya states her intent: something like *"Can you help me turn an old checklist I've used in the past into a playbook?"* |
| DM/chat view, Priya + Matty | Priya drags in the file: attachment thumbnail for **Legacy_Incident_Checklist.pdf** appears in the compose box |
| DM/chat view, Priya + Matty | Matty reads the attachment and replies in chat — a short response confirming it can turn this into a runnable playbook |
| DM/chat view, Priya + Matty | Follow-up post: a compact **card preview** of the playbook (title, stage count, task count at a glance — not the full editable view) |
| RHS (right sidebar) — auto-opens | The full playbook artifact opens automatically alongside the chat, ready to save. Needs to show at least: a stage titled something like **Resolution — Deployment** containing **Roll back deployment** and **Verify deployment health** |
| DM/chat view, Priya + Matty | Matty proactively suggests where agents could be assigned — e.g. *"The deployment tasks look like a fit for Otto, if you want to assign it now."* Priya agrees. |
| RHS — Playbook draft, updated state | Same two tasks now showing **Otto** as assignee (avatar/tag) |
| Main channel or DM | Matty's confirmation post: *"Saved playbook 'Incident Response Checklist v1'"* |

---

## Act 2 — The Incident Ignites, the Team Assembles

### 2.1 — Detection, ticket, playbook kickoff
| Screen | On-screen content needed |
|---|---|
| Time-jump transition | *"A few days later"* — or similar cut treatment, signaling this is a new day, not a continuation of Act 1 |
| Main channel view | A **PayForge** webhook post arrives, distinct from the historical/routine webhook traffic seeded in 1.1 — this one signals an actual issue |
| Main channel view | Sentinel notifies Priya — a mention/alert directed at her specifically |
| Jira ticket card (embedded in channel) | Sentinel posts the ticket card/link directly in-channel as part of the notification — *"Opened INC-4471: Checkout failures during peak traffic."* |
| Main channel view | Sentinel's impact card: affected services list, error-rate %, small chart/sparkline |
| Main channel view | **Matty** posts a follow-up message with a prompt/card — something like *"Ready to start the Incident Response playbook for this?"* with a **Start Playbook** button |
| Main channel view | Priya clicks **Start Playbook** on the card |
| Main channel view | Matty shows visible thinking/creating status indicators (e.g. a processing or "building..." state) before anything appears — no instant result |

### 2.2 — Playbook run assembles the team
| Screen | On-screen content needed |
|---|---|
| Main channel view | Matty's post starting the playbook run — this is the new, dedicated incident channel created from Priya's click in 2.1 |
| New incident channel | Agent-to-agent message styling — **Sentinel → Cipher:** *"Signature doesn't point to one cause cleanly. Can you dig in?"* — needs a visual treatment distinct from human messages, small "→" or agent-badge convention |
| Playbook run RHS panel (open) | The Diagnosis stage's task shows **Cipher** as the assigned agent, working it live — this is how Cipher's addition to the effort is shown, not a channel member list update |
| New incident channel | Cipher's finding post: *"Root cause: build 8842 changed how we handle PayForge webhook events, deployed at T+0 — matches error onset exactly."* |
| Jira ticket view (external or embedded comment) | Cipher's comment added directly to INC-4471, same finding text |
| Main channel view (incident channel) | Matty's message: *"If this ever turns into a deployment issue, you'll want Otto in here — it's been running the platform team's rollbacks and deployments for months, which will be useful for getting to a resolution."* — suggested here, in the actual incident, not pre-emptively before anything happened |
| Suggestion card, main channel | Matty's suggestion arrives as a card — Otto's name, **Deployment** tag, *"Managed by Platform team"* badge, and a quick **Add** button, rather than Jordan searching manually in an Add People dialog |
| Playbook run RHS panel, updated | Deployment-tasks stage now shows **Otto** as assignee (already pre-assigned from 1.4, now visibly active) · a task in the Resolution stage shows **Alex** and **Dynamo**, added because Cipher's finding implicates the PayForge handler code — task assignments carry the "who joined and why" information here, not a separate member-list callout |

### 2.3 — Triage split
| Screen | On-screen content needed |
|---|---|
| Main channel view | Matty posts a brief triage summary — something like *"Splitting this into two workstreams."* |
| Main channel view | Matty **creates two separate coordination threads**, each opened with its own starter message — Thread 1: *"Alex + Dynamo: the PayForge webhook handler itself"* · Thread 2: *"Jordan + Otto: infra and rollback path"* — Priya is added to both, coordinating across them rather than owning a thread herself |
| Thread indicators | Two distinct thread entries visible under Matty's posts, each already named/scoped rather than being generic reply counts |

---

## Act 3 — Parallel Threads

### 3.1 — Thread 1 (Alex + Dynamo, code) — continuing the thread Matty created in 2.3
| Screen | On-screen content needed |
|---|---|
| Thread view | Alex posts into the existing thread: *"Find where our PayForge webhook handling changed in the last deploy."* |
| Code diff view (embedded or linked GitHub file) | Diff from build 8842, highlighting the regression |
| Thread view | Dynamo's proposed fix, inline |

### 3.2 — Thread 2 (Jordan + Otto, infra) — continuing the thread Matty created in 2.3, concurrent with 3.1
| Screen | On-screen content needed |
|---|---|
| Thread view (separate from 3.1) | Jordan posts into the existing thread: *"What's our rollback readiness if the code fix doesn't land in time?"* |
| Thread view | Otto's status report: rollback staged, timestamped |
| **Layout note:** | Needs a split-screen or fast-interleave treatment with 3.1 to sell "simultaneous," not sequential — flag for editor/storyboard artist |

### 3.3 — Thread 3 (Priya + Dynamo) — the payoff beat
| Screen | On-screen content needed |
|---|---|
| Thread view (separate from 3.1, same agent) | Priya: *"Does this bug also affect refunds?"* |
| Thread view | Dynamo's correct, contained answer — no reference to Alex's concurrent thread |
| **Layout note:** | Consider showing 3.1 and 3.3 side-by-side or in quick cross-cut to visually prove clean separation between two humans talking to the same agent |

### 3.4 — Convergence
| Screen | On-screen content needed |
|---|---|
| Main channel view | Alex + Dynamo's "fix ready" post · Jordan + Otto's "rollback on standby, unused" post |
| Main channel view | Priya's synthesis: *"Let's ship the fix directly — we know the cause, no need to roll back."* |

---

## Act 4 — Review and Resolution

### 4.1 — PR and review
| Screen | On-screen content needed |
|---|---|
| GitHub PR card (embedded in Mattermost) | Title: *"Fix PayForge webhook handler regression."* · Author: Alex Rivera (via Dynamo) · Status: Awaiting review · Approve action visible |

### 4.2 — Deploy and confirm
| Screen | On-screen content needed |
|---|---|
| Main channel view | Otto's merge/deploy confirmation |
| Main channel view | Sentinel's recovery confirmation (error rates dropping) |
| Jira ticket card | Status updated to **Resolved**, linked to the merged PR |

### 4.3 — Summary card
| Screen | On-screen content needed |
|---|---|
| Auto-generated summary card, main channel | *"Resolved in 12 minutes. Root cause: Cipher. Fix: Alex + Dynamo. Rollback standby: Jordan + Otto (not needed). Detection: Sentinel."* |

---

## Act 5 — Trust and Control

### 5.2 — Audit log
| Screen | On-screen content needed |
|---|---|
| Playbook run timeline | The native Playbook run's event timeline — task state changes, assignee changes, status updates — shown chronologically across the whole incident, with entries attributable back to which thread (3.1 vs 3.2 vs 3.3) generated them |

### 5.3 — Wrap-up and calendar
| Screen | On-screen content needed |
|---|---|
| Main channel view | Matty's wrap-up summary post |
| Calendar event card (embedded) | *"Postmortem: INC-4471, Thursday 2pm. Invited: Priya, Jordan, Alex."* |

---

## Closing Frame
| Screen | On-screen content needed |
|---|---|
| Main channel view, full sidebar | All 8 members visible: Priya, Jordan, Alex (humans) · Matty, Sentinel, Otto, Dynamo, **Cipher** (agents — Cipher shown slightly greyed/inactive to signal it's not always present) |
| Main channel view | Two resolved thread icons still visible under the old triage message |
| Playbook timeline | Scrolling in background, interleaved multi-thread entries (reuse 5.2 asset) |

---

## Consolidated Asset List
*Every distinct screen/surface type needed across the whole demo, for planning how many mockups to build.*

1. **Main channel view** (`#service-status`) — reused constantly; needs multiple states as the roster/member count grows (4 → 5 → 7 → 8 members) and as posts accumulate. Baseline state (1.1) needs pre-seeded scroll-back of historical webhook alerts from various systems, PayForge included, so the channel reads as an established status feed rather than a fresh room.
2. **Channel member list / roster sidebar** — 4 distinct states (1.2 baseline, 1.3 +Otto, 2.1 +Cipher, 2.2 +Alex/+Dynamo, Closing +full roster)
3. **Agent-creation-via-Matty flow** — 1.1 only, now three distinct screens: chat request/creation reference, agent settings/profile review page, and approval action — needs design decisions on all three, especially the settings-review page since it doesn't exist as a described surface anywhere else
4. **Suggestion card with quick-add button** — replaces the old Add People dialog entirely, since Otto (and by the same convention, potentially other agents) now get proposed via a card Matty posts rather than a human searching manually. One state, used in 2.2.
5. **RHS panel** — 2 states: playbook auto-opened (initial, full editable artifact), playbook updated (Otto assigned). No longer needs a separate PDF-preview state — the PDF stays in the chat as an attachment, and the RHS goes straight to the generated artifact.
6. **In-chat card preview** — new surface, one state: compact playbook summary card (title, stage/task counts) posted before the RHS auto-opens
7. **Jira ticket card/view** — 3 states: opened (2.1), commented (2.1), resolved (4.2)
8. **Agent-to-agent message styling** — needs its own visual treatment, used in 2.1 (Sentinel→Cipher); reused conceptually if agent-to-agent messaging appears elsewhere
9. **Playbook run RHS panel** — 2 states in 2.2 (Cipher assigned to the Diagnosis task; Otto/Alex/Dynamo assigned across Deployment and Resolution tasks) — this is now where agent assignment is shown, replacing the earlier single in-channel checklist widget and the channel-member-list-update pattern
10. **Thread view** — 3 distinct threads needed (3.1, 3.2, 3.3), each with 2+ messages
11. **Code diff view** — one state, 3.1
12. **GitHub PR card** — one state, 4.1
13. **Playbook run timeline** — one state, reused in 5.2 and Closing. Native Playbooks feature, not an invented compliance view — worth confirming this is a real Proven capability if you want to state it as such in the master script.
14. **Calendar event card** — one state, 5.2 (renumbered from 5.3 now that 5.1 is cut)
15. **Summary card** (auto-generated) — one state, 4.3

**Total distinct screens/surfaces: 15**, several with multiple states — worth confirming with whoever's building mockups whether reused surfaces (main channel, RHS, Jira) get built as one flexible template or as separate static frames per state.

---

## Flags for Whoever Builds This

- **Agent-to-agent message styling (#7)** doesn't exist as a described visual anywhere else in the script — needs a design decision before 2.1 can be mocked up.
- **Split-screen/simultaneity treatment (3.1–3.3)** is a directing choice, not just a screen to design — flagged in the script itself as needing storyboard input.
- **Cipher's "greyed out" closing-frame treatment** is the only place inactive-agent styling is mentioned — worth deciding if that's a real product pattern (agents can be "present but idle") or just a demo-only visual shortcut.
- **Master script inconsistency:** this shot list now has Priya asking Matty to create Sentinel in 1.1, which means Matty must already exist before Sentinel does — as a standing/default coordinator, not something built for this scenario. The master script (v4) still describes 1.1 as Priya using a manual creation panel, and introduces Matty in 1.2 as if newly noticed alongside Sentinel. These two documents now disagree on sequencing. Let me know if you want v4 updated to match — it's a small edit to 1.1/1.2, but it does shift the framing of "Act 1 — Meet the Team" slightly, since Matty would no longer be one of the agents the audience meets for the first time.
- **Two new humans, unclear role:** 1.2's roster now names **Emma Novak** and **Darius Cole** alongside Jordan Lee and Priya Shah, but neither appears anywhere else in the script — not in the Act 3 threads, not in the Closing Frame's headcount (which currently says "3 humans, 5 agents"). Worth confirming whether they're background/non-speaking roster members just for realism (a channel with only 2 people feels sparse for a real incident-response channel) or whether they need an actual beat somewhere, which would mean revising Act 3's thread assignments and the closing headcount to match.
- **Otto's timing moved:** Otto now joins during the incident (2.2), not pre-emptively in Act 1. This is a bigger change than it looks — the master script's cast list still describes Otto as "already in the channel from Act 1," and Act 3's parallel-threads structure (Jordan + Otto working infra) assumes Otto's already established and comfortable in the channel by the time the incident starts. Worth deciding whether that still reads fine with Otto joining moments earlier as part of the same channel-assembly beat, or whether it undercuts the "Otto's the one specialist that's been around" feeling the master script currently uses to make Act 3's infra thread feel earned.
- **Possible bigger change to 2.1/2.2, unconfirmed:** an earlier draft of the last review comment described Sentinel itself opening a dedicated incident channel and adding the necessary agents (Cipher, Otto, etc.) into it, tagging Priya as Incident Commander, and separately tagging Cipher for root-cause analysis in its own thread (with Cipher acknowledging — *"looking into it, will reply when done"* — before actually responding). That's a meaningfully different structure from what's built above: it would mean **Sentinel**, not Matty, does the channel-creation-and-agent-assembly work that 2.2 currently owns, and it introduces a two-step acknowledge-then-answer pattern for Cipher that isn't in the script anywhere else. I implemented the shorter, most recent version of the comment (webhook trigger, notification, pre-existing ticket) since it looked like a trim rather than an abandonment, but wanted to check before reassigning 2.2's core mechanic from Matty to Sentinel — that's a bigger structural move than a single-scene edit.
- **5.1 (model routing) cut entirely**, per your request. Worth noting for the master script, not just this shot list: that scene was flagged there as one of the strongest **Proven** claims in the whole demo (real today via the LiteLLM gateway) — cutting it means the demo no longer states outright that customers control which model runs each agent. If that claim matters for the workshop audience, it might be worth finding it a smaller mention elsewhere rather than dropping it completely; if it's fine to leave for a different setting, no action needed.
