import { useCallback, useMemo, useState } from 'react';
import {
  MAX_PARTICIPANTS,
  type CallContext,
  type CallFeatures,
  type CallMode,
  type CallNotice,
  type CallPane,
  type CallPhase,
  type CallSurface,
  type JoinMode,
  type MediaPrefs,
  type StageView,
  type VideoParticipant,
} from '@/types/videoCall';
import {
  DEFAULT_SHARE_SOURCE,
  DM_PEER_ID,
  GROUP_STARTER_ID,
  ONGOING_ELAPSED_MS,
  ROSTER,
  SELF_ID,
  type ShareSource,
} from './videoCallsData';
import {
  DEMO_SCENES,
  joinModeFor,
  mattermostModeFor,
  phaseAvailable,
  phaseAvailableForMode,
  surfaceAvailable,
  type DemoSceneId,
  type MyConnection,
  type RemoteVideo,
} from './videoCalls.scenes';

export interface VideoCallState {
  /** Where the conversation is: 1:1 DM, group DM, or channel. */
  callContext: CallContext;
  /** Server settings: which ways to call the conversation offer (prototype chrome). */
  features: CallFeatures;
  /** How the current call looks (video, audio-only, phone). Fixed for the call. */
  mode: CallMode;
  /**
   * The person's setting in the Calls plugin settings: skip the pre-join
   * interstitial and start a call immediately (off by default).
   */
  skipPreJoin: boolean;
  /** Your microphone is picking up your voice (set from the real mic while in a call). */
  selfSpeaking: boolean;
  /** Where the user is in the call lifecycle. */
  phase: CallPhase;
  /** Widget (small card over the sidebar) or the expanded window. */
  surface: CallSurface;
  joinMode: JoinMode;
  media: MediaPrefs;
  /** Participants in the call (2 = the 1:1 baseline). Clamped to 2..MAX_PARTICIPANTS. */
  count: number;
  /**
   * Prototype-chrome control: other people's video. `on` / `off` apply to
   * everyone else; `mixed` turns off every second other person (groups only).
   * `loading`, `poor` and `reconnecting` apply to one person only: the first
   * other participant (see `RemoteVideo`).
   */
  remoteVideo: RemoteVideo;
  /**
   * An outgoing call was just answered: the other person's video is still
   * connecting (spinner), for a moment, between Calling and the live call.
   */
  connectingVideo: boolean;
  /** People who just joined a live call: their video is still connecting (spinner). */
  connectingIds: string[];
  /**
   * Prototype-chrome control: your own connection. Sets the state of your
   * tile; poor and reconnecting also post one persistent network warning.
   */
  myConnection: MyConnection;
  /** Per-participant overrides applied on top of ROSTER (talking, muted, hand, ...). */
  overrides: Record<string, Partial<VideoParticipant>>;
  /** Participants a host removed from the call (cleared when the count is set). */
  removedIds: string[];
  view: StageView;
  /**
   * Participant you pinned (local to your view): featured in the speaker views
   * until unpinned. One at a time; cleared when they leave or the call ends.
   */
  pinnedId: string | null;
  pane: CallPane;
  handRaised: boolean;
  sharing: boolean;
  /** What you are sharing while `sharing` is on (named in the widget and window). */
  shareSource: ShareSource | null;
  /** Mock call recording (shows the REC pill in the window, a dot in the widget). */
  recording: boolean;
  /** Call info: whether external participants may join (mock toggle). */
  externalEnabled: boolean;
  notices: CallNotice[];
  callStartedAt: number | null;
  /** Seconds of the last finished call; the chat shows a "Call ended" post. */
  endedDurationSec: number;
  /** When the last call ended (ms), for the "Ended at …" call card. */
  endedAt: number | null;
  /** Recordings started during the current / last call (the ended card lists them). */
  recordingsMade: number;
  /** Who started the current / last call (the call card's author). */
  callerId: string;
  /**
   * When the call already running in a group / channel started. Shared by the
   * banner's elapsed time and the call card's "N minutes ago", so they agree.
   */
  ongoingStartedAt: number;
  /** The last group / channel size, kept while a DM (always 1:1) is open. */
  groupCount: number;
  /** Set when an incoming call rang out; the DM shows a missed-call post. */
  missedCall: boolean;
  /** Set when you declined an incoming call; the DM shows a declined-call post. */
  declinedCall: boolean;
  /** Set when you cancelled an outgoing call before it was answered; the DM shows a canceled-call post. */
  canceledCall: boolean;
  soundOn: boolean;
}

