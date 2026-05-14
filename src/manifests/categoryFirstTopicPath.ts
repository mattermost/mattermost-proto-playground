import type { TopicCategory } from './topics';
import { TOPICS } from './topics';
import { topicSections } from './sections';

/**
 * URL path for the first topic in a category, honoring sidebar section order.
 * Matches primary nav links for Foundations / Components / Patterns.
 */
export function categoryFirstTopicPath(category: TopicCategory): string {
  const inCategory = TOPICS.filter((t) => t.category === category);
  const sections = topicSections[category];
  const fallback = inCategory[0];

  if (!sections || sections.length === 0) {
    return fallback ? `/${category}/${fallback.slug}` : `/${category}`;
  }

  const slugs = new Set(inCategory.map((t) => t.slug));
  for (const section of sections) {
    for (const slug of section.slugs) {
      if (slugs.has(slug)) return `/${category}/${slug}`;
    }
  }
  return fallback ? `/${category}/${fallback.slug}` : `/${category}`;
}
