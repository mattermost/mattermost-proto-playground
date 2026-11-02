import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import aikoClip from '@/assets/video/aiko.mp4';
import aikoPoster from '@/assets/video/aiko-poster.jpg';
import danielleClip from '@/assets/video/danielle.mp4';
import daniellePoster from '@/assets/video/danielle-poster.jpg';
import sofiaClip from '@/assets/video/sofia.mp4';
import sofiaPoster from '@/assets/video/sofia-poster.jpg';
import arjunClip from '@/assets/video/arjun.mp4';
import arjunPoster from '@/assets/video/arjun-poster.jpg';
import dariusClip from '@/assets/video/darius.mp4';
import dariusPoster from '@/assets/video/darius-poster.jpg';
import marcoClip from '@/assets/video/marco.mp4';
import marcoPoster from '@/assets/video/marco-poster.jpg';
import type { VideoStageClip } from './components/VideoStage';
import type { VideoParticipant } from '@/types/videoCall';

export const CHANNEL_NAME = 'UX Design';
export const SELF_ID = 'leonard';
/** The other person in the 1:1 DM. */
export const DM_PEER_ID = 'marco';
/** Who started the call that is already running in a group / channel. */
export const GROUP_STARTER_ID = 'sofia';

/**
 * Remote video loops, keyed by `VideoParticipant.clipId` (one entry per
 * participant). Clips are generated placeholders, see src/assets/video/README.md.
 * `offset` staggers each loop's start so tiles never move in lockstep; a clip can
 * be shared between participants with a different `offset` / `mirrored`. A
 * participant with `cameraOn` but no entry here falls back to the avatar.
 */
export const CLIPS: Record<string, VideoStageClip> = {
  marco: { src: marcoClip, poster: marcoPoster },
  sofia: { src: sofiaClip, poster: sofiaPoster, offset: 0 },
  aiko: { src: aikoClip, poster: aikoPoster, offset: 3 },
  arjun: { src: arjunClip, poster: arjunPoster, offset: 6 },
  danielle: { src: danielleClip, poster: daniellePoster, offset: 1.5 },
  darius: { src: dariusClip, poster: dariusPoster, offset: 4.5 },
};

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
    clipId: 'marco',
  },
  {
    id: 'sofia',
    name: 'Sofia Bauer',
    avatarSrc: avatarSofia,
    cameraOn: true,
    muted: true,
    clipId: 'sofia',
  },
  {
    id: 'aiko',
    name: 'Aiko Tan',
    avatarSrc: avatarAikoTan,
    cameraOn: true,
    muted: true,
    clipId: 'aiko',
  },
  {
    id: 'arjun',
    name: 'Arjun Patel',
    avatarSrc: avatarArjunPatel,
    cameraOn: true,
    muted: true,
    clipId: 'arjun',
  },
  {
    id: 'danielle',
    name: 'Danielle Okoro',
    avatarSrc: avatarDanielle,
    cameraOn: true,
    muted: true,
    clipId: 'danielle',
  },
  {
    id: 'darius',
    name: 'Darius Cole',
    avatarSrc: avatarDariusCole,
    cameraOn: true,
    muted: true,
    clipId: 'darius',
  },
  {
    id: 'david',
    name: 'David Liang',
    avatarSrc: avatarDavidLiang,
    cameraOn: false,
    muted: true,
  },
  {
    id: 'emma',
    name: 'Emma Novak',
    avatarSrc: avatarEmmaNovak,
    cameraOn: false,
    muted: true,
  },
  {
    id: 'ethan',
    name: 'Ethan Brooks',
    cameraOn: false,
    muted: true,
  },
];

export const REACTIONS = ['👍', '👏', '🎉', '😂', '❤️'] as const;

/** Group DM display name: first names of up to three other members. */
export function groupChatName(count: number): string {
  return ROSTER.slice(1, count)
    .slice(0, 3)
    .map((p) => p.name.split(' ')[0])
    .join(', ');
}

export type ShareKind = 'screen' | 'window' | 'tab';

/** What is being shared into the call (named in the widget and the window). */
export interface ShareSource {
  kind: ShareKind;
  label: string;
  /** Reads in a sentence: "You're sharing <what>". */
  what: string;
}

/** The stand-in share used by the walkthrough and demo scenes (no capture). */
export const DEFAULT_SHARE_SOURCE: ShareSource = {
  kind: 'screen',
  label: 'Entire screen',
  what: 'your entire screen',
};

/** How long the call that is already running in a group / channel has been going. */
export const ONGOING_ELAPSED_MS = (12 * 60 + 40) * 1000;
