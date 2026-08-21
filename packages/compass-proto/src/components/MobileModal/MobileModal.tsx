import type {ReactNode} from 'react';
import { Scrollbar } from '@mattermost/compass-ui';
import MobileModalNavigationBar, {
  type MobileModalNavigationBarVariant,
} from '@/components/MobileModalNavigationBar/MobileModalNavigationBar';
import styles from './MobileModal.module.scss';

export interface MobileModalProps {
  /** Parent shows Close; Child shows Back. Default: Parent. */
  variant?: MobileModalNavigationBarVariant;
  /** Modal title in the top nav. */
  title: string;
  /** Optional subtitle under the title. */
  subtitle?: string;
  /** Optional 24px avatar before the title (ignored when subtitle is set). */
  avatarSrc?: string;
  avatarAlt?: string;
  /** Text action on the right (e.g. Done, Save). */
  actionLabel?: string;
  onActionClick?: () => void;
  /** Optional trailing icon button (e.g. Send). */
  trailingIcon?: ReactNode;
  onTrailingIconClick?: () => void;
  /** Parent — close control. */
  onCloseClick?: () => void;
  /** Child — back control. */
  onBackClick?: () => void;
  /** Scrollable body slot — any modal content. */
  children?: ReactNode;
  className?: string;
}

/**
 * Mobile iOS modal shell: Modal Top Nav Bar + scrollable content slot.
 *
 * @see Figma Patterns — Mobile — Top Nav Bar — Modal
 * @see https://www.figma.com/design/pdKKsvCKoy2HxsbASFPAg8/MM-45221-Settings-UI-Improvements?node-id=2-29072
 */
export default function MobileModal({
  variant = 'Parent',
  title,
  subtitle,
  avatarSrc,
  avatarAlt,
  actionLabel,
  onActionClick,
  trailingIcon,
  onTrailingIconClick,
  onCloseClick,
  onBackClick,
  children,
  className = '',
}: MobileModalProps) {
  const rootClass = [styles['mobile-modal'], className].filter(Boolean).join(' ');

  return (
    <div
      className={rootClass}
      role='dialog'
      aria-label={title}
    >
      <div className={styles['mobile-modal__nav']}>
        <MobileModalNavigationBar
          variant={variant}
          title={title}
          subtitle={subtitle}
          avatarSrc={avatarSrc}
          avatarAlt={avatarAlt}
          actionLabel={actionLabel}
          onActionClick={onActionClick}
          trailingIcon={trailingIcon}
          onTrailingIconClick={onTrailingIconClick}
          onCloseClick={onCloseClick}
          onBackClick={onBackClick}
        />
      </div>
      <div className={styles['mobile-modal__body']}>
        <Scrollbar>
          <div className={styles['mobile-modal__body-inner']}>{children}</div>
        </Scrollbar>
      </div>
    </div>
  );
}
