import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import ChannelSidebarItem from '@/components/ui/ChannelSidebarItem/ChannelSidebarItem';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import { sidebarAvatars } from '../shared/fixtures';
import PBEChannelRow from './PBEChannelRow';
import styles from './PBESidebar.module.scss';

export interface PBESidebarProps {
  /** The currently active PBE channel name. */
  activeChannel?: string;
  /** Optional click handler when a PBE channel is clicked. */
  onPBEChannelClick?: (name: string) => void;
}

function SidebarHeader() {
  return (
    <div className={styles['pbe-sidebar__header']}>
      <button
        type="button"
        className={styles['pbe-sidebar__team-dropdown']}
        aria-label="Team menu"
      >
        <span className={styles['pbe-sidebar__team-name']}>Contributors</span>
        <span className={styles['pbe-sidebar__team-chevron']} aria-hidden>
          <ChevronDownIcon size={16} />
        </span>
      </button>
      <IconButton
        aria-label="Add channels"
        size="Small"
        style="Inverted"
        padding="Compact"
        rounded
        icon={<Icon size="16" glyph={<PlusIcon />} />}
      />
    </div>
  );
}

function SidebarNavigator() {
  return (
    <div className={styles['pbe-sidebar__navigator']}>
      <IconButton
        aria-label="Filter channels"
        size="Small"
        style="Inverted"
        padding="Compact"
        icon={<Icon size="16" glyph={<FilterVariantIcon />} />}
      />
      <div className={styles['pbe-sidebar__find-channels']}>
        <span className={styles['pbe-sidebar__find-channels-icon']} aria-hidden>
          <MagnifyIcon size={16} />
        </span>
        <span className={styles['pbe-sidebar__find-channels-label']}>
          Find channels
        </span>
      </div>
    </div>
  );
}

function CategoryHeader({
  label,
  showAdd = false,
}: {
  label: string;
  showAdd?: boolean;
}) {
  return (
    <div className={styles['pbe-sidebar__category']}>
      <div className={styles['pbe-sidebar__category-left']}>
        <span
          className={styles['pbe-sidebar__category-chevron']}
          aria-hidden
        >
          <ChevronDownIcon size={12} />
        </span>
        <span className={styles['pbe-sidebar__category-label']}>{label}</span>
      </div>
      {showAdd && (
        <IconButton
          aria-label={`New ${label.toLowerCase()}`}
          size="X-Small"
          style="Inverted"
          icon={<Icon size="12" glyph={<PlusIcon />} />}
        />
      )}
    </div>
  );
}

/**
 * Channel sidebar for the PBE prototype. The Program-Protected category
 * uses page-local `PBEChannelRow` because the dest `ChannelSidebarItem`
 * has no shield leading-visual variant (gap G1). All other rows compose
 * the dest `ChannelSidebarItem`.
 */
export default function PBESidebar({
  activeChannel = 'operations-alpha',
  onPBEChannelClick,
}: PBESidebarProps) {
  return (
    <div className={styles['pbe-sidebar']}>
      <SidebarHeader />
      <SidebarNavigator />

      <div className={styles['pbe-sidebar__top-group']}>
        <ChannelSidebarItem name="Threads" leadingVisual="Threads" />
        <ChannelSidebarItem
          name="Drafts"
          leadingVisual="Drafts"
          status="Mention"
          mentionCount={1}
        />
      </div>

      <div className={styles['pbe-sidebar__scroll']}>
        <div className={styles['pbe-sidebar__channel-groups']}>
          {/* PROGRAM-PROTECTED — page-local rows due to shield icon */}
          <div className={styles['pbe-sidebar__channel-group']}>
            <CategoryHeader label="PROGRAM-PROTECTED" />
            <PBEChannelRow
              name="operations-alpha"
              active={activeChannel === 'operations-alpha'}
              onClick={() => onPBEChannelClick?.('operations-alpha')}
            />
            <PBEChannelRow
              name="project-midnight"
              unread
              mentionCount={2}
              active={activeChannel === 'project-midnight'}
              onClick={() => onPBEChannelClick?.('project-midnight')}
            />
          </div>

          <div className={styles['pbe-sidebar__channel-group']}>
            <CategoryHeader label="FAVORITES" />
            <ChannelSidebarItem name="UI Redesign" leadingVisual="Public" />
            <ChannelSidebarItem name="UX Design" leadingVisual="Public" />
          </div>

          <div className={styles['pbe-sidebar__channel-group']}>
            <CategoryHeader label="CHANNELS" />
            <ChannelSidebarItem name="Contributors" leadingVisual="Public" />
            <ChannelSidebarItem name="Developers" leadingVisual="Public" />
            <ChannelSidebarItem
              name="Orion"
              leadingVisual="Public"
              status="Unread"
            />
            <ChannelSidebarItem
              name="Release Discussion"
              leadingVisual="Public"
              status="Unread"
            />
            <ChannelSidebarItem
              name="Security Incident"
              leadingVisual="Public"
            />
            <ChannelSidebarItem name="System Status" leadingVisual="Private" />
            <ChannelSidebarItem
              name="Product Support"
              leadingVisual="Private"
            />
          </div>

          <div className={styles['pbe-sidebar__channel-group']}>
            <CategoryHeader label="DIRECT MESSAGES" showAdd />
            <ChannelSidebarItem
              name="Aiko Tan"
              leadingVisual="Direct Message"
              avatarSrc={sidebarAvatars.aikoTan}
              avatarAlt="Aiko Tan"
              showAvatarStatus
            />
            <ChannelSidebarItem
              name="Arjun Patel"
              leadingVisual="Direct Message"
              status="Mention"
              mentionCount={1}
              avatarSrc={sidebarAvatars.arjunPatel}
              avatarAlt="Arjun Patel"
              showAvatarStatus
            />
            <ChannelSidebarItem
              name="Daniel Okoro"
              leadingVisual="Direct Message"
              avatarSrc={sidebarAvatars.danielOkoro}
              avatarAlt="Daniel Okoro"
              showAvatarStatus
            />
            <ChannelSidebarItem
              name="Darius Cole"
              leadingVisual="Direct Message"
              avatarSrc={sidebarAvatars.dariusCole}
              avatarAlt="Darius Cole"
              showAvatarStatus
            />
            <ChannelSidebarItem
              name="Emma Novak"
              leadingVisual="Direct Message"
              avatarSrc={sidebarAvatars.emmaNovak}
              avatarAlt="Emma Novak"
              showAvatarStatus
            />
          </div>
        </div>
      </div>
    </div>
  );
}
