# Video Calls placeholder clips

Sample remote-participant loops for the Video Calls prototype
(`src/pages/prototypes/video-calls/`). **Placeholder only:** every person shown
is generated, not a real customer or colleague.

Clips are used as generated, full length with no trimming or blending (all but Marco's are only downscaled to 640x360 H.264, muted). Each has a
`-poster.jpg` still, taken from the first frame, used while paused, for
`prefers-reduced-motion`, and before the clip loads.

| File                            | Used for                    | Source                                         | Author                                               | Licence                            |
| ------------------------------- | --------------------------- | ---------------------------------------------- | ---------------------------------------------------- | ---------------------------------- |
| `marco.mp4`, `marco-poster.jpg` | Marco Rinaldi (1:1 DM peer) | Generated video, 10s 1280x720, used unmodified | Generated for this prototype (generated with Runway) | Placeholder only, no stock licence |

Clips are wired up in `CLIPS` in `videoCallsData.ts`, keyed by each
participant's `clipId`. Several participants may share a file with a different
`offset` and `mirrored` value. A participant with the camera on but no entry
there falls back to the avatar.
| `sofia.mp4`, `sofia-poster.jpg` | Sofia Bauer | Generated video, 10s, re-encoded to 640x360 (no trim) | Generated for this prototype (generated with Runway) | Placeholder only, no stock licence |
| `aiko.mp4`, `aiko-poster.jpg` | Aiko Tan | Generated video, 10s, re-encoded to 640x360 (no trim) | Generated for this prototype (generated with Runway) | Placeholder only, no stock licence |
| `arjun.mp4`, `arjun-poster.jpg` | Arjun Patel | Generated video, 10s, re-encoded to 640x360 (no trim) | Generated for this prototype (generated with Runway) | Placeholder only, no stock licence |
| `danielle.mp4`, `danielle-poster.jpg` | Danielle Okoro | Generated video, 10s, re-encoded to 640x360 (no trim) | Generated for this prototype (generated with Runway) | Placeholder only, no stock licence |
| `darius.mp4`, `darius-poster.jpg` | Darius Cole | Generated video, 10s, re-encoded to 640x360 (no trim) | Generated for this prototype (generated with Runway) | Placeholder only, no stock licence |
