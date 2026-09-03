import { useMemo, useRef, useState } from 'react';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import ClassificationPill from '@/pages/attribute-system/ClassificationPill';
import type { HubAttribute } from '@/pages/AttributeManagementHub/hubData';
import {
  channelScopedAttributes,
  channelValueLabel,
} from './channelViewData';
import { CLASSIFICATION_PICKER_OPTIONS } from './postViewData';
import styles from './UnarchiveChannelModal.module.scss';

const CHANNEL_DISPLAY_NAME = 'QA Filter Run';

const REQUIRED_ATTR_IDS = ['classification', 'caveat'] as const;

export interface UnarchiveChannelModalProps {
  channelName?: string;
  onClose: () => void;
  onConfirm?: (values: Record<string, string>) => void;
}

function AttributeValuePicker({
  attribute,
  valueId,
  onChange,
}: {
  attribute: HubAttribute;
  valueId: string;
  onChange: (valueId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const label = valueId ? channelValueLabel(attribute, valueId) : '';
  const close = () => setOpen(false);
  const pick = (next: string) => {
    onChange(next);
    close();
  };

  const options =
    attribute.id === 'classification'
      ? CLASSIFICATION_PICKER_OPTIONS.map((option) => ({
          id: option.id,
          label: option.label,
        }))
      : attribute.values.map((value) => ({
          id: value.id,
          label: value.label,
        }));

  const triggerClass = [
    styles['unarchive-modal__value-trigger'],
    !valueId ? styles['unarchive-modal__value-trigger--placeholder'] : '',
    open ? styles['unarchive-modal__value-trigger--open'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (attribute.id === 'classification') {
    return (
      <>
        <button
          ref={triggerRef}
          type="button"
          className={triggerClass}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={
            valueId ? `Classification: ${label}` : 'Select Classification'
          }
          onClick={() => setOpen(true)}
        >
          {valueId ? (
            <ClassificationPill valueId={valueId} label={label} />
          ) : (
            <span>Select a value</span>
          )}
        </button>
        <FixedPopoverMenu
          open={open}
          onClose={close}
          anchorRef={triggerRef}
          align="start"
          minWidthFloor={200}
        >
          <PopoverMenu aria-label="Classification">
            {options.map((option) => (
              <MenuItem
                key={option.id}
                label={option.label}
                leadingElement={false}
                trailingElement={option.id === valueId}
                onClick={() => pick(option.id)}
              />
            ))}
          </PopoverMenu>
        </FixedPopoverMenu>
      </>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClass}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          valueId
            ? `${attribute.name}: ${label}`
            : `Select ${attribute.name}`
        }
        onClick={() => setOpen(true)}
      >
        {valueId ? <Chip size="Medium">{label}</Chip> : <span>Select a value</span>}
      </button>
      <FixedPopoverMenu
        open={open}
        onClose={close}
        anchorRef={triggerRef}
        align="start"
        minWidthFloor={200}
      >
        <PopoverMenu aria-label={attribute.name}>
          {options.map((option) => (
            <MenuItem
              key={option.id}
              label={option.label}
              leadingElement={false}
              trailingElement={option.id === valueId}
              onClick={() => pick(option.id)}
            />
          ))}
        </PopoverMenu>
      </FixedPopoverMenu>
    </>
  );
}

/**
 * Confirm unarchive — when Required channel attributes are unset, collect
 * values here before the channel can be restored (Channel info RHS pattern).
 */
export default function UnarchiveChannelModal({
  channelName = CHANNEL_DISPLAY_NAME,
  onClose,
  onConfirm,
}: UnarchiveChannelModalProps) {
  const requiredAttributes = useMemo(() => {
    const byId = new Map(
      channelScopedAttributes().map((attribute) => [attribute.id, attribute]),
    );
    return REQUIRED_ATTR_IDS.map((id) => byId.get(id)).filter(
      (attribute): attribute is HubAttribute => Boolean(attribute),
    );
  }, []);

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(REQUIRED_ATTR_IDS.map((id) => [id, ''])),
  );

  const allRequiredSet = useMemo(
    () =>
      requiredAttributes.every((attribute) =>
        Boolean(values[attribute.id]?.trim()),
      ),
    [requiredAttributes, values],
  );

  const handleConfirm = () => {
    if (!allRequiredSet) return;
    onConfirm?.(values);
    onClose();
  };

  return (
    <div className={styles['unarchive-modal']} role="presentation">
      <button
        type="button"
        className={styles['unarchive-modal__scrim']}
        aria-label="Close unarchive confirmation"
        onClick={onClose}
      />
      <div className={styles['unarchive-modal__dialog']}>
        <Modal
          size="Small"
          title="Confirm UNARCHIVE Channel"
          headerDivider={false}
          footerDivider={false}
          onClose={onClose}
          footer={
            <div className={styles['unarchive-modal__footer']}>
              <Button emphasis="Tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                emphasis="Primary"
                destructive
                disabled={!allRequiredSet}
                onClick={handleConfirm}
              >
                Unarchive
              </Button>
            </div>
          }
        >
          <div className={styles['unarchive-modal__body']}>
            <div className={styles['unarchive-modal__notice']} role="status">
              <p className={styles['unarchive-modal__notice-text']}>
                Are you sure you wish to unarchive the{' '}
                <strong>{channelName}</strong> channel?
              </p>
            </div>

            <div className={styles['unarchive-modal__required']}>
              <p className={styles['unarchive-modal__required-lead']}>
                This channel is missing required attributes. Set a value for
                each before unarchiving.
              </p>

              <section
                className={styles['unarchive-modal__attrs']}
                aria-label="Required attributes"
              >
                {requiredAttributes.map((attribute) => (
                  <div
                    key={attribute.id}
                    className={styles['unarchive-modal__attr-row']}
                  >
                    <span className={styles['unarchive-modal__attr-label']}>
                      {attribute.name}
                    </span>
                    <div className={styles['unarchive-modal__attr-value']}>
                      <AttributeValuePicker
                        attribute={attribute}
                        valueId={values[attribute.id] ?? ''}
                        onChange={(next) =>
                          setValues((current) => ({
                            ...current,
                            [attribute.id]: next,
                          }))
                        }
                      />
                    </div>
                  </div>
                ))}
              </section>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
