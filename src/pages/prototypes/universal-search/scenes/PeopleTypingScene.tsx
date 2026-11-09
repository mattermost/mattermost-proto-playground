import { PersonRows } from '../components/SearchListRows';
import { PEOPLE_TYPING_RESULTS } from '../universalSearchData';

export default function PeopleTypingScene() {
  return <PersonRows people={PEOPLE_TYPING_RESULTS} activeId="sofia" />;
}
