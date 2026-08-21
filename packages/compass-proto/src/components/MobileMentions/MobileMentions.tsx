import type {ReactNode} from 'react';
import MobileTabScreen from '@/components/MobileTabScreen/MobileTabScreen';
import styles from './MobileMentions.module.scss';

export interface MobileMentionsProps {
  /** White sheet body — mention list, empty state, etc. */
  children?: ReactNode;
  className?: string;
}

/**
 * Mobile Recent Mentions tab layout — large title, subtitle, and sheet.
 *
 * @see Figma Patterns — Mobile — Top Nav Bar — Recent Mentions
 */
export default function MobileMentions({
  children,
  className = '',
}: MobileMentionsProps) {
  return (
    <MobileTabScreen
      className={className}
      header={
        <div className={styles['mobile-mentions__titles']}>
          <h1 className={styles['mobile-mentions__title']}>Recent mentions</h1>
          <p className={styles['mobile-mentions__subtitle']}>
            Messages you’ve been mentioned in
          </p>
        </div>
      }
    >
      {children}
    </MobileTabScreen>
  );
}