/** A group/channel call defaults to a few people so layouts beyond 1:1 show up. */
const DEFAULT_GROUP_COUNT = 4;

const INITIAL_STATE: VideoCallState = {
  features: { video: true, phone: true },
  mode: 'video',
  skipPreJoin: false,
  selfSpeaking: false,
  callContext: 'dm',
  phase: 'idle',
  surface: 'widget',
  joinMode: 'start',
  media: { micOn: true, cameraOn: false, useWebcam: false },
  count: 2,
  remoteVideo: 'on',
  connectingVideo: false,
  connectingIds: [],
  myConnection: 'good',
  overrides: {},
  removedIds: [],
  view: 'speaker',
  pinnedId: null,
  pane: null,
  handRaised: false,
  sharing: false,
  shareSource: null,
  recording: false,
  externalEnabled: false,
  notices: [],
  callStartedAt: null,
  endedDurationSec: 0,
  endedAt: null,
  recordingsMade: 0,
  callerId: SELF_ID,
  ongoingStartedAt: Date.now() - ONGOING_ELAPSED_MS,
  groupCount: DEFAULT_GROUP_COUNT,
  missedCall: false,
  declinedCall: false,
  canceledCall: false,
  soundOn: true,
};

let noticeSeq = 0;
const MAX_NOTICES = 5;
/** Notices that stay until dismissed (mirrors CallNotice's defaults). */
const PERSISTENT_NOTICE_KINDS: readonly CallNotice['kind'][] = [
  'network',
  'permission',
  'device',
  'recording-started',
];

/** The network warning for your own connection (none while it is good). */
const MY_CONNECTION_NOTICE: Record<MyConnection, string | null> = {
  good: null,
  poor: 'Your connection is poor. Video may pause.',
  reconnecting: 'Reconnecting to the call…',
};

/**
 * Cap the stack at MAX_NOTICES. Drop the oldest transient notice first so a
 * network / permission / device warning is not pushed off by chatter; only a
 * stack of nothing but persistent notices loses its oldest.
 */
function trimNotices(list: CallNotice[]): CallNotice[] {
  const out = [...list];
  while (out.length > MAX_NOTICES) {
    const i = out.findIndex((n) => !PERSISTENT_NOTICE_KINDS.includes(n.kind));
    out.splice(i === -1 ? 0 : i, 1);
  }
  return out;
}

function clampCount(count: number) {
  return Math.min(MAX_PARTICIPANTS, Math.max(2, Math.round(count)));
}

/**
 * Count that matches the context: DMs are always 1:1; a group / channel returns
 * to the size it last had (so a 1:1 check does not lose a custom People value,
 * including 2).
 */
function countFor(context: CallContext, groupCount: number) {
  return context === 'dm' ? 2 : groupCount;
}

/** The pin survives a new count only while the pinned person is still in it. */
function pinWithin(pinnedId: string | null, count: number) {
  return pinnedId && ROSTER.slice(0, count).some((p) => p.id === pinnedId)
    ? pinnedId
    : null;
}

/** Whether you are about to join, or jump into, a call already running without you. */
function joinsRunningCall(s: VideoCallState) {
  return (
    s.callContext !== 'dm' &&
    (s.phase === 'ongoing' ||
      (s.phase === 'pre-join' && s.joinMode === 'join-group'))
  );
}

/** Per-call state that never carries over into a new call. */
const PER_CALL_RESET: Partial<VideoCallState> = {
  selfSpeaking: false,
  // Prototype-chrome connection / video states belong to one call.
  remoteVideo: 'on',
  connectingVideo: false,
  connectingIds: [],
  myConnection: 'good',
  recording: false,
  handRaised: false,
  removedIds: [],
  overrides: {},
  notices: [],
  pinnedId: null,
};

