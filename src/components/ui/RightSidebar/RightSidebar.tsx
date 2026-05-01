import type { ReactNode } from 'react';
import styles from './RightSidebar.module.scss';

export interface RightSidebarProps {
  /** Header element (typically <RightSidebarHeader />). */
  header: ReactNode;
  /** Optional element rendered at the bottom of the sidebar (e.g. a reply composer). */
  footer?: ReactNode;
  /** Body content — anything. Scrolls when it overflows. The body has no padding;
   *  add your own when the content calls for it. */
  children?: ReactNode;
  className?: string;
}

export default function RightSidebar({
  header,
  footer,
  children,
  className = '',
}: RightSidebarProps) {
  const rootClass = [styles['right-sidebar'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={rootClass} aria-label="Right sidebar">
      <div className={styles['right-sidebar__header']}>{header}</div>
      <div className={styles['right-sidebar__body']}>{children}</div>
      {footer && (
        <div className={styles['right-sidebar__footer']}>{footer}</div>
      )}
    </aside>
  );
}
