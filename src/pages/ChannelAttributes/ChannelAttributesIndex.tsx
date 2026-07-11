import { Link } from 'react-router-dom';
import styles from './index.module.scss';

interface OptionCard {
  to: string;
  title: string;
  philosophy: string;
  recommended?: boolean;
  meta: string;
}

const OPTIONS: OptionCard[] = [
  {
    to: '/prototypes/channel-attributes/primary',
    title: 'Primary — mockup-faithful (Bundle-R)',
    philosophy:
      'The settled direction across all four surfaces (create modal, info sidebar, header pills, banner) on desktop and mobile: A2 fixed-priority header overflow, B1 single-line CAPCO banner, quiet advisory tooltip. Server-pre-filtered payloads drive every masking decision.',
    recommended: true,
    meta: 'Desktop + mobile · all primary states',
  },
  {
    to: '/prototypes/channel-attributes/variant-a',
    title: 'Variant A — header overflow density',
    philosophy:
      'A2 (recommended: fixed-priority truncation + masking-aware +N popover) shown beside A3 (classification-only in the header, everything else in the sidebar). Makes the density-vs-at-a-glance tradeoff visible.',
    meta: 'Desktop comparison',
  },
  {
    to: '/prototypes/channel-attributes/variant-b',
    title: 'Variant B — banner composition (V7)',
    philosophy:
      'B1 (generic “additional handling restrictions apply” indicator, no count/value) beside B3 (full omission) for the uncleared viewer. The decision axis for the pending security-officer review; Program values are fully omitted in both.',
    meta: 'Desktop + mobile · security-officer review',
  },
  {
    to: '/prototypes/channel-attributes/propagation',
    title: 'Propagation surfaces (switcher + shared infra)',
    philosophy:
      'Where classification markings echo across the product. Surface #1 is the “Find channels” quick switcher — compact pill after each channel name, no-trace server-side masking modeled in a shared multi-channel dataset the other ~13 surfaces reuse. Masked and unmarked channels render identically (no pill); DMs never carry one.',
    meta: 'Surface 1 of ~14 · scene harness',
  },
];

export default function ChannelAttributesIndex() {
  return (
    <div className={styles.index}>
      <div className={styles.index__inner}>
        <h1 className={styles.index__title}>Channel Attributes &amp; Smart Labeling</h1>
        <p className={styles.index__sub}>
          Smart Markings Themes 1 &amp; 2 — attribute identity on channels with need-to-know
          masking. One primary direction plus two focused comparison variants.
        </p>
        <div className={styles.index__cards}>
          {OPTIONS.map((o) => (
            <Link key={o.to} to={o.to} className={styles.card}>
              <div className={styles.card__head}>
                <span className={styles.card__title}>{o.title}</span>
                {o.recommended && <span className={styles.card__badge}>Recommended</span>}
              </div>
              <p className={styles.card__philosophy}>{o.philosophy}</p>
              <span className={styles.card__meta}>{o.meta}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
