import { useEffect, useRef, useState } from 'react';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import PhoneHangupIcon from '@mattermost/compass-icons/components/phone-hangup';
import MicrophoneIcon from '@mattermost/compass-icons/components/microphone';
import MicrophoneOffIcon from '@mattermost/compass-icons/components/microphone-off';
import CheckIcon from '@mattermost/compass-icons/components/check';
import CloseIcon from '@mattermost/compass-icons/components/close';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import DialpadIcon from '@/components/icons/DialpadIcon';
import Icon, { SVG_SIZE_MAP } from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { UserAvatarGroup } from '@/components/ui/UserAvatarGroup';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { AUDIO_DEVICES, AUDIO_ICON } from '@/pages/OutboundCalls/OutboundCallAudioConstants';
import { KeypadGrid, KeypadInput } from '@/pages/OutboundCalls/OutboundCallKeypad';
import { CONFERENCE_BRIDGE, CONTACT_MAP } from '@/pages/OutboundCalls/outboundCallData';
import { formatDuration, sanitizeDigits } from '@/pages/OutboundCalls/outboundCallUtils';
import { playDtmf } from '@/utils/phoneSounds';
import type {
  ActiveCall,
  AddMode,
  AudioDevice,
  Contact,
  Phone,
  Recent,
} from '@/types/outboundCall';
import { CallPipParticipantRow } from './ParticipantRow';
import styles from '../OutboundCalls.module.scss';

