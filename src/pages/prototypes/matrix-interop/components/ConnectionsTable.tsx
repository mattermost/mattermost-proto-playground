import { useCallback, useState, type MouseEvent } from 'react';
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
  Tag,
} from '@mattermost/compass-ui';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import PauseIcon from '@mattermost/compass-icons/components/pause';
import PlayIcon from '@mattermost/compass-icons/components/play';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import MatrixConnectionEmptyIllustration from '@/assets/illustrations/matrix-connection-empty.svg?react';
import type { MatrixConnection } from '../matrixInteropTypes';
import AnchoredPopoverMenu from './AnchoredPopoverMenu';
import styles from './MatrixInteropTables.module.scss';

type ConnectionsTableProps = {
  connections: MatrixConnection[];
  sharedChannelCounts: Record<string, number>;
  onViewConnection: (connectionId: string) => void;
  onEditConnection: (connectionId: string) => void;
  onPauseConnection: (connectionId: string) => void;
  onDeleteConnection: (connectionId: string) => void;
  onAddConnection?: () => void;
};

function healthTagType(health: MatrixConnection['health']) {
  if (health === 'active') return 'Success' as const;
  if (health === 'degraded' || health === 'paused') return 'Warning' as const;
  return 'Default' as const;
}

function healthLabel(health: MatrixConnection['health']) {
  if (health === 'active') return 'Active';
  if (health === 'degraded' || health === 'paused') return 'Paused';
  return 'Unknown';
}

function isConnectionPaused(health: MatrixConnection['health']) {
  return health === 'paused' || health === 'degraded';
}

export default function ConnectionsTable({
  connections,
  sharedChannelCounts,
  onViewConnection,
  onEditConnection,
  onPauseConnection,
  onDeleteConnection,
  onAddConnection,
}: ConnectionsTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const closeMenu = useCallback(() => {
    setOpenMenuId(null);
    setMenuAnchor(null);
  }, []);

  const openConnection = openMenuId
    ? connections.find((connection) => connection.id === openMenuId)
    : undefined;

  const addConnectionButton = (
    <Button
      emphasis="Primary"
      size="Small"
      leadingIcon={<Icon glyph={<PlusIcon />} size="16" />}
      onClick={onAddConnection}
    >
      Add a connection
    </Button>
  );

  if (connections.length === 0) {
    return (
      <AdminPanel
        title="Connected Matrix Servers"
        subtitle="Matrix servers that are connected to this Mattermost server."
        headerActions={addConnectionButton}
      >
        <div className={styles['matrix-interop-tables__empty']}>
          <EmptyState
            illustration={{
              'aria-label': 'No Matrix connections',
              width: '136px',
              height: '105px',
              children: <MatrixConnectionEmptyIllustration />,
            }}
            title="No Matrix connections configured"
            description="Add a Matrix homeserver connection to start sharing channels with external workspaces."
          />
        </div>
      </AdminPanel>
    );
  }

  return (
    <AdminPanel
      title="Connected Matrix Servers"
      subtitle="Matrix servers that are connected to this Mattermost server."
      headerActions={addConnectionButton}
    >
      <div className={styles['matrix-interop-tables__table']}>
        <div className={styles['matrix-interop-tables__connections-header']}>
          <span className={styles['matrix-interop-tables__header-cell']}>
            Name
          </span>
          <span className={styles['matrix-interop-tables__header-cell']}>
            Channels
          </span>
          <span className={styles['matrix-interop-tables__header-cell']}>
            Server
          </span>
          <span className={styles['matrix-interop-tables__header-cell']}>
            Status
          </span>
          <span
            className={`${styles['matrix-interop-tables__header-cell']} ${styles['matrix-interop-tables__header-cell--actions']}`}
            aria-hidden
          />
        </div>

        {connections.map((connection) => (
          <div
            key={connection.id}
            className={styles['matrix-interop-tables__connections-row']}
            role="button"
            tabIndex={0}
            onClick={() => onViewConnection(connection.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onViewConnection(connection.id);
              }
            }}
          >
            <span
              className={`${styles['matrix-interop-tables__cell']} ${styles['matrix-interop-tables__cell--connection-name']}`}
            >
              {connection.name}
            </span>
            <span className={styles['matrix-interop-tables__cell']}>
              {sharedChannelCounts[connection.id] ?? 0} channels shared
            </span>
            <span className={styles['matrix-interop-tables__cell']}>
              {connection.domain}
            </span>
            <span className={styles['matrix-interop-tables__cell']}>
              <Tag
                type={healthTagType(connection.health)}
                label={healthLabel(connection.health)}
              />
            </span>
            <div
              className={styles['matrix-interop-tables__cell--actions']}
              onClick={(e: MouseEvent) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className={styles['matrix-interop-tables__menu-anchor']}>
                <IconButton
                  aria-label={`Actions for ${connection.name}`}
                  aria-expanded={openMenuId === connection.id}
                  size="Small"
                  padding="Compact"
                  icon={<Icon glyph={<DotsHorizontalIcon />} size="16" />}
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    if (openMenuId === connection.id) {
                      closeMenu();
                      return;
                    }
                    setOpenMenuId(connection.id);
                    setMenuAnchor(e.currentTarget);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnchoredPopoverMenu
        open={openMenuId !== null && menuAnchor !== null}
        onClose={closeMenu}
        anchor={menuAnchor}
      >
        {openConnection && (
          <PopoverMenu>
            <PopoverMenuGroup>
              <MenuItem
                label="Edit connection"
                leadingVisual={
                  <Icon glyph={<PencilOutlineIcon />} size="16" />
                }
                onClick={() => {
                  closeMenu();
                  onEditConnection(openConnection.id);
                }}
              />
              <MenuItem
                label={
                  isConnectionPaused(openConnection.health)
                    ? 'Resume connection'
                    : 'Pause connection'
                }
                leadingVisual={
                  <Icon
                    glyph={
                      isConnectionPaused(openConnection.health) ? (
                        <PlayIcon />
                      ) : (
                        <PauseIcon />
                      )
                    }
                    size="16"
                  />
                }
                onClick={() => {
                  closeMenu();
                  onPauseConnection(openConnection.id);
                }}
              />
            </PopoverMenuGroup>
            <PopoverMenuDivider />
            <PopoverMenuGroup>
              <MenuItem
                label="Delete connection"
                destructive
                leadingVisual={
                  <Icon glyph={<TrashCanOutlineIcon />} size="16" />
                }
                onClick={() => {
                  closeMenu();
                  onDeleteConnection(openConnection.id);
                }}
              />
            </PopoverMenuGroup>
          </PopoverMenu>
        )}
      </AnchoredPopoverMenu>
    </AdminPanel>
  );
}
