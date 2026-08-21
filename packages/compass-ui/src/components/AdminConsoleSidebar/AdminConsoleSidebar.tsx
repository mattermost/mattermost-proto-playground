import { type ReactNode, useId } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import CreditCardOutlineIcon from '@mattermost/compass-icons/components/credit-card-outline';
import ChartLineIcon from '@mattermost/compass-icons/components/chart-line';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import ServerOutlineIcon from '@mattermost/compass-icons/components/server-outline';
import TuneIcon from '@mattermost/compass-icons/components/tune';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import AppsIcon from '@mattermost/compass-icons/components/apps';
import WebhookIcon from '@mattermost/compass-icons/components/webhook';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import FlaskOutlineIcon from '@mattermost/compass-icons/components/flask-outline';
import ChannelSidebarItem from '@/components/ChannelSidebarItem/ChannelSidebarItem';
import { ChannelsSidebarCategory } from '@/components/ChannelsSidebar/ChannelsSidebar';
import Scrollbar from '@/components/Scrollbar/Scrollbar';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import {
  type AdminConsoleSidebarCategoryIconKey,
  type AdminConsoleSidebarGroupModel,
} from './adminConsoleSidebarModel';
import styles from './AdminConsoleSidebar.module.scss';

const CATEGORY_ICON_GLYPHS: Record<
  AdminConsoleSidebarCategoryIconKey,
  ReactNode
> = {
  billing: <CreditCardOutlineIcon size={12} />,
  reporting: <ChartLineIcon size={12} />,
  users: <AccountMultipleOutlineIcon size={12} />,
  environment: <ServerOutlineIcon size={12} />,
  site: <TuneIcon size={12} />,
  authentication: <ShieldOutlineIcon size={12} />,
  plugins: <AppsIcon size={12} />,
  integrations: <WebhookIcon size={12} />,
  compliance: <FileTextOutlineIcon size={12} />,
  experimental: <FlaskOutlineIcon size={12} />,
};

function categoryLeadingIcon(
  key: AdminConsoleSidebarCategoryIconKey,
): ReactNode {
  return CATEGORY_ICON_GLYPHS[key];
}

export interface AdminConsoleSidebarProps {
  consoleTitle?: string;
  userHandle?: string;
  /** Used for avatar initials when `avatarSrc` is empty. */
  userDisplayName?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  groups?: AdminConsoleSidebarGroupModel[];
}

export default function AdminConsoleSidebar({
  consoleTitle = 'Admin Console',
  userHandle = '@leonard.riley',
  userDisplayName = 'Leonard Riley',
  avatarSrc = '',
  avatarAlt = 'Account avatar',
  groups = [],
}: AdminConsoleSidebarProps) {
  const findSettingsId = useId();
  return (
    <div className={styles['admin-console-sidebar']}>
      <div className={styles['admin-console-sidebar__header']}>
        <div className={styles['admin-console-sidebar__identity']}>
          <UserAvatar
            src={avatarSrc}
            alt={avatarAlt}
            name={userDisplayName}
            size="40"
          />
          <div className={styles['admin-console-sidebar__identity-text']}>
            <div className={styles['admin-console-sidebar__title-row']}>
              <span className={styles['admin-console-sidebar__title']}>
                {consoleTitle}
              </span>
              <span className={styles['admin-console-sidebar__title-chevron']}>
                <ChevronDownIcon size={16} />
              </span>
            </div>
            <div className={styles['admin-console-sidebar__handle']}>
              {userHandle}
            </div>
          </div>
        </div>
        <label
          className={styles['admin-console-sidebar__find']}
          htmlFor={findSettingsId}
        >
          <span className={styles['admin-console-sidebar__find-icon']} aria-hidden>
            <MagnifyIcon size={12} />
          </span>
          <input
            id={findSettingsId}
            type="search"
            className={styles['admin-console-sidebar__find-field']}
            placeholder="Find settings"
            aria-label="Find settings"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
          />
        </label>
      </div>

      <div className={styles['admin-console-sidebar__scroll']}>
        <Scrollbar color="--sidebar-text-rgb">
          <div className={styles['admin-console-sidebar__nav']}>
            {groups.map((group) => (
              <div
                key={group.key}
                className={styles['admin-console-sidebar__group']}
              >
                <ChannelsSidebarCategory
                  label={group.categoryLabel}
                  showChevron={false}
                  leadingIcon={categoryLeadingIcon(group.categoryIconKey)}
                  sticky={group.stickyCategory}
                  opaqueCategory
                />
                {group.items.map((row, index) => (
                  <ChannelSidebarItem
                    key={`${group.key}-${index}-${row.name}`}
                    name={row.name}
                    hideLeadingVisual
                    active={row.active}
                    status="Read"
                  />
                ))}
              </div>
            ))}
          </div>
        </Scrollbar>
      </div>
    </div>
  );
}
