import { useState } from 'react';
import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Icon from '@/components/ui/Icon/Icon';
import Message from '@/components/ui/Message/Message';
import MessageInput from '@/components/ui/MessageInput';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Modal from '@/components/ui/Modal/Modal';
import ProgressBar from '@/components/ui/ProgressBar/ProgressBar';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import TextInput from '@/components/ui/TextInput/TextInput';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import {
  AGENT,
  WORKSPACE_NAME,
  buildFirstSessionSidebarModel,
} from '../onboarding.fixtures';
import styles from './WorkspaceCreationVignette.module.scss';

type Step = 1 | 2 | 3 | 4 | 5;
const TOTAL_STEPS: Step = 5;
const STEP_TITLES: Record<Step, string> = {
  1: 'Create your account',
  2: 'Name your workspace',
  3: 'Choose your tools',
  4: 'Invite your team',
  5: 'You’re ready to go',
};

interface ToolOption {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
  locked?: boolean;
}

const TOOLS: ToolOption[] = [
  {
    id: 'channels',
    label: 'Channels',
    description: 'Persistent chat and file sharing.',
    defaultOn: true,
    locked: true,
  },
  {
    id: 'calls',
    label: 'Calls',
    description: 'Audio, video, and screen share built in.',
    defaultOn: true,
  },
  {
    id: 'playbooks',
    label: 'Playbooks',
    description: 'Coordinate incidents and recurring work.',
    defaultOn: true,
  },
  {
    id: 'boards',
    label: 'Boards',
    description: 'Project boards alongside your conversations.',
    defaultOn: false,
  },
  {
    id: 'agent',
    label: 'Mattermost Agent',
    description: 'AI assistant integrated into channels.',
    defaultOn: true,
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'Webhooks, slash commands, and plugins.',
    defaultOn: false,
  },
];

const JUMP_SCENES = [
  { id: '1', label: 'Account' },
  { id: '2', label: 'Workspace' },
  { id: '3', label: 'Tools' },
  { id: '4', label: 'Invite' },
  { id: '5', label: 'Handoff' },
];

