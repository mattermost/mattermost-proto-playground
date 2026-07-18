import { useCallback, useMemo, useState, type ChangeEvent, type MouseEvent } from 'react';
import {
  Button,
  Icon,
  IconButton,
  MenuItem,
  PopoverMenu,
  PopoverMenuGroup,
  Switch,
  Tag,
} from '@mattermost/compass-ui';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CloseIcon from '@mattermost/compass-icons/components/close';
import type { ChannelWorkspace } from '../matrixInteropTypes';
import AnchoredPopoverMenu from './AnchoredPopoverMenu';
import ConnectionTypeIcon from './ConnectionTypeIcon';
import styles from './ChannelSettingsModal.module.scss';

type ChannelSettingsModalProps = {
  channelLabel: string;
  sharingEnabled: boolean;
  onSharingEnabledChange: (enabled: boolean) => void;
  workspaces: ChannelWorkspace[];
  /** Workspaces that can still be added (already-shared ones should be filtered out). */
  availableWorkspaces: ChannelWorkspace[];
  onAddWorkspace: (workspace: ChannelWorkspace) => void;
  onRemoveWorkspace: (workspaceId: string) => void;
  onClose: () => void;
};

export default function ChannelSettingsModal({
  channelLabel,
  sharingEnabled,
  onSharingEnabledChange,
  workspaces,
  availableWorkspaces,
  onAddWorkspace,
  onRemoveWorkspace,
  onClose,
}: ChannelSettingsModalProps) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null);

  const closeAddMenu = useCallback(() => {
    setAddMenuOpen(false);
    setAddMenuAnchor(null);
  }, []);

  const addableWorkspaces = useMemo(() => {
    const sharedConnectionIds = new Set(
      workspaces.map((workspace) => workspace.connectionId),
    );
    return availableWorkspaces.filter(
      (workspace) => !sharedConnectionIds.has(workspace.connectionId),
    );
  }, [availableWorkspaces, workspaces]);

  return (
    <div className={styles['channel-settings-modal']} role="dialog" aria-modal="true">
      <div className={styles['channel-settings-modal__header']}>
        <div className={styles['channel-settings-modal__title-group']}>
          <h2 className={styles['channel-settings-modal__title']}>
            Channel Settings
          </h2>
          <span className={styles['channel-settings-modal__subtitle-divider']} />
          <span className={styles['channel-settings-modal__subtitle']}>
            {channelLabel}
          </span>
        </div>
        <IconButton
          aria-label="Close channel settings"
          icon={<Icon glyph={<CloseIcon />} size="20" />}
          onClick={onClose}
        />
      </div>

      <div className={styles['channel-settings-modal__body']}>
        <nav className={styles['channel-settings-modal__nav']} aria-label="Settings sections">
          <button
            type="button"
            className={styles['channel-settings-modal__nav-item']}
          >
            <Icon glyph={<InformationOutlineIcon />} size="16" />
            Info
          </button>
          <button
            type="button"
            className={`${styles['channel-settings-modal__nav-item']} ${styles['channel-settings-modal__nav-item--active']}`}
          >
            <Icon glyph={<CogOutlineIcon />} size="16" />
            Configuration
          </button>
          <div className={styles['channel-settings-modal__nav-divider']} />
          <button
            type="button"
            className={styles['channel-settings-modal__nav-item']}
          >
            <Icon glyph={<ArchiveOutlineIcon />} size="16" />
            Archive channel
          </button>
        </nav>

        <div className={styles['channel-settings-modal__content']}>
          <div className={styles['channel-settings-modal__content-inner']}>
            <section>
              <div className={styles['channel-settings-modal__section-header']}>
                <div className={styles['channel-settings-modal__section-copy']}>
                  <h3 className={styles['channel-settings-modal__section-title']}>
                    Share with connected workspaces
                  </h3>
                  <p className={styles['channel-settings-modal__section-description']}>
                    Collaborate with trusted organizations in this channel.
                  </p>
                </div>
                <Switch
                  size="Medium"
                  checked={sharingEnabled}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onSharingEnabledChange(e.target.checked)
                  }
                  aria-label="Share with connected workspaces"
                />
              </div>

              {sharingEnabled && (
                <div className={styles['channel-settings-modal__workspaces-section']}>
                  <p className={styles['channel-settings-modal__subsection-title']}>
                    Workspaces this channel is shared with
                  </p>

                  {workspaces.length > 0 && (
                    <div className={styles['channel-settings-modal__workspace-list']}>
                      {workspaces.map((workspace) => (
                        <div
                          key={workspace.id}
                          className={styles['channel-settings-modal__workspace-row']}
                        >
                          <div className={styles['channel-settings-modal__workspace-name']}>
                            <ConnectionTypeIcon type={workspace.connectionType} />
                            {workspace.name}
                          </div>
                          <div className={styles['channel-settings-modal__workspace-status']}>
                            <Tag
                              type="Success"
                              label="Online"
                              leadingIcon={
                                <Icon
                                  glyph={<CheckCircleOutlineIcon />}
                                  size="12"
                                />
                              }
                            />
                          </div>
                          <div className={styles['channel-settings-modal__workspace-actions']}>
                            <IconButton
                              aria-label={`Remove ${workspace.name}`}
                              icon={
                                <Icon glyph={<TrashCanOutlineIcon />} size="16" />
                              }
                              onClick={() => onRemoveWorkspace(workspace.id)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {addableWorkspaces.length > 0 && (
                    <div className={styles['channel-settings-modal__add-workspace']}>
                      <Button
                        emphasis="Tertiary"
                        size="Small"
                        leadingIcon={<Icon glyph={<PlusIcon />} size="12" />}
                        trailingIcon={
                          <Icon glyph={<ChevronDownIcon />} size="12" />
                        }
                        aria-expanded={addMenuOpen}
                        aria-haspopup="menu"
                        onClick={(e: MouseEvent<HTMLButtonElement>) => {
                          if (addMenuOpen) {
                            closeAddMenu();
                            return;
                          }
                          setAddMenuOpen(true);
                          setAddMenuAnchor(e.currentTarget);
                        }}
                      >
                        Add workspace
                      </Button>
                      <AnchoredPopoverMenu
                        open={addMenuOpen}
                        onClose={closeAddMenu}
                        anchor={addMenuAnchor}
                        align="start"
                      >
                        <PopoverMenu>
                          <PopoverMenuGroup aria-label="Available workspaces">
                            {addableWorkspaces.map((workspace) => (
                              <MenuItem
                                key={workspace.id}
                                label={workspace.name}
                                leadingVisual={
                                  <ConnectionTypeIcon
                                    type={workspace.connectionType}
                                  />
                                }
                                onClick={() => {
                                  closeAddMenu();
                                  onAddWorkspace(workspace);
                                }}
                              />
                            ))}
                          </PopoverMenuGroup>
                        </PopoverMenu>
                      </AnchoredPopoverMenu>
                    </div>
                  )}
                </div>
              )}
            </section>

            <div className={styles['channel-settings-modal__divider']} />

            <section>
              <div className={styles['channel-settings-modal__section-header']}>
                <div className={styles['channel-settings-modal__section-copy']}>
                  <h3 className={styles['channel-settings-modal__section-title']}>
                    Channel banner
                  </h3>
                  <p className={styles['channel-settings-modal__section-description']}>
                    When enabled, a customized banner will display at the top of
                    the channel.
                  </p>
                </div>
                <Switch
                  size="Medium"
                  defaultChecked={false}
                  aria-label="Channel banner"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
