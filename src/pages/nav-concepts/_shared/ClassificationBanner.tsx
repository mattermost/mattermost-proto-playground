import { CLASSIFICATION_META, type Classification } from './types';
import styles from './ClassificationBanner.module.scss';

interface ClassificationBannerProps {
  classification: Classification;
  /** When true, indicates the active tab strip mixes multiple classifications. */
  mixed?: boolean;
}

export default function ClassificationBanner({
  classification,
  mixed = false,
}: ClassificationBannerProps) {
  const cls = CLASSIFICATION_META[classification];
  return (
    <div
      className={styles['cb']}
      style={{
        background: cls.color,
        // Subtle striped pattern for "mixed" state
        backgroundImage: mixed
          ? `repeating-linear-gradient(135deg, ${cls.color}, ${cls.color} 8px, rgba(0,0,0,0.18) 8px, rgba(0,0,0,0.18) 16px)`
          : undefined,
      }}
    >
      <span className={styles['cb__label']}>
        {mixed ? 'MIXED: ' : ''}
        {cls.label}
      </span>
      {mixed ? (
        <span className={styles['cb__hint']}>
          Open tabs span multiple classification levels
        </span>
      ) : null}
    </div>
  );
}
