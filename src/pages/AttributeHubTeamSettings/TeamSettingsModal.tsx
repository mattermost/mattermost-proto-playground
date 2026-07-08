import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import ForumOutlineIcon from '@mattermost/compass-icons/components/forum-outline';
import FlagOutlineIcon from '@mattermost/compass-icons/components/flag-outline';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import TeamAttributesWorkspace from './TeamAttributesWorkspace';
import modalStyles from '@/pages/attribute-system/ChannelSettingsModal.module.scss';
import styles from './TeamSettingsModal.module.scss';

export type TeamSettingsTab =
  | 'info'
  | 'access'
  | 'membership'
  | 'channel-membership'
  | 'attributes';

interface NavItem {
  id: TeamSettingsTab;
  label: string;
  icon: ReactNode;
}

const NAV: NavItem[] = [
  { id: 'info', label: 'Info', icon: <InformationOutlineIcon /> },
  { id: 'access', label: 'Access', icon: <AccountMultipleOutlineIcon /> },
  { id: 'membership', label: 'Team Membership', icon: <FormatListBulletedIcon /> },
  { id: 'channel-membership', label: 'Channel Membership', icon: <ForumOutlineIcon /> },
  { id: 'attributes', label: 'Attributes', icon: <FlagOutlineIcon /> },
];

function readTab(): TeamSettingsTab {
  if (typeof window === 'undefined') return 'attributes';
  const tab = new URLSearchParams(window.location.search).get('tab');
  return NAV.some((item) => item.id === tab) ? (tab as TeamSettingsTab) : 'attributes';
}

export interface TeamSettingsModalProps {
  teamName?: string;
  onClose?: () => void;
}

export default function TeamSettingsModal({
  teamName = 'Program ALPHA',
  onClose,
}: TeamSettingsModalProps) {
  const titleId = useId();
  const [tab, setTab] = useState<TeamSettingsTab>(readTab);

  return (
    <div
      className={[
        modalStyles['channel-settings-modal'],
        styles['team-settings-modal'],
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
              Team settings
            </h2>
            <span
              className={modalStyles['channel-settings-modal__title-separator']}
              aria-hidden
            />
            <p className={modalStyles['channel-settings-modal__subtitle']}>
              {teamName}
            </p>
          </div>
          <IconButton
            aria-label="Close Team settings"
            className={modalStyles['channel-settings-modal__close']}
            icon={<Icon glyph={<CloseIcon />} size="20" />}
            onClick={onClose}
            size="Medium"
          />
        </header>

        <div className={modalStyles['channel-settings-modal__body']}>
          <nav
            className={modalStyles['channel-settings__nav']}
            aria-label="Team settings sections"
          >
            {NAV.map((item) => {
              const active = item.id === tab;
              return (
                <button
                  key={item.id}
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
              );
            })}
          </nav>

          <section className={modalStyles['channel-settings__content']}>
            {tab === 'attributes' ? (
              <TeamAttributesWorkspace />
            ) : (
              <TabPlaceholder tab={tab} />
            )}
          </section>
        </div>
    </div>
  );
}

function TabPlaceholder({ tab }: { tab: TeamSettingsTab }) {
  const label = NAV.find((n) => n.id === tab)?.label ?? '';
  return (
    <div className={modalStyles['channel-settings__placeholder-wrap']}>
      <h2 className={modalStyles['channel-settings__pane-title']}>{label}</h2>
      <div className={modalStyles['channel-settings__placeholder']}>
        This tab is not built in the team-settings attributes prototype. Switch
        to Attributes to review the simplified hub list scoped to Teams,
        Channels, and Posts.
      </div>
    </div>
  );
}
