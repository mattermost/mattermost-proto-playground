import { useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ChevronUpIcon from '@mattermost/compass-icons/components/chevron-up';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import PlusBoxOutlineIcon from '@mattermost/compass-icons/components/plus-box-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import {
  isPolicyLocked,
  isSourceOwned,
  type AttrValue,
  type HubAttribute,
} from '@/pages/AttributeManagementHub/hubData';
import MvpManagedSourceBar from '@/pages/AttributeHubMVP/_components/MvpManagedSourceBar';
import ValueEditorPopover from './ValueEditorPopover';
import ColoredRankedInputChip from '@/components/ui/ColoredRankedInputChip/ColoredRankedInputChip';
import {
  comparesRank,
  displayType,
  isTreeType,
  optionColorScheme,
} from './simplifiedModel';
import styles from './DefinitionValues.module.scss';

export interface DefinitionValuesProps {
  attribute: HubAttribute;
  onAddValue: (label: string, asTier?: boolean) => void;
  onAddChild: (parentId: string, label: string) => void;
  onToggleDisabled: (valueId: string) => void;
  onDeleteValue: (valueId: string) => void;
  onReorder: (valueId: string, dir: -1 | 1) => void;
  onRelabel: (valueId: string, label: string) => void;
  onSetRank: (valueId: string, tier: number) => void;
  onLockedAttempt: () => void;
  onConnectSource: () => void;
  onManageSource: () => void;
}

/** Whether a tier is referenced by an access policy (demo heuristic). */
function tierInPolicy(attribute: HubAttribute, value: AttrValue): boolean {
  if (attribute.usedByPolicies === 0) return false;
  // In this demo the two lowest-labelled protected tiers gate policies.
  return value.id === 'protected-b' || value.id === 'cl-3' || value.tier === 3;
}

function renderOptionChip(
  value: AttrValue,
  {
    ranked,
    editable,
    active,
    onOpen,
  }: {
    ranked: boolean;
    editable: boolean;
    active?: boolean;
    onOpen: (value: AttrValue, isRanked: boolean, el: HTMLElement) => void;
  },
) {
  const scheme = optionColorScheme(value.id);
  const rank = ranked && value.tier != null ? value.tier : undefined;

  return (
    <ColoredRankedInputChip
      label={value.label}
      rank={rank}
      scheme={scheme}
      disabled={value.disabled}
      active={active}
      onClick={
        editable ? (e) => onOpen(value, ranked, e.currentTarget) : undefined
      }
    />
  );
}

