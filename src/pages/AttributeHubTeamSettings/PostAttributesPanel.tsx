import { useEffect, useMemo, useRef, useState } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import Select from '@/components/ui/Select/Select';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuDivider,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import ClassificationPill from '@/pages/attribute-system/ClassificationPill';
import type { HubAttribute } from '@/pages/AttributeManagementHub/hubData';
import {
  CLASSIFICATION_PICKER_OPTIONS,
  customAttributeValueLabel,
  isPostAttributeLocked,
  postBinding,
  postScopedAttributes,
  valueLabel,
  type PostCustomAttribute,
  type ThreadDemoPost,
} from './postViewData';
import styles from './PostAttributesPanel.module.scss';

export interface PostAttributesPanelProps {
  post: ThreadDemoPost;
  /** Inline rows under the thread root post — no section heading or intro. */
  variant?: 'default' | 'thread';
  onUpdateCustomAttribute?: (
    id: string,
    patch: Partial<Pick<PostCustomAttribute, 'name' | 'selectedValueId'>>,
  ) => void;
  onAddCustomAttributeValue?: (id: string, label: string) => void;
  onRemoveAttribute?: (attributeId: string) => void;
  onRemoveCustomAttribute?: (id: string) => void;
  onRenameCustomAttribute?: (id: string, name: string) => void;
}

function ThreadAttributeLabel({
  name,
  locked,
  canRename,
  onRemove,
  onRename,
}: {
  name: string;
  locked: boolean;
  canRename: boolean;
  onRemove?: () => void;
  onRename?: (name: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!editing) {
      setDraft(name);
    }
  }, [name, editing]);

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  const commitRename = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== name) {
      onRename?.(trimmed);
    }
    setEditing(false);
  };

  const cancelRename = () => {
    setDraft(name);
    setEditing(false);
  };

  if (locked) {
    return (
      <span className={styles['panel__label-row']}>
        <span className={styles['panel__label']}>{name}</span>
        <span className={styles['panel__label-lock']} aria-hidden>
          <Icon size="12" glyph={<LockOutlineIcon />} />
        </span>
      </span>
    );
  }

  const showRename = canRename && onRename;
  const showRemove = Boolean(onRemove);
  if (!showRename && !showRemove) {
    return <span className={styles['panel__label']}>{name}</span>;
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        className={styles['panel__label-input']}
        value={draft}
        aria-label="Attribute name"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commitRename}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commitRename();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            cancelRename();
          }
        }}
      />
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles['panel__label-trigger']}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`${name} actions`}
        onClick={() => setMenuOpen((current) => !current)}
      >
        {name}
      </button>
      <FixedPopoverMenu
        open={menuOpen}
        onClose={closeMenu}
        anchorRef={triggerRef}
        align="start"
        minWidthFloor={200}
      >
        <PopoverMenu aria-label={`${name} actions`}>
          {showRename && (
            <MenuItem
              label="Rename"
              leadingVisual={<Icon size="16" glyph={<PencilOutlineIcon />} />}
              onClick={() => {
                closeMenu();
                setEditing(true);
              }}
            />
          )}
          {showRename && showRemove && <PopoverMenuDivider />}
          {showRemove && (
            <MenuItem
              label="Remove from post"
              destructive
              leadingVisual={
                <Icon size="16" glyph={<TrashCanOutlineIcon />} />
              }
              onClick={() => {
                onRemove?.();
                closeMenu();
              }}
            />
          )}
        </PopoverMenu>
      </FixedPopoverMenu>
    </>
  );
}

function DefaultAttributeValue({
  attribute,
  valueId,
  locked,
  onChange,
}: {
  attribute: HubAttribute;
  valueId: string;
  locked: boolean;
  onChange: (valueId: string) => void;
}) {
  const label = valueLabel(attribute, valueId);

  if (attribute.id === 'classification') {
    return (
      <ClassificationPill valueId={valueId} label={label} locked={locked} />
    );
  }

  if (locked) {
    if (attribute.type === 'Multiselect') {
      return <Chip size="Small">{label}</Chip>;
    }

    return (
      <Select
        className={styles['panel__select']}
        size="Small"
        value={valueId}
        locked
        disabled
        aria-label={attribute.name}
      >
        {attribute.values.map((value) => (
          <option key={value.id} value={value.id}>
            {value.label}
          </option>
        ))}
      </Select>
    );
  }

  return (
    <Select
      className={styles['panel__select']}
      size="Small"
      value={valueId}
      aria-label={attribute.name}
      onChange={(event) => onChange(event.target.value)}
    >
      {attribute.values.map((value) => (
        <option key={value.id} value={value.id}>
          {value.label}
        </option>
      ))}
    </Select>
  );
}

