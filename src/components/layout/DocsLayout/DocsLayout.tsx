import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import { TOPICS, type TopicCategory, type Topic } from '@/manifests/topics';
import { topicSections, type SectionGroup } from '@/manifests/sections';
import DocSidebar, {
  type SidebarGroup,
} from '@/components/layout/DocSidebar/DocSidebar';
import { IconButton } from '@mattermost/compass-ui';
import { Icon } from '@mattermost/compass-ui';
import styles from './DocsLayout.module.scss';

const TOPIC_CATEGORIES: { slug: TopicCategory; name: string }[] = [
  { slug: 'foundations', name: 'Foundations' },
  { slug: 'components', name: 'Components' },
  { slug: 'patterns', name: 'Patterns' },
  { slug: 'layouts', name: 'Layouts' },
];

const VALID_TOPIC = new Set<string>(TOPIC_CATEGORIES.map((c) => c.slug));

/**
 * Build the in-category sidebar — section-grouped if sections defined,
 * flat otherwise. Returned items link to `/<category>/<slug>` (the
 * Guidelines tab — switching to Specimen happens within TopicRoute).
 */
function entriesGroupsFor(
  category: TopicCategory,
  topics: readonly Topic[],
  sections: SectionGroup[] | undefined,
): SidebarGroup[] {
  const inCategory = topics.filter((t) => t.category === category);
  const bySlug = new Map(inCategory.map((t) => [t.slug, t]));

  if (sections && sections.length > 0) {
    const used = new Set<string>();
    const groups: SidebarGroup[] = sections.map((s) => {
      const items = s.slugs
        .map((slug) => bySlug.get(slug))
        .filter((t): t is Topic => t !== undefined)
        .map((t) => ({
          key: t.slug,
          name: t.name,
          to: `/${category}/${t.slug}`,
        }));
      items.forEach((i) => used.add(i.key));
      return { label: s.label, items };
    });

    const ungrouped = inCategory.filter((t) => !used.has(t.slug));
    if (ungrouped.length > 0) {
      groups.push({
        label: 'Other',
        items: ungrouped.map((t) => ({
          key: t.slug,
          name: t.name,
          to: `/${category}/${t.slug}`,
        })),
      });
    }
    return groups;
  }

  return [
    {
      label: '',
      items: inCategory.map((t) => ({
        key: t.slug,
        name: t.name,
        to: `/${category}/${t.slug}`,
      })),
    },
  ];
}

export default function DocsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const segments = location.pathname.split('/').filter(Boolean);
  const source = segments[0];

  if (!VALID_TOPIC.has(source)) return <Outlet />;

  const groups = entriesGroupsFor(
    source as TopicCategory,
    TOPICS,
    topicSections[source as TopicCategory],
  );

  const header = (
    <IconButton
      aria-label="Home"
      icon={<Icon glyph={<ArrowLeftIcon />} size="20" />}
      onClick={() => navigate('/')}
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
