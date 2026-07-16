import type { ComponentType } from 'react';
import type { TagType } from '@mattermost/compass-ui';
import ScopedExecutorAutomations from '@/pages/prototypes/scoped-executor-automations/ScopedExecutorAutomations';
import ProgressiveAutomationAgents from '@/pages/prototypes/progressive-automation-agents/ProgressiveAutomationAgents';
import ExampleFlow from '@/pages/prototypes/example-flow/ExampleFlow';
import ExternalCallParticipants from '@/pages/prototypes/external-call-participants/ExternalCallParticipants';
import OutboundCalls from '@/pages/prototypes/outbound-calls/OutboundCalls';

export type PrototypeEntry = {
  id: string;
  label: string;
  description?: string;
  path: string;
  component: ComponentType;
  /** Optional status label tag shown beside the title on the index. */
  tag?: {
    label: string;
    type?: TagType;
  };
  /** Omit from the prototypes index while keeping the route available. */
  hidden?: boolean;
};

export const PROTOTYPES: PrototypeEntry[] = [
  {
    id: 'scoped-executor-automations',
    label: 'Option 2b: Scoped executor',
    description:
      'Distinct automations run on a reusable agent; tool access is scoped per automation (least privilege) without editing the shared agent.',
    path: '/prototypes/scoped-executor-automations',
    component: ScopedExecutorAutomations,
  },
  {
    id: 'progressive-automation-agents',
    label: 'Option 3b: Automation is an agent (progressive)',
    description:
      'Each automation is its own dedicated agent. Defaults show name, trigger, and instructions; model, tools, and access sit behind Advanced.',
    path: '/prototypes/progressive-automation-agents',
    component: ProgressiveAutomationAgents,
  },
  {
    id: 'example-flow',
    label: 'Example Flow',
    path: '/prototypes/example-flow',
    component: ExampleFlow,
    hidden: true,
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
];

export function getPrototypeByPath(pathname: string): PrototypeEntry | undefined {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return PROTOTYPES.find((p) => p.path === normalized);
}
