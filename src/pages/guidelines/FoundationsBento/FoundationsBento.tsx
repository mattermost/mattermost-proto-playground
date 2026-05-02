import { Link } from 'react-router-dom';
import type { GuidelineEntry } from '@/manifests/guidelines';
import { Visual } from './visuals';
import styles from './FoundationsBento.module.scss';

interface FoundationsBentoProps {
  entries: GuidelineEntry[];
}

type CardSize = 'hero' | 'medium' | 'small' | 'wide';

interface BentoCardProps {
  entry: GuidelineEntry;
  size: CardSize;
}

function BentoCard({ entry, size }: BentoCardProps) {
  return (
    <Link
      to={`/guidelines/${entry.category}/${entry.slug}`}
      className={`${styles['bento-card']} ${styles[`bento-card--${size}`]}`}
    >
      {entry.visual && (
        <span className={styles['bento-card__visual']}>
          <Visual kind={entry.visual.kind} />
        </span>
      )}
      <span className={styles['bento-card__body']}>
        <span className={styles['bento-card__name']}>{entry.name}</span>
      </span>
    </Link>
  );
}

interface PlainCardProps {
  entry: GuidelineEntry;
}

function PlainCard({ entry }: PlainCardProps) {
  return (
    <Link
      to={`/guidelines/${entry.category}/${entry.slug}`}
      className={`${styles['bento-card']} ${styles['bento-card--plain']}`}
    >
      <span className={styles['bento-card__body']}>
        <span className={styles['bento-card__name']}>{entry.name}</span>
        {entry.description && (
          <span className={styles['bento-card__desc']}>{entry.description}</span>
        )}
      </span>
    </Link>
  );
}

const STYLE_HEROES = ['color', 'typography'];
const STYLE_MEDIUM = ['iconography', 'spacing', 'themes', 'shape'];
const STYLE_SMALL_WIDE = ['elevation', 'layout', 'animation'];

const GUIDELINE_SLUGS = [
  'writing-style',
  'usability-heuristics',
  'system-feedback',
  'accessibility-guidelines',
];

export default function FoundationsBento({ entries }: FoundationsBentoProps) {
  const bySlug = new Map(entries.map((e) => [e.slug, e]));
  const pick = (slugs: string[]) =>
    slugs.map((s) => bySlug.get(s)).filter((e): e is GuidelineEntry => !!e);

  const heroes = pick(STYLE_HEROES);
  const medium = pick(STYLE_MEDIUM);
  const small = pick(STYLE_SMALL_WIDE);
  const guidelineEntries = pick(GUIDELINE_SLUGS);

  // Anything else not explicitly placed (defensive — e.g. a new foundation
  // slug added before the bento layout is updated) falls to the bottom.
  const placed = new Set([
    ...STYLE_HEROES,
    ...STYLE_MEDIUM,
    ...STYLE_SMALL_WIDE,
    ...GUIDELINE_SLUGS,
  ]);
  const unplaced = entries.filter((e) => !placed.has(e.slug));

  return (
    <div className={styles['foundations-bento']}>
      {heroes.length > 0 && (
        <section className={styles['foundations-bento__section']}>
          <h2 className={styles['foundations-bento__heading']}>Style</h2>
          <div className={styles['foundations-bento__heroes']}>
            {heroes.map((e) => (
              <BentoCard key={e.slug} entry={e} size="hero" />
            ))}
          </div>
          {medium.length > 0 && (
            <div className={styles['foundations-bento__medium']}>
              {medium.map((e) => (
                <BentoCard key={e.slug} entry={e} size="medium" />
              ))}
            </div>
          )}
          {small.length > 0 && (
            <div className={styles['foundations-bento__small']}>
              {small.map((e, i) => (
                <BentoCard
                  key={e.slug}
                  entry={e}
                  size={i === small.length - 1 ? 'wide' : 'small'}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {guidelineEntries.length > 0 && (
        <section className={styles['foundations-bento__section']}>
          <h2 className={styles['foundations-bento__heading']}>Guidelines</h2>
          <div className={styles['foundations-bento__plain']}>
            {guidelineEntries.map((e) => (
              <PlainCard key={e.slug} entry={e} />
            ))}
          </div>
        </section>
      )}

      {unplaced.length > 0 && (
        <section className={styles['foundations-bento__section']}>
          <div className={styles['foundations-bento__plain']}>
            {unplaced.map((e) => (
              <PlainCard key={e.slug} entry={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
