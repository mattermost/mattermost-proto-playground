import { useCallback, useRef, useState, type MouseEvent } from 'react';
import {
  AdminPanel,
  Button,
  EmptyState,
  Icon,
  IconButton,
  MenuItem,
  PopoverMenu,
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@mattermost/compass-ui';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import ThreadsEmptyIllustration from '@/assets/illustrations/threads-empty.svg?react';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import type { SharedChannel } from '../matrixInteropTypes';
import styles from './MatrixInteropTables.module.scss';

type SharedChannelsTableProps = {
  channels: SharedChannel[];
  onAddChannels: () => void;
  onEditChannel: (channel: SharedChannel) => void;
  onRemoveChannel: (channel: SharedChannel) => void;
};

export default function SharedChannelsTable({
  channels,
  onAddChannels,
  onEditChannel,
  onRemoveChannel,
}: SharedChannelsTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setOpenMenuId(null), []);
  useOutsideClose(menuRef, openMenuId !== null, closeMenu);

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
            <span
              className={`${styles['matrix-interop-tables__header-cell']} ${styles['matrix-interop-tables__header-cell--actions']}`}
              aria-hidden
            />
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
              <div className={styles['matrix-interop-tables__cell--actions']}>
                <div
                  className={styles['matrix-interop-tables__menu-anchor']}
                  ref={openMenuId === channel.id ? menuRef : undefined}
                >
                  <IconButton
                    aria-label={`Actions for ${channel.name}`}
                    size="Small"
                    padding="Compact"
                    icon={<Icon glyph={<DotsHorizontalIcon />} size="16" />}
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      setOpenMenuId((id) =>
                        id === channel.id ? null : channel.id,
                      );
                    }}
                  />
                  {openMenuId === channel.id && (
                    <div className={styles['matrix-interop-tables__menu']}>
                      <PopoverMenu>
                        <PopoverMenuGroup>
                          <MenuItem
                            label="Edit shared channel"
                            leadingVisual={
                              <Icon glyph={<PencilOutlineIcon />} size="16" />
                            }
                            onClick={() => {
                              closeMenu();
                              onEditChannel(channel);
                            }}
                          />
                        </PopoverMenuGroup>
                        <PopoverMenuDivider />
                        <PopoverMenuGroup>
                          <MenuItem
                            label="Remove shared channel"
                            destructive
                            leadingVisual={
                              <Icon glyph={<TrashCanOutlineIcon />} size="16" />
                            }
                            onClick={() => {
                              closeMenu();
                              onRemoveChannel(channel);
                            }}
                          />
                        </PopoverMenuGroup>
                      </PopoverMenu>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
