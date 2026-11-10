import type { ComponentType } from 'react';
import CallsAdminConsole from '@/pages/prototypes/calls-admin-console/CallsAdminConsole';
import ExternalCallParticipants from '@/pages/prototypes/external-call-participants/ExternalCallParticipants';
import MobileHomeChannel from '@/pages/prototypes/mobile-home-channel/MobileHomeChannel';
import OutboundCalls from '@/pages/prototypes/outbound-calls/OutboundCalls';

export type PrototypeEntry = {
  id: string;
  label: string;
  path: string;
  component: ComponentType;
};

export const PROTOTYPES: PrototypeEntry[] = [
  {
    id: 'calls-admin-console',
    label: 'Calls Admin Console',
    path: '/prototypes/calls-admin-console',
    component: CallsAdminConsole,
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

export function getPrototypeByPath(
  pathname: string,
): PrototypeEntry | undefined {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  return PROTOTYPES.find((p) => p.path === normalized);
}
