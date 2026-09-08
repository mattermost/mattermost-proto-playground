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
import type { WorkspaceAgent } from '../agentsData';
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
  return agent.owner ? `Owned by ${agent.owner}` : undefined;
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
      return;
    }
    setClosing(false);
    setMeasured(false);
    const { anchorRect } = target;
    const maxLeft = window.innerWidth - POPOVER_WIDTH - 16;
    setLeft(Math.min(Math.max(8, anchorRect.left), Math.max(8, maxLeft)));
    // Tentative below; refine after measure.
    setTop(anchorRect.bottom + POPOVER_GAP);
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
  }, [target, measured]);

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
        jobRole={agent.role}
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
