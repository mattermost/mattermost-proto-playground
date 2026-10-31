import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import type { VideoParticipant } from '@/types/videoCall';

export const CHANNEL_NAME = 'UX Design';
export const SELF_ID = 'leonard';
/** The other person in the 1:1 DM. */
export const DM_PEER_ID = 'marco';

/**
 * Remote video loops, keyed by `VideoParticipant.clipId`. Filled in by the
 * assets package (src/assets/video/). Until a clip exists the tile falls back
 * to the avatar-on-dark presentation, so every entry is optional.
 */
export const CLIPS: Record<string, { src?: string; poster?: string }> = {};

export const CLIP_IDS = ['clip-a', 'clip-b', 'clip-c', 'clip-d'] as const;

/**
 * Full roster, in join order. A call with N participants shows `ROSTER.slice(0, N)`.
 * The first entry is always the signed-in user; the second is the DM peer so a
 * 2-person call is the 1:1 baseline.
 */
export const ROSTER: VideoParticipant[] = [
  {
    id: SELF_ID,
    name: 'Leonard Riley',
    avatarSrc: avatarLeonard,
    host: true,
    self: true,
    cameraOn: true,
    muted: false,
  },
  {
    id: DM_PEER_ID,
    name: 'Marco Rinaldi',
    avatarSrc: avatarMarco,
    cameraOn: true,
    muted: false,
    talking: true,
    clipId: 'clip-a',
  },
  {
    id: 'sofia',
    name: 'Sofia Bauer',
    avatarSrc: avatarSofia,
    cameraOn: true,
    muted: true,
    clipId: 'clip-b',
  },
  {
    id: 'aiko',
    name: 'Aiko Tan',
    avatarSrc: avatarAikoTan,
    cameraOn: false,
    muted: true,
  },
  {
    id: 'arjun',
    name: 'Arjun Patel',
    avatarSrc: avatarArjunPatel,
    cameraOn: true,
    muted: true,
    clipId: 'clip-c',
  },
  {
    id: 'danielle',
    name: 'Danielle Okoro',
    avatarSrc: avatarDanielle,
    cameraOn: true,
    muted: true,
    clipId: 'clip-d',
  },
  {
    id: 'darius',
    name: 'Darius Cole',
    avatarSrc: avatarDariusCole,
    cameraOn: false,
    muted: true,
  },
  {
    id: 'david',
    name: 'David Liang',
    avatarSrc: avatarDavidLiang,
    cameraOn: true,
    muted: true,
    clipId: 'clip-a',
  },
  {
    id: 'emma',
    name: 'Emma Novak',
    avatarSrc: avatarEmmaNovak,
    cameraOn: true,
    muted: true,
    clipId: 'clip-b',
  },
  {
    id: 'ethan',
    name: 'Ethan Brooks',
    cameraOn: false,
    muted: true,
  },
];

export const REACTIONS = ['👍', '👏', '🎉', '😂', '❤️'] as const;
