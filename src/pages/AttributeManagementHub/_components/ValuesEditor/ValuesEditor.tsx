import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
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
import ImportIcon from '@mattermost/compass-icons/components/import';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import Chip from '@/components/ui/Chip/Chip';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import InfoHint from '../InfoHint/InfoHint';
import {
  canReuseValues,
  isPolicyLocked,
  isSourceOwned,
  type AttrValue,
  type HubAttribute,
} from '../../hubData';
import styles from './ValuesEditor.module.scss';

export interface ValuesEditorProps {
  attribute: HubAttribute;
  /** Add a top-level value. `asTier` builds a ranked tier; else a display-only marking. */
  onAddValue: (label: string, asTier?: boolean) => void;
  /** Add a nested (display-only) child under a parent value. */
  onAddChild: (parentId: string, label: string) => void;
  onToggleDisabled: (valueId: string) => void;
  onDeleteValue: (valueId: string) => void;
  /** Reorder a value among its siblings (works at any tree level). */
  onReorder: (valueId: string, dir: -1 | 1) => void;
  /** Attempt to edit a locked (policy-bound) value set. */
  onLockedAttempt: () => void;
  onReuse: () => void;
  onUnlink: () => void;
  onImportMatrix: () => void;
}

function TreeRow({
  value,
  depth,
  index,
  siblingCount,
  onToggleDisabled,
  onDeleteValue,
  onReorder,
  onAddChild,
  editable,
}: {
  value: AttrValue;
  depth: number;
  index: number;
  siblingCount: number;
  onToggleDisabled: (id: string) => void;
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
        className={[
          styles['values__row'],
          value.disabled && styles['values__row--disabled'],
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ paddingLeft: `calc(${depth} * var(--spacing-l) + var(--spacing-s))` }}
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

        {editable && (
          <span className={styles['values__reorder']}>
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
            <span className={styles['values__drag']} aria-hidden>
              <Icon size="16" glyph={<DragVerticalIcon />} />
            </span>
          </span>
        )}

        <span className={styles['values__label']}>{value.label}</span>

        {isTier ? (
          <LabelTag label={`Tier ${value.tier}`} type="Info" size="X-Small" />
        ) : (
          <LabelTag label="Display only" type="Default" size="X-Small" />
        )}

        {value.disabled && (
          <span className={styles['values__flag']}>Disabled for new</span>
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
          className={styles['values__child-add']}
          style={{ paddingLeft: `calc(${depth + 1} * var(--spacing-l) + var(--spacing-s))` }}
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
            onToggleDisabled={onToggleDisabled}
            onDeleteValue={onDeleteValue}
            onReorder={onReorder}
            onAddChild={onAddChild}
            editable={editable}
          />
        ))}
    </>
  );
}

export default function ValuesEditor({
  attribute,
  onAddValue,
  onAddChild,
  onToggleDisabled,
  onDeleteValue,
  onReorder,
  onLockedAttempt,
  onReuse,
  onUnlink,
  onImportMatrix,
}: ValuesEditorProps) {
  const [draft, setDraft] = useState('');
  const [addKind, setAddKind] = useState<'tier' | 'marking'>('tier');
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

  return (
    <div className={styles['values']}>
      {sourceOwned && (
        <SectionNotice
          type="Info"
          icon={<Icon size="20" glyph={<LockOutlineIcon />} />}
          title={`Managed by ${attribute.source.system}`}
          description="Values and order are synced from the source and are read-only here."
        />
      )}

      {linked && attribute.valuesLink && (
        <div className={styles['values__link-banner']}>
          <span className={styles['values__link-icon']}>
            <Icon size="16" glyph={<LinkVariantIcon />} />
          </span>
          <span className={styles['values__link-text']}>
            Linked to {attribute.valuesLink.attributeName} · values are
            inherited and read-only
          </span>
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<LinkVariantOffIcon />} />}
            onClick={onUnlink}
          >
            Unlink
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
        <div className={styles['values__tree']}>
          {attribute.values.map((v, i) => (
            <TreeRow
              key={v.id}
              value={v}
              depth={0}
              index={i}
              siblingCount={attribute.values.length}
              onToggleDisabled={onToggleDisabled}
              onDeleteValue={onDeleteValue}
              onReorder={onReorder}
              onAddChild={onAddChild}
              editable={editable}
            />
          ))}
        </div>
      ) : (
        <div className={styles['values__list']}>
          {attribute.values.map((v, i) => {
            const inUse = (v.inUseCount ?? 0) > 0;
            return (
              <div
                key={v.id}
                className={[
                  styles['values__row'],
                  v.disabled && styles['values__row--disabled'],
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {isRanked && editable && (
                  <span className={styles['values__reorder']}>
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
                    <span className={styles['values__drag']} aria-hidden>
                      <Icon size="16" glyph={<DragVerticalIcon />} />
                    </span>
                  </span>
                )}
                <span className={styles['values__label']}>{v.label}</span>
                {isRanked && v.tier != null && (
                  <LabelTag label={`Tier ${v.tier}`} type="Info" size="X-Small" />
                )}
                {v.disabled && (
                  <span className={styles['values__flag']}>Disabled for new</span>
                )}
                <span className={styles['values__spacer']} />
                {editable ? (
                  <div className={styles['values__row-actions']}>
                    <Chip size="Small" as="button" onClick={() => onToggleDisabled(v.id)}>
                      {v.disabled ? 'Re-enable' : 'Disable'}
                    </Chip>
                    <InfoHint
                      label={
                        inUse
                          ? `In use on ${v.inUseCount} resources — disable instead`
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
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {editable && (
        <div className={styles['values__add']}>
          {isTree && (
            <div className={styles['values__kind']}>
              <Chip
                size="Small"
                as="button"
                tone={addKind === 'tier' ? 'info' : 'neutral'}
                onClick={() => setAddKind('tier')}
              >
                Ranked tier
              </Chip>
              <Chip
                size="Small"
                as="button"
                tone={addKind === 'marking' ? 'info' : 'neutral'}
                onClick={() => setAddKind('marking')}
              >
                Display-only marking
              </Chip>
            </div>
          )}
          <div className={styles['values__add-row']}>
            <TextInput
              size="Medium"
              placeholder={
                isTree
                  ? addKind === 'tier'
                    ? 'Add a top-level tier'
                    : 'Add a top-level marking'
                  : 'Add a value'
              }
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button
              emphasis="Secondary"
              leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
              disabled={draft.trim().length === 0}
              onClick={() => {
                onAddValue(draft.trim(), isTree ? addKind === 'tier' : undefined);
                setDraft('');
              }}
            >
              Add
            </Button>
          </div>
        </div>
      )}

      <div className={styles['values__footer']}>
        {isTree && editable && (
          <Button
            emphasis="Tertiary"
            leadingIcon={<Icon size="16" glyph={<ImportIcon />} />}
            onClick={onImportMatrix}
          >
            Import from matrix
          </Button>
        )}
        {canReuseValues(attribute) && (
          <Button
            emphasis="Tertiary"
            leadingIcon={<Icon size="16" glyph={<LinkVariantIcon />} />}
            onClick={onReuse}
          >
            Reuse values from another attribute
          </Button>
        )}
      </div>
    </div>
  );
}
