import { useState } from 'react';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Select from '@/components/ui/Select/Select';
import CapabilityGrants from '../AttributeManagementHub/_components/AccessEditor/CapabilityGrants';
import { type AccessCapability, type WhoCanSet, type WhoSets } from '../AttributeManagementHub/hubData';
import { QUICK_DEFAULTS, grantSummaryLabel, summarize } from './optionsData';
import styles from './OptionStatement.module.scss';

export interface OptionProps {
  value: WhoCanSet;
  onChange: (next: WhoCanSet) => void;
}

export default function OptionStatement({ value, onChange }: OptionProps) {
  const [editing, setEditing] = useState(false);
  const [showGrants, setShowGrants] = useState(
    summarize(value.grants).total > 0,
  );

  const summary = summarize(value.grants);
  const setDefault = (v: string) =>
    onChange({
      ...value,
      relationalDefault: v === '' ? null : (v as WhoSets),
    });
  const setGrants = (grants: AccessCapability) => onChange({ ...value, grants });

  if (!editing) {
    return (
      <div className={styles['statement']}>
        <p className={styles['statement__line']}>
          {value.relationalDefault ? (
            <>
              The <strong>{value.relationalDefault.toLowerCase()}</strong> sets
              this value.
            </>
          ) : (
            <>No one sets this value by default.</>
          )}
          {summary.total > 0 && (
            <span className={styles['statement__extra']}>
              {' '}
              Plus {grantSummaryLabel(value.grants)} can also set it.
            </span>
          )}
        </p>
        <Button
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PencilOutlineIcon />} />}
          onClick={() => setEditing(true)}
        >
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className={styles['statement__edit']}>
      <div className={styles['statement__row']}>
        <span className={styles['statement__label']}>Default setter</span>
        <Select
          className={styles['statement__select']}
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

      {showGrants ? (
        <CapabilityGrants
          capability={value.grants}
          addCaption="Also let others set it"
          onChange={setGrants}
        />
      ) : (
        <Button
          emphasis="Tertiary"
          size="Small"
          onClick={() => setShowGrants(true)}
        >
          Add specific people or rules
        </Button>
      )}

      <div className={styles['statement__done']}>
        <Button
          emphasis="Secondary"
          size="Small"
          onClick={() => setEditing(false)}
        >
          Done
        </Button>
      </div>
    </div>
  );
}
