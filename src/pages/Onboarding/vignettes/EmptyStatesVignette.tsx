import { useState } from 'react';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import MessageInput from '@/components/ui/MessageInput';
import Tabs from '@/components/ui/Tabs/Tabs';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import {
  AGENT,
  WORKSPACE_NAME,
  buildStandardSidebarModel,
} from '../onboarding.fixtures';
import styles from './EmptyStatesVignette.module.scss';

type EmptyId =
  | 'dm-list'
  | 'new-channel'
  | 'saved'
  | 'search'
  | 'files'
  | 'playbooks'
  | 'boards'
  | 'ask-agent';

const EMPTIES: { key: EmptyId; label: string }[] = [
  { key: 'new-channel', label: 'New channel' },
  { key: 'dm-list', label: 'DM list' },
  { key: 'saved', label: 'Saved' },
  { key: 'search', label: 'Search' },
  { key: 'files', label: 'Files' },
  { key: 'playbooks', label: 'Playbooks' },
  { key: 'boards', label: 'Boards' },
  { key: 'ask-agent', label: 'Ask Agent' },
];

const PROMPT_CHIPS = [
  'Summarize #engineering today',
  'Find decisions from last week',
  'Draft a status update for my team',
];

export default function EmptyStatesVignette() {
  const [active, setActive] = useState<EmptyId>('new-channel');

  return (
    <div className={styles['empty-states']}>
      <ChannelShell
        channelsSidebarModel={buildStandardSidebarModel({
          activeChannel: active === 'ask-agent' ? AGENT.name : 'Engineering',
        })}
        teamName={WORKSPACE_NAME}
        channelHeader={renderHeader(active)}
      >
        <div className={styles['empty-states__tabs']}>
          <Tabs
            tabs={EMPTIES.map((e) => ({ key: e.key, label: e.label }))}
            activeKey={active}
            onChange={(k) => setActive(k as EmptyId)}
          />
        </div>
        <div className={styles['empty-states__body']}>
          <EmptyContent kind={active} />
        </div>
        {active !== 'ask-agent' && (
          <div className={shellStyles['channel-shell__message-input']}>
            <MessageInput placeholder="Write a message" />
          </div>
        )}
      </ChannelShell>
    </div>
  );
}

function renderHeader(active: EmptyId) {
  if (active === 'ask-agent') {
    return (
      <ChannelHeader
        type="Bot"
        name={AGENT.name}
        description="AI assistant for your workspace"
        avatarSrc={AGENT.avatarSrc}
      />
    );
  }
  if (active === 'new-channel') {
    return (
      <ChannelHeader
        type="Channel"
        name="design-handoff"
        description="Just created"
        memberCount={1}
      />
    );
  }
  if (active === 'dm-list') {
    return (
      <ChannelHeader type="Threads" name="Direct Messages" />
    );
  }
  if (active === 'saved') {
    return <ChannelHeader type="Threads" name="Saved messages" />;
  }
  if (active === 'search') {
    return <ChannelHeader type="Threads" name="Search results" />;
  }
  if (active === 'files') {
    return <ChannelHeader type="Threads" name="Files" />;
  }
  if (active === 'playbooks') {
    return <ChannelHeader type="Threads" name="Playbooks" />;
  }
  return <ChannelHeader type="Threads" name="Boards" />;
}

function EmptyContent({ kind }: { kind: EmptyId }) {
  switch (kind) {
    case 'new-channel':
      return (
        <EmptyState
          title="Be the first to say hi"
          description="This channel is brand new. Drop in a welcome message so your teammates know what it’s for."
          action={{ children: 'Send first message', emphasis: 'Primary' }}
        />
      );
    case 'dm-list':
      return (
        <EmptyState
          title="No conversations yet"
          description="Direct messages are private 1:1 or small-group chats. Start one with a teammate or message Mattermost Agent."
          action={{ children: 'Start a message', emphasis: 'Primary' }}
        />
      );
    case 'saved':
      return (
        <EmptyState
          title="Nothing saved yet"
          description="Save messages from any channel — they’ll collect here so you can find them later."
        />
      );
    case 'search':
      return (
        <EmptyState
          title="No results for “onboarding playbook”"
          description="Try fewer words, or search a specific channel. Mattermost Agent can also dig through history for you."
          action={{ children: 'Ask Mattermost Agent', emphasis: 'Secondary' }}
        />
      );
    case 'files':
      return (
        <EmptyState
          title="No files in this workspace yet"
          description="Drag and drop into any channel — files shared in chat will appear here for easy retrieval."
        />
      );
    case 'playbooks':
      return (
        <EmptyState
          title="Run your first playbook"
          description="Playbooks coordinate incidents, handovers, and recurring work. Start from a template or build your own."
          action={{ children: 'Browse templates', emphasis: 'Primary' }}
        />
      );
    case 'boards':
      return (
        <EmptyState
          title="Start your first board"
          description="Boards live alongside conversations — track work without switching tools."
          action={{ children: 'Create a board', emphasis: 'Primary' }}
        />
      );
    case 'ask-agent':
      return (
        <div className={styles['empty-states__agent']}>
          <h2 className={styles['empty-states__agent-title']}>
            Ask Mattermost Agent anything
          </h2>
          <p className={styles['empty-states__agent-body']}>
            Mattermost Agent can summarize channels, find decisions, and draft
            updates using your workspace’s history. Try one of these to start:
          </p>
          <div className={styles['empty-states__chips']}>
            {PROMPT_CHIPS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className={styles['empty-states__chip']}
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className={styles['empty-states__agent-input']}>
            <MessageInput placeholder="Ask Mattermost Agent" width="narrow" />
          </div>
        </div>
      );
  }
}
