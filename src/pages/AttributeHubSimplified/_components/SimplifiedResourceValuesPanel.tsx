import { useState } from 'react';
import Switch from '@/components/ui/Switch/Switch';
import Button from '@/components/ui/Button/Button';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import ConsolePropertyTable from '@/components/ui/ConsolePropertyTable/ConsolePropertyTable';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import {
  isPolicyLocked,
  isSourceOwned,
  listValuesForOverlay,
  takesValueList,
  visibleValues,
  type HubAttribute,
  type ResourceConfig,
} from '@/pages/AttributeManagementHub/hubData';
import styles from './SimplifiedResourceValuesPanel.module.scss';

export interface SimplifiedResourceValuesPanelProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
}

const VALUE_COLUMNS = [
  { key: 'value', label: 'Value', width: 240 },
  { key: 'status', label: 'Assignment status' },
  { key: 'allow', label: 'Allow new', width: 120 },
];

export default function SimplifiedResourceValuesPanel({
  attribute,
  config,
  onChange,
}: SimplifiedResourceValuesPanelProps) {
  if (!takesValueList(attribute) || attribute.values.length === 0) {
    return null;
  }

  const locked = isPolicyLocked(attribute);
  const sourceOwned = isSourceOwned(attribute);
  const togglesLocked = locked || sourceOwned;
  const values = visibleValues(attribute, listValuesForOverlay(attribute));
  const disabledIds = config.disabledValueIds ?? [];
  const disabledCount = values.filter((value) => disabledIds.includes(value.id)).length;
  const hasOverrides = disabledCount > 0;

  const [expanded, setExpanded] = useState(hasOverrides);

  const summary = hasOverrides
    ? `${values.length - disabledCount} of ${values.length} available · ${disabledCount} disabled`
    : `All ${values.length} values available`;

  const handleToggle = (valueId: string, enabled: boolean) => {
    if (togglesLocked) return;
    const next = new Set(disabledIds);
    if (enabled) {
      next.delete(valueId);
    } else {
      next.add(valueId);
    }
    onChange({
      disabledValueIds: next.size > 0 ? Array.from(next) : [],
    });
  };

  return (
    <section className={styles['values']}>
      <div className={styles['values__toolbar']}>
        <div className={styles['values__intro']}>
          <h4 className={styles['values__title']}>Allowed values</h4>
          <p className={styles['values__summary']}>{summary}</p>
        </div>
        <Button
          emphasis="Tertiary"
          size="Small"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? 'Done' : togglesLocked ? 'View' : 'Customize'}
        </Button>
      </div>

      {expanded && (
        <p className={styles['values__desc']}>
          Choose which catalog values can be assigned on{' '}
          {config.resource.toLowerCase()}. Disabling a value blocks new assignments;
          existing ones stay in place.
        </p>
      )}

      {expanded && attribute.valuesLink && (
        <div className={styles['values__notice']}>
          <SectionNotice
            type="Info"
            title="Mirrors shared catalog"
            description="Disabling here does not change the linked attribute's global catalog."
          />
        </div>
      )}

      {expanded && sourceOwned && (
        <div className={styles['values__notice']}>
          <SectionNotice
            type="Info"
            title="Externally owned catalog"
            description="Values sync from an external source and cannot be toggled here."
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
                    <div className={[styles['values__cell'], styles['values__cell--value']].join(' ')}>
                      {value.tier != null ? (
                        <RankedValueChip
                          label={value.label}
                          rank={(value.tier ?? 1) - 1}
                        />
                      ) : (
                        <span className={styles['values__label']}>{value.label}</span>
                      )}
                    </div>
                    <div className={styles['values__cell']}>
                      <span className={styles['values__status']}>
                        {disabledForNew ? 'Disabled for new assignments' : 'Available'}
                      </span>
                      {disabledForNew &&
                        value.inUseCount != null &&
                        value.inUseCount > 0 && (
                          <span className={styles['values__meta']}>
                            {value.inUseCount} existing{' '}
                            {config.resource.toLowerCase()} still use this value
                          </span>
                        )}
                    </div>
                    <div
                      className={[
                        styles['values__cell'],
                        styles['values__cell--action'],
                      ].join(' ')}
                    >
                      <Switch
                        size="Small"
                        checked={!disabledForNew}
                        disabled={togglesLocked}
                        aria-label={`${value.label} enabled for new assignments on ${config.resource}`}
                        onChange={(event) =>
                          handleToggle(value.id, event.target.checked)
                        }
                      >
                        {disabledForNew ? 'Off' : 'On'}
                      </Switch>
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
