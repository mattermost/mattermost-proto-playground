import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import PinOutlineIcon from '@mattermost/compass-icons/components/pin-outline';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import RightSidebar from '@/components/ui/RightSidebar';
import RightSidebarHeader from '@/components/ui/RightSidebarHeader';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import Post from '@/components/ui/Post/Post';
import Divider from '@/components/ui/Divider/Divider';
import ActionButton from '@/components/ui/ActionButton/ActionButton';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import Icon from '@/components/ui/Icon/Icon';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import styles from '@/styles/library-demo/patterns.module.scss';

function ChannelInfoBody() {
  return (
    <>
      <div className={styles['patterns__rsb-info-actions']}>
        <ActionButton
          className={styles['patterns__rsb-info-action']}
          icon={<Icon size="20" glyph={<StarOutlineIcon />} />}
          label="Favorite"
        />
        <ActionButton
          className={styles['patterns__rsb-info-action']}
          icon={<Icon size="20" glyph={<BellOutlineIcon />} />}
          label="Mute"
        />
        <ActionButton
          className={styles['patterns__rsb-info-action']}
          icon={<Icon size="20" glyph={<AccountPlusOutlineIcon />} />}
          label="Add people"
        />
        <ActionButton
          className={styles['patterns__rsb-info-action']}
          icon={<Icon size="20" glyph={<LinkVariantIcon />} />}
          label="Copy Link"
        />
      </div>

      <div className={styles['patterns__rsb-info-about']}>
        <h3 className={styles['patterns__rsb-info-name']}>UX Design</h3>

        <div className={styles['patterns__rsb-info-group']}>
          <span className={styles['patterns__rsb-info-group-title']}>
            Channel Purpose
          </span>
          <p className={styles['patterns__rsb-info-body-text']}>
            Discussion of UX by core contributors and staff.
          </p>
        </div>

        <div className={styles['patterns__rsb-info-group']}>
          <span className={styles['patterns__rsb-info-group-title']}>
            Channel Header
          </span>
          <p className={styles['patterns__rsb-info-header-text']}>
            <a href="#">Spec Template</a>
            {' | '}
            <a href="#">UX Guidelines</a>
            {' | '}
            <a href="#">UX Scratch</a>
            {' | '}
            <a href="#">(Internal) UX Folder</a>
            {' | '}
            <a href="#">Design Checklist</a>
            {' | '}
            <a href="#">Design Checklist</a>
            {' | '}
            <a href="#">Design Meeting Notes</a>
            {' | '}
            <a href="#">OKRs…</a>{' '}
            <a href="#" className={styles['patterns__rsb-info-more']}>
              More
            </a>
          </p>
        </div>

        <p className={styles['patterns__rsb-info-id']}>
          ID: ggq4jzr8o386bpqytigtswjfr
        </p>
      </div>

      <Divider />

      <nav className={styles['patterns__rsb-info-menu']}>
        <MenuItem
          label="Channel Settings"
          leadingVisual={<Icon size="16" glyph={<CogOutlineIcon />} />}
        />
        <MenuItem
          label="Notification Preferences"
          leadingVisual={<Icon size="16" glyph={<BellOutlineIcon />} />}
        />
        <MenuItem
          label="Members"
          leadingVisual={
            <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
          }
        />
        <MenuItem
          label="Pinned Messages"
          leadingVisual={<Icon size="16" glyph={<PinOutlineIcon />} />}
        />
        <MenuItem
          label="Files"
          leadingVisual={<Icon size="16" glyph={<FileTextOutlineIcon />} />}
        />
      </nav>
    </>
  );
}

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
          <div className={styles['patterns__rsb-thread']}>
            <Post
              avatarSrc={avatarLeonard}
              avatarAlt="Leonard Riley"
              username="Leonard Riley"
              timestamp="Today at 9:41 AM"
            >
              <p className={styles['patterns__body-text']}>
                Quick gut-check: should the sidebar header always show the
                parent channel as a secondary title, or only when the content is
                scoped to a channel?
              </p>
            </Post>
            <Post
              avatarSrc={avatarAikoTan}
              avatarAlt="Aiko Tan"
              username="Aiko Tan"
              timestamp="Today at 9:48 AM"
            >
              <p className={styles['patterns__body-text']}>
                I'd lean on showing it whenever there's a meaningful parent —
                threads, pinned messages, files. Skip it for global views like
                Saved Messages.
              </p>
            </Post>
            <Post
              avatarSrc={avatarDanielle}
              avatarAlt="Danielle Okoro"
              username="Danielle Okoro"
              timestamp="Today at 9:52 AM"
            >
              <p className={styles['patterns__body-text']}>
                +1. The divider treatment also reads as "scoped to" which
                reinforces the relationship.
              </p>
            </Post>
          </div>
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
          <ChannelInfoBody />
        </RightSidebar>
      </div>
    </>
  );
}
