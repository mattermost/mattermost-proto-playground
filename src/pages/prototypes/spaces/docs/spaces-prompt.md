# Spaces prototype — prompt

Build the "Prototype kickoff" scenario from the Spaces briefing doc as a clickable flow.

**Scenario:** a six-week response to a credential-spraying campaign at ACME Corp,
run by the Cyber Defense HQ team from the compass-design sample workspace. The
signed-in user is Alex Taylor (TPM). A Space, "Operation: Credential Spray
Campaign", sits above channels, playbook runs, a board and pages, and keeps them
moving toward one outcome.

**What the prototype should show (beats from the storyboard):**

1. Open a Space from a type ("Operation") and a template ("Threat campaign").
2. Pull existing work in by link: INC-1281's run, the ~threat-discussions threads,
   the threat-discussion-tasks board, IOC sets. The template adds three channels
   (war room, ~spray-hardening, ~spray-comms), a campaign board and pages
   (campaign brief, response runbook, advisory draft, decision log).
3. Overview: lifecycle and target end date, workstream health, open loops rolled
   up from every run, channel and board, "Needs attention" first.
4. A new incident (INC-1294) joins the Space by itself and its status rolls up.
5. Hardening runs as five checklists, one per business unit; the campaign board
   holds every task in the Space, grouped by run, workstream or owner.
6. A blocked unit becomes a risk decision for Alex Reid with context; it lands in
   the decision log page.
7. The Threat Analyzer Agent drafts the weekly sitrep; a compact strip shows its
   progress; it can pause with "Needs input".
8. Observers (Alex Reid, Rhea) see the roll-up without asking; Rhea's view hides
   restricted children.
9. A one-off (Jackson's request to finish Adam's onboarding) sits in Alex's day
   view next to the Space loops.
10. Close-out on exit criteria: runs archive together, leftovers hand on.

**Fixed:** the container is called a Space for now; it is a stateful object above
channels; it has a library; loops work with or without a container; the core
experience works without an LLM; roll-ups never show what a viewer can't see.

**Open (show a choice or pick one and flag it):** where Spaces sit in navigation;
whether a Space opens as its own view or as a channel; how one-off loops are
captured; whether the board shows each run as a card or every task.

**Out of scope:** building automations in Weave, configurable dashboards and
metric definitions, mobile, admin settings, permissions setup, other scenarios.

Status and live indicators: show status at three levels (item, Space, person),
let status come to where people already are (sidebar, channel header), and
script a few live changes rather than showing static mocks.
