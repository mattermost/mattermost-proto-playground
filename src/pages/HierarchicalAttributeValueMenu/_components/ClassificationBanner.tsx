import type { ClassificationValue } from '../valueMenuModel';
import styles from './ClassificationBanner.module.scss';

export interface ClassificationBannerProps {
  value: ClassificationValue | null;
}

/**
 * The channel's marking band under the header. Present only when a
 * Classification value is set — an unset marking says nothing rather than
 * showing an empty band.
 */
export default function ClassificationBanner({
  value,
}: ClassificationBannerProps) {
  if (value == null) return null;
  return (
    <div
      className={[
        styles['classification-banner'],
        styles[`classification-banner--${value.scheme}`],
      ].join(' ')}
      role="note"
      aria-label={`Channel classification: ${value.label}`}
    >
      {value.label}
    </div>
  );
}
