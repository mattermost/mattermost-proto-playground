import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import { CLASSIFICATION_VALUES } from '../valueMenuModel';
import ValueMenuRow from './ValueMenuRow';
import styles from './HierarchyValueMenu.module.scss';

export interface FlatValueMenuProps {
  title: string;
  /** The `id` the trigger's `aria-controls` points at. */
  popupId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  compact?: boolean;
}

/**
 * Classification — the flat companion field, in the same popover shell.
 *
 * It is here to prove the shell is not hierarchy-specific: five coloured values,
 * single-select, no search, no submenus, no footer line. A flat attribute has no
 * "everything beneath it" to explain, so it says nothing rather than padding the
 * menu out to match its neighbour.
 */
export default function FlatValueMenu({
  title,
  popupId,
  selectedId,
  onSelect,
  compact = false,
}: FlatValueMenuProps) {
  const [index, setIndex] = useState(() => {
    const found = CLASSIFICATION_VALUES.findIndex((c) => c.id === selectedId);
    return found >= 0 ? found : 0;
  });
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    const id = CLASSIFICATION_VALUES[index]?.id;
    if (id != null) rowRefs.current.get(id)?.focus();
  }, [index]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIndex((prev) => Math.min(prev + 1, CLASSIFICATION_VALUES.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setIndex(CLASSIFICATION_VALUES.length - 1);
    }
  };

  const rootClass = [
    styles['value-menu'],
    compact ? styles['value-menu--compact'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} role="presentation" onKeyDown={handleKeyDown}>
      <PopoverMenu className={styles['value-menu__surface']}>
        <div className={styles['value-menu__header']}>
          <span className={styles['value-menu__title']}>{title}</span>
        </div>
        <div
          id={popupId}
          className={styles['value-menu__list']}
          role="menu"
          aria-label={title}
        >
          {CLASSIFICATION_VALUES.map((value, i) => (
            <ValueMenuRow
              key={value.id}
              innerRef={(el) => {
                if (el == null) rowRefs.current.delete(value.id);
                else rowRefs.current.set(value.id, el);
              }}
              label={value.label}
              scheme={value.scheme}
              selected={value.id === selectedId}
              focused={i === index}
              onClick={() => onSelect(value.id)}
            />
          ))}
        </div>
      </PopoverMenu>
    </div>
  );
}
