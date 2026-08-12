import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import InfoHint from '@/pages/AttributeManagementHub/_components/InfoHint/InfoHint';
import ParentPicker from './ParentPicker';
import {
  deleteGateFor,
  parentsOf,
  type GraphOption,
  type ParentRejection,
} from '../graphModel';
import styles from './OptionsTable.module.scss';

interface OptionsTableProps {
  options: GraphOption[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  onChangeParents: (childId: string, nextParentIds: string[]) => void;
  onOpenRename: (id: string) => void;
  onDelete: (id: string) => void;
  onAddOption: (label: string) => void;
  /** Row id + rejection to seed (validation-rejected deep-link). */
  seededRejection?: { childId: string; rejection: ParentRejection } | null;
  /** Ids whose structure changed and need a verify nudge (F-4). */
  nudgeIds?: string[];
}

export default function OptionsTable({
  options,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  onChangeParents,
  onOpenRename,
  onDelete,
  onAddOption,
  seededRejection = null,
  nudgeIds = [],
}: OptionsTableProps) {
  const [draft, setDraft] = useState('');
  const collision = options.some(
    (o) => o.label.toLowerCase() === draft.trim().toLowerCase(),
  );

  const commitAdd = () => {
    const label = draft.trim();
    if (!label || collision) return;
    onAddOption(label);
    setDraft('');
  };

  return (
    <div className={styles['options-table']}>
      <div className={styles['options-table__head']} role="row">
        <span className={styles['options-table__col-option']}>Option</span>
        <span className={styles['options-table__col-parents']}>Parents</span>
        <span className={styles['options-table__col-usedby']}>Used by</span>
        <span className={styles['options-table__col-actions']}>Actions</span>
      </div>

      <div className={styles['options-table__body']}>
        {options.map((o) => {
          const inherited = o.source === 'linked';
          const gate = deleteGateFor(options, o.id);
          const highlighted = selectedId === o.id || hoveredId === o.id;
          const nudge = nudgeIds.includes(o.id);
          const parentCount = parentsOf(options, o.id).length;

          return (
            <div
              key={o.id}
              className={[
                styles['options-table__row'],
                highlighted && styles['options-table__row--highlighted'],
                o.disabled && styles['options-table__row--disabled'],
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => onHover(o.id)}
              onMouseLeave={() => onHover(null)}
            >
              <div className={styles['options-table__col-option']}>
                <button
                  type="button"
                  className={styles['options-table__option-btn']}
                  onClick={() => onSelect(selectedId === o.id ? null : o.id)}
                >
                  {o.color && (
                    <span
                      className={styles['options-table__swatch']}
                      style={{ backgroundColor: o.color }}
                      aria-hidden
                    />
                  )}
                  <span className={styles['options-table__option-label']}>
                    {o.label}
                  </span>
                </button>
                {parentCount > 1 && (
                  <LabelTag
                    label="Multi-parent"
                    type="Warning"
                    size="X-Small"
                  />
                )}
                {inherited && (
                  <LabelTag
                    label="Inherited"
                    type="Info Dim"
                    size="X-Small"
                    leadingIcon={<Icon size="12" glyph={<LockOutlineIcon />} />}
                  />
                )}
              </div>

              <div className={styles['options-table__col-parents']}>
                <ParentPicker
                  options={options}
                  childId={o.id}
                  parentIds={o.parentIds}
                  readOnly={inherited}
                  seededRejection={
                    seededRejection?.childId === o.id
                      ? seededRejection.rejection
                      : null
                  }
                  onChange={(ids) => onChangeParents(o.id, ids)}
                />
                {nudge && (
                  <div className={styles['options-table__nudge']}>
                    <Icon size="12" glyph={<AlertCircleOutlineIcon />} />
                    Structure changed — verify with Test coverage.
                  </div>
                )}
              </div>

              <div className={styles['options-table__col-usedby']}>
                {o.policyRefCount > 0 ? (
                  <LabelTag
                    label={`${o.policyRefCount} ${
                      o.policyRefCount === 1 ? 'policy' : 'policies'
                    }`}
                    type="Info"
                    size="X-Small"
                  />
                ) : (
                  <span className={styles['options-table__usedby-none']}>—</span>
                )}
              </div>

              <div className={styles['options-table__col-actions']}>
                {inherited ? (
                  <span className={styles['options-table__inherited-note']}>
                    Read-only
                  </span>
                ) : (
                  <>
                    <IconButton
                      size="Small"
                      aria-label={`Rename ${o.label}`}
                      icon={<Icon size="16" glyph={<PencilOutlineIcon />} />}
                      onClick={() => onOpenRename(o.id)}
                    />
                    {gate.blocked ? (
                      <InfoHint
                        label={
                          gate.hasChildrenReason ??
                          gate.policyReason ??
                          'Cannot delete'
                        }
                        hint={
                          gate.hasChildrenReason && gate.policyReason
                            ? gate.policyReason
                            : undefined
                        }
                        arrow="Bottom"
                      >
                        <IconButton
                          size="Small"
                          aria-label={`Delete ${o.label} (blocked)`}
                          disabled
                          icon={
                            <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                          }
                        />
                      </InfoHint>
                    ) : (
                      <IconButton
                        size="Small"
                        destructive
                        aria-label={`Delete ${o.label}`}
                        icon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
                        onClick={() => onDelete(o.id)}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles['options-table__add']}>
        <TextInput
          size="Medium"
          placeholder="Add an option"
          value={draft}
          invalid={collision && draft.trim().length > 0}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitAdd();
          }}
        />
        <Button
          emphasis="Secondary"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          disabled={draft.trim().length === 0 || collision}
          onClick={commitAdd}
        >
          Add option
        </Button>
        {collision && draft.trim().length > 0 && (
          <span className={styles['options-table__collision']}>
            “{draft.trim()}” already exists in this field.
          </span>
        )}
      </div>
    </div>
  );
}