export default function WorkspaceCreationVignette() {
  const [step, setStep] = useState<Step>(1);
  const [orgName, setOrgName] = useState('Acme Defense');
  const [tools, setTools] = useState<Set<string>>(
    () => new Set(TOOLS.filter((t) => t.defaultOn).map((t) => t.id)),
  );
  const [emails, setEmails] = useState(['', '', '']);
  const [done, setDone] = useState(false);

  const progress = (step / TOTAL_STEPS) * 100;

  const next = () => setStep((s) => Math.min(TOTAL_STEPS, (s + 1) as Step) as Step);
  const back = () => setStep((s) => Math.max(1, (s - 1) as Step) as Step);

  const slug = orgName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return (
    <div className={styles['workspace-creation']}>
      <div className={styles['workspace-creation__jump']}>
        <SceneSwitcher
          scenes={JUMP_SCENES}
          activeId={String(step)}
          onChange={(id) => setStep(Number(id) as Step)}
          ariaLabel="Wizard step"
          label="Jump to step"
        />
      </div>
      <div className={styles['workspace-creation__stage']}>
        <div
          className={[
            styles['workspace-creation__shell-wrap'],
            done
              ? styles['workspace-creation__shell-wrap--revealed']
              : styles['workspace-creation__shell-wrap--dimmed'],
          ].join(' ')}
          aria-hidden={!done}
        >
          <ChannelShell
            channelsSidebarModel={buildFirstSessionSidebarModel()}
            teamName={orgName || WORKSPACE_NAME}
            channelHeader={
              <ChannelHeader
                type="Channel"
                name="Town Square"
                description="All-hands and announcements"
                memberCount={3}
              />
            }
          >
            <div className={shellStyles['channel-shell__messages']}>
              <Scrollbars>
                <div className={shellStyles['channel-shell__messages-list']}>
                  <MessageSeparator type="Date" label="Today" />
                  <Message
                    avatarSrc={AGENT.avatarSrc}
                    avatarAlt={AGENT.name}
                    username={AGENT.name}
                    timestamp="Just now"
                    isBot
                    botLabel={AGENT.botLabel}
                  >
                    <p className={shellStyles['channel-shell__post-text']}>
                      Welcome to {orgName || WORKSPACE_NAME}. Your workspace is
                      ready.
                    </p>
                  </Message>
                </div>
              </Scrollbars>
            </div>
            <div className={shellStyles['channel-shell__message-input']}>
              <MessageInput placeholder="Write to Town Square" />
            </div>
          </ChannelShell>
          {!done && <div className={styles['workspace-creation__scrim']} />}
        </div>

        {!done && (
          <div className={styles['workspace-creation__wizard']}>
            <Modal
              size="Large"
              title={STEP_TITLES[step]}
              subtitle={`Step ${step} of ${TOTAL_STEPS}`}
              showBackButton={step > 1}
              onBack={back}
              onClose={() => setStep(1)}
              footer={
                <div className={styles['workspace-creation__footer']}>
                  {step > 1 && (
                    <Button emphasis="Tertiary" onClick={back}>
                      Back
                    </Button>
                  )}
                  <div className={styles['workspace-creation__footer-spacer']} />
                  <Button
                    emphasis="Primary"
                    trailingIcon={
                      step < TOTAL_STEPS ? (
                        <Icon size="16" glyph={<ArrowRightIcon />} />
                      ) : undefined
                    }
                    onClick={() => {
                      if (step === TOTAL_STEPS) setDone(true);
                      else next();
                    }}
                  >
                    {step === TOTAL_STEPS
                      ? `Open ${orgName || WORKSPACE_NAME}`
                      : step === 4
                        ? 'Continue'
                        : 'Next'}
                  </Button>
                </div>
              }
            >
              <div className={styles['workspace-creation__body']}>
                <ProgressBar
                  size="Small"
                  value={progress}
                  aria-label={`Step ${step} of ${TOTAL_STEPS}`}
                />

                {step === 1 && <AccountStep />}
                {step === 2 && (
                  <WorkspaceStep
                    orgName={orgName}
                    onOrgNameChange={setOrgName}
                    slug={slug}
                  />
                )}
                {step === 3 && (
                  <ToolsStep
                    selected={tools}
                    onToggle={(id) =>
                      setTools((prev) => {
                        const next = new Set(prev);
                        if (next.has(id)) next.delete(id);
                        else next.add(id);
                        return next;
                      })
                    }
                  />
                )}
                {step === 4 && (
                  <InviteStep
                    emails={emails}
                    onEmailChange={(i, v) =>
                      setEmails((prev) => {
                        const next = prev.slice();
                        next[i] = v;
                        return next;
                      })
                    }
                  />
                )}
                {step === 5 && (
                  <HandoffStep workspaceName={orgName || WORKSPACE_NAME} />
                )}
              </div>
            </Modal>
          </div>
        )}

        {done && (
          <div className={styles['workspace-creation__handoff-overlay']}>
            <div className={styles['workspace-creation__handoff-toast']}>
              <span>Workspace opened. Reset to walk through the flow again.</span>
              <Button
                emphasis="Tertiary"
                size="Small"
                onClick={() => {
                  setDone(false);
                  setStep(1);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AccountStep() {
  return (
    <div className={styles['workspace-creation__fields']}>
      <p className={styles['workspace-creation__lead']}>
        Set up the admin account that will own this workspace.
      </p>
      <TextInput label="Work email" defaultValue="leonard@acme-defense.com" />
      <TextInput label="Password" type="password" defaultValue="••••••••••" />
      <TextInput label="Confirm password" type="password" defaultValue="••••••••••" />
    </div>
  );
}

function WorkspaceStep({
  orgName,
  onOrgNameChange,
  slug,
}: {
  orgName: string;
  onOrgNameChange: (v: string) => void;
  slug: string;
}) {
  return (
    <div className={styles['workspace-creation__fields']}>
      <p className={styles['workspace-creation__lead']}>
        Pick a name your teammates will recognize. You can change this later.
      </p>
      <TextInput
        label="Workspace name"
        value={orgName}
        onChange={(e) => onOrgNameChange(e.target.value)}
      />
      <div className={styles['workspace-creation__slug']}>
        <span className={styles['workspace-creation__slug-label']}>URL</span>
        <code className={styles['workspace-creation__slug-value']}>
          https://{slug || 'your-workspace'}.mattermost.com
        </code>
      </div>
    </div>
  );
}

function ToolsStep({
  selected,
  onToggle,
}: {
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className={styles['workspace-creation__fields']}>
      <p className={styles['workspace-creation__lead']}>
        Mattermost is more than chat. Pick the capabilities your team needs —
        you can enable more later from System Console.
      </p>
      <div className={styles['workspace-creation__tools']}>
        {TOOLS.map((tool) => {
          const checked = selected.has(tool.id) || tool.locked;
          return (
            <label
              key={tool.id}
              className={[
                styles['workspace-creation__tool'],
                checked ? styles['workspace-creation__tool--on'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Checkbox
                size="Medium"
                checked={checked}
                disabled={tool.locked}
                onChange={() => !tool.locked && onToggle(tool.id)}
              />
              <span className={styles['workspace-creation__tool-text']}>
                <span className={styles['workspace-creation__tool-label']}>
                  {tool.label}
                  {tool.locked && (
                    <span className={styles['workspace-creation__tool-pill']}>
                      Required
                    </span>
                  )}
                </span>
                <span className={styles['workspace-creation__tool-desc']}>
                  {tool.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function InviteStep({
  emails,
  onEmailChange,
}: {
  emails: string[];
  onEmailChange: (i: number, value: string) => void;
}) {
  return (
    <div className={styles['workspace-creation__fields']}>
      <p className={styles['workspace-creation__lead']}>
        Invite a few teammates so you can feel the workspace come alive. SSO,
        directory sync, and guest access can be configured later in System
        Console.
      </p>
      {emails.map((value, i) => (
        <TextInput
          key={i}
          label={`Email ${i + 1}`}
          value={value}
          onChange={(e) => onEmailChange(i, e.target.value)}
        />
      ))}
    </div>
  );
}

function HandoffStep({ workspaceName }: { workspaceName: string }) {
  return (
    <div className={styles['workspace-creation__fields']}>
      <h3 className={styles['workspace-creation__handoff-title']}>
        {workspaceName} is ready
      </h3>
      <p className={styles['workspace-creation__lead']}>
        You’ll land in Town Square. Start at #start-here for a guided checklist
        — Mattermost Agent is on hand to answer questions.
      </p>
      <ul className={styles['workspace-creation__handoff-list']}>
        <li>Mattermost Agent is installed and ready in your workspace.</li>
        <li>
          You can invite more people, add integrations, and enable SSO/SAML from
          System Console.
        </li>
        <li>Open Town Square to see how your team will land.</li>
      </ul>
    </div>
  );
}
