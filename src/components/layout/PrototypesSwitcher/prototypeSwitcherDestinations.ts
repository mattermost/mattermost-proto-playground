import {
  BRANCH_FOCUS_PROTOTYPE_IDS,
  INITIATIVE_META,
  PROTOTYPES,
  getInitiativeOf,
  prototypePageHref,
  type PrototypeEntry,
} from '@/manifests/prototypes';
import type { QuickSwitcherDestination } from '@/components/layout/QuickSwitcher/quickSwitcherDestinations';

function listedPrototypes(): PrototypeEntry[] {
  return PROTOTYPES.filter((entry) => {
    if (entry.unlisted) return false;
    if (BRANCH_FOCUS_PROTOTYPE_IDS.size === 0) return true;
    return BRANCH_FOCUS_PROTOTYPE_IDS.has(entry.id);
  });
}

function labelOf(entry: PrototypeEntry): string {
  return entry.navLabel ?? entry.label;
}

/**
 * Destinations for the prototypes ⌘K switcher — one row per prototype,
 * plus a row per declared inner page.
 */
export function buildPrototypeSwitcherDestinations(): QuickSwitcherDestination[] {
  const out: QuickSwitcherDestination[] = [
    {
      id: 'prototypes-index',
      path: '/prototypes',
      title: 'Prototypes',
      breadcrumb: ['Prototypes'],
      searchText: 'prototypes index home',
      sortKey: 0,
    },
  ];

  for (const entry of listedPrototypes()) {
    const name = labelOf(entry);
    const initiative = getInitiativeOf(entry.id);
    const initiativeLabel = initiative
      ? INITIATIVE_META[initiative].label
      : undefined;
    const crumbs = ['Prototypes', ...(initiativeLabel ? [initiativeLabel] : []), name];

    out.push({
      id: `prototype:${entry.id}`,
      path: entry.path,
      title: name,
      breadcrumb: crumbs,
      searchText: [
        name,
        entry.label,
        entry.description ?? '',
        initiativeLabel ?? '',
        entry.path,
      ]
        .join(' ')
        .toLowerCase(),
      sortKey: 10,
    });

    for (const page of entry.pages ?? []) {
      out.push({
        id: `prototype:${entry.id}:page:${page.id}`,
        path: prototypePageHref(entry, page),
        title: page.label,
        breadcrumb: [...crumbs, page.label],
        searchText: [page.label, name, entry.label, page.id, entry.path]
          .join(' ')
          .toLowerCase(),
        sortKey: 20,
      });
    }
  }

  return out;
}
