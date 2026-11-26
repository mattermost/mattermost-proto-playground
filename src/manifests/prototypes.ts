import type { ComponentType } from 'react';
import ActionControlsViewChannel from '@/pages/prototypes/action-controls-view-channel/ActionControlsViewChannel';
import DmGmActionControls from '@/pages/prototypes/dm-gm-action-controls/DmGmActionControls';
import DmGmActionControlsV1 from '@/pages/prototypes/dm-gm-action-controls-v1/DmGmActionControlsV1';
import ExternalCallParticipants from '@/pages/prototypes/external-call-participants/ExternalCallParticipants';
import MobileHomeChannel from '@/pages/prototypes/mobile-home-channel/MobileHomeChannel';
import OutboundCalls from '@/pages/prototypes/outbound-calls/OutboundCalls';
import PolicyRuleBuilder from '@/pages/prototypes/policy-rule-builder/PolicyRuleBuilder';
import PolicyRuleBuilderAuthoring from '@/pages/prototypes/policy-rule-builder-authoring/PolicyRuleBuilderAuthoring';
import SimulateAccess from '@/pages/prototypes/simulate-access/SimulateAccess';

export type PrototypeEntry = {
  id: string;
  label: string;
  path: string;
  component: ComponentType;
};

export const PROTOTYPES: PrototypeEntry[] = [
  {
    id: 'policy-rule-builder',
    label: 'Permission Policy Rule Builder (DM/GM expansion)',
    path: '/prototypes/policy-rule-builder',
    component: PolicyRuleBuilder,
  },
  {
    id: 'policy-rule-builder-authoring',
    label: 'Permission Policy Rule Builder (authoring only)',
    path: '/prototypes/policy-rule-builder-authoring',
    component: PolicyRuleBuilderAuthoring,
  },
  {
    id: 'dm-gm-action-controls-v1',
    label: 'DM/GM Action Controls v1 (Latest)',
    path: '/prototypes/dm-gm-action-controls-v1',
    component: DmGmActionControlsV1,
  },
  {
    id: 'action-controls-view-channel',
    label: 'Action Controls – Read and Write to Channels',
    path: '/prototypes/action-controls-view-channel',
    component: ActionControlsViewChannel,
  },
  {
    id: 'dm-gm-action-controls',
    label: 'Action Controls – Direct and Group Messages (Exploration)',
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
