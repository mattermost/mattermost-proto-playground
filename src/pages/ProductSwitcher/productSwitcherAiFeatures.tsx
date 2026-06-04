import { useEffect, useState, type ReactNode } from 'react';
import type { ComponentType } from 'react';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import CalendarOutlineIcon from '@mattermost/compass-icons/components/calendar-outline';
import CodeTagsIcon from '@mattermost/compass-icons/components/code-tags';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import SourceBranchIcon from '@mattermost/compass-icons/components/source-branch';
import CheckboxMarkedCircleOutlineIcon from '@mattermost/compass-icons/components/checkbox-marked-circle-outline';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import MessageInput from '@/components/ui/MessageInput';
import Radio from '@/components/ui/Radio/Radio';
import RightSidebar from '@/components/ui/RightSidebar/RightSidebar';
import RightSidebarHeader from '@/components/ui/RightSidebar/RightSidebarHeader/RightSidebarHeader';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SelectMenu from '@/components/ui/SelectMenu';
import Tabs from '@/components/ui/Tabs/Tabs';
import TextArea from '@/components/ui/TextArea/TextArea';
import TextInput from '@/components/ui/TextInput/TextInput';
import styles from './ProductSwitcher.module.scss';

export type AutomationTrigger =
  | 'message-posted'
  | 'scheduled'
  | 'membership-changed'
  | 'channel-created'
  | 'user-joined-team';

export interface ChannelAutomation {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  channelLabel?: string;
  enabled: boolean;
  summary: string;
}

export type AgentsIntent =
  | { type: 'create-automation'; prefill?: string }
  | { type: 'open-matty-code' }
  | null;

export type AgentsPanel =
  | 'recaps'
  | 'create'
  | 'agents'
  | 'agent-create'
  | 'automations'
  | 'automation-create'
  | 'wiki-create'
  | 'matty-code'
  | 'custom-prompts';

export type CustomPromptVisibility = 'public' | 'private';

export type WikiVisibility = 'public' | 'private';

export interface WikiPageDraft {
  id: string;
  title: string;
  space: string;
  description: string;
  sourceNotes: string;
  visibility: WikiVisibility;
}

export interface CustomPrompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
  visibility: CustomPromptVisibility;
  createdByMe: boolean;
}

export const DEFAULT_CUSTOM_PROMPTS: CustomPrompt[] = [
  {
    id: 'daily-focus',
    name: 'Daily focus brief',
    description:
      'Morning summary of priorities across channels, tasks, and meetings.',
    prompt:
      'Each weekday morning, summarise my top three priorities for the day based on mentions, Jira tasks due today, and meetings on my calendar.',
    visibility: 'public',
    createdByMe: false,
  },
  {
    id: 'pr-review',
    name: 'PR review checklist',
    description:
      'Structured pass over open pull requests assigned for review.',
    prompt:
      'Review my assigned pull requests and flag anything missing tests, unclear naming, or blocking comments from the last 48 hours.',
    visibility: 'public',
    createdByMe: false,
  },
  {
    id: 'meeting-summary',
    name: 'Meeting summariser',
    description: 'Turn a thread or notes into decisions and action items.',
    prompt:
      'Summarise this meeting thread into decisions made, owners, and follow-ups due this week.',
    visibility: 'public',
    createdByMe: false,
  },
  {
    id: 'weekly-retro',
    name: 'Weekly retrospective',
    description: 'Lightweight retro prompt for the team channel.',
    prompt:
      'Draft a weekly retrospective post covering what shipped, what stalled, and one process tweak we should try next week.',
    visibility: 'public',
    createdByMe: false,
  },
  {
    id: 'standup-prep',
    name: 'Standup prep',
    description: 'Pull blockers and updates before the daily call.',
    prompt:
      'Summarise what I shipped yesterday, what I am working on today, and any blockers from my open threads and Jira tickets.',
    visibility: 'private',
    createdByMe: true,
  },
];

export interface SuperAgent {
  id: string;
  name: string;
  description: string;
  createdByMe: boolean;
}

export const DEFAULT_SUPER_AGENTS: SuperAgent[] = [
  {
    id: 'matty',
    name: 'Matty',
    description: 'General AI assistant for Mattermost workflows and recaps.',
    createdByMe: false,
  },
  {
    id: 'onboarding-helper',
    name: 'Onboarding helper',
    description: 'Answers new-hire questions from the handbook and past threads.',
    createdByMe: true,
  },
  {
    id: 'pr-review-bot',
    name: 'PR review bot',
    description: 'Summarises open pull requests and flags missing tests.',
    createdByMe: false,
  },
  {
    id: 'standup-facilitator',
    name: 'Standup facilitator',
    description: 'Collects async standup updates before the live call.',
    createdByMe: true,
  },
];

const TRIGGER_META: Record<
  AutomationTrigger,
  { label: string; icon: ComponentType<{ size?: number }> }
