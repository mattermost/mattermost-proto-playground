import type { ComponentType } from 'react';

export type GuidelineCategory =
  | 'overview'
  | 'foundations'
  | 'components'
  | 'patterns'
  | 'layouts';

export interface GuidelineEntry {
  /** URL-safe identifier. */
  slug: string;
  /** Display name. */
  name: string;
  /** Top-level grouping. */
  category: GuidelineCategory;
  /** One-line summary for index pages and the page hero. */
  description?: string;
  /** Lazy import of the .mdx page. */
  page: () => Promise<{ default: ComponentType }>;
}

export const GUIDELINE_ENTRIES: GuidelineEntry[] = [
  // Overview
  {
    slug: 'why-compass',
    name: 'Why Compass',
    category: 'overview',
    description: 'Why we built Compass and the problems it solves.',
    page: () => import('@/guidelines/overview/WhyCompass.mdx'),
  },
  {
    slug: 'principles',
    name: 'Design Principles',
    category: 'overview',
    description: 'Principles that guide every design decision.',
    page: () => import('@/guidelines/overview/Principles.mdx'),
  },
  {
    slug: 'system-hierarchy',
    name: 'System Hierarchy',
    category: 'overview',
    description: 'How foundations, components, patterns, and layouts relate.',
    page: () => import('@/guidelines/overview/SystemHierarchy.mdx'),
  },
  {
    slug: 'status-legend',
    name: 'Status Legend',
    category: 'overview',
    description: 'How to read status badges on library entries.',
    page: () => import('@/guidelines/overview/StatusLegend.mdx'),
  },

  // Foundations
  {
    slug: 'writing-style',
    name: 'Writing Style',
    category: 'foundations',
    description: 'Voice, tone, and language conventions across the product.',
    page: () => import('@/guidelines/foundations/WritingStyle.mdx'),
  },
  {
    slug: 'usability-heuristics',
    name: 'Usability Heuristics',
    category: 'foundations',
    description: 'The lens we use to evaluate design quality.',
    page: () => import('@/guidelines/foundations/UsabilityHeuristics.mdx'),
  },
  {
    slug: 'system-feedback',
    name: 'System Feedback',
    category: 'foundations',
    description:
      'How the system communicates back to the user — confirmation, errors, progress.',
    page: () => import('@/guidelines/foundations/SystemFeedback.mdx'),
  },
  {
    slug: 'accessibility-guidelines',
    name: 'Accessibility Guidelines',
    category: 'foundations',
    description:
      'Standards every component must meet — contrast, keyboard, assistive tech.',
    page: () => import('@/guidelines/foundations/AccessibilityGuidelines.mdx'),
  },
  {
    slug: 'color',
    name: 'Color',
    category: 'foundations',
    description: 'Palette intent, semantic tokens, and contrast rules.',
    page: () => import('@/guidelines/foundations/Color.mdx'),
  },
  {
    slug: 'themes',
    name: 'Themes',
    category: 'foundations',
    description: 'How themes adapt color and authoring components that work across them.',
    page: () => import('@/guidelines/foundations/Themes.mdx'),
  },
  {
    slug: 'typography',
    name: 'Typography',
    category: 'foundations',
    description: 'Type families, the scale, and weight conventions.',
    page: () => import('@/guidelines/foundations/Typography.mdx'),
  },
  {
    slug: 'iconography',
    name: 'Iconography',
    category: 'foundations',
    description: 'When to use icons, sizing, and pairing with labels.',
    page: () => import('@/guidelines/foundations/Iconography.mdx'),
  },
  {
    slug: 'shape',
    name: 'Shape',
    category: 'foundations',
    description: 'Corner radius scale and the role of shape in hierarchy.',
    page: () => import('@/guidelines/foundations/Shape.mdx'),
  },
  {
    slug: 'elevation',
    name: 'Elevation',
    category: 'foundations',
    description: 'The relative distance between objects along the z-axis.',
    page: () => import('@/guidelines/foundations/Elevation.mdx'),
  },
  {
    slug: 'layout',
    name: 'Layout',
    category: 'foundations',
    description: 'Spacing scale, density patterns, and surface composition.',
    page: () => import('@/guidelines/foundations/Layout.mdx'),
  },
  {
    slug: 'animation',
    name: 'Animation',
    category: 'foundations',
    description: 'Duration and easing tokens, and when to animate.',
    page: () => import('@/guidelines/foundations/Animation.mdx'),
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
