import { lazy, Suspense, useMemo, type ComponentType } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  GUIDELINE_ENTRIES,
  type GuidelineCategory,
  type GuidelineEntry,
} from '@/manifests/guidelines';
import { guidelineSections } from '@/manifests/sections';
import DocPage from '@/pages/_shell/DocPage';
import PageHero from '@/components/layout/PageHero/PageHero';
import indexStyles from '@/pages/_shell/DocsIndex.module.scss';
import docStyles from '@/pages/_shell/DocPage.module.scss';

const VALID_CATEGORIES: GuidelineCategory[] = [
  'overview',
  'foundations',
  'components',
  'patterns',
  'layouts',
];

const CATEGORY_LABELS: Record<GuidelineCategory, string> = {
  overview: 'Overview',
  foundations: 'Foundations',
  components: 'Components',
  patterns: 'Patterns',
  layouts: 'Layouts',
};

const CATEGORY_DESCRIPTIONS: Partial<Record<GuidelineCategory, string>> = {
  foundations:
    'The base layer of style and shared rules every component, pattern, and layout is built on.',
  components:
    'Reusable building blocks that make up the core elements of the interface.',
};

const CATEGORY_INTRO: Partial<
  Record<GuidelineCategory, () => Promise<{ default: ComponentType }>>
> = {
  foundations: () => import('@/guidelines/foundations/Overview.mdx'),
  components: () => import('@/guidelines/components/Overview.mdx'),
};

interface IndexGroup {
  label: string;
  items: GuidelineEntry[];
}

function buildGroups(category: GuidelineCategory): IndexGroup[] {
  const entries = GUIDELINE_ENTRIES.filter((e) => e.category === category);
  const sections = guidelineSections[category];

  if (!sections || sections.length === 0) {
    return [{ label: '', items: entries }];
  }

  const bySlug = new Map(entries.map((e) => [e.slug, e]));
  const used = new Set<string>();
  const groups: IndexGroup[] = sections.map((s) => {
    const items = s.slugs
      .map((slug) => bySlug.get(slug))
      .filter((e): e is GuidelineEntry => e !== undefined);
    items.forEach((e) => used.add(e.slug));
    return { label: s.label, items };
  });

  const ungrouped = entries.filter((e) => !used.has(e.slug));
  if (ungrouped.length > 0) {
    groups.push({ label: 'Other', items: ungrouped });
  }
  return groups;
}

export default function GuidelineCategoryIndex() {
  const { category } = useParams();
  const validCategory =
    category && VALID_CATEGORIES.includes(category as GuidelineCategory)
      ? (category as GuidelineCategory)
      : null;

  const introImport = validCategory ? CATEGORY_INTRO[validCategory] : undefined;
  const Intro = useMemo(
    () => (introImport ? lazy(introImport) : null),
    [introImport],
  );

  if (!validCategory) {
    return (
      <DocPage hero={<PageHero breadcrumb="Guidelines" title="Not found" />}>
        <p>No guidelines category at this URL.</p>
      </DocPage>
    );
  }

  const label = CATEGORY_LABELS[validCategory];
  const description = CATEGORY_DESCRIPTIONS[validCategory];
  const groups = buildGroups(validCategory);
  const hasEntries = groups.some((g) => g.items.length > 0);

  return (
    <DocPage
      hero={
        <PageHero
          breadcrumb="Guidelines"
          title={label}
          description={description}
        />
      }
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

      {groups.map((g, idx) =>
        g.items.length === 0 ? null : (
          <section
            key={g.label || `group-${idx}`}
            className={indexStyles['docs-index__section']}
          >
            {g.label && <h2>{g.label}</h2>}
            <ul className={indexStyles['docs-index__list']}>
              {g.items.map((entry) => (
                <li key={entry.slug}>
                  <Link to={`/guidelines/${entry.category}/${entry.slug}`}>
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
    </DocPage>
  );
}
