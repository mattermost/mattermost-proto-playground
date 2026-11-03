import type { ReactNode } from 'react';
import styles from './WidgetFrame.module.scss';

export interface WidgetFrameProps {
  /** Card content. */
  children: ReactNode;
  /** Host-rendered menus / popovers, anchored above the card. */
  popovers?: ReactNode;
  /** Accessible name of the region. */
  ariaLabel: string;
  /** ARIA role of the card; `region` unless the card is a dialog-like prompt. */
  role?: 'region' | 'dialog';
  className?: string;
}

const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(' ');

/**
 * The 302px call-widget card shared by every widget phase (pre-join, calling,
 * incoming, active): bordered light surface with an elevation shadow and an
 * anchor above it for menus. Presentational.
 */
export default function WidgetFrame({
  children,
  popovers,
  ariaLabel,
  role = 'region',
  className,
}: WidgetFrameProps) {
  return (
    <div
      className={cx(styles['widget-frame'], className)}
      role={role}
      aria-label={ariaLabel}
    >
      <div className={styles['widget-frame__body']}>{children}</div>
      {popovers && (
        <div className={styles['widget-frame__popovers']}>{popovers}</div>
      )}
    </div>
  );
}
