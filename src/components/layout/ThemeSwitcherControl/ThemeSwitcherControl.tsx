import { useState, useRef } from 'react';
import PaletteOutlineIcon from '@mattermost/compass-icons/components/palette-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import { useTheme, type ThemeId } from '@/contexts/ThemeContext';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import styles from './ThemeSwitcherControl.module.scss';

const THEME_LABELS: Record<ThemeId, string> = {
  denim: 'Denim',
  sapphire: 'Sapphire',
  quartz: 'Quartz',
  indigo: 'Indigo',
  onyx: 'Onyx',
};

export default function ThemeSwitcherControl() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClose(ref, open, () => setOpen(false));

  return (
    <div ref={ref} className={styles['theme-switcher-control']}>
      <button
        type="button"
        className={styles['theme-switcher-control__trigger']}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <PaletteOutlineIcon size={16} />
        <span>Theme</span>
        <ChevronDownIcon size={16} />
      </button>
      {open && (
        <ul className={styles['theme-switcher-control__menu']} role="menu">
          {(Object.entries(THEME_LABELS) as [ThemeId, string][]).map(
            ([id, label]) => (
              <li key={id} role="none">
                <button
                  role="menuitem"
                  type="button"
                  className={[
                    styles['theme-switcher-control__option'],
                    id === theme
                      ? styles['theme-switcher-control__option--active']
                      : '',
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
  );
}
