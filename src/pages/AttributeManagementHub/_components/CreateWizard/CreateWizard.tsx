import { useState } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Icon from '@/components/ui/Icon/Icon';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import TextInput from '@/components/ui/TextInput/TextInput';
import TextArea from '@/components/ui/TextArea/TextArea';
import Select from '@/components/ui/Select/Select';
import Radio from '@/components/ui/Radio/Radio';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Chip from '@/components/ui/Chip/Chip';
import IconButton from '@/components/ui/IconButton/IconButton';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import {
  ALL_RESOURCES,
  valueCountLabel,
  type AttrType,
  type HubAttribute,
  type ResourceKind,
} from '../../hubData';
import styles from './CreateWizard.module.scss';

export interface WizardDraft {
  name: string;
  type: AttrType;
  description: string;
  values: string[];
  reuseFromId: string | null;
  appliesTo: ResourceKind[];
}

export interface CreateWizardProps {
  attributes: HubAttribute[];
  onClose: () => void;
  onCreate: (draft: WizardDraft) => void;
  /** Names already in use → duplicate hard-block. */
  onDuplicate: (name: string) => void;
}

const STEPS = ['Name & type', 'Values', 'Applies to', 'Review'];

const TYPES: AttrType[] = [
  'Select',
  'Multiselect',
  'Ranked',
  'Ranked-hierarchical',
  'Text',
];

