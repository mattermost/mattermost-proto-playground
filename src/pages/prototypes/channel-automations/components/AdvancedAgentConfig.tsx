import { Icon, Select } from '@mattermost/compass-ui';
import { useId, useState, type ChangeEvent } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import AccessTab from './AccessTab';
import McpsTab from './McpsTab';
import styles from './AdvancedAgentConfig.module.scss';

const MODEL_OPTIONS = [
  { id: 'default', label: 'Default workspace model' },
  { id: 'gpt-4.1', label: 'GPT-4.1' },
  { id: 'claude-sonnet', label: 'Claude Sonnet' },
] as const;

export interface AdvancedAgentConfigProps {
  activeMcps?: number;
  toolCount?: number;
  className?: string;
}

/**
 * Option 5 — agent plumbing (model, tools, access) collapsed behind Advanced.
 * Blast radius stays outside this panel.
 */
export default function AdvancedAgentConfig({
  activeMcps,
  toolCount,
  className = '',
}: AdvancedAgentConfigProps) {
  const panelId = useId().replace(/\W/g, '');
  const [expanded, setExpanded] = useState(false);
  const [model, setModel] = useState<(typeof MODEL_OPTIONS)[number]['id']>(
    'default',
  );

  return (
    <section
      className={[styles['advanced'], className].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className={styles['advanced__trigger']}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className={styles['advanced__trigger-copy']}>
          <span className={styles['advanced__trigger-label']}>Advanced</span>
          <span className={styles['advanced__trigger-hint']}>
            Model, tools, and access — this automation runs as its own agent
          </span>
        </span>
        <span
          className={[
            styles['advanced__chevron'],
            expanded ? styles['advanced__chevron--open'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden
        >
          <Icon size="16" glyph={<ChevronDownIcon />} />
        </span>
      </button>

      <div
        className={[
          styles['advanced__collapse'],
          expanded ? styles['advanced__collapse--expanded'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden={!expanded}
      >
        <div className={styles['advanced__collapse-inner']} id={panelId}>
          <div className={styles['advanced__section']}>
            <h4 className={styles['advanced__section-title']}>Model</h4>
            <Select
              label="Model"
              value={model}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setModel(e.target.value as typeof model)
              }
            >
              {MODEL_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className={styles['advanced__section']}>
            <h4 className={styles['advanced__section-title']}>Tools & MCPs</h4>
            <p className={styles['advanced__section-lead']}>
              Least-privilege defaults matched this task; adjust only if needed.
            </p>
            <McpsTab activeMcps={activeMcps} toolCount={toolCount} />
          </div>

          <div className={styles['advanced__section']}>
            <h4 className={styles['advanced__section-title']}>Access</h4>
            <AccessTab />
          </div>
        </div>
      </div>
    </section>
  );
}
