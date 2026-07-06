import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import FlagOutlineIcon from '@mattermost/compass-icons/components/flag-outline';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Button from '@/components/ui/Button/Button';
import ChannelAssignScene from './ChannelAssignScene';
import type { AttrDef, DisplayLocations } from './data';
import styles from './ChannelSettingsModal.module.scss';

export type ChannelSettingsTab =
  | 'info'
  | 'access'
  | 'settings'
  | 'attributes'
  | 'archive';

export interface ChannelSettingsModalProps {
  defs: AttrDef[];
  /** Optional seed of display-location values per attribute id. */
  displayLocationSeeds?: Record<string, DisplayLocations>;
  /** Initial tab. Default: 'attributes'. */
  initialTab?: ChannelSettingsTab;
  onClose: () => void;
  /** Optional channel-name override. Default: "Operation Aurora". */
  channelName?: string;
  /** Optional + Add attribute hook. */
  onAddAttribute?: () => void;
}

interface NavItem {
  id: ChannelSettingsTab;
  label: string;
  icon: ReactNode;
  /** When true, a divider is rendered above this item. */
  dividerAbove?: boolean;
}

const NAV: NavItem[] = [
  { id: 'info', label: 'Info', icon: <InformationOutlineIcon /> },
  { id: 'access', label: 'Access', icon: <AccountMultipleOutlineIcon /> },
  { id: 'settings', label: 'Settings', icon: <CogOutlineIcon /> },
  { id: 'attributes', label: 'Attributes', icon: <FlagOutlineIcon /> },
  {
    id: 'archive',
    label: 'Archive channel',
    icon: <ArchiveOutlineIcon />,
    dividerAbove: true,
  },
];

/**
 * Channel Settings modal shell. Renders a wide, custom modal card (~960px) so
 * the Attributes table breathes; sticky footer surfaces unsaved-changes state.
 * Header carries the title, a vertical divider, the channel name (muted), and
 * a top-right close X. Left nav: icon + label rows, with the active row in the
 * brand blue and a divider above "Archive channel".
 */
export default function ChannelSettingsModal({
  defs,
  displayLocationSeeds,
  initialTab = 'attributes',
  onClose,
  channelName = 'Operation Aurora',
  onAddAttribute,
}: ChannelSettingsModalProps) {
  const titleId = useId();
  const [tab, setTab] = useState<ChannelSettingsTab>(initialTab);
  const [dirty, setDirty] = useState(false);
  const [requiredUnset, setRequiredUnset] = useState(false);
  const [saveToken, setSaveToken] = useState(0);
  const [resetToken, setResetToken] = useState(0);

  function handleSave() {
    setSaveToken((c) => c + 1);
  }

  function handleUndo() {
    setResetToken((c) => c + 1);
  }

  return (
    <div
      className={styles['channel-settings-overlay']}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles['channel-settings-modal']}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles['channel-settings-modal__header']}>
          <div className={styles['channel-settings-modal__header-titles']}>
            <h2
              id={titleId}
              className={styles['channel-settings-modal__title']}
            >
              Channel Settings
            </h2>
            <span
              className={styles['channel-settings-modal__title-separator']}
              aria-hidden
            />
            <p className={styles['channel-settings-modal__subtitle']}>
              {channelName}
            </p>
          </div>
          <IconButton
            aria-label="Close Channel Settings"
            className={styles['channel-settings-modal__close']}
            icon={<Icon glyph={<CloseIcon />} size="20" />}
            onClick={onClose}
            size="Medium"
          />
        </header>

        <div className={styles['channel-settings-modal__body']}>
          <nav
            className={styles['channel-settings__nav']}
            aria-label="Channel settings sections"
          >
            {NAV.map((item) => {
              const active = item.id === tab;
              return (
                <div
                  key={item.id}
                  className={styles['channel-settings__nav-group']}
                >
                  {item.dividerAbove && (
                    <span
                      className={styles['channel-settings__nav-divider']}
                      aria-hidden
                    />
                  )}
                  <button
                    type="button"
                    className={[
                      styles['channel-settings__nav-item'],
                      active
                        ? styles['channel-settings__nav-item--active']
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setTab(item.id)}
                  >
                    <span
                      className={styles['channel-settings__nav-icon']}
                      aria-hidden
                    >
                      <Icon glyph={item.icon} size="16" />
                    </span>
                    <span className={styles['channel-settings__nav-label']}>
                      {item.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </nav>

          <section className={styles['channel-settings__content']}>
            {tab === 'attributes' ? (
              <ChannelAssignScene
                defs={defs}
                displayLocationOverrides={displayLocationSeeds}
                onDirtyChange={setDirty}
                onValidityChange={setRequiredUnset}
                saveToken={saveToken}
                resetToken={resetToken}
                onAddAttribute={onAddAttribute}
              />
            ) : (
              <TabPlaceholder tab={tab} />
            )}
          </section>
        </div>

        {dirty && (
          <footer className={styles['channel-settings-modal__footer']}>
            <span className={styles['channel-settings-modal__footer-status']}>
              <Icon
                glyph={<AlertCircleOutlineIcon />}
                size="16"
                className={styles['channel-settings-modal__footer-icon']}
              />
              You have unsaved changes
            </span>
            <span className={styles['channel-settings-modal__footer-actions']}>
              <Button
                emphasis="Tertiary"
                size="Small"
                onClick={handleUndo}
                disabled={!dirty}
              >
                Undo
              </Button>
              <Button
                emphasis="Primary"
                size="Small"
                onClick={handleSave}
                disabled={!dirty || requiredUnset}
              >
                Save
              </Button>
            </span>
          </footer>
        )}
      </div>
    </div>
  );
}

function TabPlaceholder({ tab }: { tab: ChannelSettingsTab }) {
  const label = NAV.find((n) => n.id === tab)?.label ?? '';
  return (
    <div className={styles['channel-settings__placeholder-wrap']}>
      <h2 className={styles['channel-settings__pane-title']}>{label}</h2>
      <div className={styles['channel-settings__placeholder']}>
        This tab is not built in the attribute-system prototype. Switch to the
        Attributes tab to exercise the assign surface.
      </div>
    </div>
  );
}
