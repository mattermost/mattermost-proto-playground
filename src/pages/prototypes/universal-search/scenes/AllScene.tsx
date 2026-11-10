import SearchEmptyState from '../components/SearchEmptyState';
import {
  ChannelRows,
  FileRows,
  PersonRows,
  RecentSearchRows,
  Section,
} from '../components/SearchListRows';
import {
  allSearchMatches,
  PEOPLE_MOST_CHATTED,
  RECENT_FILES,
  RECENT_MESSAGE_SEARCHES,
  UNREAD_CHANNELS,
} from '../universalSearchData';

type AllSceneProps = {
  query: string;
  recentSearches: typeof RECENT_MESSAGE_SEARCHES;
  onRemoveSearch: (id: string) => void;
};

export default function AllScene({
  query,
  recentSearches,
  onRemoveSearch,
}: AllSceneProps) {
  if (!query.trim()) {
    return (
      <>
        <Section label="Channels">
          <ChannelRows channels={UNREAD_CHANNELS} />
        </Section>
        <Section label="People">
          <PersonRows people={PEOPLE_MOST_CHATTED} />
        </Section>
        <Section label="Files">
          <FileRows files={RECENT_FILES.slice(0, 3)} />
        </Section>
        {recentSearches.length > 0 && (
          <Section label="Recent searches">
            <RecentSearchRows
              searches={recentSearches.slice(0, 3)}
              onRemove={onRemoveSearch}
            />
          </Section>
        )}
      </>
    );
  }

  const matches = allSearchMatches(query);
  const hasMatches =
    matches.channels.length > 0 ||
    matches.files.length > 0 ||
    matches.people.length > 0;

  if (!hasMatches) return <SearchEmptyState />;

  return (
    <>
      {matches.channels.length > 0 && (
        <Section label="Channels">
          <ChannelRows channels={matches.channels} />
        </Section>
      )}
      {matches.files.length > 0 && (
        <Section label="Files">
          <FileRows files={matches.files} />
        </Section>
      )}
      {matches.people.length > 0 && (
        <Section label="People">
          <PersonRows people={matches.people} />
        </Section>
      )}
    </>
  );
}
