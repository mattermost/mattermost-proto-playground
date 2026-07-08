import type { MouseEvent } from 'react';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import styles from './ColoredRankedInputChip.module.scss';

export type ColoredRankedInputScheme =
  | 'green'
  | 'blue'
  | 'red'
  | 'orange'
  | 'purple'
  | 'neutral'
  | 'plain';

export interface ColoredRankedInputChipProps {
  label: string;
  rank?: number;
  scheme: ColoredRankedInputScheme;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onRemove?: (e: MouseEvent<HTMLButtonElement>) => void;
  removeLabel?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Filled ranked option chip — banner-colored pill with a shaded rank cap,
 * white label, and optional trailing remove (Figma Input Chip / Hierarchical
 * Attributes).
 */
export default function ColoredRankedInputChip({
  label,
  rank,
  scheme,
  onClick,
  onRemove,
  removeLabel,
  active = false,
  disabled = false,
  className = '',
}: ColoredRankedInputChipProps) {
  const interactive = !disabled && onClick != null;
  const Tag = interactive ? 'button' : 'span';

  const rootClass = [
    styles.chip,
    styles[`chip--${scheme}`],
    rank != null ? styles['chip--ranked'] : '',
    interactive ? styles['chip--interactive'] : '',
    active ? styles['chip--active'] : '',
    disabled ? styles['chip--disabled'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      type={interactive ? 'button' : undefined}
      className={rootClass}
      disabled={interactive ? disabled : undefined}
      onClick={interactive ? onClick : undefined}
      aria-expanded={interactive ? active : undefined}
    >
      {rank != null && (
        <>
          <span className={styles['chip__rank-shade']} aria-hidden />
          <span className={styles['chip__rank']}>{rank}</span>
        </>
      )}
      <span className={styles['chip__body']}>
        <span className={styles['chip__label']}>{label}</span>
        {onRemove != null && !disabled && (
          <button
            type="button"
            className={styles['chip__remove']}
            aria-label={removeLabel ?? `Remove ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(e);
            }}
          >
            <CloseCircleIcon size={12} aria-hidden />
          </button>
        )}
      </span>
    </Tag>
  );
}
