import { Link, NavLink, useLocation } from 'react-router-dom';
import MattermostIcon from '@mattermost/compass-icons/components/mattermost';
import { categoryFirstTopicPath } from '@/manifests/categoryFirstTopicPath';
import ThemeSwitcherControl from '@/components/layout/ThemeSwitcherControl/ThemeSwitcherControl';
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
  {
    to: categoryFirstTopicPath('layouts'),
    label: 'Layouts',
    activePrefix: '/layouts',
  },
  { to: '/prototypes', label: 'Prototypes' },
];

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

        <ThemeSwitcherControl />
      </nav>
    </div>
  );
}
