export type AgentStatus = 'working' | 'needs-input' | 'idle';

export type AgentActivity = {
  status: AgentStatus;
  task?: string;
  channel?: string;
  /** 0–100 */
  progress?: number;
  startedAgo?: string;
};

export const AGENT_STATUS_LABEL: Record<AgentStatus, string> = {
  working: 'Working',
  'needs-input': 'Needs input',
  idle: 'Idle',
};

export const AGENT_STATUS_TAG: Record<AgentStatus, 'info' | 'warning' | 'default'> = {
  working: 'info',
  'needs-input': 'warning',
  idle: 'default',
};

const ACTIVITY: Record<string, AgentActivity> = {
  matty: {
    status: 'working',
    task: 'Drafting the weekly reliability digest',
    channel: '~service-status',
    progress: 64,
    startedAgo: '4 min',
  },
  auditor: {
    status: 'working',
    task: 'Reviewing access changes from the last 7 days',
    channel: '~security',
    progress: 38,
    startedAgo: '12 min',
  },
  warden: {
    status: 'needs-input',
    task: 'Waiting on approval to rotate staging credentials',
    channel: '~ops',
    progress: 80,
    startedAgo: '26 min',
  },
  otto: {
    status: 'working',
    task: 'Triaging 14 new incident reports',
    channel: '~incidents',
    progress: 22,
    startedAgo: '2 min',
  },
  relay: {
    status: 'working',
    task: 'Syncing release notes to Jira',
    channel: '~releases',
    progress: 91,
    startedAgo: '9 min',
  },
};

const IDLE: AgentActivity = { status: 'idle' };

export function getAgentActivity(agentId: string): AgentActivity {
  return ACTIVITY[agentId] ?? IDLE;
}
