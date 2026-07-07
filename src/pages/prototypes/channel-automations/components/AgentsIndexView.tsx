import {
  Button,
  Icon,
  Scrollbar,
  SearchInput,
  Tabs,
} from '@mattermost/compass-ui';
import { useMemo, useState, type ChangeEvent } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import { type Agent } from '../channelAutomationsData';
import AgentListItem from './AgentListItem';
import NewAutomationAgentPicker from './NewAutomationAgentPicker';
import styles from './AgentsIndexView.module.scss';

type AgentsTabKey = 'all' | 'yours';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'yours', label: 'Yours' },
] as const;

export interface AgentsIndexViewProps {
  agents: Agent[];
  onSelectAgent: (id: string) => void;
  onNewAutomation: (agentId: string) => void;
  onRequestDelete?: (id: string) => void;
  showNewAutomation?: boolean;
}

/**
 * Agents product index (Figma `4312-17844`) — the main listing of agents with
 * filter tabs, search, and rows that open the configuration view.
 */
export default function AgentsIndexView({
  agents,
  onSelectAgent,
  onNewAutomation,
  onRequestDelete,
  showNewAutomation = true,
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
    <Scrollbar>
      <div className={styles['agents-index']}>
        <header className={styles['agents-index__header']}>
          <h1 className={styles['agents-index__title']}>Agents</h1>
          <p className={styles['agents-index__subtitle']}>
            AI agents with dedicated identity, access, and connected tools
          </p>
        </header>

        <div className={styles['agents-index__toolbar']}>
          <Tabs
            className={styles['agents-index__tabs']}
            tabs={TABS.map((item) => ({ key: item.key, label: item.label }))}
            activeKey={tab}
            onChange={(key: string) => setTab(key as AgentsTabKey)}
            ariaLabel="Agents filter"
            controls={
              <>
                <SearchInput
                  className={styles['agents-index__search']}
                  size="Medium"
                  placeholder="Search Agents"
                  value={query}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                  onClear={() => setQuery('')}
                  aria-label="Search agents"
                />
                <div className={styles['agents-index__actions']}>
                  {showNewAutomation ? (
                    <NewAutomationAgentPicker
                      emphasis="Tertiary"
                      onSelectAgent={onNewAutomation}
                    />
                  ) : null}
                  <Button
                    emphasis="Primary"
                    size="Medium"
                    leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                  >
                    New agent
                  </Button>
                </div>
              </>
            }
          />
        </div>

        <div className={styles['agents-index__body']}>
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
                  onEdit={onSelectAgent}
                  onRequestDelete={onRequestDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Scrollbar>
  );
}
