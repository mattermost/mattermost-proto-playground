import { useEffect, useMemo, useState } from 'react';
import DialpadIcon from '@/components/icons/DialpadIcon';
import Icon from '@/components/ui/Icon/Icon';
import ChannelsSidebar from '@/components/ui/ChannelsSidebar/ChannelsSidebar';
import GlobalHeader from '@/components/ui/GlobalHeader/GlobalHeader';
import TeamSidebar from '@/components/ui/TeamSidebar/TeamSidebar';
import { playDtmf, startRingback, stopRingback, playHangupClick } from '@/utils/phoneSounds';
import { CallPip } from '@/pages/OutboundCalls/CallPip/CallPip';
import { OutboundCallSceneSwitcher } from '@/pages/OutboundCalls/OutboundCallSceneSwitcher';
import { AUDIO_DEVICES } from '@/pages/OutboundCalls/OutboundCallAudioConstants';
import { PositionedProfilePopover } from '@/pages/OutboundCalls/PositionedProfilePopover';
import { RhsDialer } from '@/pages/OutboundCalls/RhsDialer';
import { sanitizeDigits } from '@/pages/OutboundCalls/outboundCallUtils';
import {
  avatarAikoTan,
  avatarArjunPatel,
  avatarDanielle,
  avatarDariusCole,
  avatarDavidLiang,
  avatarEmmaNovak,
  avatarEthanBrooks,
  avatarLeonard,
  avatarStaffTeam,
  CONFERENCE_BRIDGE,
  CONTACT_MAP,
  INITIAL_RECENTS,
} from '@/pages/OutboundCalls/outboundCallData';
import { ChannelScene } from '@/pages/OutboundCalls/scenes/ChannelScene';
import { DialerScene } from '@/pages/OutboundCalls/scenes/DialerScene';
import { DMScene } from '@/pages/OutboundCalls/scenes/DMScene';
import type { ActiveCall, AddMode, Recent, SceneId } from '@/types/outboundCall';
import styles from './OutboundCalls.module.scss';

