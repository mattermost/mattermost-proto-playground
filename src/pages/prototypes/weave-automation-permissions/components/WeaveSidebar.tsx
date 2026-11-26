import ChartLineIcon from '@mattermost/compass-icons/components/chart-line';
import CodeBracketsIcon from '@mattermost/compass-icons/components/code-brackets';
import FolderOutlineIcon from '@mattermost/compass-icons/components/folder-outline';
import HomeVariantOutlineIcon from '@mattermost/compass-icons/components/home-variant-outline';
import IframeListOutlineIcon from '@mattermost/compass-icons/components/iframe-list-outline';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import PlayOutlineIcon from '@mattermost/compass-icons/components/play-outline';
import SettingsOutlineIcon from '@mattermost/compass-icons/components/settings-outline';
import { ChannelsSidebarCategory } from '@mattermost/compass-proto';
import { ChannelSidebarItem } from '@mattermost/compass-ui/components/channel-sidebar-item';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import styles from './WeaveSidebar.module.scss';

/*
 * Mirrors the Weave plugin's product nav (mattermost-plugin-weave
 * `webapp/src/components/product_nav.tsx`, branch
 * MM-71879-builder-policy-admin-ui): primary items, Health and Settings for
 * system admins, then each folder with its automations, then Recents.
 */
const NAV = [
  { id: 'list', label: 'Home', glyph: <HomeVariantOutlineIcon /> },
  { id: 'folders', label: 'Manage folders', glyph: <FolderOutlineIcon /> },
  { id: 'templates', label: 'Templates', glyph: <IframeListOutlineIcon /> },
  { id: 'all_runs', label: 'Run history', glyph: <PlayOutlineIcon /> },
  { id: 'secrets', label: 'Variables & secrets', glyph: <CodeBracketsIcon /> },
  { id: 'health', label: 'Health', glyph: <ChartLineIcon /> },
  { id: 'settings', label: 'Settings', glyph: <SettingsOutlineIcon /> },
];

// Stand-in folders and automations, named after the automations prototype's fixtures.
const FOLDERS: { name: string; automations: string[] }[] = [
  {
    name: 'Engineering',
    automations: ['Urgent message alert', 'Scheduled standup reminder'],
  },
  { name: 'Security', automations: ['Block banned words'] },
  { name: 'Support', automations: ['Keyword alert'] },
];
const RECENTS = [
  'Welcome new team members',
  'Urgent message alert',
  'Keyword alert',
];

function AutomationRows({ names }: { names: string[] }) {
  return (
    <ul className={styles['weave-sidebar__list']}>
      {names.map((name) => (
        <li key={name}>
          <ChannelSidebarItem
            name={name}
            leadingVisual={<Icon glyph={<LightningBoltOutlineIcon />} />}
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * Automation product sidebar. Compass has no generic product-sidebar pattern
 * (ChannelsSidebar is channel-shaped), so this composes ChannelSidebarItem
 * rows and ChannelsSidebarCategory headings.
 */
export default function WeaveSidebar() {
  return (
    <nav className={styles['weave-sidebar']} aria-label="Automations">
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
                active={item.id === 'settings'}
              />
            </li>
          ))}
        </ul>
        {FOLDERS.map((folder) => (
          <div key={folder.name} className={styles['weave-sidebar__group']}>
            <ChannelsSidebarCategory label={folder.name} showChevron />
            <AutomationRows names={folder.automations} />
          </div>
        ))}
        <div className={styles['weave-sidebar__group']}>
          <ChannelsSidebarCategory label="Recents" showChevron />
          <AutomationRows names={RECENTS} />
        </div>
      </Scrollbar>
    </nav>
  );
}
