import { useCallback, useMemo, useState } from 'react';
import {
  MAX_PARTICIPANTS,
  type CallNotice,
  type CallPane,
  type JoinMode,
  type MediaPrefs,
  type StageView,
  type VideoParticipant,
} from '@/types/videoCall';
import { ROSTER, SELF_ID } from './videoCallsData';
import type { SceneId } from './videoCalls.scenes';

export interface VideoCallState {
  scene: SceneId;
  joinMode: JoinMode;
  media: MediaPrefs;
  /** Participants in the call (2 = the 1:1 baseline). Clamped to 2..MAX_PARTICIPANTS. */
  count: number;
  /** Per-participant overrides applied on top of ROSTER (talking, muted, hand, ...). */
  overrides: Record<string, Partial<VideoParticipant>>;
  view: StageView;
  pane: CallPane;
  handRaised: boolean;
  sharing: boolean;
  notices: CallNotice[];
  callStartedAt: number | null;
  endedDurationSec: number;
  soundOn: boolean;
}

const INITIAL_STATE: VideoCallState = {
  scene: 'dm',
  joinMode: 'start',
  media: { micOn: true, cameraOn: true, useWebcam: false },
  count: 2,
  overrides: {},
  view: 'speaker',
  pane: null,
  handRaised: false,
  sharing: false,
  notices: [],
  callStartedAt: null,
  endedDurationSec: 0,
  soundOn: false,
};

let noticeSeq = 0;

export function useVideoCallState() {
  const [state, setState] = useState<VideoCallState>(INITIAL_STATE);

  const patch = useCallback((next: Partial<VideoCallState>) => {
    setState((s) => ({ ...s, ...next }));
  }, []);

  /** Roster slice for the current count with overrides and self media applied. */
  const participants = useMemo<VideoParticipant[]>(() => {
    return ROSTER.slice(0, state.count).map((p) => {
      const merged = { ...p, ...state.overrides[p.id] };
      if (p.id === SELF_ID) {
        return {
          ...merged,
          muted: !state.media.micOn,
          cameraOn: state.media.cameraOn,
          handRaised: state.handRaised,
          sharing: state.sharing,
        };
      }
      return merged;
    });
  }, [state.count, state.overrides, state.media, state.handRaised, state.sharing]);

  const actions = useMemo(
    () => ({
      /** Jump to a scene (SceneSwitcher, walkthrough). Optionally patch state. */
      go: (scene: SceneId, next?: Partial<VideoCallState>) =>
        setState((s) => ({ ...s, ...next, scene })),
      patch,
      /** DM/channel "Call" button → pre-join. `mode` picks the pre-join variant. */
      startPreJoin: (mode: JoinMode) =>
        setState((s) => ({ ...s, joinMode: mode, scene: 'pre-join' })),
      /** Pre-join primary action: 1:1 start rings; accept/group join connect directly. */
      confirmPreJoin: () =>
        setState((s) =>
          s.joinMode === 'start' && s.count === 2
            ? { ...s, scene: 'ringing-out' }
            : { ...s, scene: 'call', callStartedAt: Date.now(), sharing: false },
        ),
      /** Ringing → connected. */
      connect: () =>
        setState((s) => ({ ...s, scene: 'call', callStartedAt: Date.now() })),
      /** Leave / hang up → ended summary. */
      leave: () =>
        setState((s) => ({
          ...s,
          scene: 'ended',
          sharing: false,
          pane: null,
          endedDurationSec: s.callStartedAt
            ? Math.max(1, Math.round((Date.now() - s.callStartedAt) / 1000))
            : 0,
          callStartedAt: null,
        })),
      toggleMic: () =>
        setState((s) => ({ ...s, media: { ...s.media, micOn: !s.media.micOn } })),
      toggleCamera: () =>
        setState((s) => ({
          ...s,
          media: { ...s.media, cameraOn: !s.media.cameraOn },
        })),
      setMedia: (next: Partial<MediaPrefs>) =>
        setState((s) => ({ ...s, media: { ...s.media, ...next } })),
      toggleHand: () => setState((s) => ({ ...s, handRaised: !s.handRaised })),
      /** Start/stop screen share; moves between `call` and `screen-share`. */
      toggleShare: () =>
        setState((s) => {
          const sharing = !s.sharing;
          const inCall = s.scene === 'call' || s.scene === 'screen-share';
          return {
            ...s,
            sharing,
            scene: inCall ? (sharing ? 'screen-share' : 'call') : s.scene,
          };
        }),
      setView: (view: StageView) => setState((s) => ({ ...s, view })),
      togglePane: (pane: Exclude<CallPane, null>) =>
        setState((s) => ({ ...s, pane: s.pane === pane ? null : pane })),
      closePane: () => setState((s) => ({ ...s, pane: null })),
      /** Prototype-chrome control: grow/shrink the call (2..MAX_PARTICIPANTS). */
      setCount: (count: number) =>
        setState((s) => ({
          ...s,
          count: Math.min(MAX_PARTICIPANTS, Math.max(2, Math.round(count))),
        })),
      patchParticipant: (id: string, next: Partial<VideoParticipant>) =>
        setState((s) => ({
          ...s,
          overrides: { ...s.overrides, [id]: { ...s.overrides[id], ...next } },
        })),
      pushNotice: (notice: Omit<CallNotice, 'id'>) =>
        setState((s) => ({
          ...s,
          notices: [...s.notices, { ...notice, id: `notice-${++noticeSeq}` }],
        })),
      dismissNotice: (id: string) =>
        setState((s) => ({
          ...s,
          notices: s.notices.filter((n) => n.id !== id),
        })),
      setSoundOn: (soundOn: boolean) => setState((s) => ({ ...s, soundOn })),
      reset: () => setState(INITIAL_STATE),
    }),
    [patch],
  );

  return { state, participants, actions };
}

export type VideoCallActions = ReturnType<typeof useVideoCallState>['actions'];
