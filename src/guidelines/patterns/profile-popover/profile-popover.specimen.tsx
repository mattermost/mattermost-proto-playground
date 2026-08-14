import { ProfilePopover } from '@mattermost/compass-ui';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import styles from '@/styles/library-demo/patterns.module.scss';

export default function ProfilePopoverLibrary() {
  return (
    <div className={styles['patterns__profile-popover-demo']}>
      <div>
        <p className={styles['patterns__variant-label']}>Others — full</p>
        <ProfilePopover
          user="Others"
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          name="Leonard Riley"
          username="@leonard.riley"
          title="Lead Engineer, Enterprise"
          email="leonard.riley@acme.com"
          jobRole="System Admin"
          lastOnline="Last online 6 hrs ago"
          staff
          localTime={{
            time: '10:42 PM',
            timezone: 'EST',
            hourDifference: '3 hrs behind',
          }}
          onClose={() => {}}
        />
      </div>
      <div>
        <p className={styles['patterns__variant-label']}>
          Others — with custom status + extras
        </p>
        <ProfilePopover
          user="Others"
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          name="Leonard Riley"
          username="@leonard.riley"
          title="Lead Engineer, Enterprise"
          email="leonard.riley@acme.com"
          jobRole="System Admin"
          lastOnline="Last online 6 hrs ago"
          sharedOrg="Acme Corp."
          staff
          coreCommitter
          githubHandle="lennyriley"
          localTime={{
            time: '10:42 PM',
            timezone: 'EST',
            hourDifference: '3 hrs behind',
          }}
          customStatus={{
            emoji: '📅',
            text: 'In a meeting',
            expiresLabel: 'Until Tomorrow',
          }}
          onClose={() => {}}
        />
      </div>
      <div>
        <p className={styles['patterns__variant-label']}>You</p>
        <ProfilePopover
          user="You"
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          name="Leonard Riley"
          username="@leonard.riley"
          title="Lead Engineer, Enterprise"
          email="leonard.riley@acme.com"
          jobRole="System Admin"
          lastOnline="Last online 6 hrs ago"
          staff
          localTime={{
            time: '10:42 PM',
            timezone: 'EST',
            hourDifference: '3 hrs behind',
          }}
          onClose={() => {}}
        />
      </div>
      <div>
        <p className={styles['patterns__variant-label']}>
          You — with custom status + extras
        </p>
        <ProfilePopover
          user="You"
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          name="Leonard Riley"
          username="@leonard.riley"
          title="Lead Engineer, Enterprise"
          email="leonard.riley@acme.com"
          jobRole="System Admin"
          lastOnline="Last online 6 hrs ago"
          sharedOrg="Dunder Mifflin"
          staff
          coreCommitter
          githubHandle="lennyriley"
          localTime={{
            time: '10:42 PM',
            timezone: 'EST',
            hourDifference: '3 hrs behind',
          }}
          customStatus={{
            emoji: '📅',
            text: 'In a meeting',
            expiresLabel: 'Until Tomorrow',
          }}
          onClose={() => {}}
        />
      </div>
    </div>
  );
}
