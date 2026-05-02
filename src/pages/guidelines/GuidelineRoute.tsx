import { lazy, Suspense, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  GUIDELINE_ENTRIES,
  type GuidelineCategory,
  type GuidelineEntry,
} from '@/manifests/guidelines';
import DocPage from '@/pages/_shell/DocPage';
import PageHero from '@/components/layout/PageHero/PageHero';

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

function resolveEntry(
  rawCategory: string | undefined,
  rawSlug: string | undefined,
): GuidelineEntry | undefined {
  if (!rawSlug || !rawCategory) return undefined;
  if (!VALID_CATEGORIES.includes(rawCategory as GuidelineCategory)) {
    return undefined;
  }
  return GUIDELINE_ENTRIES.find(
    (e) => e.category === rawCategory && e.slug === rawSlug,
  );
}

function breadcrumbFor(entry: GuidelineEntry): string {
  return `Guidelines / ${CATEGORY_LABELS[entry.category]}`;
}

export default function GuidelineRoute() {
  const { category, slug } = useParams();
  const entry = useMemo(() => resolveEntry(category, slug), [category, slug]);
  const Page = useMemo(() => (entry ? lazy(entry.page) : null), [entry]);

  if (!entry || !Page) {
    return (
      <DocPage
        prose
        hero={<PageHero breadcrumb="Guidelines" title="Not found" />}
      >
        <p>
          No guideline registered for this URL. Check{' '}
          <code>src/manifests/guidelines.ts</code>.
        </p>
      </DocPage>
    );
  }

  return (
    <DocPage
      toc
      prose
      hero={
        <PageHero
          breadcrumb={breadcrumbFor(entry)}
          title={entry.name}
          description={entry.description}
        />
      }
    >
      <Suspense fallback={<p>Loading…</p>}>
        <Page />
      </Suspense>
    </DocPage>
  );
}
