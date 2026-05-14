import RightSidebar, {
  RightSidebarChannelInfo,
  RightSidebarHeader,
  RightSidebarThread,
} from '@/components/ui/RightSidebar';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import styles from '@/styles/library-demo/patterns.module.scss';

export default function RightSidebarLibrary() {
  return (
    <>
      <div className={styles['patterns__rsb-header-demo']}>
        <p className={styles['patterns__variant-label']}>Header — default</p>
        <RightSidebarHeader title="Thread" onClose={() => {}} />

        <p className={styles['patterns__variant-label']}>
          Header — with secondary title
        </p>
        <RightSidebarHeader
          title="Thread"
          secondaryTitle="UX Design"
          onClose={() => {}}
        />

        <p className={styles['patterns__variant-label']}>
          Header — with back button
        </p>
        <RightSidebarHeader
          title="Edit Profile"
          secondaryTitle="Account Settings"
          onBack={() => {}}
          onClose={() => {}}
        />

        <p className={styles['patterns__variant-label']}>
          Header — with label tag
        </p>
        <RightSidebarHeader title="Apps" labelTag="BETA" onClose={() => {}} />

        <p className={styles['patterns__variant-label']}>
          Header — with leading avatar + action
        </p>
        <RightSidebarHeader
          title="Leonard Riley"
          leadingIcon={
            <UserAvatar src={avatarLeonard} alt="Leonard Riley" size="24" />
          }
          actionLabel="Follow"
          onActionClick={() => {}}
          onClose={() => {}}
        />

        <p className={styles['patterns__variant-label']}>
          Header — without expand
        </p>
        <RightSidebarHeader title="Saved Messages" onClose={() => {}} />
      </div>

      <p
        className={styles['patterns__variant-label']}
        style={{ marginTop: 'var(--spacing-xl)' }}
      >
        Full sidebar — thread example
      </p>
      <div className={styles['patterns__rsb-shell']}>
        <RightSidebar
          header={
            <RightSidebarHeader
              title="Thread"
              secondaryTitle="UX Design"
              onExpand={() => {}}
              onClose={() => {}}
            />
          }
        >
          <RightSidebarThread />
        </RightSidebar>
      </div>

      <p
        className={styles['patterns__variant-label']}
        style={{ marginTop: 'var(--spacing-xl)' }}
      >
        Full sidebar — flexible body (channel info)
      </p>
      <div className={styles['patterns__rsb-shell']}>
        <RightSidebar
          header={
            <RightSidebarHeader
              title="Info"
              secondaryTitle="UX Design"
              onExpand={() => {}}
              onClose={() => {}}
            />
          }
        >
          <RightSidebarChannelInfo />
        </RightSidebar>
      </div>
    </>
  );
}
