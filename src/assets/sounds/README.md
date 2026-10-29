# Call sounds

Used by `src/pages/prototypes/video-calls/callSounds.ts`.

| File             | Used for                                                        | Source path in mattermost-plugin-calls |
| ---------------- | --------------------------------------------------------------- | -------------------------------------- |
| `ringback.mp3`   | `ring-incoming` (full volume) and `ring-outgoing` (half volume) | `webapp/src/sounds/ringback.mp3`       |
| `join_user.mp3`  | `join` (someone joined)                                         | `webapp/src/sounds/join_user.mp3`      |
| `leave_self.mp3` | `leave`                                                         | `webapp/src/sounds/leave_self.mp3`     |
| `join_self.mp3`  | available for a self-join cue (not mapped yet)                  | `webapp/src/sounds/join_self.mp3`      |

- Source: https://github.com/mattermost/mattermost-plugin-calls at commit `b3cc0387ff8f54a927db3e766ae63eb42dba88ba`.
- License: the source tree is AGPL v3 (or a commercial license from Mattermost); only compiled builds produced by Mattermost are MIT. These files carry no per-asset license. They are Mattermost, Inc. assets, copied here on the owner's instruction for use in this internal design playground. Re-check the license position before this repository, or anything built from it, is made public.
- The plugin ships no separate incoming ringtone and no notification sound, so `ring-incoming` reuses `ringback.mp3` and `notification` is unmapped (silent).
