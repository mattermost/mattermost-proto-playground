import { PersonRows, Section } from '../components/SearchListRows';
import { PEOPLE_MOST_CHATTED, PEOPLE_RECENT } from '../universalSearchData';

export default function PeopleScene() {
  return (
    <>
      <Section label="People you chat with most">
        <PersonRows people={PEOPLE_MOST_CHATTED} />
      </Section>
      <Section label="Recent">
        <PersonRows people={PEOPLE_RECENT} />
      </Section>
    </>
  );
}
