import type { ReactNode } from 'react';
import styles from './ComposerScene.module.scss';

export interface ComposerAttrStripProps {
  /** Rail chips, already ordered: Classification first, then inherited, then post-only. */
  children: ReactNode;
  /** SR-only error region — used when a required post-only chip is unset. */
  errorMessage?: string | null;
  /**
   * Compact wrapper variant. Default register lives directly above the
   * MessageInput; the `--surface` modifier draws no background so the rail
   * sits flat on the channel center column.
   */
  variant?: 'surface' | 'flat';
}

/**
 * Page-local rail above the message input — the v2 "Attribute rail."
 *
 * One compact line (~28px) of AttributeChips. Wraps to additional rows when
 * the chip count exceeds the rail width — the design specifies a `+N more`
 * collapse beyond 2 rows; we ship up to 2 rows uncollapsed in the prototype
 * because seed data never exceeds 3 attributes (matches design §3.2 note).
 *
 * MessageInput exposes no children/footer slot — confirmed in MessageInput.tsx.
 * This wrapper renders adjacent (above) the MessageInput inside ChannelShell
 * children, owned by the page.
 */
export default function ComposerAttrStrip({
  children,
  errorMessage,
  variant = 'flat',
}: ComposerAttrStripProps) {
  const rootClass = [
    styles['composer-attr-strip'],
    variant === 'surface'
      ? styles['composer-attr-strip--surface']
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div className={rootClass} role="group" aria-label="Post attributes">
        <div className={styles['composer-attr-strip__row']}>{children}</div>
      </div>
      {errorMessage && (
        <p
          id="composer-attr-strip-error"
          className={styles['composer-attr-strip__sr-error']}
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </>
  );
}
