import avatarIsabella from '@/assets/avatars/Isabella Cruz.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import type { AgentColor, AgentShape, ChannelMessage, ChannelMessagePart, WorkspaceAgent } from '../agents/agentsData';
import { MATTY } from '../agents/agentsData';

export { MATTY };

export const STAFF_TEAM_LOGO = avatarStaffTeam;

export const PRIYA = {
  name: 'Priya Shah',
  avatarSrc: avatarIsabella,
  avatarAlt: 'Priya Shah',
} as const;

export const JORDAN = {
  name: 'Jordan Lee',
  avatarSrc: avatarArjun,
  avatarAlt: 'Jordan Lee',
} as const;

export const ALEX = {
  name: 'Alex Rivera',
  avatarSrc: avatarEthan,
  avatarAlt: 'Alex Rivera',
} as const;

export const EMMA = {
  name: 'Emma Novak',
  avatarSrc: avatarEmma,
  avatarAlt: 'Emma Novak',
} as const;

export const WRITER: WorkspaceAgent = {
  id: 'writer',
  name: 'Writer',
  role: 'Content',
  owner: 'Priya Shah',
  description: 'Drafts and revises copy for docs pages.',
  shape: 'diamond' as AgentShape,
  color: 'green' as AgentColor,
  channels: [],
  skillIds: ['draft-docs-page'],
};

export const REVIEWER: WorkspaceAgent = {
  id: 'reviewer',
  name: 'Reviewer',
  role: 'Proofreader',
  owner: 'Priya Shah',
  description: 'Checks grammar, style, and broken links.',
  shape: 'hexagon' as AgentShape,
  color: 'purple' as AgentColor,
  channels: [],
};

export const CODER: WorkspaceAgent = {
  id: 'coder',
  name: 'Coder',
  role: 'Builder',
  owner: 'Priya Shah',
  description: 'Researches implementations, builds components, and deploys.',
  shape: 'octagon' as AgentShape,
  color: 'cyan' as AgentColor,
  channels: [],
};

export const MONITOR: WorkspaceAgent = {
  id: 'monitor',
  name: 'Monitor',
  role: 'Monitoring',
  owner: 'Platform team',
  description: 'Watches uptime and triggers playbooks when issues are detected.',
  shape: 'shield' as AgentShape,
  color: 'blue' as AgentColor,
  channels: [],
};

export const DOCS_WORKSPACE_AGENTS: WorkspaceAgent[] = [MATTY, WRITER, REVIEWER, CODER, MONITOR];

export type DocsAgentDmArtifact = {
  title: string;
  meta: string;
  buttonLabel?: string;
};

export type DocsToolCall = {
  tool: string;
  label: string;
};

export type DocsAgentDmMessage = {
  id: string;
  role: 'from' | 'to';
  // For group DMs — which toAgent is speaking. Omit for single-agent DMs.
  agentId?: string;
  text: string;
  // thinking step index at which this message becomes visible. Omit = always visible.
  visibleAtStep?: number;
  parts?: ChannelMessagePart[];
  toolCalls?: DocsToolCall[];
  artifact?: DocsAgentDmArtifact;
  timestamp: string;
};

export const MATTY_CODER_DM_MESSAGES: DocsAgentDmMessage[] = [
  {
    id: 'mc-1',
    role: 'from',
    text: "Hey Coder — Priya asked us to check how SSO works today in the product. I need you to inspect the current SAML and OAuth2 flows, identify the actual step sequence, and write up a summary I can pass to Writer. Check the auth service and any recent config changes.",
    timestamp: '10:02 AM',
  },
  {
    id: 'mc-2',
    role: 'to',
    text: "On it. I'll pull the auth service config, trace the SAML assertion flow, and look at the OAuth2 redirect chain. Should have findings in a few minutes.",
    timestamp: '10:02 AM',
  },
  {
    id: 'mc-3',
    role: 'to',
    text: "Done. SAML flow has changed — IdP-initiated login now skips the relay state step that the docs describe. OAuth2 is unchanged. Full summary ready for Writer.",
    toolCalls: [
      { tool: 'github.get_file_contents', label: 'Read auth/saml/config.yaml' },
      { tool: 'github.search_code', label: 'Searched for SAML assertion handler' },
      { tool: 'github.list_commits', label: 'Checked auth service commit history' },
    ],
    timestamp: '10:04 AM',
  },
];

