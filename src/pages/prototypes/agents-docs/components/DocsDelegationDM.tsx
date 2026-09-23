import CloseIcon from '@mattermost/compass-icons/components/close';
import GithubCircleIcon from '@mattermost/compass-icons/components/github-circle';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { useEffect, useRef } from 'react';
import type { AgentColor, AgentShape, ChannelMessagePart } from '../../agents/agentsData';
import { agentAvatarChipSrc } from '../../agents/components/agentAvatarShapes';
import mentionStyles from '../../agents/components/MentionMessageInput.module.scss';
import AgentAvatar from '../../agents/components/AgentAvatar';
import type { DocsAgentDmMessage, DocsToolCall } from '../agentsDocsData';
import styles from './DocsDelegationDM.module.scss';

function DmMessageBody({ text, parts }: { text: string; parts?: ChannelMessagePart[] }) {
  if (!parts?.length) return <p>{text}</p>;
  return (
    <p className={mentionStyles['mention-input__post']}>
      {parts.map((part, i) =>
        part.type === 'text' ? (
          <span key={i}>{part.text}</span>
        ) : part.type === 'mention' ? (
          <Chip
            key={i}
            size="small"
            compact
            leadingAvatar={{
              src:
                part.agentShape && part.agentColor
                  ? agentAvatarChipSrc(part.agentShape as AgentShape, part.agentColor as AgentColor)
                  : (part.avatarSrc || ''),
              alt: part.label,
            }}
            className={[
              mentionStyles['mention-input__mention-chip'],
              mentionStyles['mention-input__post-chip'],
              part.kind === 'agent' ? mentionStyles['mention-input__mention-chip--agent'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {part.label}
          </Chip>
        ) : null,
      )}
    </p>
  );
}

function ToolCallList({ toolCalls }: { toolCalls: DocsToolCall[] }) {
  return (
    <div className={styles['delegation-dm__msg-tool-calls']}>
      {toolCalls.map((tc, i) => (
        <div key={i} className={styles['delegation-dm__msg-tool-call']}>
          <span className={styles['delegation-dm__msg-tool-call-icon']}>
            <Icon size="10" glyph={<GithubCircleIcon />} />
          </span>
          <span className={styles['delegation-dm__msg-tool-call-name']}>{tc.tool}</span>
          <span className={styles['delegation-dm__msg-tool-call-sep']}>·</span>
          <span className={styles['delegation-dm__msg-tool-call-label']}>{tc.label}</span>
        </div>
      ))}
    </div>
  );
}

const PANEL_WIDTH = 400;
const PANEL_HEIGHT = 360;
const ANCHOR_GAP = 8;

export type DelegationDmAnchor = {
  top: number;
  left: number;
};

export function computeDelegationAnchor(triggerRect: DOMRect): DelegationDmAnchor {
  let top = triggerRect.top - PANEL_HEIGHT - ANCHOR_GAP;
  if (top < ANCHOR_GAP) {
    top = triggerRect.bottom + ANCHOR_GAP;
  }
  let left = triggerRect.left;
  const maxLeft = window.innerWidth - PANEL_WIDTH - ANCHOR_GAP;
  if (left > maxLeft) left = maxLeft;
  if (left < ANCHOR_GAP) left = ANCHOR_GAP;
  return { top, left };
}

type DelegationAgent = {
  id: string;
  name: string;
  shape: AgentShape;
  color: AgentColor;
};

type DocsDelegationDMProps = {
  fromAgent: DelegationAgent;
  toAgents: DelegationAgent[];
  messages: DocsAgentDmMessage[];
  anchor: DelegationDmAnchor;
  open: boolean;
  onClose: () => void;
};

function formatGroupTitle(fromAgent: DelegationAgent, toAgents: DelegationAgent[]): string {
  const names = [fromAgent.name, ...toAgents.map((a) => a.name)];
  if (names.length <= 2) return names.join(' & ');
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

export default function DocsDelegationDM({
  fromAgent,
  toAgents,
  messages,
  anchor,
  open,
  onClose,
}: DocsDelegationDMProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    const viewport = el.closest('.simplebar-content-wrapper') as HTMLElement | null;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [open]);

  const allAgents = [fromAgent, ...toAgents];

  return (
    <aside
      className={[
        styles['delegation-dm'],
        open ? styles['delegation-dm--open'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ top: anchor.top, left: anchor.left }}
      aria-label={`${formatGroupTitle(fromAgent, toAgents)} delegation chat`}
      aria-hidden={!open}
    >
      <div className={styles['delegation-dm__header']}>
        <div className={styles['delegation-dm__avatars']}>
          {allAgents.map((a) => (
            <span key={a.id} className={styles['delegation-dm__avatar-wrap']}>
              <AgentAvatar shape={a.shape} color={a.color} size="sm" eyes shadow={false} outlined />
            </span>
          ))}
        </div>
        <div className={styles['delegation-dm__title-block']}>
          <h2 className={styles['delegation-dm__title']}>
            {formatGroupTitle(fromAgent, toAgents)}
          </h2>
        </div>
        <IconButton
          aria-label="Close"
          size="small"
          padding="compact"
          icon={<Icon size="16" glyph={<CloseIcon />} />}
          onClick={onClose}
        />
      </div>

      <Scrollbar className={styles['delegation-dm__messages']}>
        <div ref={scrollRef} className={styles['delegation-dm__msg-list']}>
          {messages.map((m) => {
            const speakerName =
              m.role === 'from'
                ? fromAgent.name
                : (toAgents.find((a) => a.id === m.agentId)?.name ?? toAgents[0].name);
            return (
              <article
                key={m.id}
                className={[
                  styles['delegation-dm__msg'],
                  m.role === 'to' ? styles['delegation-dm__msg--to'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className={styles['delegation-dm__msg-bubble']}>
                  <div className={styles['delegation-dm__msg-meta']}>
                    <span className={styles['delegation-dm__msg-name']}>{speakerName}</span>
                    <time className={styles['delegation-dm__msg-time']}>{m.timestamp}</time>
                  </div>
                  <div className={styles['delegation-dm__msg-body']}>
                    <DmMessageBody text={m.text} parts={m.parts} />
                    {m.toolCalls && <ToolCallList toolCalls={m.toolCalls} />}
                  </div>
                </div>
              </article>
            );
          })}
          <p className={styles['delegation-dm__readonly-notice']}>This thread is read-only</p>
        </div>
      </Scrollbar>
    </aside>
  );
}
