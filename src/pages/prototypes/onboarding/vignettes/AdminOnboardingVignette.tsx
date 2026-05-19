import { useState } from 'react';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import PoundIcon from '@mattermost/compass-icons/components/pound';
import SendIcon from '@mattermost/compass-icons/components/send';
import WebhookIcon from '@mattermost/compass-icons/components/webhook';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import CheckIcon from '@mattermost/compass-icons/components/check';
import FlagOutlineIcon from '@mattermost/compass-icons/components/flag-outline';
import AdminConsoleHeader from '@/components/ui/AdminConsoleHeader/AdminConsoleHeader';
import AdminConsoleSidebar from '@/components/ui/AdminConsoleSidebar/AdminConsoleSidebar';
import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import AdminPanelFooter from '@/components/ui/AdminPanelFooter/AdminPanelFooter';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import PopoverNotice from '@/components/ui/PopoverNotice/PopoverNotice';
import ProgressBar from '@/components/ui/ProgressBar/ProgressBar';
import Radio from '@/components/ui/Radio/Radio';
import RightSidebar, {
  RightSidebarHeader,
} from '@/components/ui/RightSidebar';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import Switch from '@/components/ui/Switch/Switch';
import TextInput from '@/components/ui/TextInput/TextInput';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { defaultAdminConsoleSidebarGroups } from '@/components/ui/AdminConsoleSidebar/adminConsoleSidebarModel';
import { AGENT, CURRENT_USER } from '../onboarding.fixtures';
import styles from './AdminOnboardingVignette.module.scss';

type AdminSubScene = 'setup' | 'agentic';

const ADMIN_SUB_SCENES: { id: AdminSubScene; label: string }[] = [
  { id: 'setup', label: 'Setup checklist' },
  { id: 'agentic', label: 'Agentic helper' },
];

interface AgentSuggestedPrompt {
  id: string;
  label: string;
  category: string;
}

const AGENT_PROMPTS: AgentSuggestedPrompt[] = [
  {
    id: 'sso',
    label: 'Walk me through SSO setup',
    category: 'Authentication',
  },
  {
    id: 'retention',
    label: 'How should I configure data retention?',
    category: 'Compliance',
  },
  {
    id: 'bulk-invite',
    label: 'Help me invite users in bulk',
    category: 'Users',
  },
  {
    id: 'integrations',
    label: 'Which integrations should I install first?',
    category: 'Integrations',
  },
];

interface AgentScriptedReply {
  body: string;
  actions: { label: string; emphasis: 'Primary' | 'Tertiary' }[];
}

const AGENT_REPLIES: Record<string, AgentScriptedReply> = {
  sso: {
    body:
      'For your SecOps preset, I recommend SAML 2.0 with Okta or Azure AD. Three steps:\n\n1. Paste your IdP metadata URL above\n2. Configure attribute mapping — I can do this for you\n3. Test with a pilot user before rolling out\n\nWant me to start with step 1?',
    actions: [
      { label: 'Yes, configure', emphasis: 'Primary' },
      { label: 'Open SAML docs', emphasis: 'Tertiary' },
    ],
  },
  retention: {
    body:
      'For SecOps, 180-day default with per-channel overrides is the most common. Case-file channels often need indefinite retention. I can apply that profile for you, or walk through the trade-offs.',
    actions: [
      { label: 'Apply SecOps default', emphasis: 'Primary' },
      { label: 'Explain trade-offs', emphasis: 'Tertiary' },
    ],
  },
  'bulk-invite': {
    body:
      'You can paste up to 200 email addresses (comma- or newline-separated) and I’ll send invites. If you have an IdP set up, I can also sync user groups instead.',
    actions: [
      { label: 'Paste emails', emphasis: 'Primary' },
      { label: 'Sync from IdP', emphasis: 'Tertiary' },
    ],
  },
  integrations: {
    body:
      'For SecOps the high-value first integrations are: an incident-response webhook (PagerDuty / Opsgenie), a ticketing slash command (Jira / ServiceNow), and the Mattermost Agent plugin (already on). Install the first two now?',
    actions: [
      { label: 'Install both', emphasis: 'Primary' },
      { label: 'Pick one at a time', emphasis: 'Tertiary' },
    ],
  },
};

