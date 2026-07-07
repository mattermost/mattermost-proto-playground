import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CloseIcon from '@mattermost/compass-icons/components/close';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ChevronUpIcon from '@mattermost/compass-icons/components/chevron-up';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import LinkVariantOffIcon from '@mattermost/compass-icons/components/link-variant-off';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import EyeOffOutlineIcon from '@mattermost/compass-icons/components/eye-off-outline';
import PlusBoxOutlineIcon from '@mattermost/compass-icons/components/plus-box-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import InfoHint from '@/pages/AttributeManagementHub/_components/InfoHint/InfoHint';
import {
  canReuseValues,
  isPolicyLocked,
  isSourceOwned,
  type AttrValue,
  type HubAttribute,
} from '@/pages/AttributeManagementHub/hubData';
import AttributeSourceField from './AttributeSourceField';
import styles from './DefinitionValues.module.scss';

export interface DefinitionValuesProps {
  attribute: HubAttribute;
  onAddValue: (label: string, asTier?: boolean) => void;
  onAddChild: (parentId: string, label: string) => void;
  onToggleDisabled: (valueId: string) => void;
  onDeleteValue: (valueId: string) => void;
  onReorder: (valueId: string, dir: -1 | 1) => void;
  onLockedAttempt: () => void;
  onReuse: () => void;
  onUnlink: () => void;
  onConnectSource: () => void;
  onManageSource: () => void;
}

