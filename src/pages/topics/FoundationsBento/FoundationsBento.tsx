import { Link } from 'react-router-dom';
import type { TopicVisual } from '@/manifests/topics';
import { Visual } from './visuals';
import styles from './FoundationsBento.module.scss';

/**
 * Structural shape the bento needs from each entry. Matches `Topic`
 * with `category` widened to `string` so consumers don't have to narrow
 * the category union before passing entries in.
 */
export interface BentoEntry {
  slug: string;
  name: string;
  category: string;
  description?: string;
  visual?: TopicVisual;
}

interface FoundationsBentoProps {
  entries: readonly BentoEntry[];
  /**
   * Build the destination URL for an entry. Defaults to the flat
   * `/<category>/<slug>` shape; pass a custom resolver to land on a
   * different tab or surface.
   */
  pathFor?: (entry: BentoEntry) => string;
}

const defaultPathFor = (entry: BentoEntry) =>
  `/${entry.category}/${entry.slug}`;

type CardSize = 'hero' | 'medium' | 'small' | 'wide';

interface BentoCardProps {
  entry: BentoEntry;
  size: CardSize;
  to: string;
}

function BentoCard({ entry, size, to }: BentoCardProps) {
  return (
    <Link
      to={to}
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
  entry: BentoEntry;
  to: string;
}

function PlainCard({ entry, to }: PlainCardProps) {
  return (
    <Link
      to={to}
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

export default function FoundationsBento({
  entries,
  pathFor = defaultPathFor,
}: FoundationsBentoProps) {
  const bySlug = new Map(entries.map((e) => [e.slug, e]));
  const pick = (slugs: string[]) =>
    slugs.map((s) => bySlug.get(s)).filter((e): e is BentoEntry => !!e);

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
              <BentoCard key={e.slug} entry={e} size="hero" to={pathFor(e)} />
            ))}
          </div>
          {medium.length > 0 && (
            <div className={styles['foundations-bento__medium']}>
              {medium.map((e) => (
                <BentoCard key={e.slug} entry={e} size="medium" to={pathFor(e)} />
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
                  to={pathFor(e)}
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
              <PlainCard key={e.slug} entry={e} to={pathFor(e)} />
            ))}
          </div>
        </section>
      )}

      {unplaced.length > 0 && (
        <section className={styles['foundations-bento__section']}>
          <div className={styles['foundations-bento__plain']}>
            {unplaced.map((e) => (
              <PlainCard key={e.slug} entry={e} to={pathFor(e)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
