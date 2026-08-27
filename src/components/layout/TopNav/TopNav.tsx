import { NavLink } from 'react-router-dom';
import MattermostIcon from '@mattermost/compass-icons/components/mattermost';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import ThemeSwitcherControl from '@/components/layout/ThemeSwitcherControl/ThemeSwitcherControl';
import { Icon, IconButton } from '@mattermost/compass-ui';
import styles from './TopNav.module.scss';

const COMPASS_DESIGN_URL = 'https://mattermost.github.io/compass-design/';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  external?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Catalog', end: true },
  { to: COMPASS_DESIGN_URL, label: 'Design system', external: true },
];

interface TopNavProps {
  /** Opens the ⌘K / Ctrl+K quick switcher (navigate to any page). */
  onOpenQuickSwitcher?: () => void;
}

export default function TopNav({ onOpenQuickSwitcher }: TopNavProps) {
  return (
    <div className={styles['top-nav']}>
      <NavLink to="/" className={styles['top-nav__logo']} aria-label="Prototype catalog home">
        <MattermostIcon size={28} />
        <span className={styles['top-nav__wordmark']}>Proto Playground</span>
      </NavLink>

      <nav className={styles['top-nav__items']} aria-label="Primary">
        {NAV_ITEMS.map((item) =>
          item.external ? (
            <a
              key={item.label}
              href={item.to}
              className={styles['top-nav__item']}
              target="_blank"
              rel="noreferrer"
            >
              {item.label}
            </a>
          ) : (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  styles['top-nav__item'],
                  isActive ? styles['top-nav__item--active'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')
              }
            >
              {item.label}
            </NavLink>
          ),
        )}

        {onOpenQuickSwitcher != null && (
          <IconButton
            aria-label="Open quick switcher"
            aria-keyshortcuts="Control+K Meta+K"
            size="small"
            padding="compact"
            icon={<Icon size="16" glyph={<MagnifyIcon />} />}
            onClick={onOpenQuickSwitcher}
          />
        )}

        <ThemeSwitcherControl />
      </nav>
    </div>
  );
}