type PresetId = 'secops' | 'defense' | 'intelligence' | 'critical-infra';

interface PresetDef {
  key: PresetId;
  label: string;
  tagline: string;
  description: string;
  defined: boolean;
}

const PRESETS: PresetDef[] = [
  {
    key: 'secops',
    label: 'Security Operations',
    tagline: 'SOC, threat response, incident handling',
    description:
      'Recommended for security operations centers. SSO/SAML required, audit logging on, retention tuned for case files.',
    defined: true,
  },
  {
    key: 'defense',
    label: 'Defense',
    tagline: 'Mission planning and coordination',
    description:
      'Coming soon. Defense-tailored defaults — restricted federation, classified channel patterns, deployment runbooks.',
    defined: false,
  },
  {
    key: 'intelligence',
    label: 'Intelligence',
    tagline: 'Analysis, briefings, source handling',
    description:
      'Coming soon. Intelligence-tailored defaults — strict access controls, source-protection retention, briefing templates.',
    defined: false,
  },
  {
    key: 'critical-infra',
    label: 'Critical Infrastructure',
    tagline: 'Utilities, transport, healthcare',
    description:
      'Coming soon. Critical-infra defaults — operator handovers, regulator-friendly retention, vendor-side guest controls.',
    defined: false,
  },
];

const PRESET_BY_ID: Record<PresetId, PresetDef> = PRESETS.reduce(
  (acc, p) => {
    acc[p.key] = p;
    return acc;
  },
  {} as Record<PresetId, PresetDef>,
);

interface ChecklistItem {
  id: string;
  label: string;
  blurb: string;
  icon: React.ReactNode;
  panel: PanelView;
}

type PanelView =
  | 'overview'
  | 'invite'
  | 'channel'
  | 'integration'
  | 'sso'
  | 'agent';

const CHECKLIST: ChecklistItem[] = [
  {
    id: 'invite',
    label: 'Invite your first user',
    blurb: 'Add a teammate so you can test the workspace end-to-end.',
    icon: <Icon size="16" glyph={<AccountPlusOutlineIcon />} />,
    panel: 'invite',
  },
  {
    id: 'channel',
    label: 'Create your first channel',
    blurb: 'Start a focused space for your team.',
    icon: <Icon size="16" glyph={<PoundIcon />} />,
    panel: 'channel',
  },
  {
    id: 'integration',
    label: 'Add your first integration',
    blurb: 'Webhook, slash command, or plugin — wire Mattermost into your stack.',
    icon: <Icon size="16" glyph={<WebhookIcon />} />,
    panel: 'integration',
  },
  {
    id: 'sso',
    label: 'Configure SSO / SAML',
    blurb: 'Bring your identity provider in for enterprise sign-in.',
    icon: <Icon size="16" glyph={<ShieldOutlineIcon />} />,
    panel: 'sso',
  },
  {
    id: 'agent',
    label: 'Enable Mattermost Agent',
    blurb: 'Turn on the AI assistant your team can chat with in channels.',
    icon: <Icon size="16" glyph={<CreationOutlineIcon />} />,
    panel: 'agent',
  },
];

const SIDEBAR_BASE_GROUPS = defaultAdminConsoleSidebarGroups.map((group) => ({
  ...group,
  stickyCategory: false,
  items: group.items.map((item) => ({ ...item, active: false })),
}));

function buildSidebarGroups(opts: {
  welcomeActive: boolean;
  samlActive?: boolean;
}) {
  const baseGroups = opts.samlActive
    ? SIDEBAR_BASE_GROUPS.map((group) =>
        group.key === 'authentication'
          ? {
              ...group,
              items: group.items.map((item) =>
                item.name === 'SAML 2.0' ? { ...item, active: true } : item,
              ),
            }
          : group,
      )
    : SIDEBAR_BASE_GROUPS;
  return [
    {
      key: 'get-started',
      categoryLabel: 'Get started',
      categoryIconKey: 'experimental' as const,
      stickyCategory: true,
      items: [{ name: 'Welcome', active: opts.welcomeActive }],
    },
    ...baseGroups,
  ];
}

