import type { ReactNode } from 'react';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import styles from './ConsolePropertyRow.module.scss';

export interface ConsolePropertyRowProps {
  /**
   * Property name shown in the title column. Accepts a string (default
   * styling) or a ReactNode for callers that need to render an inline
   * affordance (e.g. an editable TextInput for a freshly-added row).
   */
  title: ReactNode;
  /** Property type icon (compass icon element). */
  typeIcon?: ReactNode;
  /** Property type label (e.g. "Text", "Select", "Boolean"). */
  typeLabel?: string;
  /** Value cell content — accepts any ReactNode for flexible rendering. */
  value?: ReactNode;
  /** Show a drag handle on the left. */
  draggable?: boolean;
  /** Show a lock indicator. */
  locked?: boolean;
  /** Hide the trailing more menu. Default: false. */
  hideMore?: boolean;
  /** Callback when the more / overflow menu is clicked. */
  onMore?: () => void;
  /** Replace the default "more" button with custom trailing content (e.g. a destructive remove button). */
  trailingAction?: ReactNode;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * System Console property / attribute row — a table-like row used in
 * settings pages for configuring properties (User Attributes, Permission
 * Policies, Membership Rules).
 *
 * Columns: [drag] | title | type | value | [lock] | more
 *
 * Renders inside ConsolePropertyTable.
 *
 * @see Figma: Compass System Console → Property Row in Settings
 */
export default function ConsolePropertyRow({
  title,
  typeIcon,
  typeLabel,
  value,
  draggable = false,
  locked = false,
  hideMore = false,
  onMore,
  trailingAction,
  className = '',
}: ConsolePropertyRowProps) {
  const rootClass = [styles['console-property-row'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['console-property-row__drag']}>
        {draggable && (
          <span className={styles['console-property-row__drag-icon']}>
            <Icon size="16" glyph={<DragVerticalIcon />} />
          </span>
        )}
      </div>

      <div className={styles['console-property-row__title']}>
        <span className={styles['console-property-row__title-text']}>
          {title}
        </span>
      </div>

      {(typeIcon != null || typeLabel != null) && (
        <div className={styles['console-property-row__type']}>
          {typeIcon != null && (
            <span className={styles['console-property-row__type-icon']}>
              <Icon size="16" glyph={typeIcon} />
            </span>
          )}
          {typeLabel != null && (
            <span className={styles['console-property-row__type-label']}>
              {typeLabel}
            </span>
          )}
        </div>
      )}

      <div className={styles['console-property-row__value']}>{value}</div>

      {locked && (
        <span className={styles['console-property-row__lock']}>
          <Icon size="16" glyph={<LockOutlineIcon />} />
        </span>
      )}

      {!hideMore && (
        <div className={styles['console-property-row__more']}>
          {trailingAction ?? (
            <IconButton
              size="X-Small"
              aria-label="More actions"
              icon={<Icon size="12" glyph={<DotsHorizontalIcon />} />}
              onClick={onMore}
            />
          )}
        </div>
      )}
    </div>
  );
}
