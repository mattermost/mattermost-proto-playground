# Video Calls: prototype docs

Inputs the prototype is built from. Read these before changing the prototype.

| Item                                                                                                                                                           | Kind        | Notes                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [video-calls-spec.md](video-calls-spec.md)                                                                                                                     | requirement | The UX spec (also published to Confluence). Source of truth for behavior, copy and states                                                                             |
| [Figma: Video-Calling](https://www.figma.com/design/WcvNikeYFxnW15IaZU9JM0)                                                                                    | requirement | Board 1335:418726; may be stale compared with the prototype                                                                                                           |
| [Figma: Call Card](https://www.figma.com/design/uHkbu1krioaScJ3AfxLPg2?node-id=2801-2389)                                                                      | requirement | Frame 2801:2389                                                                                                                                                       |
| [Figma: Settings Modal Revamp](https://www.figma.com/design/dUGxJk4lfo38lXzoRZf3YP/MM-12122-Settings-Modal-Revamp?node-id=1384-56121)                          | requirement | Reference for the User settings modal; the Calls tab keeps collapsible sections (the webapp's pattern) and leaves out the unsaved-changes footer and the search field |
| [Calls UX Improvements for DM Calls](https://mattermost.atlassian.net/wiki/spaces/DES/pages/4653645825/Calls+UX+Improvements+for+DM+Calls)                     | requirement | Call card states and copy                                                                                                                                             |
| [UX Spec: Outbound Calls, Implementation Tiers](https://mattermost.atlassian.net/wiki/spaces/DES/pages/4647059458/UX+Spec+Outbound+Calls+Implementation+Tiers) | background  | Outbound phone calls                                                                                                                                                  |
| [Phase 1: Basic Outbound SIP Calling](https://mattermost.atlassian.net/wiki/spaces/DES/pages/4646993930/Phase+1+Basic+Outbound+SIP+Calling)                    | background  | SIP phone calls                                                                                                                                                       |
| FY28 Multi-party Video two-pager                                                                                                                               | background  | Product context only; never quote it as design requirements                                                                                                           |
| [Prototype](https://video-calls-prototype.vercel.app/prototypes/video-calls)                                                                                   | reference   | Deployed build                                                                                                                                                        |

## Screenshots

`shots/final/` holds the images used in the spec, named in the order they appear.

- `01a`-`01d`: the Start call menu by server setup (video and SIP phone on or off)
- `02`, `14`, `17`, `27`: pre-join and calling in the widget and the window
- `28`-`31`: User settings, Calls tab (collapsed, Audio, Video, Screen sharing open)
- The rest cover the calling, incoming, active, stage and host states

Retake a screenshot when the screen it shows changes.
