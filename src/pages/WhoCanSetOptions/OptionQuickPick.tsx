import { useState } from 'react';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import Icon from '@/components/ui/Icon/Icon';
import CapabilityGrants from '../AttributeManagementHub/_components/AccessEditor/CapabilityGrants';
import { type AccessCapability, type WhoSets } from '../AttributeManagementHub/hubData';
import { QUICK_DEFAULTS, grantSummaryLabel, summarize } from './optionsData';
import type { OptionProps } from './OptionStatement';
import styles from './OptionQuickPick.module.scss';

export default function OptionQuickPick({ value, onChange }: OptionProps) {
  const [open, setOpen] = useState(summarize(value.grants).total > 0);
  const summary = summarize(value.grants);

  const setDefault = (d: WhoSets) =>
    onChange({ ...value, relationalDefault: d });
  const setGrants = (grants: AccessCapability) => onChange({ ...value, grants });

  return (
    <div className={styles['quick']}>
      <div className={styles['quick__pills']} role="radiogroup" aria-label="Default setter">
        {QUICK_DEFAULTS.map((d) => {
          const active = value.relationalDefault === d;
          return (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={active}
              className={[
                styles['quick__pill'],
                active ? styles['quick__pill--active'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setDefault(d)}
            >
              {d}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={styles['quick__advanced']}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon
          size="16"
          glyph={open ? <ChevronDownIcon /> : <ChevronRightIcon />}
        />
        <span>Advanced — specific roles, users, rules</span>
        {!open && summary.total > 0 && (
          <span className={styles['quick__advanced-summary']}>
            {grantSummaryLabel(value.grants)}
          </span>
        )}
      </button>

      {open && (
        <div className={styles['quick__panel']}>
          <CapabilityGrants
            capability={value.grants}
            addCaption="Add access for"
            onChange={setGrants}
          />
        </div>
      )}
    </div>
  );
}
