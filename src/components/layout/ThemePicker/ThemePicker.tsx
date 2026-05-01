import { useState, useRef, useEffect } from 'react';
import PaletteOutlineIcon from '@mattermost/compass-icons/components/palette-outline';
import { useTheme, type ThemeId } from '@/contexts/ThemeContext';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import styles from './ThemePicker.module.scss';

const THEME_LABELS: Record<ThemeId, string> = {
  denim: 'Denim',
  sapphire: 'Sapphire',
  quartz: 'Quartz',
  indigo: 'Indigo',
  onyx: 'Onyx',
};

interface ThemePickerProps {
  /** Optional override for the wrapper class. */
  className?: string;
  /** Side the menu opens to. Default: 'right' (menu aligns to picker's right edge). */
  menuAlign?: 'left' | 'right';
}

export default function ThemePicker({
  className,
  menuAlign = 'right',
}: ThemePickerProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const wrapperClass = [
    styles['theme-picker'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const menuClass = [
    styles['theme-picker__menu'],
    menuAlign === 'left' ? styles['theme-picker__menu--align-left'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={pickerRef} className={wrapperClass}>
      <IconButton
        aria-label="Switch theme"
        icon={<Icon glyph={<PaletteOutlineIcon />} size="20" />}
        toggled={open}
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <ul className={menuClass} role="menu">
          {(Object.entries(THEME_LABELS) as [ThemeId, string][]).map(
            ([id, label]) => (
              <li key={id} role="none">
                <button
                  role="menuitem"
                  className={`${styles['theme-picker__option']} ${id === theme ? styles['theme-picker__option--active'] : ''}`}
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
