import { Icon, Select } from '@mattermost/compass-ui';
import { useEffect, useId, useState, type ChangeEvent } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import { modelsForAiService } from '../channelAutomationsData';
import AccessTab from './AccessTab';
import McpsTab from './McpsTab';
import styles from './AdvancedAgentConfig.module.scss';

export interface AdvancedAgentConfigProps {
  activeMcps?: number;
  toolCount?: number;
  /** Selected System Console AI service — drives available models. */
  aiServiceId: string;
  className?: string;
}

/**
 * Option 3b — agent plumbing (model, tools, access) collapsed behind Advanced.
 */
export default function AdvancedAgentConfig({
  activeMcps,
  toolCount,
  aiServiceId,
  className = '',
}: AdvancedAgentConfigProps) {
  const panelId = useId().replace(/\W/g, '');
  const [expanded, setExpanded] = useState(false);
  const models = modelsForAiService(aiServiceId);
  const [model, setModel] = useState(models[0]?.id ?? '');

  useEffect(() => {
    const nextModels = modelsForAiService(aiServiceId);
    setModel((current) =>
      nextModels.some((option) => option.id === current)
        ? current
        : (nextModels[0]?.id ?? ''),
    );
  }, [aiServiceId]);

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
            Model, tools, and access
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
            <Select
              label="Model"
              value={model}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setModel(e.target.value)
              }
            >
              {models.map((option) => (
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
