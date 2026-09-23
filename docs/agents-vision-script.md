# Human + Machine, On the Same Team
### The Mattermost Agentic Vision
**Video Script & Storyboard — v6, Draft for Vision Workshop**
*Prepared for: Ian Tien & the Agents Team*

---

## The Thesis

The premise is unchanged from v5: give people a roster of AI teammates — each with a name, a job, memory, and the ability to talk to each other and to the tools you already use — and they'll build actual workflows around it in weeks.

But most agent products today are fundamentally single-player: one person, directing a private fleet of bots. That's bot management, not team formation.

**Mattermost's advantage:** we never had to bolt teams onto our product. Channels are already the place multiple humans coordinate. This demo's job is to show that the same channel can hold multiple agents too — and, critically, that **several humans and several agents can all be working the same problem at once**, not funneled through a single operator.

### What Changed From v5

This is a full pivot, not an iteration — Ian's direction after the workshop was to center the demo on **team-to-multi-agent coordination**, not incident response, and to fix two specific problems: agent names that need no subtitle to be understood, and a scenario simple enough for a broad audience to follow on one watch.

- **New scenario: updating Mattermost's own docs site**, not a payment-webhook incident. Ian's framing: docs is low-stakes, universally relatable, and revertible — the right place to demonstrate the hard part (multi-human + multi-agent coordination) without incident-response jargon getting in the way.
- **New agent roster, named for what they do, not who they are:** Matty (orchestrator — unchanged), **Writer** (content), **Reviewer** (proofreading), **Coder** (research + layout/component builds + deploy). Sentinel/Cipher/Otto/Dynamo are retired. No agent name needs a subtitle to be understood.
- **Reviewer's scope was deliberately narrowed to proofreader** — grammar, style, broken links. It does not make UX/architecture judgment calls; that's a human's job. This ended up mattering: the "we need a new reusable component" idea now comes from Jordan, not from an agent overreaching its purpose.
- **A genuine second delegation lane:** Coder isn't just "the coder" — it does real product-implementation research (grounding Writer's rewrite in how SSO actually works today) *and* builds a reusable UI component later. Two distinct, well-motivated jobs under one purpose-built name.
- **Explicit human-to-human beats layered throughout**, not just sequential human-to-agent moments. Team members talk to *each other*, with agent output as the shared reference point — this is what actually sells "team," not just "multiple people happen to use the same bot."
- **One explicit agent-to-agent peer moment, not routed through Matty:** Reviewer checks in directly with Writer after the draft (3.1) — same proofreader scope, staged as a visible peer message rather than a channel post. Protects the "agents coordinating visibly with each other" claim, which otherwise would have run entirely through Matty as a hub.
- **A genuine parallel-delegation moment in 4.1**, styled after Claude Code's subagent pattern: Matty posts a single tracker card with two independent checks running at once — Coder's CI pass and Reviewer's check of the combined page — rolling up to "2 of 2 passed" once both finish. Deliberately built from two checks that were already independent, rather than inventing parallel work elsewhere in a scenario that's otherwise genuinely sequential (research → write → build).
- **Asymmetric review surfaces as the stakes-gradient payoff:** Jordan reviews content via an embedded live staging preview (minimized card, expandable to full-screen) — never leaves Mattermost. Alex reviews code via a real PR link — the tool built for that job. Same channel, same moment, two different affordances, no line of dialogue needed to explain why.
- **Coder owns deploy, not Writer.** Writer's job ends at an approved draft. Coder already has the PR/merge/CI mechanics from the component build, so pushing the combined, approved change live is a continuation of its own work — reports CI status before merge, then deploys after both approvals land.
- **A dissemination beat closes the loop with the wider team**, not just the two humans directly involved — Matty drafts, a human sends, closing the arc back to Emma, who raised the original problem.

### Format & Runtime

