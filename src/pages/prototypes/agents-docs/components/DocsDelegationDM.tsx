import CloseIcon from '@mattermost/compass-icons/components/close';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { useEffect, useRef } from 'react';
import type { AgentColor, AgentShape } from '../../agents/agentsData';
import AgentAvatar from '../../agents/components/AgentAvatar';
import type { DocsAgentDmMessage } from '../agentsDocsData';
import styles from './DocsDelegationDM.module.scss';

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
  toAgent: DelegationAgent;
  messages: DocsAgentDmMessage[];
  anchor: DelegationDmAnchor;
  open: boolean;
  onClose: () => void;
};

export default function DocsDelegationDM({
  fromAgent,
  toAgent,
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

  return (
    <aside
      className={[
        styles['delegation-dm'],
        open ? styles['delegation-dm--open'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ top: anchor.top, left: anchor.left }}
      aria-label={`${fromAgent.name} and ${toAgent.name} delegation chat`}
      aria-hidden={!open}
    >
      <div className={styles['delegation-dm__header']}>
        <div className={styles['delegation-dm__avatars']}>
          <span className={styles['delegation-dm__avatar-wrap']}>
            <AgentAvatar shape={fromAgent.shape} color={fromAgent.color} size="sm" eyes shadow={false} outlined />
          </span>
          <span className={styles['delegation-dm__avatar-wrap']}>
            <AgentAvatar shape={toAgent.shape} color={toAgent.color} size="sm" eyes shadow={false} outlined />
          </span>
        </div>
        <div className={styles['delegation-dm__title-block']}>
          <h2 className={styles['delegation-dm__title']}>
            {fromAgent.name} &amp; {toAgent.name}
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
          {messages.map((m) => (
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
                  <span className={styles['delegation-dm__msg-name']}>
                    {m.role === 'from' ? fromAgent.name : toAgent.name}
                  </span>
                  <time className={styles['delegation-dm__msg-time']}>{m.timestamp}</time>
                </div>
                <div className={styles['delegation-dm__msg-body']}>
                  <p>{m.text}</p>
                </div>
              </div>
            </article>
          ))}
          <p className={styles['delegation-dm__readonly-notice']}>This thread is read-only</p>
        </div>
      </Scrollbar>
    </aside>
  );
}
