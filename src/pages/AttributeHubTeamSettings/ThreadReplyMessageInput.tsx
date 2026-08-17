import { useMemo, useRef, useState, type RefObject } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Chip from '@/components/ui/Chip/Chip';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import MessageInput from '@/components/ui/MessageInput';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import {
  postDisplayIncludes,
  takesValueListForType,
  type DisplayWhere,
  type HubAttribute,
} from '@/pages/AttributeManagementHub/hubData';
import ClassificationPill from '@/pages/attribute-system/ClassificationPill';
import {
  PostAttributeAddMenu,
  defaultValueForPostAttribute,
} from './postAttributeAddMenu';
import {
  CLASSIFICATION_PICKER_OPTIONS,
  channelDefaultValueId,
  isClassificationAtOrBelow,
  isPostAttributeLocked,
  postBinding,
  postScopedAttributes,
  resolvePostShowWhere,
  valueLabel,
} from './postViewData';
import styles from './ThreadReplyMessageInput.module.scss';

export interface ThreadReplyMessageInputProps {
  placeholder?: string;
  width?: 'wide' | 'narrow';
  postAttributes?: HubAttribute[];
  showWhereById?: Record<string, DisplayWhere[]>;
  /** Channel classification ceiling — authors may only pick this or lower. */
  channelClassificationValueId?: string;
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
  classificationMaxValueId,
  onOpenPicker,
  onClosePicker,
  onPickValue,
}: {
  attribute: HubAttribute;
  valueId: string;
  locked: boolean;
  pickerOpen: boolean;
  classificationMaxValueId: string;
  onOpenPicker: () => void;
  onClosePicker: () => void;
  onPickValue: (nextValueId: string) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pending = !valueId;
  const label = pending ? attribute.name : valueLabel(attribute, valueId);

  const pickValue = (nextValueId: string) => {
    onPickValue(nextValueId);
  };

  const valueOptions =
    attribute.id === 'classification'
      ? CLASSIFICATION_PICKER_OPTIONS
      : attribute.values;

  if (attribute.id === 'classification' && !pending) {
    const pill = <ClassificationPill valueId={valueId} label={label} />;

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
            onClick={() => (pickerOpen ? onClosePicker() : onOpenPicker())}
          >
            {pill}
          </button>
          <FixedPopoverMenu
            open={pickerOpen}
            onClose={onClosePicker}
            anchorRef={triggerRef}
            align="start"
            minWidthFloor={200}
          >
            <PopoverMenu>
              {CLASSIFICATION_PICKER_OPTIONS.map((option) => {
                const aboveCeiling = !isClassificationAtOrBelow(
                  option.id,
                  classificationMaxValueId,
                );
                return (
                  <MenuItem
                    key={option.id}
                    label={option.label}
                    leadingElement={false}
                    trailingElement={option.id === valueId}
                    disabled={aboveCeiling}
                    onClick={() => pickValue(option.id)}
                  />
                );
              })}
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
          aria-label={
            pending
              ? `Select value for ${attribute.name}`
              : `${attribute.name}: ${label}`
          }
          onClick={() => (pickerOpen ? onClosePicker() : onOpenPicker())}
        >
          <Chip as="div" size="Small" className={styles['thread-reply-input__value-chip']}>
            {chipContent}
          </Chip>
        </button>
        <FixedPopoverMenu
          open={pickerOpen}
          onClose={onClosePicker}
          anchorRef={triggerRef}
          align="start"
          minWidthFloor={180}
        >
          <PopoverMenu>
            {valueOptions.map((value) => (
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

function attributeNeedsValuePicker(attribute: HubAttribute): boolean {
  if (attribute.id === 'classification') return true;
  if (takesValueListForType(attribute.type)) return true;
  return attribute.values.length > 0;
}

export default function ThreadReplyMessageInput({
  placeholder = 'Write to channel…',
  width = 'wide',
  postAttributes,
  showWhereById = {},
  channelClassificationValueId,
  onCreateAttribute,
  onPost,
}: ThreadReplyMessageInputProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor>('toolbar');
  const [attachedIds, setAttachedIds] = useState<string[]>([]);
  const [valuesById, setValuesById] = useState<Record<string, string>>({});
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);
  /** Attribute waiting on a value choice — dismiss without a value removes it. */
  const [, setPendingPickId] = useState<string | null>(null);
  const toolbarTriggerRef = useRef<HTMLButtonElement>(null);
  const chipAddTriggerRef = useRef<HTMLButtonElement>(null);

  const classificationCeiling =
    channelClassificationValueId ??
    channelDefaultValueId('classification') ??
    's';

  const menuAnchorRef: RefObject<HTMLElement | null> =
    menuAnchor === 'chip' ? chipAddTriggerRef : toolbarTriggerRef;

  const attributeById = useMemo(() => {
    const map = new Map<string, HubAttribute>();
    for (const attribute of postAttributes ?? postScopedAttributes()) {
      map.set(attribute.id, attribute);
    }
    return map;
  }, [postAttributes]);

  /** Attributes allowed in the compose add menu (Composer display surface). */
  const composableAttributes = useMemo(() => {
    const list: HubAttribute[] = [];
    for (const attribute of attributeById.values()) {
      const binding = postBinding(attribute);
      if (!binding) continue;
      const showWhere = resolvePostShowWhere(
        attribute.id,
        showWhereById,
        binding.showWhere,
      );
      if (postDisplayIncludes(showWhere, 'Composer')) {
        list.push(attribute);
      }
    }
    return list;
  }, [attributeById, showWhereById]);

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

  const clearComposerAttributes = () => {
    setAttachedIds([]);
    setValuesById({});
    setOpenPickerId(null);
    setPendingPickId(null);
  };

  const pickAttribute = (attributeId: string) => {
    if (attachedIds.includes(attributeId)) return;

    const attribute = attributeById.get(attributeId);
    if (!attribute) return;

    const binding = postBinding(attribute);
    const systemProperty = attribute.id === 'classification';
    const valueLocked =
      !systemProperty &&
      Boolean(binding && isPostAttributeLocked(attribute, binding));

    setAttachedIds((current) => [...current, attributeId]);

    if (systemProperty) {
      // Channel default is pre-selected; menu opens so they can pick a lower level.
      setValuesById((current) => ({
        ...current,
        [attributeId]: classificationCeiling,
      }));
      setPendingPickId(null);
      setOpenPickerId(attributeId);
      return;
    }

    if (valueLocked) {
      setValuesById((current) => ({
        ...current,
        [attributeId]: defaultValueForPostAttribute(attribute),
      }));
      return;
    }

    if (!attributeNeedsValuePicker(attribute)) {
      // Free-text types: attach without a value picker.
      setValuesById((current) => ({ ...current, [attributeId]: '' }));
      return;
    }

    // Attribute → value: attach pending, open value menu immediately.
    setValuesById((current) => ({ ...current, [attributeId]: '' }));
    setPendingPickId(attributeId);
    setOpenPickerId(attributeId);
  };

  const confirmValue = (attributeId: string, valueId: string) => {
    if (
      attributeId === 'classification' &&
      !isClassificationAtOrBelow(valueId, classificationCeiling)
    ) {
      return;
    }
    setPendingPickId((current) => (current === attributeId ? null : current));
    setValuesById((current) => ({ ...current, [attributeId]: valueId }));
    setOpenPickerId((current) => (current === attributeId ? null : current));
  };

  const closeValuePicker = (attributeId: string) => {
    setOpenPickerId((current) => (current === attributeId ? null : current));
    setPendingPickId((pending) => {
      if (pending !== attributeId) return pending;
      setAttachedIds((ids) => ids.filter((id) => id !== attributeId));
      setValuesById((vals) => {
        if (vals[attributeId]) return vals;
        const next = { ...vals };
        delete next[attributeId];
        return next;
      });
      return null;
    });
  };

  const handleSend = (body: string) => {
    const confirmedIds = attachedIds.filter((id) => Boolean(valuesById[id]));
    const confirmedValues: Record<string, string> = {};
    for (const id of confirmedIds) {
      confirmedValues[id] = valuesById[id];
    }
    onPost?.({
      body,
      attachedIds: confirmedIds,
      valuesById: confirmedValues,
    });
    clearComposerAttributes();
  };

  const addChipButton = (
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
  );

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

          const valueId = valuesById[attributeId] ?? '';
          const systemProperty = attribute.id === 'classification';
          const locked =
            !systemProperty && isPostAttributeLocked(attribute, binding);
          const pickerOpen = openPickerId === attributeId;

          return (
            <ComposerAttributeChip
              key={attributeId}
              attribute={attribute}
              valueId={valueId}
              locked={locked}
              pickerOpen={pickerOpen}
              classificationMaxValueId={classificationCeiling}
              onOpenPicker={() => setOpenPickerId(attributeId)}
              onClosePicker={() => closeValuePicker(attributeId)}
              onPickValue={(next) => confirmValue(attributeId, next)}
            />
          );
        })}
        {addChipButton}
      </div>
    ) : undefined;

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
      {composerHeader}
      <MessageInput
        placeholder={placeholder}
        width={width}
        stackedBelowRail={Boolean(composerHeader)}
        leadingActions={addAttributeTrigger}
        onSend={onPost ? handleSend : undefined}
      />

      <PostAttributeAddMenu
        open={menuOpen}
        onClose={closeMenu}
        anchorRef={menuAnchorRef}
        attachedIds={attachedIds}
        attributes={composableAttributes}
        onPickAttribute={pickAttribute}
        onCreateNew={onCreateAttribute}
      />
    </>
  );
}
