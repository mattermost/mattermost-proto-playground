import PeopleCards from '../components/PeopleCards';
import SearchEmptyState from '../components/SearchEmptyState';
import { PersonRows, Section } from '../components/SearchListRows';
import {
  matchesQuery,
  PEOPLE_FREQUENT,
  PEOPLE_MOST_CHATTED,
  PEOPLE_RECENT,
  PEOPLE_TYPING_RESULTS,
  type PersonResult,
} from '../universalSearchData';

function matchingPeople(query: string) {
  const seen = new Set<string>();
  return [
    ...PEOPLE_FREQUENT,
    ...PEOPLE_RECENT,
    ...PEOPLE_MOST_CHATTED,
    ...PEOPLE_TYPING_RESULTS,
  ].filter((person) => {
    if (seen.has(person.id)) return false;
    seen.add(person.id);
    return matchesQuery(query, [person.name, person.username ?? '']);
  });
}

export default function PeopleScene({ query }: { query: string }) {
  if (!query.trim()) {
    return (
      <>
        <Section label="People you chat with most">
          <PeopleCards people={PEOPLE_FREQUENT} />
        </Section>
        <Section label="Recent">
          <PersonRows people={PEOPLE_RECENT} />
        </Section>
      </>
    );
  }

  const people: PersonResult[] = matchingPeople(query);
  if (people.length === 0) return <SearchEmptyState />;

  return (
    <Section label="People">
      <PersonRows people={people} />
    </Section>
  );
}
