import { useState} from 'react';
import { Scrollbar } from '@mattermost/compass-ui';
import { MobileSearch } from '@mattermost/compass-proto';
import { MobileSearchSuggestions } from '@mattermost/compass-proto';

export default function SearchScene() {
  const [query, setQuery] = useState('');

  return (
    <MobileSearch value={query} onChange={setQuery}>
      <Scrollbar>
        <MobileSearchSuggestions
          options={[
            {
              id: 'from',
              modifier: 'From:',
              description: ' a specific user',
              onClick: () => setQuery((prev) => `${prev}from:`.trimStart()),
            },
            {
              id: 'in',
              modifier: 'In:',
              description: ' a specific channel',
              onClick: () => setQuery((prev) => `${prev}in:`.trimStart()),
            },
            {
              id: 'on',
              modifier: 'On:',
              description: ' a specific date',
              onClick: () => setQuery((prev) => `${prev}on:`.trimStart()),
            },
          ]}
          recent={[
            {
              id: '1',
              query: 'Welcome in:town-square',
              onSelect: () => setQuery('Welcome in:town-square'),
            },
            {
              id: '2',
              query: 'Figma',
              onSelect: () => setQuery('Figma'),
            },
            {
              id: '3',
              query: 'RC Test from:amy.blais',
              onSelect: () => setQuery('RC Test from:amy.blais'),
            },
          ]}
        />
      </Scrollbar>
    </MobileSearch>
  );
}
