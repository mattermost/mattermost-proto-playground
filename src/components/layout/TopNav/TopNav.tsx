import { useState, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import MattermostIcon from '@mattermost/compass-icons/components/mattermost';
import PaletteOutlineIcon from '@mattermost/compass-icons/components/palette-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import { useTheme, type ThemeId } from '@/contexts/ThemeContext';
import { categoryFirstTopicPath } from '@/manifests/categoryFirstTopicPath';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import styles from './TopNav.module.scss';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  /**
   * URL prefix used for active-state matching. Defaults to `to`. Set this
   * when an item links to a deep child but should highlight on any path
   * under a category (e.g. /foundations/* keeps "Foundations" active even
   * though `to` is `/foundations/why-compass`).
   */
  activePrefix?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: categoryFirstTopicPath('foundations'),
    label: 'Foundations',
    activePrefix: '/foundations',
  },
  {
    to: categoryFirstTopicPath('components'),
    label: 'Components',
    activePrefix: '/components',
  },
  {
    to: categoryFirstTopicPath('patterns'),
    label: 'Patterns',
    activePrefix: '/patterns',
  },
  { to: '/prototypes', label: 'Prototypes' },
  { to: '/resources', label: 'Resources' },
];

const THEME_LABELS: Record<ThemeId, string> = {
  denim: 'Denim',
  sapphire: 'Sapphire',
  quartz: 'Quartz',
  indigo: 'Indigo',
  onyx: 'Onyx',
};

function pathStartsWith(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + '/');
}

interface TopNavLinkProps {
  item: NavItem;
}

function TopNavLink({ item }: TopNavLinkProps) {
  const { pathname } = useLocation();

  // Items with an activePrefix need custom matching since NavLink only
  // matches against `to`, which here points to a deep child.
  if (item.activePrefix) {
    const isActive = pathStartsWith(pathname, item.activePrefix);
    return (
      <Link
        to={item.to}
        className={[
          styles['top-nav__item'],
          isActive ? styles['top-nav__item--active'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <NavLink
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
  );
}

export default function TopNav() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useOutsideClose(themeRef, open, () => setOpen(false));

  return (
    <div className={styles['top-nav']}>
      <NavLink to="/" className={styles['top-nav__logo']} aria-label="Compass home">
        <MattermostIcon size={28} />
        <span className={styles['top-nav__wordmark']}>Compass</span>
      </NavLink>

      <nav className={styles['top-nav__items']} aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <TopNavLink key={item.label} item={item} />
        ))}

        <div ref={themeRef} className={styles['top-nav__theme']}>
          <button
            type="button"
            className={styles['top-nav__theme-trigger']}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <PaletteOutlineIcon size={16} />
            <span>Theme</span>
            <ChevronDownIcon size={16} />
          </button>
          {open && (
            <ul className={styles['top-nav__theme-menu']} role="menu">
              {(Object.entries(THEME_LABELS) as [ThemeId, string][]).map(
                ([id, label]) => (
                  <li key={id} role="none">
                    <button
                      role="menuitem"
                      className={[
                        styles['top-nav__theme-option'],
                        id === theme ? styles['top-nav__theme-option--active'] : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => {
                        setTheme(id);
                        setOpen(false);
                      }}
                    >
                      {label}
                    </button>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      </nav>
    </div>
  );
}
