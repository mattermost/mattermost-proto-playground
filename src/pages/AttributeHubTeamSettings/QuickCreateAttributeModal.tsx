import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import Select from '@/components/ui/Select/Select';
import TextInput from '@/components/ui/TextInput/TextInput';
import {
  defaultAccessModel,
  type AttrType,
  type AttrValue,
  type HubAttribute,
} from '@/pages/AttributeManagementHub/hubData';
import { defaultChannelResourceConfig } from './channelData';
import styles from './QuickCreateAttributeModal.module.scss';

const QUICK_TYPES: AttrType[] = ['Select', 'Multiselect', 'Text'];

export interface QuickCreateAttributeModalProps {
  onClose: () => void;
  onCreate: (attribute: HubAttribute) => void;
}

export default function QuickCreateAttributeModal({
  onClose,
  onCreate,
}: QuickCreateAttributeModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AttrType>('Select');
  const [values, setValues] = useState<AttrValue[]>([]);
  const [draft, setDraft] = useState('');

  const trimmed = name.trim();
  const canCreate =
    trimmed.length > 0 && (type === 'Text' || values.length > 0);

  const addValue = () => {
    if (!draft.trim()) return;
    setValues((current) => [
      ...current,
      { id: `v-${Date.now()}`, label: draft.trim() },
    ]);
    setDraft('');
  };

  const removeValue = (id: string) => {
    setValues((current) => current.filter((value) => value.id !== id));
  };

  const handleCreate = () => {
    if (!canCreate) return;
    const attribute: HubAttribute = {
      id: `attr-${Date.now()}`,
      name: trimmed,
      type,
      description: '',
      values: type === 'Text' ? [] : values,
      source: { kind: 'manual' },
      appliesTo: [defaultChannelResourceConfig('Posts')],
      usedByPolicies: 0,
      policyNames: [],
      access: defaultAccessModel('Channel Administrators'),
      readIntoFiltering: false,
    };
    onCreate(attribute);
    onClose();
  };

  return (
    <div className={styles['quick-create']} role="presentation">
      <button
        type="button"
        className={styles['quick-create__scrim']}
        aria-label="Close"
        onClick={onClose}
      />
      <div className={styles['quick-create__dialog']}>
        <Modal
          title="Create attribute"
          subtitle="Quick setup for a post attribute in this channel."
          onClose={onClose}
          footer={
            <>
              <Button emphasis="Tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                emphasis="Primary"
                disabled={!canCreate}
                onClick={handleCreate}
              >
                Create attribute
              </Button>
            </>
          }
        >
          <div className={styles['quick-create__form']}>
            <label className={styles['quick-create__field']}>
              <span className={styles['quick-create__label']}>Name</span>
              <TextInput
                size="Medium"
                value={name}
                placeholder="Name this attribute"
                aria-label="Attribute name"
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label className={styles['quick-create__field']}>
              <span className={styles['quick-create__label']}>Type</span>
              <Select
                size="Medium"
                value={type}
                aria-label="Attribute type"
                onChange={(event) =>
                  setType(event.target.value as AttrType)
                }
              >
                {QUICK_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            {type !== 'Text' && (
              <div className={styles['quick-create__field']}>
                <span className={styles['quick-create__label']}>Values</span>
                <div className={styles['quick-create__values']}>
                  {values.map((value) => (
                    <Chip
                      key={value.id}
                      size="Medium"
                      onRemove={() => removeValue(value.id)}
                    >
                      {value.label}
                    </Chip>
                  ))}
                  <div className={styles['quick-create__value-add']}>
                    <TextInput
                      size="Small"
                      value={draft}
                      placeholder="Add a value"
                      aria-label="Add a value"
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addValue();
                        }
                      }}
                    />
                    <Button
                      emphasis="Secondary"
                      size="Small"
                      leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                      disabled={draft.trim().length === 0}
                      onClick={addValue}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
