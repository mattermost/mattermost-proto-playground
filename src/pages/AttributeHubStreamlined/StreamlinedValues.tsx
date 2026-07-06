import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ChevronUpIcon from '@mattermost/compass-icons/components/chevron-up';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import LinkVariantOffIcon from '@mattermost/compass-icons/components/link-variant-off';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import PlusBoxOutlineIcon from '@mattermost/compass-icons/components/plus-box-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import Chip from '@/components/ui/Chip/Chip';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import InfoHint from '../AttributeManagementHub/_components/InfoHint/InfoHint';
import {
  canReuseValues,
  isPolicyLocked,
  isSourceOwned,
  type AttrValue,
  type HubAttribute,
} from '../AttributeManagementHub/hubData';
import styles from './streamlined.module.scss';

/**
 * LOCAL copy of the Values editor for Approach A. Diverges from the shared
 * `AttributeManagementHub/ValuesEditor` in three ways this pole requires:
 *  - V-4 rename: "Reuse values" / "Linked to" → "Shared value scale" everywhere.
 *  - §28 fix: tier chips read "Ranked · Tier N" / "Sub-marking (display only)".
 *  - §28 fix: flat Select/Multiselect lists use lightweight chip entry
 *    (type-and-Enter / Backspace-to-remove) instead of the heavier input row.
 * The tree editor is kept for Ranked-hierarchical. No per-resource value
 * subsets are exposed here — that control does not exist in Approach A.
 */
export interface StreamlinedValuesProps {
  attribute: HubAttribute;
  onAddValue: (label: string, asTier?: boolean) => void;
  onAddChild: (parentId: string, label: string) => void;
  onDeleteValue: (valueId: string) => void;
  onReorder: (valueId: string, dir: -1 | 1) => void;
  onLockedAttempt: () => void;
  onSharedScale: () => void;
  onUnlink: () => void;
}

function tierNumbers(values: AttrValue[]): number {
  return values.filter((v) => v.tier != null).length;
}

function TreeRow({
  value,
  depth,
  index,
  siblingCount,
  onDeleteValue,
  onReorder,
  onAddChild,
  editable,
}: {
  value: AttrValue;
  depth: number;
  index: number;
  siblingCount: number;
  onDeleteValue: (id: string) => void;
  onReorder: (id: string, dir: -1 | 1) => void;
  onAddChild: (parentId: string, label: string) => void;
  editable: boolean;
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
        className={styles['sv__row']}
        style={{
          paddingLeft: `calc(${depth} * var(--spacing-l) + var(--spacing-s))`,
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            className={styles['sv__twist']}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onClick={() => setExpanded((e) => !e)}
          >
            <Icon
              size="16"
              glyph={expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            />
          </button>
        ) : (
          <span className={styles['sv__twist-spacer']} aria-hidden />
        )}

        {editable && (
          <span className={styles['sv__reorder']}>
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
          </span>
        )}

        <span className={styles['sv__label']}>{value.label}</span>

        {isTier ? (
          <LabelTag label={`Ranked · Tier ${value.tier}`} type="Info" size="X-Small" />
        ) : (
          <LabelTag label="Sub-marking (display only)" type="Default" size="X-Small" />
        )}

        <span className={styles['sv__spacer']} />

        {editable && (
          <div className={styles['sv__row-actions']}>
            <Button
              emphasis="Tertiary"
              size="X-Small"
              leadingIcon={<Icon size="12" glyph={<PlusBoxOutlineIcon />} />}
              onClick={() => setAdding((v) => !v)}
            >
              Add sub-marking
            </Button>
            <InfoHint
              label={
                inUse
                  ? `In use on ${value.inUseCount} resources — cannot delete`
                  : 'Delete value'
              }
              arrow="Bottom"
            >
              <IconButton
                size="X-Small"
                aria-label={`Delete ${value.label}`}
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
          className={styles['sv__child-add']}
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
            onDeleteValue={onDeleteValue}
            onReorder={onReorder}
            onAddChild={onAddChild}
            editable={editable}
          />
        ))}
    </>
  );
}

