// [AI DRAFT] Direction B: a live plain-language restatement of the rule.
import TextShortIcon from '@mattermost/compass-icons/components/text-short';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { summarize, type DmPolicy } from '../policyModel';
import { SUMMARY } from '../copy';
import styles from './SummaryStrip.module.scss';

export interface SummaryStripProps {
  policy: DmPolicy;
  /** Starting rule name, shown until the first edit. */
  startedFrom?: string;
  edited: boolean;
}

const DIRECTION_TAG = {
  both: { label: SUMMARY.tagBothWays, type: 'default' },
  'one-way': { label: SUMMARY.tagOneWay, type: 'warning' },
  acting: { label: SUMMARY.tagActingOnly, type: 'default' },
  none: null,
} as const;

export default function SummaryStrip({
  policy,
  startedFrom,
  edited,
}: SummaryStripProps) {
  const { sentence, direction } = summarize(policy);
  const tag = DIRECTION_TAG[direction];
  return (
    <section className={styles['summary-strip']} aria-label={SUMMARY.label}>
      <span className={styles['summary-strip__icon']}>
        <Icon glyph={<TextShortIcon />} size="20" />
      </span>
      <div className={styles['summary-strip__body']}>
        <div className={styles['summary-strip__meta']}>
          <span className={styles['summary-strip__label']}>
            {SUMMARY.label}
          </span>
          {tag ? <Tag label={tag.label} type={tag.type} size="small" /> : null}
          {edited ? (
            <Tag label={SUMMARY.edited} size="small" />
          ) : startedFrom ? (
            <Tag label={SUMMARY.startedFrom(startedFrom)} size="small" />
          ) : null}
        </div>
        {/* Announced on change so screen-reader users hear the regenerated sentence. */}
        <p className={styles['summary-strip__sentence']} aria-live="polite">
          {sentence}
        </p>
      </div>
    </section>
  );
}
