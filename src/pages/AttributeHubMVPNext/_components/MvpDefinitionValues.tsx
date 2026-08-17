import { useState } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Icon from '@/components/ui/Icon/Icon';
import {
  isSourceOwned,
  type HubAttribute,
} from '@/pages/AttributeManagementHub/hubData';
import MvpManagedSourceBar from './MvpManagedSourceBar';
import { isExternallyLinked } from './mvpTerms';
import styles from './MvpDefinitionValues.module.scss';

export interface MvpDefinitionValuesProps {
  attribute: HubAttribute;
  onAddValue: (label: string) => void;
  onDeleteValue: (valueId: string) => void;
  onToggleDisabled: (valueId: string) => void;
}

/**
 * MVP Values editor — a wrapping chip row for Select / Multiselect / Ranked
 * (Ranked shows numbered chips). Text has no preset values. Externally-synced
 * attributes lock the value list. Synced ownership shows below the option chips.
 * No tree editor (Ranked-Hierarchical is cut), no reuse, no connect-source.
 */
export default function MvpDefinitionValues({
  attribute,
  onAddValue,
  onDeleteValue,
  onToggleDisabled,
}: MvpDefinitionValuesProps) {
  const [draft, setDraft] = useState('');
  const sourceOwned = isSourceOwned(attribute);
  const editable = !sourceOwned;
  const isRanked = attribute.type === 'Ranked';
  const managedBar = sourceOwned ? (
    <MvpManagedSourceBar attribute={attribute} layout="in-options" />
  ) : null;

  // Linked LDAP/SAML mappings own this row via MvpSourceSection.
  if (isExternallyLinked(attribute)) {
    return managedBar;
  }

  // Text — no enumerated values.
  if (attribute.type === 'Text') {
    return (
      <div className={styles['values']}>
        <p className={styles['values__none']}>
          Text attributes have no preset values. A value is typed in per
          resource.
        </p>
        {managedBar}
      </div>
    );
  }

  const commitDraft = () => {
    if (!draft.trim()) return;
    onAddValue(draft.trim());
    setDraft('');
  };

  return (
    <div className={styles['values']}>
      <div className={styles['values__chips-wrap']}>
        <div className={styles['values__chips']}>
          {attribute.values.map((v) => (
            <span
              key={v.id}
              className={[
                styles['values__chip'],
                v.disabled && styles['values__chip--disabled'],
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isRanked && v.tier != null && (
                <span className={styles['values__rank']}>{v.tier}</span>
              )}
              <span className={styles['values__chip-label']}>{v.label}</span>
              {editable && (
                <button
                  type="button"
                  className={styles['values__chip-x']}
                  aria-label={`Remove ${v.label}`}
                  onClick={() =>
                    (v.inUseCount ?? 0) > 0
                      ? onToggleDisabled(v.id)
                      : onDeleteValue(v.id)
                  }
                >
                  <Icon size="12" glyph={<CloseIcon />} />
                </button>
              )}
            </span>
          ))}
          {attribute.values.length === 0 && !editable && (
            <span className={styles['values__none']}>No values.</span>
          )}
          {editable && (
            <input
              className={styles['values__input']}
              placeholder={attribute.values.length === 0 ? 'Add a value…' : '+ Add'}
              value={draft}
              aria-label="Add a value"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  if (draft.trim()) {
                    e.preventDefault();
                    commitDraft();
                  }
                }
              }}
              onBlur={commitDraft}
            />
          )}
        </div>
      </div>
      {managedBar}
    </div>
  );
}