export default function StreamlinedValues({
  attribute,
  onAddValue,
  onAddChild,
  onDeleteValue,
  onReorder,
  onLockedAttempt,
  onSharedScale,
  onUnlink,
}: StreamlinedValuesProps) {
  const [draft, setDraft] = useState('');
  const sourceOwned = isSourceOwned(attribute);
  const locked = isPolicyLocked(attribute);
  const linked = !!attribute.valuesLink;
  const editable = !sourceOwned && !locked && !linked;

  if (attribute.type === 'Text') {
    return (
      <SectionNotice
        type="Info"
        title="Free-text values"
        description="This attribute stores free text — there is no value list to manage. Policies match the exact string."
      />
    );
  }

  const isTree = attribute.type === 'Ranked-hierarchical';
  const isRanked = attribute.type === 'Ranked' || isTree;

  const commitChip = () => {
    const label = draft.trim();
    if (!label) return;
    onAddValue(label, isTree ? true : undefined);
    setDraft('');
  };

  return (
    <div className={styles['sv']}>
      {sourceOwned && (
        <SectionNotice
          type="Info"
          icon={<Icon size="20" glyph={<LockOutlineIcon />} />}
          title={`Managed by ${attribute.source.system}`}
          description="Values and order are synced from the source and are read-only here."
        />
      )}

      {linked && attribute.valuesLink && (
        <div className={styles['sv__link-banner']}>
          <span className={styles['sv__link-icon']}>
            <Icon size="16" glyph={<LinkVariantIcon />} />
          </span>
          <span className={styles['sv__link-text']}>
            Shared value scale from {attribute.valuesLink.attributeName} — values
            sync from the source attribute and can&rsquo;t be edited here.
          </span>
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<LinkVariantOffIcon />} />}
            onClick={onUnlink}
          >
            Stop sharing
          </Button>
        </div>
      )}

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
        <div className={styles['sv__tree']}>
          {attribute.values.map((v, i) => (
            <TreeRow
              key={v.id}
              value={v}
              depth={0}
              index={i}
              siblingCount={attribute.values.length}
              onDeleteValue={onDeleteValue}
              onReorder={onReorder}
              onAddChild={onAddChild}
              editable={editable}
            />
          ))}
        </div>
      ) : isRanked ? (
        // Flat ranked list — keep row layout with reorder + tier badge.
        <div className={styles['sv__list']}>
          {attribute.values.map((v, i) => {
            const inUse = (v.inUseCount ?? 0) > 0;
            return (
              <div key={v.id} className={styles['sv__row']}>
                {editable && (
                  <span className={styles['sv__reorder']}>
                    <IconButton
                      size="X-Small"
                      aria-label={`Move ${v.label} up`}
                      disabled={i === 0}
                      icon={<Icon size="16" glyph={<ChevronUpIcon />} />}
                      onClick={() => onReorder(v.id, -1)}
                    />
                    <IconButton
                      size="X-Small"
                      aria-label={`Move ${v.label} down`}
                      disabled={i === attribute.values.length - 1}
                      icon={<Icon size="16" glyph={<ChevronDownIcon />} />}
                      onClick={() => onReorder(v.id, 1)}
                    />
                  </span>
                )}
                <span className={styles['sv__label']}>{v.label}</span>
                {v.tier != null && (
                  <LabelTag label={`Ranked · Tier ${v.tier}`} type="Info" size="X-Small" />
                )}
                <span className={styles['sv__spacer']} />
                {editable && (
                  <InfoHint
                    label={
                      inUse
                        ? `In use on ${v.inUseCount} resources — cannot delete`
                        : 'Delete value'
                    }
                    arrow="Bottom"
                  >
                    <IconButton
                      size="X-Small"
                      aria-label={`Delete ${v.label}`}
                      destructive={!inUse}
                      icon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
                      onClick={() => onDeleteValue(v.id)}
                    />
                  </InfoHint>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Flat Select / Multiselect — lightweight chip list (§28 chip entry).
        <div className={styles['sv__chips']}>
          {attribute.values.map((v) => (
            <Chip
              key={v.id}
              size="Medium"
              onRemove={editable ? () => onDeleteValue(v.id) : undefined}
              removeLabel={`Remove ${v.label}`}
            >
              {v.label}
            </Chip>
          ))}
          {attribute.values.length === 0 && (
            <span className={styles['sv__empty']}>
              No values yet — add the first below.
            </span>
          )}
        </div>
      )}

      {editable && (
        <div className={styles['sv__add']}>
          <TextInput
            size="Medium"
            placeholder={
              isTree
                ? `Add a ranked tier (Tier ${tierNumbers(attribute.values) + 1})`
                : isRanked
                  ? 'Add the next tier'
                  : 'Type a value, press Enter'
            }
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitChip();
              if (
                e.key === 'Backspace' &&
                draft === '' &&
                !isTree &&
                !isRanked &&
                attribute.values.length > 0
              ) {
                onDeleteValue(attribute.values[attribute.values.length - 1].id);
              }
            }}
          />
          <Button
            emphasis="Secondary"
            leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
            disabled={draft.trim().length === 0}
            onClick={commitChip}
          >
            Add
          </Button>
        </div>
      )}

      {canReuseValues(attribute) && (
        <div className={styles['sv__footer']}>
          <Button
            emphasis="Tertiary"
            leadingIcon={<Icon size="16" glyph={<LinkVariantIcon />} />}
            onClick={onSharedScale}
          >
            Use a shared value scale from another attribute
          </Button>
        </div>
      )}
    </div>
  );
}
