import { Link } from 'react-router-dom';
import {
  LIBRARY_ENTRIES,
  type LibraryCategory,
  type LibraryEntry,
} from '@/manifests/library';
import DocPage from '@/pages/_shell/DocPage';
import styles from './LibraryIndex.module.scss';

const SECTION_ORDER: LibraryCategory[] = [
  'foundations',
  'components',
  'patterns',
  'layouts',
];

const SECTION_LABELS: Record<LibraryCategory, string> = {
  foundations: 'Foundations',
  components: 'Components',
  patterns: 'Patterns',
  layouts: 'Layouts',
};

function pathFor(entry: LibraryEntry): string {
  return `/library/${entry.category}/${entry.slug}`;
}

export default function LibraryIndex() {
  const grouped = SECTION_ORDER.map((category) => ({
    category,
    entries: LIBRARY_ENTRIES.filter((e) => e.category === category),
  }));

  return (
    <DocPage eyebrow="Design system" title="Library">
      <p>
        Live reference for tokens, components, patterns, and layouts. Prose
        guidance lives in <Link to="/guidelines">Guidelines</Link>.
      </p>

      {LIBRARY_ENTRIES.length === 0 && (
        <p className={styles['library-index__empty']}>
          No library entries registered yet. Add entries to{' '}
          <code>src/manifests/library.ts</code>.
        </p>
      )}

      {grouped
        .filter((g) => g.entries.length > 0)
        .map(({ category, entries }) => (
          <section key={category} className={styles['library-index__section']}>
            <h2>{SECTION_LABELS[category]}</h2>
            <ul className={styles['library-index__list']}>
              {entries.map((entry) => (
                <li key={entry.slug}>
                  <Link to={pathFor(entry)}>{entry.name}</Link>
                  {entry.description && (
                    <span className={styles['library-index__desc']}>
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