- Target length: 2.5–3.5 minutes for the main scene, consistent with v5's target. Concision is a first-order constraint this time, not a nice-to-have — Ian's explicit note was "too much happening on screen," so cuts should be protected, not treated as later polish.
- Screen-capture demo style, minimal voiceover; on-screen callouts and visible agent-to-agent and human-to-agent messages do most of the explaining — same convention as v5.
- One continuous product walkthrough inside a single scenario — no cutaways. Appendix scenes (below) are separate chapters, not part of this runtime budget.

### Cast & Setting

- **Priya Shah** — PM (human) — makes the plain-language ask
- **Jordan Lee** — Docs owner (human) — content approver, spots the component gap
- **Alex Rivera** — Engineer (human) — code approver
- **Emma Novak** — Support lead (human) — flags the problem, closes the loop at the end
- **Matty** — Orchestrator agent. Pre-existing, standing — same character as v5. Knows the roster, delegates to specialists, checks before acting where it matters.
- **Writer** — Content drafting/publishing specialist. Drafts and revises copy; does not deploy.
- **Reviewer** — Proofreading specialist. Grammar, style, broken links — not UX or architecture judgment calls.
- **Coder** — Research + layout/component-build + deploy specialist. Investigates how the product actually works, builds reusable UI components, owns the PR/merge/CI/deploy mechanics.
- **Monitor** — Uptime/monitoring specialist. Appears only in Act 5 — detects outages, can start a Playbook run on its own.

**Setting:** `#docs-site`, an established channel. **Scenario:** the onboarding page's SSO section is stale — support tickets are piling up — and fixing it surfaces a second, genuine need: a reusable page component that didn't exist yet.

---

## Act 1 — Trigger & Ask

*Establishing the team before any agent appears — the coordination starts with people, not with a delegation.*

| Scene | Visual | VO / On-screen text | Note |
|---|---|---|---|
| 1.1 | `#docs-site` is lived-in, not empty. **Emma** posts: *"Getting a steady trickle of support tickets about the SSO setup steps on the onboarding page — looks like it's out of date."* | "The problem doesn't arrive as an alert. It arrives as someone on the team noticing." | Deliberately a plain human message, not a webhook-style card — Emma is raising a concern, not reporting an automated event. |
| 1.2 | **Priya** replies to Emma: *"Yeah, I've seen a few of these too — mind if I get Matty on it?"* **Jordan** chimes in: *"Go for it, I'll keep an eye."* No agent has spoken yet. | "Before any agent is involved, the team already agreed this is worth doing." | Pure human-to-human. This is the beat that makes everything after it read as a team decision, not one person's unilateral action. |
| 1.3 | **Priya** tags **Matty**, in plain language: *"Can we check how SSO actually works today and fix this page to match?"* | "Still no jargon, no GitHub, no ticket queue — just asking someone on the team." | Mirrors Ian's own framing of the ideal doc-agent interaction almost verbatim. |

---

## Act 2 — Grounding & Informed Rewrite

*The rewrite is only as good as what it's grounded in — Coder checks reality before Writer touches the page.*

| Scene | Visual | VO / On-screen text | Note |
|---|---|---|---|
| 2.1 | **Matty → Coder**, visible handoff in-thread. Coder inspects the real SSO implementation and posts back a fuller research report, opened as its own panel: *"Here's how SSO setup actually works today — three steps, not the four the docs describe, and the redirect URI format changed last quarter."* | "Before anyone rewrites a word, someone checks what's actually true." | This is Coder's first of two distinct jobs — research, not code. Justifies a single purpose-built name covering more than one kind of work. |
| 2.2 | **Matty** checks in before the next delegation: *"Want me to loop in Writer to make the copy changes?"* Priya confirms. **Matty → Writer**, visible handoff. Writer compares Coder's findings against the current page, posts its proposed rewrite as a Markdown artifact — same panel style as Coder's report. | "Writing still means one thing changed here on purpose: nothing happens without someone saying go." | The confirmation step is new versus the research handoff in 2.1, which fired without one — an intentional asymmetry that echoes the stakes gradient paid off later in Act 4. |
---

## Act 3 — The Catch & Component Build

*Reviewer does exactly what its name promises — nothing more — and the bigger idea comes from the person who owns the page.*

