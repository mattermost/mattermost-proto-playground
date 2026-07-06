import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import TextInput from '@/components/ui/TextInput/TextInput';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import type { RankedSchema } from '../shared/types';
import styles from './ChipPopover.module.scss';

interface ChipPopoverProps {
  /** Full schema the active value belongs to — used to look up current state. */
  schema: RankedSchema;
  /** The value being edited. */
  activeValueId: string;
  /** Anchor element (the chip the popover hangs off). */
  anchor: HTMLElement | null;
  /** Number of policies referencing the active value. */
  policyCount: number;
  onClose: () => void;
  /** Commit a new label for the active value. */
  onChangeLabel: (valueId: string, nextLabel: string) => void;
  /** Remove the active value from the schema. */
  onRemove: (valueId: string) => void;
}

/**
 * D1 per-chip editor popover (simplified, post 2026-05-22 sync).
 *
 * Anchored below the clicked chip; edits a single value's **label only**.
 * Per the meeting decisions:
 *  - Color is descoped → no swatch grid.
 *  - Rank changes happen in the modal (drag-to-reorder) → no inline stepper.
 *  - Deletion of a value referenced by policies is hard-blocked → no escape
 *    hatch; the Remove button is disabled with a tooltip explaining why.
 *
 * R-D1-FOCUS preserved: focus-trap inside popover (Tab/Shift-Tab cycle), Esc
 * closes and returns focus to anchor chip, outside-click dismisses.
 */
export default function ChipPopover({
  schema,
  activeValueId,
  anchor,
  policyCount,
  onClose,
  onChangeLabel,
  onRemove,
}: ChipPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const removeDescId = useId();
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );

  const value = useMemo(
    () => schema.values.find((v) => v.id === activeValueId),
    [schema, activeValueId],
  );

  // Local label state so the input doesn't fight the parent on every keystroke;
  // commit on blur / Enter.
  const [labelDraft, setLabelDraft] = useState(value?.label ?? '');
  useEffect(() => {
    setLabelDraft(value?.label ?? '');
  }, [value?.label]);

  // Position the popover anchored below the chip.
  useLayoutEffect(() => {
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
    });
  }, [anchor]);

  // R-D1-FOCUS: focus first focusable on open; trap focus inside popover;
  // Esc closes and returns focus to anchor chip.
  useEffect(() => {
    const root = popoverRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusables[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        anchor?.focus();
        return;
      }
      if (e.key === 'Tab' && root) {
        const list = root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, anchor]);

  // Outside-click dismiss.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const root = popoverRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return;
      if (anchor && anchor.contains(e.target as Node)) return;
      onClose();
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose, anchor]);

  if (!position || !value) return null;

  const currentRank = value.rank ?? 0;
  const isBlocked = policyCount > 0;
  const blockedMessage = `Used in ${policyCount} ${policyCount === 1 ? 'policy' : 'policies'}; cannot delete.`;

  function commitLabel() {
    if (!value) return;
    const next = labelDraft.trim();
    if (next && next !== value.label) {
      onChangeLabel(value.id, next);
    } else if (!next) {
      // Revert empty input so the chip never shows an empty label.
      setLabelDraft(value.label);
    }
  }

  return (
    <div
      ref={popoverRef}
      className={styles['chip-popover']}
      role="dialog"
      aria-modal="false"
      aria-label={`Edit value ${value.label}`}
      style={{ top: position.top, left: position.left }}
    >
      <header className={styles['chip-popover__head']}>
        <div className={styles['chip-popover__preview']}>
          <RankedValueChip
            label={labelDraft || value.label}
            rank={currentRank}
            active
          />
        </div>
        <IconButton
          size="X-Small"
          aria-label="Close editor"
          icon={<Icon size="12" glyph={<CloseIcon />} />}
          onClick={() => {
            onClose();
            anchor?.focus();
          }}
        />
      </header>

      <div className={styles['chip-popover__body']}>
        <div className={styles['chip-popover__field']}>
          <label
            htmlFor={`chip-popover-label-${value.id}`}
            className={styles['chip-popover__field-label']}
          >
            Label
          </label>
          <TextInput
            id={`chip-popover-label-${value.id}`}
            size="Small"
            value={labelDraft}
            onChange={(e) => setLabelDraft(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitLabel();
              }
            }}
            aria-label={`Label for ${value.label}`}
          />
        </div>
      </div>

      <footer className={styles['chip-popover__footer']}>
        <div className={styles['chip-popover__remove-wrap']}>
          <Button
            emphasis="Tertiary"
            size="X-Small"
            destructive
            disabled={isBlocked}
            aria-describedby={isBlocked ? removeDescId : undefined}
            onClick={() => onRemove(value.id)}
          >
            Remove value
          </Button>
          {isBlocked && (
            <>
              <span
                id={removeDescId}
                className={styles['chip-popover__sr-only']}
              >
                {blockedMessage}
              </span>
              <div className={styles['chip-popover__tooltip']} aria-hidden>
                <Tooltip label={blockedMessage} arrow="Bottom" />
              </div>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
