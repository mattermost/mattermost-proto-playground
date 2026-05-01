import { Link } from 'react-router-dom';
import { LIBRARY_ENTRIES } from '@/manifests/library';
import DocsIndex from '@/pages/_shell/DocsIndex';

const CATEGORIES = [
  { slug: 'foundations', label: 'Foundations' },
  { slug: 'components', label: 'Components' },
  { slug: 'patterns', label: 'Patterns' },
  { slug: 'layouts', label: 'Layouts' },
];

export default function LibraryIndex() {
  return (
    <DocsIndex
      breadcrumb="Design system"
      title="Library"
      description="Live reference for tokens, components, patterns, and layouts."
      intro={
        <p>
          See <Link to="/guidelines">Guidelines</Link> for written documentation.
        </p>
      }
      emptyMessage={
        <>
          No library entries registered yet. Add entries to{' '}
          <code>src/manifests/library.ts</code>.
        </>
      }
      categories={CATEGORIES}
      entries={LIBRARY_ENTRIES}
      pathFor={(entry) => `/library/${entry.category}/${entry.slug}`}
    />
  );
}
