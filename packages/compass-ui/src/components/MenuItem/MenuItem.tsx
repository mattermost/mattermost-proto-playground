import type { ButtonHTMLAttributes, ReactNode } from 'react';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import CheckIcon from '@mattermost/compass-icons/components/check';
import Icon from '@/components/Icon/Icon';
import Tag from '@/components/Tag/Tag';
import MentionBadge from '@/components/MentionBadge/MentionBadge';
import styles from './MenuItem.module.scss';

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Primary label text. */
  label: string;
  /** Optional secondary label. */
  secondaryLabel?: ReactNode;
  /** Where the secondary label appears. Default: 'Below'. */
  secondaryLabelPosition?: 'Inline' | 'Below';
  /** Custom content for the leading slot. When omitted, shows placeholder icon. */
  leadingVisual?: ReactNode;
  /** Show the leading visual slot. Default: true. */
  leadingElement?: boolean;
  /** Custom content for the trailing slot. When omitted with trailingElement=true, shows check icon. */
  trailingVisual?: ReactNode;
  /** Show the trailing visual slot. Default: false. */
  trailingElement?: boolean;
  /** Emoji character for custom status, shown inline after the label. */
  customStatusEmoji?: string;
  /** Show "NEW" label tag. */
  tag?: boolean;
  /** Inline mention count badge. */
  mentionCount?: number;
  /** Destructive (danger) styling. */
  destructive?: boolean;
  /** Highlight row (e.g. submenu parent while child menu is open). */
  active?: boolean;
}

/**
 * Menu item matching Figma/Compass Menu Item v2.0.0.
 *
 * @see https://compass.mattermost.com/29be2c109/p/1092d5-menu-item
 */
export default function MenuItem({
  label,
  secondaryLabel,
  secondaryLabelPosition = 'Below',
  leadingVisual,
  leadingElement = true,
  trailingVisual,
  trailingElement = false,
  customStatusEmoji,
  tag = false,
  mentionCount,
  destructive = false,
  active = false,
  className = '',
  disabled,
  type = 'button',
  ...rest
}: MenuItemProps) {
  const rootClass = [
    styles['menu-item'],
    destructive ? styles['menu-item--destructive'] : '',
    active ? styles['menu-item--active'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={rootClass} type={type} disabled={disabled} {...rest}>
      <div className={styles['menu-item__content']}>
        {leadingElement && (
          <div className={styles['menu-item__left']}>
            <span className={styles['menu-item__leading-visual']}>
              {leadingVisual ?? (
                <Icon glyph={<EmoticonHappyOutlineIcon />} size="16" />
              )}
            </span>
          </div>
        )}
        <div className={styles['menu-item__middle']}>
          <div className={styles['menu-item__top-row']}>
            <span className={styles['menu-item__label']}>{label}</span>
            {secondaryLabel && secondaryLabelPosition === 'Inline' && (
              <span className={styles['menu-item__secondary-label-inline']}>
                {secondaryLabel}
              </span>
            )}
            {customStatusEmoji && (
              <span className={styles['menu-item__custom-status']} aria-hidden>
                {customStatusEmoji}
              </span>
            )}
            {tag && <Tag label="NEW" />}
            {mentionCount != null && mentionCount > 0 && (
              <MentionBadge
                count={mentionCount}
                location="Menu Item"
                size="Small"
              />
            )}
          </div>
          {secondaryLabel && secondaryLabelPosition === 'Below' && (
            <div className={styles['menu-item__bottom-row']}>
              <span className={styles['menu-item__secondary-label-below']}>
                {secondaryLabel}
              </span>
            </div>
          )}
        </div>
        {trailingElement && (
          <div className={styles['menu-item__right']}>
            <span
              className={[
                styles['menu-item__trailing-visual'],
                !trailingVisual
                  ? styles['menu-item__trailing-visual--check']
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {trailingVisual ?? <Icon glyph={<CheckIcon />} size="16" />}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
