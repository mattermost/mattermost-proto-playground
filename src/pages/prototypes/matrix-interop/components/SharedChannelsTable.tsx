import {
  AdminPanel,
  Button,
  EmptyState,
  Icon,
} from '@mattermost/compass-ui';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import ThreadsEmptyIllustration from '@/assets/illustrations/threads-empty.svg?react';
import type { SharedChannel } from '../matrixInteropTypes';
import styles from './MatrixInteropTables.module.scss';

type SharedChannelsTableProps = {
  channels: SharedChannel[];
  onAddChannels: () => void;
};

export default function SharedChannelsTable({
  channels,
  onAddChannels,
}: SharedChannelsTableProps) {
  return (
    <AdminPanel
      title="Shared channels"
      subtitle="Channels and rooms shared between this server and the connected Matrix server"
      headerActions={
        <Button
          emphasis="Primary"
          size="Small"
          leadingIcon={<Icon glyph={<PlusIcon />} size="16" />}
          onClick={onAddChannels}
        >
          Add channels
        </Button>
      }
    >
      {channels.length === 0 ? (
        <div className={styles['matrix-interop-tables__empty']}>
          <EmptyState
            illustration={{
              'aria-label': 'No shared channels',
              width: '125px',
              height: '97px',
              children: <ThreadsEmptyIllustration />,
            }}
            title="No shared channels yet"
            description="Add channels for this connection to start collaborating"
          />
        </div>
      ) : (
        <div className={styles['matrix-interop-tables__table']}>
          <div className={styles['matrix-interop-tables__header']}>
            <span className={styles['matrix-interop-tables__header-cell']}>
              Name
            </span>
            <span className={styles['matrix-interop-tables__header-cell']}>
              Team
            </span>
            <span className={styles['matrix-interop-tables__header-cell']}>
              Matrix Room Alias
            </span>
          </div>

          {channels.map((channel) => (
            <div
              key={channel.id}
              className={styles['matrix-interop-tables__row']}
            >
              <span
                className={`${styles['matrix-interop-tables__cell']} ${styles['matrix-interop-tables__cell--name']}`}
              >
                <Icon
                  className={styles['matrix-interop-tables__channel-icon']}
                  glyph={
                    channel.visibility === 'public' ? (
                      <GlobeIcon />
                    ) : (
                      <LockOutlineIcon />
                    )
                  }
                  size="16"
                />
                {channel.name}
              </span>
              <span className={styles['matrix-interop-tables__cell']}>
                {channel.team}
              </span>
              <span className={styles['matrix-interop-tables__cell']}>
                {channel.matrixRoomAlias}
              </span>
            </div>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
