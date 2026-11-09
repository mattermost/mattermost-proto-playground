# UX Spec: Universal Search

Source: [UX Spec: Universal Search](https://mattermost.atlassian.net/wiki/spaces/DES/pages/2704244738/UX+Spec+Universal+Search) (Confluence, captured for this prototype).

Related:

- [UX Spec: AI Copilot Search (MVP)](https://mattermost.atlassian.net/wiki/spaces/DES/pages/2713714689/UX+Spec+AI+Copilot+Search+MVP) — AI tab / RHS results (linked from this spec; not in scope for every scene here)
- [Figma Design File](https://www.figma.com/design/3AuDuP8kYDydYMsqbLi9WG/Universal-Search-UX?node-id=2138-60034)
- [Figma Clickable Prototype](https://www.figma.com/proto/3AuDuP8kYDydYMsqbLi9WG/Universal-Search-UX?page-id=1%3A275&node-id=2138-54672)

---

# Overview

There are currently multiple ways to search for things and users don't always know which search to use. For example, users expect to use the global search bar to find their colleagues or find channels, but instead, they can only use it to find messages or files. Since we're also looking at bringing AI-powered search in to the product, it’s also an opportunity to improve these access points to search in general and address the problems stated by users.

This work builds on the initial scope of [AI search outlined in this document](https://mattermost.atlassian.net/wiki/spaces/DES/pages/2713714689/UX+Spec+AI+Copilot+Search+MVP).

### The core problems we’re aiming to solve with this work:

- Incorporate AI-powered search as a new method to search by topics or questions across the workspace.
- Create a unified search experience to find channels, messages, files, and people that is forgiving, more intuitive, and eliminates the need to know which search modal to use for what you’re looking for.
- Enable cross-team search for messages and files (not available in current product)

---

# Combine global search and channel switcher into one modal

Whether users access search from keyboard shortcuts, clicking the global search or clicking the ‘find channels’ button in the LHS, this solution brings all of those access points to one new search modal.

## Keyboard shortcuts

### Cmd/Ctrl-K - Channel search

This shortcut will open the new search modal with the ‘Channels’ tab active. This will behave just like the current channel ‘Find channels’ modal, but moved into this new universal search modal.

If the modal is already open to a different search mode, this shortcut will also switch to channel search.

### Cmd/Ctrl-F - Message search (in active channel)

This shortcut will open the new search modal with the ‘Messages’ tab active and the filter for the currently active channel added to the input (like we currently do).

If the modal is already open to a different search mode, this shortcut will also switch to the message search.

### TBD - Switch search mode/tab

This shortcut enables users to quickly switch to the next or previous search mode/tab. This shortcut should only work while the search modal is open.

Special characters typed in an empty input

- Typing the `~` character can immediately switch to the ‘Channel’ mode (if not already there)
- Typing the `@` character can immediately switch to the ‘People’ mode (if not already there)

## Channel search

The channels search replaces the current ‘find channels’ modal and brings the functionality of the channel switcher in to this new universal search modal.

### Default state

Before a user starts typing, a default state displays showing up to 5 unread channels first followed by 20 recently visited channels. If there are no unread channels, this section is hidden. NOTE: no changes proposed on this behavior.

### Typing state

When the user is typing in the search input, the `UNREADS` and `RECENT` categories are removed and the results in the body of the modal begin to change and narrow down as you type. No change to the current behavior here.

### Tips

A tip at the bottom shows a tip for browsing more channels and a link to open the browse channels modal.

# Message Search

### Default state

When this tab is active, before the user starts typing we show a placeholder message in the search input and recent searches below (if applicable).

#### Ability to delete recent searches

Users can remove recent searches by hovering over the item in the list and clicking the x on the right side

### Typing state

In the `Messages` search mode, results *do not* show as users are typing (due to performance concerns).

### Enter to execute search

Because we can’t show results for messages as you type, a hint `Enter to search` appears on the right side of the search input.

### Modifiers added to search

When a modifier is used in search, the body of the search modal is replaced with the autocomplete results based on the filter.

Once a filter is selected from the autocomplete results, a chip is added to the search input and users can either hit ENTER to search or add further keywords/filters.

### Tips

At the bottom of the modal, a tip to use search modifiers appears. Clicking on one of the modifiers adds it to the input where the cursor is placed at the time.

### Adjust the height of the dialog depending on the results

Depending on the available autocomplete/suggested results, the height of the search dialog should be dynamic.

### Message search results

Search results for messages should show just like they do now in the RHS. Consider adding a title 'Results for “{search term}” above the results.

# File Search

File search behaves similarly to the current file search, but uses the tab pattern instead of the chip filter we currently have.

### Default state

Before the user starts typing we show a placeholder message in the search input and recent file searches and recently added files below. Show up to 5 recent file search terms and then show up to 20 recently added files (from channels you’re a member of).

#### Ability to delete recent searches

Users can remove recent searches by hovering over the item in the list and clicking the x on the right side

### Typing state

Once users start typing, ideally we can show file results for files within channels you have access to as you type.

#### Alternative if we can’t autocomplete file results

If we can’t show file results while typing, we hide the autocomplete results and users must press enter to show search results.

### Tips

The modifier tips also shows for files and includes an additional modifier `Ext:` to filter by a specific extension.

### File search results

Search results for files should show just like they do now in the RHS. Consider adding a title 'Results for “{search term}” above the results.

# People Search (New)

The people search is just like the channel search, but is isolated to DMs only. This is to alleviate the confusion of how to find colleagues in the application.

### Default state

When this tab is active before the user starts typing, a list of people you chat with most shows at the top and then a list of recent people below that.

- If the user has not had any DMs yet with 3 people or more, we can hide the ‘People you chat with most’ section
- If the user does not have any dm activity at all, replace the default state with an alphabetical list of users in the server

### Typing state

When users start typing, the default sections and category labels hide and we show the list of relevant people results narrowing down as you type. The focus applies to the first result until the user hovers or uses the keyboard to move down through the list.

### Tips

The tip that is displayed in this tab is to use Command-shift-k to browse for teammates or start a group message.

# AI Copilot Search

The spec for Copilot search is outlined in: [UX Spec: AI Copilot Search (MVP)](https://mattermost.atlassian.net/wiki/spaces/DES/pages/2713714689/UX+Spec+AI+Copilot+Search+MVP).

# Searching Across Teams

View the related spec for searching across teams (linked from Confluence).
