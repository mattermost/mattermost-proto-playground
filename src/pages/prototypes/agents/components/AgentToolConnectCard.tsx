import CheckIcon from '@mattermost/compass-icons/components/check';
import { Icon } from '@mattermost/compass-ui/components/icon';
import type { AgentToolConnectOption } from '../agentsData';
import styles from './AgentToolConnectCard.module.scss';

type AgentToolConnectCardProps = {
  options: AgentToolConnectOption[];
  selectedId?: string;
  onSelect: (option: AgentToolConnectOption) => void;
  /** Defaults to Matty tool-connect copy. */
  ariaLabel?: string;
};

/**
 * Interactive message attachment: numbered single-select tool list
 * (Figma 71:103091). Prototype-only — no real OAuth.
 * After a choice, collapses to the selected row with a checkmark.
 */
export default function AgentToolConnectCard({
  options,
  selectedId,
  onSelect,
  ariaLabel = 'Tools your organization allows',
}: AgentToolConnectCardProps) {
  const resolved = Boolean(selectedId);

  return (
    <div
      className={[
        styles['tool-connect-card'],
        resolved ? styles['tool-connect-card--resolved'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={styles['tool-connect-card__body']}
        role="radiogroup"
        aria-label={ariaLabel}
      >
        {options.map((option, index) => {
          const selected = option.id === selectedId;
          const collapsed = resolved && !selected;
          return (
            <div
              key={option.id}
              className={[
                styles['tool-connect-card__option-slot'],
                collapsed
                  ? styles['tool-connect-card__option-slot--collapsed']
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles['tool-connect-card__option-inner']}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-hidden={collapsed || undefined}
                  tabIndex={collapsed ? -1 : 0}
                  disabled={resolved}
                  className={[
                    styles['tool-connect-card__option'],
                    selected
                      ? styles['tool-connect-card__option--selected']
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    if (!resolved) {
                      onSelect(option);
                    }
                  }}
                >
                  <span className={styles['tool-connect-card__index']}>
                    {selected ? (
                      <Icon glyph={<CheckIcon />} size="12" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className={styles['tool-connect-card__label']}>
                    {option.label}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
