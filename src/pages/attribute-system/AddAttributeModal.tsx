import { useMemo, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CloseIcon from '@mattermost/compass-icons/components/close';
import EarthIcon from '@mattermost/compass-icons/components/globe';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Modal from '@/components/ui/Modal/Modal';
import TextInput from '@/components/ui/TextInput/TextInput';
import Select from '@/components/ui/Select/Select';
import IconButton from '@/components/ui/IconButton/IconButton';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import { TYPE_ICON } from './attrIcons';
import { globalsNotAppliedTo, ownerBadgeText } from './data';
import type { AttrDef, AttrType, ResourceType } from './data';
import styles from './AttributeSystem.module.scss';

export interface NewAttributeInput {
  name: string;
  type: AttrType;
  values: string[];
}

type Step = 'choose' | 'existing' | 'create';

interface AddAttributeModalProps {
  resource: ResourceType;
  defs: AttrDef[];
  initialStep?: Step;
  onAddExisting: (defId: string) => void;
  onCreate: (input: NewAttributeInput) => void;
  onClose: () => void;
}

const TYPE_OPTIONS: AttrType[] = ['Select', 'Multiselect', 'Ranked', 'Text', 'Date'];

function hasValues(type: AttrType): boolean {
  return type === 'Select' || type === 'Multiselect' || type === 'Ranked';
}

function singular(resource: ResourceType): string {
  return resource.toLowerCase().replace(/s$/, '');
}

export default function AddAttributeModal({
  resource,
  defs,
  initialStep = 'choose',
  onAddExisting,
  onCreate,
  onClose,
}: AddAttributeModalProps) {
  const [step, setStep] = useState<Step>(initialStep);
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<AttrType>('Select');
  const [values, setValues] = useState<string[]>(['', '']);

  const noun = singular(resource);
  const candidates = useMemo(
    () => globalsNotAppliedTo(defs, resource),
    [defs, resource],
  );
  const filtered = candidates.filter((d) =>
    d.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const trimmedValues = values.map((v) => v.trim()).filter(Boolean);
  const canCreate =
    name.trim().length > 0 && (!hasValues(type) || trimmedValues.length > 0);

  const title =
    step === 'choose'
      ? `Add ${noun} attribute`
      : step === 'existing'
        ? 'Add an existing global attribute'
        : `Create a new ${noun} attribute`;

  const subtitle =
    step === 'existing'
      ? `Applied to ${noun}s with its values shared — kept identical so it stays comparable in access policies.`
      : step === 'create'
        ? `Lives only on ${noun}s until promoted to global.`
        : undefined;

  let footer: React.ReactNode = (
    <Button emphasis="Tertiary" onClick={onClose}>
      Cancel
    </Button>
  );
  if (step === 'create') {
    footer = (
      <>
        <Button emphasis="Tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          emphasis="Primary"
          disabled={!canCreate}
          onClick={() =>
            onCreate({ name: name.trim(), type, values: trimmedValues })
          }
        >
          Create attribute
        </Button>
      </>
    );
  }

  return (
    <div
      className={styles.modalOverlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Modal
        size="Medium"
        title={title}
        subtitle={subtitle}
        showBackButton={step !== 'choose'}
        onBack={() => setStep('choose')}
        onClose={onClose}
        footer={footer}
      >
        {step === 'choose' && (
          <div className={styles.choiceGrid}>
            <button
              type="button"
              className={styles.choiceCard}
              onClick={() => setStep('existing')}
            >
              <span className={styles.choiceCard__icon}>
                <Icon size="20" glyph={<EarthIcon />} />
              </span>
              <span className={styles.choiceCard__body}>
                <span className={styles.choiceCard__title}>
                  Add an existing global attribute
                </span>
                <span className={styles.choiceCard__desc}>
                  Reuse a system-wide attribute on {noun}s. Values stay shared
                  and source-controlled — required for cross-resource policies.
                </span>
                <span className={styles.choiceCard__meta}>
                  {candidates.length} available
                </span>
              </span>
              <Icon size="16" glyph={<ChevronRightIcon />} />
            </button>

            <button
              type="button"
              className={styles.choiceCard}
              onClick={() => setStep('create')}
            >
              <span className={styles.choiceCard__icon}>
                <Icon size="20" glyph={<PencilOutlineIcon />} />
              </span>
              <span className={styles.choiceCard__body}>
                <span className={styles.choiceCard__title}>
                  Create a new {noun} attribute
                </span>
                <span className={styles.choiceCard__desc}>
                  Define a brand-new attribute scoped to {noun}s. Promote it to
                  global later to reuse it elsewhere.
                </span>
              </span>
              <Icon size="16" glyph={<ChevronRightIcon />} />
            </button>
          </div>
        )}

        {step === 'existing' && (
          <div className={styles.pickList}>
            <SearchInput
              size="Medium"
              placeholder="Search global attributes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {filtered.length === 0 && (
              <p className={styles.copy}>
                No global attributes left to add to {noun}s.
              </p>
            )}
            {filtered.map((def) => (
              <div key={def.id} className={styles.pickRow}>
                <span className={styles.pickRow__main}>
                  <Icon size="16" glyph={TYPE_ICON[def.type]} />
                  <span className={styles.pickRow__name}>{def.name}</span>
                  <span className={styles.pickRow__values}>
                    {def.type === 'Text'
                      ? 'Free text'
                      : def.values.map((v) => v.label).join(' · ') || '—'}
                  </span>
                  {def.owner && (
                    <span className={styles.ownerBadge}>
                      <span className={styles.ownerBadge__icon}>
                        <Icon size="12" glyph={<LockOutlineIcon />} />
                      </span>
                      {ownerBadgeText(def.owner)}
                    </span>
                  )}
                </span>
                <Button
                  emphasis="Secondary"
                  size="X-Small"
                  onClick={() => onAddExisting(def.id)}
                >
                  Add to {noun}s
                </Button>
              </div>
            ))}
          </div>
        )}

        {step === 'create' && (
          <div className={styles.createForm}>
            <div className={styles.formField}>
              <span className={styles.formField__label}>Name</span>
              <TextInput
                size="Medium"
                value={name}
                placeholder={`e.g. ${resource === 'Channels' ? 'Mission' : 'Billet'}`}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className={styles.formField}>
              <span className={styles.formField__label}>Type</span>
              <Select
                size="Medium"
                value={type}
                onChange={(e) => setType(e.target.value as AttrType)}
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>

            {hasValues(type) && (
              <div className={styles.formField}>
                <span className={styles.formField__label}>
                  Values
                  {type === 'Ranked' && (
                    <span className={styles.formField__hint}>
                      {' '}
                      — ordered top (highest) to bottom
                    </span>
                  )}
                </span>
                <div className={styles.valueEditor}>
                  {values.map((val, i) => (
                    <div key={i} className={styles.valueEditor__row}>
                      {type === 'Ranked' && (
                        <span className={styles.valueEditor__rank}>
                          {values.length - i}
                        </span>
                      )}
                      <TextInput
                        size="Small"
                        value={val}
                        placeholder={`Value ${i + 1}`}
                        onChange={(e) =>
                          setValues((prev) =>
                            prev.map((v, j) => (j === i ? e.target.value : v)),
                          )
                        }
                      />
                      <IconButton
                        size="Small"
                        aria-label={`Remove value ${i + 1}`}
                        icon={<Icon size="16" glyph={<CloseIcon />} />}
                        onClick={() =>
                          setValues((prev) => prev.filter((_, j) => j !== i))
                        }
                      />
                    </div>
                  ))}
                  <Button
                    emphasis="Quaternary"
                    size="Small"
                    leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                    onClick={() => setValues((prev) => [...prev, ''])}
                  >
                    Add value
                  </Button>
                </div>
              </div>
            )}

            <div className={styles.formNote}>
              <Icon size="16" glyph={<LockOutlineIcon />} />
              <span>
                New {noun} attributes default to a <b>closed</b> vocabulary and{' '}
                <b>locked-after-set</b> mutability. Adjust these per-resource in
                the binding after creation.
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
