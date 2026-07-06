import type { ReactNode } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import styles from './PageHeader.module.scss';

export interface PageHeaderProps {
  title: string;
  description: string;
  /** Verb-noun primary action label. */
  primaryActionLabel: string;
  onPrimaryAction?: () => void;
  /** Optional pre-title slot (e.g. back link). */
  preTitle?: ReactNode;
  /** Optional slot rendered before the primary action (e.g. an overflow menu). */
  trailingAction?: ReactNode;
}

/**
 * Agents-pattern page header: title + one-line description + a single primary.
 * No second action. No secondary buttons. No tabs in the header.
 */
export default function PageHeader({
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  preTitle,
  trailingAction,
}: PageHeaderProps) {
  return (
    <div className={styles['page-header']}>
      <div className={styles['page-header__lead']}>
        {preTitle != null && (
          <div className={styles['page-header__pre']}>{preTitle}</div>
        )}
        <div className={styles['page-header__titleblock']}>
          <h1 className={styles['page-header__title']}>{title}</h1>
          <span className={styles['page-header__sep']} aria-hidden>
            |
          </span>
          <p className={styles['page-header__desc']}>{description}</p>
        </div>
      </div>
      <div className={styles['page-header__actions']}>
        {trailingAction}
        <Button
          emphasis="Primary"
          size="Medium"
          leadingIcon={<Icon glyph={<PlusIcon />} size="16" />}
          onClick={onPrimaryAction}
        >
          {primaryActionLabel}
        </Button>
      </div>
    </div>
  );
}
