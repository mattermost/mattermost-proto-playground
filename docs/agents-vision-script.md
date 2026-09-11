# Human + Machine, On the Same Team
### The Mattermost Agentic Vision
**Video Script & Storyboard — v5, Draft for Vision Workshop**
*Prepared for: Ian Tien & the Agents Team*

---

## The Thesis

The premise is straightforward: give people a roster of AI teammates — each with a name, a job, memory, and the ability to talk to each other and to the tools you already use — and they'll build actual workflows around it in weeks.

But most agent products today are fundamentally single-player: one person, directing a private fleet of bots. That's bot management, not team formation.

**Mattermost's advantage:** we never had to bolt teams onto our product. Channels are already the place multiple humans coordinate. This demo's job is to show that the same channel can hold multiple agents too — and, critically, that **several humans and several agents can all be working the same problem at once**, not funneled through a single operator.

### What Changed From v4

This pass folds in everything surfaced while building the production shot list — a lot of small, correct changes that add up to a more grounded script:

- **Matty is now a standing, pre-existing coordinator**, not something introduced alongside Sentinel. Priya asks Matty to build Sentinel; Matty creates it, and Priya reviews its settings and approves before it joins the channel.
- **The channel isn't empty at the start** — `#service-status` has a lived-in scroll-back of routine webhook alerts from various systems, PayForge among them, before anything goes wrong.
- **Two more humans** — Emma Novak and Darius Cole — round out the roster for realism. Their role beyond the roster pan is still open; see Open Questions.
- **Otto's invitation moved** out of Act 1 and into the actual incident (2.2) — Matty suggests it once the incident channel exists, not pre-emptively.
- **1.4 (the PDF-to-playbook scene) is more deliberate**: Priya explicitly steps into a private DM with Matty to do this work, states her intent, and Matty proactively suggests the Otto assignment rather than Priya having to think of it.
- **2.1 now ends on an explicit human decision point** — Matty prompts to start the playbook, Priya clicks a button, and Matty visibly thinks before anything happens.
- **The playbook run creates a dedicated incident channel**, not a continuation of `#service-status`. Cipher's analysis and the Otto/Alex/Dynamo assembly all happen inside it, and agent joins are now shown as task assignments in the playbook's RHS panel rather than channel-member-list updates.
- **2.3 has Matty actively creating two named, scoped threads** rather than posting one triage message with generic replies underneath.
- **Act 5's model-routing scene is cut.** In its place, the trust/control act now leads with the Playbooks run's native event timeline.

Auditor and Warden remain cut, as in v4 — see Open Questions for what that trade-off costs.

### Format & Runtime
- Target length: 2.5–3.5 minutes. This version adds several small beats (settings review, DM transition, explicit playbook-start click, named thread creation) on top of an already-ambitious v4 — runtime is very likely the tightest constraint in the whole script at this point. See Open Questions.
- Screen-capture demo style, minimal voiceover; on-screen callouts and visible agent-to-agent and human-to-agent messages do most of the explaining.
- One continuous product walkthrough inside a single scenario — no cutaways.

### Cast & Setting
- **Priya Shah** — Incident Commander (human), the protagonist
- **Jordan Lee** — Engineering Lead (human)
- **Alex Rivera** — Backend Engineer (human) — owns the payment/checkout codebase
- **Emma Novak**, **Darius Cole** — humans, present on the team's roster for realism (a two-person channel reads thin for a real incident-response team). Background presence only — no lines, no scenes, not part of the incident response.
- **Matty** — Coordinator agent. Pre-existing, standing — the front door and process-builder. Knows the roster, knows the playbooks, assembles the right team for the problem at hand.
- **Sentinel** — Monitoring specialist. Built by Priya (via Matty) in Act 1. Detects, alerts, opens the ticket.
- **Cipher** — Analysis specialist. Appears once: takes an ambiguous signal and turns it into a confirmed root-cause hypothesis.
- **Otto** — Deployment specialist (managed by the platform team) — joins during the incident, not before.
- **Dynamo** — Coding specialist. Works directly with engineers in their own threads.

