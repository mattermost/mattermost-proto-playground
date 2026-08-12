import CheckIcon from '@mattermost/compass-icons/components/check';
import ColoredRankedInputChip from '@/components/ui/ColoredRankedInputChip/ColoredRankedInputChip';
import Icon from '@/components/ui/Icon/Icon';
import type { ClassificationScheme } from '../valueMenuModel';
import styles from './ValueMenuRow.module.scss';

export interface ValueMenuRowProps {
  label: string;
  /** Flat coloured value — Classification's five markings. */
  scheme: ClassificationScheme;
  selected: boolean;
  /** Roving tabindex: exactly one row in the menu is tabbable. */
  focused?: boolean;
  onClick: () => void;
  innerRef?: (el: HTMLButtonElement | null) => void;
}

/**
 * One row of the FLAT menu — Classification, and nothing else.
 *
 * This is a genuine `menuitemradio`: single-select, no children, activation
 * closes the menu, so the menu role model fits it exactly and Enter has only one
 * possible meaning. The hierarchical picker cannot use any of that, which is why
 * it has its own row (`ValueTreeItem`) rather than a mode on this one. A value
 * that changed role depending on which list it appeared in was the defect being
 * fixed; one row component per role model is how it stays fixed.
 *
 * The value renders as a chip rather than plain text — the pattern the shipping
 * Channel Info popover already uses. `MenuItem` could not host it: its `label` is
 * a string, so a coloured chip plus a trailing check has nowhere to go.
 */
export default function ValueMenuRow({
  label,
  scheme,
  selected,
  focused = false,
  onClick,
  innerRef,
}: ValueMenuRowProps) {
  const rootClass = [
    styles['value-menu-row'],
    selected ? styles['value-menu-row--selected'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      ref={innerRef}
      role="menuitemradio"
      aria-checked={selected}
      tabIndex={focused ? 0 : -1}
      className={rootClass}
      onClick={onClick}
    >
      <span className={styles['value-menu-row__main']}>
        <span className={styles['value-menu-row__chip']}>
          <ColoredRankedInputChip label={label} scheme={scheme} />
        </span>
      </span>

      <span className={styles['value-menu-row__trailing']}>
        {selected && (
          <span className={styles['value-menu-row__check']}>
            <Icon size="16" glyph={<CheckIcon />} />
          </span>
        )}
      </span>
    </button>
  );
}