export const MATTY_CODER_WRITER_GROUP_DM_MESSAGES: DocsAgentDmMessage[] = [
  {
    id: 'mcw-1',
    role: 'from',
    visibleAtStep: 0,
    text: "Hey Coder and Writer — Priya asked us to fix the SSO setup page. Coder, can you inspect the current SAML and OAuth2 flows and write up a summary? Writer, once I have the findings I'll share them and need you to rewrite the SSO setup page to match.",
    parts: [
      { type: 'text', text: 'Hey ' },
      { type: 'mention', id: 'coder', label: 'Coder', avatarSrc: '', kind: 'agent', agentShape: CODER.shape, agentColor: CODER.color },
      { type: 'text', text: ' and ' },
      { type: 'mention', id: 'writer', label: 'Writer', avatarSrc: '', kind: 'agent', agentShape: WRITER.shape, agentColor: WRITER.color },
      { type: 'text', text: " — Priya asked us to fix the SSO setup page. " },
      { type: 'mention', id: 'coder', label: 'Coder', avatarSrc: '', kind: 'agent', agentShape: CODER.shape, agentColor: CODER.color },
      { type: 'text', text: ", can you inspect the current SAML and OAuth2 flows and write up a summary? " },
      { type: 'mention', id: 'writer', label: 'Writer', avatarSrc: '', kind: 'agent', agentShape: WRITER.shape, agentColor: WRITER.color },
      { type: 'text', text: ", once I have the findings I'll share them and need you to rewrite the SSO setup page to match." },
    ],
    timestamp: '10:01 AM',
  },
  {
    id: 'mcw-2',
    role: 'to',
    agentId: 'coder',
    visibleAtStep: 2,
    text: "On it. I'll pull the auth service config, trace the SAML assertion flow, and look at the OAuth2 redirect chain. Should have findings in a few minutes.",
    timestamp: '10:02 AM',
  },
  {
    id: 'mcw-3',
    role: 'to',
    agentId: 'coder',
    visibleAtStep: 5,
    text: "Done. SAML flow has changed — IdP-initiated login now skips the relay state step that the docs describe. OAuth2 is unchanged. Full summary ready for Writer.",
    parts: [
      { type: 'text', text: "Done. SAML flow has changed — IdP-initiated login now skips the relay state step that the docs describe. OAuth2 is unchanged. Full summary ready for " },
      { type: 'mention', id: 'writer', label: 'Writer', avatarSrc: '', kind: 'agent', agentShape: WRITER.shape, agentColor: WRITER.color },
      { type: 'text', text: '.' },
    ],
    toolCalls: [
      { tool: 'github.get_file_contents', label: 'Read auth/saml/config.yaml' },
      { tool: 'github.search_code', label: 'Searched for SAML assertion handler' },
      { tool: 'github.list_commits', label: 'Checked auth service commit history' },
    ],
    artifact: {
      title: 'SSO auth flow findings',
      meta: 'Markdown · 340 words',
    },
    timestamp: '10:04 AM',
  },
  {
    id: 'mcw-4',
    role: 'from',
    visibleAtStep: 6,
    text: "Thanks Coder. Writer — invoking your /draft-page skill. Here are Coder's findings. Rewrite the SSO setup page to match the current flow; keep the same structure but fix every step that changed.",
    parts: [
      { type: 'text', text: 'Thanks ' },
      { type: 'mention', id: 'coder', label: 'Coder', avatarSrc: '', kind: 'agent', agentShape: CODER.shape, agentColor: CODER.color },
      { type: 'text', text: '. ' },
      { type: 'mention', id: 'writer', label: 'Writer', avatarSrc: '', kind: 'agent', agentShape: WRITER.shape, agentColor: WRITER.color },
      { type: 'text', text: " — invoking your /draft-page skill. Here are Coder's findings. Rewrite the SSO setup page to match the current flow; keep the same structure but fix every step that changed." },
    ],
    timestamp: '10:04 AM',
  },
  {
    id: 'mcw-5',
    role: 'to',
    agentId: 'writer',
    visibleAtStep: 9,
    text: "Got it. I'll remove the relay state step, add the new IdP metadata URL field, and reorder the SAML steps. Draft ready for review.",
    artifact: {
      title: 'SSO setup page content — updated draft',
      meta: 'Markdown · 520 words',
    },
    timestamp: '10:06 AM',
  },
  {
    id: 'mcw-6',
    role: 'from',
    visibleAtStep: 10,
    text: "Nice work, Writer. Reviewer, can you review this draft for tone, spelling, grammar, and accuracy before we post it?",
    parts: [
      { type: 'text', text: 'Nice work, ' },
      { type: 'mention', id: 'writer', label: 'Writer', avatarSrc: '', kind: 'agent', agentShape: WRITER.shape, agentColor: WRITER.color },
      { type: 'text', text: '. ' },
      { type: 'mention', id: 'reviewer', label: 'Reviewer', avatarSrc: '', kind: 'agent', agentShape: REVIEWER.shape, agentColor: REVIEWER.color },
      { type: 'text', text: ', can you review this draft for tone, spelling, grammar, and accuracy before we post it?' },
    ],
    timestamp: '10:07 AM',
  },
  {
    id: 'mcw-7',
    role: 'to',
    agentId: 'reviewer',
    visibleAtStep: 12,
    text: "Reviewed. A few minor changes: corrected 'IdP' capitalization throughout, tightened the intro paragraph, and fixed a run-on sentence in the SAML steps section. Revised doc attached.",
    artifact: {
      title: 'SSO setup page content — revised',
      meta: 'Markdown · 528 words',
    },
    timestamp: '10:08 AM',
  },
  {
    id: 'mcw-8',
    role: 'from',
    visibleAtStep: 12,
    text: "Thanks everyone. Posting the revised doc to the thread for Jordan to approve.",
    timestamp: '10:08 AM',
  },
];

