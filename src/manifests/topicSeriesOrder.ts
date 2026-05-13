import { topicSections } from './sections';
import { TOPICS, type Topic, type TopicCategory } from './topics';

/** Top-level docs order; used for “continue to next section” on the last topic in a category. */
export const TOPIC_CATEGORY_SERIES: TopicCategory[] = [
  'foundations',
  'components',
  'patterns',
  'layouts',
];

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

/** True when `topic` is the final entry in its category’s sidebar order. */
export function isLastTopicInCategorySeries(topic: Topic): boolean {
  const ordered = orderedTopicsForCategory(topic.category);
  const idx = ordered.findIndex((t) => t.slug === topic.slug);
  return ordered.length > 0 && idx === ordered.length - 1;
}

/** First topic in the next top-level category (e.g. first Components topic after last Foundations). */
export function firstTopicInNextCategory(topic: Topic): Topic | undefined {
  const catIdx = TOPIC_CATEGORY_SERIES.indexOf(topic.category);
  if (catIdx < 0 || catIdx >= TOPIC_CATEGORY_SERIES.length - 1) {
    return undefined;
  }
  const nextCat = TOPIC_CATEGORY_SERIES[catIdx + 1];
  const ordered = orderedTopicsForCategory(nextCat);
  return ordered[0];
}
