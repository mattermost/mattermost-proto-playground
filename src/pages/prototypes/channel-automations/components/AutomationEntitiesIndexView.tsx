import { Button, Icon, Scrollbars, SearchInput, Tabs } from '@mattermost/compass-ui';
import { useMemo, useState, type ChangeEvent } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import type { AutomationEntity } from '../channelAutomationsData';
import AutomationEntityListItem from './AutomationEntityListItem';
import styles from './AutomationsIndexView.module.scss';

type AutomationsTabKey = 'all' | 'yours';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'yours', label: 'Yours' },
] as const;

export interface AutomationEntitiesIndexViewProps {
  entities: AutomationEntity[];
  onSelectEntity: (id: string) => void;
  onNewAutomation: () => void;
  onToggle: (id: string, enabled: boolean) => void;
  onRequestDelete?: (id: string) => void;
}

export default function AutomationEntitiesIndexView({
  entities,
  onSelectEntity,
  onNewAutomation,
  onToggle,
  onRequestDelete,
}: AutomationEntitiesIndexViewProps) {
  const [tab, setTab] = useState<AutomationsTabKey>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return entities.filter((entity) => {
      if (tab === 'yours' && !entity.ownedByCurrentUser) return false;
      if (!normalized) return true;

      return (
        entity.displayName.toLowerCase().includes(normalized) ||
        entity.username.toLowerCase().includes(normalized)
      );
    });
  }, [entities, query, tab]);

  return (
    <Scrollbars>
      <div className={styles['automations-index']}>
        <header className={styles['automations-index__header']}>
          <h1 className={styles['automations-index__title']}>Automations</h1>
          <p className={styles['automations-index__subtitle']}>
            Agent-like automations with their own configuration and tools
          </p>
        </header>

        <div className={styles['automations-index__toolbar']}>
          <Tabs
            className={styles['automations-index__tabs']}
            tabs={TABS.map((item) => ({ key: item.key, label: item.label }))}
            activeKey={tab}
            onChange={(key: string) => setTab(key as AutomationsTabKey)}
            ariaLabel="Automations filter"
            controls={
              <>
                <SearchInput
                  className={styles['automations-index__search']}
                  size="Medium"
                  placeholder="Search automations"
                  value={query}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                  onClear={() => setQuery('')}
                  aria-label="Search automations"
                />
                <div className={styles['automations-index__actions']}>
                  <Button
                    size="Medium"
                    emphasis="Primary"
                    leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                    onClick={onNewAutomation}
                  >
                    New automation
                  </Button>
                </div>
              </>
            }
          />
        </div>

        <div className={styles['automations-index__body']}>
          {filtered.length === 0 ? (
            <p className={styles['automations-index__empty']}>
              No automations match your search.
            </p>
          ) : (
            <div className={styles['automations-index__list']}>
              {filtered.map((entity) => (
                <AutomationEntityListItem
                  key={entity.id}
                  entity={entity}
                  onToggle={onToggle}
                  onEdit={onSelectEntity}
                  onRequestDelete={onRequestDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Scrollbars>
  );
}
