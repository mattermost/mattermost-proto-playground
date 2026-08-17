import { useMemo, useRef, useState } from 'react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import CheckIcon from '@mattermost/compass-icons/components/check';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import TextInput from '@/components/ui/TextInput/TextInput';
import TextArea from '@/components/ui/TextArea/TextArea';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import ClassificationPill from '@/pages/attribute-system/ClassificationPill';
import type { HubAttribute } from '@/pages/AttributeManagementHub/hubData';
import {
  channelScopedAttributes,
  slugifyChannelName,
} from './channelViewData';
import {
  CLASSIFICATION_PICKER_OPTIONS,
  classificationLabel,
} from './postViewData';
import styles from './CreateChannelModal.module.scss';

type ChannelPrivacy = 'public' | 'private';

const DEFAULT_VISIBLE_ATTR_IDS = ['classification', 'program'];

const ATTR_LABEL_OVERRIDES: Record<string, string> = {
  program: 'Programs',
};

function attributeLabel(attribute: HubAttribute): string {
  return ATTR_LABEL_OVERRIDES[attribute.id] ?? attribute.name;
}

export type CreateChannelPayload = {
  name: string;
  privacy: ChannelPrivacy;
  purpose: string;
  attributes: {
    single: Record<string, string>;
    multi: Record<string, string[]>;
  };
};

export interface CreateChannelModalProps {
  onClose: () => void;
  onSave?: (payload: CreateChannelPayload) => void;
}

