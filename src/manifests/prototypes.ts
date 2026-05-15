import type { ComponentType } from 'react';
import ExampleFlow from '@/pages/example-flow/ExampleFlow';
import ExternalCallParticipants from '@/pages/ExternalCallParticipants/ExternalCallParticipants';
import Onboarding from '@/pages/Onboarding/Onboarding';
import OutboundCalls from '@/pages/OutboundCalls/OutboundCalls';

export type PrototypeEntry = {
  id: string;
  label: string;
  path: string;
  component: ComponentType;
};

export const PROTOTYPES: PrototypeEntry[] = [
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
  {
    id: 'onboarding',
    label: 'Onboarding',
    path: '/prototypes/onboarding',
    component: Onboarding,
  },
];

export function getPrototypeByPath(pathname: string): PrototypeEntry | undefined {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return PROTOTYPES.find((p) => p.path === normalized);
}
