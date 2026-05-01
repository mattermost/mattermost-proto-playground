import type { ComponentType } from 'react';

export type GuidelineCategory =
  | 'top-level'
  | 'foundations'
  | 'components'
  | 'patterns'
  | 'layouts';

export interface GuidelineEntry {
  /** URL-safe identifier. */
  slug: string;
  /** Display name. */
  name: string;
  /** Top-level grouping. 'top-level' = cross-cutting (Voice, Principles, etc.). */
  category: GuidelineCategory;
  /** One-line summary for index pages. */
  description?: string;
  /** Lazy import of the .mdx page. */
  page: () => Promise<{ default: ComponentType }>;
}

export const GUIDELINE_ENTRIES: GuidelineEntry[] = [
  {
    slug: 'principles',
    name: 'Principles',
    category: 'top-level',
    description: 'Foundational design principles for the system.',
    page: () => import('@/guidelines/Principles.mdx'),
  },
];

export function findGuidelineEntry(
  category: GuidelineCategory,
  slug: string,
): GuidelineEntry | undefined {
  return GUIDELINE_ENTRIES.find(
    (e) => e.category === category && e.slug === slug,
  );
}

export function guidelineEntriesByCategory(
  category: GuidelineCategory,
): GuidelineEntry[] {
  return GUIDELINE_ENTRIES.filter((e) => e.category === category);
}
