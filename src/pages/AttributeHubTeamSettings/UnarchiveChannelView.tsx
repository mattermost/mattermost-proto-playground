import { useState } from 'react';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import Message from '@/components/ui/Message/Message';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import UnarchiveChannelModal from './UnarchiveChannelModal';
import styles from './UnarchiveChannelView.module.scss';
import sceneStyles from './AttributeHubTeamSettings.module.scss';

const CHANNEL_NAME = 'QA Filter Run';

/**
 * Archived channel surface with unarchive confirm — Required attributes must
 * be filled in the modal before the channel can be restored.
 */
export default function UnarchiveChannelView() {
  const [modalOpen, setModalOpen] = useState(true);
  const [unarchived, setUnarchived] = useState(false);

  return (
    <div className={sceneStyles['scene']}>
      <ChannelShell
        teamName="Program ALPHA"
        userAvatarSrc={avatarLeonard}
        userAvatarAlt="Leonard Riley"
        channelHeader={
          <ChannelHeader
            type="Channel"
            name={CHANNEL_NAME}
            memberCount={12}
            pinnedCount={0}
            muted
          />
        }
      >
        <>
          <div className={shellStyles['channel-shell__messages']}>
            <Scrollbars>
              <div className={shellStyles['channel-shell__messages-list']}>
                <MessageSeparator type="Date" label="Aug 12" />
                <Message
                  avatarSrc={avatarSofia}
                  avatarAlt="Sofia Bauer"
                  username="Sofia Bauer"
                  timestamp="3:18 PM"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Parking this QA filter run channel until the next release
                    window — archive when the checklist is done.
                  </p>
                </Message>
              </div>
            </Scrollbars>
          </div>

          <div className={shellStyles['channel-shell__message-input']}>
            <div className={styles['unarchive-view__banner']}>
              <Icon size="16" glyph={<ArchiveOutlineIcon />} />
              <span>
                {unarchived
                  ? 'Channel restored.'
                  : 'This channel is archived.'}
              </span>
              {!unarchived && (
                <Button
                  emphasis="Primary"
                  size="Small"
                  onClick={() => setModalOpen(true)}
                >
                  Unarchive Channel
                </Button>
              )}
            </div>
          </div>
        </>
      </ChannelShell>

      {modalOpen && !unarchived && (
        <UnarchiveChannelModal
          channelName={CHANNEL_NAME}
          onClose={() => setModalOpen(false)}
          onConfirm={() => setUnarchived(true)}
        />
      )}
    </div>
  );
}
