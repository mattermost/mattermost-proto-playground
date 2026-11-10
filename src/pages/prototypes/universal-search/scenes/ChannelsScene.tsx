import { ChannelRows, Section } from '../components/SearchListRows';
import SearchEmptyState from '../components/SearchEmptyState';
import {
  CHANNEL_TYPING_RESULTS,
  matchesQuery,
  RECENT_CHANNELS,
  UNREAD_CHANNELS,
  type ChannelResult,
} from '../universalSearchData';

function matchingChannels(query: string) {
  const seen = new Set<string>();
  return [...UNREAD_CHANNELS, ...RECENT_CHANNELS, ...CHANNEL_TYPING_RESULTS].filter(
    (channel) => {
      if (seen.has(channel.id)) return false;
      seen.add(channel.id);
      return matchesQuery(query, [channel.name]);
    },
  );
}

export default function ChannelsScene({ query }: { query: string }) {
  if (!query.trim()) {
    return (
      <>
        <Section label="Unreads">
          <ChannelRows channels={UNREAD_CHANNELS} />
        </Section>
        <Section label="Recent">
          <ChannelRows channels={RECENT_CHANNELS} />
        </Section>
      </>
    );
  }

  const channels: ChannelResult[] = matchingChannels(query);
  if (channels.length === 0) return <SearchEmptyState />;

  return (
    <Section label="Channels">
      <ChannelRows channels={channels} />
    </Section>
  );
}
