import type {
  CallContext,
  CallFeatures,
  CallMode,
  CallPhase,
  CallSurface,
  JoinMode,
} from '@/types/videoCall';

/**
 * The prototype is driven by three independent axes rather than a flat scene
 * list: where the conversation is (context), where the user is in the call
 * (phase) and which call surface is showing (surface). The prototype chrome
 * exposes one switcher per axis; `DEMO_SCENES` names useful combinations for
 * the walkthrough.
 */
export const CONTEXTS: { id: CallContext; label: string }[] = [
  { id: 'dm', label: 'DM' },
  { id: 'gm', label: 'GM' },
  { id: 'channel', label: 'Channel' },
];

export const PHASES: { id: CallPhase; label: string }[] = [
  { id: 'idle', label: 'No call' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'pre-join', label: 'Pre-join' },
  { id: 'calling', label: 'Calling' },
  { id: 'incoming', label: 'Incoming' },
  { id: 'joining', label: 'Joining' },
  { id: 'active', label: 'In call' },
];

export const SURFACES: { id: CallSurface; label: string }[] = [
  { id: 'widget', label: 'Widget' },
  { id: 'window', label: 'Window' },
];

/** The mode a Mattermost call gets: video when the server has it, otherwise audio. */
export function mattermostModeFor(features: CallFeatures): CallMode {
  return features.video ? 'video' : 'audio';
}

/**
 * A phone call is a 1:1 DM call that dials straight away: no pre-join, and it
 * is never incoming, joining or ongoing (outbound only). An audio-only call
 * (video off) has no pre-join either.
 */
export function phaseAvailableForMode(
  mode: CallMode,
  context: CallContext,
  phase: CallPhase,
) {
  if (mode === 'phone') {
    return (
      context === 'dm' &&
      (phase === 'idle' || phase === 'calling' || phase === 'active')
    );
  }
  // With video off there is no camera to check, so no pre-join: a DM rings
  // straight away and a group / channel call connects straight away.
  if (mode === 'audio' && phase === 'pre-join') return false;
  return phaseAvailable(context, phase);
}

/**
 * Only 1:1 DM calls ring (and so show `joining` after Accept); groups and
 * channels go pre-join -> active. A call
 * that is already running without you (`ongoing`) only exists in groups and
 * channels.
 */
export function phaseAvailable(context: CallContext, phase: CallPhase) {
  if (phase === 'calling' || phase === 'incoming' || phase === 'joining') {
    return context === 'dm';
  }
  if (phase === 'ongoing') return context !== 'dm';
  return true;
}

/**
 * The pre-join variant implied by where the call is started from: a DM always
 * starts (and rings); in a group / channel, arriving from `ongoing` joins the
 * running call, arriving from `idle` starts a new one. Any other phase keeps
 * the current mode.
 */
export function joinModeFor(
  context: CallContext,
  fromPhase: CallPhase = 'idle',
  current: JoinMode = 'start',
): JoinMode {
  if (context === 'dm') return 'start';
  if (fromPhase === 'ongoing') return 'join-group';
  if (fromPhase === 'idle') return 'start';
  return current;
}

/**
 * Incoming and joining cards cannot be expanded; the window hosts the other
 * phases. A phone call has no window at all: it stays in the widget.
 */
export function surfaceAvailable(
  phase: CallPhase,
  surface: CallSurface,
  mode: CallMode = 'video',
) {
  if (mode === 'phone') return surface === 'widget';
  if (
    phase === 'idle' ||
    phase === 'ongoing' ||
    phase === 'incoming' ||
    phase === 'joining'
  ) {
    return surface === 'widget';
  }
  return true;
}

export type DemoSceneId =
  | 'dm'
  | 'gm'
  | 'channel'
  | 'prejoin-widget'
  | 'prejoin-window'
  | 'calling-widget'
  | 'calling-window'
  | 'incoming'
  | 'joining'
  | 'call-widget'
  | 'call-window'
  | 'screen-share'
  | 'phone-calling'
  | 'phone-call';

export interface DemoScene {
  id: DemoSceneId;
  label: string;
  context: CallContext;
  phase: CallPhase;
  surface: CallSurface;
  sharing?: boolean;
  /** Set for scenes that need a specific mode; others use the server features. */
  mode?: CallMode;
}

/** Named combinations of the three axes (used by the walkthrough). */
export const DEMO_SCENES: DemoScene[] = [
  { id: 'dm', label: 'DM', context: 'dm', phase: 'idle', surface: 'widget' },
  { id: 'gm', label: 'GM', context: 'gm', phase: 'idle', surface: 'widget' },
  {
    id: 'channel',
    label: 'Channel',
    context: 'channel',
    phase: 'idle',
    surface: 'widget',
  },
  {
    id: 'prejoin-widget',
    label: 'Pre-join (widget)',
    context: 'dm',
    phase: 'pre-join',
    surface: 'widget',
  },
  {
    id: 'prejoin-window',
    label: 'Pre-join (window)',
    context: 'dm',
    phase: 'pre-join',
    surface: 'window',
  },
  {
    id: 'calling-widget',
    label: 'Calling (widget)',
    context: 'dm',
    phase: 'calling',
    surface: 'widget',
  },
  {
    id: 'calling-window',
    label: 'Calling (window)',
    context: 'dm',
    phase: 'calling',
    surface: 'window',
  },
  {
    id: 'incoming',
    label: 'Incoming',
    context: 'dm',
    phase: 'incoming',
    surface: 'widget',
  },
  {
    id: 'joining',
    label: 'Joining',
    context: 'dm',
    phase: 'joining',
    surface: 'widget',
  },
  {
    id: 'call-widget',
    label: 'In call (widget)',
    context: 'dm',
    phase: 'active',
    surface: 'widget',
  },
  {
    id: 'call-window',
    label: 'In call (window)',
    context: 'dm',
    phase: 'active',
    surface: 'window',
  },
  {
    id: 'screen-share',
    label: 'Screen share',
    context: 'dm',
    phase: 'active',
    surface: 'window',
    sharing: true,
  },
  {
    id: 'phone-calling',
    label: 'Phone: calling',
    context: 'dm',
    phase: 'calling',
    surface: 'widget',
    mode: 'phone',
  },
  {
    id: 'phone-call',
    label: 'Phone: in call',
    context: 'dm',
    phase: 'active',
    surface: 'widget',
    mode: 'phone',
  },
];
