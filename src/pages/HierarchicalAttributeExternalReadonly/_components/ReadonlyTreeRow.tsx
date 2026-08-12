import type { MouseEvent } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import Icon from '@/components/ui/Icon/Icon';
import ColoredRankedInputChip, {
  type ColoredRankedInputScheme,
} from '@/components/ui/ColoredRankedInputChip/ColoredRankedInputChip';
import styles from './ReadonlyTreeView.module.scss';

/** A node's additional (non-anchor) parent, resolved for the read-only chip strip. */
export interface AdditionalParentChip {
  id: string;
  label: string;
  restricted: boolean;
}

export interface ReadonlyTreeRowProps {
  id: string;
  label: string;
  depth: number;
  scheme: ColoredRankedInputScheme;
  color: string | null;
  /** This occurrence is a read-only reference stub (a non-anchor parent slot). */
  isStub: boolean;
  /** For a stub: the anchor (primary) parent's label, for the "edit under…" text. */
  anchorLabel?: string;
  disabled?: boolean;
  matched: boolean;
  highlighted: boolean;
  hasChildren: boolean;
  expanded: boolean;
  /** In-place cross-references OFF → extra parents ride here as read-only chips. */
  chips: AdditionalParentChip[];
  /** In-place cross-references ON → a quiet "in N places" marker instead of chips. */
  multiCount: number;
  /**
   * OPTIONAL, default off. When set, renders a small added/changed/removed diff
   * badge inside the row and appends the status to the row's accessible name.
   * Consumed only by the import-preview tree; the read-only external view never
   * passes it, so its rows are visually and semantically unchanged.
   */
  diffKind?: 'added' | 'changed' | 'removed';
  registerRow: (id: string, el: HTMLDivElement | null) => void;
  onToggle: () => void;
  onOpenDetail: (el: HTMLElement) => void;
  onJump: (id: string) => void;
}

/**
 * One rendered occurrence of an accessible value in the read-only tree. It keeps
 * the authoring tree's projection vocabulary (chevron, colored chip, parent
 * chips / in-place stubs, multi-place marker) but carries NO edit affordances —
 * no grip, no add/rename/delete cluster, no removable chips. Clicking the chip
 * opens the read-only detail popover; a stub links back to its anchor.
 */
export default function ReadonlyTreeRow({
  id,
  label,
  depth,
  scheme,
  color,
  isStub,
  anchorLabel,
  disabled,
  matched,
  highlighted,
  hasChildren,
  expanded,
  chips,
  multiCount,
  diffKind,
  registerRow,
  onToggle,
  onOpenDetail,
  onJump,
}: ReadonlyTreeRowProps) {
  const indent = {
    paddingLeft: `calc(${depth} * var(--spacing-l) + var(--spacing-s))`,
  } as const;

  const diffLabel =
    diffKind === 'added'
      ? 'Added'
      : diffKind === 'changed'
        ? 'Changed'
        : diffKind === 'removed'
          ? 'Removed'
          : null;
  const diffBadge = diffLabel && (
    <span
      className={[styles['row__diff'], styles[`row__diff--${diffKind}`]].join(
        ' ',
      )}
    >
      {diffLabel}
    </span>
  );

  if (isStub) {
    return (
      <div
        className={[styles['row'], styles['row--stub']].join(' ')}
        style={indent}
        role="treeitem"
        tabIndex={-1}
        aria-level={depth + 1}
        aria-selected={false}
        aria-label={`Reference to ${label}; primary location under ${anchorLabel ?? 'the top level'}; activate to go to it`}
      >
        <span className={styles['row__gutter']}>
          <span className={styles['row__twist-spacer']} aria-hidden />
          <span className={styles['stub__glyph']} aria-hidden>
            ↳
          </span>
        </span>
        {color && (
          <span
            className={styles['row__dot']}
            style={{ backgroundColor: color }}
            aria-hidden
          />
        )}
        <ColoredRankedInputChip
          label={label}
          scheme={scheme}
          disabled={disabled}
          onClick={() => onJump(id)}
        />
        <button type="button" className={styles['stub__link']} onClick={() => onJump(id)}>
          also appears here · defined under {anchorLabel ?? 'the top level'}
        </button>
      </div>
    );
  }

  return (
    <div
      ref={(el) => registerRow(id, el)}
      className={[
        styles['row'],
        styles['row--anchor'],
        disabled && styles['row--disabled'],
        matched && styles['row--match'],
        highlighted && styles['row--highlight'],
        diffKind && styles[`row--diff-${diffKind}`],
      ]
        .filter(Boolean)
        .join(' ')}
      style={indent}
      role="treeitem"
      tabIndex={-1}
      aria-level={depth + 1}
      aria-selected={false}
      aria-expanded={hasChildren ? expanded : undefined}
      aria-label={diffLabel ? `${label} — ${diffLabel}` : label}
    >
      <span className={styles['row__gutter']}>
        {hasChildren ? (
          <button
            type="button"
            className={styles['row__twist']}
            aria-label={expanded ? `Collapse ${label}` : `Expand ${label}`}
            onClick={onToggle}
          >
            <Icon size="16" glyph={expanded ? <ChevronDownIcon /> : <ChevronRightIcon />} />
          </button>
        ) : (
          <span className={styles['row__twist-spacer']} aria-hidden />
        )}
      </span>

      {color && (
        <span className={styles['row__dot']} style={{ backgroundColor: color }} aria-hidden />
      )}
      <ColoredRankedInputChip
        label={label}
        scheme={scheme}
        disabled={disabled}
        onClick={(e: MouseEvent<HTMLElement>) => onOpenDetail(e.currentTarget)}
      />

      {diffBadge}

      {multiCount > 1 && (
        <span className={styles['row__multi']}>in {multiCount} places</span>
      )}

      {chips.length > 0 && (
        <span className={styles['row__chips']}>
          {chips.map((chip) =>
            chip.restricted ? (
              <span
                key={chip.id}
                className={[styles['pchip'], styles['pchip--restricted']].join(' ')}
                aria-label="also a child of a restricted value you don’t have access to"
              >
                <Icon size="12" glyph={<LockOutlineIcon />} />
                Restricted
              </span>
            ) : (
              <button
                key={chip.id}
                type="button"
                className={styles['pchip']}
                aria-label={`also a child of ${chip.label}; activate to go to ${chip.label}`}
                onClick={() => onJump(chip.id)}
              >
                <Icon size="12" glyph={<OpenInNewIcon />} />
                <span className={styles['pchip__label']}>{chip.label}</span>
              </button>
            ),
          )}
        </span>
      )}

      {disabled && <span className={styles['row__flag']}>Inactive</span>}
    </div>
  );
}
