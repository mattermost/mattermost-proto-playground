import { Link } from 'react-router-dom';
import { GUIDELINE_ENTRIES } from '@/manifests/guidelines';
import DocsIndex from '@/pages/_shell/DocsIndex';

const CATEGORIES = [
  { slug: 'overview', label: 'Overview' },
  { slug: 'foundations', label: 'Foundations' },
  { slug: 'components', label: 'Components' },
  { slug: 'patterns', label: 'Patterns' },
  { slug: 'layouts', label: 'Layouts' },
];

export default function GuidelinesIndex() {
  return (
    <DocsIndex
      breadcrumb="Design system"
      title="Guidelines"
      description="Written documentation for the Mattermost design system."
      intro={
        <p>
          See <Link to="/library">Library</Link> for live implementation
          references.
        </p>
      }
      emptyMessage={
        <>
          No guidelines registered yet. Add entries to{' '}
          <code>src/manifests/guidelines.ts</code>.
        </>
      }
      categories={CATEGORIES}
      entries={GUIDELINE_ENTRIES}
      pathFor={(entry) => `/guidelines/${entry.category}/${entry.slug}`}
    />
  );
}
