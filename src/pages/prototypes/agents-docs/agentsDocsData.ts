import avatarIsabella from '@/assets/avatars/Isabella Cruz.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import type { AgentColor, AgentShape, ChannelMessage, WorkspaceAgent } from '../agents/agentsData';
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

export type DocsAgentDmMessage = {
  id: string;
  role: 'from' | 'to';
  text: string;
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
    timestamp: '10:04 AM',
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
    text: "Jordan flagged that the new SAML flow has a branching step that's hard to follow as a numbered list. Can you build a collapsible step component — user clicks a branch header to expand the detail — and open a PR against the docs site repo?",
    timestamp: '11:22 AM',
  },
  {
    id: 'mc2-2',
    role: 'to',
    text: "Got it. I'll scaffold a CollapsibleStep React component, add it to the docs site component library, and wire it into the SAML section. PR incoming.",
    timestamp: '11:22 AM',
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
export const DOCS_MSG_CODER_RESEARCH = 'docs-coder-research';
export const DOCS_MSG_MATTY_REVIEW_CARD = 'docs-matty-review-card';
export const DOCS_MSG_MATTY_WRITER_SYSTEM = 'docs-matty-writer-system';
export const DOCS_MSG_WRITER_DRAFT = 'docs-writer-draft';
export const DOCS_MSG_REVIEWER_WRITER_SYSTEM = 'docs-reviewer-writer-system';
export const DOCS_MSG_JORDAN_REACTION = 'docs-jordan-reaction';
export const DOCS_MSG_MATTY_CODER2_SYSTEM = 'docs-matty-coder2-system';
export const DOCS_MSG_CODER_PR = 'docs-coder-pr';
export const DOCS_MSG_MATTY_TRACKER = 'docs-matty-tracker';
export const DOCS_MSG_ALEX_APPROVAL = 'docs-alex-approval';
export const DOCS_MSG_JORDAN_PREVIEW = 'docs-jordan-preview';
export const DOCS_MSG_CODER_DEPLOY = 'docs-coder-deploy';
export const DOCS_MSG_MATTY_ANNOUNCE = 'docs-matty-announce';
export const DOCS_MSG_PRIYA_POSTS = 'docs-priya-posts';
export const DOCS_MSG_EMMA_REACTION = 'docs-emma-reaction';
export const DOCS_MSG_MONITOR_WEBHOOK = 'docs-monitor-webhook';
export const DOCS_MSG_MONITOR_PLAYBOOK = 'docs-monitor-playbook';

// Scene message cutoffs — last visible message ID per scene
export const DOCS_SCENE_CUTOFFS: Record<string, string> = {
  channels: DOCS_MSG_MATTY_ACK,
  grounding: DOCS_MSG_WRITER_DRAFT,
  review: DOCS_MSG_CODER_PR,
  approval: DOCS_MSG_EMMA_REACTION,
  'later-that-week': DOCS_MSG_MONITOR_PLAYBOOK,
  'matty-chat': DOCS_MSG_MATTY_ACK,
  'all-agents': DOCS_MSG_MATTY_ACK,
  'new-agent': DOCS_MSG_MATTY_ACK,
  'group-chat': DOCS_MSG_MATTY_ACK,
};

// ---------------------------------------------------------------------------
// Channel messages
// ---------------------------------------------------------------------------

export const DOCS_CHANNEL_MESSAGES: ChannelMessage[] = [
  // Pre-seeded chatter
  {
    id: 'docs-seed-1',
    username: JORDAN.name,
    avatarSrc: JORDAN.avatarSrc,
    avatarAlt: JORDAN.avatarAlt,
    timestamp: '9:14 AM',
    body: 'Quick reminder — the quarterly docs review is this Friday. Anyone with open PRs please get them merged or close them out.',
  },
  {
    id: 'docs-seed-2',
    username: ALEX.name,
    avatarSrc: ALEX.avatarSrc,
    avatarAlt: ALEX.avatarAlt,
    timestamp: '9:18 AM',
    body: "Will do. I've got two open against the API reference — should be able to close them today.",
  },
  {
    id: 'docs-seed-3',
    username: PRIYA.name,
    avatarSrc: PRIYA.avatarSrc,
    avatarAlt: PRIYA.avatarAlt,
    timestamp: '9:31 AM',
    body: 'Thanks Jordan. Also — anyone know when the new onboarding page redesign lands? Customer success is asking.',
    threadReplies: {
      count: 2,
      lastReplyTime: '9:45 AM',
      participants: [
        { key: 'jordan', name: 'Jordan Lee', avatarSrc: JORDAN.avatarSrc },
        { key: 'alex', name: 'Alex Rivera', avatarSrc: ALEX.avatarSrc },
      ],
    },
  },

  // Act 1: Emma flags, Priya delegates, Matty acks
  {
    id: DOCS_MSG_EMMA_FLAG,
    username: EMMA.name,
    avatarSrc: EMMA.avatarSrc,
    avatarAlt: EMMA.avatarAlt,
    timestamp: '9:58 AM',
    body: "Getting a steady trickle of support tickets about the SSO setup steps on the onboarding page — looks like it's out of date.",
  },
  {
    id: DOCS_MSG_PRIYA_REPLY,
    username: PRIYA.name,
    avatarSrc: PRIYA.avatarSrc,
    avatarAlt: PRIYA.avatarAlt,
    timestamp: '10:00 AM',
    body: "Yeah, I've seen a few of these too — mind if I get Matty on it?",
    threadReplies: {
      count: 1,
      lastReplyTime: '10:01 AM',
      participants: [
        { key: 'jordan', name: 'Jordan Lee', avatarSrc: JORDAN.avatarSrc },
      ],
    },
  },
  {
    id: DOCS_MSG_PRIYA_MENTION,
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
    id: DOCS_MSG_MATTY_ACK,
    kind: 'agent',
    username: MATTY.name,
    avatarSrc: '',
    avatarAlt: MATTY.name,
    timestamp: '10:01 AM',
    body: "On it. I'll check the current SSO implementation and get the docs page updated to match.",
    agentShape: MATTY.shape as AgentShape,
    agentColor: MATTY.color as AgentColor,
  },

  // Act 2: Coder research + Writer draft
  {
    id: DOCS_MSG_MATTY_CODER_SYSTEM,
    kind: 'system',
    username: '',
    avatarSrc: '',
    avatarAlt: '',
    timestamp: '10:02 AM',
    body: 'Matty sent a message to Coder',
    actionable: true,
  },
  {
    id: DOCS_MSG_CODER_RESEARCH,
    kind: 'agent',
    username: CODER.name,
    avatarSrc: '',
    avatarAlt: CODER.name,
    timestamp: '10:04 AM',
    body: "SSO research complete. The SAML flow has changed — IdP-initiated login now skips the relay state step the docs describe. OAuth2 flow is unchanged. I've written up a full summary of the current step sequence.",
    agentShape: CODER.shape,
    agentColor: CODER.color,
  },
  {
    id: DOCS_MSG_MATTY_REVIEW_CARD,
    kind: 'agent',
    username: MATTY.name,
    avatarSrc: '',
    avatarAlt: MATTY.name,
    timestamp: '10:05 AM',
    body: "Coder found the discrepancy. Ready to loop in Writer to rewrite the SSO page. Approve to continue.",
    agentShape: MATTY.shape as AgentShape,
    agentColor: MATTY.color as AgentColor,
    agentReviewCard: {
      agentId: 'writer',
      name: WRITER.name,
      description: WRITER.description,
      approved: true,
    },
  },
  {
    id: DOCS_MSG_MATTY_WRITER_SYSTEM,
    kind: 'system',
    username: '',
    avatarSrc: '',
    avatarAlt: '',
    timestamp: '10:06 AM',
    body: 'Matty sent a message to Writer',
    actionable: true,
  },
  {
    id: DOCS_MSG_WRITER_DRAFT,
    kind: 'agent',
    username: WRITER.name,
    avatarSrc: '',
    avatarAlt: WRITER.name,
    timestamp: '10:09 AM',
    body: "Updated SSO setup page draft is ready. I've removed the relay state step, added the IdP metadata URL field, and reordered the SAML steps to match the current flow. Ready for review.",
    agentShape: WRITER.shape,
    agentColor: WRITER.color,
  },

  // Act 3: Reviewer + Jordan + Coder component build
  {
    id: DOCS_MSG_REVIEWER_WRITER_SYSTEM,
    kind: 'system',
    username: '',
    avatarSrc: '',
    avatarAlt: '',
    timestamp: '10:44 AM',
    body: 'Reviewer sent a message to Writer',
    actionable: true,
  },
  {
    id: DOCS_MSG_JORDAN_REACTION,
    username: JORDAN.name,
    avatarSrc: JORDAN.avatarSrc,
    avatarAlt: JORDAN.avatarAlt,
    timestamp: '11:20 AM',
    body: "Looks solid. One thing — the new SAML flow has a branching step that's going to be confusing as a numbered list. Could we get a collapsible component for that section?",
    threadReplies: {
      count: 2,
      lastReplyTime: '11:22 AM',
      participants: [
        { key: 'priya', name: 'Priya Shah', avatarSrc: PRIYA.avatarSrc },
        { key: 'matty', name: 'Matty', agentShape: MATTY.shape as AgentShape, agentColor: MATTY.color as AgentColor },
      ],
    },
  },
  {
    id: DOCS_MSG_MATTY_CODER2_SYSTEM,
    kind: 'system',
    username: '',
    avatarSrc: '',
    avatarAlt: '',
    timestamp: '11:22 AM',
    body: 'Matty sent a message to Coder',
    actionable: true,
  },
  {
    id: DOCS_MSG_CODER_PR,
    kind: 'agent',
    username: CODER.name,
    avatarSrc: '',
    avatarAlt: CODER.name,
    timestamp: '11:48 AM',
    body: 'CollapsibleStep component built and wired into the SAML section. PR open.',
    agentShape: CODER.shape,
    agentColor: CODER.color,
    threadReplies: {
      count: 3,
      lastReplyTime: '12:10 PM',
      participants: [
        { key: 'alex', name: 'Alex Rivera', avatarSrc: ALEX.avatarSrc },
        { key: 'coder', name: 'Coder', agentShape: CODER.shape, agentColor: CODER.color },
      ],
    },
  },

  // Act 4: Parallel tracker, Alex approval, Jordan preview, deploy, announce
  {
    id: DOCS_MSG_MATTY_TRACKER,
    kind: 'agent',
    username: MATTY.name,
    avatarSrc: '',
    avatarAlt: MATTY.name,
    timestamp: '12:05 PM',
    body: 'Running final checks in parallel before publish.',
    agentShape: MATTY.shape as AgentShape,
    agentColor: MATTY.color as AgentColor,
  },
  {
    id: DOCS_MSG_ALEX_APPROVAL,
    username: ALEX.name,
    avatarSrc: ALEX.avatarSrc,
    avatarAlt: ALEX.avatarAlt,
    timestamp: '12:10 PM',
    body: "Code looks good — approved the PR. The CollapsibleStep component is clean.",
    reactions: [{ emoji: '✅', count: 2 }],
  },
  {
    id: DOCS_MSG_JORDAN_PREVIEW,
    username: JORDAN.name,
    avatarSrc: JORDAN.avatarSrc,
    avatarAlt: JORDAN.avatarAlt,
    timestamp: '12:15 PM',
    body: 'Staging preview looks great. Approving.',
    reactions: [{ emoji: '🚀', count: 1 }],
  },
  {
    id: DOCS_MSG_CODER_DEPLOY,
    kind: 'agent',
    username: CODER.name,
    avatarSrc: '',
    avatarAlt: CODER.name,
    timestamp: '12:20 PM',
    body: 'SSO setup page published to docs.mattermost.com. Deploy complete.',
    agentShape: CODER.shape,
    agentColor: CODER.color,
  },
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
  {
    id: DOCS_MSG_PRIYA_POSTS,
    username: PRIYA.name,
    avatarSrc: PRIYA.avatarSrc,
    avatarAlt: PRIYA.avatarAlt,
    timestamp: '12:23 PM',
    body: 'Sent to the support team channel.',
    reactions: [{ emoji: '👏', count: 3 }],
  },
  {
    id: DOCS_MSG_EMMA_REACTION,
    username: EMMA.name,
    avatarSrc: EMMA.avatarSrc,
    avatarAlt: EMMA.avatarAlt,
    timestamp: '12:25 PM',
    body: "Perfect — already linking customers to the updated page. This is exactly what we needed.",
    reactions: [{ emoji: '🙌', count: 2 }],
  },

  // Act 5: Monitor webhook + playbook auto-start
  {
    id: DOCS_MSG_MONITOR_WEBHOOK,
    kind: 'webhook',
    username: 'Monitor',
    avatarSrc: '',
    avatarAlt: 'Monitor',
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
  {
    id: DOCS_MSG_MONITOR_PLAYBOOK,
    kind: 'agent',
    username: MONITOR.name,
    avatarSrc: '',
    avatarAlt: MONITOR.name,
    timestamp: 'Thu, Sep 18 · 3:14 AM',
    body: 'Uptime check failed. I\'ve auto-started the "Docs Site Outage" playbook. Coder is assigned to triage.',
    agentShape: MONITOR.shape,
    agentColor: MONITOR.color,
  },
];
