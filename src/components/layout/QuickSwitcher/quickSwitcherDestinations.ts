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

export function buildQuickSwitcherDestinations(): QuickSwitcherDestination[] {
  const catalog: QuickSwitcherDestination = {
    id: 'catalog',
    path: '/prototypes',
    title: 'Prototype catalog',
    breadcrumb: ['Catalog'],
    searchText: 'prototype catalog prototypes index',
    sortKey: 0,
  };

  const prototypeDestinations = PROTOTYPES.map((prototype, index) => ({
    id: prototype.id,
    path: prototype.path,
    title: prototype.label,
    breadcrumb: ['Prototypes'],
    searchText: `${prototype.label} ${prototype.id} ${prototype.path}`.toLowerCase(),
    sortKey: index + 1,
  }));

  return [catalog, ...prototypeDestinations];
}
