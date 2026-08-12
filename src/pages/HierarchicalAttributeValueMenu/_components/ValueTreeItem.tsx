import { useId } from 'react';
import CheckboxBlankOutlineIcon from '@mattermost/compass-icons/components/checkbox-blank-outline';
import CheckboxMarkedIcon from '@mattermost/compass-icons/components/checkbox-marked';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import { MENU_COPY } from '../valueMenuCopy';
import styles from './ValueTreeItem.module.scss';

export interface ValueTreeItemProps {
  label: string;
  /** 1-based depth, spoken as `aria-level`. */
  level: number;
  /**
   * Search results are a FLAT list — no parent is on screen above them, so there
   * is no hierarchy for a reserved chevron column to align to. Reserving one
   * anyway pushes every result right and reads as an indent that means nothing;
   * worse, depth is unreadable from a pixel offset even when it IS meaningful.
   * With this on, the row sits flush and its breadcrumb path carries the location.
   */
  flush?: boolean;
  posInSet: number;
  setSize: number;
  selected: boolean;
  /** Has rows to draw beneath it. Leaves get a spacer and never `aria-expanded`. */
  branch: boolean;
  expanded: boolean;
  /** Labels of the parents this value is ALSO under. Empty for a single parent. */
  otherParents: string[];
  /** Selected values this collapsed branch is hiding. 0 when expanded or clean. */
  hiddenSelectedCount: number;
  /** Search mode only — the canonical path under the label. */
  path?: string[];
  /** Roving tabindex: exactly one node in the tree is tabbable. */
  focused: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  innerRef?: (el: HTMLDivElement | null) => void;
}

/**
 * One tree node — the whole picker's accessibility model lives in this file.
 *
 * FOUR RULES IT EXISTS TO ENFORCE:
 *
 *  1. EVERY VALUE IS THE SAME ROLE. `treeitem`, always, with `aria-level` and
 *     `aria-selected`. The build this replaces gave one value `menuitem` in one
 *     list and `menuitemcheckbox` in another, so its role depended on which
 *     panel you found it in. Branch-ness is `aria-expanded`, which is a state,
 *     not a different kind of thing.
 *
 *  2. TWO HIT TARGETS, EACH INDEPENDENTLY NAMED. The twisty is a real `<button>`
 *     with a node-specific name ("Expand Air Operations" / "Collapse Air
 *     Operations"); the rest of the row toggles selection. That separation is
 *     the whole point of leaving the menu role: ARIA 1.2 defines activating a
 *     parent `menuitem` as OPENING ITS SUBMENU, and APG's Enter behaviour is
 *     exclusive — "opens the submenu … Otherwise, activates the item" — so a
 *     selectable branch inside a menu has no keyboard path to selection at all
 *     (WCAG 2.1.1). A tree has no such conflict: Right expands, Space selects.
 *
 *  3. SELECTED IS PROGRAMMATIC. `aria-selected` on every node, expansion never
 *     borrowing the selection glyph and selection never borrowing the name. The
 *     previous build appended the string " — selected" to a parent's accessible
 *     name and left `aria-checked` undefined: no state, no state-change
 *     announcement, a 4.1.2 defect (and it drew a check the row could not
 *     toggle, because activation always went to the submenu).
 *
 *  4. THE ROW CONTAINS NO OTHER INTERACTIVE ELEMENT. The twisty is the ceiling.
 *     `aria-describedby` — not extra controls, not a tooltip — carries the two
 *     facts the row has to add: which other parents this value sits under, and
 *     how many selected values a collapsed branch is hiding.
 *
 * The twisty is `tabIndex={-1}` on purpose. The tree is a single tab stop, so
 * expansion's keyboard path is Right/Left on the node, exactly as APG specifies;
 * the button exists so a pointer has a 24px target and so assistive tech reads a
 * named control rather than an inert chevron.
 */
export default function ValueTreeItem({
  label,
  level,
  flush = false,
  posInSet,
  setSize,
  selected,
  branch,
  expanded,
  otherParents,
  hiddenSelectedCount,
  path,
  focused,
  onToggleSelect,
  onToggleExpand,
  innerRef,
}: ValueTreeItemProps) {
  const baseId = useId();
  const alsoId = `${baseId}-also`;
  const countId = `${baseId}-count`;

  const showAlso = otherParents.length > 0;
  const showCount = hiddenSelectedCount > 0;
  const describedBy =
    [showAlso ? alsoId : '', showCount ? countId : '']
      .filter(Boolean)
      .join(' ') || undefined;

  const rootClass = [
    styles['value-tree-item'],
    selected ? styles['value-tree-item--selected'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={innerRef}
      role="treeitem"
      aria-level={level}
      aria-posinset={posInSet}
      aria-setsize={setSize}
      aria-selected={selected}
      aria-expanded={branch ? expanded : undefined}
      aria-label={label}
      aria-describedby={describedBy}
      tabIndex={focused ? 0 : -1}
      className={rootClass}
      onClick={onToggleSelect}
      onKeyDown={(event) => {
        // The node's own default action lives on the node; everything that moves
        // between nodes (arrows, Home/End, type-ahead) belongs to the tree and is
        // handled there. Expansion and selection therefore never share a key.
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopPropagation();
        onToggleSelect();
      }}
    >
      {branch ? (
        <button
          type="button"
          tabIndex={-1}
          className={styles['value-tree-item__twisty']}
          aria-label={
            expanded
              ? MENU_COPY.collapseLabel(label)
              : MENU_COPY.expandLabel(label)
          }
          onClick={(event) => {
            event.stopPropagation();
            onToggleExpand();
          }}
          onKeyDown={(event) => {
            // If a pointer has left focus on the twisty, its own activation keys
            // must not also reach the row and toggle selection.
            if (event.key === 'Enter' || event.key === ' ') {
              event.stopPropagation();
            }
          }}
        >
          <Icon
            size="16"
            glyph={expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          />
        </button>
      ) : flush ? null : (
        <span
          className={styles['value-tree-item__twisty-spacer']}
          aria-hidden
        />
      )}

      <span className={styles['value-tree-item__control']} aria-hidden>
        <Icon
          size="16"
          glyph={
            selected ? <CheckboxMarkedIcon /> : <CheckboxBlankOutlineIcon />
          }
        />
      </span>

      <span className={styles['value-tree-item__main']}>
        <span className={styles['value-tree-item__chip']}>
          <Chip size="Small">{label}</Chip>
        </span>
        {showAlso && (
          <span className={styles['value-tree-item__also']} id={alsoId}>
            {MENU_COPY.alsoUnder(otherParents)}
          </span>
        )}
        {path != null && path.length > 0 && (
          <span className={styles['value-tree-item__path']}>
            {path.join(' › ')}
          </span>
        )}
      </span>

      {showCount && (
        <span className={styles['value-tree-item__count']} id={countId}>
          {MENU_COPY.selectedInside(hiddenSelectedCount)}
        </span>
      )}
    </div>
  );
}
