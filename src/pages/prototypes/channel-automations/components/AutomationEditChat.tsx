import { useState, type ReactNode } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import Icon from '@/components/ui/Icon/Icon';
import MessageInput from '@/components/ui/MessageInput';
import {
  SCHEDULE_FREQUENCY_LABELS,
  SCHEDULE_TIMES,
  triggerSummary,
  type ScheduleFrequency,
  type TriggerConfig,
} from '../channelAutomationsData';
import type { FormPatch, FormValues } from './AutomationFormModal';
import { AgentMessage, ChatText, UserMessage } from './AgentChatMessage';
import convo from './ScriptedAgentConversation.module.scss';
import styles from './AutomationEditChat.module.scss';

export interface AutomationEditChatProps {
  /** Current draft, shared with the form view. */
  values: FormValues;
  /** Apply a partial change to the shared draft. */
  patch: FormPatch;
  /** Return to the form view (e.g. to review changes before saving). */
  onReviewInForm: () => void;
  /** When editing, the chat opens with a summary of the current automation. */
  isEdit?: boolean;
}

/** Build a TriggerConfig from the shared draft values. */
function valuesToTrigger(values: FormValues): TriggerConfig {
  return values.kind === 'schedule'
    ? { kind: 'schedule', frequency: values.frequency, time: values.time }
    : {
        kind: 'event',
        event: values.event,
        ...(values.event === 'keyword' ? { keyword: values.keyword } : {}),
      };
}

type Bubble = { from: 'agent'; text: ReactNode } | { from: 'user'; text: string };

type Menu = 'ideas' | 'root' | 'time' | 'freq' | 'instructions' | 'name';

const FREQUENCIES = Object.keys(
  SCHEDULE_FREQUENCY_LABELS,
) as ScheduleFrequency[];

const INSTRUCTION_SUGGESTIONS = [
  'Reminder: please share your standup in the thread before 10:00 AM. Keep it short — progress, plan, and any blockers. 🧵',
  'Good morning! Drop today’s standup in the thread: what you shipped, what’s next, and anything blocking you.',
];

const NAME_SUGGESTIONS = ['Daily standup reminder', 'Standup nudge', 'Morning check-in'];

// Starting points offered when creating a new automation. Each seeds the whole
// draft (name, trigger, instructions); the user can then refine via chat or form.
const AUTOMATION_IDEAS: {
  label: string;
  confirm: string;
  values: Partial<FormValues>;
}[] = [
  {
    label: 'Daily standup reminder',
    confirm: 'a daily standup reminder that posts every weekday at 9:00 AM',
    values: {
      name: 'Daily standup reminder',
      kind: 'schedule',
      frequency: 'weekdays',
      time: '9:00 AM',
      instructions:
        'Post a reminder asking the team to share their standup update in the thread before 10:00 AM.',
    },
  },
  {
    label: 'Weekly channel recap',
    confirm: 'a weekly recap that posts every Monday at 8:00 AM',
    values: {
      name: 'Weekly channel recap',
      kind: 'schedule',
      frequency: 'weekly',
      time: '8:00 AM',
      instructions:
        'Summarize the past week of activity in this channel — decisions, shipped work, and open questions — and post the recap.',
    },
  },
  {
    label: 'Welcome new members',
    confirm: 'a welcome message sent whenever someone joins the channel',
    values: {
      name: 'Welcome new members',
      kind: 'event',
      event: 'join',
      instructions:
        'Greet new members, share the channel’s purpose, and point them to the pinned resources.',
    },
  },
  {
    label: 'After-hours auto-reply',
    confirm: 'an auto-reply for when the agent is mentioned after hours',
    values: {
      name: 'After-hours auto-reply',
      kind: 'event',
      event: 'mention',
      instructions:
        'Let the sender know the team is offline and will respond during business hours.',
    },
  },
];

/**
 * Scripted "edit with the agent" assistant. The Chat side of the automation
 * editor: quick-edit prompts that patch the same draft the form edits, so
 * flipping back to Form reflects the changes and Save commits them.
 */
