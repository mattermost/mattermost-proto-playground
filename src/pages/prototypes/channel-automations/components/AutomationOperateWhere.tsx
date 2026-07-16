import { Chip, Icon, MenuItem, PopoverMenu, Select, Tag } from '@mattermost/compass-ui';
import { useId, useRef, useState, type ChangeEvent } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  ACTIVE_CHANNEL,
  AUTOMATION_CHANNEL_OPTIONS,
  type AutomationChannelType,
} from '../channelAutomationsData';
import styles from './AutomationOperateWhere.module.scss';

export type OperateWhereMode =
  | 'team-public'
  | 'selected'
  | 'trigger-channel';

const MODE_OPTIONS: { value: OperateWhereMode; label: string }[] = [
  {
    value: 'team-public',
    label: 'All public channels in the team + invocation context',
  },
  {
    value: 'selected',
    label: 'Only selected channels',
  },
  {
    value: 'trigger-channel',
    label: 'Only the channel it is triggered in',
  },
];

const TEAM_PUBLIC_CHANNEL_COUNT = 12;

type ChannelOption = (typeof AUTOMATION_CHANNEL_OPTIONS)[number];

function channelLeadingIcon(type: AutomationChannelType) {
  return type === 'private' ? <LockOutlineIcon /> : <GlobeIcon />;
}

function operateWhereSummary(
  mode: OperateWhereMode,
  selected: ChannelOption[],
): string {
  const team = ACTIVE_CHANNEL.teamName;

  if (mode === 'team-public') {
    return `Can read from ~${TEAM_PUBLIC_CHANNEL_COUNT} public channels + invocation context in ${team}`;
  }

  if (mode === 'trigger-channel') {
    return 'Can read from only the channel it is triggered in';
  }

  if (selected.length === 0) {
    return 'No channels selected yet.';
  }

  const publicCount = selected.filter((c) => c.type === 'public').length;
  const privateCount = selected.filter((c) => c.type === 'private').length;
  const parts: string[] = [];

  if (publicCount > 0) {
    parts.push(`${publicCount} public channel${publicCount === 1 ? '' : 's'}`);
  }
  if (privateCount > 0) {
    parts.push(`${privateCount} private channel${privateCount === 1 ? '' : 's'}`);
  }

  return `Can read from ${parts.join(' + ')} in ${team}`;
}

export interface AutomationOperateWhereProps {
  className?: string;
}

export default function AutomationOperateWhere({
  className = '',
}: AutomationOperateWhereProps) {
  const id = useId().replace(/\W/g, '');
  const [mode, setMode] = useState<OperateWhereMode>('team-public');
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'ux-design',
    'orion',
  ]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useOutsideClose(pickerRef, pickerOpen, () => setPickerOpen(false));

  const selected = AUTOMATION_CHANNEL_OPTIONS.filter((channel) =>
    selectedIds.includes(channel.id),
  );
  const available = AUTOMATION_CHANNEL_OPTIONS.filter(
    (channel) => !selectedIds.includes(channel.id),
  );
  const summary = operateWhereSummary(mode, [...selected]);
  const hasPrivate = selected.some((channel) => channel.type === 'private');

  const removeChannel = (channelId: string) => {
    setSelectedIds((prev) => prev.filter((current) => current !== channelId));
  };

  const addChannel = (channelId: string) => {
    setSelectedIds((prev) =>
      prev.includes(channelId) ? prev : [...prev, channelId],
    );
    setPickerOpen(false);
  };

  return (
    <div className={[styles['operate-where'], className].filter(Boolean).join(' ')}>
      <Select
        aria-label="Where the automation can read from"
        value={mode}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setMode(e.target.value as OperateWhereMode)
        }
      >
        {MODE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      {mode === 'selected' ? (
        <div className={styles['operate-where__picker']} ref={pickerRef}>
          <p id={`${id}-label`} className={styles['operate-where__picker-label']}>
            Channels
          </p>
          <div
            className={[
              styles['operate-where__picker-field'],
              pickerOpen ? styles['operate-where__picker-field--open'] : '',
              hasPrivate ? styles['operate-where__picker-field--has-private'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className={styles['operate-where__chips']}>
              {selected.map((channel) => (
                <Chip
                  key={channel.id}
                  size="Medium"
                  leadingIcon={channelLeadingIcon(channel.type)}
                  onRemove={() => removeChannel(channel.id)}
                  removeLabel={`Remove ${channel.label}`}
                >
                  <span className={styles['operate-where__chip-label']}>
                    {channel.label}
                    {channel.type === 'private' ? (
                      <Tag
                        label="Private"
                        type="Warning"
                        size="X-Small"
                      />
                    ) : null}
                  </span>
                </Chip>
              ))}
              {selected.length === 0 ? (
                <span className={styles['operate-where__placeholder']}>
                  Choose channels...
                </span>
              ) : null}
            </div>
            <button
              type="button"
              className={styles['operate-where__picker-toggle']}
              aria-haspopup="listbox"
              aria-expanded={pickerOpen}
              aria-label="Add channel"
              onClick={() => setPickerOpen((current) => !current)}
            >
              <Icon size="16" glyph={<ChevronDownIcon />} />
            </button>
          </div>

          {pickerOpen && available.length > 0 ? (
            <PopoverMenu
              className={styles['operate-where__menu']}
              role="listbox"
              aria-label="Channels"
            >
              {available.map((channel) => (
                <MenuItem
                  key={channel.id}
                  label={channel.label}
                  secondaryLabel={channel.type === 'private' ? 'Private' : 'Public'}
                  leadingVisual={
                    <Icon
                      size="16"
                      glyph={channelLeadingIcon(channel.type)}
                    />
                  }
                  onClick={() => addChannel(channel.id)}
                />
              ))}
            </PopoverMenu>
          ) : null}

          {hasPrivate ? (
            <p className={styles['operate-where__private-note']}>
              Includes private channels you are a member of.
            </p>
          ) : null}
        </div>
      ) : null}

      <p className={styles['operate-where__summary']} aria-live="polite">
        {summary}
      </p>
    </div>
  );
}
