import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import styles from './AttributeSystem.module.scss';

interface CellPopoverProps {
  open: boolean;
  /** Cell summary shown in the table; clicking it toggles the popover. */
  trigger: ReactNode;
  title: string;
  /** Anchor edge — right-align for cells near the table's right edge. */
  align?: 'left' | 'right';
  ariaLabel: string;
  onToggle: () => void;
  onClose: () => void;
  children: ReactNode;
}

/**
 * An inline, cell-anchored popover. The whole cell is a button; clicking it
 * opens an editor positioned directly beneath, so every value in the Global
 * Attributes table is viewable and editable in place.
 */
export default function CellPopover({
  open,
  trigger,
  title,
  align = 'left',
  ariaLabel,
  onToggle,
  onClose,
  children,
}: CellPopoverProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (wrapRef.current?.contains(e.target as Node)) return;
      onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div className={styles.cellWrap} ref={wrapRef}>
      <button
        type="button"
        className={[styles.cell, open ? styles['cell--open'] : '']
          .filter(Boolean)
          .join(' ')}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={onToggle}
      >
        {trigger}
      </button>
      {open && (
        <div
          className={[
            styles.cellPopover,
            align === 'right' ? styles['cellPopover--right'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          role="dialog"
          aria-label={title}
        >
          <div className={styles.cellPopover__head}>
            <span className={styles.cellPopover__title}>{title}</span>
            <IconButton
              size="X-Small"
              aria-label="Close"
              icon={<Icon size="16" glyph={<CloseIcon />} />}
              onClick={onClose}
            />
          </div>
          <div className={styles.cellPopover__body}>{children}</div>
        </div>
      )}
    </div>
  );
}