export function CallPip({
  call,
  contact,
  phone,
  nowTick,
  onToggleMute,
  onToggleKeypad,
  keypadOpen,
  onDtmf,
  onDtmfChange,
  onDtmfClear,
  onStartComposingCall,
  audioDevice,
  onPickDevice,
  onHangUp,
  onDismiss,
  exiting,
  addingParticipant,
  addMode,
  onSetAddMode,
  onOpenAddParticipant,
  onCloseAddParticipant,
  onBridgeContact,
  onBridgeNumber,
  participantListOpen,
  onToggleParticipantList,
  onRemoveParticipant,
  recents,
  onStartCall,
  onStartConferenceCall,
}: {
  call: ActiveCall;
  contact: Contact | null;
  phone: Phone | null;
  nowTick: number;
  onToggleMute: () => void;
  onToggleKeypad: () => void;
  keypadOpen: boolean;
  onDtmf: (k: string) => void;
  onDtmfChange: (v: string) => void;
  onDtmfClear: () => void;
  onStartComposingCall: () => void;
  audioDevice: AudioDevice;
  onPickDevice: (id: string) => void;
  onHangUp: () => void;
  onDismiss: () => void;
  exiting: boolean;
  addingParticipant: boolean;
  addMode: AddMode;
  onSetAddMode: (m: AddMode) => void;
  onOpenAddParticipant: () => void;
  onCloseAddParticipant: () => void;
  onBridgeContact: (contactId: string, phoneIndex: number) => void;
  onBridgeNumber: (n: string) => void;
  participantListOpen: boolean;
  onToggleParticipantList: () => void;
  onRemoveParticipant: (participantId: string) => void;
  recents: Recent[];
  onStartCall: (contactId: string, phoneIndex: number) => void;
  onStartConferenceCall: () => void;
}) {
  const [devicePickerOpen, setDevicePickerOpen] = useState(false);
  const deviceRef = useRef<HTMLDivElement>(null);

  const [addDtmf, setAddDtmf] = useState('');
  const [composeTab, setComposeTab] = useState<'dialpad' | 'recent' | 'conference'>('dialpad');

  useEffect(() => {
    if (!addingParticipant) {
      setAddDtmf('');
    }
  }, [addingParticipant]);

  useEffect(() => {
    if (call.status !== 'composing') setComposeTab('dialpad');
  }, [call.status]);

  useEffect(() => {
    if (!devicePickerOpen) return;
    function handler(e: MouseEvent) {
      if (deviceRef.current && !deviceRef.current.contains(e.target as Node)) {
        setDevicePickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [devicePickerOpen]);

  const isComposing = call.status === 'composing';
  const displayName = contact ? contact.name : phone?.number || 'Unknown';
  const canAddParticipant = false;

  const activeParticipants = call.bridgedParticipants.filter(
    (p) => p.status !== 'ended',
  );
  const activePartyCount = (call.status !== 'ended' ? 1 : 0) + activeParticipants.length;
  const showParticipantsBtn = call.bridgedParticipants.length > 0 && !isComposing;

  const partyMembers = (() => {
    if (isComposing) return [];
    const primaryName = contact ? contact.name : phone?.number || 'Unknown';
    const primary = {
      key: 'primary',
      name: primaryName,
      avatar: contact?.avatar || '',
    };
    const others = activeParticipants.map((p) => {
      const pContact = CONTACT_MAP[p.contactId] ?? null;
      const pPhone = pContact ? pContact.phones[p.phoneIndex] ?? null : null;
      const pName =
        pContact && pContact.avatar
          ? pContact.name
          : pPhone?.number ?? pContact?.name ?? 'Unknown';
      return {
        key: p.id,
        name: pName,
        avatar: pContact?.avatar || '',
      };
    });
    return [primary, ...others];
  })();
  const isMultiParty = partyMembers.length > 1;
  const avatarGroupItems = partyMembers
    .filter((m) => m.avatar)
    .map((m) => ({ key: m.key, src: m.avatar, name: m.name }));

  const handleAddDtmfKey = (k: string) => {
    playDtmf(k);
    setAddDtmf((d) => sanitizeDigits(d + k));
  };

  const title = (() => {
    if (isComposing) return 'Start new call';
    if (call.status === 'dialing') return `Calling ${displayName}…`;
    if (call.status === 'ended') return 'Call ended';
    if (isMultiParty) return partyMembers.map((m) => m.name).join(', ');
    return displayName;
  })();

  const subDuration = (() => {
    if (call.status === 'connected' && call.startedAt) {
      return formatDuration(Math.max(0, Math.floor((nowTick - call.startedAt) / 1000)));
    }
    if (call.status === 'ended' && call.startedAt && call.endedAt) {
      return formatDuration(Math.max(0, Math.floor((call.endedAt - call.startedAt) / 1000)));
    }
    return null;
  })();

  const subContent = isComposing ? 'Enter a number' : subDuration ?? phone?.number ?? '';

  const DeviceIcon = AUDIO_ICON[audioDevice.kind];
  const controlsDisabled = call.status === 'ended';
  const isCallInitiated = call.status === 'dialing' || call.status === 'connected';
  const showDtmf = (keypadOpen || isComposing) && call.status !== 'ended';

  const dtmfAnim = useExitAnimation(showDtmf, 150);
  const addAnim = useExitAnimation(addingParticipant, 150);
  const participantsAnim = useExitAnimation(participantListOpen, 150);

  return (
    <div
      className={`${styles['pip']}${exiting ? ` ${styles['pip--exiting']}` : ''}`}
      role="dialog"
      aria-label={isComposing ? 'Start a new call' : 'Active call'}
    >
      <div className={styles['pip__widget']}>
        <div className={styles['pip__header']}>
          {isMultiParty && avatarGroupItems.length > 0 ? (
            <UserAvatarGroup
              avatars={avatarGroupItems}
              size="32"
              className={styles['pip__avatar-group']}
            />
          ) : contact && contact.avatar ? (
            <UserAvatar src={contact.avatar} alt={contact.name} size="32" />
          ) : (
            <div className={styles['pip__unknown-avatar']} aria-hidden>
              <Icon glyph={<PhoneIcon />} size="16" />
            </div>
          )}
          <div className={styles['pip__header-text']}>
            <div
              className={`${styles['pip__title']} ${
                call.status === 'dialing' ? styles['pip__title--pulsing'] : ''
              }`}
            >
              {title}
            </div>
            <div className={styles['pip__sub']}>
              <span>{subContent}</span>
              {!isComposing && phone?.sipTrunk && (
                <>
                  <span className={styles['pip__sub-sep']} aria-hidden>·</span>
                  <span className={styles['pip__trunk']}>{phone.sipTrunk}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles['pip__controls']}>
          <div className={styles['pip__controls-left']}>
            <IconButton
              aria-label={keypadOpen ? 'Hide keypad' : 'Show keypad'}
              size="Small"
              padding="Compact"
              active={keypadOpen || isComposing}
              disabled={call.status !== 'connected' && !isComposing}
              icon={<Icon glyph={<DialpadIcon />} size="16" />}
              onClick={onToggleKeypad}
            />
            {showParticipantsBtn && (
              <button
                type="button"
                className={`${styles['pip__participants-btn']}${
                  participantListOpen ? ` ${styles['pip__participants-btn--active']}` : ''
                }`}
                aria-label={participantListOpen ? 'Hide participants' : 'Show participants'}
                aria-pressed={participantListOpen}
                onClick={onToggleParticipantList}
              >
                <Icon glyph={<AccountMultipleOutlineIcon />} size="16" />
                <span>{activePartyCount}</span>
              </button>
            )}
          </div>
          <div className={styles['pip__controls-right']}>
            {(() => {
              const devicePicker = (
                <div className={styles['pip__more-wrap']} ref={deviceRef}>
                  <IconButton
                    aria-label="More options"
                    size="Small"
                    padding="Compact"
                    toggled={devicePickerOpen}
                    disabled={controlsDisabled}
                    icon={<Icon glyph={<DotsHorizontalIcon />} size="16" />}
                    onClick={() => setDevicePickerOpen((o) => !o)}
                  />
                  {devicePickerOpen && (
                    <ul className={styles['pip__device-menu']} role="menu">
                      <li className={styles['pip__device-menu-label']}>
                        <Icon glyph={<DeviceIcon size={SVG_SIZE_MAP['12']} />} size="12" />
                        <span>Audio output</span>
                      </li>
                      {AUDIO_DEVICES.map((d) => {
                        const DIcon = AUDIO_ICON[d.kind];
                        const selected = d.id === audioDevice.id;
                        return (
                          <li key={d.id}>
                            <button
                              type="button"
                              role="menuitem"
                              className={`${styles['pip__device-item']} ${
                                selected ? styles['pip__device-item--selected'] : ''
                              }`}
                              onClick={() => {
                                onPickDevice(d.id);
                                setDevicePickerOpen(false);
                              }}
                            >
                              <Icon glyph={<DIcon size={SVG_SIZE_MAP['16']} />} size="16" />
                              <span>{d.label}</span>
                              {selected && (
                                <span className={styles['pip__device-check']}>
                                  <Icon glyph={<CheckIcon />} size="16" />
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );

              const micButton = (
                <IconButton
                  aria-label={call.muted ? 'Unmute microphone' : 'Mute microphone'}
                  size="Small"
                  padding="Compact"
                  toggled={call.muted}
                  destructive={call.muted}
                  disabled={controlsDisabled}
                  icon={
                    <Icon
                      glyph={call.muted ? <MicrophoneOffIcon /> : <MicrophoneIcon />}
                      size="16"
                    />
                  }
                  onClick={onToggleMute}
                />
              );

              if (isComposing) {
                return (
                  <>
                    {micButton}
                    {devicePicker}
                    <IconButton
                      aria-label="Cancel"
                      size="Small"
                      padding="Compact"
                      icon={<Icon glyph={<CloseIcon />} size="16" />}
                      onClick={onDismiss}
                    />
                  </>
                );
              }

              return (
                <>
                  {canAddParticipant && (
                    <IconButton
                      aria-label={addingParticipant ? 'Close add participant' : 'Add participant'}
                      size="Small"
                      padding="Compact"
                      active={addingParticipant}
                      icon={<Icon glyph={<AccountPlusOutlineIcon />} size="16" />}
                      onClick={
                        addingParticipant ? onCloseAddParticipant : onOpenAddParticipant
                      }
                    />
                  )}
                  {micButton}
                  {devicePicker}
                  {isCallInitiated ? (
                    <button
                      type="button"
                      aria-label="End call"
                      className={styles['pip__hangup']}
                      onClick={onHangUp}
                    >
                      <Icon glyph={<PhoneHangupIcon />} size="16" />
                    </button>
                  ) : (
                    <IconButton
                      aria-label="Dismiss"
                      size="Small"
                      padding="Compact"
                      icon={<Icon glyph={<CloseIcon />} size="16" />}
                      onClick={onDismiss}
                    />
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {participantsAnim.rendered && (
        <div
          className={`${styles['pip__participants']}${
            participantsAnim.exiting ? ` ${styles['pip__participants--exiting']}` : ''
          }`}
        >
          <div className={styles['pip__participants-header']}>
            <span className={styles['pip__participants-title']}>Participants</span>
            <IconButton
              aria-label="Close participants"
              size="Small"
              padding="Compact"
              icon={<Icon glyph={<CloseIcon />} size="16" />}
              onClick={onToggleParticipantList}
            />
          </div>
          <ul className={styles['pip__participants-list']}>
            <CallPipParticipantRow
              avatarSrc={contact?.avatar}
              avatarAlt={contact?.name}
              name={contact ? contact.name : phone?.number ?? 'Unknown'}
              number={phone?.number}
              status={call.status === 'dialing' ? 'dialing' : 'connected'}
            />
            {call.bridgedParticipants.map((p) => {
              const pContact = CONTACT_MAP[p.contactId] ?? null;
              const pPhone = pContact ? pContact.phones[p.phoneIndex] ?? null : null;
              const pName =
                pContact && pContact.avatar
                  ? pContact.name
                  : pPhone?.number ?? pContact?.name ?? 'Unknown';
              return (
                <CallPipParticipantRow
                  key={p.id}
                  avatarSrc={pContact?.avatar || undefined}
                  avatarAlt={pContact?.name}
                  name={pName}
                  number={pPhone?.number}
                  status={p.status}
                  onRemove={
                    p.status === 'connected'
                      ? () => onRemoveParticipant(p.id)
                      : undefined
                  }
                  removeDisabled={p.status !== 'connected'}
                />
              );
            })}
          </ul>
        </div>
      )}

      {addAnim.rendered && (
        <div
          className={`${styles['pip__add']}${
            addAnim.exiting ? ` ${styles['pip__add--exiting']}` : ''
          }`}
        >
          <div className={styles['pip__tabs-header']}>
            <div
              className={styles['pip__tabs']}
              role="tablist"
              aria-label="Add participant source"
            >
              <button
                type="button"
                role="tab"
                aria-selected={addMode === 'dialpad'}
                className={`${styles['pip__tab']}${
                  addMode === 'dialpad' ? ` ${styles['pip__tab--active']}` : ''
                }`}
                onClick={() => onSetAddMode('dialpad')}
              >
                <span>Dial pad</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={addMode === 'recents'}
                className={`${styles['pip__tab']}${
                  addMode === 'recents' ? ` ${styles['pip__tab--active']}` : ''
                }`}
                onClick={() => onSetAddMode('recents')}
              >
                <span>Recents</span>
              </button>
            </div>
            <IconButton
              aria-label="Close add participant"
              size="Small"
              padding="Compact"
              icon={<Icon glyph={<CloseIcon />} size="16" />}
              onClick={onCloseAddParticipant}
            />
          </div>

          {addMode === 'recents' ? (
            <div className={styles['pip__recents']}>
              {recents.length === 0 ? (
                <div className={styles['pip__recents-empty']}>
                  No recent calls
                </div>
              ) : (
                <ul className={styles['pip__recents-list']}>
                  {recents.map((r, i) => {
                    const c = CONTACT_MAP[r.contactId];
                    if (!c) return null;
                    const p = c.phones[r.phoneIndex];
                    const [timeDay, timeHour] = r.timestamp.split(',').map((s) => s.trim());
                    return (
                      <li key={`${r.contactId}-${i}`}>
                        <MenuItem
                          label={c.name}
                          secondaryLabel={p?.number ?? ''}
                          leadingVisual={
                            c.avatar ? (
                              <UserAvatar src={c.avatar} alt={c.name} size="32" />
                            ) : (
                              <div
                                className={styles['pip__recent-avatar-fallback']}
                                aria-hidden
                              >
                                <Icon glyph={<PhoneIcon />} size="16" />
                              </div>
                            )
                          }
                          trailingElement
                          trailingVisual={
                            <span className={styles['pip__recent-time']}>
                              <span>{timeDay}</span>
                              {timeHour && <span>{timeHour}</span>}
                            </span>
                          }
                          onClick={() => onBridgeContact(r.contactId, r.phoneIndex)}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <div className={styles['pip__add-body']}>
              <KeypadInput
                value={addDtmf}
                placeholder="Enter number"
                onChange={setAddDtmf}
                onEnter={() => addDtmf && onBridgeNumber(addDtmf)}
                trailing={
                  <span style={{ visibility: addDtmf ? 'visible' : 'hidden' }}>
                    <IconButton
                      aria-label="Clear number"
                      size="X-Small"
                      padding="Compact"
                      icon={<Icon glyph={<CloseCircleIcon />} size="16" />}
                      onClick={() => setAddDtmf('')}
                    />
                  </span>
                }
              />
              <KeypadGrid onPress={handleAddDtmfKey} />
              <button
                type="button"
                aria-label="Start bridge call"
                className={styles['pip__dtmf-call']}
                disabled={!addDtmf}
                onClick={() => addDtmf && onBridgeNumber(addDtmf)}
              >
                <Icon glyph={<PhoneIcon />} size="20" />
              </button>
            </div>
          )}
        </div>
      )}

      {dtmfAnim.rendered && (
        <div
          className={`${styles['pip__dtmf']}${
            dtmfAnim.exiting ? ` ${styles['pip__dtmf--exiting']}` : ''
          }`}
        >
          {isComposing ? (
            <div className={styles['pip__tabs-header']}>
              <div
                className={styles['pip__tabs']}
                role="tablist"
                aria-label="Dial pad source"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={composeTab === 'dialpad'}
                  className={`${styles['pip__tab']}${
                    composeTab === 'dialpad' ? ` ${styles['pip__tab--active']}` : ''
                  }`}
                  onClick={() => setComposeTab('dialpad')}
                >
                  <span>Dial pad</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={composeTab === 'recent'}
                  className={`${styles['pip__tab']}${
                    composeTab === 'recent' ? ` ${styles['pip__tab--active']}` : ''
                  }`}
                  onClick={() => setComposeTab('recent')}
                >
                  <span>Recent</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={composeTab === 'conference'}
                  className={`${styles['pip__tab']}${
                    composeTab === 'conference' ? ` ${styles['pip__tab--active']}` : ''
                  }`}
                  onClick={() => setComposeTab('conference')}
                >
                  <span>Conference</span>
                </button>
              </div>
              <IconButton
                aria-label="Cancel"
                size="Small"
                padding="Compact"
                icon={<Icon glyph={<CloseIcon />} size="16" />}
                onClick={onDismiss}
              />
            </div>
          ) : (
            <div className={styles['pip__dtmf-header']}>
              <span className={styles['pip__dtmf-title']}>Dial pad</span>
              <IconButton
                aria-label="Close dial pad"
                size="Small"
                padding="Compact"
                icon={<Icon glyph={<CloseIcon />} size="16" />}
                onClick={onToggleKeypad}
              />
            </div>
          )}
          {isComposing && composeTab === 'conference' ? (
            <div className={styles['pip__conference']}>
              <h3 className={styles['pip__conference-title']}>Conference bridge</h3>
              <p className={styles['pip__conference-description']}>
                  The conference bridge is configured by admins for to you can call and join a conference. Use the number and PIN below to join.
              </p>
              <dl className={styles['pip__conference-details']}>
                <div className={styles['pip__conference-row']}>
                  <dt className={styles['pip__conference-label']}>Dial-in:</dt>
                  <dd className={styles['pip__conference-value']}>{CONFERENCE_BRIDGE.number}</dd>
                </div>
                <div className={styles['pip__conference-row']}>
                  <dt className={styles['pip__conference-label']}>PIN:</dt>
                  <dd className={styles['pip__conference-value']}>{CONFERENCE_BRIDGE.pin}</dd>
                </div>
              </dl>
              <button
                type="button"
                className={styles['pip__conference-call']}
                onClick={onStartConferenceCall}
              >
                <Icon glyph={<PhoneIcon />} size="16" />
                <span>Call conference bridge</span>
              </button>
            </div>
          ) : isComposing && composeTab === 'recent' ? (
            <div className={styles['pip__recents']}>
              {recents.length === 0 ? (
                <div className={styles['pip__recents-empty']}>
                  No recent calls
                </div>
              ) : (
                <ul className={styles['pip__recents-list']}>
                  {recents.map((r, i) => {
                    const c = CONTACT_MAP[r.contactId];
                    if (!c) return null;
                    const p = c.phones[r.phoneIndex];
                    const [timeDay, timeHour] = r.timestamp.split(',').map((s) => s.trim());
                    return (
                      <li key={`${r.contactId}-${i}`}>
                        <MenuItem
                          label={c.name}
                          secondaryLabel={p?.number ?? ''}
                          leadingVisual={
                            c.avatar ? (
                              <UserAvatar src={c.avatar} alt={c.name} size="32" />
                            ) : (
                              <div
                                className={styles['pip__recent-avatar-fallback']}
                                aria-hidden
                              >
                                <Icon glyph={<PhoneIcon />} size="16" />
                              </div>
                            )
                          }
                          trailingElement
                          trailingVisual={
                            <span className={styles['pip__recent-time']}>
                              <span>{timeDay}</span>
                              {timeHour && <span>{timeHour}</span>}
                            </span>
                          }
                          onClick={() => onStartCall(r.contactId, r.phoneIndex)}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <div
              className={`${styles['pip__dtmf-body']}${
                isComposing ? ` ${styles['pip__dtmf-body--tall']}` : ''
              }`}
            >
              <KeypadInput
                value={call.dtmf}
                placeholder="Enter number"
                onChange={onDtmfChange}
                onEnter={isComposing ? onStartComposingCall : undefined}
                trailing={
                  isComposing ? (
                    <span style={{ visibility: call.dtmf ? 'visible' : 'hidden' }}>
                      <IconButton
                        aria-label="Clear number"
                        size="X-Small"
                        padding="Compact"
                        icon={<Icon glyph={<CloseCircleIcon />} size="16" />}
                        onClick={onDtmfClear}
                      />
                    </span>
                  ) : undefined
                }
              />
              <KeypadGrid onPress={onDtmf} />
              {isComposing && (
                <button
                  type="button"
                  aria-label="Start call"
                  className={styles['pip__dtmf-call']}
                  disabled={!call.dtmf}
                  onClick={onStartComposingCall}
                >
                  <Icon glyph={<PhoneIcon />} size="20" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