export default function AdminOnboardingVignette() {
  const [subScene, setSubScene] = useState<AdminSubScene>('setup');
  const [preset, setPreset] = useState<PresetId | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [panel, setPanel] = useState<PanelView>('overview');
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentActivePromptId, setAgentActivePromptId] = useState<string | null>(
    null,
  );

  const completion = (checked.size / CHECKLIST.length) * 100;
  const activePreset = preset ? PRESET_BY_ID[preset] : null;

  const toggleChecked = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const isAgentic = subScene === 'agentic';

  return (
    <div className={styles['admin-onboarding']}>
      <div className={styles['admin-onboarding__sub-switcher']}>
        <SceneSwitcher
          scenes={ADMIN_SUB_SCENES}
          activeId={subScene}
          onChange={(id) => {
            setSubScene(id as AdminSubScene);
            setAgentOpen(false);
            setAgentActivePromptId(null);
          }}
          ariaLabel="Admin onboarding sub-scene"
        />
      </div>

      <div className={styles['admin-onboarding__frame']}>
        <div className={styles['admin-onboarding__sidebar-mount']}>
          <AdminConsoleSidebar
            avatarSrc={CURRENT_USER.avatarSrc}
            avatarAlt={CURRENT_USER.name}
            userDisplayName={CURRENT_USER.name}
            groups={buildSidebarGroups({
              welcomeActive: !isAgentic && panel === 'overview',
              samlActive: isAgentic,
            })}
          />
        </div>

        <div className={styles['admin-onboarding__main']}>
          <AdminConsoleHeader
            title={
              isAgentic
                ? 'SAML 2.0'
                : panel === 'overview'
                  ? activePreset
                    ? 'Set up your workspace'
                    : 'Welcome to Mattermost'
                  : 'Setup'
            }
            showBack={!isAgentic && panel !== 'overview'}
            onBackClick={() => setPanel('overview')}
            enterpriseBadge
            enterpriseBadgeLabel="Enterprise Advanced"
          />

          <div className={styles['admin-onboarding__scroll']}>
            <Scrollbars>
              <div className={styles['admin-onboarding__panels']}>
                {isAgentic ? (
                  <AgenticConsoleContent />
                ) : (
                  <>
                    {panel === 'overview' &&
                      (activePreset ? (
                        <>
                          <ChecklistPanel
                            preset={activePreset}
                            completion={completion}
                            checked={checked}
                            onToggle={toggleChecked}
                            onItemClick={(item) => setPanel(item.panel)}
                            onChangePreset={() => setPreset(null)}
                          />
                          {activePreset.key === 'secops' ? (
                            <SecOpsRecommendations />
                          ) : (
                            <PresetStub label={activePreset.label} />
                          )}
                        </>
                      ) : (
                        <PresetPicker onSelect={setPreset} />
                      ))}

                    {panel === 'invite' && <InvitePanel />}
                    {panel === 'channel' && <ChannelPanel />}
                    {panel === 'integration' && <IntegrationPanel />}
                    {panel === 'sso' && <SsoPanel />}
                    {panel === 'agent' && <AgentPanel />}
                  </>
                )}
              </div>
            </Scrollbars>
          </div>

          <AdminPanelFooter saveDisabled={false} />
        </div>

        {isAgentic && agentOpen && (
          <div className={styles['admin-onboarding__rhs-mount']}>
            <AgentHelperPanel
              activePromptId={agentActivePromptId}
              onPromptSelect={setAgentActivePromptId}
              onReset={() => setAgentActivePromptId(null)}
              onClose={() => setAgentOpen(false)}
            />
          </div>
        )}

        {isAgentic && !agentOpen && (
          <FloatingAgentButton
            showPulse={agentActivePromptId === null}
            onClick={() => setAgentOpen(true)}
          />
        )}
      </div>
    </div>
  );
}

/* ─────────── Agentic sub-scene ─────────── */

