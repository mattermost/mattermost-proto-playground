import type { ReactNode } from 'react';
import ArrowBackIosIcon from '@mattermost/compass-icons/components/arrow-back-ios';
import MattermostIcon from '@mattermost/compass-icons/components/mattermost';
import Icon from '@/components/Icon/Icon';
import IconButton from '@/components/IconButton/IconButton';
import Tag from '@/components/Tag/Tag';
import styles from './AdminConsoleHeader.module.scss';

export interface AdminConsoleHeaderProps {
  /** Page heading (Heading 500). */
  title: ReactNode;
  /** When true, shows a back control with a divider from the title block. */
  showBack?: boolean;
  ariaLabelBack?: string;
  onBackClick?: () => void;
  /** Optional plan or edition tag beside the title. */
  enterpriseBadge?: boolean;
  enterpriseBadgeLabel?: string;
  /** Optional actions on the trailing edge of the title row. */
  trailing?: ReactNode;
  className?: string;
}

/**
 * Strip header for System Console content: title, optional enterprise tag, optional back affordance.
 */
export default function AdminConsoleHeader({
  title,
  showBack = false,
  ariaLabelBack = 'Go back',
  onBackClick,
  enterpriseBadge = false,
  enterpriseBadgeLabel = 'Enterprise',
  trailing,
  className = '',
}: AdminConsoleHeaderProps) {
  const enterpriseChip =
    enterpriseBadge ? (
      <Tag
        label={enterpriseBadgeLabel}
        size="X-Small"
        leadingIcon={<Icon size="12" glyph={<MattermostIcon />} />}
      />
    ) : null;

  return (
    <header
      className={[styles['admin-console-header'], className].join(' ').trim()}
    >
      <div className={styles['admin-console-header__row']}>
        {showBack && (
          <div className={styles['admin-console-header__back']}>
            <IconButton
              type="button"
              style="Default"
              size="Medium"
              className={styles['admin-console-header__back-button']}
              aria-label={ariaLabelBack}
              onClick={onBackClick}
              icon={<Icon size="20" glyph={<ArrowBackIosIcon />} />}
            />
          </div>
        )}
        <div className={styles['admin-console-header__title-row']}>
          <div className={styles['admin-console-header__intro']}>
            <h1 className={styles['admin-console-header__title']}>{title}</h1>
            {enterpriseChip}
          </div>
          {trailing != null ? (
            <div className={styles['admin-console-header__trailing']}>
              {trailing}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
