import { useState } from 'react';
import {
  ChannelsSidebarCategory,
  ChannelsSidebarHeader,
  ChannelsSidebarNavigator,
  channelsSidebarStyles,
} from '@mattermost/compass-proto';
import { ChannelSidebarItem } from '@mattermost/compass-ui/components/channel-sidebar-item';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import HomeVariantOutlineIcon from '@mattermost/compass-icons/components/home-variant-outline';
import LayersOutlineIcon from '@mattermost/compass-icons/components/layers-outline';
import { HealthDot } from './HealthDot';
import jthomasAvatar from '../assets/avatars/jthomas.png';
import {
  INC_1294_CHANNEL,
  OTHER_SPACES,
  SPACE,
  SPACE_CHANNELS,
  type Health,
} from '../spacesData';
import styles from './SpacesSidebar.module.scss';

export type SidebarTarget = 'day' | 'space' | `channel:${string}`;

export interface SpacesSidebarProps {
  active: SidebarTarget;
  onNavigate: (target: SidebarTarget) => void;
  spaceHealth: Health;
  needsAttention: number;
  inc1294Joined: boolean;
  /** Before the Space exists (Open a Space scene). */
  spaceExists: boolean;
}

/**
 * Channels sidebar with a Spaces category. Built from the proto sidebar parts
 * because the model-driven `ChannelsSidebar` can't show a health dot or nest
 * a Space's channels under it.
 */
export function SpacesSidebar({
  active,
  onNavigate,
  spaceHealth,
  needsAttention,
  inc1294Joined,
  spaceExists,
}: SpacesSidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const channels = inc1294Joined
    ? [...SPACE_CHANNELS, INC_1294_CHANNEL]
    : SPACE_CHANNELS;

  return (
    <div className={channelsSidebarStyles['channels-sidebar']}>
      <ChannelsSidebarHeader teamName="Cyber Defense HQ" />
      <ChannelsSidebarNavigator />

      <div className={channelsSidebarStyles['channels-sidebar__top-group']}>
        <ChannelSidebarItem
          name="Start your day"
          leadingVisual={<Icon glyph={<HomeVariantOutlineIcon />} />}
          active={active === 'day'}
          status="mention"
          mentionCount={4}
          hideMenu
          onClick={() => onNavigate('day')}
        />
        <ChannelSidebarItem name="Threads" leadingVisual="threads" hideMenu />
        <ChannelSidebarItem name="Drafts" leadingVisual="drafts" hideMenu />
      </div>

      <div className={channelsSidebarStyles['channels-sidebar__scroll-view']}>
        <Scrollbar color="--sidebar-text-rgb">
          <div
            className={
              channelsSidebarStyles['channels-sidebar__channel-groups']
            }
          >
            <div
              className={
                channelsSidebarStyles['channels-sidebar__channel-group']
              }
            >
              <ChannelsSidebarCategory label="Spaces" showPlusButton />
              {spaceExists ? (
                <>
                  <ChannelSidebarItem
                    name={SPACE.shortName}
                    leadingVisual={<Icon glyph={<LayersOutlineIcon />} />}
                    trailingVisual={<HealthDot health={spaceHealth} />}
                    status={needsAttention > 0 ? 'mention' : 'read'}
                    mentionCount={needsAttention}
                    formatMentionLabel={(n) => `${n} need attention`}
                    active={active === 'space'}
                    onClick={() => onNavigate('space')}
                    expanded={expanded}
                    onExpandedChange={setExpanded}
                    controlsId="space-channels"
                    toggleLabel="Show channels in this Space"
                  />
                  <div
                    id="space-channels"
                    className={`${styles['spaces-sidebar']} ${
                      expanded ? styles['spaces-sidebar--expanded'] : ''
                    }`}
                    aria-hidden={!expanded}
                  >
                    <div className={styles['spaces-sidebar__children']}>
                      {channels.map((c) => (
                        <ChannelSidebarItem
                          key={c.name}
                          className={`${styles['spaces-sidebar__child']} ${
                            c.origin === 'auto'
                              ? styles['spaces-sidebar__child--new']
                              : ''
                          }`}
                          name={c.name}
                          leadingVisual={c.type}
                          status={
                            c.mentions
                              ? 'mention'
                              : c.unread
                                ? 'unread'
                                : 'read'
                          }
                          mentionCount={c.mentions}
                          active={active === `channel:${c.name}`}
                          onClick={() => onNavigate(`channel:${c.name}`)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
              {OTHER_SPACES.map((s) => (
                <ChannelSidebarItem
                  key={s.name}
                  name={s.name}
                  leadingVisual={<Icon glyph={<LayersOutlineIcon />} />}
                  trailingVisual={<HealthDot health={s.health} />}
                />
              ))}
            </div>

            <div
              className={
                channelsSidebarStyles['channels-sidebar__channel-group']
              }
            >
              <ChannelsSidebarCategory label="Channels" showPlusButton />
              <ChannelSidebarItem
                name="security-alerts"
                leadingVisual="public"
                status="unread"
              />
              <ChannelSidebarItem
                name="incident-status-updates"
                leadingVisual="public"
              />
              <ChannelSidebarItem name="ask-it" leadingVisual="public" />
              <ChannelSidebarItem name="town-square" leadingVisual="public" />
              <ChannelSidebarItem name="off-topic" leadingVisual="public" />
            </div>

            <div
              className={
                channelsSidebarStyles['channels-sidebar__channel-group']
              }
            >
              <ChannelsSidebarCategory label="Direct messages" showPlusButton />
              <ChannelSidebarItem
                name="Jackson Thomas"
                leadingVisual="direct-message"
                avatarSrc={jthomasAvatar}
                avatarAlt="Jackson Thomas"
                status="mention"
                mentionCount={1}
              />
            </div>
          </div>
        </Scrollbar>
      </div>
    </div>
  );
}
