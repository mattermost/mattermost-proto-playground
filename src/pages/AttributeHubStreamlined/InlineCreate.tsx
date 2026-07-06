import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import Select from '@/components/ui/Select/Select';
import Chip from '@/components/ui/Chip/Chip';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import type { AttrType } from '../AttributeManagementHub/hubData';
import styles from './streamlined.module.scss';

const SIMPLE_TYPES: AttrType[] = ['Select', 'Multiselect', 'Text'];

export interface InlineCreateDraft {
  name: string;
  type: AttrType;
  values: string[];
}

export interface InlineCreateProps {
  onCancel: () => void;
  onCreate: (draft: InlineCreateDraft) => void;
  existingNames: string[];
}

/**
 * Approach A create flow — lightweight inline add-a-row (§7.2 / P4-3). Type a
 * name, pick a simple type, add flat values as chips (type-and-Enter). No
 * guided wizard on this pole — the wizard was opt-in-for-complexity, and
 * Approach A has cut the complexity it existed for.
 */
export default function InlineCreate({
  onCancel,
  onCreate,
  existingNames,
}: InlineCreateProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AttrType>('Select');
  const [values, setValues] = useState<string[]>([]);
  const [valueDraft, setValueDraft] = useState('');

  const takesValues = type !== 'Text';
  const duplicate = existingNames.some(
    (n) => n.trim().toLowerCase() === name.trim().toLowerCase(),
  );
  const canCreate = name.trim().length > 0 && !duplicate;

  const commitValue = () => {
    const label = valueDraft.trim();
    if (!label) return;
    setValues((v) => [...v, label]);
    setValueDraft('');
  };

  return (
    <ConsolePanel title="New attribute">
      <div className={styles['create']}>
        <div className={styles['create__row']}>
          <span className={styles['create__key']}>Name</span>
          <TextInput
            className={styles['create__input']}
            size="Medium"
            placeholder="e.g. Compartment"
            value={name}
            invalid={duplicate}
            aria-label="New attribute name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {duplicate && (
          <p className={styles['create__error']}>
            An attribute named &ldquo;{name.trim()}&rdquo; already exists.
          </p>
        )}

        <div className={styles['create__row']}>
          <span className={styles['create__key']}>Type</span>
          <Select
            className={styles['create__input']}
            size="Medium"
            value={type}
            aria-label="New attribute type"
            onChange={(e) => setType(e.target.value as AttrType)}
          >
            {SIMPLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>

        {takesValues && (
          <div className={styles['create__row']}>
            <span className={styles['create__key']}>Values</span>
            <div className={styles['create__values']}>
              <div className={styles['create__chips']}>
                {values.map((v, i) => (
                  <Chip
                    key={`${v}-${i}`}
                    size="Medium"
                    onRemove={() =>
                      setValues((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    removeLabel={`Remove ${v}`}
                  >
                    {v}
                  </Chip>
                ))}
              </div>
              <div className={styles['create__value-add']}>
                <TextInput
                  size="Small"
                  placeholder="Type a value, press Enter"
                  value={valueDraft}
                  aria-label="Add a value"
                  onChange={(e) => setValueDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitValue();
                    if (e.key === 'Backspace' && valueDraft === '' && values.length) {
                      setValues((v) => v.slice(0, -1));
                    }
                  }}
                />
                <IconButton
                  size="Small"
                  aria-label="Add value"
                  disabled={valueDraft.trim().length === 0}
                  icon={<Icon size="16" glyph={<PlusIcon />} />}
                  onClick={commitValue}
                />
              </div>
            </div>
          </div>
        )}

        <div className={styles['create__actions']}>
          <Button
            emphasis="Primary"
            disabled={!canCreate}
            onClick={() =>
              onCreate({ name: name.trim(), type, values })
            }
          >
            Create attribute
          </Button>
          <Button
            emphasis="Tertiary"
            leadingIcon={<Icon size="16" glyph={<CloseIcon />} />}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </ConsolePanel>
  );
}
