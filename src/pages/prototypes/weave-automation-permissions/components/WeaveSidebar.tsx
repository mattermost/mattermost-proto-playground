import ChartLineIcon from '@mattermost/compass-icons/components/chart-line';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import CodeBracketsIcon from '@mattermost/compass-icons/components/code-brackets';
import FolderOutlineIcon from '@mattermost/compass-icons/components/folder-outline';
import HomeVariantOutlineIcon from '@mattermost/compass-icons/components/home-variant-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import ViewGridPlusOutlineIcon from '@mattermost/compass-icons/components/view-grid-plus-outline';
import { ChannelSidebarItem } from '@mattermost/compass-ui/components/channel-sidebar-item';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import styles from './WeaveSidebar.module.scss';

const NAV = [
  { id: 'home', label: 'Home', glyph: <HomeVariantOutlineIcon /> },
  { id: 'folders', label: 'Manage folders', glyph: <FolderOutlineIcon /> },
  { id: 'templates', label: 'Templates', glyph: <ViewGridPlusOutlineIcon /> },
  { id: 'runs', label: 'Run history', glyph: <ClockOutlineIcon /> },
  {
    id: 'variables',
    label: 'Variables & secrets',
    glyph: <CodeBracketsIcon />,
  },
  { id: 'health', label: 'Health', glyph: <ChartLineIcon /> },
  { id: 'permissions', label: 'Permissions', glyph: <ShieldOutlineIcon /> },
];

// Stand-in folder list; the real sidebar lists the user's folders and their automations.
const FOLDERS = ["Ben's folder", 'Support', 'User-1 folder', 'Ungrouped'];

interface WeaveSidebarProps {
  onNavigate?: (id: string) => void;
}

/**
 * Automation product sidebar. Compass has no generic product-sidebar pattern
 * (ChannelsSidebar is channel-shaped), so this composes ChannelSidebarItem rows.
 */
export default function WeaveSidebar({ onNavigate }: WeaveSidebarProps) {
  return (
    <nav className={styles['weave-sidebar']} aria-label="Automation">
      <div className={styles['weave-sidebar__header']}>
        <span className={styles['weave-sidebar__title']}>Automation</span>
      </div>
      <Scrollbar
        className={styles['weave-sidebar__scroll']}
        color="--sidebar-text-rgb"
      >
        <ul className={styles['weave-sidebar__list']}>
          {NAV.map((item) => (
            <li key={item.id}>
              <ChannelSidebarItem
                name={item.label}
                leadingVisual={<Icon glyph={item.glyph} />}
                active={item.id === 'permissions'}
                onClick={() => onNavigate?.(item.id)}
              />
            </li>
          ))}
        </ul>
        <h2 className={styles['weave-sidebar__section']}>Folders</h2>
        <ul className={styles['weave-sidebar__list']}>
          {FOLDERS.map((name) => (
            <li key={name}>
              <ChannelSidebarItem
                name={name}
                leadingVisual={<Icon glyph={<FolderOutlineIcon />} />}
              />
            </li>
          ))}
        </ul>
      </Scrollbar>
    </nav>
  );
}
