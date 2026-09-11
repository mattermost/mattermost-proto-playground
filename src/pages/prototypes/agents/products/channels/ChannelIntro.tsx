import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import LockIcon from '@mattermost/compass-icons/components/lock';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import privateChannelIntroSrc from '@/assets/illustrations/private-channel-intro.svg';
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
      <img
        className={styles['channel-intro__illustration']}
        src={privateChannelIntroSrc}
        alt=""
        aria-hidden
      />
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
          <button type="button" className={styles['channel-intro__action']}>
            <Icon glyph={<AccountPlusOutlineIcon />} size="20" />
            Add people
          </button>
          <button type="button" className={styles['channel-intro__action']}>
            <Icon glyph={<PencilOutlineIcon />} size="20" />
            Set header
          </button>
          <button type="button" className={styles['channel-intro__action']}>
            <Icon glyph={<BellOutlineIcon />} size="20" />
            Notifications
          </button>
        </div>
      </div>
    </div>
  );
}
