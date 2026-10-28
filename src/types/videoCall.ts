import type { Participant } from '@/types/callParticipant';

/** Hard cap for the multi-party prototype (Calls M1: 10 callers). */
export const MAX_PARTICIPANTS = 10;

export type ConnectionState = 'good' | 'poor' | 'reconnecting';

/**
 * A call participant with video state. Call state is always a list of these;
 * a 1:1 call is simply `length === 2`. Layout is derived from the list, never
 * from hard-coded "remote" / "self" fields.
 */
export interface VideoParticipant extends Participant {
  cameraOn: boolean;
  /** True for the signed-in user. Exactly one participant has `self`. */
  self?: boolean;
  sharing?: boolean;
  handRaised?: boolean;
  /** Transient emoji reaction currently shown over the tile. */
  reaction?: string;
  connection?: ConnectionState;
  /** Key into `CLIPS` (remote video loop). Undefined → avatar fallback. */
  clipId?: string;
}

/**
 * `speaker`: 1:1 = remote large + self PiP; groups = active speaker promoted.
 * `grid`: equal tiles (the Figma "View" toggle).
 */
export type StageView = 'speaker' | 'grid';

/** What the user is doing when they arrive at pre-join. */
export type JoinMode = 'start' | 'accept' | 'join-group';

export type CallPane = 'participants' | 'chat' | null;

export interface MediaPrefs {
  micOn: boolean;
  cameraOn: boolean;
  /** Opt-in real webcam for self-view. Never requested automatically. */
  useWebcam: boolean;
  micDeviceId?: string;
  cameraDeviceId?: string;
  speakerDeviceId?: string;
}

export type CallNoticeKind =
  | 'joined'
  | 'left'
  | 'network'
  | 'recording'
  | 'device'
  | 'permission'
  | 'info';

export interface CallNotice {
  id: string;
  kind: CallNoticeKind;
  text: string;
}
