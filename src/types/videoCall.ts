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

/** Where the call lives: a 1:1 DM, a group DM, or a channel. */
export type CallContext = 'dm' | 'gm' | 'channel';

/**
 * Where the user is in the call lifecycle. Every phase renders in whichever
 * surface is active (widget or window); there is no separate modal.
 */
/**
 * `idle`: no call. `ongoing`: a call is running in a group / channel and you are
 * not in it (Join). `joining`: you accepted an incoming call and the connection is being set up. The rest are the user's own steps through a call.
 */
export type CallPhase =
  | 'idle'
  | 'ongoing'
  | 'pre-join'
  | 'calling'
  | 'incoming'
  | 'joining'
  | 'active';

/** `widget` = the small card over the sidebar; `window` = the expanded dark call window. */
export type CallSurface = 'widget' | 'window';

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
  | 'host'
  | 'network'
  | 'recording'
  | 'recording-started'
  | 'device'
  | 'permission'
  | 'info';

export interface CallNotice {
  id: string;
  kind: CallNoticeKind;
  text: string;
  /**
   * Which call surface shows it. Omit for both. A leave notice is
   * window-only, and the "You're muted" hint on joining is widget-only,
   * as in mattermost-plugin-calls.
   */
  surface?: 'widget' | 'window';
}

/**
 * How a call looks and which controls it has. Chosen when the call starts and
 * kept for the whole call.
 *
 * - `video`: a Mattermost call on a server with video enabled. A call started
 *   with "Start audio call" is still `video` (camera off; it can be turned on
 *   at any time).
 * - `audio`: a Mattermost call on a server with video disabled (today's calls
 *   plugin). No camera controls, no self view.
 * - `phone`: an outbound phone (SIP) call. 1:1, audio only, widget only.
 */
export type CallMode = 'video' | 'audio' | 'phone';

/** Server settings that decide which ways to call the conversation offers. */
export interface CallFeatures {
  /** Video calling is enabled. When off, Mattermost calls are audio-only. */
  video: boolean;
  /** Outbound SIP phone calling is enabled. */
  phone: boolean;
}
