import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CallInfoPanel } from '@mattermost/compass-proto';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  DIAL_IN_NUMBER,
  DIAL_IN_PIN,
  EXTERNAL_LINK,
  INTERNAL_LINK,
} from '@/fixtures/calls/callConstants';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { playSound } from '../callSounds';
import { CallThreadPane } from '../components/CallThreadPane';
import { DeviceMenu } from '../components/DeviceMenu';
import { ReactionTray } from '../components/ReactionTray';
import type { VideoTileMenu } from '../components/VideoTile';
import { VideoCallWindow } from '../components/VideoCallWindow';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useStageLayout } from '../hooks/useStageLayout';
import { CLIPS, REACTIONS, SELF_ID } from '../videoCallsData';
import {
  appendCallChat,
  getCallChat,
  hasSeenCallChat,
  markCallChatSeen,
} from './callChat';
import CallMoreMenu from './CallMoreMenu';
import ExitingPopover from './ExitingPopover';
import { useCallSession } from './useCallSession';
import styles from './CallWindowHost.module.scss';

type MenuId =
  'mic' | 'camera' | 'reactions' | 'more' | 'view' | 'output' | 'info';

const REACTION_MS = 2500;
const FALLBACK_MICS = [
  { deviceId: 'fallback-mic-1', label: 'Default microphone' },
  { deviceId: 'fallback-mic-2', label: 'External USB microphone' },
];
const FALLBACK_SPEAKERS = [
  { deviceId: 'fallback-speaker-1', label: 'Default speakers' },
  { deviceId: 'fallback-speaker-2', label: 'External headphones' },
];
const FALLBACK_CAMERAS = [
  { deviceId: 'fallback-camera-1', label: 'Built-in camera' },
  { deviceId: 'fallback-camera-2', label: 'External webcam' },
];

// Join chime plays once per call, not on every call <-> screen-share remount.
let joinSoundPlayedFor: number | null = null;

export interface CallWindowHostProps {
  /** Share layout (content on stage + filmstrip). */
  sharing?: boolean;
  shareContent?: ReactNode;
  /** Banner over the stage (e.g. "You are sharing your screen"). */
  banner?: ReactNode;
  /** Play the join chime on entry (the call scene only). */
  playJoinSound?: boolean;
}

/**
 * Scene-level wiring for `VideoCallWindow`: owns the menu/tray open state
 * (one at a time), outside-click + Escape dismissal, reaction timers, optional
 * self webcam, device menus and the chat/participants pane. Shared by the call
 * and screen-share scenes.
 */
