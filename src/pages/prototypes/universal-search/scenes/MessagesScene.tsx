import {
  RecentSearchRows,
  Section,
} from '../components/SearchListRows';
import { RECENT_MESSAGE_SEARCHES } from '../universalSearchData';

type MessagesSceneProps = {
  searches: typeof RECENT_MESSAGE_SEARCHES;
  onRemoveSearch: (id: string) => void;
};

export default function MessagesScene({
  searches,
  onRemoveSearch,
}: MessagesSceneProps) {
  return (
    <Section label="Recent searches">
      <RecentSearchRows searches={searches} onRemove={onRemoveSearch} />
    </Section>
  );
}
