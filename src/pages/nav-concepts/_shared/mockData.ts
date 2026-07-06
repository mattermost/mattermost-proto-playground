import type { ResourceTab } from './types';

export const DEFAULT_TABS: ResourceTab[] = [
  {
    id: 'hub',
    kind: 'hub',
    label: 'Hub',
    classification: 'unclass',
    pinned: true,
  },
  {
    id: 'channel-ux',
    kind: 'channel',
    label: 'UX Design — Staff',
    classification: 'unclass',
    product: 'channels',
  },
  {
    id: 'page-avalanche',
    kind: 'page',
    label: '1389 Avalanche Wiki',
    classification: 'cui',
    product: 'pages',
    productBreadcrumb: 'Pages',
  },
  {
    id: 'run-v6',
    kind: 'run',
    label: 'v6.4 Server Release',
    classification: 'cui',
    product: 'playbooks',
    productBreadcrumb: 'Playbooks',
  },
  {
    id: 'agent-devops',
    kind: 'agent',
    label: 'DevOps Agent',
    classification: 'unclass',
    product: 'agents',
    productBreadcrumb: 'Agents',
  },
];

export interface HubActivityItem {
  id: string;
  product: 'channels' | 'pages' | 'agents' | 'playbooks';
  kind: 'mention' | 'update-due' | 'comment' | 'run-event' | 'task-assigned';
  title: string;
  detail: string;
  resourceLabel: string;
  classification: 'unclass' | 'cui' | 'secret' | 'ts';
  when: string;
  unread?: boolean;
}

export const HUB_ACTIVITY: HubActivityItem[] = [
  {
    id: 'h1',
    product: 'channels',
    kind: 'mention',
    title: 'Mentioned you in UX Design — Staff',
    detail: '"@Leonard can you take a look at the Avalanche page comment thread?"',
    resourceLabel: 'UX Design — Staff',
    classification: 'unclass',
    when: '3m',
    unread: true,
  },
  {
    id: 'h2',
    product: 'playbooks',
    kind: 'update-due',
    title: 'Run update due in 6 days',
    detail: 'v6.4 Server Release · Status update expected every 48h',
    resourceLabel: 'v6.4 Server Release',
    classification: 'cui',
    when: '12m',
    unread: true,
  },
  {
    id: 'h3',
    product: 'pages',
    kind: 'comment',
    title: 'New comment on Mission Analysis Wiki',
    detail: 'Veronica Gordon: "Should we add the new ETA to section 4.2?"',
    resourceLabel: 'Mission Analysis Wiki',
    classification: 'cui',
    when: '24m',
    unread: true,
  },
  {
    id: 'h4',
    product: 'playbooks',
    kind: 'task-assigned',
    title: '3 tasks assigned to you',
    detail: 'Triage and check for pending tickets · Drafting changelog · …',
    resourceLabel: 'v6.4 Server Release',
    classification: 'cui',
    when: '1h',
  },
  {
    id: 'h5',
    product: 'agents',
    kind: 'run-event',
    title: 'DevOps Agent finished deployment audit',
    detail: '4 MCPs invoked · 16 tools used · 1 finding flagged',
    resourceLabel: 'DevOps Agent',
    classification: 'unclass',
    when: '2h',
  },
  {
    id: 'h6',
    product: 'channels',
    kind: 'mention',
    title: 'Mentioned you in Security Incident',
    detail: '"@Leonard verify the access pattern in the run log please"',
    resourceLabel: 'Security Incident',
    classification: 'secret',
    when: '3h',
  },
];

export interface MockProject {
  id: string;
  name: string;
  classification: 'unclass' | 'cui' | 'secret' | 'ts';
  resourceCounts: {
    channels: number;
    pages: number;
    runs: number;
    agents: number;
  };
  members: number;
  active?: boolean;
}

export const MOCK_PROJECTS: MockProject[] = [
  {
    id: 'p-ux-redesign',
    name: 'UX Redesign',
    classification: 'unclass',
    resourceCounts: { channels: 3, pages: 4, runs: 1, agents: 2 },
    members: 8,
    active: true,
  },
  {
    id: 'p-cko-2026',
    name: 'US CKO 2026',
    classification: 'cui',
    resourceCounts: { channels: 5, pages: 12, runs: 0, agents: 1 },
    members: 23,
  },
  {
    id: 'p-avalanche',
    name: 'Avalanche Flight Planning',
    classification: 'cui',
    resourceCounts: { channels: 2, pages: 6, runs: 2, agents: 3 },
    members: 12,
  },
  {
    id: 'p-jtf',
    name: 'JTF Mission Ops',
    classification: 'secret',
    resourceCounts: { channels: 4, pages: 8, runs: 3, agents: 4 },
    members: 16,
  },
];
