import { useMemo, useRef, useState, type RefObject } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Chip from '@/components/ui/Chip/Chip';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import MessageInput from '@/components/ui/MessageInput';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import type { HubAttribute } from '@/pages/AttributeManagementHub/hubData';
import ClassificationPill from '@/pages/attribute-system/ClassificationPill';
import {
  PostAttributeAddMenu,
  defaultValueForPostAttribute,
} from './postAttributeAddMenu';
import {
  CLASSIFICATION_PICKER_OPTIONS,
  isPostAttributeLocked,
  postBinding,
  postScopedAttributes,
  valueLabel,
} from './postViewData';
import styles from './ThreadReplyMessageInput.module.scss';

export interface ThreadReplyMessageInputProps {
  placeholder?: string;
  postAttributes?: HubAttribute[];
  onCreateAttribute?: () => void;
  onPost?: (payload: {
    body: string;
    attachedIds: string[];
    valuesById: Record<string, string>;
  }) => void;
}

type MenuAnchor = 'toolbar' | 'chip';

function ComposerChipHint({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className={styles['thread-reply-input__chip-hint']}>
      {children}
      <span className={styles['thread-reply-input__chip-hint-bubble']} aria-hidden>
        <Tooltip label={label} arrow="Bottom" />
      </span>
    </span>
  );
}

