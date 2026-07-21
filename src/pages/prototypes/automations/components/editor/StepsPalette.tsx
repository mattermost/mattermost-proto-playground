import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import { Icon, Scrollbar, SearchInput } from '@mattermost/compass-ui';
import { useMemo, useState, type ChangeEvent } from 'react';
import { ACTION_STEPS, FLOW_STEPS } from '../../data/actions';
import { ALL_TRIGGERS, TRIGGER_COUNT } from '../../data/triggers';
import type { PaletteItem } from '../../data/types';
import { glyphForPaletteItem } from './paletteIcons';
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

  const renderItem = (item: PaletteItem) => {
    const Glyph = glyphForPaletteItem(item);
    return (
      <button
        key={item.id}
        type="button"
        className={styles.palette__item}
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
        <span className={styles['palette__item-icon']} aria-hidden>
          <Icon size="16" glyph={<Glyph />} />
        </span>
        <span className={styles['palette__item-label']}>{item.label}</span>
      </button>
    );
  };

  return (
    <div className={styles.palette}>
      <SearchInput
        label="Search steps…"
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        size="Small"
      />
      <Scrollbar style={{ flex: 1, minHeight: 0 }}>
        <div className={styles.palette__section}>
          <button
            type="button"
            className={styles['palette__section-header']}
            onClick={() => setTriggersOpen((v) => !v)}
          >
            <span>Triggers ({TRIGGER_COUNT})</span>
            <span className={styles['palette__section-chevron']} aria-hidden>
              <Icon size="16" glyph={<ChevronDownIcon />} />
            </span>
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
            <span className={styles['palette__section-chevron']} aria-hidden>
              <Icon size="16" glyph={<ChevronDownIcon />} />
            </span>
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
            <span className={styles['palette__section-chevron']} aria-hidden>
              <Icon size="16" glyph={<ChevronDownIcon />} />
            </span>
          </button>
          {flowOpen ? (
            <div className={styles.palette__items}>{filteredFlow.map(renderItem)}</div>
          ) : null}
        </div>
      </Scrollbar>
    </div>
  );
}
