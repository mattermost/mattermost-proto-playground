# Video Calls placeholder clips

Sample remote-participant loops for the Video Calls prototype
(`src/pages/prototypes/video-calls/`). **Placeholder only:** every person shown
is generated, not a real customer or colleague.

Clips are used exactly as generated (no trimming or re-encoding). Each has a
`-poster.jpg` still, taken from the first frame, used while paused, for
`prefers-reduced-motion`, and before the clip loads.

| File                            | Used for                    | Source                                         | Author                                                      | Licence                                 |
| ------------------------------- | --------------------------- | ---------------------------------------------- | ----------------------------------------------------------- | --------------------------------------- |
| `marco.mp4`, `marco-poster.jpg` | Marco Rinaldi (1:1 DM peer) | Generated video, 10s 1280x720, used unmodified | Generated for this prototype (generation tool: to be added) | Generated placeholder, no stock licence |

Clips are wired up in `CLIPS` in `videoCallsData.ts`, keyed by each
participant's `clipId`. Several participants may share a file with a different
`offset` and `mirrored` value. A participant with the camera on but no entry
there falls back to the avatar.
