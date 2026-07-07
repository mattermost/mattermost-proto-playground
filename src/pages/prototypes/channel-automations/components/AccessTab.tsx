import { Chip, Icon, Radio } from '@mattermost/compass-ui';
import { useId, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import styles from './AccessTab.module.scss';

type ChannelAccess = 'all' | 'allow-selected' | 'block-selected' | 'block-all';
type UserAccess = 'all' | 'allow-selected' | 'block-selected';

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

const USER_ACCESS_OPTIONS: { value: UserAccess; label: string }[] = [
  { value: 'all', label: 'Allow for all users' },
  { value: 'allow-selected', label: 'Allow for selected users' },
  { value: 'block-selected', label: 'Block selected users' },
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

export default function AccessTab() {
  const id = useId().replace(/\W/g, '');
  const [channelAccess, setChannelAccess] = useState<ChannelAccess>('all');
  const [userAccess, setUserAccess] = useState<UserAccess>('allow-selected');

  return (
    <div className={styles['access-tab']}>
      <section className={styles['access-tab__setting']}>
        <h3 className={styles['access-tab__setting-label']}>Channel access</h3>
        <div className={styles['access-tab__setting-fields']}>
          <div className={styles['access-tab__radio-group']}>
            {CHANNEL_ACCESS_OPTIONS.map((option) => (
              <Radio
                key={option.value}
                name={`${id}-channel-access`}
                value={option.value}
                size="Medium"
                checked={channelAccess === option.value}
                onChange={() => setChannelAccess(option.value)}
              >
                {option.label}
              </Radio>
            ))}
          </div>
          <p className={styles['access-tab__help']}>
            Control which channels this agent can be mentioned in.
          </p>
        </div>
      </section>

      <section className={styles['access-tab__setting']}>
        <h3 className={styles['access-tab__setting-label']}>User access</h3>
        <div className={styles['access-tab__setting-fields']}>
          <div className={styles['access-tab__radio-group']}>
            {USER_ACCESS_OPTIONS.map((option) => (
              <Radio
                key={option.value}
                name={`${id}-user-access`}
                value={option.value}
                size="Medium"
                checked={userAccess === option.value}
                onChange={() => setUserAccess(option.value)}
              >
                {option.label}
              </Radio>
            ))}
          </div>

          {userAccess === 'allow-selected' ? (
            <div className={styles['access-tab__subfield']}>
              <h4 className={styles['access-tab__subfield-label']}>Allow list</h4>
              <AccessUserField
                users={[ACCESS_USER]}
                ariaLabel="Users allowed to interact with this agent"
              />
              <p className={styles['access-tab__help']}>
                Enter users to allow for this bot
              </p>
            </div>
          ) : null}

          <p className={styles['access-tab__help']}>
            Control which users can interact with this agent.
          </p>
        </div>
      </section>

      <section className={styles['access-tab__setting']}>
        <h3 className={styles['access-tab__setting-label']}>Agent admins</h3>
        <div className={styles['access-tab__setting-fields']}>
          <AccessUserField
            users={[ACCESS_USER]}
            ariaLabel="Agent admins"
          />
          <p className={styles['access-tab__help']}>
            These users can edit and delete this agent. The agent creator is always
            an admin.
          </p>
        </div>
      </section>
    </div>
  );
}