**Setting:** `#service-status`, an established channel with routine history — plus a dedicated incident channel spun up mid-demo. **Scenario:** checkout failures during peak traffic, root cause a regression in the handler that processes **PayForge** (payment processor) webhook events.

---

## Act 1 — Meet the Team

*Building a new agent turns out to still be a conversation with an existing one — and not every teammate in the channel needs an introduction scene to matter.*

| Scene | Visual | VO / On-screen text | Note |
|---|---|---|---|
| 1.1 | `#service-status` is lived-in, not empty — its scroll-back shows routine webhook alerts from various monitored systems, PayForge among them, ordinary traffic nobody's worried about. Priya, Jordan, and the rest of the team are already here. So is **Matty** — not something anyone built, just the platform's standing coordinator. Priya messages Matty: *"Can you set up a monitoring agent for checkout errors?"* Matty creates it and replies with a reference to the new agent. Priya opens **Sentinel's** settings page to review before approving — name, description (*"Watches error rates and flags anything that could affect customers"*), and source connections (reliability team channels/docs) all visible and editable. Priya approves. Sentinel is added to the channel. Confirmation: *"Sentinel will have context from 47 past incidents and 12 runbooks."* | "Creating an agent doesn't mean opening an admin panel — it means asking someone who already knows the team, then reviewing what they built before it joins." | Matty pre-existing, rather than introduced here, is a deliberate change from earlier drafts — it means the audience never sees Matty "arrive," only sees it already capable. The settings-review step keeps a human sign-off in the loop even though the creation itself was conversational. |
| 1.2 | Camera pans the full roster: **Jordan Lee, Emma Novak, Darius Cole, Priya Shah** (humans), plus **Matty** (Coordinator) and now **Sentinel** (Monitoring). Six members total. | "Right now it's a small team. That's on purpose — the roster grows as the problem calls for it, not before." | Emma and Darius are background presence only, confirmed — they exist to make the roster read like a real team, not a two-person skeleton crew. No further appearance expected, so no need to account for them in Act 3 or the closing headcount. |
| 1.3 | Priya steps out of `#service-status` into a personal DM with Matty. She states her intent: *"Can you help me turn an old checklist I've used in the past into a playbook?"* She drags in a file — **Legacy_Incident_Checklist.pdf**. Matty reads it and replies in chat, confirming it can turn this into a runnable playbook. A follow-up post shows a compact **card preview** — title, stage count, task count. The full playbook artifact then auto-opens in the RHS alongside the chat, ready to save — showing stages including **Resolution — Deployment**, containing **Roll back deployment** and **Verify deployment health**. Matty proactively suggests: *"The deployment tasks look like a fit for Otto, if you want to assign it now."* Priya agrees. The RHS updates — both tasks now show **Otto** as assignee. Matty posts: *"Saved playbook 'Incident Response Checklist v1'"* | "Matty already knows the roster. Turning a checklist into a runnable process — and knowing who should own which part of it — is the same knowledge, used differently." | **Proposed.** Attachment-to-artifact generation with an auto-opening RHS is the artifacts UX layer, not current Trail POC capability. No approval gate in this version. This is the second scene (after 1.1) where Priya pulls Matty into a private DM for setup work rather than the shared channel — if that pattern holds, it's worth naming as deliberate grammar: private conversations with Matty for process/setup, the shared channel for live incident work. |

---

## Act 2 — The Incident Ignites, the Team Assembles

*Detection is automatic. Starting the response isn't — that click still belongs to Priya.*

