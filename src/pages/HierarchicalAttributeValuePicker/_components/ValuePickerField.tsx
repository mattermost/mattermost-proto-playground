import { useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import CheckboxBlankOutlineIcon from '@mattermost/compass-icons/components/checkbox-blank-outline';
import CheckboxMarkedIcon from '@mattermost/compass-icons/components/checkbox-marked';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import SourceBranchIcon from '@mattermost/compass-icons/components/source-branch';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Icon from '@/components/ui/Icon/Icon';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import Tags from '@/components/ui/Tags/Tags';
import type { GraphOption } from '@/pages/HierarchicalAttributeAuthoring/graphModel';
import {
  buildRows,
  filterRows,
  labelsFor,
  listLabels,
  rootsOfGraph,
  type PickerRow,
} from '@/pages/HierarchicalAttributeValuePicker/pickerModel';
import styles from './ValuePickerField.module.scss';

export interface ValuePickerFieldProps {
  /** Viewer-scoped graph. Out-of-scope values are absent, not disabled. */
  options: GraphOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  onOpenBrowse: () => void;
  disabled?: boolean;
  /**
   * The live consequence block. Rendered directly under the selected values and
   * ABOVE the search list, deliberately: the reading order becomes "what is set
   * → what that means → how to change it", which keeps the consequence sentence
   * above the fold inside a create-channel modal instead of below a 240px list.
   */
  summarySlot?: ReactNode;
}

/**
 * P7 · The primary control: a search-first FLAT LIST, not a tree.
 *
 * Why flat wins here:
 *   • P4 — one row per value, always. A tree has to render a multi-parent value
 *     once per parent (or invent stub rows), which reads as two distinct values
 *     and is the fastest route to a mis-assignment.
 *   • Scale-free — the same interaction works at 14 values and at 14,000.
 *   • Section 508 / WCAG — a multi-select listbox gets keyboard and
 *     screen-reader semantics nearly free. An APG-grade treeview with
 *     multi-parent stubs does not: there is no correct `aria-owns` story for a
 *     node that legitimately has two parents.
 *
 * Each row carries the value, its canonical breadcrumb (P5) and an "also under"
 * line naming its other parents (P4/P5), so the flat list never loses the
 * structure a tree would have shown.
 */
export default function ValuePickerField({
  options,
  selected,
  onChange,
  onOpenBrowse,
  disabled = false,
  summarySlot,
}: ValuePickerFieldProps) {
  const listId = useId();
  const listRef = useRef<HTMLUListElement | null>(null);
  const [query, setQuery] = useState('');
  const [rootFilter, setRootFilter] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const rows = useMemo(() => buildRows(options), [options]);
  const roots = useMemo(() => rootsOfGraph(options), [options]);
  const visible = useMemo(
    () => filterRows(rows, query, rootFilter),
    [rows, query, rootFilter],
  );

  const clampedActive = Math.min(activeIndex, Math.max(visible.length - 1, 0));
  const activeRow = visible[clampedActive];

  const toggle = (id: string) => {
    if (disabled) return;
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  };

  const onListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (visible.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(Math.min(clampedActive + 1, visible.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(Math.max(clampedActive - 1, 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(visible.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (activeRow) toggle(activeRow.option.id);
    }
  };

  const rootFilterLabel = (id: string | null) =>
    id == null ? 'All hierarchies' : (labelsFor(options, [id])[0] ?? id);

  return (
    <div
      className={[styles['picker'], disabled ? styles['picker--disabled'] : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['picker__selected']}>
        {selected.length === 0 ? (
          <span className={styles['picker__selected-empty']}>
            No values selected
          </span>
        ) : (
          labelsFor(options, selected).map((label, i) => (
            <Chip
              key={selected[i]}
              size="Medium Compact"
              removeLabel={`Remove ${label}`}
              onRemove={
                disabled ? undefined : () => toggle(selected[i])
              }
            >
              {label}
            </Chip>
          ))
        )}
      </div>

      {summarySlot != null && (
        <div className={styles['picker__summary']}>{summarySlot}</div>
      )}

      <div className={styles['picker__toolbar']}>
        <SearchInput
          className={styles['picker__search']}
          size="Medium"
          label="Search programs"
          value={query}
          disabled={disabled}
          onClear={() => setQuery('')}
          aria-controls={listId}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              listRef.current?.focus();
            }
          }}
        />
        <Button
          emphasis="Tertiary"
          size="Medium"
          disabled={disabled}
          leadingIcon={<Icon size="16" glyph={<SourceBranchIcon />} />}
          onClick={onOpenBrowse}
        >
          Browse hierarchy
        </Button>
      </div>

      {/* P5 · a value's root is its namespace, so the roots are the filter. */}
      <div className={styles['picker__roots']} role="group" aria-label="Filter by hierarchy">
        {[null, ...roots.map((r) => r.id)].map((id) => (
          <Chip
            key={id ?? 'all'}
            as="button"
            size="Small"
            tone={rootFilter === id ? 'info' : 'neutral'}
            aria-pressed={rootFilter === id}
            disabled={disabled}
            onClick={() => {
              setRootFilter(id);
              setActiveIndex(0);
            }}
          >
            {rootFilterLabel(id)}
          </Chip>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className={styles['picker__no-results']}>
          {/* P6 · absolute count suppression. A query that would have matched a
              value outside the viewer's scope lands here, with the same words as
              a query that matches nothing at all. Never "1 match hidden". */}
          <EmptyState
            title="No results"
            description={
              query.trim() === ''
                ? `Nothing in ${rootFilterLabel(rootFilter)}.`
                : `No program matches “${query.trim()}”.`
            }
          />
        </div>
      ) : (
        <div className={styles['picker__list-frame']}>
          <Scrollbars style={{ maxHeight: 240 }}>
            <ul
              className={styles['picker__list']}
              id={listId}
              ref={listRef}
              role="listbox"
              aria-label="Program values"
              aria-multiselectable="true"
              aria-activedescendant={
                activeRow ? `${listId}-${activeRow.option.id}` : undefined
              }
              tabIndex={disabled ? -1 : 0}
              onKeyDown={onListKeyDown}
            >
              {visible.map((row, index) => (
                <ValueRow
                  key={row.option.id}
                  id={`${listId}-${row.option.id}`}
                  row={row}
                  selected={selected.includes(row.option.id)}
                  active={index === clampedActive}
                  onSelect={() => {
                    setActiveIndex(index);
                    toggle(row.option.id);
                  }}
                />
              ))}
            </ul>
          </Scrollbars>
        </div>
      )}
    </div>
  );
}

function ValueRow({
  id,
  row,
  selected,
  active,
  onSelect,
}: {
  id: string;
  row: PickerRow;
  selected: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const { option, path, alsoUnder, rootIds } = row;
  const spansHierarchies = rootIds.length > 1;

  return (
    <li
      className={[
        styles['picker__row'],
        selected ? styles['picker__row--selected'] : '',
        active ? styles['picker__row--active'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      id={id}
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      // Keyboard selection is owned by the listbox container via
      // aria-activedescendant (the APG multi-select listbox pattern). This row
      // handler is a defensive duplicate for the case where a row itself ever
      // receives focus.
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <span className={styles['picker__row-box']} aria-hidden>
        <Icon
          size="16"
          glyph={selected ? <CheckboxMarkedIcon /> : <CheckboxBlankOutlineIcon />}
        />
      </span>
      <span className={styles['picker__row-body']}>
        <span className={styles['picker__row-head']}>
          <span className={styles['picker__row-label']}>{option.label}</span>
          {spansHierarchies && (
            <Tags size="X-Small" type="Info Dim">
              {`In ${rootIds.length} hierarchies`}
            </Tags>
          )}
        </span>

        {/* P5 · breadcrumb = the canonical path. Roots say so explicitly rather
            than showing an empty line. */}
        <span className={styles['picker__row-path']}>
          {path.length === 0 ? (
            <span className={styles['picker__row-path-root']}>
              Top of its own hierarchy
            </span>
          ) : (
            path.map((segment, i) => (
              <span key={`${segment}-${i}`} className={styles['picker__row-crumb']}>
                {i > 0 && (
                  <span className={styles['picker__row-sep']} aria-hidden>
                    <Icon size="10" glyph={<ChevronRightIcon />} />
                  </span>
                )}
                {segment}
              </span>
            ))
          )}
        </span>

        {/* P4 · the value appears exactly once; its other parents are named here
            rather than duplicating the row under each of them. */}
        {alsoUnder.length > 0 && (
          <span className={styles['picker__row-also']}>
            Also under {listLabels(alsoUnder)}
          </span>
        )}
      </span>
      {option.disabled === true && (
        <span className={styles['picker__row-trailing']}>
          <Tags size="X-Small" type="Warning">
            Closed to new assignment
          </Tags>
        </span>
      )}
    </li>
  );
}
