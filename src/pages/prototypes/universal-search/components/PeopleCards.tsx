import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import type { PersonResult } from '../universalSearchData';
import styles from './PeopleCards.module.scss';
import { SearchOption } from './SearchListRows';

function avatarStatus(status: PersonResult['status']) {
  if (status === 'dnd') return 'do-not-disturb';
  return status;
}

function PersonCard({ person }: { person: PersonResult }) {
  return (
    <SearchOption>
      {({ index, selected, onMouseEnter }) => (
        <button
          id={`universal-search-option-${index}`}
          type="button"
          role="option"
          tabIndex={-1}
          aria-selected={selected}
          className={[
            styles['people-cards__card'],
            selected ? styles['people-cards__card--selected'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onMouseEnter={onMouseEnter}
        >
          <span className={styles['people-cards__avatar']}>
            <UserAvatar
              src={person.avatarSrc}
              alt=""
              name={person.name}
              size="56"
              status={avatarStatus(person.status)}
            />
          </span>
          <span className={styles['people-cards__name']}>{person.name}</span>
        </button>
      )}
    </SearchOption>
  );
}

export default function PeopleCards({ people }: { people: PersonResult[] }) {
  return (
    <div className={styles['people-cards']}>
      {people.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </div>
  );
}
