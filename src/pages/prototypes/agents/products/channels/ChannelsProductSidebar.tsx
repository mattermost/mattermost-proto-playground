import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChannelsSidebarCategory,
} from '@mattermost/compass-ui/components/channels-sidebar';
import { ChannelSidebarItem } from '@mattermost/compass-ui/components/channel-sidebar-item';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import {
  buildAgentsChannelsSidebarModel,
  MATTY,
} from '../../agentsData';
import { AGENTS_BASE } from '../../agentsScenes';
import { agentAvatarChipSrc } from '../../components/agentAvatarShapes';
import LhsSidebarHeader from '../../components/LhsSidebarHeader';
import PlusMenu from '../../components/PlusMenu';
import { useAgents } from '../../context/AgentsContext';
import styles from './ChannelsProductSidebar.module.scss';

function resolveActiveName(pathname: string): string {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  const dmPrefix = `${AGENTS_BASE}/dm/`;
  if (normalized.startsWith(dmPrefix)) {
    const id = normalized.slice(dmPrefix.length);
    if (id === MATTY.id) return MATTY.name;
    return id;
  }
  return 'service-status';
}

/**
 * Channels LHS matching ChannelsSidebar chrome (product title + find), with a
 * host-owned plus menu (Create an Agent).
 */
export default function ChannelsProductSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { openNewAgent } = useAgents();
  const [plusOpen, setPlusOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const plusRef = useRef<HTMLDivElement>(null);
  const activeName = resolveActiveName(pathname);
  const model = buildAgentsChannelsSidebarModel(activeName);
  const mattyAvatarSrc = agentAvatarChipSrc(MATTY.shape, MATTY.color);

  const togglePlus = () => {
    const next = !plusOpen;
    setPlusOpen(next);
    if (next && plusRef.current) {
      setAnchorRect(plusRef.current.getBoundingClientRect());
    }
  };

  const onItemClick = (name: string) => {
    if (name === MATTY.name) {
      navigate(`${AGENTS_BASE}/dm/${MATTY.id}`);
      return;
    }
    if (name === 'service-status') {
      navigate(AGENTS_BASE);
    }
  };

  return (
    <aside className={styles['channels-nav']}>
      <LhsSidebarHeader
        productName="Channels"
        findLabel="Find channels"
        plusAriaLabel="Create"
        plusExpanded={plusOpen}
        plusHasPopup="menu"
        onPlusClick={togglePlus}
        plusAnchorRef={plusRef}
      />

      <Scrollbar
        className={styles['channels-nav__scroll']}
        color="--sidebar-text-rgb"
      >
        <div className={styles['channels-nav__top']}>
          {model.topGroupItems.map((item) => (
            <ChannelSidebarItem key={item.name} {...item} />
          ))}
        </div>

        {model.groups.map((group) => (
          <div key={group.key} className={styles['channels-nav__group']}>
            <ChannelsSidebarCategory
              label={group.category.label}
              showChevron={group.category.showChevron}
              showPlusButton={group.category.showPlusButton}
            />
            {group.items.map((item) => (
              <ChannelSidebarItem
                key={`${group.key}-${item.name}`}
                {...item}
                avatarSrc={
                  item.name === MATTY.name ? mattyAvatarSrc : item.avatarSrc
                }
                onClick={
                  item.name === MATTY.name || item.name === 'service-status'
                    ? () => onItemClick(item.name)
                    : undefined
                }
              />
            ))}
          </div>
        ))}
      </Scrollbar>

      <PlusMenu
        open={plusOpen}
        anchorRect={anchorRect}
        onClose={() => setPlusOpen(false)}
        onCreateAgent={openNewAgent}
      />
    </aside>
  );
}
