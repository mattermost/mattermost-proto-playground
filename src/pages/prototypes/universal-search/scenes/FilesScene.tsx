import {
  FileRows,
  RecentSearchRows,
  Section,
} from '../components/SearchListRows';
import SearchEmptyState from '../components/SearchEmptyState';
import {
  matchesQuery,
  RECENT_FILES,
  RECENT_FILE_SEARCHES,
} from '../universalSearchData';

type FilesSceneProps = {
  query: string;
  searches: typeof RECENT_FILE_SEARCHES;
  onRemoveSearch: (id: string) => void;
};

export default function FilesScene({
  query,
  searches,
  onRemoveSearch,
}: FilesSceneProps) {
  const needle = query.trim();
  const visibleSearches = needle
    ? searches.filter((search) => matchesQuery(needle, [search.label]))
    : searches;
  const files = needle
    ? RECENT_FILES.filter((file) =>
        matchesQuery(needle, [file.name, file.secondaryLabel]),
      )
    : RECENT_FILES;

  if (needle && visibleSearches.length === 0 && files.length === 0) {
    return <SearchEmptyState />;
  }

  return (
    <>
      {visibleSearches.length > 0 && (
        <Section label="Recent searches">
          <RecentSearchRows
            searches={visibleSearches}
            onRemove={onRemoveSearch}
          />
        </Section>
      )}
      {files.length > 0 && (
        <Section label={needle ? 'Files' : 'Recently added files'}>
          <FileRows files={files} />
        </Section>
      )}
    </>
  );
}
