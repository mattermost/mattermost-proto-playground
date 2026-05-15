import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import CalendarMonthOutlineIcon from '@mattermost/compass-icons/components/calendar-month-outline';
import CheckboxMultipleMarkedOutlineIcon from '@mattermost/compass-icons/components/checkbox-multiple-marked-outline';
import GithubCircleIcon from '@mattermost/compass-icons/components/github-circle';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import ApplicationCogIcon from '@mattermost/compass-icons/components/application-cog';
import ProductChannelsIcon from '@mattermost/compass-icons/components/product-channels';
import ProductPlaybooksIcon from '@mattermost/compass-icons/components/product-playbooks';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import WebhookIcon from '@mattermost/compass-icons/components/webhook';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import AppsIcon from '@mattermost/compass-icons/components/apps';
import DownloadOutlineIcon from '@mattermost/compass-icons/components/download-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import GlobalHeader from '@/components/ui/GlobalHeader/GlobalHeader';
import TeamSidebar from '@/components/ui/TeamSidebar/TeamSidebar';
import AppBarItem from '@/components/ui/AppBarItem/AppBarItem';
import Icon from '@/components/ui/Icon/Icon';
import PopoverMenu, { PopoverMenuDivider } from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { usePopoverTransition } from '@/hooks/usePopoverTransition';
import PBESidebar from './PBESidebar';
import { avatars, teams } from '../shared/fixtures';
import styles from './PBEChrome.module.scss';

export interface PBEChromeProps {
  /** The currently active PBE channel name, used to highlight the sidebar row. */
  activeChannel?: string;
  /** Children render in the center column. */
  children: ReactNode;
  /** Optional right rail content (RHS). When provided, the AppBar is hidden. */
  rightRail?: ReactNode;
  /** Called when the user picks the Encryption Management item from the product switcher. */
  onOpenEncryptionManagement?: () => void;
}

function AppBar() {
  return (
    <div className={styles['pbe-chrome__app-bar']}>
      <AppBarItem
        label="Boards"
        icon={<Icon size="20" glyph={<CheckboxMultipleMarkedOutlineIcon />} />}
      />
      <AppBarItem
        label="Mattermost AI"
        icon={<Icon size="20" glyph={<CreationOutlineIcon />} />}
      />
      <AppBarItem
        label="Calendar"
        icon={<Icon size="20" glyph={<CalendarMonthOutlineIcon />} />}
      />
      <AppBarItem
        label="GitHub"
        icon={<Icon size="20" glyph={<GithubCircleIcon />} />}
        unreadBadge
      />
      <AppBarItem
        label="Integrations"
        icon={<Icon size="20" glyph={<ApplicationCogIcon />} />}
      />
      <AppBarItem
        label="Zoom"
        icon={<Icon size="20" glyph={<VideoOutlineIcon />} />}
      />
    </div>
  );
}

/**
 * Product switcher popover anchored to the waffle button baked into
 * `GlobalHeader`. The waffle is rendered by GlobalHeader itself; this
 * component overlays a transparent click target at the same location
 * to open the menu without modifying the shared component.
 *
 * Menu items mirror the canonical Figma list (PBE file, node `4283:19492`):
 * top product group (Channels active, Agents, Playbooks), then a divider,
 * then the secondary group (System console, Encryption Management,
 * Integrations, User Groups, App Marketplace, Download apps, About).
 */
function ProductSwitcher({
  onOpenEncryptionManagement,
}: {
  onOpenEncryptionManagement?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { mounted, visible } = usePopoverTransition(open);
  useOutsideClose(containerRef, open, () => setOpen(false));

  const close = () => setOpen(false);
  const select = (fn?: () => void) => {
    close();
    fn?.();
  };

  return (
    <div className={styles['pbe-chrome__switcher']} ref={containerRef}>
      <button
        type="button"
        className={styles['pbe-chrome__switcher-trigger']}
        aria-label="Open product switcher"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((p) => !p)}
      />
      {mounted && (
        <div
          className={[
            styles['pbe-chrome__switcher-popover'],
            visible ? styles['pbe-chrome__switcher-popover--visible'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <PopoverMenu role="menu" aria-label="Mattermost products">
            <MenuItem
              role="menuitem"
              label="Channels"
              leadingVisual={
                <Icon size="16" glyph={<ProductChannelsIcon />} />
              }
              trailingElement
              onClick={() => select()}
            />
            <MenuItem
              role="menuitem"
              label="Agents"
              leadingVisual={
                <Icon size="16" glyph={<CreationOutlineIcon />} />
              }
              onClick={() => select()}
            />
            <MenuItem
              role="menuitem"
              label="Playbooks"
              leadingVisual={
                <Icon size="16" glyph={<ProductPlaybooksIcon />} />
              }
              onClick={() => select()}
            />
            <PopoverMenuDivider />
            <MenuItem
              role="menuitem"
              label="System console"
              leadingVisual={
                <Icon size="16" glyph={<ApplicationCogIcon />} />
              }
              onClick={() => select()}
            />
            <MenuItem
              role="menuitem"
              label="Encryption Management"
              leadingVisual={<Icon size="16" glyph={<ShieldOutlineIcon />} />}
              onClick={() => select(onOpenEncryptionManagement)}
            />
            <MenuItem
              role="menuitem"
              label="Integrations"
              leadingVisual={<Icon size="16" glyph={<WebhookIcon />} />}
              onClick={() => select()}
            />
            <MenuItem
              role="menuitem"
              label="User Groups"
              leadingVisual={
                <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
              }
              onClick={() => select()}
            />
            <MenuItem
              role="menuitem"
              label="App Marketplace"
              leadingVisual={<Icon size="16" glyph={<AppsIcon />} />}
              onClick={() => select()}
            />
            <MenuItem
              role="menuitem"
              label="Download apps"
              leadingVisual={<Icon size="16" glyph={<DownloadOutlineIcon />} />}
              onClick={() => select()}
            />
            <MenuItem
              role="menuitem"
              label="About Mattermost"
              leadingVisual={
                <Icon size="16" glyph={<InformationOutlineIcon />} />
              }
              onClick={() => select()}
            />
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}

/**
 * Full Mattermost chrome for PBE prototype screens — global header,
 * team sidebar, PBE-aware channels sidebar, center content slot, and
 * either an App Bar or a custom right rail.
 */
export default function PBEChrome({
  activeChannel = 'operations-alpha',
  children,
  rightRail,
  onOpenEncryptionManagement,
}: PBEChromeProps) {
  return (
    <div className={styles['pbe-chrome']}>
      <div className={styles['pbe-chrome__header-row']}>
        <GlobalHeader
          userAvatarSrc={avatars.currentUser}
          userAvatarAlt="Current user"
        />
        <ProductSwitcher
          onOpenEncryptionManagement={onOpenEncryptionManagement}
        />
      </div>
      <div className={styles['pbe-chrome__body']}>
        <TeamSidebar teams={teams} activeTeamId="contributors" />
        <PBESidebar activeChannel={activeChannel} />
        <div className={styles['pbe-chrome__center']}>{children}</div>
        {rightRail ?? <AppBar />}
      </div>
    </div>
  );
}
