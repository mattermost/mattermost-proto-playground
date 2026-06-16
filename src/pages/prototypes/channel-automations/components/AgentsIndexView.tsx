import { useMemo, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import Tabs from '@/components/ui/Tabs/Tabs';
import type { Agent } from '../channelAutomationsData';
import AgentListItem from './AgentListItem';
import styles from './AgentsIndexView.module.scss';

type AgentsTabKey = 'all' | 'yours';

const TABS = [
  { key: 'all', label: 'All agents' },
  { key: 'yours', label: 'Your agents' },
] as const;

export interface AgentsIndexViewProps {
  agents: Agent[];
  onSelectAgent: (id: string) => void;
}

/**
 * Agents product index (Figma `4312-17844`) — the main listing of agents with
 * filter tabs, search, and rows that open the configuration view.
 */
export default function AgentsIndexView({
  agents,
  onSelectAgent,
}: AgentsIndexViewProps) {
  const [tab, setTab] = useState<AgentsTabKey>('all');
  const [query, setQuery] = useState('');

  const filteredAgents = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return agents.filter((agent) => {
      if (tab === 'yours' && !agent.ownedByCurrentUser) return false;
      if (!normalized) return true;

      return (
        agent.displayName.toLowerCase().includes(normalized) ||
        agent.username.toLowerCase().includes(normalized)
      );
    });
  }, [agents, query, tab]);

  return (
    <Scrollbars>
      <div className={styles['agents-index']}>
        <header className={styles['agents-index__header']}>
          <h1 className={styles['agents-index__title']}>Agents</h1>
          <p className={styles['agents-index__subtitle']}>
            Here are the agents you have access to
          </p>
        </header>

        <div className={styles['agents-index__toolbar']}>
          <Tabs
            tabs={TABS.map((item) => ({ key: item.key, label: item.label }))}
            activeKey={tab}
            onChange={(key) => setTab(key as AgentsTabKey)}
            ariaLabel="Agents filter"
          />
          <div className={styles['agents-index__actions']}>
            <Button
              size="Small"
              emphasis="Tertiary"
              leadingIcon={
                <Icon size="12" glyph={<LightningBoltOutlineIcon />} />
              }
              trailingIcon={<Icon size="12" glyph={<ChevronDownIcon />} />}
            >
              New automation
            </Button>
            <Button
              size="Small"
              emphasis="Primary"
              leadingIcon={<Icon size="12" glyph={<PlusIcon />} />}
            >
              New agent
            </Button>
          </div>
        </div>

        <div className={styles['agents-index__body']}>
          <SearchInput
            className={styles['agents-index__search']}
            size="Medium"
            placeholder="Search Agents"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            aria-label="Search agents"
          />

          {filteredAgents.length === 0 ? (
            <p className={styles['agents-index__empty']}>
              No agents match your search.
            </p>
          ) : (
            <div className={styles['agents-index__list']}>
              {filteredAgents.map((agent) => (
                <AgentListItem
                  key={agent.id}
                  agent={agent}
                  onSelect={onSelectAgent}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Scrollbars>
  );
}
