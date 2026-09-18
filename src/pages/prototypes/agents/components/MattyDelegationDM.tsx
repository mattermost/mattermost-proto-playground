import CloseIcon from '@mattermost/compass-icons/components/close';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { useEffect, useRef } from 'react';
import { MATTY, MATTY_SENTINEL_DM_MESSAGES, SENTINEL_DEFAULT } from '../agentsData';
import AgentAvatar from './AgentAvatar';
import styles from './MattyDelegationDM.module.scss';

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

type MattyDelegationDMProps = {
  anchor: DelegationDmAnchor;
  open: boolean;
  onClose: () => void;
};

export default function MattyDelegationDM({ anchor, open, onClose }: MattyDelegationDMProps) {
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
      aria-label="Matty and Sentinel delegation chat"
      aria-hidden={!open}
    >
      <div className={styles['delegation-dm__header']}>
        <div className={styles['delegation-dm__avatars']}>
          <span className={styles['delegation-dm__avatar-wrap']}>
            <AgentAvatar shape={MATTY.shape} color={MATTY.color} size="sm" eyes shadow={false} outlined />
          </span>
          <span className={styles['delegation-dm__avatar-wrap']}>
            <AgentAvatar
              shape={SENTINEL_DEFAULT.shape}
              color={SENTINEL_DEFAULT.color}
              size="sm"
              eyes
              shadow={false}
              outlined
            />
          </span>
        </div>
        <div className={styles['delegation-dm__title-block']}>
          <h2 className={styles['delegation-dm__title']}>Matty &amp; Sentinel</h2>
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
          {MATTY_SENTINEL_DM_MESSAGES.map((m) => (
            <article
              key={m.id}
              className={[
                styles['delegation-dm__msg'],
                m.role === 'sentinel' ? styles['delegation-dm__msg--sentinel'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles['delegation-dm__msg-bubble']}>
                <div className={styles['delegation-dm__msg-meta']}>
                  <span className={styles['delegation-dm__msg-name']}>
                    {m.role === 'matty' ? MATTY.name : SENTINEL_DEFAULT.name}
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
