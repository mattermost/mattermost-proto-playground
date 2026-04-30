import { Link } from 'react-router-dom';
import {
  GUIDELINE_ENTRIES,
  type GuidelineCategory,
  type GuidelineEntry,
} from '@/manifests/guidelines';
import DocPage from '@/pages/_shell/DocPage';
import styles from './GuidelinesIndex.module.scss';

const SECTION_ORDER: GuidelineCategory[] = [
  'top-level',
  'foundations',
  'components',
  'patterns',
  'layouts',
];

const SECTION_LABELS: Record<GuidelineCategory, string> = {
  'top-level': 'Overview',
  foundations: 'Foundations',
  components: 'Components',
  patterns: 'Patterns',
  layouts: 'Layouts',
};

function pathFor(entry: GuidelineEntry): string {
  return entry.category === 'top-level'
    ? `/guidelines/${entry.slug}`
    : `/guidelines/${entry.category}/${entry.slug}`;
}

export default function GuidelinesIndex() {
  const grouped = SECTION_ORDER.map((category) => ({
    category,
    entries: GUIDELINE_ENTRIES.filter((e) => e.category === category),
  })).filter((g) => g.entries.length > 0);

  return (
    <DocPage
      eyebrow="Design system"
      title="Guidelines"
    >
      <p>
        Written documentation for the Mattermost design system. Prose lives
        here; live implementation references live in the{' '}
        <Link to="/library">Library</Link>.
      </p>

      {grouped.length === 0 && (
        <p className={styles['guidelines-index__empty']}>
          No guidelines registered yet. Add entries to{' '}
          <code>src/manifests/guidelines.ts</code>.
        </p>
      )}

      {grouped.map(({ category, entries }) => (
        <section key={category} className={styles['guidelines-index__section']}>
          <h2>{SECTION_LABELS[category]}</h2>
          <ul className={styles['guidelines-index__list']}>
            {entries.map((entry) => (
              <li key={entry.slug}>
                <Link to={pathFor(entry)}>{entry.name}</Link>
                {entry.description && (
                  <span className={styles['guidelines-index__desc']}>
                    {entry.description}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </DocPage>
  );
}
