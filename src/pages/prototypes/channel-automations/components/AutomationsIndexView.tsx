import { Button, Icon, Scrollbar, SearchInput, Tabs } from '@mattermost/compass-ui';
import { useMemo, useState, type ChangeEvent } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import type { Automation } from '../channelAutomationsData';
import AutomationListItem from './AutomationListItem';
import NewAutomationAgentPicker from './NewAutomationAgentPicker';
import indexStyles from './AutomationsIndexView.module.scss';

type AutomationsTabKey = 'all' | 'yours';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'yours', label: 'Yours' },
] as const;

export interface AutomationsIndexViewProps {
  automations: Automation[];
  onSelectAutomation: (id: string) => void;
  onNewAutomation: () => void;
  onNewAutomationForAgent?: (agentId: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onRequestDelete?: (id: string) => void;
  showAgent?: boolean;
}

export default function AutomationsIndexView({
  automations,
  onSelectAutomation,
  onNewAutomation,
  onNewAutomationForAgent,
  onToggle,
  onRequestDelete,
  showAgent = true,
}: AutomationsIndexViewProps) {
  const [tab, setTab] = useState<AutomationsTabKey>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return automations.filter((automation) => {
      if (tab === 'yours' && !automation.ownedByCurrentUser) return false;
      if (!normalized) return true;

      return automation.name.toLowerCase().includes(normalized);
    });
  }, [automations, query, tab]);

  return (
    <Scrollbar>
      <div className={indexStyles['automations-index']}>
        <header className={indexStyles['automations-index__header']}>
          <h1 className={indexStyles['automations-index__title']}>Automations</h1>
          <p className={indexStyles['automations-index__subtitle']}>
            Scheduled and event-driven automations for your channels
          </p>
        </header>

        <div className={indexStyles['automations-index__toolbar']}>
          <Tabs
            className={indexStyles['automations-index__tabs']}
            tabs={TABS.map((item) => ({ key: item.key, label: item.label }))}
            activeKey={tab}
            onChange={(key: string) => setTab(key as AutomationsTabKey)}
            ariaLabel="Automations filter"
            controls={
              <>
                <SearchInput
                  className={indexStyles['automations-index__search']}
                  size="Medium"
                  placeholder="Search automations"
                  value={query}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                  onClear={() => setQuery('')}
                  aria-label="Search automations"
                />
                <div className={indexStyles['automations-index__actions']}>
                  {onNewAutomationForAgent ? (
                    <NewAutomationAgentPicker
                      onSelectAgent={onNewAutomationForAgent}
                    />
                  ) : (
                    <Button
                      size="Medium"
                      emphasis="Primary"
                      leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                      onClick={onNewAutomation}
                    >
                      New automation
                    </Button>
                  )}
                </div>
              </>
            }
          />
        </div>

        <div className={indexStyles['automations-index__body']}>
          {filtered.length === 0 ? (
            <p className={indexStyles['automations-index__empty']}>
              No automations match your search.
            </p>
          ) : (
            <div className={indexStyles['automations-index__list']}>
              {filtered.map((automation) => (
                <AutomationListItem
                  key={automation.id}
                  automation={automation}
                  showAgent={showAgent}
                  onToggle={onToggle}
                  onEdit={onSelectAutomation}
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
