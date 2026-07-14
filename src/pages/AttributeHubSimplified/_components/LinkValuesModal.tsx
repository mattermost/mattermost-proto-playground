import { useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Radio from '@/components/ui/Radio/Radio';
import Select from '@/components/ui/Select/Select';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import {
  valueCountLabel,
  type HubAttribute,
} from '@/pages/AttributeManagementHub/hubData';
import {
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

  const [sourceId, setSourceId] = useState(
    existing?.attributeId ?? candidates[0]?.id ?? '',
  );
  const [mode, setMode] = useState<ValueLinkMode>(existing?.mode ?? 'exact');
  const source = attributes.find((attribute) => attribute.id === sourceId);
  const localValues = flatCatalogValues(current.values);
  const sourceValues = source ? flatCatalogValues(source.values) : [];

  const [mappings, setMappings] = useState<Record<string, string>>(() => {
    if (existing?.mode === 'mapped' && existing.mappings) {
      return existing.mappings;
    }
    if (!source) return {};
    return suggestValueMappings(current.values, source.values);
  });

  const handleSourceChange = (nextId: string) => {
    setSourceId(nextId);
    const nextSource = attributes.find((attribute) => attribute.id === nextId);
    if (nextSource) {
      setMappings(suggestValueMappings(current.values, nextSource.values));
    }
  };

  const handleModeChange = (nextMode: ValueLinkMode) => {
    setMode(nextMode);
    if (nextMode === 'mapped' && source) {
      setMappings(suggestValueMappings(current.values, source.values));
    }
  };

  const mappingComplete =
    mode !== 'mapped' ||
    localValues.every((value) => Boolean(mappings[value.id]));

  const confirmLabel = existing ? 'Save link' : 'Link values';

  const handleConfirm = () => {
    if (!source || !mappingComplete) return;
    onConfirm({
      attributeId: source.id,
      attributeName: source.name,
      mode,
      mappings: mode === 'mapped' ? mappings : undefined,
    });
  };

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
          title="Link values to another attribute"
          subtitle={
            existing
              ? `Update how ${current.name} compares against ${existing.attributeName}`
              : `${current.name} can mirror or map to another attribute's catalog`
          }
          onClose={onClose}
          footer={
            <div className={styles['link__footer']}>
              <Button emphasis="Tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                emphasis="Primary"
                disabled={!sourceId || !mappingComplete}
                onClick={handleConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          }
        >
          <div className={styles['link__section']}>
            <p className={styles['link__section-title']}>Source attribute</p>
            <div className={styles['link__list']}>
              {candidates.map((attribute) => (
                <label key={attribute.id} className={styles['link__option']}>
                  <Radio
                    checked={sourceId === attribute.id}
                    onChange={() => handleSourceChange(attribute.id)}
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

          <div className={styles['link__section']}>
            <p className={styles['link__section-title']}>Comparison mode</p>
            <div className={styles['link__mode']}>
              <label className={styles['link__mode-option']}>
                <Radio
                  checked={mode === 'exact'}
                  onChange={() => handleModeChange('exact')}
                />
                <div className={styles['link__mode-copy']}>
                  <span className={styles['link__mode-label']}>Exact match</span>
                  <span className={styles['link__mode-desc']}>
                    Mirror the source catalog here — same labels and ranks,
                    read-only on this attribute.
                  </span>
                </div>
              </label>
              <label className={styles['link__mode-option']}>
                <Radio
                  checked={mode === 'mapped'}
                  onChange={() => handleModeChange('mapped')}
                />
                <div className={styles['link__mode-copy']}>
                  <span className={styles['link__mode-label']}>Define mapping</span>
                  <span className={styles['link__mode-desc']}>
                    Keep local option labels but map each one to a source option
                    so rank comparison stays consistent across resources.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {mode === 'mapped' && source && localValues.length > 0 && (
            <div className={styles['link__section']}>
              <p className={styles['link__section-title']}>Value mapping</p>
              <div className={styles['link__mapping']}>
                <div className={styles['link__mapping-head']}>
                  <span>{current.name}</span>
                  <span aria-hidden />
                  <span>{source.name}</span>
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
                      aria-label={`Map ${value.label} to ${source.name}`}
                      onChange={(event) =>
                        setMappings((currentMappings) => ({
                          ...currentMappings,
                          [value.id]: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select…</option>
                      {sourceValues.map((sourceValue) => (
                        <option key={sourceValue.id} value={sourceValue.id}>
                          {sourceValue.label}
                          {sourceValue.tier != null ? ` (tier ${sourceValue.tier})` : ''}
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
