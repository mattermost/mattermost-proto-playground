import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import {
  LIBRARY_ENTRIES,
  type LibraryCategory,
  type LibraryEntry,
} from '@/manifests/library';
import {
  GUIDELINE_ENTRIES,
  type GuidelineCategory,
  type GuidelineEntry,
} from '@/manifests/guidelines';
import {
  librarySections,
  guidelineSections,
  type SectionGroup,
} from '@/manifests/sections';
import DocSidebar, {
  type SidebarGroup,
} from '@/components/layout/DocSidebar/DocSidebar';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import styles from './DocsLayout.module.scss';

function parentPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return '/';
  return '/' + segments[0];
}

const LIBRARY_CATEGORIES: { slug: LibraryCategory; name: string }[] = [
  { slug: 'foundations', name: 'Foundations' },
  { slug: 'components', name: 'Components' },
  { slug: 'patterns', name: 'Patterns' },
  { slug: 'layouts', name: 'Layouts' },
];

const GUIDELINE_CATEGORIES: { slug: GuidelineCategory; name: string }[] = [
  { slug: 'overview', name: 'Overview' },
  { slug: 'foundations', name: 'Foundations' },
  { slug: 'components', name: 'Components' },
  { slug: 'patterns', name: 'Patterns' },
  { slug: 'layouts', name: 'Layouts' },
];

const VALID_LIBRARY = new Set<string>(LIBRARY_CATEGORIES.map((c) => c.slug));
const VALID_GUIDELINE = new Set<string>(GUIDELINE_CATEGORIES.map((c) => c.slug));

/**
 * Build the "category overview" sidebar shown on docs index pages.
 * Each item links to the first entry in that category, since we don't (yet)
 * have a per-category landing page.
 */
function categoryOverviewGroups(
  pathPrefix: string,
  categories: { slug: string; name: string }[],
  entries: readonly { slug: string; category: string }[],
): SidebarGroup[] {
  const items = categories
    .map(({ slug: catSlug, name }) => {
      const first = entries.find((e) => e.category === catSlug);
      if (!first) return null;
      return {
        key: catSlug,
        name,
        to: `${pathPrefix}/${catSlug}/${first.slug}`,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return [{ label: '', items }];
}

/**
 * Build the in-category sidebar — section-grouped if sections defined,
 * flat otherwise.
 */
function entriesGroupsFor(
  pathPrefix: string,
  category: string,
  entries: readonly { slug: string; name: string; category: string }[],
  sections: SectionGroup[] | undefined,
): SidebarGroup[] {
  const inCategory = entries.filter((e) => e.category === category);
  const bySlug = new Map(inCategory.map((e) => [e.slug, e]));

  if (sections && sections.length > 0) {
    const used = new Set<string>();
    const groups: SidebarGroup[] = sections.map((s) => {
      const items = s.slugs
        .map((slug) => bySlug.get(slug))
        .filter((e): e is NonNullable<typeof e> => e !== undefined)
        .map((e) => ({
          key: e.slug,
          name: e.name,
          to: `${pathPrefix}/${category}/${e.slug}`,
        }));
      items.forEach((i) => used.add(i.key));
      return { label: s.label, items };
    });

    const ungrouped = inCategory.filter((e) => !used.has(e.slug));
    if (ungrouped.length > 0) {
      groups.push({
        label: 'Other',
        items: ungrouped.map((e) => ({
          key: e.slug,
          name: e.name,
          to: `${pathPrefix}/${category}/${e.slug}`,
        })),
      });
    }
    return groups;
  }

  return [
    {
      label: '',
      items: inCategory.map((e) => ({
        key: e.slug,
        name: e.name,
        to: `${pathPrefix}/${category}/${e.slug}`,
      })),
    },
  ];
}

function buildGroupsForLibrary(pathname: string): SidebarGroup[] {
  const segments = pathname.split('/').filter(Boolean);
  const categoryFromUrl = segments[1];

  if (!categoryFromUrl || !VALID_LIBRARY.has(categoryFromUrl)) {
    return categoryOverviewGroups(
      '/library',
      LIBRARY_CATEGORIES,
      LIBRARY_ENTRIES as readonly LibraryEntry[],
    );
  }

  const category = categoryFromUrl as LibraryCategory;
  return entriesGroupsFor(
    '/library',
    category,
    LIBRARY_ENTRIES as readonly LibraryEntry[],
    librarySections[category],
  );
}

function buildGroupsForGuidelines(pathname: string): SidebarGroup[] {
  const segments = pathname.split('/').filter(Boolean);
  const categoryFromUrl = segments[1];

  if (!categoryFromUrl || !VALID_GUIDELINE.has(categoryFromUrl)) {
    return categoryOverviewGroups(
      '/guidelines',
      GUIDELINE_CATEGORIES,
      GUIDELINE_ENTRIES as readonly GuidelineEntry[],
    );
  }

  const category = categoryFromUrl as GuidelineCategory;
  return entriesGroupsFor(
    '/guidelines',
    category,
    GUIDELINE_ENTRIES as readonly GuidelineEntry[],
    guidelineSections[category],
  );
}

export default function DocsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const segments = location.pathname.split('/').filter(Boolean);
  const source = segments[0];

  let groups: SidebarGroup[];
  if (source === 'library') {
    groups = buildGroupsForLibrary(location.pathname);
  } else if (source === 'guidelines') {
    groups = buildGroupsForGuidelines(location.pathname);
  } else {
    return <Outlet />;
  }

  const header = (
    <IconButton
      aria-label="Back"
      icon={<Icon glyph={<ArrowLeftIcon />} size="20" />}
      onClick={() => navigate(parentPath(location.pathname))}
    />
  );

  return (
    <div className={styles['docs-layout']}>
      <DocSidebar groups={groups} header={header} />
      <div className={styles['docs-layout__content']}>
        <Outlet />
      </div>
    </div>
  );
}
