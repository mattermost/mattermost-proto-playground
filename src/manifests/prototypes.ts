import type { ComponentType } from 'react';
import ChannelAutomations from '@/pages/prototypes/channel-automations/ChannelAutomations';
import ExampleFlow from '@/pages/prototypes/example-flow/ExampleFlow';
import ExternalCallParticipants from '@/pages/prototypes/external-call-participants/ExternalCallParticipants';
import OutboundCalls from '@/pages/prototypes/outbound-calls/OutboundCalls';

export type PrototypeEntry = {
  id: string;
  label: string;
  path: string;
  component: ComponentType;
};

export const PROTOTYPES: PrototypeEntry[] = [
  {
    id: 'channel-automations',
    label: 'Agent Automations',
    path: '/prototypes/channel-automations',
    component: ChannelAutomations,
  },
  {
    id: 'example-flow',
    label: 'Example Flow',
    path: '/prototypes/example-flow',
    component: ExampleFlow,
  },
  {
    id: 'external-call-participants',
    label: 'External Call Participants',
    path: '/prototypes/external-call-participants',
    component: ExternalCallParticipants,
  },
  {
    id: 'outbound-calls',
    label: 'Outbound Calls',
    path: '/prototypes/outbound-calls',
    component: OutboundCalls,
  },
];

export function getPrototypeByPath(pathname: string): PrototypeEntry | undefined {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return PROTOTYPES.find((p) => p.path === normalized);
}
