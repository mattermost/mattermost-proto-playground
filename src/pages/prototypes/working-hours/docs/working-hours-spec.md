# UX Specs: Notification Schedule

Source: https://mattermost.atlassian.net/wiki/spaces/DES/pages/2790817794/UX+Specs+Notification+Schedule (page version 5). Condensed copy of the spec text; images omitted.

## Overview

"Notification Schedule" lets users specify the times they want to receive notifications. Outside those hours their status automatically switches to Do Not Disturb, silencing all notifications. Use cases: deep work without interruption, limiting work notifications after hours, adapting to shifts / time zones.

## Desktop

Two entry points:

1. **Settings → Notifications tab** has a new section `Notifications Schedule` to enable/disable the schedule and configure the time frame.
2. **Profile icon (top right) → hover Do Not Disturb → submenu → Notification Schedule** opens the Settings modal with the Notification Schedule section expanded.

### Configuration

1. **Days of week** — `Every day`, `Weekdays (Monday - Friday)`, `Custom Schedule`. Custom expands the UI to show all days of the week; click a day to enable/disable notifications on that day.
2. **Time** — a time range in which the user receives notifications. Unless Custom, a single range applies to all active days. With Custom, a different range per day. Any time outside, status is Do Not Disturb.
   - Time fields respect the user's `Clock Display` setting (12h / 24h).
   - Default range 9:00 AM – 5:00 PM (09:00 – 17:00).
   - Increments are half-hour, matching the custom-time Do Not Disturb modal.

## Mobile

Profile tab → **Settings → Notifications** → menu item `Notifications schedule` to enable/disable and configure.

- Days: `Every day`, `Weekdays (Monday - Friday)`, `Custom Schedule`.
- Time: start and end time applying to all active days. With Custom, the user selects days to enable and a different range per enabled day.

## In action

- Once set, the status icon automatically becomes Do Not Disturb during the off period, regardless of current activity status.
- Clicking the profile icon shows Do Not Disturb selected and until when it will remain, like a manual DND with expiry.
- The user can manually change status at any time; it then does not auto-switch to DND until the next cycle starts.

## Working Hours changes (not in the Confluence page)

Requested after the original spec; recorded here until the spec is updated.

- The feature is renamed from Notification Schedule to **Working Hours**.
- Working hours also drive the webapp's DM notice: when the person you are in a DM with is outside their working hours, show "The time for {name} is {time}" above the message input (screenshot in `shots/`).
- New config options, each independent:
  - Do Not Disturb outside working hours (the original behavior; on by default).
  - Auto-set a custom status outside working hours: `Outside work hours`.
