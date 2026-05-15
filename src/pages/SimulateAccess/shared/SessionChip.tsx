/**
 * SessionChip — a compact chip representing one session (real or custom),
 * or a pseudo-chip for "Add custom session" / "No recent session".
 *
 * Composed on top of the design-system `Chip` component. Verdict drives the
 * semantic tone; page-local style overrides handle the dashed "Custom" and
 * "Add" variants that fall outside Chip's neutral tone system.
 */
import type { MouseEvent } from 'react';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import AlertCircleIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Chip from '@/components/ui/Chip/Chip';
import type { ChipTone } from '@/components/ui/Chip/Chip';
import type { VerdictAttribution } from './types';
import styles from './SimulateAccess.module.scss';

export type SessionChipKind = 'real' | 'custom' | 'placeholder' | 'add';

export interface SessionChipProps {
  kind: SessionChipKind;
  /** Verdict drives the leading icon color. Required for real/custom/placeholder. */
  verdict?: VerdictAttribution;
  /** Display label. For 'real' = device name; for 'custom' = device source name (prefix added by chip). */
  label?: string;
  /** When true, this is the active chip (popover is open). */
  active?: boolean;
  onClick?: (rect: DOMRect) => void;
  ariaLabel?: string;
}

function verdictGlyph(v: VerdictAttribution | undefined) {
  if (v === 'allowed') return <CheckCircleIcon />;
  if (v === 'mixed') return <AlertCircleIcon />;
  return <CloseCircleIcon />;
}

function verdictTone(v: VerdictAttribution | undefined): ChipTone {
  if (v === 'allowed') return 'success';
  if (v === 'mixed') return 'warning';
  return 'danger';
}

export default function SessionChip({ kind, verdict, label, active, onClick, ariaLabel }: SessionChipProps) {
  const handleClick = onClick
    ? (e: MouseEvent<HTMLElement>) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        onClick(rect);
      }
    : undefined;

  // "Add custom session" — dashed info-tone chip with a plus icon.
  if (kind === 'add') {
    return (
      <Chip
        as="button"
        tone="info"
        leadingIcon={<PlusIcon />}
        onClick={handleClick}
        aria-label={ariaLabel ?? 'Add custom session'}
        className={[
          styles['sa-chip-add'],
          active && styles['sa-chip-add--active'],
        ]
          .filter(Boolean)
          .join(' ')}
      >
        Add custom session
      </Chip>
    );
  }

  // Placeholder — non-interactive muted chip signalling "no data".
  if (kind === 'placeholder') {
    return (
      <Chip
        as="button"
        disabled
        leadingIcon={verdictGlyph(verdict)}
        className={styles['sa-chip-placeholder']}
        title="No recent session in last 30 days · fail-secure deny"
        aria-label={ariaLabel}
      >
        {label ?? 'No recent session'}
      </Chip>
    );
  }

  const tone = verdictTone(verdict);

  // Custom session — verdict-toned chip with a dashed border override
  // plus a "Custom · " label prefix. The dashed border is the second leg of
  // the triple signal (fill + border + prefix) that survives downscaled
  // screenshots and monochrome printing for compliance audits.
  if (kind === 'custom') {
    return (
      <Chip
        as="button"
        tone={tone}
        leadingIcon={verdictGlyph(verdict)}
        trailingIcon={<ChevronRightIcon />}
        onClick={handleClick}
        aria-label={ariaLabel}
        className={[
          styles['sa-chip-custom'],
          active && styles['sa-chip--active'],
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className={styles['sa-chip__custom-prefix']}>Custom · </span>
        {label ?? ''}
      </Chip>
    );
  }

  // Real session — straight verdict-toned Chip with a trailing chevron.
  return (
    <Chip
      as="button"
      tone={tone}
      leadingIcon={verdictGlyph(verdict)}
      trailingIcon={<ChevronRightIcon />}
      onClick={handleClick}
      aria-label={ariaLabel}
      className={active ? styles['sa-chip--active'] : undefined}
    >
      {label ?? ''}
    </Chip>
  );
}
