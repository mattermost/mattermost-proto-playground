import { useEffect, useRef, useState } from 'react';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { ChannelHeader } from '@mattermost/compass-ui/components/channel-header';
import { Message } from '@mattermost/compass-ui/components/message';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import {
  buildWorkspaceDirectory,
  findAgentsNeedingChannelInvite,
  initialServiceStatusAgentIds,
  SERVICE_STATUS_MESSAGES,
  VIEWER,
  type ChannelMessage,
  type ChannelMessagePart,
  type WorkspaceAgent,
} from '../../agentsData';
import AddAgentToChannelModal from '../../components/AddAgentToChannelModal';
import AgentProfilePopover, {
  profileAnchorFromEvent,
  type AgentProfileAnchor,
} from '../../components/AgentProfilePopover';
import MentionMessageInput from '../../components/MentionMessageInput';
import mentionStyles from '../../components/MentionMessageInput.module.scss';
import { useAgents } from '../../context/AgentsContext';
import ChannelsProductSidebar from './ChannelsProductSidebar';
import styles from './ChannelsHome.module.scss';

function formatChannelTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function MessageBody({
  body,
  parts,
  onAgentProfile,
}: {
  body: string;
  parts?: ChannelMessagePart[];
  onAgentProfile: (
    agentId: string,
    event: { currentTarget: EventTarget & Element },
  ) => void;
}) {
  if (!parts?.length) {
    return <p className={styles['channels-home__post']}>{body}</p>;
  }

  return (
    <p className={mentionStyles['mention-input__post']}>
      {parts.map((part, index) =>
        part.type === 'text' ? (
          <span key={`t-${index}`}>{part.text}</span>
        ) : (
          <Chip
            key={`m-${part.id}-${index}`}
            size="medium-compact"
            leadingAvatar={{ src: part.avatarSrc, alt: part.label }}
            role={part.kind === 'agent' ? 'button' : undefined}
            tabIndex={part.kind === 'agent' ? 0 : undefined}
            aria-label={
              part.kind === 'agent' ? `View ${part.label} profile` : undefined
            }
            onClick={
              part.kind === 'agent'
                ? (event) => {
                    event.stopPropagation();
                    onAgentProfile(part.id, event);
                  }
                : undefined
            }
            onKeyDown={
              part.kind === 'agent'
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      onAgentProfile(part.id, event);
                    }
                  }
                : undefined
            }
            className={[
              mentionStyles['mention-input__mention-chip'],
              mentionStyles['mention-input__post-chip'],
              part.kind === 'agent'
                ? mentionStyles['mention-input__mention-chip--agent']
                : '',
              part.kind === 'agent'
                ? mentionStyles['mention-input__post-chip--interactive']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {part.label}
          </Chip>
        ),
      )}
    </p>
  );
}

type PendingInvite = {
  agents: WorkspaceAgent[];
  parts: ChannelMessagePart[];
  body: string;
};

/** Channels product — quiet `#service-status` home for the vision demo. */
export default function ChannelsHome() {
  const { customAgents } = useAgents();
  const [messages, setMessages] = useState<ChannelMessage[]>(
    SERVICE_STATUS_MESSAGES,
  );
  const [channelAgentIds, setChannelAgentIds] = useState(
    () => new Set(initialServiceStatusAgentIds()),
  );
  const [memberCount, setMemberCount] = useState(6);
  const [pendingInvite, setPendingInvite] = useState<PendingInvite | null>(
    null,
  );
  const [composerKey, setComposerKey] = useState(0);
  const [profileTarget, setProfileTarget] =
    useState<AgentProfileAnchor | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const resolveAgent = (id: string) =>
    buildWorkspaceDirectory(customAgents).find((agent) => agent.id === id);

  const openAgentProfile = (
    agentId: string,
    event: { currentTarget: EventTarget & Element },
  ) => {
    const agent = resolveAgent(agentId);
    if (!agent) return;
    setProfileTarget(profileAnchorFromEvent(agent, event));
  };

  const postMessage = (parts: ChannelMessagePart[], body: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `live-${Date.now()}`,
        username: VIEWER.name,
        avatarSrc: VIEWER.avatarSrc,
        avatarAlt: VIEWER.avatarAlt,
        timestamp: formatChannelTime(),
        body,
        parts,
      },
    ]);
  };

  const handleSend = ({
    parts,
    body,
  }: {
    parts: ChannelMessagePart[];
    body: string;
  }): boolean | void => {
    const needed = findAgentsNeedingChannelInvite(
      parts,
      channelAgentIds,
      customAgents,
    );
    if (needed.length > 0) {
      setPendingInvite({ agents: needed, parts, body });
      return false;
    }
    postMessage(parts, body);
  };

  const confirmInvite = () => {
    if (!pendingInvite) return;
    setChannelAgentIds((prev) => {
      const next = new Set(prev);
      for (const agent of pendingInvite.agents) {
        next.add(agent.id);
      }
      return next;
    });
    setMemberCount((count) => count + pendingInvite.agents.length);
    postMessage(pendingInvite.parts, pendingInvite.body);
    setPendingInvite(null);
    setComposerKey((key) => key + 1);
  };

  const addAgentFromProfile = (agent: WorkspaceAgent) => {
    if (channelAgentIds.has(agent.id)) return;
    setChannelAgentIds((prev) => new Set(prev).add(agent.id));
    setMemberCount((count) => count + 1);
  };

  return (
    <div className={styles['channels-home']}>
      <ChannelsProductSidebar />
      <div className={styles['channels-home__center']}>
        <ChannelHeader
          type="channel"
          name="service-status"
          description="Customer-facing reliability and checkout health."
          memberCount={memberCount}
          pinnedCount={1}
        />
        <div className={styles['channels-home__messages']}>
          <Scrollbar>
            <div className={styles['channels-home__messages-list']}>
              <MessageSeparator type="date" label="Today" />
              {messages.map((message) => (
                <Message
                  key={message.id}
                  avatarSrc={message.avatarSrc}
                  avatarAlt={message.avatarAlt}
                  username={message.username}
                  timestamp={message.timestamp}
                  showMessageActions={false}
                >
                  <MessageBody
                    body={message.body}
                    parts={message.parts}
                    onAgentProfile={openAgentProfile}
                  />
                </Message>
              ))}
              <div ref={bottomRef} />
            </div>
          </Scrollbar>
        </div>
        <div className={styles['channels-home__composer']}>
          <MentionMessageInput
            key={composerKey}
            placeholder="Write to service-status"
            onSend={handleSend}
          />
        </div>
      </div>
      <AddAgentToChannelModal
        open={pendingInvite != null}
        agents={pendingInvite?.agents ?? []}
        onCancel={() => setPendingInvite(null)}
        onConfirm={confirmInvite}
      />
      <AgentProfilePopover
        target={profileTarget}
        onClose={() => setProfileTarget(null)}
        onAddToChannel={
          profileTarget && !channelAgentIds.has(profileTarget.agent.id)
            ? addAgentFromProfile
            : undefined
        }
      />
    </div>
  );
}
