import {
  MessageRows,
  RecentSearchRows,
  Section,
} from '../components/SearchListRows';
import SearchEmptyState from '../components/SearchEmptyState';
import {
  matchesQuery,
  MESSAGE_HITS,
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
  if (!needle) {
    return (
      <Section label="Recent searches">
        <RecentSearchRows searches={searches} onRemove={onRemoveSearch} />
      </Section>
    );
  }

  const visibleSearches = searches.filter((search) =>
    matchesQuery(needle, [search.label]),
  );
  const messages = MESSAGE_HITS.filter((hit) =>
    matchesQuery(needle, [hit.body, hit.username, hit.channelName]),
  );

  if (visibleSearches.length === 0 && messages.length === 0) {
    return <SearchEmptyState />;
  }

  return (
    <>
      {messages.length > 0 && (
        <Section label="Messages">
          <MessageRows messages={messages} />
        </Section>
      )}
      {visibleSearches.length > 0 && (
        <Section label="Recent searches">
          <RecentSearchRows
            searches={visibleSearches}
            onRemove={onRemoveSearch}
          />
        </Section>
      )}
    </>
  );
}
