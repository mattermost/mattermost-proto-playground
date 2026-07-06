import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Select from '@/components/ui/Select/Select';
import CapabilityGrants from '../AttributeManagementHub/_components/AccessEditor/CapabilityGrants';
import { type AccessCapability, type WhoSets } from '../AttributeManagementHub/hubData';
import { QUICK_DEFAULTS, summarize } from './optionsData';
import type { OptionProps } from './OptionStatement';
import styles from './OptionDropdownCustom.module.scss';

export default function OptionDropdownCustom({ value, onChange }: OptionProps) {
  const [escalated, setEscalated] = useState(summarize(value.grants).total > 0);

  const setDefault = (v: string) =>
    onChange({
      ...value,
      relationalDefault: v === '' ? null : (v as WhoSets),
    });
  const setGrants = (grants: AccessCapability) => onChange({ ...value, grants });

  return (
    <div className={styles['dd']}>
      <div className={styles['dd__row']}>
        <span className={styles['dd__label']}>Default setter</span>
        <Select
          className={styles['dd__select']}
          size="Small"
          value={value.relationalDefault ?? ''}
          aria-label="Default setter"
          onChange={(e) => setDefault(e.target.value)}
        >
          <option value="">No one by default</option>
          {QUICK_DEFAULTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </div>

      {escalated ? (
        <div className={styles['dd__panel']}>
          <CapabilityGrants
            capability={value.grants}
            addCaption="Grant access to"
            onChange={setGrants}
          />
        </div>
      ) : (
        <Button
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          onClick={() => setEscalated(true)}
        >
          Add specific access
        </Button>
      )}
    </div>
  );
}
