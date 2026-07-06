import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import LinkVariantOffIcon from '@mattermost/compass-icons/components/link-variant-off';
import PlusBoxOutlineIcon from '@mattermost/compass-icons/components/plus-box-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import Chip from '@/components/ui/Chip/Chip';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import {
  isPolicyLocked,
  isSourceOwned,
  sharedScaleState,
  type HubAttribute,
} from './basicsData';
import { type AttrValue } from '../AttributeManagementHub/hubData';
import styles from './ValuesBasicsEditor.module.scss';

export interface ValuesBasicsEditorProps {
  attribute: HubAttribute;
  onAddValue: (label: string, asTier?: boolean) => void;
  onAddChild: (parentId: string, label: string) => void;
  onDeleteValue: (valueId: string) => void;
  onUseSharedScale: () => void;
  onUnlink: () => void;
}

/** Ranked-hierarchical tree row (kept — this is the complex value case). */
function TreeRow({
  value,
  depth,
  onAddChild,
  onDeleteValue,
  editable,
}: {
  value: AttrValue;
  depth: number;
  onAddChild: (parentId: string, label: string) => void;
  onDeleteValue: (id: string) => void;
  editable: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const [adding, setAdding] = useState(false);
  const [childDraft, setChildDraft] = useState('');
  const hasChildren = !!value.children?.length;
  const isTier = value.tier != null;

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
        className={styles['values__row']}
        style={{
          paddingLeft: `calc(${depth} * var(--spacing-l) + var(--spacing-s))`,
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            className={styles['values__twist']}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onClick={() => setExpanded((e) => !e)}
          >
            <Icon
              size="16"
              glyph={expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            />
          </button>
        ) : (
          <span className={styles['values__twist-spacer']} aria-hidden />
        )}
        <span className={styles['values__label']}>{value.label}</span>
        {isTier ? (
          <LabelTag label={`Ranked · Tier ${value.tier}`} type="Info" size="X-Small" />
        ) : (
          <LabelTag label="Sub-marking (display only)" type="Default" size="X-Small" />
        )}
        <span className={styles['values__spacer']} />
        {editable && (
          <div className={styles['values__row-actions']}>
            <Button
              emphasis="Tertiary"
              size="X-Small"
              leadingIcon={<Icon size="12" glyph={<PlusBoxOutlineIcon />} />}
              onClick={() => setAdding((v) => !v)}
            >
              Add sub-marking
            </Button>
            <IconButton
              size="X-Small"
              aria-label={`Delete ${value.label}`}
              icon={<Icon size="16" glyph={<CloseIcon />} />}
              onClick={() => onDeleteValue(value.id)}
            />
          </div>
        )}
      </div>
      {editable && adding && (
        <div
          className={styles['values__child-add']}
          style={{
            paddingLeft: `calc(${depth + 1} * var(--spacing-l) + var(--spacing-s))`,
          }}
        >
          <TextInput
            size="Small"
            placeholder={`Sub-marking under ${value.label}`}
            value={childDraft}
            onChange={(e) => setChildDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitChild();
            }}
          />
          <Button emphasis="Secondary" size="Small" onClick={commitChild}>
            Add
          </Button>
        </div>
      )}
      {hasChildren &&
        expanded &&
        value.children!.map((child) => (
          <TreeRow
            key={child.id}
            value={child}
            depth={depth + 1}
            onAddChild={onAddChild}
            onDeleteValue={onDeleteValue}
            editable={editable}
          />
        ))}
    </>
  );
}

/**
 * Basics values editor. Spec 27 §3 (Basics: inline add + tree for hierarchical),
 * spec 28 §2.5 (chip-entry for flat Select/Multiselect), V-4 (Shared value scale).
 * Advanced-only concerns (per-resource value subsets / disabledValueIds) are NOT
 * here — they live behind the Advanced door.
 */