> = {
  'message-posted': { label: 'Message posted', icon: MessageTextOutlineIcon },
  scheduled: { label: 'Scheduled', icon: CalendarOutlineIcon },
  'membership-changed': { label: 'Membership changed', icon: AccountPlusOutlineIcon },
  'channel-created': { label: 'Channel created', icon: LightningBoltOutlineIcon },
  'user-joined-team': { label: 'User joined team', icon: AccountPlusOutlineIcon },
};

export const DEFAULT_AUTOMATIONS: ChannelAutomation[] = [
  {
    id: 'it-support',
    name: 'IT support auto-reply',
    trigger: 'message-posted',
    channelLabel: '#ask-it',
    enabled: true,
    summary:
      'When someone posts in #ask-it, search past threads and reply as the IT support bot.',
  },
  {
    id: 'standup-reminder',
    name: 'Weekly standup reminder',
    trigger: 'scheduled',
    channelLabel: '#engineering',
    enabled: true,
    summary: 'Every Monday at 9:00, post a standup prompt to #engineering.',
  },
  {
    id: 'welcome-dm',
    name: 'New member welcome',
    trigger: 'membership-changed',
    channelLabel: '#town-square',
    enabled: false,
    summary: 'When someone joins #town-square, send them a welcome DM from Matty.',
  },
];

const AUTOMATION_TRIGGERS = Object.keys(TRIGGER_META) as AutomationTrigger[];

export interface AutomationsRhsPanelProps {
  automations: ChannelAutomation[];
  onAutomationsChange: (next: ChannelAutomation[]) => void;
  onClose: () => void;
  onCreateAutomation: () => void;
}

