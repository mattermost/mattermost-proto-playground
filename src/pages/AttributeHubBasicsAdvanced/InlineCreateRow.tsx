import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CloseIcon from '@mattermost/compass-icons/components/close';
import WizardIcon from '@mattermost/compass-icons/components/creation-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import Select from '@/components/ui/Select/Select';
import Chip from '@/components/ui/Chip/Chip';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import { shouldSuggestGuided } from './basicsData';
import { type AttrType } from '../AttributeManagementHub/hubData';
import styles from './InlineCreateRow.module.scss';

const TYPES: AttrType[] = [
  'Select',
  'Multiselect',
  'Ranked',
  'Ranked-hierarchical',
  'Text',
];

export interface InlineCreateDraft {
  name: string;
  type: AttrType;
  values: string[];
}

export interface InlineCreateRowProps {
  /** Names already in use → duplicate block. */
  existingNames: string[];
  onCreate: (draft: InlineCreateDraft) => void;
  onOpenGuided: () => void;
}

/**
 * P4-3 — inline add-a-row is the DEFAULT create affordance (name → type → done;
 * values as type-and-enter chips). The guided wizard is opt-in
 * ("Set up with guided steps") and auto-suggested for hierarchical or shared-scale.
 */
export default function InlineCreateRow({
  existingNames,
  onCreate,
  onOpenGuided,
}: InlineCreateRowProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AttrType>('Select');
  const [values, setValues] = useState<string[]>([]);
  const [valueDraft, setValueDraft] = useState('');

  const takesValues = type !== 'Text';
  const duplicate = existingNames.some(
    (n) => n.trim().toLowerCase() === name.trim().toLowerCase(),
  );
  const suggestGuided = shouldSuggestGuided(type, false);
  const canCreate = name.trim().length > 0 && !duplicate;

  const reset = () => {
    setName('');
    setType('Select');
    setValues([]);
    setValueDraft('');
    setOpen(false);
  };

  const commitValue = () => {
    const v = valueDraft.trim();
    if (v && !values.includes(v)) {
      setValues((prev) => [...prev, v]);
      setValueDraft('');
    }
  };

  const create = () => {
    if (!canCreate) return;
    onCreate({ name: name.trim(), type, values });
    reset();
  };

  if (!open) {
    return (
      <div className={styles['create']}>
        <Button
          emphasis="Primary"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          onClick={() => setOpen(true)}
        >
          New attribute
        </Button>
      </div>
    );
  }

  return (
    <div className={styles['create']}>
      <div className={styles['create__row']}>
        <div className={styles['create__field']}>
          <TextInput
            size="Medium"
            placeholder="Attribute name"
            value={name}
            aria-label="Attribute name"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !takesValues) create();
            }}
          />
        </div>
        <Select
          className={styles['create__type']}
          size="Medium"
          value={type}
          aria-label="Attribute type"
          onChange={(e) => setType(e.target.value as AttrType)}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Button emphasis="Secondary" disabled={!canCreate} onClick={create}>
          Add
        </Button>
        <IconButton
          aria-label="Cancel"
          icon={<Icon size="20" glyph={<CloseIcon />} />}
          onClick={reset}
        />
      </div>

      {duplicate && (
        <p className={styles['create__error']}>
          An attribute named “{name.trim()}” already exists.
        </p>
      )}

      {takesValues && !suggestGuided && (
        <div className={styles['create__values']}>
          <div className={styles['create__chips']}>
            {values.map((v) => (
              <Chip
                key={v}
                size="Small"
                onRemove={() => setValues((prev) => prev.filter((x) => x !== v))}
              >
                {v}
              </Chip>
            ))}
          </div>
          <TextInput
            size="Small"
            placeholder="Type a value and press Enter"
            value={valueDraft}
            aria-label="Add a value"
            onChange={(e) => setValueDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                commitValue();
              }
            }}
          />
        </div>
      )}

      {suggestGuided && (
        <SectionNotice
          type="Info"
          title="This type is easier with guided steps"
          description={
            type === 'Ranked-hierarchical'
              ? 'Ranked-hierarchical attributes have tiers and nested markings — the guided setup walks through them.'
              : 'Sharing a value scale from another attribute is quicker in the guided setup.'
          }
          primaryButtonLabel="Set up with guided steps"
          onPrimaryAction={onOpenGuided}
        />
      )}

      <button
        type="button"
        className={styles['create__guided-link']}
        onClick={onOpenGuided}
      >
        <Icon size="16" glyph={<WizardIcon />} />
        Set up with guided steps instead
      </button>
    </div>
  );
}