| Scene | Visual | VO / On-screen text | Note |
|---|---|---|---|
| 3.1 | **Reviewer → Writer**, visible peer message — same delegation-style visual as Matty's handoffs, just agent-to-agent this time: *"Clean pass — grammar and links check out."* | "Reviewer's job is smaller than it sounds, on purpose. Grammar, links, style. Nothing more." | Deliberately shown before Jordan's reaction below — the fast, automated check runs first, so what Jordan catches next reads as something genuinely beyond Reviewer's job, not a redo of it. Staged as a direct peer exchange (not a post into the channel) specifically to make agent-to-agent coordination visible without Matty mediating — see 4.1 for its second appearance later in the act. |
| 3.2 | **Jordan** reacts to Writer's draft in-thread — confirms the framing reads right, and separately notices something Reviewer's clean pass didn't catch: *"The new steps really need a collapsible section — and honestly, we'll want that elsewhere on the site too."* | "The next problem doesn't come from an agent flagging an error. It comes from someone on the team looking at the result and seeing further than the task in front of them." | This single beat carries two jobs at once — a content reaction, and the observation that motivates the rest of this act. Reviewer, by design, would not have made this call; it's a human judgment about page architecture, not a proofreading catch. |
| 3.3 | **Jordan** (or Priya) asks **Coder** directly to build the reusable collapsible section component, following her own idea above. **Coder** posts a short code preview, then a full GitHub PR card: *"Add reusable collapsible section component."* | "Same agent, different job — Coder just spent the last act on research, and now it's building." | Second of Coder's two distinct jobs. The delegation is human-initiated here, not agent-initiated — a deliberate choice, since the idea itself came from a human in 3.2. |
| 3.4 | **Jordan** notices the new component sits close to the SSO callout, asks **Alex** directly: *"Does this affect how the content reads?"* **Alex** checks, replies in-thread. | "Two people, talking to each other, because of something an agent built — not two people each waiting on their own approval." | The second explicit human-to-human beat in the scene, this time with an agent's artifact as the shared reference point rather than the trigger. |

---

## Act 4 — Approval & Publish

*Two approval lanes that look different on purpose — and the agent that already has its hands on the mechanics is the one that ships it.*

| Scene | Visual | VO / On-screen text | Note |
|---|---|---|---|
| 4.1 | **Matty posts a delegation tracker card** — two rows, both running at once: *"Coder: running CI checks on the merged PR"* / *"Reviewer: checking the combined page (style, links)."* Both resolve independently; the card rolls up to *"2 of 2 passed."* | "Before asking anyone to sign off, the agents check their own work — at the same time, not one after another." | This is the demo's one explicit parallel-delegation moment, staged deliberately as two genuinely independent checks (CI vs. style/links) on the same finished artifact — not manufactured work. Needs a new component: a single tracker card with live per-row status, rather than two separate posts, or the "running together" claim won't read visually. |
| 4.2 | **Alex** reviews and approves the PR directly — a required gate; the PR cannot merge without it. | "Alex's review, Alex's account, Alex's call. No separate governance layer needed to make that true." | Direct echo of v5's 4.1 note on account-based accountability — same principle, new scenario. |
| 4.3 | **Jordan** reviews the combined change — content plus new component, staged together — via a minimized preview card right in the channel, with approve/reject actions on the card and an option to expand into a full-screen live view for a closer look. Approves from either state. | "Jordan never leaves Mattermost to see exactly what's about to go live." | The visual centerpiece of the whole demo's stakes-gradient argument: compare this card directly against Alex's PR link in 4.2 — same moment, two different tools, no voiceover needed to explain why. |
| 4.4 | **Coder** deploys — same agent that opened the PR and reported checks in 4.1, now pushing the approved, combined change live. Visible "publishing… → live" state, not an instant cut. **Matty** drafts a short announcement; **Priya** edits it and posts it in-thread, tagging the support team: *"SSO docs updated to match current setup — should help with ticket volume."* **Emma** reacts. Thread marked resolved. | "The person who raised it is the last one to hear it's done." | Closes the loop back to 1.1 — Emma's original concern is explicitly what the announcement addresses, not a generic "it's fixed" note. |

