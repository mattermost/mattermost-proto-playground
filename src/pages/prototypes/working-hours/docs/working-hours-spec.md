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
   - Default range 8:00 AM – 8:00 PM (08:00 – 20:00). (The Confluence page says 9:00 AM – 5:00 PM; changed on request.)
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

This is the prototype. Where it differs from the sections above, follow this.

- The feature is renamed from Notification Schedule to **Working Hours**.
- It does not live on the Notifications tab. Settings has an **Availability** section (clock icon), after Notifications. The prototype builds only that tab. In order:
  1. **Working hours** (the editor below). Collapsed summary: "Not set", "Off", or the hours line (`Weekdays, 8:00 AM – 8:00 PM`, or `Custom · N days`).
  2. **Out of office** — the old "Automatic direct message replies", shown as a static row. Description: "Automatic direct message replies are off".
  3. **Share last active time** — static row, description "On".
- The other way in is the account menu: hover **Do Not Disturb**, then **Working hours**. That row shows **On** or **Off** beside the label, not the hours. It opens Availability with Working hours expanded.
- A schedule does not exist until the user saves one. Until then the collapsed row reads "Not set", and nothing about working hours applies. The editor opens with the default (Weekdays, 8:00 AM – 8:00 PM, both options on) as a starting point; Cancel leaves it unset.
- **Enable working hours** is the master switch. Its description is "Applies this schedule. Off keeps the setup and pauses every effect." Off keeps the saved days, times, and status text, collapses that setup, and pauses every effect: Do Not Disturb, the custom status, and the direct message notice. The collapsed row then reads "Off". Save and Cancel stay visible.
- While the schedule is on, two options follow the days and times. They have a title and a switch, and no description under the title:
  - **Do Not Disturb outside working hours** (the original behavior; on by default).
  - **Set a custom status outside working hours** (on by default). The person picks the emoji (compass-proto `EmojiPopover`) and the text; default `⏰ Outside work hours`. The message is required while this option is on.
- Custom Schedule on desktop is a checkbox per day, with that day's time range beside it. On mobile each day is a row with a switch on the right. Off hides the times and the row reads "Do Not Disturb all day". On shows Start time and End time side by side.
- Mobile uses the large size for these switches and for the time and custom-status fields. Choosing Every day, Weekdays, or Custom stays a single choice with a check. Profile → Settings → Notifications → Working hours pushes from screen to screen; the label is **Working hours**, not "Notifications schedule".
- While a custom status is set it shows in:
  - the account button (the emoji sits in the same control as the avatar; hovering it shows the status text),
  - the account menu (emoji, text, and a control to clear it),
  - the desktop sidebar, on that person's direct-message row (emoji; hovering it shows the status text),
  - a direct-message channel header (emoji and text),
  - that person's message byline (emoji; hovering it shows the status text).
- Working hours also drive the direct-message notice. When the other person is outside their working hours, a moon icon and "The time for {name} is {time}" sit above the message input (screenshot in `shots/`). The icon is Compass Icons `power-sleep`.
