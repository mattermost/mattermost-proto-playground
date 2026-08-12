import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import Icon from '@/components/ui/Icon/Icon';
import TextInput from '@/components/ui/TextInput/TextInput';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import { useFixedMenuPosition } from '@/hooks/useFixedMenuPosition';
import type { GraphOption } from '@/pages/HierarchicalAttributeNonTree/nonTreeModel';
import styles from './CreatableEdgeCombobox.module.scss';

export interface CreatableEdgeComboboxProps {
  /** Placeholder + accessible name, e.g. "Add or create a parent…". */
  placeholder: string;
  ariaLabel: string;
  /** Eligible existing values (self + would-be-cycle already excluded upstream). */
  candidates: GraphOption[];
  /** Link an existing eligible value. Returns a rejection string, or null on success. */
  onPickExisting: (id: string) => string | null;
  /** Create a brand-new value and link it in this direction. */
  onCreate: (label: string) => void;
  /**
   * Opt-in (default OFF → the diagram-hub's in-flow behaviour is unchanged).
   * When ON, the listbox renders as a fixed-position OVERLAY portaled to
   * `document.body` and anchored under the input, so opening it neither grows
   * the host popover nor gets clipped by its `overflow: hidden`.
   */
  overlay?: boolean;
}

type Row =
  | { kind: 'existing'; id: string; label: string }
  | { kind: 'create'; label: string };

/**
 * One creatable combobox per edge direction — the Linear / Notion / GitHub
 * label-picker "creatable select" pattern, built from the base TextInput + a
 * filtered in-flow listbox (no new npm dependency, no absolute overlay that the
 * popover's overflow could clip). Type to filter eligible existing values; when
 * the typed text matches none, a "Create '…'" row creates the value and links it
 * in one action. Fully keyboard-operable: type, ArrowUp/Down, Enter to pick or
 * create, Escape to clear.
 *
 * This single control REPLACES the old two-mechanism stack (an "Add existing
 * value…" Select + Add button AND a separate "create a new value…" TextInput +
 * Create button) that each Parents / Children sub-pane carried.
 */
export default function CreatableEdgeCombobox({
  placeholder,
  ariaLabel,
  candidates,
  onPickExisting,
  onCreate,
  overlay = false,
}: CreatableEdgeComboboxProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo<Row[]>(() => {
    const q = query.trim().toLowerCase();
    const filtered = candidates
      .filter((c) => c.label.toLowerCase().includes(q))
      .map<Row>((c) => ({ kind: 'existing', id: c.id, label: c.label }));
    const exactExists = candidates.some(
      (c) => c.label.toLowerCase() === q && q.length > 0,
    );
    if (query.trim() && !exactExists) {
      filtered.push({ kind: 'create', label: query.trim() });
    }
    return filtered;
  }, [candidates, query]);

  const clampedActive = Math.min(active, Math.max(0, rows.length - 1));

  const commit = (row: Row | undefined) => {
    if (!row) return;
    if (row.kind === 'create') {
      onCreate(row.label);
      setError(null);
      setQuery('');
      setActive(0);
      return;
    }
    const err = onPickExisting(row.id);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setQuery('');
    setActive(0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, rows.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      commit(rows[clampedActive]);
    } else if (e.key === 'Escape') {
      if (query) {
        e.preventDefault();
        setQuery('');
        setActive(0);
      } else {
        setOpen(false);
      }
    }
  };

  const showList = open && rows.length > 0;

  // Overlay-only: anchor the portaled listbox under the input and close it on an
  // outside mousedown. When `overlay` is false these are inert (open=false), so
  // the diagram-hub's in-flow usage is byte-for-byte unchanged.
  const overlayPosition = useFixedMenuPosition(overlay && showList, anchorRef, {
    gap: 2,
    menuRef: listRef,
  });

  useEffect(() => {
    if (!overlay || !showList) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || listRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [overlay, showList]);

  const listNode = showList ? (
    <div
      ref={listRef}
      className={[
        styles['cbx__list-wrap'],
        overlay ? styles['cbx__list-wrap--overlay'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        overlay && overlayPosition
          ? {
              top: overlayPosition.top,
              left: overlayPosition.left,
              width: overlayPosition.minWidth,
            }
          : undefined
      }
    >
      <Scrollbars style={{ maxHeight: 208 }}>
        <ul className={styles['cbx__list']} role="listbox" id={listboxId}>
          {rows.map((row, i) => {
            const id = `${listboxId}-${i}`;
            const isActive = i === clampedActive;
            if (row.kind === 'create') {
              return (
                <li
                  key="__create"
                  id={id}
                  role="option"
                  aria-selected={isActive}
                  className={[
                    styles['cbx__row'],
                    styles['cbx__row--create'],
                    isActive ? styles['cbx__row--active'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit(row);
                  }}
                >
                  <Icon size="16" glyph={<PlusIcon />} />
                  <span>
                    Create “<strong>{row.label}</strong>”
                  </span>
                </li>
              );
            }
            return (
              <li
                key={row.id}
                id={id}
                role="option"
                aria-selected={isActive}
                className={[
                  styles['cbx__row'],
                  isActive ? styles['cbx__row--active'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(row);
                }}
              >
                <span className={styles['cbx__row-label']}>{row.label}</span>
              </li>
            );
          })}
        </ul>
      </Scrollbars>
    </div>
  ) : null;

  return (
    <div ref={rootRef} className={styles['cbx']}>
      <div
        ref={anchorRef}
        role="combobox"
        aria-expanded={showList}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-owns={listboxId}
      >
        <TextInput
          ref={inputRef}
          size="Small"
          value={query}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList ? `${listboxId}-${clampedActive}` : undefined
          }
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
            setError(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </div>

      {error && (
        <div className={styles['cbx__error']} role="alert">
          <Icon size="16" glyph={<AlertOutlineIcon />} />
          <span>{error}</span>
        </div>
      )}

      {overlay
        ? overlayPosition && createPortal(listNode, document.body)
        : listNode}
    </div>
  );
}
