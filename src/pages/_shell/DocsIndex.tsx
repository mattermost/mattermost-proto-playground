import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import DocPage from '@/pages/_shell/DocPage';
import PageHero from '@/components/layout/PageHero/PageHero';
import styles from './DocsIndex.module.scss';

export interface DocsIndexCategory {
  slug: string;
  label: string;
}

export interface DocsIndexEntry {
  slug: string;
  name: string;
  category: string;
  description?: string;
}

interface DocsIndexProps {
  breadcrumb: string;
  title: string;
  description?: string;
  intro?: ReactNode;
  emptyMessage?: ReactNode;
  categories: DocsIndexCategory[];
  entries: readonly DocsIndexEntry[];
  pathFor: (entry: DocsIndexEntry) => string;
}

export default function DocsIndex({
  breadcrumb,
  title,
  description,
  intro,
  emptyMessage,
  categories,
  entries,
  pathFor,
}: DocsIndexProps) {
  const grouped = categories
    .map((c) => ({
      category: c,
      entries: entries.filter((e) => e.category === c.slug),
    }))
    .filter((g) => g.entries.length > 0);

  return (
    <DocPage
      hero={
        <PageHero
          breadcrumb={breadcrumb}
          title={title}
          description={description}
        />
      }
    >
      {intro}

      {entries.length === 0 && emptyMessage && (
        <p className={styles['docs-index__empty']}>{emptyMessage}</p>
      )}

      {grouped.map(({ category, entries: items }) => (
        <section
          key={category.slug}
          className={styles['docs-index__section']}
        >
          <h2>{category.label}</h2>
          <ul className={styles['docs-index__list']}>
            {items.map((entry) => (
              <li key={entry.slug}>
                <Link to={pathFor(entry)}>{entry.name}</Link>
                {entry.description && (
                  <span className={styles['docs-index__desc']}>
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
