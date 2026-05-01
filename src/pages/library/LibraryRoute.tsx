import { lazy, Suspense, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  findLibraryEntry,
  type LibraryCategory,
  type LibraryEntry,
} from '@/manifests/library';
import DocPage from '@/pages/_shell/DocPage';

const VALID_CATEGORIES: LibraryCategory[] = [
  'foundations',
  'components',
  'patterns',
  'layouts',
];

function resolveEntry(
  rawCategory: string | undefined,
  rawSlug: string | undefined,
): LibraryEntry | undefined {
  if (!rawCategory || !rawSlug) return undefined;
  if (!VALID_CATEGORIES.includes(rawCategory as LibraryCategory)) return undefined;
  return findLibraryEntry(rawCategory as LibraryCategory, rawSlug);
}

function eyebrowFor(entry: LibraryEntry): string {
  return `Library · ${entry.category[0].toUpperCase()}${entry.category.slice(1)}`;
}

export default function LibraryRoute() {
  const { category, slug } = useParams();
  const entry = useMemo(() => resolveEntry(category, slug), [category, slug]);
  const Page = useMemo(() => (entry ? lazy(entry.page) : null), [entry]);

  if (!entry || !Page) {
    return (
      <DocPage eyebrow="Library" title="Not found">
        <p>
          No library entry registered for this URL. Check{' '}
          <code>src/manifests/library.ts</code>.
        </p>
      </DocPage>
    );
  }

  if (entry.fullBleed) {
    return (
      <Suspense fallback={<p>Loading…</p>}>
        <Page />
      </Suspense>
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
