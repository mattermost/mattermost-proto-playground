import { useState } from 'react';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import MessageInput from '@/components/ui/MessageInput';
import MessageReactions from '@/components/ui/MessageReactions/MessageReactions';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Message from '@/components/ui/Message/Message';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import ChannelSettingsModal from './ChannelSettingsModal';
import type { AttrDef, DisplayLocations } from './data';
import styles from './ChannelSettingsScene.module.scss';

export interface ChannelSettingsSceneProps {
  /** Attribute definitions to render in the modal. */
  defs: AttrDef[];
  /** Optional override of the channel name. Default: "Operation Aurora". */
  channelName?: string;
  /** Optional override of the channel handle in the header. Default: "Operation Aurora". */
  channelHeaderName?: string;
  /** Optional seed for per-attribute display locations. */
  displayLocationSeeds?: Record<string, DisplayLocations>;
  /** Hook invoked when "+ Add attribute" is pressed. */
  onAddAttribute?: () => void;
}

/**
 * Renders the real channel layout (ChannelShell + ChannelHeader + messages +
 * composer) with the Channel Settings modal open over it. Used as the body of
 * the `assign` scene so the modal feels lived-in rather than floating over an
 * admin frame.
 */
export default function ChannelSettingsScene({
  defs,
  channelName = 'Operation Aurora',
  channelHeaderName = 'Operation Aurora',
  displayLocationSeeds,
  onAddAttribute,
}: ChannelSettingsSceneProps) {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className={styles['channel-settings-scene']}>
      <ChannelShell
        userAvatarSrc={avatarLeonard}
        userAvatarAlt="Leonard Riley"
        channelHeader={
          <ChannelHeader
            type="Channel"
            name={channelHeaderName}
            description="Mission coordination · Huntsville site · UNCLASSIFIED traffic only"
            memberCount={42}
            pinnedCount={3}
            favorited
          />
        }
        innerPanelOverlay={
          modalOpen ? (
            <ChannelSettingsModal
              defs={defs}
              channelName={channelName}
              displayLocationSeeds={displayLocationSeeds}
              onClose={() => setModalOpen(false)}
              onAddAttribute={onAddAttribute}
            />
          ) : undefined
        }
      >
        <>
          <div className={shellStyles['channel-shell__messages']}>
            <Scrollbars>
              <div className={shellStyles['channel-shell__messages-list']}>
                <MessageSeparator type="Date" label="Today" />

                <Message
                  avatarSrc={avatarSofia}
                  avatarAlt="Sofia Bauer"
                  username="Sofia Bauer"
                  timestamp="08:14"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Morning all. Comms check for the 0900 sync — Huntsville
                    operators please confirm in-thread.
                  </p>
                </Message>

                <Message
                  avatarSrc={avatarMarco}
                  avatarAlt="Marco Rinaldi"
                  username="Marco Rinaldi"
                  timestamp="08:21"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Confirmed. Pulling the latest sensor feed now — I&apos;ll
                    drop a summary before the sync.
                  </p>
                </Message>

                <Message
                  avatarSrc={avatarDanielle}
                  avatarAlt="Mattermost"
                  username="Mattermost"
                  timestamp="08:30"
                  isBot
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Daily standup reminder · 09:00 local. Agenda thread pinned.
                  </p>
                </Message>

                <Message
                  avatarSrc={avatarAikoTan}
                  avatarAlt="Aiko Tan"
                  username="Aiko Tan"
                  timestamp="08:42"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Sensor feed looks clean from my end. No anomalies overnight.
                  </p>
                  <MessageReactions
                    reactions={[{ emoji: '✅', count: 3, byCurrentUser: true }]}
                  />
                </Message>

                <Message
                  avatarSrc={avatarArjunPatel}
                  avatarAlt="Arjun Patel"
                  username="Arjun Patel"
                  timestamp="08:58"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Standup starting now in the bridge channel. Joining audio.
                  </p>
                </Message>
              </div>
            </Scrollbars>
          </div>

          <div className={shellStyles['channel-shell__message-input']}>
            <MessageInput placeholder={`Write to ${channelHeaderName}`} />
          </div>
        </>
      </ChannelShell>

      {!modalOpen && (
        <button
          type="button"
          className={styles['channel-settings-scene__reopen']}
          onClick={() => setModalOpen(true)}
        >
          Reopen Channel Settings
        </button>
      )}
    </div>
  );
}