function ThreadAttributeValue({
  attribute,
  valueId,
  locked,
  onChange,
}: {
  attribute: HubAttribute;
  valueId: string;
  locked: boolean;
  onChange: (valueId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const label = valueLabel(attribute, valueId);

  const closeMenu = () => setOpen(false);

  const pickValue = (nextValueId: string) => {
    onChange(nextValueId);
    closeMenu();
  };

  if (attribute.id === 'classification') {
    if (locked) {
      return (
        <span className={styles['panel__value-display']}>
          <ClassificationPill valueId={valueId} label={label} locked />
        </span>
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
          onClick={() => setOpen((current) => !current)}
        >
          <ClassificationPill valueId={valueId} label={label} />
        </button>
        <FixedPopoverMenu
          open={open}
          onClose={closeMenu}
          anchorRef={triggerRef}
          align="start"
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
    );
  }

  if (locked) {
    return (
      <span className={styles['panel__value-text--locked']} aria-label={attribute.name}>
        {label}
      </span>
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
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      <FixedPopoverMenu
        open={open}
        onClose={closeMenu}
        anchorRef={triggerRef}
        align="start"
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
  );
}

function CustomAttributeValue({
  attribute,
  onSelectValue,
  onAddValue,
}: {
  attribute: PostCustomAttribute;
  onSelectValue: (valueId: string) => void;
  onAddValue: (label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const label = customAttributeValueLabel(attribute);

  const closeMenu = () => {
    setOpen(false);
    setDraft('');
  };

  const pickValue = (valueId: string) => {
    onSelectValue(valueId);
    closeMenu();
  };

  const commitDraft = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAddValue(trimmed);
    closeMenu();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[
          styles['panel__value-trigger'],
          !attribute.selectedValueId ? styles['panel__value-trigger--placeholder'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${attribute.name}: ${label}`}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      <FixedPopoverMenu
        open={open}
        onClose={closeMenu}
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
              onClick={() => pickValue(value.id)}
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

export default function PostAttributesPanel({
  post,
  variant = 'default',
  onUpdateCustomAttribute,
  onAddCustomAttributeValue,
  onRemoveAttribute,
  onRemoveCustomAttribute,
  onRenameCustomAttribute,
}: PostAttributesPanelProps) {
  const attributes = useMemo(() => postScopedAttributes(), []);
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(post.attributes.map((row) => [row.attributeId, row.valueId])),
  );

  useEffect(() => {
    setDraft(
      Object.fromEntries(post.attributes.map((row) => [row.attributeId, row.valueId])),
    );
  }, [post.attributes]);

  const instanceById = useMemo(
    () => new Map(post.attributes.map((row) => [row.attributeId, row])),
    [post.attributes],
  );

  const updateValue = (attributeId: string, valueId: string) => {
    setDraft((current) => ({ ...current, [attributeId]: valueId }));
  };

  const panelClass = [
    styles['panel'],
    variant === 'thread' ? styles['panel--thread'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const ValueComponent =
    variant === 'thread' ? ThreadAttributeValue : DefaultAttributeValue;

  return (
    <section className={panelClass} aria-label="Post attributes">
      {variant === 'default' && (
        <>
          <h3 className={styles['panel__heading']}>Post attributes</h3>
          <p className={styles['panel__intro']}>
            Values on Leonard Riley&apos;s post.
          </p>
        </>
      )}
      <div className={styles['panel__rows']}>
        {attributes
          .filter((attribute) => {
            if (variant !== 'thread') return true;
            if (attribute.id === 'classification') return false;
            return instanceById.has(attribute.id);
          })
          .map((attribute) => {
          const binding = postBinding(attribute);
          if (!binding) return null;

          const seed = instanceById.get(attribute.id);
          const valueId = draft[attribute.id] ?? seed?.valueId ?? '';
          const locked = isPostAttributeLocked(attribute, binding);

          return (
            <div key={attribute.id} className={styles['panel__row']}>
              {variant === 'thread' ? (
                <ThreadAttributeLabel
                  name={attribute.name}
                  locked={locked}
                  canRename={false}
                  onRemove={
                    locked ? undefined : () => onRemoveAttribute?.(attribute.id)
                  }
                />
              ) : (
                <span className={styles['panel__label']}>{attribute.name}</span>
              )}
              <div className={styles['panel__value']}>
                <ValueComponent
                  attribute={attribute}
                  valueId={valueId}
                  locked={locked}
                  onChange={(next) => updateValue(attribute.id, next)}
                />
              </div>
            </div>
          );
        })}
        {variant === 'thread' &&
          (post.customAttributes ?? []).map((attribute) => (
            <div key={attribute.id} className={styles['panel__row']}>
              <ThreadAttributeLabel
                name={attribute.name}
                locked={false}
                canRename
                onRename={(name) =>
                  onRenameCustomAttribute?.(attribute.id, name)
                }
                onRemove={() => onRemoveCustomAttribute?.(attribute.id)}
              />
              <div className={styles['panel__value']}>
                <CustomAttributeValue
                  attribute={attribute}
                  onSelectValue={(valueId) =>
                    onUpdateCustomAttribute?.(attribute.id, { selectedValueId: valueId })
                  }
                  onAddValue={(label) =>
                    onAddCustomAttributeValue?.(attribute.id, label)
                  }
                />
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
