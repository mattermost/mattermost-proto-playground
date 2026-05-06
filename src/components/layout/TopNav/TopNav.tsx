import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import MattermostIcon from '@mattermost/compass-icons/components/mattermost';
import PaletteOutlineIcon from '@mattermost/compass-icons/components/palette-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import { useTheme, type ThemeId } from '@/contexts/ThemeContext';
import styles from './TopNav.module.scss';

const NAV_ITEMS: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/foundations', label: 'Design System' },
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

export default function TopNav() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className={styles['top-nav']}>
      <NavLink to="/" className={styles['top-nav__logo']} aria-label="Compass home">
        <MattermostIcon size={28} />
        <span className={styles['top-nav__wordmark']}>Compass</span>
      </NavLink>

      <nav className={styles['top-nav__items']} aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
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