function SelectField({
  placeholder,
  valueId,
  options,
  onChange,
}: {
  placeholder: string;
  valueId: string;
  options: { id: string; label: string }[];
  onChange: (valueId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const label = options.find((option) => option.id === valueId)?.label;
  const close = () => setOpen(false);

  return (
    <div className={styles['create-channel-modal__picker']}>
      <button
        ref={triggerRef}
        type="button"
        className={[
          styles['create-channel-modal__picker-trigger'],
          !valueId ? styles['create-channel-modal__picker-trigger--empty'] : '',
          open ? styles['create-channel-modal__picker-trigger--open'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{label ?? placeholder}</span>
      </button>

      <FixedPopoverMenu
        open={open}
        onClose={close}
        anchorRef={triggerRef}
        align="start"
      >
        <PopoverMenu aria-label={placeholder}>
          {options.map((option) => (
            <MenuItem
              key={option.id}
              label={option.label}
              leadingElement={false}
              trailingElement={option.id === valueId}
              onClick={() => {
                onChange(option.id);
                close();
              }}
            />
          ))}
        </PopoverMenu>
      </FixedPopoverMenu>
    </div>
  );
}

function ClassificationField({
  valueId,
  onChange,
}: {
  valueId: string;
  onChange: (valueId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const label = classificationLabel(valueId);
  const close = () => setOpen(false);

  return (
    <div className={styles['create-channel-modal__picker']}>
      <button
        ref={triggerRef}
        type="button"
        className={[
          styles['create-channel-modal__picker-trigger'],
          open ? styles['create-channel-modal__picker-trigger--open'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Classification: ${label}`}
        onClick={() => setOpen((current) => !current)}
      >
        <ClassificationPill valueId={valueId} label={label} />
      </button>

      <FixedPopoverMenu
        open={open}
        onClose={close}
        anchorRef={triggerRef}
        align="start"
        minWidthFloor={200}
      >
        <PopoverMenu aria-label="Classification">
          {CLASSIFICATION_PICKER_OPTIONS.map((option) => (
            <MenuItem
              key={option.id}
              label={option.label}
              leadingElement={false}
              trailingElement={option.id === valueId}
              onClick={() => {
                onChange(option.id);
                close();
              }}
            />
          ))}
        </PopoverMenu>
      </FixedPopoverMenu>
    </div>
  );
}

function MultiselectField({
  placeholder,
  valueIds,
  options,
  onChange,
}: {
  placeholder: string;
  valueIds: string[];
  options: { id: string; label: string }[];
  onChange: (valueIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const toggle = (valueId: string) => {
    onChange(
      valueIds.includes(valueId)
        ? valueIds.filter((id) => id !== valueId)
        : [...valueIds, valueId],
    );
  };

  const selectedLabels = valueIds
    .map((id) => options.find((option) => option.id === id)?.label)
    .filter(Boolean) as string[];

  return (
    <div className={styles['create-channel-modal__picker']}>
      <button
        ref={triggerRef}
        type="button"
        className={[
          styles['create-channel-modal__picker-trigger'],
          valueIds.length === 0
            ? styles['create-channel-modal__picker-trigger--empty']
            : '',
          open ? styles['create-channel-modal__picker-trigger--open'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {valueIds.length === 0 ? (
          <span>{placeholder}</span>
        ) : (
          <span className={styles['create-channel-modal__picker-chips']}>
            {selectedLabels.map((label) => (
              <Chip key={label} size="Small" tone="neutral">
                {label}
              </Chip>
            ))}
          </span>
        )}
      </button>

      <FixedPopoverMenu
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={triggerRef}
        align="start"
      >
        <PopoverMenu aria-label={placeholder}>
          {options.map((option) => (
            <MenuItem
              key={option.id}
              label={option.label}
              leadingElement={false}
              trailingElement={valueIds.includes(option.id)}
              onClick={() => toggle(option.id)}
            />
          ))}
        </PopoverMenu>
      </FixedPopoverMenu>
    </div>
  );
}

export default function CreateChannelModal({
  onClose,
  onSave,
}: CreateChannelModalProps) {
  const [privacy, setPrivacy] = useState<ChannelPrivacy>('public');
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [singleValues, setSingleValues] = useState<Record<string, string>>({
    classification: 's',
  });
  const [multiValues, setMultiValues] = useState<Record<string, string[]>>({
    program: [],
  });

  const availableAttributes = useMemo(() => channelScopedAttributes(), []);
  const attributesById = useMemo(
    () => new Map(availableAttributes.map((attribute) => [attribute.id, attribute])),
    [availableAttributes],
  );

  const visibleAttributes = DEFAULT_VISIBLE_ATTR_IDS.map((id) => attributesById.get(id)).filter(
    (attribute): attribute is HubAttribute => Boolean(attribute),
  );

  const slug = slugifyChannelName(name);

  const handleSave = () => {
    onSave?.({
      name: name.trim(),
      privacy,
      purpose,
      attributes: {
        single: singleValues,
        multi: multiValues,
      },
    });
    onClose();
  };

  const renderAttributeValue = (attribute: HubAttribute) => {
    if (attribute.id === 'classification') {
      return (
        <ClassificationField
          valueId={singleValues.classification ?? 's'}
          onChange={(next) =>
            setSingleValues((current) => ({ ...current, classification: next }))
          }
        />
      );
    }

    if (attribute.type === 'Multiselect') {
      return (
        <MultiselectField
          placeholder="Select one or more values"
          valueIds={multiValues[attribute.id] ?? []}
          options={attribute.values.map((value) => ({
            id: value.id,
            label: value.label,
          }))}
          onChange={(next) =>
            setMultiValues((current) => ({ ...current, [attribute.id]: next }))
          }
        />
      );
    }

    return (
      <SelectField
        placeholder="Select a value"
        valueId={singleValues[attribute.id] ?? ''}
        options={attribute.values.map((value) => ({
          id: value.id,
          label: value.label,
        }))}
        onChange={(next) =>
          setSingleValues((current) => ({ ...current, [attribute.id]: next }))
        }
      />
    );
  };

  return (
    <Modal
      size="Small"
      title="Create a new channel"
      onClose={onClose}
      footer={
        <div className={styles['create-channel-modal__footer']}>
          <Button emphasis="Tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button emphasis="Primary" disabled={!name.trim()} onClick={handleSave}>
            Create
          </Button>
        </div>
      }
    >
      <div className={styles['create-channel-modal__body']}>
        <div className={styles['create-channel-modal__type-grid']}>
          <button
            type="button"
            className={[
              styles['create-channel-modal__type-card'],
              privacy === 'public'
                ? styles['create-channel-modal__type-card--selected']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={privacy === 'public'}
            onClick={() => setPrivacy('public')}
          >
            <span className={styles['create-channel-modal__type-icon']}>
              <Icon size="20" glyph={<GlobeIcon />} />
            </span>
            <span className={styles['create-channel-modal__type-text']}>
              <span className={styles['create-channel-modal__type-title']}>
                Public Channel
              </span>
              <span className={styles['create-channel-modal__type-sub']}>
                Anyone can join
              </span>
            </span>
            {privacy === 'public' && (
              <span className={styles['create-channel-modal__type-check']}>
                <Icon size="16" glyph={<CheckIcon />} />
              </span>
            )}
          </button>

          <button
            type="button"
            className={[
              styles['create-channel-modal__type-card'],
              privacy === 'private'
                ? styles['create-channel-modal__type-card--selected']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={privacy === 'private'}
            onClick={() => setPrivacy('private')}
          >
            <span className={styles['create-channel-modal__type-icon']}>
              <Icon size="20" glyph={<LockOutlineIcon />} />
            </span>
            <span className={styles['create-channel-modal__type-text']}>
              <span className={styles['create-channel-modal__type-title']}>
                Private Channel
              </span>
              <span className={styles['create-channel-modal__type-sub']}>
                Only invited members
              </span>
            </span>
            {privacy === 'private' && (
              <span className={styles['create-channel-modal__type-check']}>
                <Icon size="16" glyph={<CheckIcon />} />
              </span>
            )}
          </button>
        </div>

        <div className={styles['create-channel-modal__field']}>
          <TextInput
            aria-label="Channel name"
            value={name}
            placeholder="Channel name"
            onChange={(event) => setName(event.target.value)}
          />
          <p className={styles['create-channel-modal__url']}>
            URL: {slug || '—'}
          </p>
        </div>

        <div className={styles['create-channel-modal__field']}>
          <TextArea
            aria-label="Purpose (optional)"
            value={purpose}
            placeholder="Purpose (optional)"
            rows={3}
            onChange={(event) => setPurpose(event.target.value)}
          />
          <p className={styles['create-channel-modal__help']}>
            Describe how this channel should be used.
          </p>
        </div>

        <section className={styles['create-channel-modal__attrs']}>
          <div className={styles['create-channel-modal__attrs-header']}>
            <h3 className={styles['create-channel-modal__attrs-title']}>
              Channel attributes
            </h3>
          </div>
          <p className={styles['create-channel-modal__attrs-help']}>
            Configure attributes and values for this channel.
          </p>

          <div className={styles['create-channel-modal__attrs-rows']}>
            {visibleAttributes.map((attribute) => (
              <div key={attribute.id} className={styles['create-channel-modal__attr-row']}>
                <span className={styles['create-channel-modal__attr-label']}>
                  {attributeLabel(attribute)}
                </span>
                {renderAttributeValue(attribute)}
              </div>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  );
}
