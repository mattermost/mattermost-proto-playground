import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import DockLeftIcon from '@mattermost/compass-icons/components/dock-left';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import PhoneInTalkIcon from '@mattermost/compass-icons/components/phone-in-talk';
import TuneIcon from '@mattermost/compass-icons/components/tune';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { PopoverMenuDivider } from '@mattermost/compass-ui/components/popover-menu';
import styles from './SettingsSidebar.module.scss';

const CORE_TABS = [
  { id: 'notifications', label: 'Notifications', glyph: <BellOutlineIcon /> },
  { id: 'display', label: 'Display', glyph: <EyeOutlineIcon /> },
  { id: 'sidebar', label: 'Sidebar', glyph: <DockLeftIcon /> },
  { id: 'advanced', label: 'Advanced', glyph: <TuneIcon /> },
];

const PLUGIN_TABS = [
  { id: 'calls', label: 'Calls', glyph: <PhoneInTalkIcon /> },
];

/** Only the Notifications tab is built; every other tab is inert chrome. */
export default function SettingsSidebar({
  activeId = 'notifications',
}: {
  activeId?: string;
}) {
  const renderTab = (tab: {
    id: string;
    label: string;
    glyph: React.ReactElement;
  }) => (
    <MenuItem
      key={tab.id}
      label={tab.label}
      leadingVisual={<Icon glyph={tab.glyph} size="16" />}
      active={tab.id === activeId}
      className={[
        styles['settings-sidebar__item'],
        tab.id === activeId && styles['settings-sidebar__item--active'],
      ]
        .filter(Boolean)
        .join(' ')}
      aria-current={tab.id === activeId ? 'page' : undefined}
    />
  );

  return (
    <nav className={styles['settings-sidebar']} aria-label="Settings sections">
      <div className={styles['settings-sidebar__group']}>
        {CORE_TABS.map(renderTab)}
      </div>
      <PopoverMenuDivider />
      <MenuGroupHeading label="PLUGIN PREFERENCES" />
      <div className={styles['settings-sidebar__group']}>
        {PLUGIN_TABS.map(renderTab)}
      </div>
    </nav>
  );
}
