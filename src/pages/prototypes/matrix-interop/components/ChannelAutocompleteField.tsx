import { useMemo, useRef, useState, type ChangeEvent, type MouseEvent } from 'react';
import { Icon, MenuItem, PopoverMenu, PopoverMenuScroll, TextInput } from '@mattermost/compass-ui';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import type { MattermostChannelOption } from '../matrixInteropTypes';
import styles from './ChannelAutocompleteField.module.scss';
import modalStyles from './MatrixInteropModals.module.scss';

type ChannelAutocompleteFieldProps = {
  channels: MattermostChannelOption[];
  value: string;
  onChange: (channelId: string) => void;
  onInputChange?: () => void;
  invalid?: boolean;
  'aria-label'?: string;
};

function channelIcon(channel: MattermostChannelOption | undefined) {
  if (!channel) {
    return <Icon glyph={<MagnifyIcon />} size="16" />;
  }

  return (
    <Icon
      className={modalStyles['matrix-interop-modals__channel-icon']}
      glyph={channel.visibility === 'public' ? <GlobeIcon /> : <LockOutlineIcon />}
      size="16"
    />
  );
}

export default function ChannelAutocompleteField({
  channels,
  value,
  onChange,
  onInputChange,
  invalid = false,
  'aria-label': ariaLabel = 'Mattermost channel',
}: ChannelAutocompleteFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === value),
    [channels, value],
  );

  const displayValue = open ? query : (selectedChannel?.name ?? '');

  const filteredChannels = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return channels;

    return channels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(normalized) ||
        channel.team.toLowerCase().includes(normalized),
    );
  }, [channels, query]);

  const leadingChannel =
    open && query.trim()
      ? filteredChannels[0]
      : selectedChannel ?? filteredChannels[0];

  useOutsideClose(rootRef, open, () => {
    setOpen(false);
    setQuery('');
  });

  const handleSelect = (channel: MattermostChannelOption) => {
    onChange(channel.id);
    onInputChange?.();
    setQuery('');
    setOpen(false);
  };

  return (
    <div className={styles['channel-autocomplete']} ref={rootRef}>
      <TextInput
        size="Medium"
        value={displayValue}
        invalid={invalid}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-autocomplete="list"
        role="combobox"
        leadingIcon={channelIcon(leadingChannel)}
        trailingIcon={<Icon glyph={<ChevronDownIcon />} size="16" />}
        placeholder="Search channels"
        onFocus={() => {
          setOpen(true);
          setQuery(selectedChannel?.name ?? '');
        }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setOpen(true);
          setQuery(e.target.value);
          onInputChange?.();
        }}
      />

      {open && (
        <div className={styles['channel-autocomplete__menu']}>
          <PopoverMenu>
            {filteredChannels.length > 0 ? (
              <PopoverMenuScroll maxHeight={220}>
                {filteredChannels.map((channel) => (
                  <MenuItem
                    key={channel.id}
                    role="option"
                    aria-selected={channel.id === value}
                    label={channel.name}
                    secondaryLabel={channel.team}
                    leadingVisual={channelIcon(channel)}
                    onMouseDown={(e: MouseEvent<HTMLButtonElement>) => e.preventDefault()}
                    onClick={() => handleSelect(channel)}
                  />
                ))}
              </PopoverMenuScroll>
            ) : (
              <p className={styles['channel-autocomplete__empty']}>
                No channels match your search.
              </p>
            )}
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}
