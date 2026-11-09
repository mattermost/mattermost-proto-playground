import { ChannelRows } from '../components/SearchListRows';
import { CHANNEL_TYPING_RESULTS } from '../universalSearchData';

export default function ChannelsTypingScene() {
  return <ChannelRows channels={CHANNEL_TYPING_RESULTS} activeId="ux-design" />;
}
