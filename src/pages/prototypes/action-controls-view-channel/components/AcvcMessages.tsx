import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { ReactionsRow } from '@mattermost/compass-ui/components/reactions-row';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Message, messageStyles, shellStyles } from '@mattermost/compass-proto';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import AcvcMessage from './AcvcMessage';
import styles from './AcvcMessages.module.scss';

function messageClass(forceVisible: boolean) {
  return forceVisible ? messageStyles['message--actions-visible'] : undefined;
}

/** Ordinary traffic for a channel the policy does not touch. */
function GeneralMessages({ writeDenied }: { writeDenied: boolean }) {
  return (
    <div className={shellStyles['channel-shell__messages']}>
      <Scrollbar>
        <div className={shellStyles['channel-shell__messages-list']}>
          <MessageSeparator type="date" label="Today" />

          <AcvcMessage
            showMessageActions
            writeDenied={writeDenied}
            className={messageClass(writeDenied)}
            avatarSrc={avatarSofia}
            avatarAlt="Sofia Bauer"
            username="Sofia Bauer"
            timestamp="09:02"
          >
            <p className={shellStyles['channel-shell__post-text']}>
              Morning everyone. Reminder that the quarterly roadmap review is at 10:30 today.
            </p>
          </AcvcMessage>

          <AcvcMessage
            showMessageActions
            writeDenied={writeDenied}
            className={messageClass(writeDenied)}
            avatarSrc={avatarArjunPatel}
            avatarAlt="Arjun Patel"
            username="Arjun Patel"
            timestamp="09:18"
            footer={
              <ReactionsRow
                reactions={[{ emoji: '👍', count: 6, byCurrentUser: false }]}
                showAddReaction={!writeDenied}
              />
            }
          >
            <p className={shellStyles['channel-shell__post-text']}>
              The office will be closed this Friday for the building inspection. Work from home if
              you can.
            </p>
          </AcvcMessage>

          <AcvcMessage
            showMessageActions
            writeDenied={writeDenied}
            className={messageClass(writeDenied)}
            avatarSrc={avatarAikoTan}
            avatarAlt="Aiko Tan"
            username="Aiko Tan"
            timestamp="09:41"
          >
            <p className={shellStyles['channel-shell__post-text']}>
              New starters this week — say hello to the two folks joining the platform team.
            </p>
          </AcvcMessage>
        </div>
      </Scrollbar>
    </div>
  );
}

export interface AcvcMessagesProps {
  /**
   * Inserts a New Messages separator before the backfilled block — the
   * re-grant view, where everything sent during the denial window arrives at
   * once and is marked unread.
   */
  showBackfill?: boolean;
  /**
   * Which channel's content to render. Town Square must not show watch-floor
   * traffic — a reviewer reads the mismatch as the restricted content having
   * leaked into a channel that is still visible.
   */
  variant?: 'restricted' | 'general' | 'dm' | 'gm';
  /** Channel Write Access denied — keep read/personal actions, drop writes. */
  writeDenied?: boolean;
  /** Open the more-actions menu on the reaction message. */
  showMessageMenu?: boolean;
  onMoreActionsClick?: () => void;
}

function DirectMessages() {
  return (
    <div className={shellStyles['channel-shell__messages']}>
      <Scrollbar>
        <div className={shellStyles['channel-shell__messages-list']}>
          <MessageSeparator type="date" label="Today" />
          <Message
            avatarSrc={avatarAikoTan}
            avatarAlt="Aiko Tan"
            username="Aiko Tan"
            timestamp="10:14"
          >
            <p className={shellStyles['channel-shell__post-text']}>
              Got the shift notes — I will ping you if anything in the tracker
              needs a second pair of eyes.
            </p>
          </Message>
        </div>
      </Scrollbar>
    </div>
  );
}

