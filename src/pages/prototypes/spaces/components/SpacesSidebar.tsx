import { useState } from 'react';
import {
  BookOpenVariantOutlineIcon,
  BullseyeArrowIcon,
  ChannelsSidebarCategory,
  ChannelsSidebarHeader,
  ChannelsSidebarNavigator,
  channelsSidebarStyles,
  ClipboardTextOutlineIcon,
  MessageProcessingOutlineIcon,
} from '@mattermost/compass-proto';
import { ChannelSidebarItem } from '@mattermost/compass-ui/components/channel-sidebar-item';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { HealthDot } from './HealthDot';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import HomeVariantOutlineIcon from '@mattermost/compass-icons/components/home-variant-outline';
import LayersOutlineIcon from '@mattermost/compass-icons/components/layers-outline';
import LockIcon from '@mattermost/compass-icons/components/lock';
import {
  rollupNodes,
  type EnvironmentFixture,
  type RollupNode,
  type SpaceFixture,
} from '../environments';
import type { Health } from '../spacesData';
import styles from './SpacesSidebar.module.scss';

export type SidebarActive = 'home' | `space:${string}` | `child:${string}`;

export interface SidebarChild {
  spaceId: string;
  id: string;
  name: string;
  kind: string;
}

export interface SpacesSidebarProps {
  environment: EnvironmentFixture;
  leak: boolean;
  active: SidebarActive;
  /** Channels, the board, docs, and playbook runs for the open Space. */
  linked?: { spaceId: string; nodes: RollupNode[] };
  /** Status for a Space row. Falls back to the fixture when omitted. */
  healthById?: Record<string, Health>;
  onHome: () => void;
  onOpenSpace: (spaceId: string) => void;
  onOpenChild: (child: SidebarChild) => void;
}

function childGlyph(kind: string) {
  switch (kind.toLowerCase()) {
    case 'channel':
      return <MessageProcessingOutlineIcon />;
    case 'board':
      return <BullseyeArrowIcon />;
    case 'run':
      return <ClipboardTextOutlineIcon />;
    case 'doc':
    case 'page':
    case 'record':
      return <BookOpenVariantOutlineIcon />;
    default:
      return <LayersOutlineIcon />;
  }
}

function spaceHealth(space: SpaceFixture): Health {
  if (space.freshness === 'stale') return 'critical';
  if (space.freshness === 'review-due') return 'warning';
  const state = (space.state ?? '').toLowerCase();
  if (state.includes('critical') || state.includes('blocked'))
    return 'critical';
  if (
    state.includes('risk') ||
    state.includes('plan') ||
    state.includes('wait')
  ) {
    return 'warning';
  }
  return 'nominal';
}

function ChildRows({
  spaceId,
  nodes,
  active,
  onOpenChild,
}: {
  spaceId: string;
  nodes: RollupNode[];
  active: SidebarActive;
  onOpenChild: (child: SidebarChild) => void;
}) {
  if (nodes.length === 0) {
    return <p className={styles['spaces-sidebar__empty']}>Nothing here</p>;
  }
  return nodes.map((node) => (
    <ChannelSidebarItem
      key={node.id}
      className={styles['spaces-sidebar__child']}
      name={node.name}
      leadingVisual={
        node.leaked ? (
          <Icon glyph={<LockIcon />} />
        ) : (
          <Icon glyph={childGlyph(node.kind)} />
        )
      }
      active={active === `child:${node.id}`}
      hideMenu
      onClick={() =>
        onOpenChild({
          spaceId,
          id: node.id,
          name: node.name,
          kind: node.kind,
        })
      }
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
  linked,
  healthById,
  onHome,
  onOpenSpace,
  onOpenChild,
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
              hint="Open"
              spaces={temporary}
              leak={leak}
              expanded={expanded}
              active={active}
              onExpanded={setExpanded}
              linked={linked}
              healthById={healthById}
              onOpenSpace={onOpenSpace}
              onOpenChild={onOpenChild}
            />
            <SpaceGroup
              label="Reference"
              hint="Kept"
              spaces={standing}
              leak={leak}
              expanded={expanded}
              active={active}
              onExpanded={setExpanded}
              linked={linked}
              healthById={healthById}
              onOpenSpace={onOpenSpace}
              onOpenChild={onOpenChild}
            />

            <FloorGroup
              label="COMMAND"
              items={environment.floors.command}
              active={active}
              onOpen={(name) =>
                onOpenChild({
                  spaceId: temporary[0]?.id ?? standing[0]?.id ?? '',
                  id: `channel:${name}`,
                  name,
                  kind: 'Channel',
                })
              }
            />
            <FloorGroup
              label="CURRENT OPS"
              items={environment.floors.currentOps}
              active={active}
              onOpen={(name) =>
                onOpenChild({
                  spaceId: temporary[0]?.id ?? standing[0]?.id ?? '',
                  id: `channel:${name}`,
                  name,
                  kind: 'Channel',
                })
              }
            />
            <FloorGroup
              label="SUPPORT"
              items={environment.floors.support}
              active={active}
              onOpen={(name) =>
                onOpenChild({
                  spaceId: temporary[0]?.id ?? standing[0]?.id ?? '',
                  id: `channel:${name}`,
                  name,
                  kind: 'Channel',
                })
              }
            />

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
  linked,
  healthById,
  onOpenSpace,
  onOpenChild,
}: {
  label: string;
  hint: string;
  spaces: EnvironmentFixture['spaces'];
  leak: boolean;
  expanded: string | null;
  active: SidebarActive;
  onExpanded: (id: string | null) => void;
  linked?: { spaceId: string; nodes: RollupNode[] };
  healthById?: Record<string, Health>;
  onOpenSpace: (spaceId: string) => void;
  onOpenChild: (child: SidebarChild) => void;
}) {
  return (
    <div className={channelsSidebarStyles['channels-sidebar__channel-group']}>
      <ChannelsSidebarCategory label={label} />
      <p className={styles['spaces-sidebar__hint']}>{hint}</p>
      {spaces.map((space) => {
        const open = expanded === space.id;
        const children = [
          ...rollupNodes(space.children, leak),
          ...(linked?.spaceId === space.id ? linked.nodes : []),
        ];
        return (
          <div key={space.id}>
            <ChannelSidebarItem
              name={space.name}
              leadingVisual={<Icon glyph={<LayersOutlineIcon />} />}
              trailingVisual={
                <HealthDot
                  health={healthById?.[space.id] ?? spaceHealth(space)}
                />
              }
              hideMenu
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
                  spaceId={space.id}
                  nodes={children}
                  active={active}
                  onOpenChild={onOpenChild}
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
  active,
  onOpen,
}: {
  label: string;
  items: EnvironmentFixture['floors']['command'];
  active: SidebarActive;
  onOpen: (name: string) => void;
}) {
  return (
    <div className={channelsSidebarStyles['channels-sidebar__channel-group']}>
      <ChannelsSidebarCategory label={label} />
      {items.map((item) => (
        <ChannelSidebarItem
          key={item.name}
          name={item.name}
          leadingVisual={<Icon glyph={<MessageProcessingOutlineIcon />} />}
          active={active === `child:channel:${item.name}`}
          hideMenu
          onClick={() => onOpen(item.name)}
        />
      ))}
    </div>
  );
}
