import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import LockIcon from '@mattermost/compass-icons/components/lock';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import { ActionButton } from '@mattermost/compass-ui/components/action-button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Illustration } from '@mattermost/compass-ui/components/illustration';
import PrivateChannelIntro from '@/assets/illustrations/private-channel-intro.svg?react';
import styles from './ChannelIntro.module.scss';

type Props = {
  name: string;
  createdBy: string;
  createdAt: string;
  description: string;
};

export default function ChannelIntro({ name, createdBy, createdAt, description }: Props) {
  return (
    <div className={styles['channel-intro']}>
      <Illustration width="130px" height="102px" aria-label="">
        <PrivateChannelIntro />
      </Illustration>
      <div className={styles['channel-intro__body']}>
        <div className={styles['channel-intro__info']}>
          <h2 className={styles['channel-intro__name']}>{name}</h2>
          <p className={styles['channel-intro__meta']}>
            <Icon glyph={<LockIcon />} size="12" />
            Private channel created by {createdBy} {createdAt}
          </p>
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
