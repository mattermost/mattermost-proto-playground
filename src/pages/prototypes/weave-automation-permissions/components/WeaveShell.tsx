import { useState, type ReactNode } from 'react';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import {
  BullseyeArrowIcon,
  ClipboardTextOutlineIcon,
  MessageProcessingOutlineIcon,
  ProductRail,
  ProductShell,
} from '@mattermost/compass-proto';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import { OverlayContainerContext } from './OverlayContainer';
import WeaveSidebar from './WeaveSidebar';
import styles from '../WeaveAutomationPermissions.module.scss';

const RAIL_ITEMS = [
  {
    id: 'channels',
    label: 'Channels',
    icon: <MessageProcessingOutlineIcon size={24} />,
  },
  {
    id: 'playbooks',
    label: 'Playbooks',
    icon: <ClipboardTextOutlineIcon size={24} />,
  },
  { id: 'boards', label: 'Boards', icon: <BullseyeArrowIcon size={24} /> },
  {
    id: 'automation',
    label: 'Automation',
    icon: <LightningBoltOutlineIcon size={24} />,
  },
];

/** Automation product frame: Product Rail, Automation sidebar, and the page. */
export default function WeaveShell({
  children,
  overlays,
}: {
  children: ReactNode;
  /** Modals, rendered inside the frame so their scrim covers only the shell. */
  overlays?: ReactNode;
}) {
  // A state-held node (not a ref) so modals re-render once the frame exists.
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  return (
    <div className={styles['weave-permissions']}>
      <div
        className={styles['weave-permissions__frame']}
        ref={setFrame}
        data-wt-shell
      >
        <ProductShell
          product="automation"
          userAvatarSrc={avatarDanielle}
          userAvatarAlt="Danielle Okoro"
          productRail={<ProductRail items={RAIL_ITEMS} activeId="automation" />}
          sidebar={<WeaveSidebar />}
        >
          {children}
        </ProductShell>
        <OverlayContainerContext.Provider value={frame}>
          {overlays}
        </OverlayContainerContext.Provider>
      </div>
    </div>
  );
}
