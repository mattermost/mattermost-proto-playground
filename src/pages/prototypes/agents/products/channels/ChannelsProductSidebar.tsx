import { useRef, useState } from 'react';
import {
  ChannelsSidebarCategory,
} from '@mattermost/compass-ui/components/channels-sidebar';
import { ChannelSidebarItem } from '@mattermost/compass-ui/components/channel-sidebar-item';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { buildAgentsChannelsSidebarModel } from '../../agentsData';
import LhsSidebarHeader from '../../components/LhsSidebarHeader';
import PlusMenu from '../../components/PlusMenu';
import { useAgents } from '../../context/AgentsContext';
import styles from './ChannelsProductSidebar.module.scss';

/**
 * Channels LHS matching ChannelsSidebar chrome (product title + find), with a
 * host-owned plus menu (Create an Agent).
 */
export default function ChannelsProductSidebar() {
  const { openNewAgent } = useAgents();
  const [plusOpen, setPlusOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const plusRef = useRef<HTMLDivElement>(null);
  const model = buildAgentsChannelsSidebarModel('service-status');

  const togglePlus = () => {
    const next = !plusOpen;
    setPlusOpen(next);
    if (next && plusRef.current) {
      setAnchorRect(plusRef.current.getBoundingClientRect());
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
