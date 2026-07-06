/**
 * Team-scoped mock data driving all nav concept prototypes.
 *
 * Architecture (locked 2026-05-26):
 *   Team → Product → Resource
 *   • Team carries a classification ceiling
 *   • Resources are team-scoped and ≤ team's classification
 *   • Channels can host other resources as linked tabs
 *   • Per-resource badges only when resource class < team class
 */
import type { Classification } from './types';
import type { ViewId } from '../_views/ViewStub';

export type ProductId = 'channels' | 'pages' | 'agents' | 'playbooks';

export interface LinkedTab {
  id: string;
  label: string;
  kind: 'page' | 'agent' | 'playbook' | 'run';
  viewId: ViewId;
  classification?: Classification; // omit if same as channel/team
}

export interface ChannelResource {
  id: string;
  name: string;
  classification?: Classification; // omit if same as team
  unread?: number;
  mentions?: number;
  linkedTabs?: LinkedTab[];
}

export interface DmResource {
  id: string;
  name: string;
  presence?: 'online' | 'away' | 'offline';
  unread?: number;
}

export interface PageResource {
  id: string;
  name: string;
  classification?: Classification;
  channelHostId?: string;
  status?: 'draft' | 'in-progress' | 'complete';
}

export interface AgentResource {
  id: string;
  name: string;
  handle: string;
  mcps: number;
  tools: number;
  classification?: Classification;
}

export interface PlaybookResource {
  id: string;
  name: string;
  classification?: Classification;
}

export interface RunResource {
  id: string;
  name: string;
  playbookId: string;
  status: 'in-progress' | 'finished';
  duration: string;
  classification?: Classification;
  channelHostId?: string;
}

export interface Team {
  id: string;
  name: string;
  classification: Classification;
  initials?: string;
  unread?: boolean;
  mentions?: number;
  channels: ChannelResource[];
  favoriteChannelIds?: string[];
  dms: DmResource[];
  pages: PageResource[];
  agents: AgentResource[];
  playbooks: PlaybookResource[];
  runs: RunResource[];
}