/** Tree row for Ranked-hierarchical / Hierarchical types. */
function TreeRow({
  attribute,
  value,
  depth,
  index,
  siblingCount,
  editable,
  ranked,
  tierCount,
  onToggleDisabled,
  onDeleteValue,
  onReorder,
  onAddChild,
  onOpenEditor,
}: {
  attribute: HubAttribute;
  value: AttrValue;
  depth: number;
  index: number;
  siblingCount: number;
  editable: boolean;
  ranked: boolean;
  tierCount: number;
  onToggleDisabled: (id: string) => void;
  onDeleteValue: (id: string) => void;
  onReorder: (id: string, dir: -1 | 1) => void;
  onAddChild: (parentId: string, label: string) => void;
  onOpenEditor: (value: AttrValue, ranked: boolean, el: HTMLElement) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [adding, setAdding] = useState(false);
  const [childDraft, setChildDraft] = useState('');
  const hasChildren = !!value.children?.length;
  const isTier = value.tier != null;
  const inPolicy = tierInPolicy(attribute, value);

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
        style={{ paddingLeft: `calc(${depth} * var(--spacing-l) + var(--spacing-s))` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className={styles['tree__twist']}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onClick={() => setExpanded((e) => !e)}
          >
            <Icon size="16" glyph={expanded ? <ChevronDownIcon /> : <ChevronRightIcon />} />
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

        {renderOptionChip(value, {
          ranked: ranked && isTier,
          editable,
          onOpen: onOpenEditor,
        })}

        {ranked && isTier && (
          <span
            className={[
              styles['tree__policy'],
              inPolicy ? '' : styles['tree__policy--unused'],
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Icon size="12" glyph={<ShieldOutlineIcon />} />
            {inPolicy ? 'Used in a policy' : 'Not in a policy'}
          </span>
        )}

        {value.disabled && (
          <span className={styles['tree__flag']}>Deactivated</span>
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
          </div>
        )}
      </div>

      {editable && adding && (
        <div
          className={styles['tree__child-add']}
          style={{ paddingLeft: `calc(${depth + 1} * var(--spacing-l) + var(--spacing-s))` }}
        >
          <TextInput
            size="Small"
            placeholder={`Nested option under ${value.label}`}
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
            attribute={attribute}
            value={child}
            depth={depth + 1}
            index={i}
            siblingCount={value.children!.length}
            editable={editable}
            ranked={ranked}
            tierCount={tierCount}
            onToggleDisabled={onToggleDisabled}
            onDeleteValue={onDeleteValue}
            onReorder={onReorder}
            onAddChild={onAddChild}
            onOpenEditor={onOpenEditor}
          />
        ))}
    </>
  );
}

/**
 * Adaptive Options control (Simplified). "Options" is the list of allowed
 * choices; clicking an option opens the rich editor popover. Ranked-
 * hierarchical shows tier + policy-usage per row; Hierarchical is a rank-
 * agnostic tree. Value linking is gone — replaced by per-resource naming.
 */
export default function DefinitionValues({
  attribute,
  onAddValue,
  onAddChild,
  onToggleDisabled,
  onDeleteValue,
  onReorder,
  onRelabel,
  onSetRank,
  onLockedAttempt,
  onConnectSource,
  onManageSource,
}: DefinitionValuesProps) {
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState<{
    value: AttrValue;
    ranked: boolean;
  } | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);

  const sourceOwned = isSourceOwned(attribute);
  const locked = isPolicyLocked(attribute);
  const editable = !sourceOwned && !locked;
  const type = displayType(attribute);
  const isTree = isTreeType(type);
  const ranked = comparesRank(type);
  const tierCount = attribute.values.filter((v) => v.tier != null).length;
  const showConnect = !sourceOwned && type !== 'Text';

  const openEditor = (value: AttrValue, isRanked: boolean, el: HTMLElement) => {
    anchorRef.current = el;
    setEditing({ value, ranked: isRanked });
  };

  const managedSourceBar = sourceOwned ? (
    <MvpManagedSourceBar
      attribute={attribute}
      layout="in-options"
      onManageConnection={onManageSource}
    />
  ) : null;

  const valuesFooter = () => {
    if (sourceOwned) {
      return managedSourceBar;
    }
    if (showConnect) {
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
        </div>
      );
    }
    return null;
  };

  // Text — no enumerated options.
  if (type === 'Text') {
    return (
      <div className={styles['values']}>
        <p className={styles['values__none']}>
          Text attributes have no preset options — a value is typed in per resource.
        </p>
        {showConnect && (
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
        {managedSourceBar}
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
      {locked && !sourceOwned && (
        <SectionNotice
          type="Info"
          icon={<Icon size="20" glyph={<LockOutlineIcon />} />}
          title={`Locked — used by ${attribute.usedByPolicies} ${
            attribute.usedByPolicies === 1 ? 'policy' : 'policies'
          }`}
          description="Editing options would re-evaluate access. Review the policies before making changes."
          primaryButtonLabel="Why is this locked?"
          onPrimaryAction={onLockedAttempt}
        />
      )}

      {isTree ? (
        <div className={styles['values__tree-block']}>
          <p className={styles['values__tree-explainer']}>
            {ranked
              ? 'Every tier is ranked and can be used in an access policy. Nested options group beneath a tier; the badge shows each tier’s policy usage.'
              : 'A rank-agnostic tree — options are organized hierarchically, but rank is never compared.'}
          </p>
          <div className={styles['values__tree']}>
            {attribute.values.map((v, i) => (
              <TreeRow
                key={v.id}
                attribute={attribute}
                value={v}
                depth={0}
                index={i}
                siblingCount={attribute.values.length}
                editable={editable}
                ranked={ranked}
                tierCount={tierCount}
                onToggleDisabled={onToggleDisabled}
                onDeleteValue={onDeleteValue}
                onReorder={onReorder}
                onAddChild={onAddChild}
                onOpenEditor={openEditor}
              />
            ))}
          </div>
          {editable && (
            <div className={styles['values__tree-add']}>
              <TextInput
                size="Small"
                placeholder={ranked ? 'Add a top-level tier' : 'Add a top-level option'}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onAddValue(draft.trim(), ranked);
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
                  onAddValue(draft.trim(), ranked);
                  setDraft('');
                }}
              >
                {ranked ? 'Add tier' : 'Add option'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className={styles['values__chips-wrap']}>
          <div className={styles['values__chips']}>
            {attribute.values.map((v) => (
              <span key={v.id}>
                {renderOptionChip(v, {
                  ranked,
                  editable,
                  active: editing?.value.id === v.id,
                  onOpen: openEditor,
                })}
              </span>
            ))}
            {attribute.values.length === 0 && !editable && (
              <span className={styles['values__none']}>No values.</span>
            )}
            {editable && (
              <input
                className={styles['values__input']}
                placeholder={
                  attribute.values.length === 0
                    ? 'Add an option and press Enter.'
                    : '+ Add'
                }
                value={draft}
                aria-label="Add an option"
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
          {editable && (
            <p className={styles['values__edit-hint']}>
              Click an option to edit its label, color, or translations.
            </p>
          )}
        </div>
      )}

      {valuesFooter()}

      {editing && anchorRef.current && (
        <ValueEditorPopover
          value={editing.value}
          ranked={editing.ranked}
          tierCount={tierCount}
          readOnly={!editable}
          anchorRef={anchorRef}
          onClose={() => setEditing(null)}
          onRelabel={(label) => onRelabel(editing.value.id, label)}
          onSetRank={(tier) => onSetRank(editing.value.id, tier)}
          onDeactivate={() => {
            onToggleDisabled(editing.value.id);
            setEditing(null);
          }}
          onRemove={() => {
            onDeleteValue(editing.value.id);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