function AgenticConsoleContent() {
  return (
    <>
      <AdminPanel
        title="SAML 2.0"
        subtitle="Connect your identity provider for enterprise sign-in."
      >
        <div className={styles['settings']}>
          <SettingToggle
            label="Enable SAML 2.0"
            help="Required for SecOps-aligned workspaces."
            defaultOn
          />
          <TextInput
            label="Identity provider metadata URL"
            defaultValue=""
          />
          <TextInput
            label="Service provider login URL"
            defaultValue="https://acme-defense.mattermost.com/login/sso/saml"
          />
          <TextInput
            label="Service provider entity ID"
            defaultValue="https://acme-defense.mattermost.com"
          />
        </div>
      </AdminPanel>

      <AdminPanel
        title="Attribute mapping"
        subtitle="Map SAML attributes from your IdP to Mattermost user fields."
      >
        <div className={styles['settings']}>
          <TextInput label="Email attribute" defaultValue="email" />
          <TextInput label="Username attribute" defaultValue="username" />
          <TextInput
            label="First name attribute"
            defaultValue="firstName"
          />
          <TextInput label="Last name attribute" defaultValue="lastName" />
        </div>
      </AdminPanel>
    </>
  );
}

function FloatingAgentButton({
  showPulse,
  onClick,
}: {
  showPulse: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={[
        styles['agent-fab'],
        showPulse ? styles['agent-fab--pulse'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      aria-label="Open Mattermost Agent"
    >
      <UserAvatar src={AGENT.avatarSrc} alt="" size="40" />
    </button>
  );
}

function AgentHelperPanel({
  activePromptId,
  onPromptSelect,
  onReset,
  onClose,
}: {
  activePromptId: string | null;
  onPromptSelect: (id: string) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const reply = activePromptId ? AGENT_REPLIES[activePromptId] : null;
  const activePrompt = activePromptId
    ? AGENT_PROMPTS.find((p) => p.id === activePromptId)
    : null;

  return (
    <RightSidebar
      className={styles['agent-rhs']}
      header={
        <RightSidebarHeader
          title={AGENT.name}
          secondaryTitle="Admin helper"
          labelTag="Agent"
          labelTagType="Info"
          leadingIcon={
            <UserAvatar src={AGENT.avatarSrc} alt={AGENT.name} size="24" />
          }
          onClose={onClose}
        />
      }
      footer={
        <div className={styles['agent-rhs__composer']}>
          <input
            className={styles['agent-rhs__input']}
            type="text"
            placeholder="Ask Mattermost Agent…"
          />
          <IconButton
            aria-label="Send"
            size="Small"
            icon={<Icon size="16" glyph={<SendIcon />} />}
          />
        </div>
      }
    >
      <div className={styles['agent-rhs__body']}>
        {!activePrompt && (
          <>
            <p className={styles['agent-rhs__lede']}>
              Hi {CURRENT_USER.name.split(' ')[0]} — I can recommend defaults,
              explain what a setting does, or configure things for you. Try one
              to start:
            </p>
            <div className={styles['agent-rhs__prompts']}>
              {AGENT_PROMPTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={styles['agent-rhs__prompt']}
                  onClick={() => onPromptSelect(p.id)}
                >
                  <span className={styles['agent-rhs__prompt-cat']}>
                    {p.category}
                  </span>
                  <span className={styles['agent-rhs__prompt-text']}>
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {activePrompt && reply && (
          <div className={styles['agent-rhs__convo']}>
            <div
              className={[
                styles['agent-rhs__bubble'],
                styles['agent-rhs__bubble--user'],
              ].join(' ')}
            >
              {activePrompt.label}
            </div>
            <div
              className={[
                styles['agent-rhs__bubble'],
                styles['agent-rhs__bubble--agent'],
              ].join(' ')}
            >
              {reply.body.split('\n').map((line, i) => (
                <p key={i} className={styles['agent-rhs__bubble-line']}>
                  {line}
                </p>
              ))}
              <div className={styles['agent-rhs__bubble-actions']}>
                {reply.actions.map((action) => (
                  <Button
                    key={action.label}
                    emphasis={action.emphasis}
                    size="X-Small"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
            <button
              type="button"
              className={styles['agent-rhs__reset']}
              onClick={onReset}
            >
              Ask something else
            </button>
          </div>
        )}
      </div>
    </RightSidebar>
  );
}

function PresetPicker({ onSelect }: { onSelect: (id: PresetId) => void }) {
  return (
    <AdminPanel
      title="Tell us about your workspace"
      subtitle="We’ll tailor the setup checklist and recommended defaults to your mission. You can change this any time."
      leadingIcon={<Icon size="20" glyph={<FlagOutlineIcon />} />}
      iconLeft
    >
      <div className={styles['preset-picker__grid']}>
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={styles['preset-picker__option']}
            onClick={() => onSelect(p.key)}
          >
            <span className={styles['preset-picker__option-head']}>
              <span className={styles['preset-picker__option-label']}>
                {p.label}
              </span>
              {!p.defined && (
                <LabelTag label="Coming soon" type="Info Dim" size="X-Small" />
              )}
            </span>
            <span className={styles['preset-picker__option-tagline']}>
              {p.tagline}
            </span>
            <span className={styles['preset-picker__option-desc']}>
              {p.description}
            </span>
          </button>
        ))}
      </div>
    </AdminPanel>
  );
}

function ChecklistPanel({
  preset,
  completion,
  checked,
  onToggle,
  onItemClick,
  onChangePreset,
}: {
  preset: PresetDef;
  completion: number;
  checked: Set<string>;
  onToggle: (id: string) => void;
  onItemClick: (item: ChecklistItem) => void;
  onChangePreset: () => void;
}) {
  return (
    <AdminPanel
      title="Get your workspace ready"
      subtitle={`Tailored for ${preset.label}. Five quick steps to a workspace your team can use today.`}
      leadingIcon={<Icon size="20" glyph={<FlagOutlineIcon />} />}
      iconLeft
      headerActions={
        <div className={styles['checklist__head-actions']}>
          <LabelTag label={preset.label} type="Info" size="X-Small" />
          <Button emphasis="Tertiary" size="Small" onClick={onChangePreset}>
            Change
          </Button>
        </div>
      }
    >
      <div className={styles['checklist__body']}>
        <div className={styles['checklist__progress-row']}>
          <span className={styles['checklist__progress-label']}>
            {checked.size} of {CHECKLIST.length} complete
          </span>
          <ProgressBar
            size="Small"
            value={completion}
            aria-label="Admin setup progress"
          />
        </div>
        <ul className={styles['checklist__items']}>
          {CHECKLIST.map((item) => {
            const isChecked = checked.has(item.id);
            return (
              <li key={item.id} className={styles['checklist__item']}>
                <button
                  type="button"
                  className={[
                    styles['checklist__check'],
                    isChecked ? styles['checklist__check--on'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-pressed={isChecked}
                  aria-label={
                    isChecked
                      ? `Mark ${item.label} incomplete`
                      : `Mark ${item.label} complete`
                  }
                  onClick={() => onToggle(item.id)}
                >
                  {isChecked && <Icon size="16" glyph={<CheckIcon />} />}
                </button>
                <div className={styles['checklist__text']}>
                  <span className={styles['checklist__label']}>
                    <span className={styles['checklist__icon']} aria-hidden>
                      {item.icon}
                    </span>
                    {item.label}
                  </span>
                  <span className={styles['checklist__blurb']}>
                    {item.blurb}
                  </span>
                </div>
                <Button
                  emphasis="Tertiary"
                  size="Small"
                  onClick={() => onItemClick(item)}
                >
                  Open
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </AdminPanel>
  );
}

function SecOpsRecommendations() {
  return (
    <AdminPanel
      title="SecOps recommended defaults"
      subtitle="Pre-selected for SecOps workspaces. Preset values are illustrative."
    >
      <div className={styles['settings']}>
        <SettingToggle
          label="Require SAML 2.0 for all users"
          help="Disable email/password login once SAML is configured."
          defaultOn
        />
        <SettingToggle
          label="Audit logging"
          help="Stream session, configuration, and authentication events to your SIEM."
          defaultOn
        />
        <SettingToggle
          label="Restrict guest accounts"
          help="Guests cannot join private channels by default."
          defaultOn
        />
        <SettingToggle
          label="Message retention — 180 days"
          help="Override with channel-specific policies for case files."
          defaultOn
        />
      </div>
    </AdminPanel>
  );
}

function PresetStub({ label }: { label: string }) {
  return (
    <AdminPanel
      title={`${label} preset — coming soon`}
      subtitle="Recommended defaults for this vertical are in design. The checklist above is the universal starting point."
    >
      <p className={styles['settings__stub']}>
        Preset content TBD. This vertical will get its own recommended defaults
        once we’ve aligned on what they should be.
      </p>
    </AdminPanel>
  );
}

function InvitePanel() {
  return (
    <AdminPanel
      title="Invite your first user"
      subtitle="Send invitations or generate a join link."
    >
      <div className={styles['settings']}>
        <TextInput label="Email addresses" defaultValue="aiko@acme-defense.com" />
        <SettingHelp>
          You can also share an invite link from{' '}
          <code className={styles['settings__code']}>Workspace → Invitations</code>.
        </SettingHelp>
      </div>
    </AdminPanel>
  );
}

function ChannelPanel() {
  return (
    <AdminPanel
      title="Create your first channel"
      subtitle="Channels organize conversations by topic, project, or team."
    >
      <div className={styles['settings']}>
        <TextInput label="Channel name" defaultValue="ops-handover" />
        <TextInput
          label="Purpose"
          defaultValue="Daily handover notes between shifts."
        />
        <div className={styles['settings__row']}>
          <Radio name="channel-type" size="Medium" defaultChecked>
            Public
          </Radio>
          <Radio name="channel-type" size="Medium">
            Private
          </Radio>
        </div>
      </div>
    </AdminPanel>
  );
}

function IntegrationPanel() {
  const options = [
    {
      id: 'webhook',
      label: 'Incoming webhook',
      blurb: 'Post messages from external systems.',
    },
    {
      id: 'slash',
      label: 'Slash command',
      blurb: 'Trigger workflows from the composer.',
    },
    {
      id: 'plugin',
      label: 'Plugin',
      blurb: 'Install a packaged integration.',
    },
  ];
  return (
    <AdminPanel
      title="Add your first integration"
      subtitle="Webhooks, slash commands, and plugins extend Mattermost into your stack."
    >
      <div className={styles['integration-grid']}>
        {options.map((opt) => (
          <div key={opt.id} className={styles['integration-card']}>
            <span className={styles['integration-card__label']}>{opt.label}</span>
            <span className={styles['integration-card__blurb']}>{opt.blurb}</span>
            <Button emphasis="Tertiary" size="Small">
              Configure
            </Button>
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}

function SsoPanel() {
  return (
    <AdminPanel
      title="SAML 2.0"
      subtitle="Connect your identity provider for enterprise sign-in."
    >
      <div className={styles['sso-row']}>
        <div className={styles['settings']}>
          <SettingToggle
            label="Allow unauthenticated access for some endpoints"
            help="Allow specific endpoints (e.g. push notifications) without sign-in."
          />
          <TextInput label="Identity provider metadata URL" />
          <TextInput
            label="Service provider login URL"
            defaultValue="https://acme-defense.mattermost.com/login/sso/saml"
          />
        </div>
        <div className={styles['sso-row__notice']}>
          <PopoverNotice
            title="Why this matters"
            variant="info"
          >
            Leaving unauthenticated access broad is a common SecOps audit finding.
            Most workspaces should keep this off and route everything through SAML.
          </PopoverNotice>
        </div>
      </div>
    </AdminPanel>
  );
}

function AgentPanel() {
  return (
    <AdminPanel
      title="Mattermost Agent"
      subtitle="Enable AI assistance directly inside channels and DMs."
      showSwitch
      defaultSwitchChecked
      switchLabel="Enabled"
    >
      <div className={styles['settings']}>
        <SettingHelp>
          Agent is a first-class setup step — not a buried plugin. When enabled,
          users can summon Agent from any channel and start a DM to ask
          questions about their workspace.
        </SettingHelp>
        <div className={styles['agent-row']}>
          <div className={styles['agent-row__model']}>
            <span className={styles['agent-row__label']}>Model</span>
            <span className={styles['agent-row__value']}>Mattermost-hosted</span>
          </div>
          <Button emphasis="Tertiary" size="Small">
            Switch provider
          </Button>
        </div>
      </div>
    </AdminPanel>
  );
}

function SettingToggle({
  label,
  help,
  defaultOn = false,
}: {
  label: string;
  help: string;
  defaultOn?: boolean;
}) {
  return (
    <div className={styles['settings__setting']}>
      <div className={styles['settings__setting-row']}>
        <span className={styles['settings__setting-label']}>{label}</span>
        <Switch defaultChecked={defaultOn} size="Medium" />
      </div>
      <p className={styles['settings__help']}>{help}</p>
    </div>
  );
}

function SettingHelp({ children }: { children: React.ReactNode }) {
  return <p className={styles['settings__help']}>{children}</p>;
}
