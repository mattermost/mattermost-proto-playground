import type { ComponentType } from 'react';
import ClassificationMarkingsConfig from '@/pages/prototypes/classification-markings-config/ClassificationMarkingsConfig';
import ExampleFlow from '@/pages/prototypes/example-flow/ExampleFlow';
import ExternalCallParticipants from '@/pages/prototypes/external-call-participants/ExternalCallParticipants';
import OutboundCalls from '@/pages/prototypes/outbound-calls/OutboundCalls';

export type PrototypeEntry = {
  id: string;
  label: string;
  path: string;
  component: ComponentType;
  /** When true, omit from the prototypes index list (route still works). */
  hidden?: boolean;
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
    hidden: true,
  },
  {
    id: 'outbound-calls',
    label: 'Outbound Calls',
    path: '/prototypes/outbound-calls',
    component: OutboundCalls,
    hidden: true,
  },
  {
    id: 'classification-markings-config',
    label: 'Classification Markings',
    path: '/prototypes/classification-markings-config',
    component: ClassificationMarkingsConfig,
  },
];

export function getPrototypeByPath(pathname: string): PrototypeEntry | undefined {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return PROTOTYPES.find((p) => p.path === normalized);
}
