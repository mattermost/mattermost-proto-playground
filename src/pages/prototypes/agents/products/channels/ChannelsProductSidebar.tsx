import { useRef, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import {
  ChannelsSidebarCategory,
} from '@mattermost/compass-ui/components/channels-sidebar';
import { ChannelSidebarItem } from '@mattermost/compass-ui/components/channel-sidebar-item';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { buildAgentsChannelsSidebarModel } from '../../agentsData';
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
      {/* Matches ChannelsSidebar header: product title + add. */}
      <div className={styles['channels-nav__header']}>
        <button
          type="button"
          className={styles['channels-nav__product']}
          aria-label="Channels"
        >
          <span className={styles['channels-nav__product-name']}>Channels</span>
          <span className={styles['channels-nav__product-chevron']} aria-hidden>
            <ChevronDownIcon size={16} />
          </span>
        </button>
        <div ref={plusRef} className={styles['channels-nav__plus']}>
          <IconButton
            size="small"
            style="inverted"
            padding="compact"
            rounded
            icon={<Icon glyph={<PlusIcon />} size="16" />}
            aria-label="Create"
            aria-expanded={plusOpen}
            aria-haspopup="menu"
            onClick={togglePlus}
          />
        </div>
      </div>

      {/* Matches ChannelsSidebar navigator: Find channels. */}
      <div className={styles['channels-nav__navigator']}>
        <div
          className={styles['channels-nav__find']}
          role="search"
          aria-label="Find channels"
        >
          <span className={styles['channels-nav__find-icon']} aria-hidden>
            <MagnifyIcon size={16} />
          </span>
          <span className={styles['channels-nav__find-label']}>
            Find channels
          </span>
        </div>
      </div>

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