export const TEAMS: Team[] = [
  {
    id: 'contributors',
    name: 'Contributors',
    classification: 'cui',
    favoriteChannelIds: ['ch-ui-redesign', 'ch-ux-design'],
    channels: [
      {
        id: 'ch-ui-redesign',
        name: 'UI Redesign',
      },
      {
        id: 'ch-ux-design',
        name: 'UX Design — Staff',
        linkedTabs: [
          { id: 'lt-pg-ia', label: 'IA Principles', kind: 'page', viewId: 'page-view' },
          { id: 'lt-ag-layout', label: 'Layout Agent', kind: 'agent', viewId: 'agents-edit' },
          { id: 'lt-pb-review', label: 'Design Review', kind: 'playbook', viewId: 'playbooks-playbook-detail' },
        ],
      },
      { id: 'ch-contributors', name: 'Contributors' },
      { id: 'ch-developers', name: 'Developers' },
      { id: 'ch-orion', name: 'Orion' },
      {
        id: 'ch-avalanche',
        name: '1389 Project Avalanche',
        linkedTabs: [
          { id: 'lt-pg-aval', label: '1389 Avalanche Wiki', kind: 'page', viewId: 'page-view' },
          { id: 'lt-pg-mission', label: 'Mission Analysis', kind: 'page', viewId: 'page-view' },
          { id: 'lt-run-v6', label: 'v6.4 Server Release', kind: 'run', viewId: 'playbooks-run-detail' },
        ],
      },
      { id: 'ch-security', name: 'Security Incident', classification: 'cui' },
    ],
    dms: [
      { id: 'dm-alex', name: 'Alex Tao', presence: 'online' },
      { id: 'dm-pauline', name: 'Pauline Burton', presence: 'away' },
      { id: 'dm-jenny', name: 'Jenny Bilt', presence: 'offline' },
    ],
    pages: [
      { id: 'pg-aval', name: '1389 Avalanche Wiki', status: 'in-progress', channelHostId: 'ch-avalanche' },
      { id: 'pg-mission', name: 'Mission Analysis Wiki', status: 'in-progress', channelHostId: 'ch-avalanche' },
      { id: 'pg-ops', name: 'Ops Graphics Wiki', status: 'draft' },
      { id: 'pg-jtf', name: 'JTF Areas Wiki', status: 'draft' },
      { id: 'pg-risk', name: 'Risk Management Overview', status: 'complete' },
      { id: 'pg-ia', name: 'IA Principles', status: 'in-progress', channelHostId: 'ch-ux-design' },
    ],
    agents: [
      { id: 'ag-devops', name: 'DevOps Agent', handle: '@devops-agent', mcps: 4, tools: 16 },
      { id: 'ag-cloudops', name: 'CloudOps Agent', handle: '@cloudops-agent', mcps: 8, tools: 28 },
      { id: 'ag-insights', name: 'Data Insights Agent', handle: '@insights-agent', mcps: 5, tools: 20 },
      { id: 'ag-tracker', name: 'Project Tracker Agent', handle: '@task-agent', mcps: 2, tools: 7 },
      { id: 'ag-layout', name: 'Layout Reviewer Agent', handle: '@layout-agent', mcps: 1, tools: 4 },
    ],
    playbooks: [
      { id: 'pb-incident', name: 'Incident response' },
      { id: 'pb-release', name: 'Release runbook' },
      { id: 'pb-customer', name: 'Customer onboarding' },
      { id: 'pb-bugbash', name: 'Bug bash' },
    ],
    runs: [
      { id: 'rn-9462', name: 'Incident #9462', playbookId: 'pb-incident', status: 'in-progress', duration: '2h 35m' },
      { id: 'rn-cloud-atk', name: 'Cloud server attack', playbookId: 'pb-incident', status: 'in-progress', duration: '2h 35m' },
      { id: 'rn-acme', name: 'Acme Corp onboarding', playbookId: 'pb-customer', status: 'in-progress', duration: '2h 35m' },
      { id: 'rn-v6', name: 'v6.4 Server Release', playbookId: 'pb-release', status: 'in-progress', duration: '2h 35m', channelHostId: 'ch-avalanche' },
      { id: 'rn-old', name: 'Some old run', playbookId: 'pb-incident', status: 'finished', duration: '2h 35m' },
    ],
  },
  {
    id: 'design',
    name: 'Design',
    classification: 'unclass',
    initials: 'De',
    unread: true,
    channels: [
      { id: 'ch-d-stand', name: 'Daily Standup' },
      { id: 'ch-d-ideas', name: 'Ideas' },
    ],
    dms: [],
    pages: [{ id: 'pg-d-onboard', name: 'Designer Onboarding', status: 'complete' }],
    agents: [],
    playbooks: [],
    runs: [],
  },
  {
    id: 'secops',
    name: 'Security Ops',
    classification: 'secret',
    initials: 'Ac',
    mentions: 3,
    channels: [
      { id: 'ch-s-incident', name: 'Active Incidents' },
      { id: 'ch-s-intel', name: 'Threat Intel' },
    ],
    dms: [{ id: 'dm-s-soc', name: 'SOC Lead', presence: 'online' }],
    pages: [{ id: 'pg-s-playbook', name: 'Incident Playbook' }],
    agents: [],
    playbooks: [{ id: 'pb-s-incident', name: 'TS Incident response', classification: 'secret' }],
    runs: [{ id: 'rn-s-active', name: 'Active investigation #221', playbookId: 'pb-s-incident', status: 'in-progress', duration: '4h 12m' }],
  },
];

export const PRODUCT_LIST: Array<{ id: ProductId; label: string; icon: string }> = [
  { id: 'channels', label: 'Channels', icon: '💬' },
  { id: 'pages', label: 'Pages', icon: '📄' },
  { id: 'agents', label: 'Agents', icon: '✨' },
  { id: 'playbooks', label: 'Playbooks', icon: '📋' },
];

export function getTeam(id: string): Team {
  return TEAMS.find((t) => t.id === id) ?? TEAMS[0];
}
