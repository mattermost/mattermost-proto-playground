/**
 * DPC Comparison index — standalone landing page for the four approaches.
 *
 * Stage 1 builds this as a four-card index referencing the per-approach
 * Phase 4 score, hard-constraint flag, and differentiator preservation
 * count (pulled from `APPROACH_SUMMARIES` in shared fixtures). Stage 3
 * finalizes any side-by-side screenshot slots.
 *
 * Routed at `/prototypes/dpc/comparison` per intake Q3.
 */
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button/Button';
import { APPROACH_SUMMARIES, type ApproachSummary } from '@/pages/dpc/shared';
import styles from './Comparison.module.scss';

function formatScore(score: number): string {
  return score.toFixed(2);
}

function ApproachCard({ approach }: { approach: ApproachSummary }) {
  const hasFail = approach.hardConstraintFail != null;

  return (
    <article className={styles['dpc-comparison__card']}>
      <header className={styles['dpc-comparison__card-header']}>
        <span className={styles['dpc-comparison__card-eyebrow']}>
          Approach {approach.id.toUpperCase()}
        </span>
        <h2 className={styles['dpc-comparison__card-title']}>
          {approach.fullLabel}
        </h2>
      </header>

      <div className={styles['dpc-comparison__screenshot-slot']}>
        <span className={styles['dpc-comparison__screenshot-placeholder']}>
          Screenshot — Stage 3 fills this in
        </span>
      </div>

      <p className={styles['dpc-comparison__mechanism']}>
        {approach.mechanism}
      </p>

      <dl className={styles['dpc-comparison__meta']}>
        <div className={styles['dpc-comparison__meta-row']}>
          <dt className={styles['dpc-comparison__meta-label']}>
            Phase 4 weighted score
          </dt>
          <dd className={styles['dpc-comparison__meta-value']}>
            {formatScore(approach.weightedScore)}
          </dd>
        </div>
        <div className={styles['dpc-comparison__meta-row']}>
          <dt className={styles['dpc-comparison__meta-label']}>
            Hard-constraint flag
          </dt>
          <dd
            className={`${styles['dpc-comparison__meta-value']} ${
              hasFail
                ? styles['dpc-comparison__meta-value--fail']
                : styles['dpc-comparison__meta-value--pass']
            }`}
          >
            {hasFail ? approach.hardConstraintFail : 'None — passes all'}
          </dd>
        </div>
        <div className={styles['dpc-comparison__meta-row']}>
          <dt className={styles['dpc-comparison__meta-label']}>
            Differentiators preserved
          </dt>
          <dd className={styles['dpc-comparison__meta-value']}>
            {approach.differentiatorsPreserved} of 6
          </dd>
        </div>
      </dl>

      <footer className={styles['dpc-comparison__card-footer']}>
        <Link
          to={approach.prototypeRoute}
          className={styles['dpc-comparison__cta-link']}
        >
          <Button emphasis="Secondary" size="Medium">
            Open prototype
          </Button>
        </Link>
      </footer>
    </article>
  );
}

export default function Comparison() {
  return (
    <div className={styles['dpc-comparison']}>
      <header className={styles['dpc-comparison__hero']}>
        <span className={styles['dpc-comparison__eyebrow']}>
          Discoverable Private Channels — Phase 6 Prototypes
        </span>
        <h1 className={styles['dpc-comparison__title']}>
          Compare the four approaches
        </h1>
        <p className={styles['dpc-comparison__lede']}>
          Each card opens an interactive prototype seeded with the same
          channels, personas, and ABAC policy presets so the mechanism
          differences are directly comparable. A1 was the Phase 4
          recommendation; A2 and A4 are specified so the Phase 4 scoring
          is reproducible at prototype fidelity.
        </p>
      </header>

      <section className={styles['dpc-comparison__grid']}>
        {APPROACH_SUMMARIES.map((approach) => (
          <ApproachCard key={approach.id} approach={approach} />
        ))}
      </section>
    </div>
  );
}