/** Ranked-hierarchical tree row (nest, reorder, disable-not-delete, tier badges). */
function TreeRow({
  value,
  depth,
  index,
  siblingCount,
  editable,
  onToggleDisabled,
  onDeleteValue,
  onReorder,
  onAddChild,
}: {
  value: AttrValue;
  depth: number;
  index: number;
  siblingCount: number;
  editable: boolean;
  onToggleDisabled: (id: string) => void;
  onDeleteValue: (id: string) => void;
  onReorder: (id: string, dir: -1 | 1) => void;
  onAddChild: (parentId: string, label: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [adding, setAdding] = useState(false);
  const [childDraft, setChildDraft] = useState('');
  const hasChildren = !!value.children?.length;
  const isTier = value.tier != null;
  const inUse = (value.inUseCount ?? 0) > 0;

  const commitChild = () => {
    if (childDraft.trim()) {
      onAddChild(value.id, childDraft.trim());
      setChildDraft('');
      setAdding(false);
      setExpanded(true);
    }
  };

  return (
    <>
      <div
        className={[
          styles['tree__row'],
          value.disabled && styles['tree__row--disabled'],
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          paddingLeft: `calc(${depth} * var(--spacing-l) + var(--spacing-s))`,
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            className={styles['tree__twist']}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onClick={() => setExpanded((e) => !e)}
          >
            <Icon
              size="16"
              glyph={expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            />
          </button>
        ) : (
          <span className={styles['tree__twist-spacer']} aria-hidden />
        )}

        {editable && (
          <span className={styles['tree__reorder']}>
            <IconButton
              size="X-Small"
              aria-label={`Move ${value.label} up`}
              disabled={index === 0}
              icon={<Icon size="16" glyph={<ChevronUpIcon />} />}
              onClick={() => onReorder(value.id, -1)}
            />
            <IconButton
              size="X-Small"
              aria-label={`Move ${value.label} down`}
              disabled={index === siblingCount - 1}
              icon={<Icon size="16" glyph={<ChevronDownIcon />} />}
              onClick={() => onReorder(value.id, 1)}
            />
            <span className={styles['tree__drag']} aria-hidden>
              <Icon size="16" glyph={<DragVerticalIcon />} />
            </span>
          </span>
        )}

        <span className={styles['tree__label']}>{value.label}</span>

        {isTier ? (
          <LabelTag label={`Ranked · Tier ${value.tier}`} type="Info" size="X-Small" />
        ) : (
          <LabelTag label="Sub-marking (display only)" type="Default" size="X-Small" />
        )}

        {value.disabled && (
          <span className={styles['tree__flag']}>Disabled for new</span>
        )}

        <span className={styles['tree__spacer']} />

        {editable && (
          <div className={styles['tree__actions']}>
            <Button
              emphasis="Tertiary"
              size="X-Small"
              leadingIcon={<Icon size="12" glyph={<PlusBoxOutlineIcon />} />}
              onClick={() => setAdding((v) => !v)}
            >
              Add child
            </Button>
            <InfoHint
              label={value.disabled ? 'Re-enable value' : 'Disable for new assignments'}
              arrow="Bottom"
            >
              <IconButton
                size="X-Small"
                aria-label="Disable value"
                icon={<Icon size="16" glyph={<EyeOffOutlineIcon />} />}
                onClick={() => onToggleDisabled(value.id)}
              />
            </InfoHint>
            <InfoHint
              label={
                inUse
                  ? `In use on ${value.inUseCount} resources — disable instead of deleting`
                  : 'Delete value'
              }
              arrow="Bottom"
            >
              <IconButton
                size="X-Small"
                aria-label="Delete value"
                destructive={!inUse}
                icon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
                onClick={() => onDeleteValue(value.id)}
              />
            </InfoHint>
          </div>
        )}
      </div>

      {editable && adding && (
        <div
          className={styles['tree__child-add']}
          style={{
            paddingLeft: `calc(${depth + 1} * var(--spacing-l) + var(--spacing-s))`,
          }}
        >
          <TextInput
            size="Small"
            placeholder={`Nested marking under ${value.label}`}
            value={childDraft}
            onChange={(e) => setChildDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitChild();
            }}
          />
          <Button
            emphasis="Secondary"
            size="Small"
            disabled={childDraft.trim().length === 0}
            onClick={commitChild}
          >
            Add
          </Button>
          <Button emphasis="Tertiary" size="Small" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </div>
      )}

      {hasChildren &&
        expanded &&
        value.children!.map((child, i) => (
          <TreeRow
            key={child.id}
            value={child}
            depth={depth + 1}
            index={i}
            siblingCount={value.children!.length}
            editable={editable}
            onToggleDisabled={onToggleDisabled}
            onDeleteValue={onDeleteValue}
            onReorder={onReorder}
            onAddChild={onAddChild}
          />
        ))}
    </>
  );
}

/**
 * Adaptive Values control — the third element of the merged Definition panel.
 * - Text → "no preset values" note
 * - Select / Multiselect / Ranked → wrapping chip row (type-and-enter commits)
 * - Ranked-hierarchical → full-width tree
 * Source / link status lives in a footer below the values list.
 */
export default function DefinitionValues({
  attribute,
  onAddValue,
  onAddChild,
  onToggleDisabled,
  onDeleteValue,
  onReorder,
  onLockedAttempt,
  onReuse,
  onUnlink,
  onConnectSource,
  onManageSource,
}: DefinitionValuesProps) {
  const [draft, setDraft] = useState('');
  const sourceOwned = isSourceOwned(attribute);
  const locked = isPolicyLocked(attribute);
  const linked = !!attribute.valuesLink;
  const editable = !sourceOwned && !locked && !linked;
  const isTree = attribute.type === 'Ranked-hierarchical';
  const isRanked = attribute.type === 'Ranked' || isTree;
  const showManualActions =
    !sourceOwned && !linked && attribute.type !== 'Text';

  const valuesFooter = () => {
    if (sourceOwned) {
      return (
        <AttributeSourceField
          attribute={attribute}
          onManage={onManageSource}
        />
      );
    }

    if (linked && attribute.valuesLink) {
      return (
        <div className={styles['values__linked-footer']}>
          <div className={styles['values__linked-copy']}>
            <Icon size="16" glyph={<LinkVariantIcon />} />
            <span>
              Values shared from {attribute.valuesLink.attributeName} ·
              read-only
            </span>
          </div>
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<LinkVariantOffIcon />} />}
            onClick={onUnlink}
          >
            Unlink
          </Button>
        </div>
      );
    }

    if (showManualActions) {
      return (
        <div className={styles['values__source-actions']}>
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<LinkVariantIcon />} />}
            onClick={onConnectSource}
          >
            Connect external source
          </Button>
          {canReuseValues(attribute) && (
            <Button
              emphasis="Tertiary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<LinkVariantIcon />} />}
              onClick={onReuse}
            >
              Reuse values from another attribute
            </Button>
          )}
        </div>
      );
    }

    return null;
  };

  // Text — no enumerated values.
  if (attribute.type === 'Text') {
    return (
      <div className={styles['values']}>
        <p className={styles['values__none']}>
          Text attributes have no preset values — a value is typed in per resource.
        </p>
        {!sourceOwned && (
          <div className={styles['values__source-actions']}>
            <Button
              emphasis="Tertiary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<LinkVariantIcon />} />}
              onClick={onConnectSource}
            >
              Connect external source
            </Button>
          </div>
        )}
        {sourceOwned && (
          <AttributeSourceField
            attribute={attribute}
            onManage={onManageSource}
          />
        )}
      </div>
    );
  }

  const commitDraft = () => {
    if (!draft.trim()) return;
    if (locked) {
      onLockedAttempt();
      return;
    }
    onAddValue(draft.trim());
    setDraft('');
  };

  return (
    <div className={styles['values']}>

      {locked && !sourceOwned && !linked && (
        <SectionNotice
          type="Info"
          icon={<Icon size="20" glyph={<LockOutlineIcon />} />}
          title={`Locked — used by ${attribute.usedByPolicies} ${
            attribute.usedByPolicies === 1 ? 'policy' : 'policies'
          }`}
          description="Editing values would re-evaluate access. Review the policies before making changes."
          primaryButtonLabel="Why is this locked?"
          onPrimaryAction={onLockedAttempt}
        />
      )}

      {isTree ? (
        <div className={styles['values__tree-block']}>
          <p className={styles['values__tree-explainer']}>
            Ranked tiers form the ordered spine. Sub-markings nest beneath a tier
            and are display only — they do not change the rank.
          </p>
          <div className={styles['values__tree']}>
            {attribute.values.map((v, i) => (
              <TreeRow
                key={v.id}
                value={v}
                depth={0}
                index={i}
                siblingCount={attribute.values.length}
                editable={editable}
                onToggleDisabled={onToggleDisabled}
                onDeleteValue={onDeleteValue}
                onReorder={onReorder}
                onAddChild={onAddChild}
              />
            ))}
          </div>
          {editable && (
            <div className={styles['values__tree-add']}>
              <TextInput
                size="Small"
                placeholder="Add a top-level tier"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onAddValue(draft.trim(), true);
                    setDraft('');
                  }
                }}
              />
              <Button
                emphasis="Secondary"
                size="Small"
                leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                disabled={draft.trim().length === 0}
                onClick={() => {
                  onAddValue(draft.trim(), true);
                  setDraft('');
                }}
              >
                Add tier
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className={styles['values__chips-wrap']}>
          <div className={styles['values__chips']}>
            {attribute.values.map((v) => (
            <span
              key={v.id}
              className={[
                styles['values__chip'],
                v.disabled && styles['values__chip--disabled'],
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isRanked && v.tier != null && (
                <span className={styles['values__rank']}>{v.tier}</span>
              )}
              <span className={styles['values__chip-label']}>{v.label}</span>
              {editable && (
                <button
                  type="button"
                  className={styles['values__chip-x']}
                  aria-label={`Remove ${v.label}`}
                  onClick={() =>
                    (v.inUseCount ?? 0) > 0
                      ? onToggleDisabled(v.id)
                      : onDeleteValue(v.id)
                  }
                >
                  <Icon size="12" glyph={<CloseIcon />} />
                </button>
              )}
            </span>
          ))}
          {attribute.values.length === 0 && (
            <span className={styles['values__none']}>
              Add a value and press Enter.
            </span>
          )}
          {editable && (
            <input
              className={styles['values__input']}
              placeholder={attribute.values.length === 0 ? 'Add a value…' : '+ Add'}
              value={draft}
              aria-label="Add a value"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  if (draft.trim()) {
                    e.preventDefault();
                    commitDraft();
                  }
                }
              }}
              onBlur={commitDraft}
            />
          )}
          </div>
        </div>
      )}

      {valuesFooter()}
    </div>
  );
}
