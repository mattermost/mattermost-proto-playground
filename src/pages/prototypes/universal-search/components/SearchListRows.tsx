import type { ReactNode } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import FileGenericOutlineIcon from '@mattermost/compass-icons/components/file-generic-outline';
import FilePdfOutlineIcon from '@mattermost/compass-icons/components/file-pdf-outline';
import FileWordOutlineIcon from '@mattermost/compass-icons/components/file-word-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockIcon from '@mattermost/compass-icons/components/lock';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import type {
  ChannelResult,
  FileResult,
  PersonResult,
  RecentSearch,
} from '../universalSearchData';
import modalStyles from './UniversalSearchModal.module.scss';

function channelGlyph(leadingVisual: ChannelResult['leadingVisual']) {
  return (
    <Icon
      glyph={leadingVisual === 'private' ? <LockIcon /> : <GlobeIcon />}
    />
  );
}

function fileGlyph(kind: FileResult['kind']) {
  if (kind === 'pdf') return <Icon glyph={<FilePdfOutlineIcon />} />;
  if (kind === 'word') return <Icon glyph={<FileWordOutlineIcon />} />;
  return <Icon glyph={<FileGenericOutlineIcon />} />;
}

export function ChannelRows({
  channels,
  activeId,
}: {
  channels: ChannelResult[];
  activeId?: string;
}) {
  return (
    <>
      {channels.map((channel) => (
        <MenuItem
          key={channel.id}
          label={channel.name}
          secondaryLabel={channel.secondaryLabel}
          leadingVisual={channelGlyph(channel.leadingVisual)}
          mentionCount={channel.mentionCount}
          active={channel.id === activeId}
        />
      ))}
    </>
  );
}

export function PersonRows({
  people,
  activeId,
}: {
  people: PersonResult[];
  activeId?: string;
}) {
  return (
    <>
      {people.map((person) => (
        <MenuItem
          key={person.id}
          label={person.name}
          secondaryLabel={person.secondaryLabel}
          active={person.id === activeId}
          leadingVisual={
            <UserAvatar
              src={person.avatarSrc}
              alt={person.name}
              size="24"
              status={person.status === 'online'}
            />
          }
        />
      ))}
    </>
  );
}

export function FileRows({ files }: { files: FileResult[] }) {
  return (
    <>
      {files.map((file) => (
        <MenuItem
          key={file.id}
          label={file.name}
          secondaryLabel={file.secondaryLabel}
          leadingVisual={fileGlyph(file.kind)}
        />
      ))}
    </>
  );
}

export function RecentSearchRows({
  searches,
  onRemove,
}: {
  searches: RecentSearch[];
  onRemove?: (id: string) => void;
}) {
  return (
    <>
      {searches.map((search) => (
        <div
          key={search.id}
          className={modalStyles['universal-search-modal__removable']}
        >
          <MenuItem
            label={search.label}
            leadingVisual={<Icon glyph={<MagnifyIcon />} />}
          />
          <IconButton
            className={modalStyles['universal-search-modal__remove']}
            size="x-small"
            aria-label={`Remove ${search.label}`}
            icon={<Icon glyph={<CloseIcon />} />}
            onClick={() => onRemove?.(search.id)}
          />
        </div>
      ))}
    </>
  );
}

export function Section({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <>
      <MenuGroupHeading label={label} />
      {children}
    </>
  );
}
