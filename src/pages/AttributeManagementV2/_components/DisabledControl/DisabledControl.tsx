import type { ReactNode } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import InfoHint from '../InfoHint/InfoHint';
import styles from './DisabledControl.module.scss';

export interface DisabledControlProps {
  /** The (now non-interactive) control to render in a reduced-emphasis state. */
  children: ReactNode;
  /** One concise sentence stating WHY it's disabled and what to do. */
  reason: string;
  /** lock = policy/source ownership; info = a softer constraint. Default lock. */
  glyph?: 'lock' | 'info';
  className?: string;
}

/**
 * The single consistent disabled treatment for the whole surface (§6).
 *
 * A disabled control is never just greyed text: it is reduced-emphasis content
 * plus a lock (or info) glyph, and the glyph always carries a one-sentence
 * tooltip explaining why and, where relevant, what to do instead.
 */
export default function DisabledControl({
  children,
  reason,
  glyph = 'lock',
  className = '',
}: DisabledControlProps) {
  return (
    <span
      className={[styles['disabled'], className].filter(Boolean).join(' ')}
    >
      <span className={styles['disabled__content']} aria-disabled>
        {children}
      </span>
      <InfoHint label={reason} arrow="Bottom">
        <span className={styles['disabled__glyph']} aria-hidden>
          {glyph === 'lock' ? (
            <LockOutlineIcon size={14} />
          ) : (
            <InformationOutlineIcon size={14} />
          )}
        </span>
      </InfoHint>
    </span>
  );
}
