import {useState} from 'react';
import {EmptyState, MobileSearch} from '@mattermost/compass-ui';
import MessageSearchEmptyIllustration from '@/assets/illustrations/message-search-empty.svg?react';

export default function SearchScene() {
  const [query, setQuery] = useState('');

  return (
    <MobileSearch value={query} onChange={setQuery}>
      <EmptyState
        illustration={{
          'aria-label': 'Search',
          width: '120px',
          height: '80px',
          children: <MessageSearchEmptyIllustration />,
        }}
        title={query.trim() ? 'No results found' : 'Search messages'}
        description={
          query.trim()
            ? 'Try adjusting your search or filters to find what you’re looking for.'
            : 'Find messages, files, and people across your teams.'
        }
      />
    </MobileSearch>
  );
}