export default function AutomationEditChat({
  values,
  patch,
  onReviewInForm,
  isEdit = false,
}: AutomationEditChatProps) {
  const [log, setLog] = useState<Bubble[]>(() => {
    if (!isEdit) {
      return [
        {
          from: 'agent',
          text: (
            <>
              What would you like this automation to do? Pick an idea to start
              from, or describe your own.
            </>
          ),
        },
      ];
    }
    return [
      {
        from: 'agent',
        text: (
          <>
            Here’s the current setup for{' '}
            <strong>{values.name || 'this automation'}</strong>:
            <br />
            <br />
            Trigger — {triggerSummary(valuesToTrigger(values))}
            <br />
            Status — {values.enabled ? 'Enabled' : 'Disabled'}
            <br />
            <br />
            Instructions: “{values.instructions}”
            <br />
            <br />
            What would you like to change?
          </>
        ),
      },
    ];
  });
  const [menu, setMenu] = useState<Menu>(isEdit ? 'root' : 'ideas');

  const push = (...bubbles: Bubble[]) => setLog((prev) => [...prev, ...bubbles]);

  const choose = (userText: string, agentReply: ReactNode, next: Menu) => {
    push({ from: 'user', text: userText }, { from: 'agent', text: agentReply });
    setMenu(next);
  };

  const apply = (userText: string, confirm: ReactNode, change: () => void) => {
    change();
    push(
      { from: 'user', text: userText },
      {
        from: 'agent',
        text: (
          <>
            <span className={convo['convo__check']}>
              <Icon size="16" glyph={<CheckIcon />} />
            </span>
            {confirm}
          </>
        ),
      },
    );
    setMenu('root');
  };

  const renderOptions = () => {
    switch (menu) {
      case 'ideas':
        return AUTOMATION_IDEAS.map((idea) => (
          <Chip
            key={idea.label}
            onClick={() =>
              apply(
                idea.label,
                <>
                  Nice — I’ve drafted {idea.confirm}. Review it in the form, or
                  tell me what to tweak.
                </>,
                () => patch(idea.values),
              )
            }
          >
            {idea.label}
          </Chip>
        ));
      case 'root':
        return (
          <>
            <Chip
              onClick={() =>
                choose(
                  'Reword the instructions',
                  'Here are a couple of options — pick one:',
                  'instructions',
                )
              }
            >
              Reword the instructions
            </Chip>
            <Chip
              onClick={() =>
                choose('Change the time', 'When should it run?', 'time')
              }
            >
              Change the time
            </Chip>
            <Chip
              onClick={() =>
                choose('Change how often it runs', 'How often?', 'freq')
              }
            >
              Change frequency
            </Chip>
            <Chip
              onClick={() => choose('Rename it', 'Pick a name:', 'name')}
            >
              Rename it
            </Chip>
            <Chip onClick={onReviewInForm}>Review in form →</Chip>
          </>
        );
      case 'time':
        return SCHEDULE_TIMES.map((t) => (
          <Chip
            key={t}
            onClick={() =>
              apply(t, <>Done — it’ll now run at {t}.</>, () =>
                patch({ kind: 'schedule', time: t }),
              )
            }
          >
            {t}
          </Chip>
        ));
      case 'freq':
        return FREQUENCIES.map((f) => (
          <Chip
            key={f}
            onClick={() =>
              apply(
                SCHEDULE_FREQUENCY_LABELS[f],
                <>Got it — now set to “{SCHEDULE_FREQUENCY_LABELS[f].toLowerCase()}”.</>,
                () => patch({ kind: 'schedule', frequency: f }),
              )
            }
          >
            {SCHEDULE_FREQUENCY_LABELS[f]}
          </Chip>
        ));
      case 'instructions':
        return INSTRUCTION_SUGGESTIONS.map((text, i) => (
          <Chip
            key={i}
            onClick={() =>
              apply(`Use option ${i + 1}`, <>Updated the instructions.</>, () =>
                patch({ instructions: text }),
              )
            }
          >
            {text.length > 56 ? `${text.slice(0, 56)}…` : text}
          </Chip>
        ));
      case 'name':
        return NAME_SUGGESTIONS.map((n) => (
          <Chip
            key={n}
            onClick={() =>
              apply(n, <>Renamed to “{n}”.</>, () => patch({ name: n }))
            }
          >
            {n}
          </Chip>
        ));
      default:
        return null;
    }
  };

  return (
    <div className={styles['chat']}>
      <div className={styles['chat__log']}>
        <div className={styles['chat__log-inner']}>
          {log.map((b, i) => {
            const isLast = i === log.length - 1;
            if (b.from === 'agent') {
              return (
                <AgentMessage key={i}>
                  <ChatText>{b.text}</ChatText>
                  {isLast && (
                    <div className={convo['convo__options']}>
                      {renderOptions()}
                    </div>
                  )}
                </AgentMessage>
              );
            }
            return (
              <UserMessage key={i}>
                <ChatText>{b.text}</ChatText>
              </UserMessage>
            );
          })}
        </div>
      </div>

      <div className={styles['chat__composer']}>
        <MessageInput
          placeholder="Reply to Matty…"
          width="narrow"
          showFormatting={false}
          showEmoji={false}
        />
      </div>
    </div>
  );
}

function Chip({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className={convo['convo__chip']} onClick={onClick}>
      {children}
    </button>
  );
}
