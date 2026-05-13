import { topicSections } from './sections';
import { TOPICS, type Topic, type TopicCategory } from './topics';

/**
 * Topics in the same order as the docs sidebar for `category` (section groups,
 * then "Other" in manifest order). Used for linear "next page" navigation.
 */
export function orderedTopicsForCategory(category: TopicCategory): Topic[] {
  const inCategory = TOPICS.filter((t) => t.category === category);
  const sections = topicSections[category];

  if (!sections || sections.length === 0) {
    return inCategory;
  }

  const bySlug = new Map(inCategory.map((t) => [t.slug, t]));
  const used = new Set<string>();
  const ordered: Topic[] = [];

  for (const s of sections) {
    for (const slug of s.slugs) {
      const t = bySlug.get(slug);
      if (t) {
        ordered.push(t);
        used.add(slug);
      }
    }
  }

  for (const t of inCategory) {
    if (!used.has(t.slug)) {
      ordered.push(t);
    }
  }

  return ordered;
}

/** Next topic after `topic` in the category sidebar series, if any. */
export function nextTopicInCategorySeries(topic: Topic): Topic | undefined {
  const ordered = orderedTopicsForCategory(topic.category);
  const idx = ordered.findIndex((t) => t.slug === topic.slug);
  if (idx < 0 || idx >= ordered.length - 1) {
    return undefined;
  }
  return ordered[idx + 1];
}
