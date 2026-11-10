import { RecentSearchRows, Section } from '../components/SearchListRows';
import {
  matchesQuery,
  RECENT_MESSAGE_SEARCHES,
} from '../universalSearchData';

type MessagesSceneProps = {
  query: string;
  searches: typeof RECENT_MESSAGE_SEARCHES;
  onRemoveSearch: (id: string) => void;
};

export default function MessagesScene({
  query,
  searches,
  onRemoveSearch,
}: MessagesSceneProps) {
  const needle = query.trim();
  const visibleSearches = needle
    ? searches.filter((search) => matchesQuery(needle, [search.label]))
    : searches;

  if (visibleSearches.length === 0) return null;

  return (
    <Section label="Recent searches">
      <RecentSearchRows searches={visibleSearches} onRemove={onRemoveSearch} />
    </Section>
  );
}
