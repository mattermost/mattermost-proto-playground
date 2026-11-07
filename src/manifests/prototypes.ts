import type { ComponentType } from 'react';
import ExternalCallParticipants from '@/pages/prototypes/external-call-participants/ExternalCallParticipants';
import MobileHomeChannel from '@/pages/prototypes/mobile-home-channel/MobileHomeChannel';
import NotificationSchedule from '@/pages/prototypes/notification-schedule/NotificationSchedule';
import NotificationScheduleMobile from '@/pages/prototypes/notification-schedule-mobile/NotificationScheduleMobile';
import OutboundCalls from '@/pages/prototypes/outbound-calls/OutboundCalls';

export type PrototypeEntry = {
  id: string;
  label: string;
  path: string;
  component: ComponentType;
};

export const PROTOTYPES: PrototypeEntry[] = [
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
    id: 'notification-schedule',
    label: 'Notification Schedule',
    path: '/prototypes/notification-schedule',
    component: NotificationSchedule,
  },
  {
    id: 'notification-schedule-mobile',
    label: 'Notification Schedule (mobile)',
    path: '/prototypes/notification-schedule-mobile',
    component: NotificationScheduleMobile,
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
