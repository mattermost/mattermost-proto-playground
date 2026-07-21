import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import { Icon, Scrollbar, SearchInput } from '@mattermost/compass-ui';
import { useMemo, useState, type ChangeEvent } from 'react';
import { ACTION_STEPS, FLOW_STEPS } from '../../data/actions';
import { ALL_TRIGGERS, TRIGGER_COUNT } from '../../data/triggers';
import type { PaletteItem } from '../../data/types';
import styles from './editor.module.scss';

type StepsPaletteProps = {
  onAdd: (item: PaletteItem) => void;
};

export default function StepsPalette({ onAdd }: StepsPaletteProps) {
  const [query, setQuery] = useState('');
  const [triggersOpen, setTriggersOpen] = useState(true);
  const [actionsOpen, setActionsOpen] = useState(true);
  const [flowOpen, setFlowOpen] = useState(true);

  const filteredTriggers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_TRIGGERS;
    return ALL_TRIGGERS.filter((t) => t.label.toLowerCase().includes(q));
  }, [query]);

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACTION_STEPS;
    return ACTION_STEPS.filter((t) => t.label.toLowerCase().includes(q));
  }, [query]);

  const filteredFlow = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FLOW_STEPS;
    return FLOW_STEPS.filter((t) => t.label.toLowerCase().includes(q));
  }, [query]);

  const renderItem = (item: PaletteItem) => (
    <button
      key={item.id}
      type="button"
      className={[
        styles.palette__item,
        item.kind === 'action' ? styles['palette__item--action'] : '',
        item.kind === 'flow' ? styles['palette__item--flow'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={item.disabled}
      draggable={!item.disabled}
      onDragStart={(e) => {
        e.dataTransfer.setData('application/automations-step', JSON.stringify(item));
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={() => {
        if (!item.disabled) onAdd(item);
      }}
    >
      {item.label}
    </button>
  );

  return (
    <div className={styles.palette}>
      <SearchInput
        label="Search steps…"
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        size="Small"
      />
      <div className={styles.palette__legend} aria-hidden>
        <span>
          <i className={[styles.palette__dot, styles['palette__dot--get']].join(' ')} />
          Get
        </span>
        <span>
          <i
            className={[styles.palette__dot, styles['palette__dot--create']].join(' ')}
          />
          Create
        </span>
        <span>
          <i
            className={[styles.palette__dot, styles['palette__dot--update']].join(' ')}
          />
          Update
        </span>
        <span>
          <i
            className={[styles.palette__dot, styles['palette__dot--delete']].join(' ')}
          />
          Delete
        </span>
      </div>
      <Scrollbar style={{ flex: 1, minHeight: 0 }}>
        <div className={styles.palette__section}>
          <button
            type="button"
            className={styles['palette__section-header']}
            onClick={() => setTriggersOpen((v) => !v)}
          >
            <span>Triggers ({TRIGGER_COUNT})</span>
            <Icon size="16" glyph={<ChevronDownIcon />} />
          </button>
          {triggersOpen ? (
            <div className={styles.palette__items}>{filteredTriggers.map(renderItem)}</div>
          ) : null}
        </div>
        <div className={styles.palette__section} style={{ marginTop: 10 }}>
          <button
            type="button"
            className={styles['palette__section-header']}
            onClick={() => setActionsOpen((v) => !v)}
          >
            <span>Actions ({filteredActions.length})</span>
            <Icon size="16" glyph={<ChevronDownIcon />} />
          </button>
          {actionsOpen ? (
            <div className={styles.palette__items}>{filteredActions.map(renderItem)}</div>
          ) : null}
        </div>
        <div className={styles.palette__section} style={{ marginTop: 10 }}>
          <button
            type="button"
            className={styles['palette__section-header']}
            onClick={() => setFlowOpen((v) => !v)}
          >
            <span>Flow ({filteredFlow.length})</span>
            <Icon size="16" glyph={<ChevronDownIcon />} />
          </button>
          {flowOpen ? (
            <div className={styles.palette__items}>{filteredFlow.map(renderItem)}</div>
          ) : null}
        </div>
      </Scrollbar>
    </div>
  );
}
