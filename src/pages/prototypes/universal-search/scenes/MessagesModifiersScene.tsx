import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import SearchEmptyState from '../components/SearchEmptyState';
import { SearchMenuItem } from '../components/SearchListRows';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import { matchesQuery, MESSAGE_FILTER_OPTIONS } from '../universalSearchData';

const AVATARS: Record<string, string> = {
  f1: avatarSofia,
  f2: avatarMarco,
  f3: avatarLeonard,
  f4: avatarEmma,
};

type MessagesModifiersSceneProps = {
  query: string;
  onSelect: (id: string, label: string) => void;
};

export default function MessagesModifiersScene({
  query,
  onSelect,
}: MessagesModifiersSceneProps) {
  const term = query.replace(/^from:\s*/i, '');
  const options = term
    ? MESSAGE_FILTER_OPTIONS.filter((option) =>
        matchesQuery(term, [option.label, option.secondaryLabel]),
      )
    : MESSAGE_FILTER_OPTIONS;

  if (options.length === 0) return <SearchEmptyState />;

  return (
    <>
      <MenuGroupHeading label="From" />
      {options.map((option) => (
        <SearchMenuItem
          key={option.id}
          label={option.label}
          secondaryLabel={option.secondaryLabel}
          secondaryLabelPosition="inline"
          leadingVisual={
            <UserAvatar
              src={AVATARS[option.id]}
              alt={option.label}
              size="24"
            />
          }
          onClick={() => onSelect(option.id, option.label)}
        />
      ))}
    </>
  );
}
