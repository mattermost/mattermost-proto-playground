import type { ReactNode } from 'react';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import {
  BullseyeArrowIcon,
  ClipboardTextOutlineIcon,
  MessageProcessingOutlineIcon,
  ProductRail,
  ProductShell,
} from '@mattermost/compass-proto';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
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
export default function WeaveShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles['weave-permissions']}>
      <div className={styles['weave-permissions__frame']}>
        <ProductShell
          product="automation"
          userAvatarSrc={avatarSofia}
          userAvatarAlt="Sofia Bauer"
          productRail={<ProductRail items={RAIL_ITEMS} activeId="automation" />}
          sidebar={<WeaveSidebar />}
        >
          {children}
        </ProductShell>
      </div>
    </div>
  );
}
