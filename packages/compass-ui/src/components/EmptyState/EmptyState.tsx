import type { ReactNode } from 'react';
import Button from '@/components/Button/Button';
import type { ButtonProps } from '@/components/Button/Button';
import Illustration from '@/components/Illustration/Illustration';
import type { IllustrationProps } from '@/components/Illustration/Illustration';
import Scrollbar from '@/components/Scrollbar/Scrollbar';
import styles from './EmptyState.module.scss';

export interface EmptyStateProps {
  /** Illustration props (children = the SVG component). Rendered above the title. */
  illustration?: IllustrationProps;
  /** Main heading text. */
  title: string;
  /** Body description. Supports ReactNode for inline formatting. */
  description?: ReactNode;
  /** Button props (children = label). Rendered below the description. */
  action?: ButtonProps;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Empty State — illustration + message shown when a view has no content.
 * ~12 context-specific variants: no saved messages, no mentions, no results, no files, etc.
 *
 * @see https://compass.mattermost.com
 */
export default function EmptyState({
  illustration,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <Scrollbar
      className={[styles['empty-state'], className].filter(Boolean).join(' ')}
    >
      <div className={styles['empty-state__container']}>
        {illustration != null && (
          <div className={styles['empty-state__illustration']}>
            <Illustration {...illustration} />
          </div>
        )}
        <div className={styles['empty-state__titles']}>
          <h2 className={styles['empty-state__title']}>{title}</h2>
          {description != null && (
            <p className={styles['empty-state__description']}>{description}</p>
          )}
        </div>
        {action != null && (
          <div className={styles['empty-state__action']}>
            <Button {...action} />
          </div>
        )}
      </div>
    </Scrollbar>
  );
}
