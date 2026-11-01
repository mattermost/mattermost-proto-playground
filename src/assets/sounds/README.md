# Call sounds

Used by `src/pages/prototypes/video-calls/callSounds.ts`.

| File             | Used for                                                   | Source path in mattermost-plugin-calls                               |
| ---------------- | ---------------------------------------------------------- | -------------------------------------------------------------------- |
| `ringback.mp3`   | `ring-outgoing` (looped while a DM call rings)             | `webapp/src/sounds/ringback.mp3`                                     |
| `join_self.mp3`  | `join-self` (you connect; also the pre-join speaker test)  | `webapp/src/sounds/join_self.mp3`                                    |
| `join_user.mp3`  | `join-user` (someone else joins while you are in the call) | `webapp/src/sounds/join_user.mp3`                                    |
| `leave_self.mp3` | `leave` (you hang up)                                      | `webapp/src/sounds/leave_self.mp3`                                   |
| `calls_calm.mp3` | `ring-incoming` (the default call ringtone, looped)        | `webapp/mattermost-webapp/webapp/channels/src/sounds/calls_calm.mp3` |

- Source: https://github.com/mattermost/mattermost-plugin-calls at commit `b3cc0387ff8f54a927db3e766ae63eb42dba88ba`.
- License: the source tree is AGPL v3 (or a commercial license from Mattermost); only compiled builds produced by Mattermost are MIT. These files carry no per-asset license. They are Mattermost, Inc. assets, copied here on the owner's instruction for use in this internal design playground. Re-check the license position before this repository, or anything built from it, is made public.
- `calls_calm.mp3` is not in the plugin's own sounds folder: it is the incoming-call ringtone from the Mattermost webapp checkout nested in the plugin repo (the plugin's `DEFAULT_RING_SOUND` is `Calm`). The other ringtones there (`calls_cheerful`, `calls_dynamic`, `calls_urgent`) are not copied. The plugin has no leave-by-others sound and no notification sound, so `notification` is unmapped (silent).