/** Fields that reset whenever a call ends or is abandoned. */
const CALL_RESET: Partial<VideoCallState> = {
  ...PER_CALL_RESET,
  phase: 'idle',
  surface: 'widget',
  sharing: false,
  shareSource: null,
  pane: null,
  callStartedAt: null,
};

/** The webcam is released with the call; the next call starts camera-off. */
function releaseCamera(media: MediaPrefs): MediaPrefs {
  return { ...media, cameraOn: false, useWebcam: false };
}

/**
 * A call ended or was abandoned: reset call fields and release the webcam.
 *
 * Leaving a group / channel call never ends it for the others (only the host's
 * End call for everyone does), so the conversation goes back to Ongoing, whoever
 * started it. Cancelling or abandoning one you were still starting, or a DM
 * call (1:1 calls end for both people), goes back to No call. Backing out of
 * joining a call someone else started returns to Ongoing.
 */
function endCall(s: VideoCallState, leaving = false): VideoCallState {
  const groupOrChannel = s.callContext !== 'dm';
  const continues = groupOrChannel && (leaving || s.callerId !== SELF_ID);
  return {
    ...s,
    ...CALL_RESET,
    mode: mattermostModeFor(s.features),
    phase: continues ? 'ongoing' : 'idle',
    // The running call keeps the time it started, so the banner and card agree.
    ongoingStartedAt:
      continues && leaving && s.callerId === SELF_ID && s.callStartedAt
        ? s.callStartedAt
        : s.ongoingStartedAt,
    media: releaseCamera(s.media),
  };
}

