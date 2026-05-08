import { lazy, Suspense, useMemo, type ComponentType } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  topicsByCategory,
  type Topic,
  type TopicCategory,
} from '@/manifests/topics';
import { topicSections } from '@/manifests/sections';
import PageHero from '@/components/layout/PageHero/PageHero';
import FoundationsBento, {
  type BentoEntry,
} from './FoundationsBento/FoundationsBento';
import indexStyles from '@/pages/_shell/DocsIndex.module.scss';
import docStyles from '@/pages/_shell/DocPage.module.scss';
import shellStyles from '@/pages/_shell/DocShell.module.scss';

const VALID_CATEGORIES: TopicCategory[] = [
  'foundations',
  'components',
  'patterns',
  'layouts',
];

const CATEGORY_LABELS: Record<TopicCategory, string> = {
  foundations: 'Foundations',
  components: 'Components',
  patterns: 'Patterns',
  layouts: 'Layouts',
};

const CATEGORY_DESCRIPTIONS: Partial<Record<TopicCategory, string>> = {
  foundations:
    'The base layer of style and shared rules every component, pattern, and layout is built on.',
  components:
    'Reusable building blocks that make up the core elements of the interface.',
};

const CATEGORY_INTRO: Partial<
  Record<TopicCategory, () => Promise<{ default: ComponentType }>>
> = {
  foundations: () => import('@/guidelines/foundations/_overview.mdx'),
  components: () => import('@/guidelines/components/_overview.mdx'),
};

interface IndexGroup {
  label: string;
  items: Topic[];
}

function buildGroups(category: TopicCategory): IndexGroup[] {
  const entries = topicsByCategory(category);
  const sections = topicSections[category];

  if (!sections || sections.length === 0) {
    return [{ label: '', items: entries }];
  }

  const bySlug = new Map(entries.map((e) => [e.slug, e]));
  const used = new Set<string>();
  const groups: IndexGroup[] = sections.map((s) => {
    const items = s.slugs
      .map((slug) => bySlug.get(slug))
      .filter((e): e is Topic => e !== undefined);
    items.forEach((e) => used.add(e.slug));
    return { label: s.label, items };
  });

  const ungrouped = entries.filter((e) => !used.has(e.slug));
  if (ungrouped.length > 0) {
    groups.push({ label: 'Other', items: ungrouped });
  }
  return groups;
}

const topicPath = (entry: BentoEntry) => `/${entry.category}/${entry.slug}`;

export default function CategoryRoute() {
  const { category } = useParams();
  const validCategory =
    category && VALID_CATEGORIES.includes(category as TopicCategory)
      ? (category as TopicCategory)
      : null;

  const introImport = validCategory ? CATEGORY_INTRO[validCategory] : undefined;
  const Intro = useMemo(
    () => (introImport ? lazy(introImport) : null),
    [introImport],
  );

  if (!validCategory) {
    return (
      <div className={shellStyles['doc-shell']}>
        <div className={shellStyles['doc-shell__top']}>
          <PageHero breadcrumb="Docs" title="Not found" />
        </div>
        <div
          className={`${shellStyles['doc-shell__body']} ${shellStyles['doc-shell__body--standalone']}`}
        >
          <div className={docStyles['doc-page__prose']}>
            <p>No category at this URL.</p>
          </div>
        </div>
      </div>
    );
  }

  const label = CATEGORY_LABELS[validCategory];
  const description = CATEGORY_DESCRIPTIONS[validCategory];
  const groups = buildGroups(validCategory);
  const hasEntries = groups.some((g) => g.items.length > 0);
  const useBento = validCategory === 'foundations' && hasEntries;
  const allEntries = topicsByCategory(validCategory);

  return (
    <div className={shellStyles['doc-shell']}>
      <div className={shellStyles['doc-shell__top']}>
        <PageHero
          breadcrumb="Design system"
          title={label}
          description={description}
        />
      </div>
      <div
        className={`${shellStyles['doc-shell__body']} ${shellStyles['doc-shell__body--standalone']}`}
      >
        {Intro && (
          <div className={docStyles['doc-page__prose']}>
            <Suspense fallback={null}>
              <Intro />
            </Suspense>
          </div>
        )}

        {!hasEntries && (
          <p className={indexStyles['docs-index__empty']}>
            No entries registered for this category yet.
          </p>
        )}

        {useBento && (
          <FoundationsBento entries={allEntries} pathFor={topicPath} />
        )}

        {!useBento &&
          groups.map((g, idx) =>
            g.items.length === 0 ? null : (
              <section
                key={g.label || `group-${idx}`}
                className={indexStyles['docs-index__section']}
              >
                {g.label && <h2>{g.label}</h2>}
                <ul className={indexStyles['docs-index__list']}>
                  {g.items.map((entry) => (
                    <li key={entry.slug}>
                      <Link to={`/${entry.category}/${entry.slug}`}>
                        {entry.name}
                      </Link>
                      {entry.description && (
                        <span className={indexStyles['docs-index__desc']}>
                          {entry.description}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ),
          )}
      </div>
    </div>
  );
}