export const MATTY_WRITER_DM_MESSAGES: DocsAgentDmMessage[] = [
  {
    id: 'mw-1',
    role: 'from',
    text: "Hey Writer — Coder just finished researching the current SSO flow. I'm attaching the findings. Please rewrite the SSO setup page on docs.mattermost.com to match the actual step sequence. Keep the same page structure but update every step that changed.",
    timestamp: '10:06 AM',
  },
  {
    id: 'mw-2',
    role: 'to',
    text: "Got the research. I'll update the SAML section to remove the relay state step and add the new IdP metadata URL field. Draft ready for review.",
    timestamp: '10:08 AM',
  },
];

export const MATTY_CODER2_DM_MESSAGES: DocsAgentDmMessage[] = [
  {
    id: 'mc2-1',
    role: 'from',
    visibleAtStep: 0,
    text: "Jordan flagged that the new SAML flow has a branching step that's hard to follow as a numbered list. Can you build a collapsible step component — user clicks a branch header to expand the detail — and open a PR against the docs site repo?",
    timestamp: '11:22 AM',
  },
  {
    id: 'mc2-2',
    role: 'to',
    visibleAtStep: 2,
    text: "Got it. I'll scaffold a CollapsibleStep React component, wire it into the SAML branching step, add it to the docs component library, and open a PR. On it.",
    timestamp: '11:22 AM',
  },
  {
    id: 'mc2-3',
    role: 'to',
    visibleAtStep: 7,
    text: "Component built and styled — the branching step now expands inline. Wiring it into the docs component library now before I open the PR.",
    toolCalls: [
      { tool: 'github.search_code', label: 'Found existing docs component patterns' },
      { tool: 'github.create_or_update_file', label: 'Created CollapsibleStep.tsx' },
      { tool: 'github.create_or_update_file', label: 'Created CollapsibleStep.module.css' },
    ],
    timestamp: '11:44 AM',
  },
  {
    id: 'mc2-4',
    role: 'to',
    visibleAtStep: 10,
    text: "PR open against the docs site repo. Build is green.",
    toolCalls: [
      { tool: 'github.create_pull_request', label: 'Opened PR #1851 against docs-site' },
    ],
    artifact: {
      title: 'CollapsibleStep component — PR #1851',
      meta: 'React · 3 files changed',
    },
    timestamp: '11:48 AM',
  },
];

export const MATTY_CODER_SSO_STAGING_DM_MESSAGES: DocsAgentDmMessage[] = [
  {
    id: 'mcss-1',
    role: 'from',
    text: "Jordan approved - can you create a PR with these text updates and deploy it to staging for a last review before publishing to production?",
    timestamp: '10:12 AM',
  },
  {
    id: 'mcss-2',
    role: 'to',
    text: "On it. Triggering the staging deploy pipeline now.",
    timestamp: '10:12 AM',
  },
  {
    id: 'mcss-3',
    role: 'to',
    text: "Deployed. Staging is live — SSO setup page reflects the updated SAML flow.",
    toolCalls: [
      { tool: 'github.create_pull_request', label: 'Opened PR with SSO text updates' },
      { tool: 'github.get_check_runs', label: 'Confirmed build passed' },
    ],
    timestamp: '10:14 AM',
  },
];

export const MATTY_CODER_STAGING_DM_MESSAGES: DocsAgentDmMessage[] = [
  {
    id: 'mcs-1',
    role: 'from',
    text: "Alex approved the CollapsibleStep PR. Can you merge it and deploy to staging?",
    timestamp: '12:11 PM',
  },
  {
    id: 'mcs-2',
    role: 'to',
    text: "On it. Merging now and triggering the staging deploy pipeline.",
    timestamp: '12:11 PM',
  },
  {
    id: 'mcs-3',
    role: 'to',
    text: "Merged and deployed. Staging is live — CollapsibleStep is wired into the SAML section.",
    toolCalls: [
      { tool: 'github.merge_pull_request', label: 'Merged PR #1851' },
    ],
    timestamp: '12:14 PM',
  },
];

export const REVIEWER_WRITER_DM_MESSAGES: DocsAgentDmMessage[] = [
  {
    id: 'rw-1',
    role: 'from',
    text: "Hey Writer — I've reviewed the updated SSO draft. Overall it reads well. Two things: the step numbering in the SAML section resets mid-page, and the link to the IdP metadata URL field points to the old anchor. Can you fix both?",
    timestamp: '10:45 AM',
  },
  {
    id: 'rw-2',
    role: 'to',
    text: "Fixed. Renumbered the SAML steps and updated the anchor. Updated draft is ready.",
    timestamp: '10:46 AM',
  },
];

// ---------------------------------------------------------------------------
// Channel message IDs
// ---------------------------------------------------------------------------

