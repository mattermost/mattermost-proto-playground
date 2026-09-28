import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AnimationEvent,
} from 'react';
import ProfilePopover from '@/components/ui/ProfilePopover/ProfilePopover';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import Message from '@/components/ui/Message/Message';
import MessageInput from '@/components/ui/MessageInput';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import botDefaultIcon from '../assets/bot_default_icon.png';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import styles from './BotChannelScene.module.scss';

const BOT = {
  name: 'Clearance Gate',
  username: '@clearance.gate',
  title: 'Enforces file download rules for classified channels',
  attributes: [
    { label: 'Clearance', value: 'Secret' },
    { label: 'Program', value: 'Dragon Spacecraft' },
    { label: 'Caveat', value: 'NOFORN' },
  ],
} as const;

const POPOVER_WIDTH = 272;
const POPOVER_GAP = 8;

/**
 * Channel surface: a bot posts in-channel; click avatar/name to open the
 * profile popover with the same attribute values set on the bot account.
 */
export default function BotChannelScene() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [top, setTop] = useState(0);
  const [measured, setMeasured] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const profileAnchorRef = useRef<HTMLDivElement>(null);

  const openPopover = useCallback(() => {
    const el = profileAnchorRef.current;
    if (!el) return;
    setAnchorRect(el.getBoundingClientRect());
    setClosing(false);
    setMeasured(false);
    setPopoverOpen(true);
  }, []);

  const beginClose = useCallback(() => setClosing(true), []);

  useLayoutEffect(() => {
    if (!popoverOpen || !anchorRect || !popoverRef.current) return;
    const h = popoverRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - anchorRect.bottom - POPOVER_GAP - 16;
    const spaceAbove = anchorRect.top - POPOVER_GAP - 16;
    const placeAbove = h > spaceBelow && spaceAbove >= h;
    setTop(
      placeAbove
        ? anchorRect.top - h - POPOVER_GAP
        : anchorRect.bottom + POPOVER_GAP,
    );
    setMeasured(true);
  }, [popoverOpen, anchorRect]);

  useEffect(() => {
    if (!popoverOpen) return;
    function handler(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        beginClose();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popoverOpen, beginClose]);

  const handleAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (closing && e.target === e.currentTarget) {
      setPopoverOpen(false);
      setClosing(false);
      setAnchorRect(null);
    }
  };

  const left = anchorRect
    ? Math.min(
        Math.max(8, anchorRect.left),
        Math.max(8, window.innerWidth - POPOVER_WIDTH - 16),
      )
    : 0;

  return (
    <div className={styles['bot-channel']}>
      <ChannelShell
        teamName="Program ALPHA"
        userAvatarSrc={avatarLeonard}
        userAvatarAlt="Leonard Riley"
        channelHeader={
          <ChannelHeader
            type="Channel"
            name="field-coordination"
            description="Ops coordination for Dragon Spacecraft"
            pinnedCount={2}
          />
        }
      >
        <>
          <div className={shellStyles['channel-shell__messages']}>
            <Scrollbars>
              <div className={shellStyles['channel-shell__messages-list']}>
                <MessageSeparator type="Date" label="Today" />

                <Message
                  avatarSrc={avatarLeonard}
                  avatarAlt="Leonard Riley"
                  username="leonard.riley"
                  timestamp="9:12 AM"
                  showMessageActions={false}
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Need the latest ICD package for the watch floor. Can someone
                    with the right clearance pull it from the share?
                  </p>
                </Message>

                <div ref={profileAnchorRef}>
                  <Message
                    avatarSrc={botDefaultIcon}
                    avatarAlt={BOT.name}
                    username={BOT.name}
                    timestamp="9:13 AM"
                    isBot
                    botLabel="BOT"
                    showMessageActions={false}
                    onProfileClick={openPopover}
                  >
                    <p className={shellStyles['channel-shell__post-text']}>
                      I can share the ICD when the requester holds{' '}
                      <strong>Secret</strong> clearance on program{' '}
                      <strong>Dragon Spacecraft</strong>. Leonard — your
                      clearance checks out. File link posted in the thread.
                    </p>
                  </Message>
                </div>
              </div>
            </Scrollbars>
          </div>

          <div className={shellStyles['channel-shell__message-input']}>
            <MessageInput placeholder="Write to field-coordination" />
          </div>
        </>
      </ChannelShell>

      {popoverOpen && anchorRect && (
        <div
          ref={popoverRef}
          className={styles['bot-channel__popover']}
          style={{
            top,
            left,
            visibility: measured ? 'visible' : 'hidden',
          }}
        >
          <ProfilePopover
            avatarSrc={botDefaultIcon}
            avatarAlt={BOT.name}
            name={BOT.name}
            username={BOT.username}
            title={BOT.title}
            jobRole="BOT"
            attributes={[...BOT.attributes]}
            onClose={beginClose}
            onPrimaryAction={beginClose}
            state={closing ? 'closing' : 'open'}
            onAnimationEnd={handleAnimationEnd}
          />
        </div>
      )}
    </div>
  );
}
