import { useState } from 'react';
import Switch from '@/components/ui/Switch/Switch';
import Button from '@/components/ui/Button/Button';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import ConsolePropertyTable from '@/components/ui/ConsolePropertyTable/ConsolePropertyTable';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import {
  isSourceOwned,
  listValuesForOverlay,
  takesValueList,
  visibleValues,
  type HubAttribute,
  type ResourceConfig,
} from '@/pages/AttributeManagementHub/hubData';
import styles from './MvpAllowedValuesPanel.module.scss';

export interface MvpAllowedValuesPanelProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
}

const VALUE_COLUMNS = [
  { key: 'value', label: 'Value', width: 240 },
  { key: 'allow', label: 'Allow new', width: 200 },
];

/**
 * OPEN (session decision) — per-resource allowed-value subsets. Only rendered
 * when `?allowed=on` is in the URL; hidden by default in P0. Wired so it can be
 * flipped on live in the scope session.
 */
export default function MvpAllowedValuesPanel({
  attribute,
  config,
  onChange,
}: MvpAllowedValuesPanelProps) {
  const sourceOwned = isSourceOwned(attribute);
  const values = visibleValues(attribute, listValuesForOverlay(attribute));
  const disabledIds = config.disabledValueIds ?? [];
  const disabledCount = values.filter((value) =>
    disabledIds.includes(value.id),
  ).length;
  const hasOverrides = disabledCount > 0;

  const [expanded, setExpanded] = useState(hasOverrides);

  if (!takesValueList(attribute) || attribute.values.length === 0) {
    return null;
  }

  const summary = hasOverrides
    ? `${values.length - disabledCount} of ${values.length} available · ${disabledCount} disabled`
    : `All ${values.length} values available`;

  const handleToggle = (valueId: string, enabled: boolean) => {
    if (sourceOwned) return;
    const next = new Set(disabledIds);
    if (enabled) {
      next.delete(valueId);
    } else {
      next.add(valueId);
    }
    onChange({
      disabledValueIds: next.size > 0 ? Array.from(next) : [],
      ...(valueId === config.defaultValueId ? { defaultValueId: null } : {}),
    });
  };

  return (
    <section className={styles['values']}>
      <div className={styles['values__toolbar']}>
        <div className={styles['values__intro']}>
          <p className={styles['values__flag']}>Open — behind ?allowed=on</p>
          <h4 className={styles['values__title']}>Allowed values</h4>
          <p className={styles['values__summary']}>{summary}</p>
        </div>
        <Button
          emphasis="Tertiary"
          size="Small"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? 'Done' : sourceOwned ? 'View' : 'Customize'}
        </Button>
      </div>

      {expanded && (
        <p className={styles['values__desc']}>
          Choose which options can be used on{' '}
          {config.resource.toLowerCase()}. Disabling an option blocks new
          assignments; existing ones stay in place.
        </p>
      )}

      {expanded && sourceOwned && (
        <div className={styles['values__notice']}>
          <SectionNotice
            type="Info"
            title="Externally owned options"
            description="Options sync from an external source and cannot be toggled here."
          />
        </div>
      )}

      {expanded && (
        <ConsolePropertyTable
          className={styles['values__table']}
          sections={[
            {
              columns: VALUE_COLUMNS,
              rows: values.map((value) => {
                const disabledForNew = disabledIds.includes(value.id);
                return (
                  <div
                    key={value.id}
                    className={[
                      styles['values__row'],
                      disabledForNew ? styles['values__row--disabled'] : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div
                      className={[
                        styles['values__cell'],
                        styles['values__cell--value'],
                      ].join(' ')}
                    >
                      {value.tier != null ? (
                        <RankedValueChip
                          label={value.label}
                          rank={(value.tier ?? 1) - 1}
                        />
                      ) : (
                        <span className={styles['values__label']}>
                          {value.label}
                        </span>
                      )}
                    </div>
                    <div
                      className={[
                        styles['values__cell'],
                        styles['values__cell--allow'],
                      ].join(' ')}
                    >
                      <Switch
                        size="Small"
                        checked={!disabledForNew}
                        disabled={sourceOwned}
                        aria-label={`${value.label} enabled for new assignments on ${config.resource}`}
                        onChange={(event) =>
                          handleToggle(value.id, event.target.checked)
                        }
                      >
                        {disabledForNew ? 'Off' : 'On'}
                      </Switch>
                      {disabledForNew &&
                        value.inUseCount != null &&
                        value.inUseCount > 0 && (
                          <span className={styles['values__meta']}>
                            {value.inUseCount} existing{' '}
                            {config.resource.toLowerCase()} still use this value
                          </span>
                        )}
                    </div>
                  </div>
                );
              }),
            },
          ]}
        />
      )}
    </section>
  );
}
