import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { SearchMenuItem } from '../components/SearchListRows';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import { MESSAGE_FILTER_OPTIONS } from '../universalSearchData';

const AVATARS: Record<string, string> = {
  f1: avatarSofia,
  f2: avatarMarco,
  f3: avatarLeonard,
  f4: avatarEmma,
};

type MessagesModifiersSceneProps = {
  onSelect: (id: string, label: string) => void;
};

export default function MessagesModifiersScene({
  onSelect,
}: MessagesModifiersSceneProps) {
  return (
    <>
      <MenuGroupHeading label="From" />
      {MESSAGE_FILTER_OPTIONS.map((option) => (
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
