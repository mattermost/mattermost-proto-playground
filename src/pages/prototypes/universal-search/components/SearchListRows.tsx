import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from 'react';
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
import {
  MenuItem,
  type MenuItemProps,
} from '@mattermost/compass-ui/components/menu-item';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import type {
  ChannelResult,
  FileResult,
  MessageHit,
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

type SearchListContextValue = {
  activeIndex: number;
  generation: number;
  setActiveIndex: (index: number) => void;
  register: () => number;
};

const SearchListContext = createContext<SearchListContextValue | null>(null);

function useSearchOption() {
  const list = useContext(SearchListContext);
  const slot = useRef<{ generation: number; index: number } | null>(null);
  const generation = list?.generation ?? 0;
  if (list && slot.current?.generation !== generation) {
    slot.current = { generation, index: list.register() };
  }
  const index = slot.current?.index ?? 0;
  const selected = list ? index === list.activeIndex : false;
  return { list, index, selected };
}

export function SearchOption({
  children,
}: {
  children: (option: {
    index: number;
    selected: boolean;
    onMouseEnter: () => void;
  }) => ReactNode;
}) {
  const { list, index, selected } = useSearchOption();
  return children({
    index,
    selected,
    onMouseEnter: () => {
      if (list && list.activeIndex !== index) list.setActiveIndex(index);
    },
  });
}

export function SearchResults({
  activeIndex,
  generation,
  onActiveIndexChange,
  children,
}: {
  activeIndex: number;
  generation: number;
  onActiveIndexChange: (index: number) => void;
  children: ReactNode;
}) {
  const nextIndex = useRef(0);
  nextIndex.current = 0;

  return (
    <SearchListContext.Provider
      value={{
        activeIndex,
        generation,
        setActiveIndex: onActiveIndexChange,
        register: () => {
          const index = nextIndex.current;
          nextIndex.current += 1;
          return index;
        },
      }}
    >
      {children}
    </SearchListContext.Provider>
  );
}

export function SearchMenuItem(props: MenuItemProps) {
  return (
    <SearchOption>
      {({ index, selected, onMouseEnter }) => (
        <MenuItem
          {...props}
          id={`universal-search-option-${index}`}
          role="option"
          tabIndex={-1}
          aria-selected={selected}
          className={[
            props.className,
            selected
              ? modalStyles['universal-search-modal__option--highlighted']
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onMouseEnter={(event) => {
            props.onMouseEnter?.(event);
            onMouseEnter();
          }}
        />
      )}
    </SearchOption>
  );
}

export function ChannelRows({ channels }: { channels: ChannelResult[] }) {
  return (
    <>
      {channels.map((channel) => (
        <SearchMenuItem
          key={channel.id}
          label={channel.name}
          leadingVisual={channelGlyph(channel.leadingVisual)}
          mentionCount={channel.mentionCount}
        />
      ))}
    </>
  );
}

export function PersonRows({ people }: { people: PersonResult[] }) {
  return (
    <>
      {people.map((person) => (
        <SearchMenuItem
          key={person.id}
          label={person.name}
          secondaryLabel={person.username}
          secondaryLabelPosition={person.username ? 'inline' : undefined}
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

export function MessageRows({ messages }: { messages: MessageHit[] }) {
  return (
    <>
      {messages.map((message) => (
        <SearchMenuItem
          key={message.id}
          label={message.username}
          secondaryLabel={`${message.channelName} · ${message.body}`}
          leadingVisual={
            <UserAvatar
              src={message.avatarSrc}
              alt={message.username}
              size="24"
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
        <SearchMenuItem
          key={file.id}
          label={file.name}
          secondaryLabel={file.secondaryLabel}
          secondaryLabelPosition="inline"
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
          <SearchMenuItem
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
