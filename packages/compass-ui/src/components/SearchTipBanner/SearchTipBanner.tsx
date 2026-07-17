import type { ReactNode } from 'react';
import IconButton from '@/components/IconButton/IconButton';
import Icon from '@/components/Icon/Icon';
import { ShortcutTagGroup } from '@/components/ShortcutTag/ShortcutTag';
import CloseIcon from '@mattermost/compass-icons/components/close';
import styles from './SearchTipBanner.module.scss';

export interface ShortcutKey {
  label: string;
}

export interface SearchTipBannerProps {
  /** Text shown before the shortcut keys. Default: "Tip: Try". */
  prefix?: string;
  /** Text shown after the shortcut keys. Default: "to search this channel". */
  suffix?: string;
  /** Keyboard shortcut keys to display. */
  shortcutKeys?: ShortcutKey[];
  /** Called when the dismiss button is clicked. */
  onDismiss?: () => void;
  /** Optional CSS class name. */
  className?: string;
  /** Custom content to replace the default tip content. */
  children?: ReactNode;
}

/**
 * Search Tip Banner — dismissable hint banner showing keyboard shortcut tips.
 * Used contextually to surface relevant keyboard shortcuts to users.
 */
export default function SearchTipBanner({
  prefix = 'Tip: Try',
  suffix = 'to search this channel',
  shortcutKeys = [{ label: '⌘' }, { label: 'Shift' }, { label: 'F' }],
  onDismiss,
  className = '',
  children,
}: SearchTipBannerProps) {
  return (
    <div
      className={[styles['search-tip-banner'], className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['search-tip-banner__content']}>
        {children ?? (
          <>
            <span className={styles['search-tip-banner__text']}>{prefix}</span>
            <ShortcutTagGroup
              labels={shortcutKeys.map((key) => key.label)}
              size="Medium"
            />
            <span className={styles['search-tip-banner__text']}>{suffix}</span>
          </>
        )}
      </div>
      {onDismiss != null && (
        <IconButton
          aria-label="Dismiss tip"
          size="Small"
          icon={<Icon size="16" glyph={<CloseIcon />} />}
          onClick={onDismiss}
        />
      )}
    </div>
  );
}
