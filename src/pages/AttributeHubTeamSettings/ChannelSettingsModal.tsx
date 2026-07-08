import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import FlagOutlineIcon from '@mattermost/compass-icons/components/flag-outline';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import ChannelAttributesWorkspace from './ChannelAttributesWorkspace';
import modalStyles from '@/pages/attribute-system/ChannelSettingsModal.module.scss';
import styles from './ChannelSettingsModal.module.scss';

export type ChannelSettingsTab =
  | 'info'
  | 'access'
  | 'settings'
  | 'attributes'
  | 'archive';

interface NavItem {
  id: ChannelSettingsTab;
  label: string;
  icon: ReactNode;
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

function readTab(): ChannelSettingsTab {
  if (typeof window === 'undefined') return 'attributes';
  const tab = new URLSearchParams(window.location.search).get('tab');
  return NAV.some((item) => item.id === tab) ? (tab as ChannelSettingsTab) : 'attributes';
}

export interface ChannelSettingsModalProps {
  channelName?: string;
  onClose?: () => void;
}

export default function ChannelSettingsModal({
  channelName = 'alpha-coordination',
  onClose,
}: ChannelSettingsModalProps) {
  const titleId = useId();
  const [tab, setTab] = useState<ChannelSettingsTab>(readTab);

  return (
    <div
      className={[
        modalStyles['channel-settings-modal'],
        styles['channel-settings-modal'],
      ].join(' ')}
      style={{ maxWidth: 'none', width: '100%', height: '100%' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <header className={modalStyles['channel-settings-modal__header']}>
        <div className={modalStyles['channel-settings-modal__header-titles']}>
          <h2
            id={titleId}
            className={modalStyles['channel-settings-modal__title']}
          >
            Channel Settings
          </h2>
          <span
            className={modalStyles['channel-settings-modal__title-separator']}
            aria-hidden
          />
          <p className={modalStyles['channel-settings-modal__subtitle']}>
            {channelName}
          </p>
        </div>
        <IconButton
          aria-label="Close Channel Settings"
          className={modalStyles['channel-settings-modal__close']}
          icon={<Icon glyph={<CloseIcon />} size="20" />}
          onClick={onClose}
          size="Medium"
        />
      </header>

      <div className={modalStyles['channel-settings-modal__body']}>
        <nav
          className={modalStyles['channel-settings__nav']}
          aria-label="Channel settings sections"
        >
          {NAV.map((item) => {
            const active = item.id === tab;
            return (
              <div
                key={item.id}
                className={modalStyles['channel-settings__nav-group']}
              >
                {item.dividerAbove && (
                  <span
                    className={modalStyles['channel-settings__nav-divider']}
                    aria-hidden
                  />
                )}
                <button
                  type="button"
                  className={[
                    modalStyles['channel-settings__nav-item'],
                    active ? modalStyles['channel-settings__nav-item--active'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setTab(item.id)}
                >
                  <span
                    className={modalStyles['channel-settings__nav-icon']}
                    aria-hidden
                  >
                    <Icon glyph={item.icon} size="16" />
                  </span>
                  <span className={modalStyles['channel-settings__nav-label']}>
                    {item.label}
                  </span>
                </button>
              </div>
            );
          })}
        </nav>

        <section className={modalStyles['channel-settings__content']}>
          {tab === 'attributes' ? (
            <ChannelAttributesWorkspace />
          ) : (
            <TabPlaceholder tab={tab} />
          )}
        </section>
      </div>
    </div>
  );
}

function TabPlaceholder({ tab }: { tab: ChannelSettingsTab }) {
  const label = NAV.find((n) => n.id === tab)?.label ?? '';
  return (
    <div className={modalStyles['channel-settings__placeholder-wrap']}>
      <h2 className={modalStyles['channel-settings__pane-title']}>{label}</h2>
      <div className={modalStyles['channel-settings__placeholder']}>
        This tab is not built in the channel-settings attributes prototype. Switch
        to Attributes to review the simplified hub list scoped to Channels and
        Posts.
      </div>
    </div>
  );
}
