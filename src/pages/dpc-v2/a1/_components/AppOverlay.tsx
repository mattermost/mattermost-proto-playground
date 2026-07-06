/**
 * AppOverlay — drop-in backdrop + dialog scaffolding for a modal that
 * renders over the ChannelShell `overlay` slot.
 *
 * Mirrors the pattern used in
 * `src/guidelines/layouts/modal/modal.specimen.tsx` so DPC V2 modals
 * inherit the canonical "modal over app" look — translucent backdrop,
 * centered dialog, no chrome from the prototype canvas itself.
 */
import type { ReactNode } from 'react';
import styles from './AppOverlay.module.scss';

export interface AppOverlayProps {
  /** The dialog (typically a `<Modal>`). */
  children: ReactNode;
  /** Place the dialog at top of viewport instead of centered. */
  align?: 'top' | 'center';
  /** Optional max-width override for the dialog wrapper. */
  maxWidth?: number;
  className?: string;
}

export default function AppOverlay({
  children,
  align = 'center',
  maxWidth,
  className,
}: AppOverlayProps) {
  return (
    <div
      className={[
        styles['app-overlay'],
        align === 'top' ? styles['app-overlay--top'] : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['app-overlay__backdrop']} aria-hidden />
      <div
        className={styles['app-overlay__dialog']}
        style={maxWidth ? { maxWidth } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