export const DOCS_MSG_EMMA_FLAG = 'docs-emma-flag';
export const DOCS_MSG_PRIYA_REPLY = 'docs-priya-reply';
export const DOCS_MSG_PRIYA_MENTION = 'docs-priya-mention';
export const DOCS_MSG_MATTY_ACK = 'docs-matty-ack';
export const DOCS_MSG_MATTY_CODER_SYSTEM = 'docs-matty-coder-system';
export const DOCS_MSG_MATTY_CODER2_SYSTEM = 'docs-matty-coder2-system';
export const DOCS_MSG_MATTY_CODER_STAGING_SYSTEM = 'docs-matty-coder-staging-system';
export const DOCS_MSG_MATTY_CODER_PR_FIX_SYSTEM = 'docs-matty-coder-pr-fix-system';
export const DOCS_MSG_COLLAPSIBLE_ROOT = 'docs-collapsible-root';
export const DOCS_MSG_MATTY_TRACKER = 'docs-matty-tracker';
export const DOCS_MSG_ALEX_APPROVAL = 'docs-alex-approval';
export const DOCS_MSG_JORDAN_PREVIEW = 'docs-jordan-preview';
export const DOCS_MSG_CODER_DEPLOY = 'docs-coder-deploy';
export const DOCS_MSG_MATTY_ANNOUNCE = 'docs-matty-announce';
export const DOCS_MSG_PRIYA_POSTS = 'docs-priya-posts';
export const DOCS_MSG_EMMA_REACTION = 'docs-emma-reaction';
export const DOCS_MSG_MONITOR_WEBHOOK = 'docs-monitor-webhook';

// Scene message cutoffs — last visible message ID per scene
export const DOCS_SCENE_CUTOFFS: Record<string, string> = {
  channels: DOCS_MSG_EMMA_FLAG,
  grounding: DOCS_MSG_EMMA_FLAG,
  review: DOCS_MSG_COLLAPSIBLE_ROOT,
  approval: DOCS_MSG_COLLAPSIBLE_ROOT,
  'later-that-week': DOCS_MSG_MONITOR_WEBHOOK,
  'matty-chat': DOCS_MSG_EMMA_FLAG,
  'all-agents': DOCS_MSG_EMMA_FLAG,
  'new-agent': DOCS_MSG_EMMA_FLAG,
  'group-chat': DOCS_MSG_EMMA_FLAG,
};

// ---------------------------------------------------------------------------
// Channel messages
// ---------------------------------------------------------------------------

export type DocThreadReply = {
  id?: string;
  username: string;
  avatarSrc: string;
  avatarAlt: string;
  timestamp: string;
  body: string;
  kind?: 'system';
  actionable?: boolean;
  parts?: ChannelMessagePart[];
  artifact?: DocsAgentDmArtifact;
  agentShape?: AgentShape;
  agentColor?: AgentColor;
};

export const THREAD_EMMA_FLAG_REPLIES: DocThreadReply[] = [
  {
    username: PRIYA.name,
    avatarSrc: PRIYA.avatarSrc,
    avatarAlt: PRIYA.avatarAlt,
    timestamp: '10:00 AM',
    body: "Yeah, I've seen a few of these too — mind if I get Matty on it?",
  },
  {
    username: JORDAN.name,
    avatarSrc: JORDAN.avatarSrc,
    avatarAlt: JORDAN.avatarAlt,
    timestamp: '10:00 AM',
    body: 'Go for it. I can review the updated page when it\'s ready.',
  },
  {
    username: PRIYA.name,
    avatarSrc: PRIYA.avatarSrc,
    avatarAlt: PRIYA.avatarAlt,
    timestamp: '10:01 AM',
    body: '@Matty Can we check how SSO actually works today and fix this page to match?',
    parts: [
      {
        type: 'mention',
        id: 'matty',
        label: 'Matty',
        avatarSrc: '',
        kind: 'agent',
        agentShape: MATTY.shape as AgentShape,
        agentColor: MATTY.color as AgentColor,
      },
      {
        type: 'text',
        text: ' Can we check how SSO actually works today and fix this page to match?',
      },
    ],
  },
  {
    username: MATTY.name,
    avatarSrc: '',
    avatarAlt: MATTY.name,
    timestamp: '10:01 AM',
    body: "On it. I'll get Coder to check the latest SSO implementation and then get Writer to propose the text changes.",
    parts: [
      { type: 'text', text: "On it. I'll get " },
      { type: 'mention', id: 'coder', label: 'Coder', avatarSrc: '', kind: 'agent', agentShape: CODER.shape, agentColor: CODER.color },
      { type: 'text', text: ' to check the latest SSO implementation and then get ' },
      { type: 'mention', id: 'writer', label: 'Writer', avatarSrc: '', kind: 'agent', agentShape: WRITER.shape, agentColor: WRITER.color },
      { type: 'text', text: ' to propose the text changes.' },
    ],
    agentShape: MATTY.shape as AgentShape,
    agentColor: MATTY.color as AgentColor,
  },
  {
    id: DOCS_MSG_MATTY_CODER_SYSTEM,
    username: '',
    avatarSrc: '',
    avatarAlt: '',
    timestamp: '10:02 AM',
    body: 'Matty sent a message to Coder and Writer',
    kind: 'system',
    actionable: true,
  },
];

