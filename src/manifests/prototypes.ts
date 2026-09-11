import type { ComponentType } from 'react';
import Agents from '@/pages/prototypes/agents/Agents';
import Automations from '@/pages/prototypes/automations/Automations';
import ExternalCallParticipants from '@/pages/prototypes/external-call-participants/ExternalCallParticipants';
import MobileHomeChannel from '@/pages/prototypes/mobile-home-channel/MobileHomeChannel';
import OutboundCalls from '@/pages/prototypes/outbound-calls/OutboundCalls';

export type PrototypeEntry = {
  id: string;
  label: string;
  path: string;
  component: ComponentType;
  /** When true, also match nested paths under `path` (e.g. `/prototypes/foo/*`). */
  nested?: boolean;
};

export const PROTOTYPES: PrototypeEntry[] = [
  {
    id: 'agents',
    label: 'Agents',
    path: '/prototypes/agents',
    component: Agents,
    nested: true,
  },
  {
    id: 'automations',
    label: 'Automations',
    path: '/prototypes/automations',
    component: Automations,
    nested: true,
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
];

export function getPrototypeByPath(pathname: string): PrototypeEntry | undefined {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return PROTOTYPES.find((p) => {
    if (p.path === normalized) return true;
    if (p.nested && (normalized === p.path || normalized.startsWith(`${p.path}/`))) {
      return true;
    }
    return false;
  });
}
