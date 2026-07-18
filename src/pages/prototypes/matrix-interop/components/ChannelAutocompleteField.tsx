import { useMemo } from 'react';
import { Combobox, Icon } from '@mattermost/compass-ui';
import type { ComboboxOption } from '@mattermost/compass-ui';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import type { MattermostChannelOption } from '../matrixInteropTypes';
import modalStyles from './MatrixInteropModals.module.scss';

type ChannelAutocompleteFieldProps = {
  channels: MattermostChannelOption[];
  value: string;
  onChange: (channelId: string) => void;
  onInputChange?: () => void;
  invalid?: boolean;
  'aria-label'?: string;
};

function channelLeadingVisual(channel: MattermostChannelOption) {
  return (
    <Icon
      className={modalStyles['matrix-interop-modals__channel-icon']}
      glyph={
        channel.visibility === 'public' ? <GlobeIcon /> : <LockOutlineIcon />
      }
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
  const options = useMemo<ComboboxOption[]>(
    () =>
      channels.map((channel) => ({
        value: channel.id,
        label: channel.name,
        secondaryLabel: channel.team,
        leadingVisual: channelLeadingVisual(channel),
      })),
    [channels],
  );

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === value),
    [channels, value],
  );

  return (
    <Combobox
      size="Medium"
      options={options}
      value={value || null}
      onChange={(next) => {
        if (typeof next === 'string') {
          onChange(next);
        }
      }}
      onInputChange={() => onInputChange?.()}
      filter={(option, query) => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return true;
        return (
          option.label.toLowerCase().includes(normalized) ||
          (option.secondaryLabel?.toLowerCase().includes(normalized) ?? false)
        );
      }}
      leadingIcon={
        selectedChannel ? (
          channelLeadingVisual(selectedChannel)
        ) : (
          <Icon glyph={<GlobeIcon />} size="16" />
        )
      }
      placeholder="Search channels"
      emptyMessage="No channels match your search."
      invalid={invalid}
      aria-label={ariaLabel}
    />
  );
}