---

## Closing Frame

Visual: `#docs-site` sidebar showing the full team — Priya, Jordan, Alex, Emma (humans) and Matty, Writer, Reviewer, Coder (agents). The resolved thread still visible with its full history — Emma's original flag, the team's confirmation, both delegations, the PR, the preview, the announcement, all in one continuous scroll.

> *"The industry showed the world that people want AI teammates.*
> *We're finishing it — with a team, working a real problem together, agents included.*
> *Because the team was always the point."*

---

## Act 5 — Later That Week

*A short, deliberately unresolved coda — not a second incident scenario, just enough to prove two specific things: agents can trigger playbooks on their own, and playbook tasks can be assigned to agents, not only humans.*

| Scene | Visual | VO / On-screen text | Note |
|---|---|---|---|
| 5.1 | Back in `#docs-site`, a real webhook fires: *"docs.mattermost.com returning 500 errors — uptime check failed."* | "Later that week — a different kind of problem." | First honest use of `WebhookPost` in the whole script — held in reserve since Act 1, since Emma's original flag was deliberately a human message, not this. |
| 5.2 | **Monitor** — new to this act, a monitoring specialist — sees the webhook and **starts a Playbook on its own**, no human click, no confirmation step. The RHS panel opens showing the "Site Outage" playbook's checklist, already running. | "Nobody clicked start. The agent that noticed the problem is the one that kicked off the process for solving it." | The point of this beat is narrow and specific: playbooks don't require a human to initiate them. Contrast deliberately with Priya's explicit "Start Playbook" click in v5's 2.1 — that was a human decision point; this is the same mechanism, agent-initiated instead. |
| 5.3 | **Monitor** assigns the "Investigate root cause" task directly to **Coder** in the RHS panel — Coder's avatar appears next to the task, not a human's. Cut here. | "Coder's already been busy this week. Now it's got a task on a playbook, assigned by another agent." | Deliberately incomplete — no investigation, no fix, no resolution shown. The claim being made is narrow (agents get assigned playbook tasks) and doesn't need a full incident arc to land. Nice callback: same Coder, third distinct job this video, now under a different kind of process entirely. |

---

*A personal-agent arc, escalating in one direction: ambient presence first, fuller workspace only when the task actually calls for it.*

| Scene | Visual | VO / On-screen text | Note |
|---|---|---|---|
| A.1 | Open in a channel — no transition shown. Matty's floating icon is already present in the corner, unnarrated. Open the panel: a lightweight, private chat. Ask a quick contextual question about what's on screen; Matty answers using that context. | "Matty's been here the whole time — you're just noticing now." | Deliberately not staged as "watch me open this" — see the earlier flow revision: opening on the dedicated view first and cutting to a channel read as backtracking, so this scene now opens in the channel instead. |
| A.2 | Switch to a different channel. Matty's floating context updates automatically — same thread, new awareness. | "Same conversation. New surroundings." | The one intentional, visible transition in this scene — proves persistence and context-awareness directly rather than asserting it. |
| A.3 | Escalation: a bigger task ahead (Calendar setup). Click "open full view" from the floating panel — expands into the dedicated Agents view, same continued thread. Matty states the boundary plainly: *"This chat is just between us — I can help you personally here. If you ever want me in a team channel, I show up differently there, working with the whole group."* | "The lightweight version and the full workspace are the same agent, same thread — just more room when the task needs it." | The private/team boundary is stated explicitly here, rather than left implied — a direct fix from an earlier review pass. |
| A.4 | Matty surfaces connectors — Calendar, Gmail, Drive. Pick Calendar; real OAuth flow. Ask *"what's my week look like?"* — Matty reads the calendar, summarizes. Start a second, concurrent thread from the "+" button — nested sidebar, independent chats. | | Real OAuth, not a skipped/faked step — worth showing plainly. |
| A.5 | Closing narration beat: the floating icon is the lightweight, always-available layer; the dedicated view is where you go when a task needs more room — same agent throughout. Explicitly unique to Matty — no other agent floats. | "One agent, everywhere. Everyone else lives where the work is." | Lands after the audience has already seen the behavior, so it reads as an earned observation rather than a claim made before any evidence. |