export default function CreateWizard({
  attributes,
  onClose,
  onCreate,
  onDuplicate,
}: CreateWizardProps) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<WizardDraft>({
    name: '',
    type: 'Select',
    description: '',
    values: [],
    reuseFromId: null,
    appliesTo: [],
  });
  const [valueDraft, setValueDraft] = useState('');
  const [reuseMode, setReuseMode] = useState<'define' | 'reuse'>('define');

  const patch = (p: Partial<WizardDraft>) => setDraft((d) => ({ ...d, ...p }));

  const takesValues = draft.type !== 'Text';
  const reuseCandidates = attributes.filter(
    (a) => a.type !== 'Text' && a.values.length > 0 && !a.valuesLink,
  );

  const canNext = () => {
    if (step === 0) return draft.name.trim().length > 0;
    if (step === 1) {
      if (!takesValues) return true;
      if (reuseMode === 'reuse') return !!draft.reuseFromId;
      return draft.values.length > 0;
    }
    if (step === 2) return draft.appliesTo.length > 0;
    return true;
  };

  const attemptCreate = () => {
    const dup = attributes.some(
      (a) => a.name.trim().toLowerCase() === draft.name.trim().toLowerCase(),
    );
    if (dup) {
      onDuplicate(draft.name.trim());
      return;
    }
    onCreate(draft);
  };

  const reuseName = draft.reuseFromId
    ? attributes.find((a) => a.id === draft.reuseFromId)?.name
    : undefined;

  return (
    <div className={styles['wizard']} role="presentation">
      <button
        type="button"
        className={styles['wizard__scrim']}
        aria-label="Close"
        onClick={onClose}
      />
      <div className={styles['wizard__dialog']}>
        <Modal
          size="Medium"
          title="New attribute"
          subtitle={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`}
          onClose={onClose}
          footer={
            <div className={styles['wizard__footer']}>
              <Button
                emphasis="Tertiary"
                onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}
              >
                {step === 0 ? 'Cancel' : 'Back'}
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  emphasis="Primary"
                  disabled={!canNext()}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button emphasis="Primary" onClick={attemptCreate}>
                  Create attribute
                </Button>
              )}
            </div>
          }
        >
          <div className={styles['wizard__steps']}>
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={[
                  styles['wizard__step'],
                  i === step && styles['wizard__step--active'],
                  i < step && styles['wizard__step--done'],
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className={styles['wizard__step-dot']}>
                  {i < step ? <Icon size="12" glyph={<CheckIcon />} /> : i + 1}
                </span>
                <span className={styles['wizard__step-label']}>{label}</span>
              </div>
            ))}
          </div>

          <div className={styles['wizard__body']}>
            {step === 0 && (
              <div className={styles['wizard__form']}>
                <TextInput
                  label="Name"
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                />
                <div className={styles['wizard__field']}>
                  <span className={styles['wizard__label']}>Type</span>
                  <Select
                    value={draft.type}
                    onChange={(e) =>
                      patch({ type: e.target.value as AttrType })
                    }
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </div>
                <TextArea
                  label="Description"
                  value={draft.description}
                  onChange={(e) => patch({ description: e.target.value })}
                />
              </div>
            )}

            {step === 1 && (
              <div className={styles['wizard__form']}>
                {!takesValues ? (
                  <SectionNotice
                    type="Info"
                    title="Free-text attribute"
                    description="Text attributes have no value list — values are entered per resource."
                  />
                ) : (
                  <>
                    <div className={styles['wizard__mode']}>
                      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                      <label className={styles['wizard__radio']}>
                        <Radio
                          checked={reuseMode === 'define'}
                          onChange={() => {
                            setReuseMode('define');
                            patch({ reuseFromId: null });
                          }}
                        />
                        <span>Define values</span>
                      </label>
                      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                      <label className={styles['wizard__radio']}>
                        <Radio
                          checked={reuseMode === 'reuse'}
                          onChange={() => setReuseMode('reuse')}
                        />
                        <span>Reuse another attribute&rsquo;s scale</span>
                      </label>
                    </div>

                    {reuseMode === 'define' ? (
                      <>
                        <div className={styles['wizard__add']}>
                          <TextInput
                            placeholder="Add a value"
                            value={valueDraft}
                            onChange={(e) => setValueDraft(e.target.value)}
                          />
                          <Button
                            emphasis="Secondary"
                            leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                            disabled={valueDraft.trim().length === 0}
                            onClick={() => {
                              patch({ values: [...draft.values, valueDraft.trim()] });
                              setValueDraft('');
                            }}
                          >
                            Add
                          </Button>
                        </div>
                        <div className={styles['wizard__value-list']}>
                          {draft.values.map((v, i) => (
                            <div key={`${v}-${i}`} className={styles['wizard__value-row']}>
                              <span>{v}</span>
                              <IconButton
                                size="X-Small"
                                aria-label={`Remove ${v}`}
                                icon={
                                  <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                                }
                                onClick={() =>
                                  patch({
                                    values: draft.values.filter(
                                      (_, j) => j !== i,
                                    ),
                                  })
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className={styles['wizard__reuse-list']}>
                        {reuseCandidates.map((a) => (
                          // eslint-disable-next-line jsx-a11y/label-has-associated-control
                          <label key={a.id} className={styles['wizard__reuse-option']}>
                            <Radio
                              checked={draft.reuseFromId === a.id}
                              onChange={() => patch({ reuseFromId: a.id })}
                            />
                            <div className={styles['wizard__reuse-body']}>
                              <span className={styles['wizard__reuse-name']}>
                                {a.name}
                              </span>
                              <span className={styles['wizard__reuse-meta']}>
                                {a.type} · {valueCountLabel(a)}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {step === 2 && (
              <div className={styles['wizard__form']}>
                <span className={styles['wizard__label']}>
                  Which resources can carry this attribute?
                </span>
                <div className={styles['wizard__checks']}>
                  {ALL_RESOURCES.map((r) => (
                    <label key={r} className={styles['wizard__check']}>
                      <Checkbox
                        checked={draft.appliesTo.includes(r)}
                        onChange={() =>
                          patch({
                            appliesTo: draft.appliesTo.includes(r)
                              ? draft.appliesTo.filter((x) => x !== r)
                              : [...draft.appliesTo, r],
                          })
                        }
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
                {draft.appliesTo.length > 0 && (
                  <SectionNotice
                    type="Info"
                    title="Per-resource settings"
                    description="After creating, open the attribute to set Required, where it shows, inheritance, and disabled values on each resource."
                  />
                )}
              </div>
            )}

            {step === 3 && (
              <div className={styles['wizard__review']}>
                <div className={styles['wizard__review-row']}>
                  <span className={styles['wizard__review-key']}>Name</span>
                  <span className={styles['wizard__review-val']}>{draft.name}</span>
                </div>
                <div className={styles['wizard__review-row']}>
                  <span className={styles['wizard__review-key']}>Type</span>
                  <span className={styles['wizard__review-val']}>{draft.type}</span>
                </div>
                <div className={styles['wizard__review-row']}>
                  <span className={styles['wizard__review-key']}>Values</span>
                  <span className={styles['wizard__review-val']}>
                    {!takesValues
                      ? 'Free text'
                      : reuseMode === 'reuse'
                        ? `Linked to ${reuseName}`
                        : `${draft.values.length} defined`}
                  </span>
                </div>
                <div className={styles['wizard__review-row']}>
                  <span className={styles['wizard__review-key']}>Applies to</span>
                  <span className={styles['wizard__review-chips']}>
                    {draft.appliesTo.map((r) => (
                      <Chip key={r} size="Small">
                        {r}
                      </Chip>
                    ))}
                  </span>
                </div>
                <div className={styles['wizard__review-row']}>
                  <span className={styles['wizard__review-key']}>Eligibility</span>
                  <LabelTag
                    label={
                      draft.appliesTo.includes('Users')
                        ? 'Depends on who sets the value'
                        : 'Usable in policies'
                    }
                    type={
                      draft.appliesTo.includes('Users') ? 'Warning' : 'Success'
                    }
                    size="Small"
                  />
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
