/**
 * Generated policy-sentence banner (spec Q4 = generated-only, read-only).
 *
 * Renders "Members of {channels} must satisfy {requirements}." with the two
 * axes tinted distinctly — the channels fragment in the channel-axis color, the
 * requirements fragment in the member-axis color — so the reader sees the two
 * independent uses fused into one legible sentence without any meta-annotation.
 *
 * Used by O4 (split card, horizontal recap across the top) and O6 (tabbed
 * revamp, persistent header banner).
 */

import { MemberGlyph, ChannelGlyph } from './DisambiguationParts';
import type { PolicySentence } from './policySentence';
import styles from './PolicySentenceBanner.module.scss';

export default function PolicySentenceBanner({
  sentence,
  variant = 'card',
}: {
  sentence: PolicySentence;
  /** `card` = boxed recap (O4). `header` = flush header banner (O6). */
  variant?: 'card' | 'header';
}) {
  const rootClass = [
    styles['sentence'],
    variant === 'header' ? styles['sentence--header'] : styles['sentence--card'],
  ].join(' ');

  if (sentence.empty) {
    return (
      <div className={rootClass}>
        <p className={styles['sentence__text']}>
          <span className={styles['sentence__placeholder']}>
            New policy — add membership requirements and choose where it applies.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className={rootClass}>
      <p className={styles['sentence__text']}>
        Members of{' '}
        <span className={styles['sentence__channels']}>
          <ChannelGlyph size="12" />
          {sentence.channelsClause}
        </span>{' '}
        must satisfy{' '}
        <span className={styles['sentence__members']}>
          <MemberGlyph size="12" />
          {`${sentence.requirementsClause}.`}
        </span>
      </p>
    </div>
  );
}
