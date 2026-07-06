import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CheckIcon from '@mattermost/compass-icons/components/check';
import Icon from '@/components/ui/Icon/Icon';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { useAnchoredMenuOpensAbove } from '@/hooks/useAnchoredMenuOpensAbove';
import {
  DISPLAY_LOCATION_LABEL,
  availableDisplayLocations,
  displayLocationsLabel,
  normalizeDisplayLocations,
} from './data';
import type { AttrDef, DisplayLocation, DisplayLocations } from './data';
import styles from './ChannelSettingsModal.module.scss';

export interface DisplayLocationControlProps {
  def: AttrDef;
  value: DisplayLocations | undefined;
  onChange: (next: DisplayLocations) => void;
  disabled?: boolean;
}

/**
 * Refined "Show in" control. Replaces the previous chip + checkbox-popover
 * pattern with a clean select-style pill trigger and a macOS-grade option
 * menu.
 *
 *  - Trigger: pill button with gray surface, hairline border, radius-s, and
 *    a trailing chevron — matches the Figma reference. Label is the
 *    word-form selection (e.g. "Header", "Header + Banner", "Hidden").
 *  - Menu: elevation-3 panel, ~6px row padding, hover highlight. Each
 *    location row shows a leading CHECKMARK only when selected — no
 *    checkbox box. Hide sits below a divider and is mutually exclusive.
 *  - Keyboard: ArrowUp/Down move focus among rows, Enter / Space toggles,
 *    Esc closes and returns focus to the trigger.
 */
export default function DisplayLocationControl({
  def,
  value,
  onChange,
  disabled,
}: DisplayLocationControlProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);
  const dialogTitleId = useId();

  const normalized = useMemo(() => normalizeDisplayLocations(value), [value]);
  const isHidden = normalized === 'hidden';
  const selectedLocs: DisplayLocation[] = isHidden ? [] : normalized;
  const options = availableDisplayLocations(def);
  const label = displayLocationsLabel(normalized);

  useOutsideClose(rootRef, open, () => setOpen(false));

  const opensAbove = useAnchoredMenuOpensAbove(
    open,
    rootRef,
    popoverRef,
    `.${styles['channel-settings-modal']}`,
  );

  function closeAndReturnFocus() {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  useEffect(() => {
    if (!open) return;
    setFocusIdx(0);
  }, [open]);

  function toggleLocation(loc: DisplayLocation) {
    const has = selectedLocs.includes(loc);
    if (has) {
      const next = selectedLocs.filter((o) => o !== loc);
      onChange(next.length === 0 ? 'hidden' : next);
    } else {
      // Preserve canonical option order so callsites that read the array
      // (e.g. displayLocationsLabel) always see a stable shape.
      const next = options.filter(
        (o) => o === loc || selectedLocs.includes(o),
      );
      onChange(next);
    }
  }

  function selectHidden() {
    onChange('hidden');
  }

  // Total row count for keyboard nav: each option + the Hide row.
  const rowCount = options.length + 1;

  function onMenuKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeAndReturnFocus();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIdx((i) => (i + 1) % rowCount);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIdx((i) => (i - 1 + rowCount) % rowCount);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusIdx < options.length) {
        toggleLocation(options[focusIdx]);
      } else {
        selectHidden();
      }
    }
  }

  return (
    <div className={styles['display-location']} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((c) => !c)}
        className={[
          styles['display-location__trigger'],
          open ? styles['display-location__trigger--open'] : '',
          isHidden ? styles['display-location__trigger--hidden'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Display location for ${def.name}: ${label}. Activate to change.`}
      >
        <span className={styles['display-location__trigger-label']}>
          {label}
        </span>
        <span
          className={styles['display-location__trigger-chevron']}
          aria-hidden
        >
          <Icon size="12" glyph={<ChevronDownIcon />} />
        </span>
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="menu"
          tabIndex={-1}
          aria-labelledby={dialogTitleId}
          className={[
            styles['display-location__menu'],
            opensAbove ? styles['display-location__menu--above'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onKeyDown={onMenuKeyDown}
        >
          <p
            id={dialogTitleId}
            className={styles['display-location__menu-title']}
          >
            Show value in
          </p>

          {options.map((loc, idx) => {
            const selected = selectedLocs.includes(loc);
            const focused = focusIdx === idx;
            return (
              <button
                key={loc}
                type="button"
                role="menuitemcheckbox"
                aria-checked={selected}
                tabIndex={focused ? 0 : -1}
                ref={
                  focused
                    ? (el) => {
                        // Move focus when this row is the active one and the
                        // menu just opened or arrow keys updated the index.
                        if (el && document.activeElement !== el) el.focus();
                      }
                    : undefined
                }
                className={[
                  styles['display-location__menu-item'],
                  selected ? styles['display-location__menu-item--selected'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => toggleLocation(loc)}
              >
                <span
                  className={styles['display-location__menu-check']}
                  aria-hidden
                >
                  {selected && <Icon size="12" glyph={<CheckIcon />} />}
                </span>
                <span className={styles['display-location__menu-label']}>
                  {DISPLAY_LOCATION_LABEL[loc]}
                </span>
              </button>
            );
          })}

          <span
            className={styles['display-location__menu-divider']}
            role="separator"
            aria-hidden
          />

          <button
            type="button"
            role="menuitemradio"
            aria-checked={isHidden}
            tabIndex={focusIdx === options.length ? 0 : -1}
            ref={
              focusIdx === options.length
                ? (el) => {
                    if (el && document.activeElement !== el) el.focus();
                  }
                : undefined
            }
            className={[
              styles['display-location__menu-item'],
              isHidden ? styles['display-location__menu-item--selected'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={selectHidden}
          >
            <span
              className={styles['display-location__menu-check']}
              aria-hidden
            >
              {isHidden && <Icon size="12" glyph={<CheckIcon />} />}
            </span>
            <span className={styles['display-location__menu-label']}>Hide</span>
          </button>
        </div>
      )}
    </div>
  );
}
