import LabelTag from '@/components/ui/LabelTag/LabelTag';
import type { ValueScheme } from '../boundsModel';
import { CHAIN_CHANNEL_IS_CAP_NOTE, CHAIN_TITLE, chainCaption } from '../copy';
import ValueChip from './ValueChip';
import styles from './CapChain.module.scss';

export interface CapChainLink {
  /** Tier name — "Post", "~falcon-ops", "System default". */
  label: string;
  /** Resolved value, or `null` when it could not be resolved. */
  valueId: string | null;
  /** Short text shown in place of a chip when `valueId` is null. */
  unresolvedText?: string;
  /**
   * `danger` (default) = the value could not be resolved, which is a fail-closed
   * condition. `muted` = there is deliberately no single value here, e.g. the
   * "posts in this channel" tier, which is a constraint rather than a fault.
   */
  unresolvedTone?: 'danger' | 'muted';
  /** Marks the tier the current surface is editing. */
  current?: boolean;
  /** Marks the tier acting as the cap for the current surface. */
  cap?: boolean;
}

export interface CapChainProps {
  scheme: ValueScheme;
  /** Ordered narrowest → broadest: post, channel, system. */
  links: CapChainLink[];
  /** Adds the "this becomes the ceiling for posts" line (channel surface). */
  showChannelIsCapNote?: boolean;
  className?: string;
}

/**
 * The cap chain, read narrowest-first: post ≤ channel ≤ system.
 *
 * Each save is checked against the tier directly above it, so the chain is
 * drawn as a series of pairwise comparisons rather than one combined rule.
 */
export default function CapChain({
  scheme,
  links,
  showChannelIsCapNote = false,
  className = '',
}: CapChainProps) {
  const rootClass = [styles['cap-chain'], className].filter(Boolean).join(' ');

  return (
    <section className={rootClass} aria-label={CHAIN_TITLE}>
      <span className={styles['cap-chain__title']}>{CHAIN_TITLE}</span>
      <div className={styles['cap-chain__rail']}>
        {links.map((link, i) => (
          <div className={styles['cap-chain__group']} key={link.label}>
            {i > 0 && (
              <span className={styles['cap-chain__op']}>
                <span className={styles['cap-chain__op-glyph']} aria-hidden>
                  ≤
                </span>
                <span className={styles['cap-chain__op-sr']}>at or below</span>
              </span>
            )}
            <div
              className={[
                styles['cap-chain__link'],
                link.current ? styles['cap-chain__link--current'] : '',
                link.cap ? styles['cap-chain__link--cap'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles['cap-chain__link-label']}>
                {link.label}
                {link.cap && (
                  <LabelTag label="Cap" type="Info" size="X-Small" />
                )}
              </span>
              {link.valueId ? (
                <ValueChip
                  scheme={scheme}
                  valueId={link.valueId}
                  size="Small"
                />
              ) : (
                <span
                  className={[
                    styles['cap-chain__unresolved'],
                    link.unresolvedTone === 'muted'
                      ? styles['cap-chain__unresolved--muted']
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {link.unresolvedText ?? 'Not resolved'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <span className={styles['cap-chain__caption']}>
        {chainCaption(scheme)}
      </span>
      {showChannelIsCapNote && (
        <span className={styles['cap-chain__caption']}>
          {CHAIN_CHANNEL_IS_CAP_NOTE}
        </span>
      )}
    </section>
  );
}