export const THREAD_JORDAN_REACTION_REPLIES: DocThreadReply[] = [
  {
    username: PRIYA.name,
    avatarSrc: PRIYA.avatarSrc,
    avatarAlt: PRIYA.avatarAlt,
    timestamp: '11:21 AM',
    body: 'Good idea. @Matty can you help out with this?',
    parts: [
      { type: 'text', text: 'Good idea. ' },
      { type: 'mention', id: 'matty', label: 'Matty', avatarSrc: '', kind: 'agent', agentShape: MATTY.shape as AgentShape, agentColor: MATTY.color as AgentColor },
      { type: 'text', text: ' can you help out with this?' },
    ],
  },
  {
    username: MATTY.name,
    avatarSrc: '',
    avatarAlt: MATTY.name,
    timestamp: '11:22 AM',
    body: "Yes — I'll have Coder build it and open a PR against the docs site repo. Jordan, I'll tag you for review once it's up.",
    agentShape: MATTY.shape as AgentShape,
    agentColor: MATTY.color as AgentColor,
  },
];

export const THREAD_CODER_PR_REPLIES: DocThreadReply[] = [
  {
    username: ALEX.name,
    avatarSrc: ALEX.avatarSrc,
    avatarAlt: ALEX.avatarAlt,
    timestamp: '11:52 AM',
    body: 'Reviewing now. Component API looks clean — leaving one comment on prop naming.',
  },
  {
    id: DOCS_MSG_MATTY_CODER_PR_FIX_SYSTEM,
    username: '',
    avatarSrc: '',
    avatarAlt: '',
    timestamp: '11:53 AM',
    body: 'Matty sent a message to Coder',
    kind: 'system' as const,
    actionable: true,
  },
  {
    username: ALEX.name,
    avatarSrc: ALEX.avatarSrc,
    avatarAlt: ALEX.avatarAlt,
    timestamp: '12:10 PM',
    body: 'Approved.',
  },
];

export const THREAD_COLLAPSIBLE_REPLIES: DocThreadReply[] = [
  {
    username: PRIYA.name,
    avatarSrc: PRIYA.avatarSrc,
    avatarAlt: PRIYA.avatarAlt,
    timestamp: '11:21 AM',
    body: 'Good idea. @Matty can you handle this? Tag @Alex Rivera for code review and @Jordan Lee for a final review once it\'s on staging.',
    parts: [
      { type: 'text', text: 'Good idea. ' },
      { type: 'mention', id: 'matty', label: 'Matty', avatarSrc: '', kind: 'agent' as const, agentShape: MATTY.shape as AgentShape, agentColor: MATTY.color as AgentColor },
      { type: 'text', text: ' can you handle this? Tag ' },
      { type: 'mention', id: 'alex', label: 'Alex Rivera', avatarSrc: ALEX.avatarSrc, kind: 'person' as const },
      { type: 'text', text: ' for code review and ' },
      { type: 'mention', id: 'jordan', label: 'Jordan Lee', avatarSrc: JORDAN.avatarSrc, kind: 'person' as const },
      { type: 'text', text: ' for a final review once it\'s on staging.' },
    ],
  },
  {
    username: MATTY.name,
    avatarSrc: '',
    avatarAlt: MATTY.name,
    timestamp: '11:22 AM',
    body: "On it. I'll have Coder build the component and open a PR — I'll tag Alex for code review and Jordan for a final check once it's on staging.",
    agentShape: MATTY.shape as AgentShape,
    agentColor: MATTY.color as AgentColor,
  },
  {
    id: DOCS_MSG_MATTY_CODER2_SYSTEM,
    username: '',
    avatarSrc: '',
    avatarAlt: '',
    timestamp: '11:22 AM',
    body: 'Matty sent a message to Coder',
    kind: 'system',
    actionable: true,
  },
];

export const THREAD_ANNOUNCE_REPLIES: DocThreadReply[] = [
  {
    username: PRIYA.name,
    avatarSrc: PRIYA.avatarSrc,
    avatarAlt: PRIYA.avatarAlt,
    timestamp: '12:23 PM',
    body: 'Sent to the support team channel.',
  },
  {
    username: EMMA.name,
    avatarSrc: EMMA.avatarSrc,
    avatarAlt: EMMA.avatarAlt,
    timestamp: '12:25 PM',
    body: 'Perfect — already linking customers to the updated page. This is exactly what we needed.',
  },
];

// Post-delegation replies for the collapsible thread — rendered conditionally in
// DocsChannelHome once the Coder2 delegation card settles (delegationSettled).
export const THREAD_COLLAPSIBLE_POST_DELEGATION: DocThreadReply[] = [
  {
    username: MATTY.name,
    avatarSrc: '',
    avatarAlt: MATTY.name,
    timestamp: '11:48 AM',
    body: 'CollapsibleStep component is built and wired into the SAML section — PR is open. @Alex Rivera, can you take a look when you get a chance?',
    parts: [
      { type: 'text', text: 'CollapsibleStep component is built and wired into the SAML section — PR is open. ' },
      { type: 'mention', id: 'alex', label: 'Alex Rivera', avatarSrc: ALEX.avatarSrc, kind: 'person' as const },
      { type: 'text', text: ', can you take a look when you get a chance?' },
    ],
    artifact: {
      title: 'CollapsibleStep component — PR #1851',
      meta: 'React · 3 files changed',
    },
    agentShape: MATTY.shape as AgentShape,
    agentColor: MATTY.color as AgentColor,
  },
  ...THREAD_CODER_PR_REPLIES,
  {
    id: DOCS_MSG_MATTY_CODER_STAGING_SYSTEM,
    username: '',
    avatarSrc: '',
    avatarAlt: '',
    timestamp: '12:11 PM',
    body: 'Matty sent a message to Coder',
    kind: 'system' as const,
    actionable: true,
  },
];

