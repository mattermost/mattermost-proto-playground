import { lazy, Suspense, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  GUIDELINE_ENTRIES,
  type GuidelineCategory,
  type GuidelineEntry,
} from '@/manifests/guidelines';
import DocPage from '@/pages/_shell/DocPage';

const VALID_CATEGORIES: GuidelineCategory[] = [
  'foundations',
  'components',
  'patterns',
  'layouts',
];

function resolveEntry(
  rawCategory: string | undefined,
  rawSlug: string | undefined,
): GuidelineEntry | undefined {
  if (!rawSlug) return undefined;

  if (rawCategory === undefined) {
    return GUIDELINE_ENTRIES.find(
      (e) => e.category === 'top-level' && e.slug === rawSlug,
    );
  }

  if (!VALID_CATEGORIES.includes(rawCategory as GuidelineCategory)) {
    return undefined;
  }

  return GUIDELINE_ENTRIES.find(
    (e) => e.category === rawCategory && e.slug === rawSlug,
  );
}

function eyebrowFor(entry: GuidelineEntry): string {
  if (entry.category === 'top-level') return 'Guidelines';
  return `Guidelines · ${entry.category[0].toUpperCase()}${entry.category.slice(1)}`;
}

export default function GuidelineRoute() {
  const { category, slug } = useParams();
  const entry = useMemo(() => resolveEntry(category, slug), [category, slug]);
  const Page = useMemo(() => (entry ? lazy(entry.page) : null), [entry]);

  if (!entry || !Page) {
    return (
      <DocPage eyebrow="Guidelines" title="Not found">
        <p>
          No guideline registered for this URL. Check{' '}
          <code>src/manifests/guidelines.ts</code>.
        </p>
      </DocPage>
    );
  }

  return (
    <DocPage eyebrow={eyebrowFor(entry)} title={entry.name}>
      <Suspense fallback={<p>Loading…</p>}>
        <Page />
      </Suspense>
    </DocPage>
  );
}
