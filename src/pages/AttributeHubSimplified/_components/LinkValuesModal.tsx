import { useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Radio from '@/components/ui/Radio/Radio';
import Select from '@/components/ui/Select/Select';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import {
  valueCountLabel,
  type HubAttribute,
} from '@/pages/AttributeManagementHub/hubData';
import {
  catalogOwnerIdOf,
  flatCatalogValues,
  suggestValueMappings,
  type ValueLinkConfig,
  type ValueLinkMode,
} from './simplifiedModel';
import styles from './LinkValuesModal.module.scss';

export interface LinkValuesModalProps {
  current: HubAttribute;
  attributes: HubAttribute[];
  existing?: ValueLinkConfig | null;
  onClose: () => void;
  onConfirm: (config: ValueLinkConfig) => void;
}

type Step = 'attribute' | 'source' | 'owner' | 'mapping';

function stepIndex(step: Step): number {
  switch (step) {
    case 'attribute':
      return 1;
    case 'source':
      return 2;
    case 'owner':
    case 'mapping':
      return 3;
    default: {
      const _exhaustive: never = step;
      return _exhaustive;
    }
  }
}

function stepTitle(step: Step): string {
  switch (step) {
    case 'attribute':
      return 'Link values to another attribute';
    case 'source':
      return 'Option source';
    case 'owner':
      return 'Whose options?';
    case 'mapping':
      return 'Map options';
    default: {
      const _exhaustive: never = step;
      return _exhaustive;
    }
  }
}

function OwnerChoice({
  owner,
  mirror,
  selected,
  editHere,
  onSelect,
}: {
  owner: HubAttribute;
  mirror: HubAttribute;
  selected: boolean;
  editHere: boolean;
  onSelect: () => void;
}) {
  return (
    <label className={styles['link__chooser-card']}>
      <div className={styles['link__chooser-head']}>
        <Radio
          name="catalog-owner"
          checked={selected}
          onChange={onSelect}
        />
        <div className={styles['link__chooser-title']}>
          <span className={styles['link__chooser-name']}>{owner.name}</span>
          <span className={styles['link__chooser-meta']}>
            {owner.type} · {valueCountLabel(owner)}
          </span>
        </div>
      </div>
      <dl className={styles['link__chooser-rows']}>
        <div className={styles['link__chooser-row']}>
          <dt>
            <LabelTag label="Keep" type="Success" size="X-Small" />
          </dt>
          <dd>{owner.name}</dd>
        </div>
        <div className={styles['link__chooser-row']}>
          <dt>
            <LabelTag label="Replace" type="Warning" size="X-Small" />
          </dt>
          <dd>{mirror.name}</dd>
        </div>
        <div className={styles['link__chooser-row']}>
          <dt>
            <span className={styles['link__chooser-key']}>Edit on</span>
          </dt>
          <dd>{editHere ? `${owner.name} (here)` : owner.name}</dd>
        </div>
      </dl>
    </label>
  );
}

export default function LinkValuesModal({
  current,
  attributes,
  existing,
  onClose,
  onConfirm,
}: LinkValuesModalProps) {
  const candidates = useMemo(
    () =>
      attributes.filter(
        (attribute) =>
          attribute.id !== current.id &&
          attribute.type !== 'Text' &&
          attribute.values.length > 0 &&
          !attribute.valuesLink,
      ),
    [attributes, current.id],
  );

  const [step, setStep] = useState<Step>('attribute');
  const [linkedId, setLinkedId] = useState(
    existing?.attributeId ?? candidates[0]?.id ?? '',
  );
  const [mode, setMode] = useState<ValueLinkMode>(existing?.mode ?? 'exact');
  const [catalogOwnerId, setCatalogOwnerId] = useState(
    existing ? catalogOwnerIdOf(existing) : (candidates[0]?.id ?? ''),
  );

  const linked = attributes.find((attribute) => attribute.id === linkedId);
  const localValues = flatCatalogValues(current.values);
  const linkedValues = linked ? flatCatalogValues(linked.values) : [];
  const totalSteps = 3;
  const owner = linked
    ? catalogOwnerId === current.id
      ? current
      : linked
    : undefined;
  const mirror = linked && owner
    ? owner.id === current.id
      ? linked
      : current
    : undefined;

  const [mappings, setMappings] = useState<Record<string, string>>(() => {
    if (existing?.mode === 'mapped' && existing.mappings) {
      return existing.mappings;
    }
    if (!linked) return {};
    return suggestValueMappings(current.values, linked.values);
  });

  const handleLinkedChange = (nextId: string) => {
    setLinkedId(nextId);
    setCatalogOwnerId(nextId);
    const nextLinked = attributes.find((attribute) => attribute.id === nextId);
    if (nextLinked) {
      setMappings(suggestValueMappings(current.values, nextLinked.values));
    }
  };

  const handleModeChange = (nextMode: ValueLinkMode) => {
    setMode(nextMode);
    if (nextMode === 'mapped' && linked) {
      setMappings(suggestValueMappings(current.values, linked.values));
    }
    if (nextMode === 'exact' && !catalogOwnerId) {
      setCatalogOwnerId(linkedId);
    }
  };

  const mappingComplete =
    mode !== 'mapped' ||
    localValues.every((value) => Boolean(mappings[value.id]));

  const confirmLabel = existing ? 'Save link' : 'Link values';
  const isLastStep = step === 'owner' || step === 'mapping';

  const handleConfirm = () => {
    if (!linked) return;
    if (mode === 'mapped' && !mappingComplete) return;
    if (mode === 'exact' && !catalogOwnerId) return;
    onConfirm({
      attributeId: linked.id,
      attributeName: linked.name,
      mode,
      catalogOwnerId: mode === 'exact' ? catalogOwnerId : undefined,
      mappings: mode === 'mapped' ? mappings : undefined,
    });
  };

  const goNext = () => {
    if (step === 'attribute') {
      if (!linkedId) return;
      setStep('source');
      return;
    }
    if (step === 'source') {
      setStep(mode === 'mapped' ? 'mapping' : 'owner');
    }
  };

  const goBack = () => {
    if (step === 'mapping' || step === 'owner') {
      setStep('source');
      return;
    }
    if (step === 'source') {
      setStep('attribute');
    }
  };

  const primaryDisabled =
    (step === 'attribute' && !linkedId) ||
    (step === 'owner' && !catalogOwnerId) ||
    (step === 'mapping' && !mappingComplete);

  const primaryLabel = isLastStep ? confirmLabel : 'Continue';

  const subtitle = `Step ${stepIndex(step)} of ${totalSteps}`;

  return (
    <div className={styles['link']} role="presentation">
      <button
        type="button"
        className={styles['link__scrim']}
        aria-label="Close"
        onClick={onClose}
      />
      <div className={styles['link__dialog']}>
        <Modal
          size="Medium"
          title={stepTitle(step)}
          subtitle={subtitle}
          showBackButton={step !== 'attribute'}
          onBack={goBack}
          onClose={onClose}
          footer={
            <div className={styles['link__footer']}>
              <Button emphasis="Tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                emphasis="Primary"
                disabled={primaryDisabled}
                onClick={isLastStep ? handleConfirm : goNext}
              >
                {primaryLabel}
              </Button>
            </div>
          }
        >
          {step === 'attribute' && (
            <div className={styles['link__section']}>
              <p className={styles['link__lead']}>
                Choose which attribute {current.name} should share options
                with.
              </p>
              <p className={styles['link__section-title']}>Attribute to link</p>
              <div className={styles['link__list']}>
                {candidates.map((attribute) => (
                  <label key={attribute.id} className={styles['link__option']}>
                    <Radio
                      name="link-attribute"
                      checked={linkedId === attribute.id}
                      onChange={() => handleLinkedChange(attribute.id)}
                    />
                    <div className={styles['link__option-body']}>
                      <span className={styles['link__option-name']}>
                        {attribute.name}
                      </span>
                      <span className={styles['link__option-meta']}>
                        {attribute.type} · {valueCountLabel(attribute)}
                      </span>
                    </div>
                    {attribute.mirroredBy?.length ? (
                      <LabelTag label="Owns a scale" type="Info" size="X-Small" />
                    ) : null}
                  </label>
                ))}
                {candidates.length === 0 && (
                  <p className={styles['link__option-meta']}>
                    No linkable attributes with a value catalog are available.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 'source' && linked && (
            <div className={styles['link__section']}>
              <p className={styles['link__lead']}>
                How should {current.name} and {linked.name} share options?
              </p>
              <div className={styles['link__mode']}>
                <label className={styles['link__mode-option']}>
                  <Radio
                    name="option-source"
                    checked={mode === 'exact'}
                    onChange={() => handleModeChange('exact')}
                  />
                  <div className={styles['link__mode-copy']}>
                    <span className={styles['link__mode-label']}>
                      Share one catalog
                    </span>
                    <span className={styles['link__mode-desc']}>
                      Both attributes use the same options and stay in sync.
                      Next you will choose which list to keep.
                    </span>
                  </div>
                </label>

                <label className={styles['link__mode-option']}>
                  <Radio
                    name="option-source"
                    checked={mode === 'mapped'}
                    onChange={() => handleModeChange('mapped')}
                  />
                  <div className={styles['link__mode-copy']}>
                    <span className={styles['link__mode-label']}>
                      Keep both catalogs and map them
                    </span>
                    <span className={styles['link__mode-desc']}>
                      Each attribute keeps its own option labels. Next you
                      will map {current.name} to {linked.name}.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 'owner' && linked && owner && mirror && (
            <div className={styles['link__section']}>
              <p className={styles['link__lead']}>
                Both attributes will use one catalog. Choose which list to
                keep — the other list is replaced.
              </p>
              <div className={styles['link__chooser']}>
                <OwnerChoice
                  owner={linked}
                  mirror={current}
                  selected={catalogOwnerId === linked.id}
                  editHere={false}
                  onSelect={() => setCatalogOwnerId(linked.id)}
                />
                <OwnerChoice
                  owner={current}
                  mirror={linked}
                  selected={catalogOwnerId === current.id}
                  editHere
                  onSelect={() => setCatalogOwnerId(current.id)}
                />
              </div>
              <SectionNotice
                type="Warning"
                title={`${mirror.name} options will be replaced`}
                description={`${mirror.name} will show ${owner.name}'s ${valueCountLabel(owner)} and stay in sync. Edit options on ${owner.name}${catalogOwnerId === current.id ? ' (this attribute)' : ''}.`}
              />
            </div>
          )}

          {step === 'mapping' && linked && localValues.length > 0 && (
            <div className={styles['link__section']}>
              <p className={styles['link__lead']}>
                Match each {current.name} option to a {linked.name} option.
              </p>
              <p className={styles['link__section-title']}>Value mapping</p>
              <div className={styles['link__mapping']}>
                <div className={styles['link__mapping-head']}>
                  <span>{current.name}</span>
                  <span aria-hidden />
                  <span>{linked.name}</span>
                </div>
                {localValues.map((value) => (
                  <div key={value.id} className={styles['link__mapping-row']}>
                    <span className={styles['link__mapping-local']}>
                      {value.label}
                    </span>
                    <span className={styles['link__mapping-arrow']} aria-hidden>
                      →
                    </span>
                    <Select
                      size="Small"
                      value={mappings[value.id] ?? ''}
                      aria-label={`Map ${value.label} to ${linked.name}`}
                      onChange={(event) =>
                        setMappings((currentMappings) => ({
                          ...currentMappings,
                          [value.id]: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select…</option>
                      {linkedValues.map((linkedValue) => (
                        <option key={linkedValue.id} value={linkedValue.id}>
                          {linkedValue.label}
                          {linkedValue.tier != null
                            ? ` (tier ${linkedValue.tier})`
                            : ''}
                        </option>
                      ))}
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
