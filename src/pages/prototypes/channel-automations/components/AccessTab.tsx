import { Chip, Icon, Select } from '@mattermost/compass-ui';
import { useState, type ChangeEvent, type ReactNode } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import { SettingsHelpText, SettingsSectionRow } from './settings';
import styles from './AccessTab.module.scss';

type ChannelAccess = 'all' | 'allow-selected' | 'block-selected' | 'block-all';
type UserVisibility = 'public' | 'private';

const ACCESS_USER = {
  username: 'Leonard Riley',
  avatarSrc: avatarLeonard,
};

const CHANNEL_ACCESS_OPTIONS: { value: ChannelAccess; label: string }[] = [
  { value: 'all', label: 'Allow for all channels' },
  { value: 'allow-selected', label: 'Allow for selected channels' },
  { value: 'block-selected', label: 'Block selected channels' },
  { value: 'block-all', label: 'Block all channels' },
];

const USER_VISIBILITY_OPTIONS: {
  value: UserVisibility;
  title: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    value: 'public',
    title: 'Public agent',
    description: 'Anyone can interact',
    icon: <AccountMultipleOutlineIcon />,
  },
  {
    value: 'private',
    title: 'Private agent',
    description: 'Only invited members',
    icon: <LockOutlineIcon />,
  },
];

function AccessUserField({
  users,
  ariaLabel,
}: {
  users: typeof ACCESS_USER[];
  ariaLabel: string;
}) {
  return (
    <div
      className={styles['access-tab__user-field']}
      role="combobox"
      aria-label={ariaLabel}
      aria-expanded={false}
    >
      <div className={styles['access-tab__user-tags']}>
        {users.map((user) => (
          <Chip
            key={user.username}
            size="Medium"
            leadingAvatar={{ src: user.avatarSrc, alt: user.username }}
            onRemove={() => {}}
            removeLabel={`Remove ${user.username}`}
          >
            {user.username}
          </Chip>
        ))}
      </div>
      <span className={styles['access-tab__user-chevron']} aria-hidden>
        <Icon size="16" glyph={<ChevronDownIcon />} />
      </span>
    </div>
  );
}

export interface AccessTabProps {
  entityLabel?: 'agent' | 'automation';
}

export default function AccessTab({ entityLabel = 'agent' }: AccessTabProps) {
  const [channelAccess, setChannelAccess] = useState<ChannelAccess>('all');
  const [userVisibility, setUserVisibility] =
    useState<UserVisibility>('private');
  const adminsLabel =
    entityLabel === 'automation' ? 'Automation admins' : 'Agent admins';

  return (
    <div className={styles['access-tab']}>
      <SettingsSectionRow
        label="Channel access"
        labelAs="h3"
        divided
        fieldsGap="m"
      >
        <Select
          aria-label="Channel access"
          value={channelAccess}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setChannelAccess(e.target.value as ChannelAccess)
          }
        >
          {CHANNEL_ACCESS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <SettingsHelpText>
          Control which channels this agent can be mentioned in.
        </SettingsHelpText>
      </SettingsSectionRow>

      <SettingsSectionRow
        label="User access"
        labelAs="h3"
        divided
        fieldsGap="m"
      >
        <div
          className={styles['access-tab__visibility']}
          role="radiogroup"
          aria-label="User access"
        >
          {USER_VISIBILITY_OPTIONS.map((option) => {
            const selected = userVisibility === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={[
                  styles['access-tab__visibility-card'],
                  selected
                    ? styles['access-tab__visibility-card--selected']
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setUserVisibility(option.value)}
              >
                <span
                  className={[
                    styles['access-tab__visibility-icon'],
                    selected
                      ? styles['access-tab__visibility-icon--selected']
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden
                >
                  <Icon size="24" glyph={option.icon} />
                </span>
                <span className={styles['access-tab__visibility-copy']}>
                  <span className={styles['access-tab__visibility-title']}>
                    {option.title}
                  </span>
                  <span className={styles['access-tab__visibility-description']}>
                    {option.description}
                  </span>
                </span>
                {selected ? (
                  <span
                    className={styles['access-tab__visibility-check']}
                    aria-hidden
                  >
                    <Icon size="20" glyph={<CheckCircleIcon />} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {userVisibility === 'private' ? (
          <div className={styles['access-tab__subfield']}>
            <h4 className={styles['access-tab__subfield-label']}>Allow list</h4>
            <AccessUserField
              users={[ACCESS_USER]}
              ariaLabel="Users allowed to interact with this agent"
            />
            <SettingsHelpText>
              Enter users who can interact with this agent
            </SettingsHelpText>
          </div>
        ) : null}
      </SettingsSectionRow>

      <SettingsSectionRow
        label={adminsLabel}
        labelAs="h3"
        divided
        fieldsGap="m"
      >
        <AccessUserField users={[ACCESS_USER]} ariaLabel={adminsLabel} />
        <SettingsHelpText>
          {entityLabel === 'automation'
            ? 'These users can edit and delete this automation. The automation creator is always an admin.'
            : 'These users can edit and delete this agent. The agent creator is always an admin.'}
        </SettingsHelpText>
      </SettingsSectionRow>
    </div>
  );
}