| Scene | Visual | VO / On-screen text | Note |
|---|---|---|---|
| 2.1 | **A few days later.** Back in `#service-status`, a **PayForge** webhook post arrives — distinct from the routine traffic seeded in 1.1, this one signals an actual issue. **Sentinel** notifies Priya directly. In the same beat, Sentinel posts a Jira ticket card visibly in-channel — *"Opened INC-4471: Checkout failures during peak traffic."* — followed by an impact card: affected services, error rate, a small chart. **Matty** posts a follow-up prompt: *"Ready to start the Incident Response playbook for this?"* with a **Start Playbook** button. Priya clicks it. Matty shows a visible thinking/creating state — no instant result. | "Detection doesn't wait for a person to notice. Starting the response still does." | The explicit click matters — it's the one deliberate human decision point in an otherwise fully automatic detection-to-ticket sequence, and it's worth keeping visible rather than compressing away. |
| 2.2 | The click creates a **new, dedicated incident channel** — not a continuation of `#service-status`. Inside it, Sentinel messages Cipher directly: **Sentinel → Cipher:** *"Signature doesn't point to one cause cleanly. Can you dig in?"* The playbook run's RHS panel is open; its Diagnosis-stage task updates to show **Cipher** as the assigned agent, working it live. Cipher posts its finding: *"Root cause: build 8842 changed how we handle PayForge webhook events, deployed at T+0 — matches error onset exactly."* — and adds the same finding as a comment directly on INC-4471. Matty then posts, in this new channel: *"If this ever turns into a deployment issue, you'll want Otto in here — it's been running the platform team's rollbacks and deployments for months, which will be useful for getting to a resolution,"* as a suggestion card with a quick **Add** button. Otto joins. The RHS updates further: the Deployment-tasks stage shows **Otto** as assignee (pre-assigned back in 1.3, now visibly active), and a task in the Resolution stage shows **Alex** and **Dynamo** — added because Cipher's finding implicates the PayForge handler code. | On-screen tag: *"Playbook run assembles the team"* | This is the mechanism the whole act depends on — the playbook doesn't just track tasks, it's the record of who joined and why. Agent joins are shown as RHS task assignments now, not channel-member-list callouts, which keeps the emphasis on "why," not just "who's here." Directly pays off 1.2 (agents join when needed) and 1.3 (the playbook Priya helped build is doing the assembling). |
| 2.3 | Matty posts a brief triage summary — *"Splitting this into two workstreams."* — then **creates two separate coordination threads**, each with its own scoped starter message: **Thread 1:** *"Alex + Dynamo: the PayForge webhook handler itself."* **Thread 2:** *"Jordan + Otto: infra and rollback path."* Priya is added to both, coordinating across them rather than owning either one herself. | "From here, the work splits — not because Priya assigned it person by person, but because Matty already scoped two threads before anyone had to ask." | Threads are pre-created and named, not generic reply counts — sets up Act 3 as continuing existing conversations, not starting new ones. |

---

## Act 3 — Parallel Threads

*The hero act. Two workstreams already scoped in 2.3, now running at the same time, plus a third moment proving one agent can serve different people cleanly.*

| Scene | Visual | VO / On-screen text | Note |
|---|---|---|---|
| 3.1 | Inside the thread Matty already created, **Alex** posts: *"Find where our PayForge webhook handling changed in the last deploy."* Dynamo searches the repo, surfaces the relevant diff from build 8842, and proposes a fix inline. | On-screen tag: *"Thread 1 — code"* | Continuing an existing, named thread rather than opening a new one — consistent with 2.3. |
| 3.2 | **Simultaneously**, in the second thread Matty created — **Jordan** posts: *"What's our rollback readiness if the code fix doesn't land in time?"* Otto reports rollback is staged and ready, timestamped. | On-screen tag: *"Thread 2 — infra, running at the same time"* | Needs a split-screen or fast-interleave treatment with 3.1 to sell "simultaneous," not sequential — a directing choice, not just a scripting one. |
| 3.3 | **Priya** — still coordinating, but now also working directly — opens her *own* thread with **Dynamo**: *"Does this bug also affect refunds?"* Dynamo answers correctly in this separate thread, with no bleed from Alex's concurrent conversation. | On-screen tag: *"Same agent, different person, clean separation"* | **The load-bearing beat.** Concrete proof that multiple humans work with agents here, not just one person mediating everything. Priya engaging Dynamo herself — after spending Act 1–2 mostly coordinating others — shows growth: she's working the problem too, not just directing it. |
| 3.4 | The two threads converge back to the main incident channel. Alex + Dynamo post the code fix is ready. Jordan + Otto confirm rollback is on standby, unused. Priya synthesizes: *"Let's ship the fix directly — we know the cause, no need to roll back."* | | Resolves both parallel paths into one human decision, with both agents' work visible and credited. |

