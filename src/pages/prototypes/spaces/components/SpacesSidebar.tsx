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
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import HomeVariantOutlineIcon from '@mattermost/compass-icons/components/home-variant-outline';
import LayersOutlineIcon from '@mattermost/compass-icons/components/layers-outline';
import LockIcon from '@mattermost/compass-icons/components/lock';
import {
  rollupNodes,
  type EnvironmentFixture,
  type RollupNode,
} from '../environments';
import styles from './SpacesSidebar.module.scss';

export type SidebarActive = 'home' | `space:${string}`;

export interface SpacesSidebarProps {
  environment: EnvironmentFixture;
  leak: boolean;
  active: SidebarActive;
  onHome: () => void;
  onOpenSpace: (spaceId: string) => void;
}

function ChildRows({
  nodes,
  onOpen,
}: {
  nodes: RollupNode[];
  onOpen: () => void;
}) {
  if (nodes.length === 0) {
    return (
      <p className={styles['spaces-sidebar__empty']}>Nothing in this rollup</p>
    );
  }
  return nodes.map((node) => (
    <ChannelSidebarItem
      key={node.id}
      className={styles['spaces-sidebar__child']}
      name={node.name}
      leadingVisual={node.leaked ? <Icon glyph={<LockIcon />} /> : 'public'}
      hideMenu
      onClick={onOpen}
    />
  ));
}

/**
 * Shared structure (temporary, standing, managed floors) stays separate from
 * the personal Watching section.
 */
export function SpacesSidebar({
  environment,
  leak,
  active,
  onHome,
  onOpenSpace,
}: SpacesSidebarProps) {
  const [expanded, setExpanded] = useState<string | null>(
    environment.spaces.find((space) => space.tenure === 'temporary')?.id ??
      null,
  );
  const temporary = environment.spaces.filter(
    (space) => space.tenure === 'temporary',
  );
  const standing = environment.spaces.filter(
    (space) => space.tenure === 'standing',
  );

  return (
    <div className={channelsSidebarStyles['channels-sidebar']}>
      <ChannelsSidebarHeader teamName={environment.audience} />
      <ChannelsSidebarNavigator />

      <div className={channelsSidebarStyles['channels-sidebar__top-group']}>
        <ChannelSidebarItem
          name="Home"
          leadingVisual={<Icon glyph={<HomeVariantOutlineIcon />} />}
          active={active === 'home'}
          hideMenu
          onClick={onHome}
        />
      </div>

      <div className={channelsSidebarStyles['channels-sidebar__scroll-view']}>
        <Scrollbar color="--sidebar-text-rgb">
          <div
            className={
              channelsSidebarStyles['channels-sidebar__channel-groups']
            }
          >
            <SpaceGroup
              label="Active"
              hint="Closes out"
              spaces={temporary}
              leak={leak}
              expanded={expanded}
              active={active}
              onExpanded={setExpanded}
              onOpenSpace={onOpenSpace}
            />
            <SpaceGroup
              label="Standing"
              hint="No close-out"
              spaces={standing}
              leak={leak}
              expanded={expanded}
              active={active}
              onExpanded={setExpanded}
              onOpenSpace={onOpenSpace}
            />

            <FloorGroup label="COMMAND" items={environment.floors.command} />
            <FloorGroup
              label="CURRENT OPS"
              items={environment.floors.currentOps}
            />
            <FloorGroup label="SUPPORT" items={environment.floors.support} />

            <div
              className={
                channelsSidebarStyles['channels-sidebar__channel-group']
              }
            >
              <ChannelsSidebarCategory label="Watching" />
              {environment.watching.map((name) => (
                <ChannelSidebarItem
                  key={name}
                  name={name}
                  leadingVisual={<Icon glyph={<EyeOutlineIcon />} />}
                  hideMenu
                />
              ))}
            </div>
          </div>
        </Scrollbar>
      </div>
    </div>
  );
}

function SpaceGroup({
  label,
  hint,
  spaces,
  leak,
  expanded,
  active,
  onExpanded,
  onOpenSpace,
}: {
  label: string;
  hint: string;
  spaces: EnvironmentFixture['spaces'];
  leak: boolean;
  expanded: string | null;
  active: SidebarActive;
  onExpanded: (id: string | null) => void;
  onOpenSpace: (spaceId: string) => void;
}) {
  return (
    <div className={channelsSidebarStyles['channels-sidebar__channel-group']}>
      <ChannelsSidebarCategory label={label} />
      <p className={styles['spaces-sidebar__hint']}>{hint}</p>
      {spaces.map((space) => {
        const open = expanded === space.id;
        const children = rollupNodes(space.children, leak);
        return (
          <div key={space.id}>
            <ChannelSidebarItem
              name={space.name}
              leadingVisual={<Icon glyph={<LayersOutlineIcon />} />}
              active={active === `space:${space.id}`}
              expanded={open}
              onExpandedChange={(next) => onExpanded(next ? space.id : null)}
              controlsId={`space-${space.id}`}
              toggleLabel={`Show contents of ${space.name}`}
              onClick={() => onOpenSpace(space.id)}
            />
            <div
              id={`space-${space.id}`}
              className={`${styles['spaces-sidebar']} ${
                open ? styles['spaces-sidebar--expanded'] : ''
              }`}
              aria-hidden={!open}
            >
              <div className={styles['spaces-sidebar__children']}>
                <ChildRows
                  nodes={children}
                  onOpen={() => onOpenSpace(space.id)}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FloorGroup({
  label,
  items,
}: {
  label: string;
  items: EnvironmentFixture['floors']['command'];
}) {
  return (
    <div className={channelsSidebarStyles['channels-sidebar__channel-group']}>
      <ChannelsSidebarCategory label={label} />
      {items.map((item) => (
        <ChannelSidebarItem
          key={item.name}
          name={item.name}
          leadingVisual={item.private ? 'private' : 'public'}
          hideMenu
        />
      ))}
    </div>
  );
}
