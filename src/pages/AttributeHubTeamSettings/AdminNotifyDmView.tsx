import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import Message from '@/components/ui/Message/Message';
import MessageInput from '@/components/ui/MessageInput';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import mattermostLogo from '@/assets/icons/mattermost-logo.svg?url';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import styles from './AdminNotifyDmView.module.scss';

/** Sample channels missing Classification — subset of hub unmarked fixtures. */
const CHANNELS_NEEDING_CLASSIFICATION = [
  'ops-planning',
  'incident-bridge',
  'program-alpha-staff',
  'sustainment-window',
  'intel-fusion',
  'watch-floor',
  'mission-brief',
  'logistics-sync',
] as const;

const ADMIN_HANDLE = 'asaad.mahmood';

/**
 * DM from the Mattermost system bot after a system admin notifies channel
 * admins that Classification must be set before it can be marked Required.
 */
export default function AdminNotifyDmView() {
  return (
    <ChannelShell
      teamName="Program ALPHA"
      userAvatarSrc={avatarLeonard}
      userAvatarAlt="Leonard Riley"
      channelHeader={
        <ChannelHeader
          type="Bot"
          name="Mattermost"
          avatarSrc={mattermostLogo}
          description="System notifications"
          pinnedCount={0}
        />
      }
    >
      <>
        <div className={shellStyles['channel-shell__messages']}>
          <Scrollbars>
            <div className={shellStyles['channel-shell__messages-list']}>
              <MessageSeparator type="Date" label="Today" />

              <Message
                avatarSrc={mattermostLogo}
                avatarAlt="Mattermost"
                username="Mattermost"
                timestamp="2:04 PM"
                isBot
                botLabel="BOT"
                showMessageActions={false}
              >
                <p className={shellStyles['channel-shell__post-text']}>
                  <button
                    type="button"
                    className={styles['admin-notify-dm__mention']}
                  >
                    @{ADMIN_HANDLE}
                  </button>{' '}
                  wants you to set a Classification value on the following
                  channels:
                </p>
                <ul className={styles['admin-notify-dm__channels']}>
                  {CHANNELS_NEEDING_CLASSIFICATION.map((name) => (
                    <li key={name}>
                      <button
                        type="button"
                        className={styles['admin-notify-dm__channel-link']}
                      >
                        #{name}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className={shellStyles['channel-shell__post-text']}>
                  To set an attribute, open{' '}
                  <span className={styles['admin-notify-dm__emphasis']}>
                    Channel info
                  </span>{' '}
                  on each channel and choose a value.
                </p>
                <p className={shellStyles['channel-shell__post-text']}>
                  A system administrator needs every channel to have{' '}
                  <span className={styles['admin-notify-dm__emphasis']}>
                    Classification
                  </span>{' '}
                  before it can be marked Required.
                </p>
              </Message>
            </div>
          </Scrollbars>
        </div>

        <div className={shellStyles['channel-shell__message-input']}>
          <MessageInput placeholder="Write to Mattermost" />
        </div>
      </>
    </ChannelShell>
  );
}