---

## Appendix 3 — All Agents View

| Scene | Visual | VO / On-screen text | Note |
|---|---|---|---|
| B.1 | First-time UX: open the Agents view for the first time. Pre-seeded roster shown by name only — Matty, Writer, Coder — no subtitles needed. | "You don't need a tooltip to know what Writer does." | Directly answers Ian's core naming complaint from the feedback call. |
| B.2 | Start a chat with Coder directly, outside any channel — *"can you check how our SSO flow works?"* Coder responds. | "Agents work with you one-on-one just as easily as they work with the whole team." | |
| B.3 | Steady-state: same view, **"Your agents"** / **"All agents"** tabs. | | |
| B.4 | Browse "All agents" — a few others visible; click into one to see description and owner. | "You can always see who's responsible for an agent — even one you've never used yourself." | Seeds the ownership/accountability answer without a dedicated governance scene. |

---

## Appendix 4 — Creating a New Agent

| Scene | Visual | VO / On-screen text | Note |
|---|---|---|---|
| C.1 | From the Agents view, "new agent" — choose guided chat build. Describe a playbook-oriented purpose. | | |
| C.2 | Follow-ups: knowledge sources, connectors, schedule. | | |
| C.3 | Generated name + description — e.g. "Playbook Builder." | "The name comes from the purpose, not the other way around." | |
| C.4 | First real task: drop in a PDF checklist. The agent reads it, builds a playbook artifact in the sidebar, saved directly to Playbooks. | "The very next thing you do with a new agent is real work — not more configuration." | |
| C.5 | Cut to the same agent's settings in modal/UI form — same fields, editable directly. | "Chat is the faster path to the same settings. Not a separate system." | |

---

## Appendix 5 — GM with Multiple Agents *(lowest priority — cut if it doesn't fit)*

| Scene | Visual | VO / On-screen text | Note |
|---|---|---|---|
| D.1 | A small group DM — 2-3 humans, 2 agents present. One human asks a question directly to one agent; the other adds context. The two agents briefly coordinate a small task in front of the group. | "The same principle, at a smaller scale." | Echoes the main scene's Writer↔Reviewer handoff pattern, just at GM size. |

---

## Open Questions for You

1. **Runtime, again — now with a fifth act.** Ian's own feedback was "too much happening on screen." Act 5 is deliberately short (3 beats, unresolved on purpose), but it's still new runtime on top of an already-full main scene, plus a fifth named agent (Monitor) the audience has to track. Worth confirming this coda earns its place rather than diluting focus from the main scene's argument.
2. **The embedded preview's exact visual design is still pending your guidance** — noted in the shot list as resembling docs.mattermost.com, but the minimized-card and expanded-view states haven't been mocked up yet.
3. **Diff view for Writer's rewrite remains deferred**, not built — the Markdown artifact carries the beat. Worth revisiting only if you want that extra layer of polish later.
4. **Appendix 5 (GM) is explicitly lowest priority.** If runtime is tight even before appendices are counted, this is the first thing to drop.
5. **Monitor's name is a placeholder**, matching the self-evident-name pattern (Writer/Reviewer/Coder) but not yet run past you directly — worth a quick confirm before it's locked into the shot list.
6. **Cast names are reused verbatim from v5, with different roles.** Jordan Lee was Engineering Lead in v5, now Docs owner. Priya Shah was Incident Commander, now PM. Emma Novak was background-only in v5, now has a speaking role. Worth deciding whether this is an intentional recurring company roster across your demo scenarios (in which case roles could use a one-line "same person, different project" acknowledgment) or whether these should be distinct names per scenario to avoid confusion if both scripts are ever reviewed side by side.