function GroupMessages() {
  return (
    <div className={shellStyles['channel-shell__messages']}>
      <Scrollbar>
        <div className={shellStyles['channel-shell__messages-list']}>
          <MessageSeparator type="date" label="Today" />
          <Message
            avatarSrc={avatarMarco}
            avatarAlt="Marco Rinaldi"
            username="Marco Rinaldi"
            timestamp="10:06"
          >
            <p className={shellStyles['channel-shell__post-text']}>
              Leads check-in moved to 1100. Bring the eastern array status only.
            </p>
          </Message>
          <Message
            avatarSrc={avatarSofia}
            avatarAlt="Sofia Bauer"
            username="Sofia Bauer"
            timestamp="10:08"
          >
            <p className={shellStyles['channel-shell__post-text']}>
              Copy. I will keep Watchfloor Ops on receive-only until then.
            </p>
          </Message>
        </div>
      </Scrollbar>
    </div>
  );
}

export default function AcvcMessages({
  showBackfill = false,
  variant = 'restricted',
  writeDenied = false,
  showMessageMenu = false,
  onMoreActionsClick,
}: AcvcMessagesProps) {
  if (variant === 'general') {
    return <GeneralMessages writeDenied={writeDenied} />;
  }
  if (variant === 'dm') {
    return <DirectMessages />;
  }
  if (variant === 'gm') {
    return <GroupMessages />;
  }

  const forceVisible = writeDenied;
  const menuOpenClass = showMessageMenu
    ? messageStyles['message--state-hover']
    : messageClass(forceVisible);

  return (
    <div className={shellStyles['channel-shell__messages']}>
      <Scrollbar>
        <div className={shellStyles['channel-shell__messages-list']}>
          <MessageSeparator type="date" label="Today" />

          <AcvcMessage
            showMessageActions
            writeDenied={writeDenied}
            className={messageClass(forceVisible)}
            avatarSrc={avatarSofia}
            avatarAlt="Sofia Bauer"
            username="Sofia Bauer"
            timestamp="08:12"
          >
            <p className={shellStyles['channel-shell__post-text']}>
              Watch turnover complete. Night shift handed over three open items —
              all logged in the tracker.
            </p>
          </AcvcMessage>

          <div className={styles['acvc-messages__menu-anchor']}>
            <AcvcMessage
              showMessageActions
              writeDenied={writeDenied}
              onMoreActionsClick={onMoreActionsClick}
              className={menuOpenClass}
              avatarSrc={avatarMarco}
              avatarAlt="Marco Rinaldi"
              username="Marco Rinaldi"
              timestamp="08:31"
              footer={
                <ReactionsRow
                  reactions={[{ emoji: '👍', count: 3, byCurrentUser: true }]}
                  showAddReaction={!writeDenied}
                />
              }
            >
              <p className={shellStyles['channel-shell__post-text']}>
                Sensor feed on the eastern array came back up at 07:50. No data gap
                on our side.
              </p>
            </AcvcMessage>
          </div>

          <AcvcMessage
            showMessageActions
            writeDenied={writeDenied}
            className={messageClass(forceVisible)}
            avatarSrc={avatarAikoTan}
            avatarAlt="Aiko Tan"
            username="Aiko Tan"
            timestamp="08:44"
          >
            <p className={shellStyles['channel-shell__post-text']}>
              Confirmed. I&rsquo;ll fold that into the morning summary before the
              0900 brief.
            </p>
          </AcvcMessage>

          {showBackfill ? (
            <>
              <MessageSeparator type="new-messages" />

              <Message
                avatarSrc={avatarArjunPatel}
                avatarAlt="Arjun Patel"
                username="Arjun Patel"
                timestamp="09:05"
              >
                <p className={shellStyles['channel-shell__post-text']}>
                  Brief is pushed to 0930 — the ops lead is still on the call with
                  the regional team.
                </p>
              </Message>

              <Message
                avatarSrc={avatarSofia}
                avatarAlt="Sofia Bauer"
                username="Sofia Bauer"
                timestamp="09:21"
              >
                <p className={shellStyles['channel-shell__post-text']}>
                  Copy. Updated the calendar invite and reposted the agenda in the
                  thread.
                </p>
              </Message>

              <Message
                avatarSrc={avatarMarco}
                avatarAlt="Marco Rinaldi"
                username="Marco Rinaldi"
                timestamp="09:48"
              >
                <p className={shellStyles['channel-shell__post-text']}>
                  Array telemetry is steady through the morning. Nothing further
                  from me.
                </p>
              </Message>
            </>
          ) : null}
        </div>
      </Scrollbar>
    </div>
  );
}
