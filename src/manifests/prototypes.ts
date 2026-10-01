import type { ComponentType } from 'react';
import ActionControlsViewChannel from '@/pages/prototypes/action-controls-view-channel/ActionControlsViewChannel';
import DmGmActionControls from '@/pages/prototypes/dm-gm-action-controls/DmGmActionControls';
import ExternalCallParticipants from '@/pages/prototypes/external-call-participants/ExternalCallParticipants';
import MobileHomeChannel from '@/pages/prototypes/mobile-home-channel/MobileHomeChannel';
import OutboundCalls from '@/pages/prototypes/outbound-calls/OutboundCalls';
import SimulateAccess from '@/pages/prototypes/simulate-access/SimulateAccess';

export type PrototypeEntry = {
  id: string;
  label: string;
  path: string;
  component: ComponentType;
};

export const PROTOTYPES: PrototypeEntry[] = [
  {
    id: 'action-controls-view-channel',
    label: 'Action Controls – Read and Write to Channels',
    path: '/prototypes/action-controls-view-channel',
    component: ActionControlsViewChannel,
  },
  {
    id: 'dm-gm-action-controls',
    label: 'Action Controls – Direct and Group Messages',
    path: '/prototypes/dm-gm-action-controls',
    component: DmGmActionControls,
  },
  {
    id: 'external-call-participants',
    label: 'External Call Participants',
    path: '/prototypes/external-call-participants',
    component: ExternalCallParticipants,
  },
  {
    id: 'mobile-home-channel',
    label: 'Mobile sample',
    path: '/prototypes/mobile-home-channel',
    component: MobileHomeChannel,
  },
  {
    id: 'outbound-calls',
    label: 'Outbound Calls',
    path: '/prototypes/outbound-calls',
    component: OutboundCalls,
  },
  {
    id: 'simulate-access',
    label: 'Simulate access',
    path: '/prototypes/simulate-access',
    component: SimulateAccess,
  },
];

export function getPrototypeByPath(pathname: string): PrototypeEntry | undefined {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return PROTOTYPES.find((p) => p.path === normalized);
}
