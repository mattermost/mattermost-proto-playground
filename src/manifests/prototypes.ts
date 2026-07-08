import type { ComponentType } from 'react';
import ChannelAutomations from '@/pages/prototypes/channel-automations/ChannelAutomations';
import StandaloneAutomations from '@/pages/prototypes/standalone-automations/StandaloneAutomations';
import AutomationAgents from '@/pages/prototypes/automation-agents/AutomationAgents';
import ExampleFlow from '@/pages/prototypes/example-flow/ExampleFlow';
import ExternalCallParticipants from '@/pages/prototypes/external-call-participants/ExternalCallParticipants';
import OutboundCalls from '@/pages/prototypes/outbound-calls/OutboundCalls';

export type PrototypeEntry = {
  id: string;
  label: string;
  description?: string;
  path: string;
  component: ComponentType;
  /** Omit from the prototypes index while keeping the route available. */
  hidden?: boolean;
};

export const PROTOTYPES: PrototypeEntry[] = [
  {
    id: 'channel-automations',
    label: 'Option 1: Automations within Agents',
    description:
      'Automations are part of the configuration for an agent. Users must have access to edit the agent in order to create an automation for an agent.',
    path: '/prototypes/channel-automations',
    component: ChannelAutomations,
  },
  {
    id: 'standalone-automations',
    label: 'Option 2: Standalone Automations - Using agents to execute',
    description:
      'Automations are distinct entities from agents, but they use agents to execute the automation',
    path: '/prototypes/standalone-automations',
    component: StandaloneAutomations,
  },
  {
    id: 'automation-agents',
    label: 'Option 3: Automations are agents',
    description:
      'Automations are a special type of agent. They have all the same configuration and guardrails as agents, but have the additional ability to execute on triggers',
    path: '/prototypes/automation-agents',
    component: AutomationAgents,
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