// ---------------------------------------------------------------------------
// Unified thread map — single source of truth for all threaded posts.
// To add a new threaded channel post: add one entry here keyed by the
// channel message ID. The channel render loop derives ThreadFooter props
// and RHS content entirely from this map.
// ---------------------------------------------------------------------------

export type DocsThreadParticipant = {
  key: string;
  name: string;
  avatarSrc?: string;
  agentShape?: AgentShape;
  agentColor?: AgentColor;
};

export type DocsTypingStep = {
  // Reveal replies[0..afterIndex-1] before showing this typing indicator.
  afterIndex: number;
  // Accessibility label for the dots; defaults to 'Typing…'
  label?: string;
};

export type DocsThread = {
  replyCount: number;
  lastReplyTime: string;
  participants: DocsThreadParticipant[];
  replies: DocThreadReply[];
  // Each step shows a typing indicator then reveals the next batch of replies.
  typing?: DocsTypingStep[];
};

// ---------------------------------------------------------------------------
// Historical channel messages (Mon–Thu)
// These always render above the "Today" separator, regardless of scene.
// ---------------------------------------------------------------------------

export const DOCS_HIST_MON_JORDAN = 'hist-mon-jordan';
export const DOCS_HIST_TUE_WRITER = 'hist-tue-writer';
export const DOCS_HIST_WED_ALEX = 'hist-wed-alex';
export const DOCS_HIST_THU_EMMA = 'hist-thu-emma';

export type DocsHistoryEntry =
  | { kind: 'date-separator'; id: string; label: string }
  | ChannelMessage;

const HIST_THREAD_MON_REPLIES: DocThreadReply[] = [
  {
    username: ALEX.name, avatarSrc: ALEX.avatarSrc, avatarAlt: ALEX.avatarAlt,
    timestamp: '9:32 AM',
    body: 'Confirmed — tested a few links, all redirecting properly.',
  },
  {
    username: PRIYA.name, avatarSrc: PRIYA.avatarSrc, avatarAlt: PRIYA.avatarAlt,
    timestamp: '9:45 AM',
    body: "Thanks for tracking that. I'll update the footer links in our onboarding guide too.",
  },
];

const HIST_THREAD_TUE_REPLIES: DocThreadReply[] = [
  {
    username: JORDAN.name, avatarSrc: JORDAN.avatarSrc, avatarAlt: JORDAN.avatarAlt,
    timestamp: '2:11 PM',
    body: "I'll take the authentication guide — it's been on my list.",
  },
  {
    username: EMMA.name, avatarSrc: EMMA.avatarSrc, avatarAlt: EMMA.avatarAlt,
    timestamp: '2:15 PM',
    body: "On the changelog — I can pull the v8.2 release notes and add the missing entries. Will aim for end of week.",
  },
];

const HIST_THREAD_WED_REPLIES: DocThreadReply[] = [
  {
    username: REVIEWER.name, avatarSrc: '', avatarAlt: REVIEWER.name,
    timestamp: '11:02 AM',
    body: "Reviewed. Samples look accurate. One note: the batch endpoint examples don't mention rate limiting — customers will hit that limit and be confused. Worth adding a callout.",
    agentShape: REVIEWER.shape,
    agentColor: REVIEWER.color,
  },
  {
    username: ALEX.name, avatarSrc: ALEX.avatarSrc, avatarAlt: ALEX.avatarAlt,
    timestamp: '11:18 AM',
    body: 'Good catch — added a rate limit callout to the batch section. Force-pushed.',
  },
  {
    username: JORDAN.name, avatarSrc: JORDAN.avatarSrc, avatarAlt: JORDAN.avatarAlt,
    timestamp: '11:35 AM',
    body: 'Looks good, merged.',
  },
];

const HIST_THREAD_THU_REPLIES: DocThreadReply[] = [
  {
    username: PRIYA.name, avatarSrc: PRIYA.avatarSrc, avatarAlt: PRIYA.avatarAlt,
    timestamp: '1:42 PM',
    body: "It hasn't been touched in a while — I think it predates the v8 auth changes. Should add it to Friday's review list.",
  },
  {
    username: JORDAN.name, avatarSrc: JORDAN.avatarSrc, avatarAlt: JORDAN.avatarAlt,
    timestamp: '1:55 PM',
    body: "Added. Share the tickets if you can, Emma — I can use them to figure out which steps are causing the most confusion.",
  },
];

