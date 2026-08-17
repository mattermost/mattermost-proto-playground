import type {ReactNode} from 'react';
import MobileTabScreen from '@/components/MobileTabScreen/MobileTabScreen';
import styles from './MobileSavedMessages.module.scss';

export interface MobileSavedMessagesProps {
  /** White sheet body — saved list, empty state, etc. */
  children?: ReactNode;
  className?: string;
}

/**
 * Mobile Saved Messages tab layout — large title, subtitle, and sheet.
 *
 * @see Figma Patterns — Mobile — Top Nav Bar — Saved Messages
 */
export default function MobileSavedMessages({
  children,
  className = '',
}: MobileSavedMessagesProps) {
  return (
    <MobileTabScreen
      className={className}
      header={
        <div className={styles['mobile-saved-messages__titles']}>
          <h1 className={styles['mobile-saved-messages__title']}>
            Saved messages
          </h1>
          <p className={styles['mobile-saved-messages__subtitle']}>
            All messages you’ve saved for follow up
          </p>
        </div>
      }
    >
      {children}
    </MobileTabScreen>
  );
}
