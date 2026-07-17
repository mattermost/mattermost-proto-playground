import { TOPICS, type Topic, type TopicCategory } from '@/manifests/topics';
import { categoryFirstTopicPath } from '@/manifests/categoryFirstTopicPath';
import { PROTOTYPES } from '@/manifests/prototypes';

export interface QuickSwitcherDestination {
  id: string;
  path: string;
  title: string;
  /** Parent → child trail shown under the title (no URL path). */
  breadcrumb: string[];
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
  const categoryLabel = CATEGORY_LABEL[t.category];
  const path = `/${t.category}/${t.slug}`;
  const searchText = [
    t.name,
    t.slug,
    categoryLabel,
    t.description ?? '',
    path,
  ]
    .join(' ')
    .toLowerCase();

  return {
    id: `topic:${t.category}:${t.slug}`,
    path,
    title: t.name,
    breadcrumb: [categoryLabel, t.name],
    searchText,
    sortKey: 300 + topicSortOrder(t.category),
  };
}

export function buildQuickSwitcherDestinations(): QuickSwitcherDestination[] {
  const out: QuickSwitcherDestination[] = [
    {
      id: 'home',
      path: '/',
      title: 'Home',
      breadcrumb: ['Home'],
      searchText: 'home /'.toLowerCase(),
      sortKey: 0,
    },
    ...CATEGORY_ORDER.map((slug) => {
      const path = categoryFirstTopicPath(slug);
      return {
        id: `category:${slug}`,
        path,
        title: CATEGORY_LABEL[slug],
        breadcrumb: [CATEGORY_LABEL[slug]],
        searchText: `${CATEGORY_LABEL[slug]} category ${slug} ${path}`.toLowerCase(),
        sortKey: 10,
      };
    }),
    {
      id: 'prototypes',
      path: '/prototypes',
      title: 'Prototypes',
      breadcrumb: ['Prototypes'],
      searchText: 'prototypes index /prototypes'.toLowerCase(),
      sortKey: 20,
    },
    ...PROTOTYPES.map((p) => ({
      id: `prototype:${p.id}`,
      path: p.path,
      title: p.label,
      breadcrumb: ['Prototypes', p.label],
      searchText: `${p.label} prototype ${p.path}`.toLowerCase(),
      sortKey: 30,
    })),
    ...TOPICS.map(topicToDestination),
  ];

  return out;
}
