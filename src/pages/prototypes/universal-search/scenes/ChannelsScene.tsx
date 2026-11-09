import {
  ChannelRows,
  Section,
} from '../components/SearchListRows';
import { RECENT_CHANNELS, UNREAD_CHANNELS } from '../universalSearchData';

export default function ChannelsScene() {
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