export const DOCS_HISTORY_ENTRIES: DocsHistoryEntry[] = [
  { kind: 'date-separator', id: 'sep-mon', label: 'Monday' },
  {
    id: DOCS_HIST_MON_JORDAN,
    username: JORDAN.name,
    avatarSrc: JORDAN.avatarSrc,
    avatarAlt: JORDAN.avatarAlt,
    timestamp: '9:14 AM',
    body: 'Heads up: v8 API reference pages are now archived. Redirects are live — all v7 links should resolve correctly.',
  },
  { kind: 'date-separator', id: 'sep-tue', label: 'Tuesday' },
  {
    id: DOCS_HIST_TUE_WRITER,
    kind: 'agent' as const,
    username: WRITER.name,
    avatarSrc: '',
    avatarAlt: WRITER.name,
    timestamp: '9:00 AM',
    body: 'Weekly digest for docs-site — 3 pages updated: SSO setup, Webhooks overview, API quickstart. 2 pages flagged for review: Authentication guide (last updated 14 months ago) and Changelog (missing v8.2 entries).',
    agentShape: WRITER.shape,
    agentColor: WRITER.color,
  },
  { kind: 'date-separator', id: 'sep-wed', label: 'Wednesday' },
  {
    id: DOCS_HIST_WED_ALEX,
    username: ALEX.name,
    avatarSrc: ALEX.avatarSrc,
    avatarAlt: ALEX.avatarAlt,
    timestamp: '10:48 AM',
    body: "PR #1847 is open — new code samples for the plugin API docs. Should be a quick review if anyone has time.",
  },
  { kind: 'date-separator', id: 'sep-thu', label: 'Thursday' },
  {
    id: DOCS_HIST_THU_EMMA,
    username: EMMA.name,
    avatarSrc: EMMA.avatarSrc,
    avatarAlt: EMMA.avatarAlt,
    timestamp: '1:33 PM',
    body: "Heads up — getting a few support tickets this week about the SSO setup steps. The screenshots look like they're from a much older version. Anyone know when it was last updated?",
  },
];

export const DOCS_THREADS: Record<string, DocsThread> = {
  [DOCS_HIST_MON_JORDAN]: {
    replyCount: 2,
    lastReplyTime: '9:45 AM',
    participants: [
      { key: 'alex', name: 'Alex Rivera', avatarSrc: ALEX.avatarSrc },
      { key: 'priya', name: 'Priya Shah', avatarSrc: PRIYA.avatarSrc },
    ],
    replies: HIST_THREAD_MON_REPLIES,
  },
  [DOCS_HIST_TUE_WRITER]: {
    replyCount: 2,
    lastReplyTime: '2:15 PM',
    participants: [
      { key: 'jordan', name: 'Jordan Lee', avatarSrc: JORDAN.avatarSrc },
      { key: 'emma', name: 'Emma Novak', avatarSrc: EMMA.avatarSrc },
    ],
    replies: HIST_THREAD_TUE_REPLIES,
  },
  [DOCS_HIST_WED_ALEX]: {
    replyCount: 3,
    lastReplyTime: '11:35 AM',
    participants: [
      { key: 'reviewer', name: 'Reviewer', agentShape: REVIEWER.shape, agentColor: REVIEWER.color },
      { key: 'alex', name: 'Alex Rivera', avatarSrc: ALEX.avatarSrc },
      { key: 'jordan', name: 'Jordan Lee', avatarSrc: JORDAN.avatarSrc },
    ],
    replies: HIST_THREAD_WED_REPLIES,
  },
  [DOCS_HIST_THU_EMMA]: {
    replyCount: 2,
    lastReplyTime: '1:55 PM',
    participants: [
      { key: 'priya', name: 'Priya Shah', avatarSrc: PRIYA.avatarSrc },
      { key: 'jordan', name: 'Jordan Lee', avatarSrc: JORDAN.avatarSrc },
    ],
    replies: HIST_THREAD_THU_REPLIES,
  },
  'docs-seed-1': {
    replyCount: 2,
    lastReplyTime: '9:31 AM',
    participants: [
      { key: 'alex', name: 'Alex Rivera', avatarSrc: ALEX.avatarSrc },
      { key: 'priya', name: 'Priya Shah', avatarSrc: PRIYA.avatarSrc },
    ],
    replies: [
      {
        username: ALEX.name,
        avatarSrc: ALEX.avatarSrc,
        avatarAlt: ALEX.avatarAlt,
        timestamp: '9:18 AM',
        body: "Will do. I've got two open against the API reference — should be able to close them today.",
      },
      {
        username: PRIYA.name,
        avatarSrc: PRIYA.avatarSrc,
        avatarAlt: PRIYA.avatarAlt,
        timestamp: '9:31 AM',
        body: 'Thanks Jordan. Also — anyone know when the new onboarding page redesign lands? Customer success is asking.',
      },
    ],
  },
  [DOCS_MSG_EMMA_FLAG]: {
    replyCount: 2,
    lastReplyTime: '10:00 AM',
    participants: [
      { key: 'priya', name: 'Priya Shah', avatarSrc: PRIYA.avatarSrc },
      { key: 'jordan', name: 'Jordan Lee', avatarSrc: JORDAN.avatarSrc },
    ],
    replies: THREAD_EMMA_FLAG_REPLIES,
    typing: [
      { afterIndex: 2, label: 'Priya is typing' },
      { afterIndex: 3, label: 'Matty is thinking' },
    ],
  },
  [DOCS_MSG_MATTY_ANNOUNCE]: {
    replyCount: 2,
    lastReplyTime: '12:25 PM',
    participants: [
      { key: 'priya', name: 'Priya Shah', avatarSrc: PRIYA.avatarSrc },
      { key: 'emma', name: 'Emma Novak', avatarSrc: EMMA.avatarSrc },
    ],
    replies: THREAD_ANNOUNCE_REPLIES,
  },
  [DOCS_MSG_MONITOR_WEBHOOK]: {
    replyCount: 1,
    lastReplyTime: 'Thu, Sep 18 · 3:14 AM',
    participants: [
      { key: 'monitor', name: 'Monitor', agentShape: MONITOR.shape as AgentShape, agentColor: MONITOR.color as AgentColor },
    ],
    replies: [
      {
        username: MONITOR.name,
        avatarSrc: '',
        avatarAlt: MONITOR.name,
        timestamp: 'Thu, Sep 18 · 3:14 AM',
        body: "Uptime check failed. Want me to start the 'Docs Site Outage' playbook? I'd assign Coder to investigate.",
        agentShape: MONITOR.shape,
        agentColor: MONITOR.color,
      },
    ],
  },
  [DOCS_MSG_COLLAPSIBLE_ROOT]: {
    replyCount: 14,
    lastReplyTime: '12:20 PM',
    participants: [
      { key: 'priya', name: 'Priya Shah', avatarSrc: PRIYA.avatarSrc },
      { key: 'matty', name: 'Matty', agentShape: MATTY.shape as AgentShape, agentColor: MATTY.color as AgentColor },
      { key: 'coder', name: 'Coder', agentShape: CODER.shape, agentColor: CODER.color },
      { key: 'alex', name: 'Alex Rivera', avatarSrc: ALEX.avatarSrc },
      { key: 'jordan', name: 'Jordan Lee', avatarSrc: JORDAN.avatarSrc },
    ],
    replies: THREAD_COLLAPSIBLE_REPLIES,
    typing: [
      { afterIndex: 0, label: 'Priya is typing' },
      { afterIndex: 1, label: 'Matty is thinking' },
      { afterIndex: 3, label: 'Coder is building…' },
    ],
  },
};