export default function CallWindowHost({
  sharing = false,
  shareContent,
  banner,
  playJoinSound = false,
}: CallWindowHostProps) {
  const { state, participants, actions, selfCamera, elapsedLabel } =
    useCallSession();
  const rootRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [burst, setBurst] = useState<{ emoji: string; key: number } | null>(
    null,
  );
  const reactionTimer = useRef<number | undefined>(undefined);
  const burstSeq = useRef(0);

  // Chat -------------------------------------------------------------------
  const startedAt = state.callStartedAt;
  const [messages, setMessages] = useState(() => getCallChat(startedAt));
  const [draft, setDraft] = useState('');
  const [chatSeen, setChatSeen] = useState(() => hasSeenCallChat(startedAt));

  useEffect(() => {
    setMessages(getCallChat(startedAt));
  }, [startedAt]);

  useEffect(() => {
    if (state.pane === 'chat') {
      markCallChatSeen(startedAt);
      setChatSeen(true);
    }
  }, [state.pane, startedAt]);

  const sendChat = useCallback(
    (text: string) => {
      setMessages(
        appendCallChat(startedAt, {
          id: `me-${Date.now()}`,
          username: 'Leonard Riley',
          avatarSrc: avatarLeonard,
          timestamp: new Date().toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          }),
          text,
        }),
      );
      setDraft('');
    },
    [startedAt],
  );

  // Self webcam (opt-in) -----------------------------------------------------
  const devices = useMediaDevices({ enabled: true });
  const mics = devices.microphones.length ? devices.microphones : FALLBACK_MICS;
  const cameras = devices.cameras.length ? devices.cameras : FALLBACK_CAMERAS;
  const speakers = devices.speakers.length
    ? devices.speakers
    : FALLBACK_SPEAKERS;
  const outputLabel =
    speakers.find((d) => d.deviceId === state.media.speakerDeviceId)?.label ??
    speakers[0].label;

  // Join / leave notices when the call size changes ------------------------
  const prevParticipants = useRef(participants);
  useEffect(() => {
    const prev = prevParticipants.current;
    prevParticipants.current = participants;
    if (participants.length > prev.length) {
      const added = participants.find((p) => !prev.some((q) => q.id === p.id));
      if (added) {
        actions.pushNotice({ kind: 'joined', text: `${added.name} joined` });
      }
    } else if (participants.length < prev.length) {
      const left = prev.find((p) => !participants.some((q) => q.id === p.id));
      if (left) {
        actions.pushNotice({ kind: 'left', text: `${left.name} left` });
      }
    }
  }, [participants, actions]);

  // Join chime ---------------------------------------------------------------
  useEffect(() => {
    if (!playJoinSound || startedAt === null) return;
    if (joinSoundPlayedFor === startedAt) return;
    joinSoundPlayedFor = startedAt;
    playSound('join');
  }, [playJoinSound, startedAt]);

  // Reactions ----------------------------------------------------------------
  useEffect(() => () => window.clearTimeout(reactionTimer.current), []);

  const react = useCallback(
    (emoji: string) => {
      actions.patchParticipant(SELF_ID, { reaction: emoji });
      burstSeq.current += 1;
      setBurst({ emoji, key: burstSeq.current });
      setOpenMenu(null);
      window.clearTimeout(reactionTimer.current);
      reactionTimer.current = window.setTimeout(() => {
        actions.patchParticipant(SELF_ID, { reaction: undefined });
        setBurst(null);
      }, REACTION_MS);
    },
    [actions],
  );

  // Menu dismissal ----------------------------------------------------------
  const closeMenu = useCallback(() => setOpenMenu(null), []);
  useOutsideClose(rootRef, openMenu !== null, closeMenu);
  useEffect(() => {
    if (openMenu === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openMenu]);

  const toggleMenu = (id: MenuId) =>
    setOpenMenu((cur) => (cur === id ? null : id));

  // Derived props -----------------------------------------------------------
  const layout = useStageLayout(participants, state.view, sharing);
  const paneParticipants = useMemo(
    () =>
      participants.map((p) => ({
        id: p.id,
        name: p.name,
        avatarSrc: p.avatarSrc,
        host: p.host,
        talking: p.talking,
        muted: p.muted,
      })),
    [participants],
  );

  // Host controls: only the host sees a menu, and only on other people's tiles.
  const iAmHost = participants.some((p) => p.self && p.host);
  const getTileMenu = useCallback(
    (id: string): VideoTileMenu | undefined => {
      const target = participants.find((p) => p.id === id);
      if (!iAmHost || !target || target.self) return undefined;
      return {
        items: [
          { id: 'mute', label: 'Mute', disabled: Boolean(target.muted) },
          { id: 'make-host', label: 'Make host' },
          { id: 'remove', label: 'Remove from call', destructive: true },
        ],
        onSelect: (item) => {
          if (item === 'mute') {
            actions.patchParticipant(id, { muted: true });
            actions.pushNotice({ kind: 'info', text: `Muted ${target.name}` });
          } else if (item === 'make-host') {
            actions.makeHost(id);
            actions.pushNotice({
              kind: 'info',
              text: `${target.name} is now a host`,
            });
          } else if (item === 'remove') {
            actions.removeParticipant(id);
            actions.pushNotice({
              kind: 'info',
              text: `${target.name} was removed`,
            });
          }
        },
      };
    },
    [iAmHost, participants, actions],
  );

  const moreMenu = (
    <>
      <CallMoreMenu
        open={openMenu === 'more'}
        recording={state.recording}
        outputLabel={outputLabel}
        onShowOutput={() => setOpenMenu('output')}
        onToggleRecording={() => {
          actions.toggleRecording();
          closeMenu();
        }}
        onShowChat={() => {
          closeMenu();
          if (state.pane !== 'chat') actions.togglePane('chat');
        }}
        onShowInfo={() => setOpenMenu('info')}
      />
      <DeviceMenu
        open={openMenu === 'output'}
        title="Audio output"
        devices={speakers.map((d) => ({ id: d.deviceId, label: d.label }))}
        selectedId={state.media.speakerDeviceId}
        onSelect={(id) => {
          actions.setMedia({ speakerDeviceId: id });
          closeMenu();
        }}
        onClose={closeMenu}
      />
    </>
  );

  const pane =
    state.pane === 'participants' || state.pane === 'chat' ? (
      <CallThreadPane
        mode={state.pane}
        onClose={actions.closePane}
        participants={paneParticipants}
        currentUserId={SELF_ID}
        messages={messages}
        draft={draft}
        onDraftChange={setDraft}
        onSend={sendChat}
      />
    ) : undefined;

  return (
    <div ref={rootRef} className={styles['call-window-host']}>
      <VideoCallWindow
        elapsedLabel={elapsedLabel}
        participantCount={participants.length}
        view={state.view}
        onViewChange={actions.setView}
        viewMenuOpen={openMenu === 'view'}
        onViewMenuOpenChange={(open) => setOpenMenu(open ? 'view' : null)}
        onCollapse={actions.collapse}
        layout={layout}
        participants={participants}
        clips={CLIPS}
        selfStream={selfCamera.stream}
        shareContent={shareContent}
        stageLabels={{
          presenting: (name) =>
            participants.find((p) => p.name === name)?.self
              ? 'You are presenting'
              : `${name} is presenting`,
        }}
        notices={state.notices}
        onDismissNotice={actions.dismissNotice}
        burst={burst}
        banner={banner}
        pane={pane}
        onDismissOverlays={closeMenu}
        getTileMenu={getTileMenu}
        recording={state.recording ? 'recording' : undefined}
        onStopRecording={actions.toggleRecording}
        controls={{
          participantCount: participants.length,
          participantsOpen: state.pane === 'participants',
          onToggleParticipants: () => {
            closeMenu();
            actions.togglePane('participants');
          },
          micOn: state.media.micOn,
          onToggleMic: actions.toggleMic,
          onOpenMicMenu: () => toggleMenu('mic'),
          micMenuOpen: openMenu === 'mic',
          micMenu: (
            <DeviceMenu
              open={openMenu === 'mic'}
              title="Microphone"
              devices={mics.map((m) => ({ id: m.deviceId, label: m.label }))}
              selectedId={state.media.micDeviceId}
              onSelect={(id) => {
                actions.setMedia({ micDeviceId: id });
                closeMenu();
              }}
              onClose={closeMenu}
            />
          ),
          cameraOn: state.media.cameraOn,
          onToggleCamera: selfCamera.toggle,
          onOpenCameraMenu: () => toggleMenu('camera'),
          cameraMenuOpen: openMenu === 'camera',
          cameraMenu: (
            <DeviceMenu
              open={openMenu === 'camera'}
              title="Camera"
              devices={cameras.map((c) => ({ id: c.deviceId, label: c.label }))}
              selectedId={state.media.cameraDeviceId}
              onSelect={(id) => {
                actions.setMedia({ cameraDeviceId: id });
                closeMenu();
              }}
              onClose={closeMenu}
            />
          ),
          sharing: state.sharing,
          onToggleShare: () => {
            closeMenu();
            actions.toggleShare();
          },
          reactionsOpen: openMenu === 'reactions',
          onToggleReactions: () => toggleMenu('reactions'),
          reactionTray: (
            <ReactionTray
              emojis={REACTIONS}
              open={openMenu === 'reactions'}
              onSelect={react}
            />
          ),
          handRaised: state.handRaised,
          onToggleHand: actions.toggleHand,
          chatOpen: state.pane === 'chat',
          chatUnread: !chatSeen,
          onToggleChat: () => {
            closeMenu();
            actions.togglePane('chat');
          },
          moreOpen: openMenu === 'more',
          onToggleMore: () => toggleMenu('more'),
          moreMenu,
          onLeave: actions.leave,
        }}
      />
      <ExitingPopover
        open={openMenu === 'info'}
        className={styles['call-window-host__info']}
      >
        <CallInfoPanel
          variant="host"
          onClose={closeMenu}
          internalLink={INTERNAL_LINK}
          externalLink={EXTERNAL_LINK}
          dialInNumber={DIAL_IN_NUMBER}
          dialInPin={DIAL_IN_PIN}
          externalEnabled={state.externalEnabled}
          onExternalEnabledChange={actions.setExternalEnabled}
        />
      </ExitingPopover>
    </div>
  );
}
