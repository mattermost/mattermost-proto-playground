import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import ClassificationPill from '@/pages/attribute-system/ClassificationPill';
import type { HubAttribute, AttrType } from '@/pages/AttributeManagementHub/hubData';
import { takesValueListForType } from '@/pages/AttributeManagementHub/hubData';
import ChannelAttributeLabelMenu from './ChannelAttributeLabelMenu';
import {
  channelBinding,
  channelScopedAttributes,
  channelValueLabel,
  effectiveChannelBinding,
  effectiveCustomBinding,
  isChannelInfoLabelLocked,
  isChannelInfoValueLocked,
  type ChannelBindingOverride,
  type ChannelCustomAttribute,
  type ChannelDemoState,
  type EffectiveChannelBinding,
} from './channelViewData';
import { CLASSIFICATION_PICKER_OPTIONS } from './postViewData';
import styles from './PostAttributesPanel.module.scss';

export interface ChannelAttributesPanelProps {
  channel: ChannelDemoState;
  readOnly?: boolean;
  onUpdateCustomAttribute?: (
    id: string,
    patch: Partial<Pick<ChannelCustomAttribute, 'name' | 'selectedValueId'>>,
  ) => void;
  onAddCustomAttributeValue?: (id: string, label: string) => void;
  onRemoveAttribute?: (attributeId: string) => void;
  onRemoveCustomAttribute?: (id: string) => void;
  onUpdateAttributeValue?: (attributeId: string, valueId: string) => void;
  onPatchBindingOverride?: (
    attributeId: string,
    patch: Partial<ChannelBindingOverride>,
  ) => void;
  onEditAttribute?: (attributeId: string) => void;
}

const CLASSIFICATION_LOCK_TOOLTIP = 'Cannot be changed after set';
const CLASSIFICATION_LOCK_TOOLTIP_GAP = 8;
const CLASSIFICATION_LOCK_TOOLTIP_Z_INDEX = 1100;
const CLASSIFICATION_LOCK_TOOLTIP_ESTIMATED_HEIGHT = 36;

type ClassificationLockTooltipPlacement = 'above' | 'below';

function ClassificationPillLockHint({ children }: { children: ReactNode }) {
  const hintRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [placement, setPlacement] =
    useState<ClassificationLockTooltipPlacement>('above');
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  const updateCoords = useCallback(() => {
    const hint = hintRef.current;
    if (!hint) return;

    const rect = hint.getBoundingClientRect();
    const bubbleHeight =
      bubbleRef.current?.offsetHeight ??
      CLASSIFICATION_LOCK_TOOLTIP_ESTIMATED_HEIGHT;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const nextPlacement: ClassificationLockTooltipPlacement =
      spaceAbove >= bubbleHeight + CLASSIFICATION_LOCK_TOOLTIP_GAP ||
      spaceAbove >= spaceBelow
        ? 'above'
        : 'below';

    setPlacement(nextPlacement);
    setCoords({
      left: rect.left + rect.width / 2,
      top:
        nextPlacement === 'above'
          ? rect.top - CLASSIFICATION_LOCK_TOOLTIP_GAP
          : rect.bottom + CLASSIFICATION_LOCK_TOOLTIP_GAP,
    });
  }, []);

  useLayoutEffect(() => {
    if (!hovered) return;
    updateCoords();
  }, [hovered, updateCoords]);

  useEffect(() => {
    if (!hovered) return;

    const dismiss = () => setHovered(false);
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);

    return () => {
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  }, [hovered]);

  const translate =
    placement === 'above' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)';
  const bubbleStyle: CSSProperties | undefined = coords
    ? {
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        zIndex: CLASSIFICATION_LOCK_TOOLTIP_Z_INDEX,
        transform: `${translate} scale(${hovered ? 1 : 0.9})`,
        transformOrigin:
          placement === 'above' ? 'bottom center' : 'top center',
        opacity: hovered ? 1 : 0,
        transition: hovered
          ? `opacity var(--duration-quick) var(--ease-entrance), transform var(--duration-quick) var(--ease-entrance)`
          : `opacity var(--duration-quick) var(--ease-exit), transform var(--duration-quick) var(--ease-exit)`,
      }
    : undefined;

  const tooltipBubble =
    hovered &&
    coords &&
    createPortal(
      <span
        ref={bubbleRef}
        className={styles['panel__classification-hint-bubble']}
        style={bubbleStyle}
        aria-hidden
      >
        <Tooltip
          label={CLASSIFICATION_LOCK_TOOLTIP}
          arrow={placement === 'above' ? 'Bottom' : 'Top'}
        />
      </span>,
      document.body,
    );

  return (
    <span
      ref={hintRef}
      className={styles['panel__classification-hint']}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setCoords(null);
      }}
    >
      {children}
      {tooltipBubble}
    </span>
  );
}

