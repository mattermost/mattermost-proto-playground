import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockIcon from '@mattermost/compass-icons/components/lock';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import { ActionButton } from '@mattermost/compass-ui/components/action-button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Illustration } from '@mattermost/compass-ui/components/illustration';
import PrivateChannelIntro from '@/assets/illustrations/private-channel-intro.svg?react';
import PublicChannelIntro from '@/assets/illustrations/public-channel-intro.svg?react';
import styles from './ChannelIntro.module.scss';

type Props = {
  name: string;
  createdBy: string;
  createdAt: string;
  description: string;
  variant?: 'private' | 'public';
};

export default function ChannelIntro({ name, createdBy, createdAt, description, variant = 'private' }: Props) {
  const isPublic = variant === 'public';
  return (
    <div className={styles['channel-intro']}>
      <Illustration width="130px" height="102px" aria-label="">
        {isPublic ? <PublicChannelIntro /> : <PrivateChannelIntro />}
      </Illustration>
      <div className={styles['channel-intro__body']}>
        <div className={styles['channel-intro__info']}>
          <h2 className={styles['channel-intro__name']}>{name}</h2>
          <div className={styles['channel-intro__meta']}>
            <Icon glyph={isPublic ? <GlobeIcon /> : <LockIcon />} size="12" />
            {isPublic ? 'Public' : 'Private'} channel created by {createdBy} {createdAt}
          </div>
          <p className={styles['channel-intro__description']}>{description}</p>
        </div>
        <div className={styles['channel-intro__actions']}>
          <ActionButton icon={<Icon glyph={<AccountPlusOutlineIcon />} size="20" />} label="Add people" />
          <ActionButton icon={<Icon glyph={<PencilOutlineIcon />} size="20" />} label="Set header" />
          <ActionButton icon={<Icon glyph={<BellOutlineIcon />} size="20" />} label="Notifications" />
        </div>
      </div>
    </div>
  );
}
