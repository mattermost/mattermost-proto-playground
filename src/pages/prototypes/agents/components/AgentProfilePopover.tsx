import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AnimationEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { ProfilePopover } from '@mattermost/compass-ui/components/profile-popover';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { agentModelLabel, type WorkspaceAgent } from '../agentsData';
import { agentAvatarChipSrc } from './agentAvatarShapes';
import styles from './AgentProfilePopover.module.scss';

const POPOVER_WIDTH = 272;
const POPOVER_GAP = 8;

export type AgentProfileAnchor = {
  agent: WorkspaceAgent;
  anchorRect: DOMRect;
};

type AgentProfilePopoverProps = {
  target: AgentProfileAnchor | null;
  onClose: () => void;
  /** Optional — Message / Add to channel footer actions. */
  onMessage?: (agent: WorkspaceAgent) => void;
  onMention?: (agent: WorkspaceAgent) => void;
  onAddToChannel?: (agent: WorkspaceAgent) => void;
};

function agentHandle(agent: WorkspaceAgent) {
  return `@${agent.name.toLowerCase().replace(/\s+/g, '')}`;
}

function agentTitle(agent: WorkspaceAgent) {
  if (agent.managedBy) {
    return `Managed by ${agent.managedBy}`;
  }
  return agent.owner ? `Created by ${agent.owner}` : undefined;
}

export default function AgentProfilePopover({
  target,
  onClose,
  onMessage,
  onMention,
  onAddToChannel,
}: AgentProfilePopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const [measured, setMeasured] = useState(false);
  const [closing, setClosing] = useState(false);
  const [detailsHost, setDetailsHost] = useState<HTMLElement | null>(null);

  const beginClose = useCallback(() => setClosing(true), []);

  useOutsideClose(ref, target != null && !closing, beginClose);

  useEffect(() => {
    if (!target || closing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') beginClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [target, closing, beginClose]);

  useLayoutEffect(() => {
    if (!target) {
      setMeasured(false);
      setClosing(false);
      setDetailsHost(null);
      return;
    }
    setClosing(false);
    setMeasured(false);
    const { anchorRect } = target;
    const maxLeft = window.innerWidth - POPOVER_WIDTH - 16;
    setLeft(Math.min(Math.max(8, anchorRect.left), Math.max(8, maxLeft)));
    setTop(anchorRect.bottom + POPOVER_GAP);
  }, [target]);

  // Mount model + description between ProfilePopover body and footer.
  useLayoutEffect(() => {
    if (!target || !ref.current) {
      setDetailsHost(null);
      return;
    }
    const footer = ref.current.querySelector<HTMLElement>(
      '[class*="profile-popover__footer"]',
    );
    const parent = footer?.parentElement;
    if (!footer || !parent) {
      setDetailsHost(null);
      return;
    }

    let host = parent.querySelector<HTMLElement>(
      '[data-agent-profile-details]',
    );
    if (!host) {
      host = document.createElement('div');
      host.dataset.agentProfileDetails = '';
      parent.insertBefore(host, footer);
    }
    setDetailsHost(host);

    return () => {
      host?.remove();
      setDetailsHost(null);
    };
  }, [target]);

  useLayoutEffect(() => {
    if (!target || !ref.current || measured) return;
    const h = ref.current.offsetHeight;
    const { anchorRect } = target;
    const spaceBelow = window.innerHeight - anchorRect.bottom - POPOVER_GAP - 16;
    const spaceAbove = anchorRect.top - POPOVER_GAP - 16;
    const placeAbove = h > spaceBelow && spaceAbove >= h;
    setTop(
      placeAbove
        ? anchorRect.top - h - POPOVER_GAP
        : anchorRect.bottom + POPOVER_GAP,
    );
    setMeasured(true);
  }, [target, measured, detailsHost]);

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (closing && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!target) {
    return null;
  }

  const { agent } = target;
  const avatarSrc =
    agent.customImageSrc ?? agentAvatarChipSrc(agent.shape, agent.color);
  const model = agentModelLabel(agent.model);
  const description = agent.description.trim();

  return createPortal(
    <div
      ref={ref}
      className={styles['agent-profile-popover']}
      style={{
        top,
        left,
        visibility: measured ? 'visible' : 'hidden',
      }}
    >
      <ProfilePopover
        className={styles['agent-profile-popover__surface']}
        avatarSrc={avatarSrc}
        avatarAlt={agent.name}
        name={agent.name}
        username={agentHandle(agent)}
        title={agentTitle(agent)}
        jobRole="Agent"
        onClose={beginClose}
        onPrimaryAction={
          onMessage
            ? () => {
                onMessage(agent);
                beginClose();
              }
            : beginClose
        }
        onMention={
          onMention
            ? () => {
                onMention(agent);
                beginClose();
              }
            : undefined
        }
        onAddToChannel={
          onAddToChannel
            ? () => {
                onAddToChannel(agent);
                beginClose();
              }
            : undefined
        }
        state={closing ? 'closing' : 'open'}
        onAnimationEnd={handleAnimationEnd}
      />
      {detailsHost
        ? createPortal(
            <div className={styles['agent-profile-popover__details']}>
              <div className={styles['agent-profile-popover__field']}>
                <p className={styles['agent-profile-popover__label']}>Model</p>
                <p className={styles['agent-profile-popover__value']}>{model}</p>
              </div>
              {description ? (
                <div className={styles['agent-profile-popover__field']}>
                  <p className={styles['agent-profile-popover__label']}>
                    Description
                  </p>
                  <p className={styles['agent-profile-popover__value']}>
                    {description}
                  </p>
                </div>
              ) : null}
            </div>,
            detailsHost,
          )
        : null}
    </div>,
    document.body,
  );
}

/** Build an open target from a clicked element + agent. */
export function profileAnchorFromEvent(
  agent: WorkspaceAgent,
  event: { currentTarget: EventTarget & Element },
): AgentProfileAnchor {
  return {
    agent,
    anchorRect: event.currentTarget.getBoundingClientRect(),
  };
}