export default function ValuesBasicsEditor({
  attribute,
  onAddValue,
  onAddChild,
  onDeleteValue,
  onUseSharedScale,
  onUnlink,
}: ValuesBasicsEditorProps) {
  const [chipDraft, setChipDraft] = useState('');
  const [tierDraft, setTierDraft] = useState('');
  const sourceOwned = isSourceOwned(attribute);
  const locked = isPolicyLocked(attribute);
  const shared = sharedScaleState(attribute);
  const editable = !sourceOwned && !locked && !shared;

  if (attribute.type === 'Text') {
    return (
      <SectionNotice
        type="Info"
        title="Free-text values"
        description="This attribute stores free text — there’s no value list to manage."
      />
    );
  }

  const isTree = attribute.type === 'Ranked-hierarchical';
  const isRanked = attribute.type === 'Ranked' || isTree;
  const canOfferShared =
    !shared && !sourceOwned && !attribute.mirroredBy?.length;

  const commitChip = () => {
    const label = chipDraft.trim();
    if (!label) return;
    onAddValue(label, isRanked ? true : undefined);
    setChipDraft('');
  };

  return (
    <div className={styles['values']}>
      {sourceOwned && (
        <SectionNotice
          type="Info"
          icon={<Icon size="20" glyph={<LockOutlineIcon />} />}
          title={`Managed by ${attribute.source.system}`}
          description="Values are synced from the source and are read-only here."
        />
      )}

      {shared && (
        <div className={styles['values__shared']}>
          <span className={styles['values__shared-icon']}>
            <Icon size="16" glyph={<LinkVariantIcon />} />
          </span>
          <span className={styles['values__shared-text']}>
            {shared} · values sync from the source attribute and can’t be edited here.
          </span>
          {!locked && (
            <Button
              emphasis="Tertiary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<LinkVariantOffIcon />} />}
              onClick={onUnlink}
            >
              Stop sharing
            </Button>
          )}
        </div>
      )}

      {locked && !sourceOwned && !shared && (
        <SectionNotice
          type="Info"
          icon={<Icon size="20" glyph={<LockOutlineIcon />} />}
          title={`Locked — used by ${attribute.usedByPolicies} ${
            attribute.usedByPolicies === 1 ? 'policy' : 'policies'
          }`}
          description="Editing values would re-evaluate access. Review the policies first."
        />
      )}

      {/* Flat types: chip display. Tree types: tree display. */}
      {isTree ? (
        <div className={styles['values__tree']}>
          {attribute.values.map((v) => (
            <TreeRow
              key={v.id}
              value={v}
              depth={0}
              onAddChild={onAddChild}
              onDeleteValue={onDeleteValue}
              editable={editable}
            />
          ))}
        </div>
      ) : (
        <div className={styles['values__chips']}>
          {attribute.values.map((v) => (
            <Chip
              key={v.id}
              size="Medium"
              tone={v.tier != null ? 'info' : 'neutral'}
              onRemove={
                editable && (v.inUseCount ?? 0) === 0
                  ? () => onDeleteValue(v.id)
                  : undefined
              }
            >
              {isRanked && v.tier != null ? `${v.tier}. ${v.label}` : v.label}
            </Chip>
          ))}
          {attribute.values.length === 0 && (
            <span className={styles['values__empty']}>
              No values yet — add the first below.
            </span>
          )}
        </div>
      )}

      {/* Add affordances — chip-entry (flat) or tier input (tree). */}
      {editable && !isTree && (
        <div className={styles['values__add']}>
          <TextInput
            size="Medium"
            placeholder={
              isRanked ? 'Type a tier and press Enter' : 'Type a value and press Enter'
            }
            value={chipDraft}
            onChange={(e) => setChipDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                commitChip();
              } else if (
                e.key === 'Backspace' &&
                chipDraft.length === 0 &&
                attribute.values.length > 0
              ) {
                const last = attribute.values[attribute.values.length - 1];
                if ((last.inUseCount ?? 0) === 0) onDeleteValue(last.id);
              }
            }}
          />
          <Button
            emphasis="Secondary"
            leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
            disabled={chipDraft.trim().length === 0}
            onClick={commitChip}
          >
            Add
          </Button>
        </div>
      )}

      {editable && isTree && (
        <div className={styles['values__add']}>
          <TextInput
            size="Medium"
            placeholder="Add a top-level ranked tier"
            value={tierDraft}
            onChange={(e) => setTierDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && tierDraft.trim()) {
                onAddValue(tierDraft.trim(), true);
                setTierDraft('');
              }
            }}
          />
          <Button
            emphasis="Secondary"
            leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
            disabled={tierDraft.trim().length === 0}
            onClick={() => {
              onAddValue(tierDraft.trim(), true);
              setTierDraft('');
            }}
          >
            Add tier
          </Button>
        </div>
      )}

      {canOfferShared && (
        <div className={styles['values__footer']}>
          <Button
            emphasis="Tertiary"
            leadingIcon={<Icon size="16" glyph={<LinkVariantIcon />} />}
            onClick={onUseSharedScale}
          >
            Use a shared value scale from…
          </Button>
        </div>
      )}
    </div>
  );
}
