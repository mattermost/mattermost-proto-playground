import type { ReactNode } from 'react';
import ArrowBackIosIcon from '@mattermost/compass-icons/components/arrow-back-ios';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import styles from './ConsolePageHeader.module.scss';

export interface ConsolePageHeaderProps {
  /** Page title text. */
  title: string;
  /** Show the back button on the left. */
  backButton?: boolean;
  /** Callback when the back button is clicked. */
  onBack?: () => void;
  /** Optional tag badge shown after the title (e.g. "Enterprise", "Beta"). */
  tag?: string;
  /** Optional trailing content (e.g. action buttons) on the right side. */
  trailing?: ReactNode;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * System Console page header — top bar of the main content area.
 * Shows a page title with optional back button and tag badge.
 *
 * Variants:
 * - Back button off: just title + optional tag
 * - Back button on: left back-arrow column with divider + title + optional tag
 *
 * @see Figma: Compass System Console → System Console Page Header
 */
export default function ConsolePageHeader({
  title,
  backButton = false,
  onBack,
  tag,
  trailing,
  className = '',
}: ConsolePageHeaderProps) {
  const rootClass = [styles['console-page-header'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['console-page-header__content']}>
        {backButton && (
          <div className={styles['console-page-header__back']}>
            <IconButton
              size="Medium"
              aria-label="Go back"
              icon={<Icon size="20" glyph={<ArrowBackIosIcon />} />}
              onClick={onBack}
            />
          </div>
        )}
        <div className={styles['console-page-header__title-area']}>
          <h1 className={styles['console-page-header__title']}>{title}</h1>
          {tag != null && (
            <span className={styles['console-page-header__tag']}>{tag}</span>
          )}
        </div>
        {trailing != null && (
          <div className={styles['console-page-header__trailing']}>
            {trailing}
          </div>
        )}
      </div>
    </div>
  );
}
