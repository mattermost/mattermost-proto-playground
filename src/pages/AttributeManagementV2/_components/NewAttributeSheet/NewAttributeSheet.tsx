import { useMemo, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import TextInput from '@/components/ui/TextInput/TextInput';
import Select from '@/components/ui/Select/Select';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import SideSheet from '../SideSheet/SideSheet';
import HelpPopover from '../HelpPopover/HelpPopover';
import ReuseValuesPicker from '../ReuseValuesPicker/ReuseValuesPicker';
import {
  type Attribute,
  type AttributeType,
  type Resource,
  ALL_RESOURCES,
  HELP_COPY,
} from '../../data';
import styles from './NewAttributeSheet.module.scss';

export interface NewAttributeDraft {
  name: string;
  type: AttributeType;
  values: string[];
  reuseFromId: string | null;
  appliesTo: Resource[];
}

export interface NewAttributeSheetProps {
  open: boolean;
  /** Existing attributes — used for duplicate-name block + reuse picker. */
  attributes: Attribute[];
  onClose: () => void;
  onCreate: (draft: NewAttributeDraft) => void;
}

const TYPES: AttributeType[] = [
  'Text',
  'Select',
  'Multiselect',
  'Date',
  'Ranked',
  'Hierarchical',
];

/** Create flow (§9): Name → Type → Values (or Reuse) → Applies to → Create. */
export default function NewAttributeSheet({
  open,
  attributes,
  onClose,
  onCreate,
}: NewAttributeSheetProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AttributeType>('Select');
  const [values, setValues] = useState<string[]>([]);
  const [valueInput, setValueInput] = useState('');
  const [reuseFromId, setReuseFromId] = useState<string | null>(null);
  const [appliesTo, setAppliesTo] = useState<Resource[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const ranked = type === 'Ranked' || type === 'Hierarchical';
  const takesValues =
    type === 'Select' ||
    type === 'Multiselect' ||
    type === 'Ranked' ||
    type === 'Hierarchical';

  // Duplicate-name hard block (§8).
  const duplicate = useMemo(() => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return null;
    return attributes.find((a) => a.name.toLowerCase() === trimmed) ?? null;
  }, [name, attributes]);

  const reuseSibling = reuseFromId
    ? attributes.find((a) => a.id === reuseFromId)
    : null;

  const canCreate =
    name.trim().length > 0 &&
    !duplicate &&
    appliesTo.length > 0 &&
    (!takesValues || values.length > 0 || reuseFromId != null);

  const addValue = () => {
    const v = valueInput.trim();
    if (!v) return;
    setValues((prev) => [...prev, v]);
    setValueInput('');
  };

  const toggleResource = (r: Resource) =>
    setAppliesTo((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );

  const reset = () => {
    setName('');
    setType('Select');
    setValues([]);
    setValueInput('');
    setReuseFromId(null);
    setAppliesTo([]);
  };

  return (
    <SideSheet
      open={open}
      title="New attribute"
      onClose={() => {
        reset();
        onClose();
      }}
      footer={
        <>
          <Button
            emphasis="Tertiary"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            emphasis="Primary"
            disabled={!canCreate}
            onClick={() => {
              onCreate({ name: name.trim(), type, values, reuseFromId, appliesTo });
              reset();
            }}
          >
            Create
          </Button>
        </>
      }
    >
      <div className={styles['form']}>
        {/* Name */}
        <div className={styles['form__field']}>
          <label className={styles['form__label']} htmlFor="new-attr-name">
            Name
          </label>
          <TextInput
            id="new-attr-name"
            value={name}
            placeholder="e.g. Mission area"
            invalid={!!duplicate}
            onChange={(e) => setName(e.target.value)}
          />
          {duplicate && (
            <p className={styles['form__error']}>
              An attribute named “{duplicate.name}” already exists. Link to it
              instead, or choose a different name.
            </p>
          )}
        </div>

        {/* Type */}
        <div className={styles['form__field']}>
          <div className={styles['form__label-row']}>
            <label className={styles['form__label']} htmlFor="new-attr-type">
              Type
            </label>
            {ranked && (
              <HelpPopover
                triggerLabel="How ranking works"
                title="Ranked values"
                body={HELP_COPY.rankedType}
              />
            )}
          </div>
          <Select
            id="new-attr-type"
            value={type}
            onChange={(e) => setType(e.target.value as AttributeType)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>

        {/* Values */}
        {takesValues && (
          <div className={styles['form__field']}>
            <span className={styles['form__label']}>Values</span>
            {reuseSibling ? (
              <div className={styles['form__reused']}>
                <span>
                  Mirroring <strong>{reuseSibling.name}</strong>. Values and
                  order stay in sync with it.
                </span>
                <button
                  type="button"
                  className={styles['form__reused-clear']}
                  onClick={() => setReuseFromId(null)}
                >
                  Enter values manually instead
                </button>
              </div>
            ) : (
              <>
                <div className={styles['form__value-add']}>
                  <TextInput
                    value={valueInput}
                    placeholder="Add a value"
                    aria-label="Value label"
                    onChange={(e) => setValueInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addValue();
                      }
                    }}
                  />
                  <Button
                    emphasis="Secondary"
                    size="Small"
                    leadingIcon={<Icon glyph={<PlusIcon />} size="16" />}
                    onClick={addValue}
                    disabled={valueInput.trim().length === 0}
                  >
                    Add
                  </Button>
                </div>
                {values.length > 0 && (
                  <div className={styles['form__chips']}>
                    {values.map((v, i) => (
                      <RankedValueChip
                        key={`${v}-${i}`}
                        label={v}
                        rank={ranked ? i + 1 : undefined}
                        onRemove={() =>
                          setValues((prev) => prev.filter((_, j) => j !== i))
                        }
                      />
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className={styles['form__reuse-link']}
                  onClick={() => setPickerOpen(true)}
                >
                  Reuse values from another attribute…
                </button>
              </>
            )}
          </div>
        )}

        {/* Applies to */}
        <div className={styles['form__field']}>
          <span className={styles['form__label']}>Applies to</span>
          <div className={styles['form__resources']}>
            {ALL_RESOURCES.map((r) => (
              <Checkbox
                key={r}
                checked={appliesTo.includes(r)}
                onChange={() => toggleResource(r)}
              >
                {r}
              </Checkbox>
            ))}
          </div>
        </div>
      </div>

      <ReuseValuesPicker
        open={pickerOpen}
        currentId="__new__"
        attributes={attributes}
        onClose={() => setPickerOpen(false)}
        onPick={(id) => {
          setReuseFromId(id);
          setPickerOpen(false);
        }}
      />
    </SideSheet>
  );
}
