import type {
  CallContext,
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
  { id: 'pre-join', label: 'Pre-join' },
  { id: 'calling', label: 'Calling' },
  { id: 'incoming', label: 'Incoming' },
  { id: 'active', label: 'In call' },
];

export const SURFACES: { id: CallSurface; label: string }[] = [
  { id: 'widget', label: 'Widget' },
  { id: 'window', label: 'Window' },
];

/** Only 1:1 DM calls ring; groups and channels go pre-join -> active. */
export function phaseAvailable(context: CallContext, phase: CallPhase) {
  if (phase === 'calling' || phase === 'incoming') return context === 'dm';
  return true;
}

/** The pre-join variant implied by where the call is started from. */
export function joinModeFor(context: CallContext): JoinMode {
  return context === 'dm' ? 'start' : 'join-group';
}

/** Incoming cards cannot be expanded; the window only hosts the other phases. */
export function surfaceAvailable(phase: CallPhase, surface: CallSurface) {
  if (phase === 'idle' || phase === 'incoming') return surface === 'widget';
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
  | 'call-widget'
  | 'call-window'
  | 'screen-share';

export interface DemoScene {
  id: DemoSceneId;
  label: string;
  context: CallContext;
  phase: CallPhase;
  surface: CallSurface;
  sharing?: boolean;
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
];
