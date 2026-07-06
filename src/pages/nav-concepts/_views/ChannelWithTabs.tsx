/**
 * Channel view with linked-resource tabs at the top.
 *
 * Implements the Slack-canvas / MS-Teams-tabs pattern: a channel can host
 * additional resources (Pages, Agents, Playbooks, Runs) as tabs alongside
 * its Messages stream. Click a tab to swap the center to that resource;
 * the channel context (sidebar active row, classification) persists.
 */
import { useState } from 'react';
import type { Classification } from '../_shared/types';
import type { ChannelResource } from '../_shared/teamData';
import ViewStub from './ViewStub';
import styles from './ChannelWithTabs.module.scss';

const TAB_GLYPH: Record<string, string> = {
  messages: '💬',
  page: '📄',
  agent: '✨',
  playbook: '📋',
  run: '▶',
};

interface ChannelWithTabsProps {
  channel: ChannelResource;
  teamClassification: Classification;
}

export default function ChannelWithTabs({ channel, teamClassification }: ChannelWithTabsProps) {
  const tabs = channel.linkedTabs ?? [];
  const [activeTabId, setActiveTabId] = useState<string>('messages');
  const channelClass = channel.classification ?? teamClassification;

  if (tabs.length === 0) {
    // Channel with no linked tabs — just render the channel view directly
    return <ViewStub viewId="channel" classification={channelClass} resourceName={channel.name} />;
  }

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className={styles['cwt']}>
      <div className={styles['cwt__strip']}>
        <button
          type="button"
          className={[
            styles['cwt__tab'],
            activeTabId === 'messages' ? styles['cwt__tab--active'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => setActiveTabId('messages')}
        >
          <span className={styles['cwt__tab-glyph']}>{TAB_GLYPH.messages}</span>
          <span className={styles['cwt__tab-label']}>Messages</span>
        </button>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={[
              styles['cwt__tab'],
              activeTabId === t.id ? styles['cwt__tab--active'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setActiveTabId(t.id)}
          >
            <span className={styles['cwt__tab-glyph']}>{TAB_GLYPH[t.kind] ?? '•'}</span>
            <span className={styles['cwt__tab-label']}>{t.label}</span>
            <span className={styles['cwt__tab-product']}>{t.kind}</span>
          </button>
        ))}
        <button type="button" className={styles['cwt__tab-add']} title="Link another resource">
          +
        </button>
      </div>
      <div className={styles['cwt__body']}>
        {activeTabId === 'messages' ? (
          <ViewStub viewId="channel" classification={channelClass} resourceName={channel.name} />
        ) : activeTab ? (
          <ViewStub
            viewId={activeTab.viewId}
            classification={activeTab.classification ?? channelClass}
            resourceName={activeTab.label}
          />
        ) : null}
      </div>
    </div>
  );
}