function ComposerAttributeChip({
  attribute,
  valueId,
  locked,
  pickerOpen,
  onTogglePicker,
  onPickValue,
}: {
  attribute: HubAttribute;
  valueId: string;
  locked: boolean;
  pickerOpen: boolean;
  onTogglePicker: () => void;
  onPickValue: (nextValueId: string) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const label = valueLabel(attribute, valueId);

  const closePicker = () => {
    if (pickerOpen) onTogglePicker();
  };

  const pickValue = (nextValueId: string) => {
    onPickValue(nextValueId);
    closePicker();
  };

  if (attribute.id === 'classification') {
    const pill = (
      <ClassificationPill
        valueId={valueId}
        label={label}
        locked
      />
    );

    if (locked) {
      return (
        <ComposerChipHint label={attribute.name}>
          <span className={styles['thread-reply-input__chip-static']}>{pill}</span>
        </ComposerChipHint>
      );
    }

    return (
      <ComposerChipHint label={attribute.name}>
        <>
          <button
            ref={triggerRef}
            type="button"
            className={styles['thread-reply-input__chip-trigger']}
            aria-haspopup="menu"
            aria-expanded={pickerOpen}
            aria-label={`${attribute.name}: ${label}`}
            onClick={onTogglePicker}
          >
            {pill}
          </button>
          <FixedPopoverMenu
            open={pickerOpen}
            onClose={closePicker}
            anchorRef={triggerRef}
            align="start"
            preferAbove
            minWidthFloor={200}
          >
            <PopoverMenu>
              {CLASSIFICATION_PICKER_OPTIONS.map((option) => (
                <MenuItem
                  key={option.id}
                  label={option.label}
                  leadingElement={false}
                  trailingElement={option.id === valueId}
                  onClick={() => pickValue(option.id)}
                />
              ))}
            </PopoverMenu>
          </FixedPopoverMenu>
        </>
      </ComposerChipHint>
    );
  }

  const chipContent = (
    <span className={styles['thread-reply-input__chip-value']}>{label}</span>
  );

  if (locked) {
    return (
      <ComposerChipHint label={attribute.name}>
        <Chip size="Small" className={styles['thread-reply-input__value-chip']}>
          {chipContent}
        </Chip>
      </ComposerChipHint>
    );
  }

  return (
    <ComposerChipHint label={attribute.name}>
      <>
        <button
          ref={triggerRef}
          type="button"
          className={styles['thread-reply-input__chip-trigger']}
          aria-haspopup="menu"
          aria-expanded={pickerOpen}
          aria-label={`${attribute.name}: ${label}`}
          onClick={onTogglePicker}
        >
          <Chip as="div" size="Small" className={styles['thread-reply-input__value-chip']}>
            {chipContent}
          </Chip>
        </button>
        <FixedPopoverMenu
          open={pickerOpen}
          onClose={closePicker}
          anchorRef={triggerRef}
          align="start"
          preferAbove
          minWidthFloor={180}
        >
          <PopoverMenu>
            {attribute.values.map((value) => (
              <MenuItem
                key={value.id}
                label={value.label}
                leadingElement={false}
                trailingElement={value.id === valueId}
                onClick={() => pickValue(value.id)}
              />
            ))}
          </PopoverMenu>
        </FixedPopoverMenu>
      </>
    </ComposerChipHint>
  );
}

export default function ThreadReplyMessageInput({
  placeholder = 'Write to channel…',
  postAttributes,
  onCreateAttribute,
  onPost,
}: ThreadReplyMessageInputProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor>('toolbar');
  const [attachedIds, setAttachedIds] = useState<string[]>([]);
  const [valuesById, setValuesById] = useState<Record<string, string>>({});
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);
  const toolbarTriggerRef = useRef<HTMLButtonElement>(null);
  const chipAddTriggerRef = useRef<HTMLButtonElement>(null);

  const menuAnchorRef: RefObject<HTMLElement | null> =
    menuAnchor === 'chip' ? chipAddTriggerRef : toolbarTriggerRef;

  const attributeById = useMemo(() => {
    const map = new Map<string, HubAttribute>();
    for (const attribute of postAttributes ?? postScopedAttributes()) {
      map.set(attribute.id, attribute);
    }
    return map;
  }, [postAttributes]);

  const visibleAttachedIds = useMemo(
    () => attachedIds.filter((attributeId) => attributeById.has(attributeId)),
    [attachedIds, attributeById],
  );

  const closeMenu = () => setMenuOpen(false);

  const openAddMenu = (anchor: MenuAnchor) => {
    setMenuAnchor(anchor);
    setOpenPickerId(null);
    setMenuOpen(true);
  };

  const pickAttribute = (attributeId: string) => {
    if (attachedIds.includes(attributeId)) return;

    const attribute = attributeById.get(attributeId);
    if (!attribute) return;

    const binding = postBinding(attribute);

    setAttachedIds((current) => [...current, attributeId]);
    setValuesById((current) => ({
      ...current,
      [attributeId]: defaultValueForPostAttribute(attribute),
    }));

    if (binding && !isPostAttributeLocked(attribute, binding)) {
      setOpenPickerId(attributeId);
    }
  };

  const updateValue = (attributeId: string, valueId: string) => {
    setValuesById((current) => ({ ...current, [attributeId]: valueId }));
  };

  const handleSend = (body: string) => {
    onPost?.({ body, attachedIds, valuesById });
    setAttachedIds([]);
    setValuesById({});
    setOpenPickerId(null);
  };

  const composerHeader =
    visibleAttachedIds.length > 0 ? (
      <div
        className={styles['thread-reply-input__chip-row']}
        role="group"
        aria-label="Attached post attributes"
      >
        {visibleAttachedIds.map((attributeId) => {
          const attribute = attributeById.get(attributeId);
          const binding = attribute ? postBinding(attribute) : undefined;
          if (!attribute || !binding) return null;

          const valueId =
            valuesById[attributeId] ?? defaultValueForPostAttribute(attribute);
          const locked = isPostAttributeLocked(attribute, binding);
          const pickerOpen = openPickerId === attributeId;

          return (
            <ComposerAttributeChip
              key={attributeId}
              attribute={attribute}
              valueId={valueId}
              locked={locked}
              pickerOpen={pickerOpen}
              onTogglePicker={() =>
                setOpenPickerId((current) =>
                  current === attributeId ? null : attributeId,
                )
              }
              onPickValue={(next) => updateValue(attributeId, next)}
            />
          );
        })}
        <button
          ref={chipAddTriggerRef}
          type="button"
          className={styles['thread-reply-input__add-chip']}
          aria-label="Add attribute"
          aria-haspopup="menu"
          aria-expanded={menuOpen && menuAnchor === 'chip'}
          onClick={() => openAddMenu('chip')}
        >
          <Icon size="12" glyph={<PlusIcon />} />
          <span className={styles['thread-reply-input__add-chip-label']}>Add</span>
        </button>
      </div>
    ) : null;

  const addAttributeTrigger = (
    <button
      ref={toolbarTriggerRef}
      type="button"
      className={styles['thread-reply-input__add-trigger']}
      aria-label="Add attribute"
      aria-haspopup="menu"
      aria-expanded={menuOpen && menuAnchor === 'toolbar'}
      onClick={() => openAddMenu('toolbar')}
    >
      <Icon size="16" glyph={<PlusIcon />} />
    </button>
  );

  return (
    <>
      <MessageInput
        placeholder={placeholder}
        formattingBarDefaultOpen
        formattingToolbarLeading={addAttributeTrigger}
        composerHeader={composerHeader}
        onSend={onPost ? handleSend : undefined}
      />

      <PostAttributeAddMenu
        open={menuOpen}
        onClose={closeMenu}
        anchorRef={menuAnchorRef}
        attachedIds={attachedIds}
        attributes={postAttributes}
        onPickAttribute={pickAttribute}
        onCreateNew={onCreateAttribute}
        repositionKey={menuAnchor}
      />
    </>
  );
}