export default function OutboundCalls() {
  const [scene, setScene] = useState<SceneId>('channel');
  const [call, setCall] = useState<ActiveCall | null>(null);
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [popover, setPopover] = useState<{ contactId: string; rect: DOMRect } | null>(null);
  const [recents, setRecents] = useState<Recent[]>(INITIAL_RECENTS);
  const [callExiting, setCallExiting] = useState(false);
  const [rhsOpen, setRhsOpen] = useState(false);

  const [addingParticipant, setAddingParticipant] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>('dialpad');
  const [participantListOpen, setParticipantListOpen] = useState(false);

  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    setRhsOpen(scene === 'rhs');
  }, [scene]);

  useEffect(() => {
    if (!call || call.status !== 'connected') return;
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [call]);

  useEffect(() => {
    if (!call || call.status !== 'dialing') return;
    startRingback();
    const id = setTimeout(() => {
      setCall((c) => (c ? { ...c, status: 'connected', startedAt: Date.now() } : c));
      setNowTick(Date.now());
    }, 2400);
    return () => {
      clearTimeout(id);
      stopRingback();
    };
  }, [call?.status, call?.contactId, call?.phoneIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!call || call.status !== 'connected' || !call.pendingDtmf) return;
    const digits = call.pendingDtmf;
    setCall((c) => (c ? { ...c, pendingDtmf: undefined } : c));
    const timers: number[] = [];
    digits.split('').forEach((digit, i) => {
      const t = window.setTimeout(() => playDtmf(digit), 500 + i * 150);
      timers.push(t);
    });
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [call?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const startCall = (contactId: string, phoneIndex: number) => {
    setKeypadOpen(false);
    setPopover(null);
    setCall({
      contactId,
      phoneIndex,
      status: 'dialing',
      startedAt: null,
      endedAt: null,
      muted: false,
      deviceId: AUDIO_DEVICES[0].id,
      dtmf: '',
      bridgedParticipants: [],
      fromDialpad: false,
    });
  };

  const ensureRawContact = (n: string) => {
    const fakeId = `__raw-${n}`;
    CONTACT_MAP[fakeId] = {
      id: fakeId,
      name: n,
      handle: '',
      email: '',
      title: '',
      role: 'Unknown number',
      avatar: '',
      online: false,
      phones: [{ number: n, label: 'Dialed', kind: 'standard' }],
    };
    return fakeId;
  };

  const startConferenceCall = () => {
    const fakeId = '__conference-bridge';
    CONTACT_MAP[fakeId] = {
      id: fakeId,
      name: 'Conference bridge',
      handle: '',
      email: '',
      title: '',
      role: 'Conference',
      avatar: '',
      online: false,
      phones: [
        {
          number: CONFERENCE_BRIDGE.number,
          label: 'Conference',
          kind: 'conference',
        },
      ],
    };
    setKeypadOpen(false);
    setPopover(null);
    setCall({
      contactId: fakeId,
      phoneIndex: 0,
      status: 'dialing',
      startedAt: null,
      endedAt: null,
      muted: false,
      deviceId: AUDIO_DEVICES[0].id,
      dtmf: '',
      bridgedParticipants: [],
      fromDialpad: true,
      pendingDtmf: CONFERENCE_BRIDGE.rawPin,
    });
  };

  const openDialpadWidget = () => {
    setPopover(null);
    setKeypadOpen(true);
    setCall({
      contactId: '',
      phoneIndex: 0,
      status: 'composing',
      startedAt: null,
      endedAt: null,
      muted: false,
      deviceId: AUDIO_DEVICES[0].id,
      dtmf: '',
      bridgedParticipants: [],
      fromDialpad: true,
    });
  };

  const startComposingCall = () => {
    setCall((c) => {
      if (!c || c.status !== 'composing' || !c.dtmf) return c;
      const fakeId = ensureRawContact(c.dtmf);
      return {
        ...c,
        contactId: fakeId,
        phoneIndex: 0,
        status: 'dialing',
        dtmf: '',
      };
    });
    setKeypadOpen(false);
  };

  const clearDtmf = () => {
    setCall((c) => (c ? { ...c, dtmf: '' } : c));
  };

  const hangUp = () => {
    stopRingback();
    playHangupClick();
    setCall((c) => {
      if (!c) return c;
      const endedAt = Date.now();
      const startedAt = c.startedAt;
      const durationSec =
        c.status === 'connected' && startedAt
          ? Math.max(0, Math.floor((endedAt - startedAt) / 1000))
          : 0;

      if (c.status === 'connected' && durationSec > 0) {
        setRecents((prev) => [
          {
            contactId: c.contactId,
            phoneIndex: c.phoneIndex,
            direction: 'outbound',
            timestamp: 'Just now',
            durationSec,
          },
          ...prev,
        ]);
      }

      return { ...c, status: 'ended', endedAt };
    });

    window.setTimeout(() => {
      setCallExiting(true);
      window.setTimeout(() => {
        setCall(null);
        setKeypadOpen(false);
        setCallExiting(false);
        setAddingParticipant(false);
        setParticipantListOpen(false);
      }, 150);
    }, 100);
  };

  const dismissCall = () => {
    setCall(null);
    setKeypadOpen(false);
    setCallExiting(false);
    setAddingParticipant(false);
    setParticipantListOpen(false);
  };

  const handleDtmf = (k: string) => {
    playDtmf(k);
    setCall((c) => (c ? { ...c, dtmf: sanitizeDigits(c.dtmf + k) } : c));
  };

  const handleDtmfChange = (v: string) => {
    setCall((c) => (c ? { ...c, dtmf: v } : c));
  };

  const openAddParticipant = () => {
    setAddMode('dialpad');
    setAddingParticipant(true);
    setKeypadOpen(false);
    setParticipantListOpen(false);
  };

  const closeAddParticipant = () => {
    setAddingParticipant(false);
  };

  const scheduleBridgeConnect = (participantId: string) => {
    startRingback();
    window.setTimeout(() => {
      stopRingback();
      setCall((c) => {
        if (!c) return c;
        return {
          ...c,
          bridgedParticipants: c.bridgedParticipants.map((p) =>
            p.id === participantId
              ? { ...p, status: 'connected', startedAt: Date.now() }
              : p,
          ),
        };
      });
      setNowTick(Date.now());
    }, 2400);
  };

  const bridgeParticipant = (contactId: string, phoneIndex: number) => {
    const participantId = `bridge-${Date.now()}`;
    setCall((c) => {
      if (!c) return c;
      return {
        ...c,
        bridgedParticipants: [
          ...c.bridgedParticipants,
          {
            id: participantId,
            contactId,
            phoneIndex,
            status: 'dialing',
            startedAt: null,
          },
        ],
      };
    });
    closeAddParticipant();
    scheduleBridgeConnect(participantId);
  };

  const bridgeRawNumber = (n: string) => {
    const trimmed = n.trim();
    if (!trimmed) return;
    const fakeId = ensureRawContact(trimmed);
    bridgeParticipant(fakeId, 0);
  };

  const toggleParticipantList = () => {
    setParticipantListOpen((open) => {
      const next = !open;
      if (next) {
        setKeypadOpen(false);
        if (addingParticipant) closeAddParticipant();
      }
      return next;
    });
  };

  const removeBridgedParticipant = (participantId: string) => {
    setCall((c) => {
      if (!c) return c;
      return {
        ...c,
        bridgedParticipants: c.bridgedParticipants.map((p) =>
          p.id === participantId ? { ...p, status: 'ended' } : p,
        ),
      };
    });
    window.setTimeout(() => {
      setCall((c) => {
        if (!c) return c;
        const remaining = c.bridgedParticipants.filter((p) => p.id !== participantId);
        return { ...c, bridgedParticipants: remaining };
      });
    }, 300);
  };

  const openProfile = (contactId: string, rect: DOMRect) => {
    setPopover({ contactId, rect });
  };

  const activeContact = call ? CONTACT_MAP[call.contactId] ?? null : null;
  const activePhone =
    call && activeContact ? activeContact.phones[call.phoneIndex] ?? null : null;
  const activeDevice = useMemo(
    () => AUDIO_DEVICES.find((d) => d.id === call?.deviceId) ?? AUDIO_DEVICES[0],
    [call?.deviceId],
  );

  return (
    <div className={styles['calls']}>
      <div className={styles['calls__switcher-bar']}>
        <OutboundCallSceneSwitcher active={scene} onChange={setScene} />
      </div>

      <div className={styles['calls__shell']}>
        <div className={styles['calls__global-header']}>
          <GlobalHeader
            product="Channels"
            userAvatarSrc={avatarLeonard}
            userAvatarAlt="Leonard Riley"
          />
          {scene === 'rhs' && (
            <button
              type="button"
              className={`${styles['calls__rhs-trigger']} ${
                rhsOpen ? styles['calls__rhs-trigger--active'] : ''
              }`}
              onClick={() => setRhsOpen((o) => !o)}
              aria-label="Open dial pad"
              aria-pressed={rhsOpen}
            >
              <Icon glyph={<DialpadIcon />} size="16" />
            </button>
          )}
        </div>

        <div className={styles['calls__body']}>
          <div className={styles['calls__team-sidebar']}>
            <TeamSidebar
              activeTeamId="contributors"
              teams={[
                { id: 'contributors', name: 'Task Force Aurora', src: avatarStaffTeam },
                { id: 'design', name: 'Design', initials: 'De', unread: true },
                { id: 'acme', name: 'Acme', initials: 'Ac', mentions: 3 },
              ]}
              showDialPad={scene === 'team-sidebar' || scene === 'channel' || scene === 'dm'}
              dialPadActive={!!call && keypadOpen}
              onDialPadClick={openDialpadWidget}
            />
          </div>

          <div className={styles['calls__outer-panel']}>
            <div className={styles['calls__channels-sidebar']}>
              <ChannelsSidebar
                teamName="Task Force Aurora"
                showFilter
                showDialPad={scene === 'dialer'}
                channelNameOverrides={{
                  'softphone-ux': 'op-nightingale',
                  'calling-eng': 'comms-ops',
                  'telephony-vendors': 'asset-liaison',
                  'Security Incident': 'Counterintel Alert',
                  'UX Design': 'Targeting Review',
                  'UI Redesign': 'Case Orion',
                  Orion: 'Project Orion',
                  'Release Discussion': 'Briefing Room',
                }}
                activeChannelName={
                  scene === 'channel'
                    ? 'op-nightingale'
                    : scene === 'dm'
                      ? 'Aiko Tan'
                      : scene === 'dialer'
                        ? 'Dial Pad'
                        : scene === 'rhs'
                          ? 'op-nightingale'
                          : scene === 'team-sidebar'
                            ? 'op-nightingale'
                            : ''
                }
                avatarAikoTan={avatarAikoTan}
                avatarArjunPatel={avatarArjunPatel}
                avatarDanielOkoro={avatarDanielle}
                avatarDariusCole={avatarDariusCole}
                avatarDavidLiang={avatarDavidLiang}
                avatarEmmaNovak={avatarEmmaNovak}
                avatarEthanBrooks={avatarEthanBrooks}
                onItemClick={(name) => {
                  if (name === 'op-nightingale') setScene('channel');
                  else if (name === 'Aiko Tan') setScene('dm');
                  else if (name === 'Dial Pad') setScene('dialer');
                }}
              />
            </div>

            <div className={styles['calls__inner-panel']}>
              <div className={styles['calls__center']}>
                {scene === 'channel' && (
                  <ChannelScene
                    onOpenProfile={openProfile}
                    onOpenDialer={openDialpadWidget}
                    onStartConferenceCall={startConferenceCall}
                    onStartCall={startCall}
                  />
                )}
                {scene === 'dm' && (
                  <DMScene
                    onOpenProfile={openProfile}
                    onStartCall={startCall}
                    onOpenDialer={openDialpadWidget}
                  />
                )}
                {scene === 'dialer' && (
                  <DialerScene
                    recents={recents}
                    onStartCall={startCall}
                    onDialRaw={(n) => {
                      const fakeId = ensureRawContact(n);
                      startCall(fakeId, 0);
                    }}
                  />
                )}
                {scene === 'rhs' && (
                  <ChannelScene
                    onOpenProfile={openProfile}
                    onOpenDialer={openDialpadWidget}
                    onStartConferenceCall={startConferenceCall}
                    onStartCall={startCall}
                  />
                )}
                {scene === 'team-sidebar' && (
                  <ChannelScene
                    onOpenProfile={openProfile}
                    onOpenDialer={openDialpadWidget}
                    onStartConferenceCall={startConferenceCall}
                    onStartCall={startCall}
                  />
                )}
              </div>
              {scene === 'rhs' && rhsOpen && (
                <RhsDialer
                  recents={recents}
                  onClose={() => setRhsOpen(false)}
                  onStartCall={startCall}
                  onDialRaw={(n) => {
                    const fakeId = ensureRawContact(n);
                    startCall(fakeId, 0);
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {call && (
          <CallPip
            call={call}
            contact={activeContact}
            phone={activePhone}
            nowTick={nowTick}
            audioDevice={activeDevice}
            keypadOpen={keypadOpen}
            onToggleMute={() => setCall((c) => (c ? { ...c, muted: !c.muted } : c))}
            onToggleKeypad={() =>
              setKeypadOpen((k) => {
                const next = !k;
                if (next) {
                  if (addingParticipant) closeAddParticipant();
                  setParticipantListOpen(false);
                }
                return next;
              })
            }
            onDtmf={handleDtmf}
            onDtmfChange={handleDtmfChange}
            onDtmfClear={clearDtmf}
            onStartComposingCall={startComposingCall}
            onPickDevice={(id) => setCall((c) => (c ? { ...c, deviceId: id } : c))}
            onHangUp={hangUp}
            onDismiss={dismissCall}
            exiting={callExiting}
            addingParticipant={addingParticipant}
            addMode={addMode}
            onSetAddMode={setAddMode}
            onOpenAddParticipant={openAddParticipant}
            onCloseAddParticipant={closeAddParticipant}
            onBridgeContact={bridgeParticipant}
            onBridgeNumber={bridgeRawNumber}
            participantListOpen={participantListOpen}
            onToggleParticipantList={toggleParticipantList}
            onRemoveParticipant={removeBridgedParticipant}
            recents={recents}
            onStartCall={startCall}
            onStartConferenceCall={startConferenceCall}
          />
        )}
      </div>

      {popover && (
        <PositionedProfilePopover
          contact={CONTACT_MAP[popover.contactId]}
          anchorRect={popover.rect}
          onClose={() => setPopover(null)}
          onStartCall={startCall}
          onOpenDialer={openDialpadWidget}
        />
      )}
    </div>
  );
}
