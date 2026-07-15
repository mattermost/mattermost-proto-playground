import { Checkbox, Icon, SectionNotice } from '@mattermost/compass-ui';
import { useId, useState, type ChangeEvent } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import {
  AUTOMATION_GRANTABLE_TOOLS,
  type AutomationGrantableTool,
} from '../channelAutomationsData';
import styles from './AutomationToolScope.module.scss';

export interface AutomationToolScopeProps {
  /** Display name of the executor agent, e.g. "Matty". */
  agentName?: string | null;
  /** Agent's own tools — shown as context, not as this control. */
  agentToolSummary?: string | null;
  className?: string;
}

/**
 * Option 4 — tools granted to this automation (least privilege), separate from
 * the executor agent's fixed MCP set.
 */
export default function AutomationToolScope({
  agentName,
  agentToolSummary,
  className = '',
}: AutomationToolScopeProps) {
  const panelId = useId().replace(/\W/g, '');
  const [expanded, setExpanded] = useState(false);
  const [enabledIds, setEnabledIds] = useState<Set<string>>(
    () =>
      new Set(
        AUTOMATION_GRANTABLE_TOOLS.filter((tool) => tool.suggested).map(
          (tool) => tool.id,
        ),
      ),
  );

  const toggle = (tool: AutomationGrantableTool, checked: boolean) => {
    setEnabledIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(tool.id);
      else next.delete(tool.id);
      return next;
    });
  };

  return (
    <section
      className={[styles['tool-scope'], className].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className={styles['tool-scope__trigger']}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className={styles['tool-scope__trigger-copy']}>
          <span className={styles['tool-scope__trigger-label']}>Tools</span>
          <span className={styles['tool-scope__trigger-hint']}>
            Least-privilege grants for this automation only — not the agent’s
            permanent tool set.
          </span>
        </span>
        <span className={styles['tool-scope__trigger-end']}>
          <span
            className={[
              styles['tool-scope__chevron'],
              expanded ? styles['tool-scope__chevron--open'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden
          >
            <Icon size="16" glyph={<ChevronDownIcon />} />
          </span>
        </span>
      </button>

      <div
        className={[
          styles['tool-scope__collapse'],
          expanded ? styles['tool-scope__collapse--expanded'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden={!expanded}
      >
        <div className={styles['tool-scope__collapse-inner']} id={panelId}>
          {agentToolSummary ? (
            <SectionNotice
              type="Info"
              title={`${agentName ?? 'This agent'} already has: ${agentToolSummary}. Enable additional tools below only if the task needs them.`}
            />
          ) : null}

          <ul className={styles['tool-scope__list']}>
            {AUTOMATION_GRANTABLE_TOOLS.map((tool) => {
              const checked = enabledIds.has(tool.id);
              return (
                <li key={tool.id} className={styles['tool-scope__row']}>
                  <Checkbox
                    size="Medium"
                    checked={checked}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      toggle(tool, e.target.checked)
                    }
                  >
                    <span className={styles['tool-scope__row-label']}>
                      {tool.label}
                    </span>
                  </Checkbox>
                  <p className={styles['tool-scope__desc']}>{tool.description}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
