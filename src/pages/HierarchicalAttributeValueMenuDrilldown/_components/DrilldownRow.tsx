import { useId } from 'react';
import CheckboxBlankOutlineIcon from '@mattermost/compass-icons/components/checkbox-blank-outline';
import CheckboxMarkedIcon from '@mattermost/compass-icons/components/checkbox-marked';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import { MENU_COPY } from '@/pages/HierarchicalAttributeValueMenu/valueMenuCopy';
import type { DrillRowKind } from '../drilldownModel';
import styles from './DrilldownRow.module.scss';

export interface DrilldownRowProps {
  label: string;
  /** Decides the role. `branch` navigates; `self` and `leaf` select. */
  kind: DrillRowKind;
  /** Set position, where the set is unambiguous (root list, group, results). */
  posInSet?: number;
  setSize?: number;
  /** Ignored on a navigation row, which has no selection state to draw. */
  selected: boolean;
  /** Distinguishes the level's own value row from the header naming that level. */
  qualifier?: string | null;
  /** Labels of the parents this value is ALSO under. Empty for a single parent. */
  otherParents: string[];
  /** Navigation rows only — selection this branch holds or conceals, as text. */
  navNote?: string | null;
  /** Search results only — the canonical breadcrumb under the label. */
  path?: string[];
  /** Roving tabindex: exactly one row in the level is tabbable. */
  focused: boolean;
  /** Toggle for a checkbox row; drill in for a navigation row. */
  onActivate: () => void;
  innerRef?: (el: HTMLDivElement | null) => void;
}

/**
 * One row of the drill-in panel. The whole conformance argument of this variation
 * is two lines of this file — the `role` and what sits beside it.
 *
 * TWO ROLES, DECIDED BY WHAT THE ROW IS FOR:
 *
 *  `branch` → `menuitem` + `aria-haspopup="menu"` + `aria-expanded`. NAVIGATION
 *  ONLY. No checkbox glyph, no `aria-checked`, and activating it does exactly one
 *  thing: replace the panel body with that value's level. This is required rather
 *  than stylistic — ARIA 1.2 defines activating a parent `menuitem` as opening its
 *  submenu, and APG's Enter behaviour is exclusive ("When focus is on a `menuitem`
 *  that has a submenu, opens the submenu … Otherwise, activates the item"), so
 *  there is no key left with which such a row could also select. Shipping
 *  Mattermost agrees: `menu/sub_menu.tsx` sets `onClick: isMobileView ?
 *  handleOnClick : undefined`.
 *
 *  `self` / `leaf` → `menuitemcheckbox` + `aria-checked`. Space or Enter toggles
 *  and the panel stays open. A branch value's checkbox exists exactly once, as the
 *  `self` row at the top of its own level.
 *
 * `aria-expanded` is always false on a navigation row, and that is correct rather
 * than a bug: drilling in REPLACES the body, so the row is never on screen while
 * its level is showing. The property is present because the row does own a
 * submenu — the state simply cannot be true at the moment it can be read.
 *
 * WHAT THE ROW MAY SAY WITHOUT A CONTROL. Three facts arrive by
 * `aria-describedby`, never as extra widgets: the parents a multi-parent value is
 * also under, the selection a navigation row holds or conceals, and a search
 * result's path. A navigation row that hid selection would be dishonest; one that
 * drew a check would announce a state it cannot change.
 *
 * NO NUMERALS, ANYWHERE. A value's ordinal is per-parent — Mission Casper is
 * second under Raptor Flight and first under Dragon Spacecraft — so two rows both
 * showing `2` would imply a comparability the graph does not have. Ranking decides
 * row ORDER only. The numeral belongs to the authoring surface, where positions
 * are being edited.
 *
 * SEARCH ROWS ARE FLUSH. No indent and no reserved chevron column: a flat result
 * list has no parent on screen to align to, so the leading checkbox is the only
 * fixed column and the breadcrumb carries the location instead.
 */
export default function DrilldownRow({
  label,
  kind,
  posInSet,
  setSize,
  selected,
  qualifier,
  otherParents,
  navNote,
  path,
  focused,
  onActivate,
  innerRef,
}: DrilldownRowProps) {
  const baseId = useId();
  const qualifierId = `${baseId}-qualifier`;
  const alsoId = `${baseId}-also`;
  const noteId = `${baseId}-note`;
  const pathId = `${baseId}-path`;

  const navigation = kind === 'branch';
  const showQualifier = qualifier != null && qualifier !== '';
  const showAlso = otherParents.length > 0;
  const showNote = navigation && navNote != null;
  const showPath = path != null && path.length > 0;

  const describedBy =
    [
      showQualifier ? qualifierId : '',
      showAlso ? alsoId : '',
      showNote ? noteId : '',
      showPath ? pathId : '',
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const rootClass = [
    styles['drilldown-row'],
    navigation ? styles['drilldown-row--navigation'] : '',
    kind === 'self' ? styles['drilldown-row--self'] : '',
    !navigation && selected ? styles['drilldown-row--selected'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={innerRef}
      role={navigation ? 'menuitem' : 'menuitemcheckbox'}
      aria-haspopup={navigation ? 'menu' : undefined}
      aria-expanded={navigation ? false : undefined}
      aria-checked={navigation ? undefined : selected}
      aria-posinset={posInSet}
      aria-setsize={setSize}
      aria-label={label}
      aria-describedby={describedBy}
      tabIndex={focused ? 0 : -1}
      className={rootClass}
      onClick={onActivate}
      onKeyDown={(event) => {
        // The row's default action is the row's business — toggling for a
        // checkbox, drilling for a navigation row. Everything that moves BETWEEN
        // rows or BETWEEN levels (arrows, Backspace, Home/End, type-ahead) belongs
        // to the panel and is handled there, so the two never share a key.
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopPropagation();
        onActivate();
      }}
    >
      {navigation ? (
        // Keeps labels on one optical column with the checkbox rows above. A blank
        // slot, deliberately: an outlined empty box here would read as "unchecked",
        // which is precisely the claim a navigation row must not make.
        <span className={styles['drilldown-row__control-slot']} aria-hidden />
      ) : (
        <span className={styles['drilldown-row__control']} aria-hidden>
          <Icon
            size="16"
            glyph={
              selected ? <CheckboxMarkedIcon /> : <CheckboxBlankOutlineIcon />
            }
          />
        </span>
      )}

      <span className={styles['drilldown-row__main']}>
        <span className={styles['drilldown-row__chip']}>
          <Chip size="Small">{label}</Chip>
        </span>

        {showQualifier && (
          <span className={styles['drilldown-row__qualifier']} id={qualifierId}>
            {qualifier}
          </span>
        )}
        {showAlso && (
          <span className={styles['drilldown-row__also']} id={alsoId}>
            {MENU_COPY.alsoUnder(otherParents)}
          </span>
        )}
        {showNote && (
          <span className={styles['drilldown-row__note']} id={noteId}>
            {navNote}
          </span>
        )}
        {showPath && (
          <span className={styles['drilldown-row__path']} id={pathId}>
            {path.join(' › ')}
          </span>
        )}
      </span>

      {navigation && (
        <span className={styles['drilldown-row__chevron']} aria-hidden>
          <Icon size="16" glyph={<ChevronRightIcon />} />
        </span>
      )}
    </div>
  );
}
