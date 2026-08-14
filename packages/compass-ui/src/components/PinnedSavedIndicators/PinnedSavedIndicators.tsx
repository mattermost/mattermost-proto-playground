import PinOutlineIcon from '@mattermost/compass-icons/components/pin-outline';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import Icon from '@/components/Icon/Icon';
import styles from './PinnedSavedIndicators.module.scss';

export interface PinnedSavedIndicatorsProps {
  /** Optional CSS class on the root. */
  className?: string;
}

/**
 * Pinned + Saved row shown above a message when applicable (Patterns — Message).
 */
export default function PinnedSavedIndicators({
  className = '',
}: PinnedSavedIndicatorsProps) {
  const rootClass = [styles['pinned-saved-indicators'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} aria-label="Pinned and Saved">
      <div className={styles['pinned-saved-indicators__icons']}>
        <Icon size="12" glyph={<PinOutlineIcon />} aria-hidden />
        <Icon size="12" glyph={<BookmarkOutlineIcon />} aria-hidden />
      </div>
      <div className={styles['pinned-saved-indicators__labels']}>
        <span className={styles['pinned-saved-indicators__label']}>Pinned</span>
        <span className={styles['pinned-saved-indicators__sep']} aria-hidden>
          •
        </span>
        <span className={styles['pinned-saved-indicators__label']}>Saved</span>
      </div>
    </div>
  );
}