---

## Act 4 — Review and Resolution

| Scene | Visual | VO / On-screen text | Note |
|---|---|---|---|
| 4.1 | **Dynamo** opens a GitHub PR: *"Fix PayForge webhook handler regression. Author: Alex Rivera (via Dynamo). Status: Awaiting review."* Alex reviews and approves directly on the card without leaving Mattermost. | "Dynamo opened the PR on Alex's GitHub account — Alex's account, Alex's review. Full traceability, no governance layer required to make that true." | Human review stands in for the governance layer that Warden used to provide — accountability comes from the account model. |
| 4.2 | **Otto** merges and deploys. Sentinel confirms error rates dropping in-channel and updates INC-4471 to Resolved, linking the PR. | | Wraps the technical resolution. |
| 4.3 | Auto-generated summary card: *"Resolved in 12 minutes. Root cause: Cipher. Fix: Alex + Dynamo. Rollback standby: Jordan + Otto (not needed). Detection: Sentinel."* | | Explicitly credits every thread and every person — proves this was several people's work, not one IC's. |

---

## Act 5 — Trust and Control

| Scene | Visual | VO / On-screen text | Note |
|---|---|---|---|
| 5.1 | The **native Playbook run timeline** — task state changes, assignee changes, status updates — shown chronologically across the whole incident, with entries attributable back to which thread (3.1, 3.2, or 3.3) generated them. | "Every step, every thread, one timeline — not reconstructed after the fact, generated as it happened." | Replaces the old model-routing scene. This is a **native Playbooks feature**, not an invented compliance view — worth confirming exactly how it works before stating it as Proven, but if accurate, it's a real capability that helps rebuild some of the credibility the model-routing cut cost the act. |
| 5.2 | **Matty** posts a final wrap-up summary to the incident channel and, in the same action, books the postmortem on Priya's calendar: *"Postmortem: INC-4471, Thursday 2pm. Invited: Priya, Jordan, Alex."* | "The coordinator that knew the roster on day one is the same one closing the loop now." | Ties back to 1.1/1.3 — Matty's process knowledge, applied one more time at the close. |

---

## Closing Frame

Visual: `#service-status` sidebar showing the full team — Priya, Jordan, Alex, Emma, Darius (humans) and Matty, Sentinel, Otto, Dynamo, Cipher (agents — Cipher shown slightly greyed to signal it's not always active). Two resolved thread icons still visible under the old triage message. The playbook timeline scrolling in the background, interleaved entries from all three threads.

> *"The industry showed the world that people want AI teammates.*
> *We're finishing it — with a team that actually works together, in parallel, on the same problem.*
> *Because the team was always the point."*

---

## Open Questions for You

1. **Otto's "established" feel in Act 3.** Otto now joins mid-incident (2.2) rather than before it starts. Act 3's Jordan+Otto thread doesn't lean on any prior familiarity, so this should read fine as scripted — but if it feels like Otto and Jordan are working together too comfortably for a relationship that's only minutes old, that's the scene to revisit.

2. **Cipher's single scene.** Still a named character introduced for exactly one moment. If it plays thin once storyboarded, folding Cipher's function back into Sentinel remains a small edit, not a rebuild.

3. **The dropped model-routing claim.** Cutting old 5.1 removed the demo's clearest **Proven** statement (real today via the LiteLLM gateway) that customers control which model runs each agent. The new 5.1 (Playbook timeline) may or may not be an equally strong Proven claim — worth verifying before the workshop, since the act currently rests entirely on that one scene's credibility.

4. **Governance, still absent.** Auditor and Warden remain cut. Nothing in v5 touches DFQ #7 (active governance/provenance) beyond passive logging (5.1) and human account-based accountability (4.1). Still worth a one-line check with Ian on whether that's fine for this script specifically, even if ABAC-for-Agents matters elsewhere in your mandate.

5. **Runtime.** This is the fullest version yet — eight named characters, a dedicated incident channel, two explicitly-created threads, a settings-review step, a DM detour for playbook-building. Nothing has been cut to make room for any of it. A timed read-through before the workshop is probably necessary at this point, not optional.