function catalogValueUsesChip(attribute: HubAttribute): boolean {
  if (attribute.id === 'classification') return false;
  return takesValueListForType(attribute.type);
}

function customValueUsesChip(type: AttrType): boolean {
  return takesValueListForType(type);
}

function ValueActiveRow({
  open,
  children,
}: {
  open: boolean;
  children: (active: boolean) => ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [rowFocused, setRowFocused] = useState(false);
  const active = open || rowFocused;

  const handleRowBlur = () => {
    requestAnimationFrame(() => {
      if (!rowRef.current?.contains(document.activeElement)) {
        setRowFocused(false);
      }
    });
  };

  return (
    <div
      ref={rowRef}
      className={[
        styles['panel__value-active-row'],
        open ? styles['panel__value-active-row--open'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onFocus={() => setRowFocused(true)}
      onBlur={handleRowBlur}
    >
      {children(active)}
    </div>
  );
}

function ChannelAttributeLabel({
  name,
  locked,
  readOnly = false,
  isClassification,
  attribute,
  binding,
  onPatchBinding,
  onDuplicate,
  onEditAttribute,
}: {
  name: string;
  locked: boolean;
  readOnly?: boolean;
  isClassification: boolean;
  attribute?: HubAttribute;
  binding: EffectiveChannelBinding;
  onPatchBinding: (patch: Partial<EffectiveChannelBinding>) => void;
  onDuplicate?: () => void;
  onEditAttribute?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => setMenuOpen(false);

  if (readOnly) {
    return (
      <div className={styles['panel__label-cell']}>
        <span className={styles['panel__label-row']}>
          <span className={styles['panel__label']}>{name}</span>
          {locked && (
            <span className={styles['panel__label-lock']} aria-hidden>
              <Icon size="12" glyph={<LockOutlineIcon />} />
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className={styles['panel__label-cell']}>
      <button
        ref={triggerRef}
        type="button"
        className={styles['panel__label-trigger']}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`${name} actions`}
        onClick={() => setMenuOpen(true)}
      >
        <span className={styles['panel__label-row']}>
          <span className={styles['panel__label']}>{name}</span>
          {locked && (
            <span className={styles['panel__label-lock']} aria-hidden>
              <Icon size="12" glyph={<LockOutlineIcon />} />
            </span>
          )}
        </span>
      </button>
      <FixedPopoverMenu
        open={menuOpen}
        onClose={closeMenu}
        anchorRef={triggerRef}
        align="start"
        minWidthFloor={220}
      >
        <ChannelAttributeLabelMenu
          name={name}
          locked={locked}
          isClassification={isClassification}
          attribute={attribute}
          binding={binding}
          onPatchBinding={onPatchBinding}
          onDuplicate={onDuplicate}
          onEditAttribute={onEditAttribute}
          onClose={closeMenu}
        />
      </FixedPopoverMenu>
    </div>
  );
}

function ChannelAttributeValue({
  attribute,
  valueId,
  locked,
  readOnly = false,
  onChange,
  onRemove,
}: {
  attribute: HubAttribute;
  valueId: string;
  locked: boolean;
  readOnly?: boolean;
  onChange: (valueId: string) => void;
  onRemove?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const label = channelValueLabel(attribute, valueId);

  const close = () => setOpen(false);
  const pick = (next: string) => {
    onChange(next);
    close();
  };

  const staticDisplay = locked || readOnly;

  if (attribute.id === 'classification') {
    const pill = (
      <ClassificationPill valueId={valueId} label={label} locked={false} />
    );

    return (
      <span className={styles['panel__value-display']}>
        {locked ? (
          <ClassificationPillLockHint>{pill}</ClassificationPillLockHint>
        ) : (
          pill
        )}
      </span>
    );
  }

  const showChip = catalogValueUsesChip(attribute);

  if (staticDisplay) {
    if (showChip) {
      return (
        <span className={styles['panel__value-display']}>
          <Chip size="Small">{label}</Chip>
        </span>
      );
    }
    return (
      <span
        className={[
          styles['panel__value-display'],
          styles['panel__value-text--locked'],
        ].join(' ')}
      >
        {label}
      </span>
    );
  }

  const handleRemove = onRemove
    ? () => {
        close();
        onRemove();
      }
    : undefined;

  return (
    <>
      <ValueActiveRow open={open}>
        {(active) => {
          const showRemove = Boolean(handleRemove) && active;

          if (showChip) {
            return (
              <Chip
                size="Small"
                as="div"
                className={styles['panel__value-chip']}
                onRemove={
                  showRemove
                    ? (event) => {
                        event.stopPropagation();
                        handleRemove?.();
                      }
                    : undefined
                }
                removeLabel={`Remove ${attribute.name} from channel`}
              >
                <button
                  ref={triggerRef}
                  type="button"
                  className={styles['panel__value-chip-label']}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  aria-label={`${attribute.name}: ${label}`}
                  onClick={() => setOpen(true)}
                >
                  {label}
                </button>
              </Chip>
            );
          }

          return (
            <>
              <button
                ref={triggerRef}
                type="button"
                className={styles['panel__value-trigger']}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={`${attribute.name}: ${label}`}
                onClick={() => setOpen(true)}
              >
                <span className={styles['panel__value-text']}>{label}</span>
              </button>
              {handleRemove && (
                <button
                  type="button"
                  className={[
                    styles['panel__value-remove'],
                    showRemove ? styles['panel__value-remove--visible'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={`Remove ${attribute.name} from channel`}
                  aria-hidden={!showRemove}
                  tabIndex={showRemove ? 0 : -1}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemove();
                  }}
                >
                  <Icon size="12" glyph={<CloseCircleIcon />} />
                </button>
              )}
            </>
          );
        }}
      </ValueActiveRow>
      <FixedPopoverMenu
        open={open}
        onClose={close}
        anchorRef={triggerRef}
        align="start"
        minWidthFloor={200}
      >
        <PopoverMenu>
          {attribute.id === 'classification'
            ? CLASSIFICATION_PICKER_OPTIONS.map((option) => (
                <MenuItem
                  key={option.id}
                  label={option.label}
                  leadingElement={false}
                  trailingElement={option.id === valueId}
                  onClick={() => pick(option.id)}
                />
              ))
            : attribute.values.map((value) => (
                <MenuItem
                  key={value.id}
                  label={value.label}
                  leadingElement={false}
                  trailingElement={value.id === valueId}
                  onClick={() => pick(value.id)}
                />
              ))}
        </PopoverMenu>
      </FixedPopoverMenu>
    </>
  );
}

function CustomAttributeValue({
  attribute,
  readOnly = false,
  onSelectValue,
  onAddValue,
  onRemove,
}: {
  attribute: ChannelCustomAttribute;
  readOnly?: boolean;
  onSelectValue: (valueId: string) => void;
  onAddValue: (label: string) => void;
  onRemove?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const label =
    attribute.values.find((value) => value.id === attribute.selectedValueId)
      ?.label ?? 'Add value…';

  const close = () => setOpen(false);
  const pick = (valueId: string) => {
    onSelectValue(valueId);
    close();
  };

  const commitDraft = () => {
    onAddValue(draft);
    setDraft('');
    close();
  };

  const showChip =
    customValueUsesChip(attribute.type) && Boolean(attribute.selectedValueId);

  if (readOnly) {
    if (showChip) {
      return (
        <span className={styles['panel__value-display']}>
          <Chip size="Small">{label}</Chip>
        </span>
      );
    }
    return (
      <span
        className={[
          styles['panel__value-display'],
          attribute.selectedValueId ? '' : styles['panel__value-text--locked'],
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {attribute.selectedValueId ? label : '—'}
      </span>
    );
  }

  const handleRemove = onRemove
    ? () => {
        close();
        onRemove();
      }
    : undefined;

  return (
    <>
      <ValueActiveRow open={open}>
        {(active) => {
          const showRemove = Boolean(handleRemove) && active;

          if (showChip) {
            return (
              <Chip
                size="Small"
                as="div"
                className={styles['panel__value-chip']}
                onRemove={
                  showRemove
                    ? (event) => {
                        event.stopPropagation();
                        handleRemove?.();
                      }
                    : undefined
                }
                removeLabel={`Remove ${attribute.name} from channel`}
              >
                <button
                  ref={triggerRef}
                  type="button"
                  className={styles['panel__value-chip-label']}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  aria-label={`${attribute.name}: ${label}`}
                  onClick={() => setOpen(true)}
                >
                  {label}
                </button>
              </Chip>
            );
          }

          return (
            <>
              <button
                ref={triggerRef}
                type="button"
                className={[
                  styles['panel__value-trigger'],
                  !attribute.selectedValueId
                    ? styles['panel__value-trigger--placeholder']
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={`${attribute.name}: ${label}`}
                onClick={() => setOpen(true)}
              >
                <span className={styles['panel__value-text']}>{label}</span>
              </button>
              {handleRemove && (
                <button
                  type="button"
                  className={[
                    styles['panel__value-remove'],
                    showRemove ? styles['panel__value-remove--visible'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={`Remove ${attribute.name} from channel`}
                  aria-hidden={!showRemove}
                  tabIndex={showRemove ? 0 : -1}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemove();
                  }}
                >
                  <Icon size="12" glyph={<CloseCircleIcon />} />
                </button>
              )}
            </>
          );
        }}
      </ValueActiveRow>
      <FixedPopoverMenu
        open={open}
        onClose={close}
        anchorRef={triggerRef}
        align="start"
        minWidthFloor={200}
      >
        <PopoverMenu>
          {attribute.values.map((value) => (
            <MenuItem
              key={value.id}
              label={value.label}
              leadingElement={false}
              trailingElement={value.id === attribute.selectedValueId}
              onClick={() => pick(value.id)}
            />
          ))}
          <div className={styles['panel__value-add']}>
            <input
              type="text"
              className={styles['panel__value-add-input']}
              placeholder="Add value…"
              aria-label={`Add value for ${attribute.name}`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitDraft();
                }
              }}
            />
          </div>
        </PopoverMenu>
      </FixedPopoverMenu>
    </>
  );
}

export default function ChannelAttributesPanel({
  channel,
  readOnly = false,
  onUpdateCustomAttribute,
  onAddCustomAttributeValue,
  onRemoveAttribute,
  onRemoveCustomAttribute,
  onUpdateAttributeValue,
  onPatchBindingOverride,
  onEditAttribute,
}: ChannelAttributesPanelProps) {
  const attributes = useMemo(() => channelScopedAttributes(), []);
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(channel.attributes.map((row) => [row.attributeId, row.valueId])),
  );

  useEffect(() => {
    setDraft(
      Object.fromEntries(channel.attributes.map((row) => [row.attributeId, row.valueId])),
    );
  }, [channel.attributes]);

  const instanceById = useMemo(
    () => new Map(channel.attributes.map((row) => [row.attributeId, row])),
    [channel.attributes],
  );

  const updateValue = (attributeId: string, valueId: string) => {
    setDraft((current) => ({ ...current, [attributeId]: valueId }));
    onUpdateAttributeValue?.(attributeId, valueId);
  };

  return (
    <section
      className={[styles['panel'], styles['panel--thread']].join(' ')}
      aria-label="Channel attributes"
    >
      <div className={styles['panel__rows']}>
        {attributes
          .filter((attribute) => instanceById.has(attribute.id))
          .map((attribute) => {
            const binding = channelBinding(attribute);
            if (!binding) return null;

            const seed = instanceById.get(attribute.id);
            const valueId = draft[attribute.id] ?? seed?.valueId ?? '';
            const labelLocked = isChannelInfoLabelLocked(attribute, binding);
            const valueLocked = isChannelInfoValueLocked(attribute, binding);
            const overrides = channel.bindingOverrides[attribute.id] ?? {};
            const effectiveBinding = effectiveChannelBinding(
              attribute,
              binding,
              overrides,
            );

            return (
              <div key={attribute.id} className={styles['panel__row']}>
                <ChannelAttributeLabel
                  name={overrides.name ?? attribute.name}
                  locked={labelLocked}
                  readOnly={readOnly}
                  isClassification={attribute.id === 'classification'}
                  attribute={attribute}
                  binding={effectiveBinding}
                  onPatchBinding={
                    readOnly
                      ? () => {}
                      : (patch) => onPatchBindingOverride?.(attribute.id, patch)
                  }
                  onDuplicate={() => {
                    console.log('Duplicate attribute', attribute.id);
                  }}
                  onEditAttribute={
                    readOnly || !onEditAttribute
                      ? undefined
                      : () => onEditAttribute(attribute.id)
                  }
                />
                <div className={styles['panel__value']}>
                  <ChannelAttributeValue
                    attribute={attribute}
                    valueId={valueId}
                    locked={valueLocked}
                    readOnly={readOnly}
                    onChange={(next) => updateValue(attribute.id, next)}
                    onRemove={
                      readOnly || labelLocked
                        ? undefined
                        : () => onRemoveAttribute?.(attribute.id)
                    }
                  />
                </div>
              </div>
            );
          })}
        {channel.customAttributes.map((attribute) => {
          const overrides = channel.bindingOverrides[attribute.id] ?? {};
          const effectiveBinding = effectiveCustomBinding(overrides);

          return (
            <div key={attribute.id} className={styles['panel__row']}>
              <ChannelAttributeLabel
                name={attribute.name}
                locked={false}
                readOnly={readOnly}
                isClassification={false}
                binding={effectiveBinding}
                onPatchBinding={
                  readOnly
                    ? () => {}
                    : (patch) => onPatchBindingOverride?.(attribute.id, patch)
                }
                onDuplicate={() => {
                  console.log('Duplicate attribute', attribute.id);
                }}
                onEditAttribute={
                  readOnly || !onEditAttribute
                    ? undefined
                    : () => onEditAttribute(attribute.id)
                }
              />
              <div className={styles['panel__value']}>
                <CustomAttributeValue
                  attribute={attribute}
                  readOnly={readOnly}
                  onSelectValue={(valueId) =>
                    onUpdateCustomAttribute?.(attribute.id, { selectedValueId: valueId })
                  }
                  onAddValue={(label) =>
                    onAddCustomAttributeValue?.(attribute.id, label)
                  }
                  onRemove={
                    readOnly ? undefined : () => onRemoveCustomAttribute?.(attribute.id)
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