export function useVideoCallState() {
  const [state, setState] = useState<VideoCallState>(INITIAL_STATE);

  const patch = useCallback((next: Partial<VideoCallState>) => {
    setState((s) => ({ ...s, ...next }));
  }, []);

  /** Roster slice for the current count with overrides and self media applied. */
  const participants = useMemo<VideoParticipant[]>(() => {
    const present = ROSTER.slice(0, state.count).filter(
      (p) => !state.removedIds.includes(p.id),
    );
    // The first other person in the roster (the DM peer, or the default
    // featured speaker in a group) gets the in-between video states.
    const focusId = present.find((p) => p.id !== SELF_ID)?.id;
    const list = present.map((p) => {
      const merged = { ...p, ...state.overrides[p.id] };
      // Audio-only and phone calls never show a camera.
      const cameraAvailable = state.mode === 'video';
      if (p.id === SELF_ID) {
        return {
          ...merged,
          muted: !state.media.micOn,
          // Highlighted when your microphone detects your voice (never while muted).
          talking: state.selfSpeaking && state.media.micOn,
          cameraOn: cameraAvailable && state.media.cameraOn,
          blurBackground: !!state.media.blurBackground,
          handRaised: state.handRaised,
          sharing: state.sharing,
          connection: state.myConnection,
        };
      }
      // Prototype control for other people's video (see `remoteVideo`).
      // The in-between states apply to the first other person only.
      const focus = p.id === focusId;
      const connection =
        focus &&
        (state.remoteVideo === 'poor' || state.remoteVideo === 'reconnecting')
          ? state.remoteVideo
          : merged.connection;
      if (!cameraAvailable) return { ...merged, connection, cameraOn: false };
      if (
        (focus && (state.remoteVideo === 'loading' || state.connectingVideo)) ||
        state.connectingIds.includes(p.id)
      ) {
        return { ...merged, connection, cameraOn: true, videoLoading: true };
      }
      const remoteIndex = ROSTER.filter((r) => r.id !== SELF_ID).findIndex(
        (r) => r.id === p.id,
      );
      const off =
        state.remoteVideo === 'off' ||
        (state.remoteVideo === 'mixed' && remoteIndex % 2 === 1);
      return off
        ? { ...merged, connection, cameraOn: false }
        : { ...merged, connection };
    });
    // One active speaker at a time: you while your microphone hears you,
    // otherwise the first person marked as talking.
    let haveSpeaker = state.selfSpeaking && state.media.micOn;
    return list.map((p) => {
      if (p.self || !p.talking) return p;
      if (haveSpeaker) return { ...p, talking: false };
      haveSpeaker = true;
      return p;
    });
  }, [
    state.mode,
    state.selfSpeaking,
    state.count,
    state.removedIds,
    state.overrides,
    state.remoteVideo,
    state.connectingVideo,
    state.connectingIds,
    state.myConnection,
    state.media,
    state.handRaised,
    state.sharing,
  ]);

  const actions = useMemo(
    () => ({
      patch,

      // --- Prototype chrome (demo axes) ---------------------------------
      /** Switch the conversation. Ends any call that cannot exist there. */
      setContext: (context: CallContext) =>
        setState((s) => {
          const keepPhase = phaseAvailableForMode(s.mode, context, s.phase);
          return {
            ...s,
            callContext: context,
            count: countFor(context, s.groupCount),
            pinnedId: pinWithin(s.pinnedId, countFor(context, s.groupCount)),
            joinMode: joinModeFor(context, s.phase, s.joinMode),
            // Mixed is a group-only look; a DM falls back to video on.
            remoteVideo:
              context === 'dm' && s.remoteVideo === 'mixed'
                ? 'on'
                : s.remoteVideo,
            ...(keepPhase
              ? {}
              : {
                  ...CALL_RESET,
                  mode: mattermostModeFor(s.features),
                  media: releaseCamera(s.media),
                }),
          };
        }),
      /** Jump to a phase (chrome switcher). Sets the state a real flow would. */
      setPhase: (phase: CallPhase) =>
        setState((s) => {
          if (!phaseAvailable(s.callContext, phase)) return s;
          // A phone call only has calling and in-call; any other phase is a
          // Mattermost call, and no call at all returns to the server default.
          const mode =
            phase !== 'idle' &&
            phaseAvailableForMode(s.mode, s.callContext, phase)
              ? s.mode
              : mattermostModeFor(s.features);
          const surface = surfaceAvailable(phase, s.surface, mode)
            ? s.surface
            : 'widget';
          return {
            ...s,
            ...PER_CALL_RESET,
            mode,
            media: phase === 'idle' ? releaseCamera(s.media) : s.media,
            phase,
            surface,
            joinMode: joinModeFor(s.callContext, s.phase, s.joinMode),
            callStartedAt:
              phase === 'active'
                ? joinsRunningCall(s)
                  ? s.ongoingStartedAt
                  : Date.now()
                : null,
            sharing: phase === 'active' ? s.sharing : false,
            shareSource: phase === 'active' ? s.shareSource : null,
            pane: phase === 'active' ? s.pane : null,
            missedCall: false,
            declinedCall: false,
            canceledCall: false,
            endedAt: null,
            recordingsMade: 0,
            callerId:
              phase === 'incoming' || phase === 'joining'
                ? DM_PEER_ID
                : phase === 'ongoing'
                  ? GROUP_STARTER_ID
                  : s.phase === 'idle'
                    ? SELF_ID
                    : s.callerId,
          };
        }),
      setSurface: (surface: CallSurface) =>
        setState((s) =>
          surfaceAvailable(s.phase, surface, s.mode) ? { ...s, surface } : s,
        ),
      /** Prototype-chrome control: server settings (video / phone calling on or off). */
      setFeatures: (next: Partial<CallFeatures>) =>
        setState((s) => {
          const features = { ...s.features, ...next };
          // Turning phone calling off ends a phone call in progress.
          if (s.mode === 'phone' && !features.phone) {
            return {
              ...endCall(s),
              features,
              mode: mattermostModeFor(features),
            };
          }
          if (s.mode === 'phone') return { ...s, features };
          const mode = mattermostModeFor(features);
          return {
            ...s,
            features,
            mode,
            media: mode === 'audio' ? releaseCamera(s.media) : s.media,
          };
        }),
      /** Named combination (walkthrough, tests). */
      goToDemo: (id: DemoSceneId) =>
        setState((s) => {
          const demo = DEMO_SCENES.find((d) => d.id === id);
          if (!demo) return s;
          // A phone scene needs phone calling on; other scenes need video for
          // the camera-on look, so the walkthrough restores both.
          const features =
            demo.mode === 'phone'
              ? { ...s.features, phone: true }
              : { ...s.features, video: true };
          const mode = demo.mode ?? mattermostModeFor(features);
          return {
            ...s,
            ...PER_CALL_RESET,
            features,
            mode,
            media: demo.phase === 'idle' ? releaseCamera(s.media) : s.media,
            callContext: demo.context,
            count: countFor(demo.context, s.groupCount),
            joinMode: joinModeFor(demo.context, s.phase, s.joinMode),
            phase: demo.phase,
            surface: demo.surface,
            sharing: Boolean(demo.sharing),
            shareSource: demo.sharing ? DEFAULT_SHARE_SOURCE : null,
            view: 'speaker',
            pane: null,
            missedCall: false,
            declinedCall: false,
            canceledCall: false,
            endedAt: null,
            recordingsMade: 0,
            callerId:
              demo.phase === 'incoming' || demo.phase === 'joining'
                ? DM_PEER_ID
                : demo.phase === 'ongoing'
                  ? GROUP_STARTER_ID
                  : SELF_ID,
            callStartedAt: demo.phase === 'active' ? Date.now() : null,
          };
        }),
      /** Prototype-chrome control: set the number of people (2..MAX_PARTICIPANTS). */
      setCount: (count: number) =>
        setState((s) => {
          const next = clampCount(count);
          return {
            ...s,
            count: next,
            groupCount: s.callContext === 'dm' ? s.groupCount : next,
            removedIds: [],
            pinnedId: pinWithin(s.pinnedId, next),
          };
        }),

      // --- Real flow -------------------------------------------------------
      /** Header "Start call" / banner "Join": opens the widget at pre-join. */
      startCall: (opts?: {
        audioOnly?: boolean;
        video?: boolean;
        /** Dial the DM peer's phone number: no pre-join, rings straight away. */
        phone?: boolean;
        /** Started by opening a call link: always shows the pre-join interstitial. */
        fromLink?: boolean;
      }) =>
        setState((s) => {
          if (opts?.phone) {
            if (!s.features.phone || s.callContext !== 'dm') return s;
            return {
              ...s,
              ...PER_CALL_RESET,
              mode: 'phone',
              phase: 'calling',
              surface: 'widget',
              joinMode: 'start',
              missedCall: false,
              declinedCall: false,
              canceledCall: false,
              endedDurationSec: 0,
              endedAt: null,
              recordingsMade: 0,
              callerId: SELF_ID,
              media: releaseCamera(s.media),
            };
          }
          const mode = mattermostModeFor(s.features);
          // The pre-join interstitial is the default when starting a call. A
          // person can skip it in the Calls plugin settings. Joining a running
          // call and opening a call link always show it, because nothing in the
          // link or the menu says it will start a call.
          const skip =
            !opts?.fromLink && s.phase !== 'ongoing' && s.skipPreJoin;
          // Audio-only starts with the camera off (and releases the webcam);
          // "Start video call" turns it on, which also asks the browser for the
          // webcam (the menu pick is the user gesture).
          const media =
            opts?.audioOnly || mode === 'audio'
              ? releaseCamera(s.media)
              : opts?.video
                ? { ...s.media, cameraOn: true, useWebcam: true }
                : s.media;
          if (skip) {
            // A DM rings straight away; a group / channel call connects.
            const dm = s.callContext === 'dm';
            return {
              ...s,
              ...PER_CALL_RESET,
              mode,
              phase: dm ? 'calling' : 'active',
              surface: 'widget',
              joinMode: 'start',
              missedCall: false,
              declinedCall: false,
              canceledCall: false,
              endedDurationSec: 0,
              endedAt: null,
              recordingsMade: 0,
              callStartedAt: dm ? null : Date.now(),
              callerId: SELF_ID,
              media,
            };
          }
          return {
            ...s,
            ...PER_CALL_RESET,
            mode,
            phase: 'pre-join',
            surface: 'widget',
            joinMode: joinModeFor(s.callContext, s.phase, s.joinMode),
            missedCall: false,
            declinedCall: false,
            canceledCall: false,
            endedDurationSec: 0,
            endedAt: null,
            recordingsMade: 0,
            // Joining a call that is already running means someone else started it.
            callerId: s.phase === 'ongoing' ? GROUP_STARTER_ID : SELF_ID,
            media,
          };
        }),
      /** Pre-join primary action: a 1:1 call rings; group/channel joins directly. */
      confirmPreJoin: () =>
        setState((s) =>
          s.callContext === 'dm'
            ? { ...s, phase: 'calling' }
            : {
                ...s,
                phase: 'active',
                // Joining a call that is already running keeps its start time.
                callStartedAt: joinsRunningCall(s)
                  ? s.ongoingStartedAt
                  : Date.now(),
              },
        ),
      /**
       * Calling answered: the call is live, and the other person's video is
       * still connecting (see `connectingVideo`).
       */
      connect: () =>
        setState((s) => ({
          ...s,
          phase: 'active',
          callStartedAt: Date.now(),
          connectingVideo: true,
        })),
      /** People joined a live call: their video is connecting (spinner). */
      startConnecting: (ids: string[]) =>
        setState((s) => ({
          ...s,
          connectingIds: [...new Set([...s.connectingIds, ...ids])],
        })),
      /** Those people's video has arrived. */
      videoConnectedFor: (ids: string[]) =>
        setState((s) =>
          s.connectingIds.some((id) => ids.includes(id))
            ? {
                ...s,
                connectingIds: s.connectingIds.filter(
                  (id) => !ids.includes(id),
                ),
              }
            : s,
        ),
      /** The other person's video has arrived. */
      videoConnected: () =>
        setState((s) =>
          s.connectingVideo ? { ...s, connectingVideo: false } : s,
        ),
      /** Cancel pre-join or an outgoing ring: back to the chat. */
      cancelCall: () =>
        setState((s) =>
          s.phase === 'calling'
            ? { ...endCall(s), canceledCall: true }
            : endCall(s),
        ),
      /** Incoming card: Accept connects in the same widget ("Joining…"), then goes live. */
      accept: (opts?: { audioOnly?: boolean }) =>
        setState((s) => ({
          ...s,
          phase: 'joining',
          surface: 'widget',
          media: opts?.audioOnly ? { ...s.media, cameraOn: false } : s.media,
        })),
      /** Joining finished (or a demo shortcut): the accepted call is live. */
      joined: () =>
        setState((s) =>
          s.phase === 'joining'
            ? { ...s, phase: 'active', callStartedAt: Date.now() }
            : s,
        ),
      /** Incoming card: Decline returns to the chat with a "Call declined" post both people see. */
      decline: () => setState((s) => ({ ...endCall(s), declinedCall: true })),
      /** Incoming call rang out: the chat gets a missed-call post. */
      missIncoming: () =>
        setState((s) => ({ ...endCall(s), missedCall: true })),
      expand: () => setState((s) => ({ ...s, surface: 'window' })),
      collapse: () =>
        setState((s) => ({ ...s, surface: 'widget', pane: null })),
      /** Hang up: back to the chat; the chat's call post is the only end UI. */
      leave: () =>
        setState((s) => ({
          ...endCall(s, true),
          endedDurationSec: s.callStartedAt
            ? Math.max(1, Math.round((Date.now() - s.callStartedAt) / 1000))
            : 0,
          endedAt: s.callStartedAt ? Date.now() : s.endedAt,
        })),

      // --- In-call ---------------------------------------------------------
      toggleMic: () =>
        setState((s) => ({
          ...s,
          media: { ...s.media, micOn: !s.media.micOn },
        })),
      toggleCamera: () =>
        setState((s) =>
          // Audio-only and phone calls have no camera.
          s.mode === 'video'
            ? { ...s, media: { ...s.media, cameraOn: !s.media.cameraOn } }
            : s,
        ),
      setMedia: (next: Partial<MediaPrefs>) =>
        setState((s) => ({
          ...s,
          // Audio-only and phone calls have no camera, whoever asks for one.
          media: {
            ...s.media,
            ...next,
            ...(s.mode === 'video'
              ? {}
              : { cameraOn: false, useWebcam: false }),
          },
        })),
      toggleHand: () => setState((s) => ({ ...s, handRaised: !s.handRaised })),
      /** Sharing started (the capture, or the stand-in, is running). */
      startShare: (source: ShareSource) =>
        setState((s) =>
          s.phase === 'active'
            ? { ...s, sharing: true, shareSource: source }
            : s,
        ),
      stopShare: () =>
        setState((s) => ({ ...s, sharing: false, shareSource: null })),
      /** Mock recording toggle; also posts a notice like the real product would. */
      toggleRecording: () =>
        setState((s) => {
          const recording = !s.recording;
          return {
            ...s,
            recording,
            recordingsMade: recording ? s.recordingsMade + 1 : s.recordingsMade,
            notices: trimNotices([
              ...s.notices,
              {
                id: `notice-${++noticeSeq}`,
                kind: recording
                  ? ('recording-started' as const)
                  : ('recording' as const),
                text: recording
                  ? 'Recording and transcription has started'
                  : 'Recording stopped',
              },
            ]),
          };
        }),
      /** Voice activity from your real microphone; only transitions change state. */
      setSelfSpeaking: (selfSpeaking: boolean) =>
        setState((s) =>
          s.selfSpeaking === selfSpeaking ? s : { ...s, selfSpeaking },
        ),
      /** The person's Calls plugin setting: skip the pre-join interstitial when starting a call. */
      setSkipPreJoin: (skipPreJoin: boolean) =>
        setState((s) => ({ ...s, skipPreJoin })),
      setExternalEnabled: (externalEnabled: boolean) =>
        setState((s) => ({ ...s, externalEnabled })),
      setView: (view: StageView) => setState((s) => ({ ...s, view })),
      /** Pin someone to the featured slot of your view (replaces any pin); `null` unpins. */
      setPinned: (pinnedId: string | null) =>
        setState((s) => (s.pinnedId === pinnedId ? s : { ...s, pinnedId })),
      togglePane: (pane: Exclude<CallPane, null>) =>
        setState((s) => ({ ...s, pane: s.pane === pane ? null : pane })),
      closePane: () => setState((s) => ({ ...s, pane: null })),
      /** Host control: remove someone from the call (mock). */
      removeParticipant: (id: string) =>
        setState((s) => ({
          ...s,
          removedIds: s.removedIds.includes(id)
            ? s.removedIds
            : [...s.removedIds, id],
          pinnedId: s.pinnedId === id ? null : s.pinnedId,
        })),
      /** Host control: hand the host role to someone else (mock). */
      makeHost: (id: string) =>
        setState((s) => ({
          ...s,
          overrides: {
            ...s.overrides,
            [SELF_ID]: { ...s.overrides[SELF_ID], host: false },
            [id]: { ...s.overrides[id], host: true },
          },
        })),
      patchParticipant: (id: string, next: Partial<VideoParticipant>) =>
        setState((s) => ({
          ...s,
          overrides: { ...s.overrides, [id]: { ...s.overrides[id], ...next } },
        })),
      pushNotice: (notice: Omit<CallNotice, 'id'>) =>
        setState((s) => ({
          ...s,
          // Keep the stack short: rapid changes (e.g. the People stepper) would
          // otherwise bury the tiles under join/leave toasts.
          notices: trimNotices([
            ...s.notices,
            { ...notice, id: `notice-${++noticeSeq}` },
          ]),
        })),
      dismissNotice: (id: string) =>
        setState((s) => ({
          ...s,
          notices: s.notices.filter((n) => n.id !== id),
        })),
      setRemoteVideo: (remoteVideo: RemoteVideo) =>
        setState((s) => ({ ...s, remoteVideo })),
      /**
       * Your own connection (prototype chrome). Keeps exactly one network
       * warning for it: poor and reconnecting replace each other, good removes
       * it. A dismissed warning stays dismissed until the state changes.
       */
      setMyConnection: (myConnection: MyConnection) =>
        setState((s) => {
          if (s.myConnection === myConnection) return s;
          const rest = s.notices.filter((n) => n.kind !== 'network');
          const text = MY_CONNECTION_NOTICE[myConnection];
          return {
            ...s,
            myConnection,
            notices: text
              ? trimNotices([
                  ...rest,
                  { id: `notice-${++noticeSeq}`, kind: 'network', text },
                ])
              : rest,
          };
        }),
      setSoundOn: (soundOn: boolean) => setState((s) => ({ ...s, soundOn })),
      reset: () => setState(INITIAL_STATE),
    }),
    [patch],
  );

  return { state, participants, actions };
}

export type VideoCallActions = ReturnType<typeof useVideoCallState>['actions'];
