import ServerOutlineIcon from '@mattermost/compass-icons/components/server-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import StatusPill from '../_components/StatusPill';
import styles from './MyChannelsTab.module.scss';

export interface MyChannelsTabProps {
  /** Called when the user clicks "Create Program-Protected Channel". */
  onCreateChannel: () => void;
  /** Called when the user clicks "Manage" on a channel row. */
  onManageChannel: (channelName: string) => void;
}

interface ChannelEntry {
  name: string;
  members: number;
  lastActivity: string;
}

const CHANNELS: ChannelEntry[] = [
  { name: 'operations-alpha', members: 5, lastActivity: '2 min ago' },
  { name: 'project-midnight', members: 3, lastActivity: '15 min ago' },
];

/**
 * My Channels tab body (State 3). Renders a program group header with
 * a connected pill, two protected channel rows, and a centered footer
 * CTA that advances to the Create Channel flow.
 */
export default function MyChannelsTab({
  onCreateChannel,
  onManageChannel,
}: MyChannelsTabProps) {
  return (
    <div className={styles['my-channels-tab']}>
      <div className={styles['my-channels-tab__group-header']}>
        <ServerOutlineIcon size={14} aria-hidden />
        <span className={styles['my-channels-tab__group-name']}>
          Program Alpha
        </span>
        <StatusPill label="Connected" tone="success" />
      </div>

      <div className={styles['my-channels-tab__list']}>
        {CHANNELS.map((channel) => (
          <div key={channel.name} className={styles['my-channels-tab__row']}>
            <div className={styles['my-channels-tab__row-info']}>
              <ShieldOutlineIcon size={14} aria-hidden />
              <span>{channel.name}</span>
            </div>
            <div className={styles['my-channels-tab__row-meta']}>
              <span className={styles['my-channels-tab__row-meta-item']}>
                <AccountMultipleOutlineIcon size={14} aria-hidden />
                {channel.members} members
              </span>
              <span>Active</span>
              <span>Last activity: {channel.lastActivity}</span>
            </div>
            <Button
              size="Small"
              emphasis="Quaternary"
              onClick={() => onManageChannel(channel.name)}
            >
              Manage
            </Button>
          </div>
        ))}
      </div>

      <div className={styles['my-channels-tab__footer']}>
        <Button
          emphasis="Primary"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          onClick={onCreateChannel}
        >
          Create Program-Protected Channel
        </Button>
      </div>
    </div>
  );
}
