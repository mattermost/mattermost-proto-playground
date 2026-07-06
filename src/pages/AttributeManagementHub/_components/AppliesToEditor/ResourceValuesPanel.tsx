import { useState } from 'react';
import Switch from '@/components/ui/Switch/Switch';
import Button from '@/components/ui/Button/Button';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import {
  isPolicyLocked,
  isSourceOwned,
  listValuesForOverlay,
  takesValueList,
  visibleValues,
  type HubAttribute,
  type ResourceConfig,
} from '../../hubData';
import styles from './ResourceValuesPanel.module.scss';

export interface ResourceValuesPanelProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
}

export default function ResourceValuesPanel({
  attribute,
  config,
  onChange,
}: ResourceValuesPanelProps) {
  if (!takesValueList(attribute) || attribute.values.length === 0) {
    return null;
  }

  const locked = isPolicyLocked(attribute);
  const sourceOwned = isSourceOwned(attribute);
  const togglesLocked = locked || sourceOwned;
  const values = visibleValues(attribute, listValuesForOverlay(attribute));
  const disabledIds = config.disabledValueIds ?? [];
  const disabledCount = values.filter((v) => disabledIds.includes(v.id)).length;
  const hasOverrides = disabledCount > 0;

  const [expanded, setExpanded] = useState(hasOverrides);

  const summary = hasOverrides
    ? `${values.length - disabledCount} of ${values.length} available · ${disabledCount} disabled for new assignments`
    : `All ${values.length} values available for new assignments`;

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
    <div className={styles['panel']}>
      <div className={styles['head']}>
        <div className={styles['head__main']}>
          <h3 className={styles['head__title']}>
            Allowed values on {config.resource}
          </h3>
          <p className={styles['head__summary']}>{summary}</p>
        </div>
        <Button
          emphasis="Tertiary"
          size="Small"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? 'Done' : togglesLocked ? 'View values' : 'Customize'}
        </Button>
      </div>

      {!expanded && <div className={styles['spacer']} />}

      {expanded && (
        <p className={styles['head__desc']}>
          Customize which catalog values can be assigned on{' '}
          {config.resource.toLowerCase()}. Disabling stops new assignments while
          existing ones stay in place.
        </p>
      )}

      {expanded && attribute.valuesLink && (
        <div className={styles['notice']}>
          <SectionNotice
            type="Info"
            title="Mirrors shared catalog"
            description="Base values come from the linked attribute's global catalog. Disable values here without changing the shared scheme."
          />
        </div>
      )}

      {expanded && sourceOwned && (
        <div className={styles['notice']}>
          <SectionNotice
            type="Info"
            title="Externally owned catalog"
            description="Base values sync from an external source and cannot be toggled here."
          />
        </div>
      )}

      {expanded && (
      <div className={styles['list']}>
        {values.map((value) => {
          const disabledForNew = disabledIds.includes(value.id);
          return (
            <div
              key={value.id}
              className={[
                styles['row'],
                disabledForNew ? styles['row--disabled'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles['row__main']}>
                <span className={styles['row__label']}>
                  {value.tier != null ? (
                    <RankedValueChip
                      label={value.label}
                      rank={(value.tier ?? 1) - 1}
                    />
                  ) : (
                    value.label
                  )}
                </span>
                <span className={styles['row__meta']}>
                  {disabledForNew ? (
                    <>
                      Disabled for new assignments
                      {value.inUseCount != null && value.inUseCount > 0
                        ? ` · ${value.inUseCount} existing ${config.resource.toLowerCase()} still use this value`
                        : ''}
                    </>
                  ) : (
                    'Available for new assignments'
                  )}
                </span>
              </div>
              <div className={styles['row__actions']}>
                <Switch
                  size="Small"
                  checked={!disabledForNew}
                  disabled={togglesLocked}
                  aria-label={`${value.label} enabled for new assignments on ${config.resource}`}
                  onChange={(e) => handleToggle(value.id, e.target.checked)}
                />
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
