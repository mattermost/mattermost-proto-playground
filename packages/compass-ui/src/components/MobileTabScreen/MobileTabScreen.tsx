import type {ReactNode} from 'react';
import styles from './MobileTabScreen.module.scss';

export interface MobileTabScreenProps {
  /** Large-title header region (sidebar-colored). */
  header: ReactNode;
  /** White rounded sheet content below the header. */
  children?: ReactNode;
  className?: string;
}

/**
 * Shared shell for secondary mobile tab destinations (Search, Mentions,
 * Saved, Profile): sidebar header + center-channel sheet with rounded top.
 */
export default function MobileTabScreen({
  header,
  children,
  className = '',
}: MobileTabScreenProps) {
  const rootClass = [styles['mobile-tab-screen'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['mobile-tab-screen__header']}>{header}</div>
      <div className={styles['mobile-tab-screen__sheet']}>{children}</div>
    </div>
  );
}
