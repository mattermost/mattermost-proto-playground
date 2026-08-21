import type {ButtonHTMLAttributes, ReactNode} from 'react';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import CheckIcon from '@mattermost/compass-icons/components/check';
import { Icon } from '@mattermost/compass-ui';
import { Tag } from '@mattermost/compass-ui';
import { MentionBadge } from '@mattermost/compass-ui';
import styles from './MobileMenuItem.module.scss';

export interface MobileMenuItemProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Primary label text (string or rich content, e.g. bold modifiers). */
  label: ReactNode;
  /** Optional secondary label. */
  secondaryLabel?: ReactNode;
  /**
   * Where the secondary label appears. Default: 'Below'.
   * Figma “Stacked” maps to 'Below'.
   */
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
  /** Selected / pressed highlight (button-bg 8%, or danger fill when destructive). */
  active?: boolean;
  /** Full-width hairline under the row. */
  divider?: boolean;
}

/**
 * Mobile menu item — touch-sized sibling of desktop Menu Item.
 *
 * @see https://www.figma.com/design/IBITzyXssAETgH3w5xN5Ox/Components---Mobile---Menu-Item?node-id=3516-3085
 */
export default function MobileMenuItem({
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
  divider = false,
  className = '',
  disabled,
  type = 'button',
  ...rest
}: MobileMenuItemProps) {
  const rootClass = [
    styles['mobile-menu-item'],
    destructive ? styles['mobile-menu-item--destructive'] : '',
    active ? styles['mobile-menu-item--active'] : '',
    divider ? styles['mobile-menu-item--divider'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={rootClass} type={type} disabled={disabled} {...rest}>
      <div className={styles['mobile-menu-item__content']}>
        {leadingElement && (
          <div className={styles['mobile-menu-item__left']}>
            <span className={styles['mobile-menu-item__leading-visual']}>
              {leadingVisual ?? (
                <Icon glyph={<EmoticonHappyOutlineIcon />} size='20' />
              )}
            </span>
          </div>
        )}
        <div className={styles['mobile-menu-item__middle']}>
          <div className={styles['mobile-menu-item__top-row']}>
            <span className={styles['mobile-menu-item__label']}>{label}</span>
            {secondaryLabel && secondaryLabelPosition === 'Inline' && (
              <span className={styles['mobile-menu-item__secondary-label-inline']}>
                {secondaryLabel}
              </span>
            )}
            {customStatusEmoji && (
              <span
                className={styles['mobile-menu-item__custom-status']}
                aria-hidden
              >
                {customStatusEmoji}
              </span>
            )}
            {tag && <Tag label='NEW' />}
            {mentionCount != null && mentionCount > 0 && (
              <MentionBadge
                count={mentionCount}
                location='Menu Item'
                size='Small'
              />
            )}
          </div>
          {secondaryLabel && secondaryLabelPosition === 'Below' && (
            <div className={styles['mobile-menu-item__bottom-row']}>
              <span className={styles['mobile-menu-item__secondary-label-below']}>
                {secondaryLabel}
              </span>
            </div>
          )}
        </div>
        {trailingElement && (
          <div className={styles['mobile-menu-item__right']}>
            <span
              className={[
                styles['mobile-menu-item__trailing-visual'],
                !trailingVisual
                  ? styles['mobile-menu-item__trailing-visual--check']
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {trailingVisual ?? <Icon glyph={<CheckIcon />} size='20' />}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