export const DOCS_CHANNEL_MESSAGES: ChannelMessage[] = [
  // Pre-seeded chatter (Alex + Priya replies are in DOCS_THREADS['docs-seed-1'])
  {
    id: 'docs-seed-1',
    username: JORDAN.name,
    avatarSrc: JORDAN.avatarSrc,
    avatarAlt: JORDAN.avatarAlt,
    timestamp: '9:14 AM',
    body: 'Quick reminder — the quarterly docs review is this Friday. Anyone with open PRs please get them merged or close them out.',
  },

  // Act 1: Emma flags; Priya, Jordan, and Matty respond in the thread
  {
    id: DOCS_MSG_EMMA_FLAG,
    username: EMMA.name,
    avatarSrc: EMMA.avatarSrc,
    avatarAlt: EMMA.avatarAlt,
    timestamp: '9:58 AM',
    body: "Getting a steady trickle of support tickets about the SSO setup steps on the onboarding page — looks like it's out of date.",
  },

  // Act 2–3: Coder research, Writer draft, and Reviewer feedback all happen in the Emma thread.
  // Act 3: Jordan flags a UX issue; Matty delegates to Coder; all in one thread.
  {
    id: DOCS_MSG_COLLAPSIBLE_ROOT,
    username: JORDAN.name,
    avatarSrc: JORDAN.avatarSrc,
    avatarAlt: JORDAN.avatarAlt,
    timestamp: '11:20 AM',
    body: "New changes to the SSO page look solid. One thing — the new SAML flow has a branching step that's going to be confusing as a numbered list. Could we get a collapsible component for that section?",
  },

  // Act 4: Announce + Emma reaction (tracker/approval/deploy live in the collapsible thread)
  {
    id: DOCS_MSG_MATTY_ANNOUNCE,
    kind: 'agent',
    username: MATTY.name,
    avatarSrc: '',
    avatarAlt: MATTY.name,
    timestamp: '12:21 PM',
    body: "Page is live. Here's a support team announcement you can send: \"The SSO setup page has been updated to reflect the current SAML flow. The relay state step has been removed and the IdP metadata URL field is now documented. Link: docs.mattermost.com/onboarding/sso-setup\"",
    agentShape: MATTY.shape as AgentShape,
    agentColor: MATTY.color as AgentColor,
  },
  // Act 5: Mattermost Web Services webhook — Monitor replies in thread
  {
    id: DOCS_MSG_MONITOR_WEBHOOK,
    kind: 'webhook',
    username: 'Mattermost Web Services',
    avatarSrc: '',
    avatarAlt: 'Mattermost Web Services',
    timestamp: 'Thu, Sep 18 · 3:14 AM',
    body: 'docs.mattermost.com uptime failure detected',
    webhookPost: {
      color: 'danger',
      title: 'Uptime failure: docs.mattermost.com',
      text: 'Health check failed at 3:14 AM. Status 503 from primary and fallback nodes.',
      fields: [
        { title: 'Endpoint', value: 'docs.mattermost.com/health', short: true },
        { title: 'Status', value: '503 Service Unavailable', short: true },
        { title: 'Duration', value: '4 min 12 s and counting', short: false },
      ],
      footer: 'Monitor · docs-site uptime check',
    },
  },
];
