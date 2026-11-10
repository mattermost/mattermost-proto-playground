import SearchIllustration from '@mattermost/compass-ui/illustrations/search';
import { EmptyState } from '@mattermost/compass-ui/components/empty-state';

export default function SearchEmptyState() {
  return (
    <EmptyState
      title="No results found"
      titleLevel={3}
      description="Try adjusting your search or filters to find what you're looking for."
      illustration={{
        'aria-label': 'Search',
        width: '120px',
        height: '80px',
        children: <SearchIllustration />,
      }}
    />
  );
}
