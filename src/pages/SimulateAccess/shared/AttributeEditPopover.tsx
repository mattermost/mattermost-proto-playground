import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import { FIELD_LABEL, FIELD_OPTIONS } from './customSession';
import type { CustomSessionFields } from './customSession';
import styles from './SimulateAccess.module.scss';

export interface AttributeEditPopoverProps {
  /** The attribute key being edited (e.g. 'vpn_active'). */
  attributeKey: keyof CustomSessionFields;
  /** Current value (synthetic, possibly already edited). */
  currentValue: string;
  /** Source value from the cloned real session — shown as "Reset to source" target. */
  sourceValue: string;
  /** Anchor for placement. */
  triggerRect: DOMRect;
  onClose: () => void;
  onApply: (newValue: string) => void;
  onResetToSource: () => void;
}

/**
 * Single-attribute edit popover. ~200px wide. Opens anchored to a chip on a what-if row.
 * Holds one input control + Done + Reset-to-source. No multi-field form, no submit-all flow.
 */
export default function AttributeEditPopover({
  attributeKey,
  currentValue,
  sourceValue,
  triggerRect,
  onClose,
  onApply,
  onResetToSource,
}: AttributeEditPopoverProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(currentValue);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });
  const isDirty = value !== sourceValue;

  useLayoutEffect(() => {
    if (!ref.current) return;
    const w = ref.current.offsetWidth;
    const h = ref.current.offsetHeight;
    let top = triggerRect.bottom + 4;
    let left = triggerRect.left;
    if (left + w > window.innerWidth - 8) left = window.innerWidth - 8 - w;
    if (left < 8) left = 8;
    if (top + h > window.innerHeight - 8) top = triggerRect.top - h - 4;
    if (top < 8) top = 8;
    setPos({ top, left });
  }, [triggerRect]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    document.addEventListener('keydown', key);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', key);
    };
  }, [onClose]);

  const opts = FIELD_OPTIONS[attributeKey] ?? [];
  const label = FIELD_LABEL[attributeKey] ?? String(attributeKey);
  const safeValue = value ?? '';

  return (
    <div
      ref={ref}
      className={styles['sa-attr-popover']}
      style={{ top: pos.top, left: pos.left }}
      role="dialog"
      aria-label={`Edit ${label}`}
    >
      <div className={styles['sa-attr-popover__header']}>
        <span className={styles['sa-attr-popover__label']}>{label}</span>
        <button
          type="button"
          className={styles['sa-attr-popover__close']}
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon size={12} />
        </button>
      </div>

      <div className={styles['sa-attr-popover__control']}>
        {opts.length > 0 ? (
          <span className={styles['sa-attr-popover__select-wrap']}>
            <select
              className={styles['sa-attr-popover__select']}
              value={safeValue}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            >
              {opts.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className={styles['sa-attr-popover__caret']} aria-hidden>
              <Icon glyph={<ChevronDownIcon />} size="12" />
            </span>
          </span>
        ) : (
          <input
            className={styles['sa-attr-popover__input']}
            value={safeValue}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
        )}
      </div>

      <div className={styles['sa-attr-popover__footer']}>
        {isDirty ? (
          <button
            type="button"
            className={styles['sa-attr-popover__reset']}
            onClick={() => {
              onResetToSource();
              onClose();
            }}
          >
            Reset to source
          </button>
        ) : (
          <span />
        )}
        <Button
          emphasis="Primary"
          size="X-Small"
          onClick={() => {
            onApply(value);
            onClose();
          }}
        >
          Done
        </Button>
      </div>
    </div>
  );
}
