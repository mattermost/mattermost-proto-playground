import type { MouseEvent, KeyboardEvent } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import Icon from '@/components/ui/Icon/Icon';
import Chip from '@/components/ui/Chip/Chip';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import ClassificationPill from './ClassificationPill';
import styles from './AttributeChip.module.scss';

export type AttributeChipKind = 'ranked' | 'other';

/**
 * Source-of-value classification used to drive the tooltip copy and SR label.
 *
 *  - `inherited-locked`   — channel-locked inheritance; chip never opens a menu.
 *  - `inherited-editable` — channel-default inheritance; author may downgrade.
 *  - `post-only`          — attribute defined directly on Posts (no inheritance).
 *  - `overridden`         — was inherited, author picked a different (lower) value.
 */
export type AttributeChipSource =
  | 'inherited-locked'
  | 'inherited-editable'
  | 'post-only'
  | 'overridden';

export interface AttributeChipProps {
  /** Display label, e.g. `SECRET` or `Operation Shield`. */
  label: string;
  /** Ranked vs neutral chip variant. */
  kind: AttributeChipKind;
  /** Integer rank — only consumed when `kind === 'ranked'`. */
  rank?: number;
  /** Locked chips: never focusable, no menu, default cursor, no chevron. */
  locked: boolean;
  /** Drives tooltip + aria-label copy. */
  source: AttributeChipSource;
  /** Attribute display name, e.g. `Classification` — used in aria-label and tooltip. */
  attrName: string;
  /**
   * Source name shown in tooltip / aria-label, e.g. `#fires-watch`. Required
   * when `source === 'inherited-locked' | 'inherited-editable' | 'overridden'`.
   */
  sourceName?: string;
  /**
   * Unset placeholder mode — `label` is treated as placeholder copy, chevron
   * is always visible (the chip is the only ambient action item).
   */
  unset?: boolean;
  /** Mark a required-but-unset chip. Renders trailing asterisk + error border. */
  requiredMissing?: boolean;
  /**
   * When set, the chip renders as a colored ClassificationPill (banner scheme)
   * instead of the neutral ranked chip. Value id (ts | s | c | cui | u).
   */
  classificationValueId?: string;
  /** When true, the picker anchored to this chip is currently open. */
  active?: boolean;
  /** Opens the picker. Omit on locked chips. */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /** Extra class names — composed alongside the local module classes. */
  className?: string;
}

/**
 * Thin wrapper over RankedValueChip / Chip that owns the locked vs editable
 * affordance reveal. Read-only register in the calm state (no chevron, no
 * border). Hover/focus on editable chips reveals a pointer cursor, hairline
 * border, and trailing chevron (see ComposerScene tour). Tooltip text is
 * delivered via native `title` (Compass `Tooltip` is presentational only),
 * which still surfaces on hover and focus.
 */
export default function AttributeChip({
  label,
  kind,
  rank,
  locked,
  source,
  attrName,
  sourceName,
  unset = false,
  requiredMissing = false,
  classificationValueId,
  active = false,
  onClick,
  className = '',
}: AttributeChipProps) {
  const interactive = !locked && onClick != null;

  // ─── Tooltip + aria-label copy (load-bearing per design §5) ──────────────
  let tooltipText: string;
  let ariaLabel: string;
  if (locked) {
    tooltipText = `Classification is locked by channel policy. All posts in ${sourceName ?? 'this channel'} are classified ${label}.`;
    ariaLabel = `${attrName}: ${label}. Locked by channel policy.${sourceName ? ` From ${sourceName}.` : ''}`;
  } else if (source === 'inherited-editable') {
    tooltipText = `Inherited from ${sourceName ?? 'channel'}. Click to change.`;
    ariaLabel = `${attrName}: ${label}. Inherited from ${sourceName ?? 'channel'}. Press Enter to change.`;
  } else if (source === 'overridden') {
    tooltipText = `Overridden from channel default. Click to change or reset.`;
    ariaLabel = `${attrName}: ${label}. Overridden from channel default. Press Enter to change.`;
  } else if (unset) {
    tooltipText = `Post attribute. Click to set.`;
    ariaLabel = `${attrName}: not set.${requiredMissing ? ' Required.' : ''} Press Enter to set.`;
  } else {
    tooltipText = `Post attribute. Click to change.`;
    ariaLabel = `${attrName}: ${label}. Post attribute. Press Enter to change.`;
  }

  // ─── Locked path: render an unfocusable RankedValueChip / Chip as role="img" ─
  if (locked) {
    const lockedClass = [
      styles['attribute-chip'],
      styles['attribute-chip--locked'],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    if (kind === 'ranked') {
      return (
        <span
          className={lockedClass}
          role="img"
          aria-label={ariaLabel}
          title={tooltipText}
        >
          {classificationValueId ? (
            <ClassificationPill
              valueId={classificationValueId}
              label={label}
              size="Small"
              locked
            />
          ) : (
            <RankedValueChip label={label} rank={rank} size="Small" />
          )}
        </span>
      );
    }
    return (
      <span
        className={lockedClass}
        role="img"
        aria-label={ariaLabel}
        title={tooltipText}
      >
        <Chip size="Small" tone="neutral">
          {label}
        </Chip>
      </span>
    );
  }

  // ─── Editable path: chip is a button, chevron + hover affordance ─────────
  const editableClass = [
    styles['attribute-chip'],
    styles['attribute-chip--editable'],
    unset ? styles['attribute-chip--unset'] : '',
    active ? styles['attribute-chip--active'] : '',
    requiredMissing ? styles['attribute-chip--error'] : '',
    source === 'overridden' ? styles['attribute-chip--overridden'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Chevron node — used by both ranked and neutral chips. CSS controls fade.
  const chevron = (
    <span
      className={styles['attribute-chip__chevron']}
      aria-hidden
    >
      <Icon size="10" glyph={<ChevronDownIcon />} />
    </span>
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e as unknown as MouseEvent<HTMLElement>);
    }
  };

  if (kind === 'ranked') {
    return (
      <span
        className={editableClass}
        title={tooltipText}
      >
        <RankedValueChip
          label={label}
          rank={rank}
          size="Small"
          onClick={interactive ? onClick : undefined}
          active={active}
        />
        {chevron}
      </span>
    );
  }

  // Neutral chip rendered as button. Asterisk for required-missing rendered
  // after the label as a separate marker so SR users hear "Required." via
  // aria-label rather than parsing the asterisk glyph.
  return (
    <span
      className={editableClass}
      title={tooltipText}
    >
      <Chip
        as="button"
        size="Small"
        tone="neutral"
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={active}
        aria-required={requiredMissing || undefined}
        aria-invalid={requiredMissing || undefined}
        error={requiredMissing}
      >
        {label}
        {requiredMissing && (
          <span className={styles['attribute-chip__required']} aria-hidden>
            *
          </span>
        )}
      </Chip>
      {chevron}
    </span>
  );
}
