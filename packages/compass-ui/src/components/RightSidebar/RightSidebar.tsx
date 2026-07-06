import type { ReactNode } from 'react';
import Scrollbar from '@/components/Scrollbar/Scrollbar';
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
  /**
   * When true, the sidebar grows horizontally instead of staying at 400px.
   * Pair with a parent flex row and `channel-shell__right-sidebar--fill` in full layouts.
   */
  fill?: boolean;
  /**
   * When `end`, short body content sits on the bottom of the scroll viewport (e.g.
   * thread replies). Default `start` keeps content top-aligned (e.g. channel info).
   */
  alignBody?: 'start' | 'end';
}

export default function RightSidebar({
  header,
  footer,
  children,
  className = '',
  fill = false,
  alignBody = 'start',
}: RightSidebarProps) {
  const rootClass = [
    styles['right-sidebar'],
    fill ? styles['right-sidebar--fill'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const bodyClass = [
    styles['right-sidebar__body'],
    alignBody === 'end' ? styles['right-sidebar__body--align-end'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={rootClass} aria-label="Right sidebar">
      <div className={styles['right-sidebar__header']}>{header}</div>
      <div className={bodyClass}>
        <Scrollbar>{children}</Scrollbar>
      </div>
      {footer && (
        <div className={styles['right-sidebar__footer']}>{footer}</div>
      )}
    </aside>
  );
}
