import {
  FileRows,
  RecentSearchRows,
  Section,
} from '../components/SearchListRows';
import { RECENT_FILES, RECENT_FILE_SEARCHES } from '../universalSearchData';

type FilesSceneProps = {
  searches: typeof RECENT_FILE_SEARCHES;
  onRemoveSearch: (id: string) => void;
};

export default function FilesScene({
  searches,
  onRemoveSearch,
}: FilesSceneProps) {
  return (
    <>
      <Section label="Recent searches">
        <RecentSearchRows searches={searches} onRemove={onRemoveSearch} />
      </Section>
      <Section label="Recently added files">
        <FileRows files={RECENT_FILES} />
      </Section>
    </>
  );
}
