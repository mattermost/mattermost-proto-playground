import type { MouseEvent } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import Icon from '@/components/ui/Icon/Icon';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import styles from './ComposerScene.module.scss';

export interface AttributesButtonProps {
  /** Classification value to display on the button face — e.g. `SECRET`. */
  classificationLabel?: string;
  /** Classification rank (e.g. 4). Drives the LabelTag inside RankedValueChip. */
  classificationRank?: number;
  /** True when this post diverges from inherited defaults (any override or post-only set). */
  edited: boolean;
  /** Popover currently open. */
  active: boolean;
  /** Required-but-unset somewhere — surfaces an error border on the trigger. */
  hasError?: boolean;
  /** Open the Option B popover. */
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Option B trigger (design §12.1) — a quiet button left of Send:
 *
 *   `🛡 SECRET · Attributes ▾`     (calm state)
 *   `🛡 CUI · Attributes ✎▾`       (diverged state — overridden or post-only set)
 *   `Attributes ▾`                 (no classification applies)
 *
 * The Classification chip remains on the button face — it is the one
 * safety-critical glance and must not be buried. No count is rendered after
 * "Attributes" (per design §12.1, avoid numerals near classification). The
 * popover carries the full list.
 *
 * Rendered inside MessageInput's action row (left of the Aa format button).
 * The popover anchors above the trigger via ComposerScene's wrapper.
 */
export default function AttributesButton({
  classificationLabel,
  classificationRank,
  edited,
  active,
  hasError = false,
  onClick,
}: AttributesButtonProps) {
  const rootClass = [
    styles['attributes-button'],
    active ? styles['attributes-button--active'] : '',
    edited ? styles['attributes-button--edited'] : '',
    hasError ? styles['attributes-button--error'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const ariaLabel = classificationLabel
    ? `Post classification: ${classificationLabel}. ${edited ? 'Overrides applied. ' : ''}Open attributes`
    : 'Open attributes';

  const title = edited
    ? 'This post overrides channel attribute values.'
    : 'Open attributes';

  return (
    <button
      type="button"
      className={rootClass}
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={active}
      aria-label={ariaLabel}
      title={title}
    >
      {classificationLabel ? (
        <span className={styles['attributes-button__chip']}>
          <span className={styles['attributes-button__shield']} aria-hidden>
            <Icon size="12" glyph={<ShieldOutlineIcon />} />
          </span>
          <RankedValueChip
            label={classificationLabel}
            rank={classificationRank}
            size="Small"
          />
        </span>
      ) : null}
      <span className={styles['attributes-button__label']}>
        {classificationLabel ? '· Attributes' : 'Attributes'}
      </span>
      {edited && (
        <span className={styles['attributes-button__edited']} aria-hidden>
          <Icon size="10" glyph={<PencilOutlineIcon />} />
        </span>
      )}
      <Icon size="12" glyph={<ChevronDownIcon />} />
    </button>
  );
}
