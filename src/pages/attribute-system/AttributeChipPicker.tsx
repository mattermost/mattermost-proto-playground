import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import RestoreIcon from '@mattermost/compass-icons/components/restore';
import Icon from '@/components/ui/Icon/Icon';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import type { AttrValue } from './data';
import styles from './AttributeChipPicker.module.scss';

export interface AttributeChipPickerProps {
  /** Attribute display name — e.g. `Classification`. Used in `aria-label`. */
  attrName: string;
  /** All possible values from the attribute definition. */
  values: AttrValue[];
  /** Whether the values are ranked. Drives clamp-by-omission + rank display. */
  ranked?: boolean;
  /**
   * Channel ceiling value id. When set + `ranked`, options above this rank
   * are NEVER rendered (clamp-by-omission). The footer caption explains the
   * absence.
   */
  ceilingValueId?: string;
  /** Currently selected value id (null = unset). */
  selectedId: string | null;
  /** Channel default value id (used to identify which row to caption + reset target). */
  channelDefaultId?: string;
  /**
   * When true, the author has overridden the channel default. Renders a
   * `Reset to channel value` row beneath the option list.
   */
  showReset?: boolean;
  /** Pick a value. One click commits — no confirm. */
  onPick: (id: string) => void;
  /** Reset to channel default (only present when `showReset`). */
  onReset?: () => void;
  /** Close the picker (Esc, outside click handled by ComposerScene). */
  onClose: () => void;
}

/**
 * Anchored listbox opened from an editable AttributeChip.
 *
 * CLAMP-BY-OMISSION: for ranked attributes, only ceiling-and-below values are
 * rendered. Above-ceiling values are NEVER in the DOM (not even disabled),
 * mirroring the server-side filter from PR #36809. A `role="note"` footer
 * explains the short list.
 *
 * Keyboard: ArrowUp/Down navigate, Enter commits, Esc closes.
 */
export default function AttributeChipPicker({
  attrName,
  values,
  ranked = false,
  ceilingValueId,
  selectedId,
  channelDefaultId,
  showReset = false,
  onPick,
  onReset,
  onClose,
}: AttributeChipPickerProps) {
  // ─── Clamp the value list ────────────────────────────────────────────
  const visibleValues = (() => {
    if (!ranked || !ceilingValueId) return values;
    const ceiling = values.find((v) => v.id === ceilingValueId);
    if (!ceiling || ceiling.rank == null) return values;
    return values.filter((v) => v.rank != null && v.rank <= ceiling.rank!);
  })();

  // Sort ranked options highest-first so SECRET appears above CONFIDENTIAL.
  const ordered = ranked
    ? [...visibleValues].sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))
    : visibleValues;

  const ceilingLabel =
    ranked && ceilingValueId
      ? values.find((v) => v.id === ceilingValueId)?.label
      : null;

  // ─── Keyboard navigation ─────────────────────────────────────────────
  const initialIdx = Math.max(
    0,
    ordered.findIndex((v) => v.id === selectedId),
  );
  const [focusIdx, setFocusIdx] = useState(initialIdx);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    optionRefs.current[focusIdx]?.focus();
  }, [focusIdx]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIdx((i) => Math.min(ordered.length - 1, i + 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIdx((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setFocusIdx(0);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      setFocusIdx(ordered.length - 1);
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- dialog-level Esc/arrow handling is the intended ARIA listbox-in-dialog keyboard pattern
    <div
      className={styles['attribute-chip-picker']}
      role="dialog"
      aria-label={`${attrName} picker`}
      onKeyDown={handleKeyDown}
    >
      <ul
        className={styles['attribute-chip-picker__list']}
        role="listbox"
        aria-label={`${attrName} values`}
        tabIndex={-1}
      >
        {ordered.map((v, idx) => {
          const selected = v.id === selectedId;
          const isDefault = v.id === channelDefaultId;
          return (
            <li
              key={v.id}
              ref={(el) => {
                optionRefs.current[idx] = el;
              }}
              role="option"
              aria-selected={selected}
              tabIndex={focusIdx === idx ? 0 : -1}
              className={[
                styles['attribute-chip-picker__option'],
                selected
                  ? styles['attribute-chip-picker__option--selected']
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => setFocusIdx(idx)}
              onClick={() => {
                onPick(v.id);
                onClose();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPick(v.id);
                  onClose();
                }
              }}
            >
              <span className={styles['attribute-chip-picker__check']} aria-hidden>
                {selected && <Icon size="12" glyph={<CheckIcon />} />}
              </span>
              {ranked && v.rank != null && (
                <LabelTag
                  label={String(v.rank)}
                  type="Default"
                  size="X-Small"
                />
              )}
              <span className={styles['attribute-chip-picker__label']}>
                {v.label}
              </span>
              {isDefault && (
                <span className={styles['attribute-chip-picker__source']}>
                  (from channel)
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {showReset && onReset && (
        <>
          <div
            className={styles['attribute-chip-picker__divider']}
            aria-hidden
          />
          <button
            type="button"
            className={styles['attribute-chip-picker__reset']}
            onClick={() => {
              onReset();
              onClose();
            }}
          >
            <Icon size="12" glyph={<RestoreIcon />} />
            Reset to channel value
          </button>
        </>
      )}

      {ranked && ceilingLabel && (
        <>
          <div
            className={styles['attribute-chip-picker__divider']}
            aria-hidden
          />
          <p
            className={styles['attribute-chip-picker__footer']}
            role="note"
          >
            Channel ceiling: {ceilingLabel} · higher values not available on
            this post
          </p>
        </>
      )}
    </div>
  );
}
