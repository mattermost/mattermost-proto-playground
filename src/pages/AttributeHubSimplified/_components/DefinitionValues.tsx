import { useRef, useState, type MouseEvent } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ChevronUpIcon from '@mattermost/compass-icons/components/chevron-up';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import LinkVariantOffIcon from '@mattermost/compass-icons/components/link-variant-off';
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
import MvpManagedSourceBar from '@/pages/AttributeHubMVPNext/_components/MvpManagedSourceBar';
import ValueEditorPopover from './ValueEditorPopover';
import Chip from '@/components/ui/Chip/Chip';
import ColoredRankedInputChip from '@/components/ui/ColoredRankedInputChip/ColoredRankedInputChip';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import {
  canLinkValues,
  comparesRank,
  displayType,
  isTreeType,
  isValueLinked,
  mappedSourceValue,
  optionColorScheme,
  type ValueLinkConfig,
} from './simplifiedModel';
import styles from './DefinitionValues.module.scss';

const MVP_LINK_VALUES_ENABLED = false;

export interface DefinitionValuesProps {
  attribute: HubAttribute;
  attributes: HubAttribute[];
  valueLink: ValueLinkConfig | null;
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
  onLinkValues: () => void;
  onEditLink: () => void;
  onUnlinkValues: () => void;
  /** Force options non-editable even when not policy/source locked. */
  forceReadOnly?: boolean;
  /** Hide connect / link / unlink affordances under Options. */
  hideSourceActions?: boolean;
  /** Override the exact-link SectionNotice description. */
  linkedNoticeDescription?: string;
}

/** Whether a tier is referenced by an access policy (demo heuristic). */
function tierInPolicy(attribute: HubAttribute, value: AttrValue): boolean {
  if (attribute.usedByPolicies === 0) return false;
  // In this demo the two lowest-labelled protected tiers gate policies.
  return value.id === 'confidential' || value.id === 'cl-3' || value.tier === 3;
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
  const interactive = editable && !value.disabled;
  const openEditor = interactive
    ? (e: MouseEvent<HTMLElement>) => onOpen(value, ranked, e.currentTarget)
    : undefined;

  if (ranked && scheme !== 'plain') {
    return (
      <ColoredRankedInputChip
        label={value.label}
        rank={rank}
        scheme={scheme}
        disabled={value.disabled}
        active={active}
        onClick={openEditor}
      />
    );
  }

  if (ranked) {
    return (
      <RankedValueChip
        label={value.label}
        rank={rank}
        size="Medium"
        active={active}
        onClick={openEditor}
      />
    );
  }

  return (
    <Chip
      as={interactive ? 'button' : 'div'}
      size="Medium"
      tone="neutral"
      onClick={openEditor}
      disabled={interactive ? value.disabled : undefined}
      className={
        [
          active && styles['values__option-chip--active'],
          value.disabled && styles['values__option-chip--disabled'],
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
    >
      {value.label}
    </Chip>
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
 * agnostic tree. Options can link to another attribute via exact match or
 * define-mapping for consistent rank comparison.
 */
export default function DefinitionValues({
  attribute,
  attributes,
  valueLink,
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
  onLinkValues,
  onEditLink,
  onUnlinkValues,
  forceReadOnly = false,
  hideSourceActions = false,
  linkedNoticeDescription,
}: DefinitionValuesProps) {
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState<{
    value: AttrValue;
    ranked: boolean;
  } | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);

  const sourceOwned = isSourceOwned(attribute);
  const locked = isPolicyLocked(attribute);
  const linked = isValueLinked(attribute);
  const exactLinked = valueLink?.mode === 'exact';
  const mappedLinked = valueLink?.mode === 'mapped';
  const editable =
    !forceReadOnly && !sourceOwned && !locked && !exactLinked;
  const type = displayType(attribute);
  const isTree = isTreeType(type);
  const ranked = comparesRank(type);
  const tierCount = attribute.values.filter((v) => v.tier != null).length;
  const showConnect =
    !hideSourceActions && !sourceOwned && type !== 'Text' && !linked;
  const showLink =
    MVP_LINK_VALUES_ENABLED &&
    !hideSourceActions &&
    canLinkValues(attribute) &&
    !linked;
  const sourceAttribute = valueLink
    ? attributes.find((item) => item.id === valueLink.attributeId)
    : undefined;

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
    if (linked && valueLink) {
      if (hideSourceActions) {
        return (
          <div className={styles['values__linked-footer']}>
            <span className={styles['values__linked-copy']}>
              <Icon size="16" glyph={<LinkVariantIcon />} />
              {exactLinked
                ? `Exact match with ${valueLink.attributeName} — options sync from the source catalog.`
                : `Mapped to ${valueLink.attributeName} — ranks compare via your mapping.`}
            </span>
          </div>
        );
      }
      return (
        <div className={styles['values__linked-footer']}>
          <span className={styles['values__linked-copy']}>
            <Icon size="16" glyph={<LinkVariantIcon />} />
            {exactLinked
              ? `Exact match with ${valueLink.attributeName} — options sync from the source catalog.`
              : `Mapped to ${valueLink.attributeName} — ranks compare via your mapping.`}
          </span>
          <div className={styles['values__source-actions']}>
            {mappedLinked && (
              <Button emphasis="Tertiary" size="Small" onClick={onEditLink}>
                Edit mapping
              </Button>
            )}
            <Button
              emphasis="Tertiary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<LinkVariantOffIcon />} />}
              onClick={onUnlinkValues}
            >
              Unlink
            </Button>
          </div>
        </div>
      );
    }
    if (showConnect || showLink) {
      return (
        <div className={styles['values__source-actions']}>
          {showLink && (
            <Button
              emphasis="Tertiary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<LinkVariantIcon />} />}
              onClick={onLinkValues}
            >
              Link values to another attribute
            </Button>
          )}
          {showConnect && (
            <Button
              emphasis="Tertiary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<LinkVariantIcon />} />}
              onClick={onConnectSource}
            >
              Connect external source
            </Button>
          )}
        </div>
      );
    }
    return null;
  };

  const mappingHint = (valueId: string) => {
    if (!mappedLinked || !valueLink || !sourceAttribute) return null;
    const mapped = mappedSourceValue(valueLink, sourceAttribute, valueId);
    if (!mapped) return 'No source mapping';
    return mapped.tier != null
      ? `→ ${mapped.label} (tier ${mapped.tier})`
      : `→ ${mapped.label}`;
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
      {locked && !sourceOwned && !linked && !forceReadOnly && (
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

      {exactLinked && valueLink && (
        <SectionNotice
          type="Info"
          title="Shared value scale"
          description={
            linkedNoticeDescription ??
            `Options mirror ${valueLink.attributeName}. Labels and ranks stay in sync; edit the source attribute to change them.`
          }
        />
      )}

      {mappedLinked && valueLink && (
        <SectionNotice
          type="Info"
          title="Mapped comparison"
          description={`Each local option maps to a ${valueLink.attributeName} option so rank checks use one consistent scale.`}
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
              <span key={v.id} className={styles['values__chip-wrap']}>
                {renderOptionChip(v, {
                  ranked,
                  editable,
                  active: editing?.value.id === v.id,
                  onOpen: openEditor,
                })}
                {mappedLinked && (
                  <span className={styles['values__mapping-hint']}>
                    {mappingHint(v.id)}
                  </span>
                )}
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
              {mappedLinked
                ? 'Click an option to edit its label. Rank comparison follows your mapping.'
                : 'Click an option to edit its label, color, or translations.'}
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
