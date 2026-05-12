import { TOPICS, type Topic, type TopicCategory } from '@/manifests/topics';
import { PROTOTYPES } from '@/router/prototypes';

export interface QuickSwitcherDestination {
  id: string;
  path: string;
  title: string;
  subtitle: string;
  /** Lowercase string used for matching */
  searchText: string;
  /** Smaller sort key surfaces first when the search box is empty */
  sortKey: number;
}

const CATEGORY_LABEL: Record<TopicCategory, string> = {
  foundations: 'Foundations',
  components: 'Components',
  patterns: 'Patterns',
  layouts: 'Layouts',
};

const CATEGORY_ORDER: TopicCategory[] = [
  'foundations',
  'components',
  'patterns',
  'layouts',
];

function topicSortOrder(category: TopicCategory) {
  return CATEGORY_ORDER.indexOf(category);
}

function topicToDestination(t: Topic): QuickSwitcherDestination {
  const subtitle = CATEGORY_LABEL[t.category];
  const path = `/${t.category}/${t.slug}`;
  const searchText = [
    t.name,
    t.slug,
    subtitle,
    t.description ?? '',
    path,
  ]
    .join(' ')
    .toLowerCase();

  return {
    id: `topic:${t.category}:${t.slug}`,
    path,
    title: t.name,
    subtitle,
    searchText,
    sortKey: 300 + topicSortOrder(t.category),
 };
}

export function buildQuickSwitcherDestinations(): QuickSwitcherDestination[] {
  const out: QuickSwitcherDestination[] = [
    {
      id: 'home',
      path: '/',
      title: 'Compass home',
      subtitle: 'Home',
      searchText: 'compass home /'.toLowerCase(),
      sortKey: 0,
    },
    ...(
      [
        ['foundations', '/foundations'],
        ['components', '/components'],
        ['patterns', '/patterns'],
        ['layouts', '/layouts'],
      ] as const
    ).map(([slug, path]) => ({
      id: `category:${slug}`,
      path,
      title: `${CATEGORY_LABEL[slug]} — category`,
      subtitle: 'Category',
      searchText: `${CATEGORY_LABEL[slug]} category ${path}`.toLowerCase(),
      sortKey: 10,
    })),
    {
      id: 'prototypes',
      path: '/prototypes',
      title: 'Prototypes',
      subtitle: 'Index',
      searchText: 'prototypes index /prototypes'.toLowerCase(),
      sortKey: 20,
    },
    {
      id: 'resources',
      path: '/resources',
      title: 'Resources',
      subtitle: 'Index',
      searchText: 'resources index /resources'.toLowerCase(),
      sortKey: 20,
    },
    ...PROTOTYPES.map((p) => ({
      id: `prototype:${p.id}`,
      path: p.path,
      title: p.label,
      subtitle: 'Prototype',
      searchText: `${p.label} prototype ${p.path}`.toLowerCase(),
      sortKey: 30,
    })),
    ...TOPICS.map(topicToDestination),
  ];

  return out;
}