function AutomationsList({
  automations,
  onAutomationsChange,
}: {
  automations: ChannelAutomation[];
  onAutomationsChange: (next: ChannelAutomation[]) => void;
}) {
  const toggleAutomation = (id: string) => {
    onAutomationsChange(
      automations.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const deleteAutomation = (id: string) => {
    onAutomationsChange(automations.filter((item) => item.id !== id));
  };

  return (
    <ul className={styles['product-switcher__automations-list']}>
      {automations.map((automation) => {
        const trigger = TRIGGER_META[automation.trigger];
        const TriggerIcon = trigger.icon;
        return (
          <li
            key={automation.id}
            className={styles['product-switcher__automation-row']}
          >
            <div className={styles['product-switcher__automation-row-main']}>
              <span
                className={styles['product-switcher__automation-row-icon']}
                aria-hidden
              >
                <Icon size="16" glyph={<TriggerIcon />} />
              </span>
              <div className={styles['product-switcher__automation-row-text']}>
                <span className={styles['product-switcher__automation-row-name']}>
                  {automation.name}
                </span>
                <span className={styles['product-switcher__automation-row-trigger']}>
                  {trigger.label}
                  {automation.channelLabel ? ` · ${automation.channelLabel}` : ''}
                </span>
              </div>
            </div>
            <div className={styles['product-switcher__automation-row-actions']}>
              <button
                type="button"
                className={[
                  styles['product-switcher__automation-toggle'],
                  automation.enabled
                    ? styles['product-switcher__automation-toggle--on']
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={automation.enabled}
                aria-label={
                  automation.enabled
                    ? `Disable ${automation.name}`
                    : `Enable ${automation.name}`
                }
                onClick={() => toggleAutomation(automation.id)}
              >
                {automation.enabled ? 'On' : 'Off'}
              </button>
              <IconButton
                size="Small"
                aria-label={`Edit ${automation.name}`}
                icon={<Icon size="16" glyph={<PencilOutlineIcon />} />}
              />
              <IconButton
                size="Small"
                aria-label={`Delete ${automation.name}`}
                icon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
                onClick={() => deleteAutomation(automation.id)}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function AutomationsRhsPanel({
  automations,
  onAutomationsChange,
  onClose,
  onCreateAutomation,
}: AutomationsRhsPanelProps) {
  return (
    <RightSidebar
      className={styles['product-switcher__automations-rhs']}
      header={
        <RightSidebarHeader
          title="Automations"
          secondaryTitle="Town Square"
          labelTag="Beta"
          leadingIcon={<Icon size="16" glyph={<LightningBoltOutlineIcon />} />}
          onClose={onClose}
        />
      }
      footer={
        <div className={styles['product-switcher__automations-rhs-footer']}>
          <IconButton
            aria-label="New automation"
            size="Small"
            icon={<Icon size="16" glyph={<PlusIcon />} />}
            onClick={onCreateAutomation}
          />
        </div>
      }
    >
      <div className={styles['product-switcher__automations-rhs-body']}>
        <p className={styles['product-switcher__automations-rhs-intro']}>
          Trigger-action workflows for this channel. Create new automations from
          the Automations page or manage existing ones here.
        </p>
        <AutomationsList
          automations={automations}
          onAutomationsChange={onAutomationsChange}
        />
      </div>
    </RightSidebar>
  );
}

export interface AutomationsManageViewProps {
  automations: ChannelAutomation[];
  onAutomationsChange: (next: ChannelAutomation[]) => void;
  onBack: () => void;
  onCreateAutomation: () => void;
}

export function AutomationsManageView({
  automations,
  onAutomationsChange,
  onBack,
  onCreateAutomation,
}: AutomationsManageViewProps) {
  return (
    <div className={styles['product-switcher__feature-panel']}>
      <header className={styles['product-switcher__feature-panel-header']}>
        <IconButton
          aria-label="Back"
          size="Small"
          icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          onClick={onBack}
        />
        <span className={styles['product-switcher__feature-panel-title']}>
          Automations
        </span>
        <Button emphasis="Primary" size="Small" onClick={onCreateAutomation}>
          Create new automation
        </Button>
      </header>
      <Scrollbars>
        <div className={styles['product-switcher__feature-panel-body']}>
          <p className={styles['product-switcher__feature-panel-intro']}>
            Automations run a trigger and an ordered pipeline of actions — AI
            prompts, channel messages, and DMs. Only channel admins can create
            them today.
          </p>
          <AutomationsList
            automations={automations}
            onAutomationsChange={onAutomationsChange}
          />
        </div>
      </Scrollbars>
    </div>
  );
}

export interface CustomPromptListRecap {
  id: string;
  label: string;
  leadingVisual?: ReactNode;
}

export interface CustomPromptsManageViewProps {
  prompts: CustomPrompt[];
  recaps: CustomPromptListRecap[];
  onBack: () => void;
  onCreatePrompt: () => void;
  onSelectPrompt: (id: string) => void;
  onSelectRecap: (id: string) => void;
}

export function CustomPromptsManageView({
  prompts,
  recaps,
  onBack,
  onCreatePrompt,
  onSelectPrompt,
  onSelectRecap,
}: CustomPromptsManageViewProps) {
  const [filter, setFilter] = useState<'all' | 'mine'>('all');

  const visiblePrompts =
    filter === 'mine' ? prompts.filter((prompt) => prompt.createdByMe) : prompts;
  const visibleRecaps = filter === 'mine' ? recaps : [];
  const hasItems = visiblePrompts.length > 0 || visibleRecaps.length > 0;

  return (
    <div className={styles['product-switcher__feature-panel']}>
      <header className={styles['product-switcher__feature-panel-header']}>
        <IconButton
          aria-label="Back"
          size="Small"
          icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          onClick={onBack}
        />
        <span className={styles['product-switcher__feature-panel-title']}>
          Custom Prompts
        </span>
        <Button emphasis="Primary" size="Small" onClick={onCreatePrompt}>
          Create new custom prompt
        </Button>
      </header>
      <Scrollbars>
        <div className={styles['product-switcher__feature-panel-body']}>
          <p className={styles['product-switcher__feature-panel-intro']}>
            Saved prompts you can rerun in Agents or pin to a workflow. Open
            one to view or edit the full prompt text.
          </p>
          <Tabs
            className={styles['product-switcher__agents-tabs']}
            tabs={[
              { key: 'all', label: 'All prompts' },
              { key: 'mine', label: 'My prompts' },
            ]}
            activeKey={filter}
            onChange={(key) => {
              if (key === 'all' || key === 'mine') setFilter(key);
            }}
          />
          {hasItems ? (
            <ul className={styles['product-switcher__custom-prompts-list']}>
              {visiblePrompts.map((prompt) => (
                <li key={prompt.id}>
                  <button
                    type="button"
                    className={styles['product-switcher__custom-prompt-row']}
                    onClick={() => onSelectPrompt(prompt.id)}
                  >
                    <span
                      className={styles['product-switcher__custom-prompt-row-icon']}
                      aria-hidden
                    >
                      <Icon size="16" glyph={<BookmarkOutlineIcon />} />
                    </span>
                    <span className={styles['product-switcher__custom-prompt-row-text']}>
                      <span
                        className={styles['product-switcher__custom-prompt-row-name']}
                      >
                        {prompt.name}
                      </span>
                      <span
                        className={
                          styles['product-switcher__custom-prompt-row-description']
                        }
                      >
                        {prompt.description}
                        {prompt.createdByMe ? ' · Created by you' : ''}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {visibleRecaps.map((recap) => (
                <li key={recap.id}>
                  <button
                    type="button"
                    className={styles['product-switcher__custom-prompt-row']}
                    onClick={() => onSelectRecap(recap.id)}
                  >
                    {recap.leadingVisual ? (
                      <span
                        className={[
                          styles['product-switcher__custom-prompt-row-icon'],
                          styles['product-switcher__custom-prompt-row-icon--brand'],
                        ].join(' ')}
                        aria-hidden
                      >
                        {recap.leadingVisual}
                      </span>
                    ) : (
                      <span
                        className={styles['product-switcher__custom-prompt-row-icon']}
                        aria-hidden
                      >
                        <Icon size="16" glyph={<BookmarkOutlineIcon />} />
                      </span>
                    )}
                    <span className={styles['product-switcher__custom-prompt-row-text']}>
                      <span
                        className={styles['product-switcher__custom-prompt-row-name']}
                      >
                        {recap.label}
                      </span>
                      <span
                        className={
                          styles['product-switcher__custom-prompt-row-description']
                        }
                      >
                        Scheduled recap prompt
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles['product-switcher__agents-empty']}>
              {filter === 'mine'
                ? "You haven't created a prompt yet. Use Create new custom prompt above to add one."
                : 'No prompts match this filter.'}
            </p>
          )}
        </div>
      </Scrollbars>
    </div>
  );
}

export interface CustomPromptFormViewProps {
  mode: 'create' | 'edit';
  prompt?: CustomPrompt;
  onClose: () => void;
  onSave: (prompt: CustomPrompt) => void;
}

export function CustomPromptFormView({
  mode,
  prompt,
  onClose,
  onSave,
}: CustomPromptFormViewProps) {
  const [visibility, setVisibility] = useState<CustomPromptVisibility>(
    prompt?.visibility ?? 'private'
  );
  const [name, setName] = useState(prompt?.name ?? '');
  const [description, setDescription] = useState(prompt?.description ?? '');
  const [promptText, setPromptText] = useState(prompt?.prompt ?? '');

  useEffect(() => {
    if (mode === 'edit' && prompt) {
      setVisibility(prompt.visibility);
      setName(prompt.name);
      setDescription(prompt.description);
      setPromptText(prompt.prompt);
      return;
    }
    setVisibility('private');
    setName('');
    setDescription('');
    setPromptText('');
  }, [mode, prompt]);

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedPrompt = promptText.trim();
    if (!trimmedName || !trimmedPrompt) return;

    if (mode === 'edit' && prompt) {
      onSave({
        ...prompt,
        name: trimmedName,
        description: description.trim(),
        prompt: trimmedPrompt,
        visibility,
      });
      return;
    }

    onSave({
      id: `prompt-${Date.now()}`,
      name: trimmedName,
      description:
        description.trim() ||
        'Custom prompt you can rerun in Agents or pin to a workflow.',
      prompt: trimmedPrompt,
      visibility,
      createdByMe: true,
    });
  };

  return (
    <div className={styles['product-switcher__feature-panel']}>
      <header className={styles['product-switcher__feature-panel-header']}>
        <IconButton
          aria-label="Back to custom prompts"
          size="Small"
          icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          onClick={onClose}
        />
        <span className={styles['product-switcher__feature-panel-title']}>
          {mode === 'create' ? 'New Prompt' : 'Edit Prompt'}
        </span>
      </header>
      <Scrollbars>
        <div className={styles['product-switcher__feature-panel-body']}>
          <div className={styles['product-switcher__custom-prompt-form']}>
            <fieldset className={styles['product-switcher__custom-prompt-visibility']}>
              <legend className={styles['product-switcher__custom-prompt-visibility-label']}>
                Visibility
              </legend>
              <div className={styles['product-switcher__custom-prompt-visibility-options']}>
                <Radio
                  name="prompt-visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={() => setVisibility('public')}
                >
                  Public
                </Radio>
                <Radio
                  name="prompt-visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={() => setVisibility('private')}
                >
                  Private (only you)
                </Radio>
              </div>
            </fieldset>
            <div className={styles['product-switcher__custom-prompt-form-field']}>
              <TextInput
                label="Action Title"
                placeholder="Enter a title for your prompt"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles['product-switcher__custom-prompt-form-field']}>
              <TextArea
                label="Brief Description"
                placeholder="Enter a brief description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className={styles['product-switcher__custom-prompt-system-head']}>
              <span className={styles['product-switcher__custom-prompt-system-label']}>
                System Prompt
              </span>
              <Button emphasis="Tertiary" size="Small">
                Context Variables
              </Button>
            </div>
            <div className={styles['product-switcher__custom-prompt-form-field']}>
              <TextArea
                aria-label="System prompt"
                placeholder="Enter the system prompt template"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={8}
              />
            </div>
          </div>
        </div>
      </Scrollbars>
      <div className={styles['product-switcher__custom-prompt-form-footer']}>
        <Button emphasis="Tertiary" onClick={onClose}>
          Discard
        </Button>
        <Button
          emphasis="Primary"
          disabled={!name.trim() || !promptText.trim()}
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

type AgentsFilter = 'all' | 'mine';

export interface AgentsManageViewProps {
  agents: SuperAgent[];
  onBack: () => void;
  onCreateAgent: () => void;
}

export function AgentsManageView({
  agents,
  onBack,
  onCreateAgent,
}: AgentsManageViewProps) {
  const [filter, setFilter] = useState<AgentsFilter>('all');

  const visibleAgents =
    filter === 'mine' ? agents.filter((agent) => agent.createdByMe) : agents;

  return (
    <div className={styles['product-switcher__feature-panel']}>
      <header className={styles['product-switcher__feature-panel-header']}>
        <IconButton
          aria-label="Back"
          size="Small"
          icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          onClick={onBack}
        />
        <span className={styles['product-switcher__feature-panel-title']}>
          Agents
        </span>
        <Button emphasis="Primary" size="Small" onClick={onCreateAgent}>
          Create new agent
        </Button>
      </header>
      <Scrollbars>
        <div className={styles['product-switcher__feature-panel-body']}>
          <p className={styles['product-switcher__feature-panel-intro']}>
            Super Agents run multi-step workflows with tools and a system prompt.
            Create your own or browse agents shared across the workspace.
          </p>
          <Tabs
            className={styles['product-switcher__agents-tabs']}
            tabs={[
              { key: 'all', label: 'All agents' },
              { key: 'mine', label: 'My agents' },
            ]}
            activeKey={filter}
            onChange={(key) => {
              if (key === 'all' || key === 'mine') setFilter(key);
            }}
          />
          {visibleAgents.length > 0 ? (
            <ul className={styles['product-switcher__agents-list']}>
              {visibleAgents.map((agent) => (
                <li key={agent.id}>
                  <button
                    type="button"
                    className={styles['product-switcher__agent-row']}
                  >
                    <span
                      className={styles['product-switcher__agent-row-icon']}
                      aria-hidden
                    >
                      <Icon size="16" glyph={<CreationOutlineIcon />} />
                    </span>
                    <span className={styles['product-switcher__agent-row-text']}>
                      <span className={styles['product-switcher__agent-row-name']}>
                        {agent.name}
                      </span>
                      <span
                        className={styles['product-switcher__agent-row-description']}
                      >
                        {agent.description}
                        {agent.createdByMe ? ' · Created by you' : ''}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles['product-switcher__agents-empty']}>
              {filter === 'mine'
                ? "You haven't created an agent yet. Use Create new agent above to add one."
                : 'No agents match this filter.'}
            </p>
          )}
        </div>
      </Scrollbars>
    </div>
  );
}

export interface AgentCreateViewProps {
  onBack: () => void;
  onCreated: (agent: SuperAgent) => void;
}

export function AgentCreateView({ onBack, onCreated }: AgentCreateViewProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onCreated({
      id: `agent-${Date.now()}`,
      name: trimmedName,
      description:
        description.trim() ||
        'Custom Super Agent with tools and a tailored system prompt.',
      createdByMe: true,
    });
  };

  return (
    <div className={styles['product-switcher__feature-panel']}>
      <header className={styles['product-switcher__feature-panel-header']}>
        <IconButton
          aria-label="Back to agents"
          size="Small"
          icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          onClick={onBack}
        />
        <span className={styles['product-switcher__feature-panel-title']}>
          Create agent
        </span>
      </header>
      <Scrollbars>
        <div className={styles['product-switcher__feature-panel-body']}>
          <p className={styles['product-switcher__feature-panel-intro']}>
            Give your agent a name and describe what it should do. You can refine
            tools and the system prompt after it is created.
          </p>
          <div className={styles['product-switcher__agent-create-form']}>
            <TextInput
              label="Agent name"
              placeholder="e.g. Release notes assistant"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextArea
              label="What should this agent do?"
              placeholder="Describe the workflow, tools, and tone this agent should use."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
            <div className={styles['product-switcher__agent-create-actions']}>
              <Button
                emphasis="Primary"
                size="Medium"
                disabled={!name.trim()}
                onClick={handleCreate}
              >
                Create agent
              </Button>
            </div>
          </div>
        </div>
      </Scrollbars>
    </div>
  );
}

export interface AutomationCreateViewProps {
  prefill?: string;
  onBack: () => void;
  onSave: (automation: ChannelAutomation) => void;
}

function normalizeChannelLabel(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

export function AutomationCreateView({
  prefill,
  onBack,
  onSave,
}: AutomationCreateViewProps) {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState<AutomationTrigger>('message-posted');
  const [channel, setChannel] = useState('');
  const [summary, setSummary] = useState(prefill ?? '');

  useEffect(() => {
    if (prefill) {
      setSummary(prefill);
    }
  }, [prefill]);

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedSummary = summary.trim();
    if (!trimmedName || !trimmedSummary) return;

    onSave({
      id: `automation-${Date.now()}`,
      name: trimmedName,
      trigger,
      channelLabel: normalizeChannelLabel(channel),
      enabled: true,
      summary: trimmedSummary,
    });
  };

  return (
    <div className={styles['product-switcher__feature-panel']}>
      <header className={styles['product-switcher__feature-panel-header']}>
        <IconButton
          aria-label="Back to automations"
          size="Small"
          icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          onClick={onBack}
        />
        <span className={styles['product-switcher__feature-panel-title']}>
          Create automation
        </span>
      </header>
      <Scrollbars>
        <div className={styles['product-switcher__feature-panel-body']}>
          <p className={styles['product-switcher__feature-panel-intro']}>
            Choose a trigger, optional channel, and what Matty should do. You can
            refine the action pipeline after it is saved.
          </p>
          <div className={styles['product-switcher__custom-prompt-form']}>
            <div className={styles['product-switcher__custom-prompt-form-field']}>
              <TextInput
                label="Automation name"
                placeholder="e.g. IT support auto-reply"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles['product-switcher__custom-prompt-form-field']}>
              <SelectMenu
                label="Trigger"
                value={trigger}
                onChange={(next) => setTrigger(next as AutomationTrigger)}
                options={AUTOMATION_TRIGGERS.map((triggerKey) => ({
                  value: triggerKey,
                  label: TRIGGER_META[triggerKey].label,
                }))}
              />
            </div>
            <div className={styles['product-switcher__custom-prompt-form-field']}>
              <TextInput
                label="Channel"
                placeholder="#engineering"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              />
            </div>
            <div className={styles['product-switcher__custom-prompt-form-field']}>
              <TextArea
                label="What should happen?"
                placeholder="Describe the trigger conditions and the actions Matty should run."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={6}
              />
            </div>
          </div>
        </div>
      </Scrollbars>
      <div className={styles['product-switcher__custom-prompt-form-footer']}>
        <Button emphasis="Tertiary" onClick={onBack}>
          Discard
        </Button>
        <Button
          emphasis="Primary"
          disabled={!name.trim() || !summary.trim()}
          onClick={handleSave}
        >
          Create automation
        </Button>
      </div>
    </div>
  );
}

export interface WikiCreateViewProps {
  onBack: () => void;
  onSave: (wiki: WikiPageDraft) => void;
}

const WIKI_OUTLINE_SECTIONS = [
  'Overview',
  'Who this is for',
  'Step-by-step guide',
  'Related links',
];

export function WikiCreateView({ onBack, onSave }: WikiCreateViewProps) {
  const [visibility, setVisibility] = useState<WikiVisibility>('public');
  const [title, setTitle] = useState('');
  const [space, setSpace] = useState('');
  const [description, setDescription] = useState('');
  const [sourceNotes, setSourceNotes] = useState('');

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const trimmedNotes = sourceNotes.trim();
    if (!trimmedTitle || !trimmedNotes) return;

    onSave({
      id: `wiki-${Date.now()}`,
      title: trimmedTitle,
      space: space.trim() || 'Team handbook',
      description:
        description.trim() ||
        'Wiki page drafted from your notes and ready to refine.',
      sourceNotes: trimmedNotes,
      visibility,
    });
  };

  const showOutline = sourceNotes.trim().length > 0;

  return (
    <div className={styles['product-switcher__feature-panel']}>
      <header className={styles['product-switcher__feature-panel-header']}>
        <IconButton
          aria-label="Back to create"
          size="Small"
          icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          onClick={onBack}
        />
        <span className={styles['product-switcher__feature-panel-title']}>
          Create wiki page
        </span>
      </header>
      <Scrollbars>
        <div className={styles['product-switcher__feature-panel-body']}>
          <p className={styles['product-switcher__feature-panel-intro']}>
            Paste notes or describe the page you want. Matty will draft a wiki
            structure you can edit before publishing.
          </p>
          <div className={styles['product-switcher__custom-prompt-form']}>
            <fieldset className={styles['product-switcher__custom-prompt-visibility']}>
              <legend className={styles['product-switcher__custom-prompt-visibility-label']}>
                Visibility
              </legend>
              <div className={styles['product-switcher__custom-prompt-visibility-options']}>
                <Radio
                  name="wiki-visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={() => setVisibility('public')}
                >
                  Public
                </Radio>
                <Radio
                  name="wiki-visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={() => setVisibility('private')}
                >
                  Private (only you)
                </Radio>
              </div>
            </fieldset>
            <div className={styles['product-switcher__custom-prompt-form-field']}>
              <TextInput
                label="Page title"
                placeholder="e.g. Customer onboarding guide"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className={styles['product-switcher__custom-prompt-form-field']}>
              <TextInput
                label="Wiki space"
                placeholder="e.g. Engineering handbook"
                value={space}
                onChange={(e) => setSpace(e.target.value)}
              />
            </div>
            <div className={styles['product-switcher__custom-prompt-form-field']}>
              <TextInput
                label="Brief description"
                placeholder="One-line summary for search and previews"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className={styles['product-switcher__custom-prompt-form-field']}>
              <TextArea
                label="Source notes"
                placeholder="Paste meeting notes, a brief, or bullet points to turn into a structured wiki page."
                value={sourceNotes}
                onChange={(e) => setSourceNotes(e.target.value)}
                rows={8}
              />
            </div>
            {showOutline && (
              <section className={styles['product-switcher__wiki-outline']}>
                <h3 className={styles['product-switcher__wiki-outline-title']}>
                  Suggested outline
                </h3>
                <p className={styles['product-switcher__wiki-outline-intro']}>
                  Matty will expand these sections from your notes when the page
                  is created.
                </p>
                <ol className={styles['product-switcher__wiki-outline-list']}>
                  {WIKI_OUTLINE_SECTIONS.map((section) => (
                    <li key={section} className={styles['product-switcher__wiki-outline-item']}>
                      {section}
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        </div>
      </Scrollbars>
      <div className={styles['product-switcher__custom-prompt-form-footer']}>
        <Button emphasis="Tertiary" onClick={onBack}>
          Discard
        </Button>
        <Button
          emphasis="Primary"
          disabled={!title.trim() || !sourceNotes.trim()}
          onClick={handleSave}
        >
          Create wiki page
        </Button>
      </div>
    </div>
  );
}

interface MattyCodeTask {
  id: string;
  ticket: string;
  title: string;
  status: 'running' | 'complete';
  currentStep?: string;
  activeStepIndex?: number;
  prUrl?: string;
  outcome?: string;
  completedAt?: string;
}

export type { MattyCodeTask };

const MATTY_CODE_PIPELINE = [
  'Jira ticket created',
  'Queued for development',
  'Sandbox agent claimed ticket',
  'Reproduced issue (before screenshot)',
  'Writing fix and adding tests',
  'Opening draft PR',
  'Ready for review + team notification',
];

export const MATTY_CODE_IN_PROGRESS: MattyCodeTask[] = [
  {
    id: 'mm-48291',
    ticket: 'MM-48291',
    title: 'Fix empty-state copy on onboarding welcome screen',
    status: 'running',
    currentStep: 'Writing fix and adding tests…',
    activeStepIndex: 4,
  },
  {
    id: 'mm-48304',
    ticket: 'MM-48304',
    title: 'Patch tooltip copy on channel invite modal',
    status: 'running',
    currentStep: 'Reproducing issue in sandbox…',
    activeStepIndex: 3,
  },
];

const MATTY_CODE_HISTORY: MattyCodeTask[] = [
  {
    id: 'done-1',
    ticket: 'MM-48102',
    title: 'Align product switcher focus restore with popover spec',
    status: 'complete',
    prUrl: 'mattermost/mattermost-webapp#15903',
    outcome: 'Draft PR opened with before/after screenshots. CodeRabbit review passed.',
    completedAt: 'Yesterday',
  },
  {
    id: 'done-2',
    ticket: 'MM-47988',
    title: 'Increase contrast on sidebar unread badge',
    status: 'complete',
    prUrl: 'mattermost/mattermost-webapp#15876',
    outcome: 'Shipped after one revision. Jira moved to Done.',
    completedAt: '3 days ago',
  },
];

function MattyCodePipeline({ task }: { task: MattyCodeTask }) {
  const activeIndex = task.activeStepIndex ?? 0;

  return (
    <div className={styles['product-switcher__matty-code-active']}>
      <div className={styles['product-switcher__matty-code-active-head']}>
        <span className={styles['product-switcher__matty-code-ticket']}>
          {task.ticket}
        </span>
        <span className={styles['product-switcher__matty-code-active-title']}>
          {task.title}
        </span>
      </div>
      <ol className={styles['product-switcher__matty-code-pipeline']}>
        {MATTY_CODE_PIPELINE.map((step, index) => {
          const active = index === activeIndex;
          const done = index < activeIndex;
          return (
            <li
              key={step}
              className={[
                styles['product-switcher__matty-code-step'],
                done ? styles['product-switcher__matty-code-step--done'] : '',
                active ? styles['product-switcher__matty-code-step--active'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span
                className={styles['product-switcher__matty-code-step-marker']}
                aria-hidden
              >
                {done ? (
                  <Icon size="12" glyph={<CheckboxMarkedCircleOutlineIcon />} />
                ) : (
                  index + 1
                )}
              </span>
              {step}
            </li>
          );
        })}
      </ol>
      {task.currentStep && (
        <p className={styles['product-switcher__matty-code-active-status']}>
          {task.currentStep}
        </p>
      )}
    </div>
  );
}

interface MattyCodeViewProps {
  taskId: string | null;
  onBack: () => void;
  onBackToOverview: () => void;
  onSelectTask: (taskId: string) => void;
}

export function MattyCodeView({
  taskId,
  onBack,
  onBackToOverview,
  onSelectTask,
}: MattyCodeViewProps) {
  const [kickoff, setKickoff] = useState('');
  const activeTask = taskId
    ? MATTY_CODE_IN_PROGRESS.find((task) => task.id === taskId) ?? null
    : null;

  return (
    <div className={styles['product-switcher__matty-code']}>
      <header className={styles['product-switcher__feature-panel-header']}>
        <IconButton
          aria-label={activeTask ? 'Back to Matty Code overview' : 'Back'}
          size="Small"
          icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          onClick={activeTask ? onBackToOverview : onBack}
        />
        <span className={styles['product-switcher__feature-panel-title']}>
          {activeTask ? activeTask.ticket : 'Matty Code'}
        </span>
      </header>

      <Scrollbars>
        <div className={styles['product-switcher__matty-code-body']}>
          {activeTask ? (
            <MattyCodePipeline task={activeTask} />
          ) : (
            <>
              <div className={styles['product-switcher__matty-code-hero']}>
                <span
                  className={styles['product-switcher__matty-code-hero-icon']}
                  aria-hidden
                >
                  <Icon size="20" glyph={<CodeTagsIcon />} />
                </span>
                <div>
                  <h2 className={styles['product-switcher__matty-code-hero-title']}>
                    Autonomous coding agent
                  </h2>
                  <p className={styles['product-switcher__matty-code-hero-text']}>
                    @mention Matty with a scoped task — UI tweaks, bug fixes, plugin
                    updates — and Matty takes it from Jira ticket to reviewed GitHub PR.
                  </p>
                </div>
              </div>

              <div className={styles['product-switcher__matty-code-kickoff']}>
                <MessageInput
                  placeholder="@matty fix the onboarding empty-state copy on the welcome screen"
                  value={kickoff}
                  onChange={setKickoff}
                />
                <Button emphasis="Secondary" size="Small">
                  Start Matty Code task
                </Button>
              </div>

              {MATTY_CODE_IN_PROGRESS.length > 0 && (
                <section className={styles['product-switcher__matty-code-section']}>
                  <h3 className={styles['product-switcher__matty-code-section-title']}>
                    In progress
                  </h3>
                  <ul className={styles['product-switcher__matty-code-in-progress']}>
                    {MATTY_CODE_IN_PROGRESS.map((task) => (
                      <li key={task.id}>
                        <button
                          type="button"
                          className={
                            styles['product-switcher__matty-code-in-progress-item']
                          }
                          onClick={() => onSelectTask(task.id)}
                        >
                          <div
                            className={
                              styles['product-switcher__matty-code-history-head']
                            }
                          >
                            <span
                              className={styles['product-switcher__matty-code-ticket']}
                            >
                              {task.ticket}
                            </span>
                            <span
                              className={
                                styles[
                                  'product-switcher__matty-code-in-progress-badge'
                                ]
                              }
                            >
                              In progress
                            </span>
                          </div>
                          <span
                            className={
                              styles['product-switcher__matty-code-history-title']
                            }
                          >
                            {task.title}
                          </span>
                          {task.currentStep && (
                            <p
                              className={
                                styles[
                                  'product-switcher__matty-code-in-progress-status'
                                ]
                              }
                            >
                              {task.currentStep}
                            </p>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className={styles['product-switcher__matty-code-section']}>
                <h3 className={styles['product-switcher__matty-code-section-title']}>
                  Recently completed
                </h3>
                <ul className={styles['product-switcher__matty-code-history']}>
                  {MATTY_CODE_HISTORY.map((task) => (
                    <li
                      key={task.id}
                      className={styles['product-switcher__matty-code-history-item']}
                    >
                      <div className={styles['product-switcher__matty-code-history-head']}>
                        <span className={styles['product-switcher__matty-code-ticket']}>
                          {task.ticket}
                        </span>
                        <span
                          className={
                            styles['product-switcher__matty-code-history-time']
                          }
                        >
                          {task.completedAt}
                        </span>
                      </div>
                      <span
                        className={styles['product-switcher__matty-code-history-title']}
                      >
                        {task.title}
                      </span>
                      <p
                        className={
                          styles['product-switcher__matty-code-history-outcome']
                        }
                      >
                        {task.outcome}
                      </p>
                      {task.prUrl && (
                        <a
                          href="#"
                          className={styles['product-switcher__matty-code-pr-link']}
                          onClick={(e) => e.preventDefault()}
                        >
                          <Icon size="12" glyph={<SourceBranchIcon />} />
                          {task.prUrl}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </Scrollbars>
    </div>
  );
}

export function getTriggerLabel(trigger: AutomationTrigger): string {
  return TRIGGER_META[trigger].label;
}
