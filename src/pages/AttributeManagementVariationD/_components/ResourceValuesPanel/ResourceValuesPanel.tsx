import Switch from '@/components/ui/Switch/Switch';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import DisabledControl from '../../../AttributeManagementV2/_components/DisabledControl/DisabledControl';
import {
  type AttributeD,
  type ResourceBindingD,
  canCustomizeResourceValues,
  canToggleBaseValues,
  effectiveValuesForBinding,
  isMirroring,
} from '../../dData';
import styles from './ResourceValuesPanel.module.scss';

export interface ResourceValuesPanelProps {
  attribute: AttributeD;
  binding: ResourceBindingD;
  onChange?: (next: ResourceBindingD) => void;
}

export default function ResourceValuesPanel({
  attribute,
  binding,
  onChange,
}: ResourceValuesPanelProps) {
  if (!canCustomizeResourceValues(attribute)) {
    return null;
  }

  const effective = effectiveValuesForBinding(attribute, binding);
  const togglesLocked = !canToggleBaseValues(attribute);
  const mirroring = isMirroring(attribute);

  const handleToggle = (valueId: string, enabled: boolean) => {
    if (togglesLocked) return;
    const overlay = binding.valueOverlay ?? {};
    const current = new Set(overlay.disabledForNewIds ?? []);
    if (enabled) {
      current.delete(valueId);
    } else {
      current.add(valueId);
    }
    onChange?.({
      ...binding,
      valueOverlay: {
        ...overlay,
        disabledForNewIds: current.size > 0 ? Array.from(current) : undefined,
      },
    });
  };

  return (
    <div className={styles['panel']}>
      <div className={styles['head']}>
        <h3 className={styles['head__title']}>Allowed values on {binding.resource}</h3>
        <p className={styles['head__desc']}>
          Customize which catalog values can be assigned on{' '}
          {binding.resource.toLowerCase()}. Values are never deleted — disabling
          stops new assignments while existing ones stay in place.
        </p>
      </div>

      {mirroring && (
        <div className={styles['notice']}>
          <SectionNotice
            type="Info"
            title="Mirrors shared catalog"
            description="Base values come from the linked attribute's global catalog. Disable values here without changing the shared scheme."
          />
        </div>
      )}

      {togglesLocked && (
        <div className={styles['notice']}>
          <SectionNotice
            type="Info"
            title="Externally owned catalog"
            description="Base values sync from an external source and cannot be toggled here."
          />
        </div>
      )}

      <div className={styles['list']}>
        {effective.map((value) => {
          const rowClass = [
            styles['row'],
            value.disabledForNew ? styles['row--disabled'] : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div key={value.id} className={rowClass}>
              <div className={styles['row__main']}>
                <span className={styles['row__label']}>
                  {attribute.type === 'Ranked' ? (
                    <RankedValueChip label={value.label} rank={value.rank ?? 0} />
                  ) : (
                    value.label
                  )}
                </span>
                <span className={styles['row__meta']}>
                  {value.disabledForNew ? (
                    <>
                      Disabled for new assignments
                      {value.inUseCount != null && value.inUseCount > 0
                        ? ` · ${value.inUseCount} existing ${binding.resource.toLowerCase()} still use this value`
                        : ''}
                    </>
                  ) : (
                    'Available for new assignments'
                  )}
                </span>
              </div>
              <div className={styles['row__actions']}>
                {togglesLocked ? (
                  <DisabledControl reason="Synced from external source">
                    <Switch checked disabled aria-label={`${value.label} enabled`} />
                  </DisabledControl>
                ) : (
                  <Switch
                    checked={!value.disabledForNew}
                    onChange={(e) => handleToggle(value.id, e.target.checked)}
                    aria-label={`${value.label} enabled for new assignments on ${binding.resource}`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
