# Weave automation permissions — prompt

Build a higher-fidelity prototype of the "Preset + groups" direction for Weave's automation permissions admin page (previously "Builder access").

## Model

- **All automation editors** is a preset group that can't be deleted. Who: everyone in any group on the page. It holds the shared steps (triggers and actions) everyone who can create automations gets. New steps (for example plugin actions from the event bus) are decided here once.
- **Groups** each say who can create team automations and edit their own, and optionally which extra steps those people get on top of the shared steps.
  - Who is either **specific users or groups** (pick people and user groups by name) or an **attribute-based policy** (the host ABAC table editor: Simple / Advanced tabs, Attribute / Operator / Values rows, "Add attribute", AND helper text, a test button).
  - A group's extra steps list only shows steps that aren't already shared.
- Access applies server-wide. People can only build in teams they're a member of. Guests and deactivated accounts are never included. System admins always have full access.
- Someone in more than one group gets the shared steps plus the extra steps from all of their groups.
- Avoid the word "builder" in the UI.

## Screens

1. Permissions page: the preset card, then the group list, and a banner for new steps that aren't available to anyone yet ("Add to everyone" or "Choose groups").
2. Shared steps editor (the preset): read-only who, the full step list with new steps marked.
3. Group editor (full page, System Console style): name, who (radio between specific users or groups and attribute-based policy), extra steps, Save / Cancel, Delete group.

## Decisions from review

- Full page editors, not side panels or modals.
- No subtitles on the who radio options.
- No "Copy steps from" shortcut.
- No locked "from another group" rows.
- No proposals or drafts section (spec phase 5).
- No person lookup on the list page.
