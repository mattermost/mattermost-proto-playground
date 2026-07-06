import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import ImageOutlineIcon from '@mattermost/compass-icons/components/image-outline';
import FormatLetterCaseIcon from '@mattermost/compass-icons/components/format-letter-case';
import AtIcon from '@mattermost/compass-icons/components/at';
import MenuDownIcon from '@mattermost/compass-icons/components/menu-down';
import FormatListNumberedIcon from '@mattermost/compass-icons/components/format-list-numbered';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import PlusBoxOutlineIcon from '@mattermost/compass-icons/components/plus-box-outline';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CheckIcon from '@mattermost/compass-icons/components/check';
import Button from '@/components/ui/Button/Button';
import ConsolePropertyTable from '@/components/ui/ConsolePropertyTable/ConsolePropertyTable';
import ConsolePropertyRow from '@/components/ui/ConsolePropertyRow/ConsolePropertyRow';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import Switch from '@/components/ui/Switch/Switch';
import TextInput from '@/components/ui/TextInput/TextInput';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import { sortByRankDesc } from './types';
import type {
  AttributeRow,
  AttributeType,
  AttributeVisibility,
} from './mockData';
import styles from './AttributeTable.module.scss';

/**
 * Variant controls the Values-cell interaction model:
 *  - `D1`         — chips are interactive; clicking a chip opens ChipPopover
 *                   (per-value editor). Row overflow opens the modal.
 *  - `D2`         — chips are view-only summaries; clicking the row opens
 *                   the deep-edit modal.
 *  - `cell-button` — entire Values cell behaves as a single button that opens
 *                   the modal (post 2026-05-22 sync alternate D1).
 *  - `d3`         — no modal; chips inert. Row overflow opens the
 *                   per-attribute popover. Inline + Add value remains active.
 */
export type AttributeTableVariant = 'D1' | 'D2' | 'cell-button' | 'd3';

interface AttributeTableProps {
  rows: AttributeRow[];
  variant: AttributeTableVariant;
  /** Called when admin clicks an interactive chip (D1 only). */
  onChipClick?: (
    attributeName: string,
    valueId: string,
    anchor: HTMLElement,
  ) => void;
  /** Called when admin chooses "Edit ranking" / row click / cell-button. */
  onRowClick?: (attributeName: string, anchor?: HTMLElement) => void;
  /** Called when admin chooses "Delete property" and the row is deletable. */
  onDeleteAttribute?: (attributeName: string) => void;
  /** Called when admin chooses "Duplicate property". */
  onDuplicateAttribute?: (attributeName: string) => void;
  /** Called when admin changes a row's visibility setting via the submenu. */
  onChangeVisibility?: (
    attributeName: string,
    visibility: AttributeVisibility,
  ) => void;
  /** Called when admin toggles "Editable by end users". */
  onChangeEditable?: (attributeName: string, editable: boolean) => void;
  /** Called when admin appends a value inline via the + Add value chip slot. */
  onAddInlineValue?: (attributeName: string, label: string) => void;
  /** Called when admin picks a type in the "+ Add property" type chooser. */
  onAddProperty?: (type: AttributeType) => void;
  /** Called when admin commits the inline name of a freshly-added row. */
  onCommitNewRowName?: (placeholderAttribute: string, nextName: string) => void;
  /**
   * Attribute name of a row that is awaiting its first name commit (newly
   * created via + Add property). The row's title cell renders an inline
   * TextInput with autoFocus.
   */
  pendingNewAttribute?: string | null;
  /** Active chip id (D1 popover-open state). */
  activeChipId?: string | null;
}

const TYPE_ICON: Record<AttributeType, React.ReactNode> = {
  Image: <ImageOutlineIcon />,
  Text: <FormatLetterCaseIcon />,
  Email: <AtIcon />,
  Select: <MenuDownIcon />,
  Ordered: <FormatListNumberedIcon />,
};

const TYPE_CHOICES: AttributeType[] = ['Text', 'Email', 'Image', 'Select', 'Ordered'];

const VISIBILITY_CHOICES: AttributeVisibility[] = [
  'Always show',
  'Hide when empty',
  'Hide from end users',
];

/**
 * User Attributes table — System Console > System Properties > User Attributes.
 *
 * Composes Compass `ConsolePropertyTable` + `ConsolePropertyRow` for the table
 * chrome. The Values cell rendering varies by `variant`. Each row carries a
 * 7-item overflow menu (Edit ranking / Visibility / Editable by end users /
 * Link to AD/LDAP / Duplicate / Delete) with hard-block gating for policy-
 * referenced and UAS-sourced rows.
 *
 * @see Figma: 4259-29832 (table), 4215-37673 (overflow menu)
 */
export default function AttributeTable({
  rows,
  variant,
  onChipClick,
  onRowClick,
  onDeleteAttribute,
  onDuplicateAttribute,
  onChangeVisibility,
  onChangeEditable,
  onAddInlineValue,
  onAddProperty,
  onCommitNewRowName,
  pendingNewAttribute,
  activeChipId,
}: AttributeTableProps) {
  const [openOverflow, setOpenOverflow] = useState<string | null>(null);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const addPropertyRef = useRef<HTMLDivElement>(null);

  // Outside-click + Esc close for the type chooser.
  useEffect(() => {
    if (!addPropertyOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (!addPropertyRef.current) return;
      if (addPropertyRef.current.contains(e.target as Node)) return;
      setAddPropertyOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setAddPropertyOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey as unknown as EventListener);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener(
        'keydown',
        onKey as unknown as EventListener,
      );
    };
  }, [addPropertyOpen]);

  return (
    <div className={styles['attribute-table']}>
      <ConsolePropertyTable
        sections={[
          {
            columns: [
              { key: 'property', label: 'Property', width: 128 + 16 },
              { key: 'type', label: 'Type', width: 136 },
              { key: 'values', label: 'Values' },
              { key: 'actions', label: 'Actions', width: 80 },
            ],
            rows: rows.map((row) => (
              <Fragment key={row.attribute}>
                <ConsolePropertyRow
                  title={
                    pendingNewAttribute === row.attribute ? (
                      <NewRowNameInput
                        placeholder={row.attribute}
                        onCommit={(next) =>
                          onCommitNewRowName?.(row.attribute, next)
                        }
                      />
                    ) : (
                      row.attribute
                    )
                  }
                  typeIcon={TYPE_ICON[row.type]}
                  typeLabel={row.type}
                  draggable={!row.locked}
                  locked={Boolean(row.locked)}
                  onMore={() =>
                    setOpenOverflow((cur) =>
                      cur === row.attribute ? null : row.attribute,
                    )
                  }
                  trailingAction={
                    row.locked ? undefined : (
                      <RowOverflowMenu
                        row={row}
                        open={openOverflow === row.attribute}
                        onClose={() => setOpenOverflow(null)}
                        onEdit={(anchor) => {
                          setOpenOverflow(null);
                          onRowClick?.(row.attribute, anchor);
                        }}
                        onDelete={() => {
                          setOpenOverflow(null);
                          onDeleteAttribute?.(row.attribute);
                        }}
                        onDuplicate={() => {
                          setOpenOverflow(null);
                          onDuplicateAttribute?.(row.attribute);
                        }}
                        onChangeVisibility={(v) =>
                          onChangeVisibility?.(row.attribute, v)
                        }
                        onChangeEditable={(checked) =>
                          onChangeEditable?.(row.attribute, checked)
                        }
                      />
                    )
                  }
                  value={
                    <RowValues
                      row={row}
                      variant={variant}
                      activeChipId={activeChipId}
                      onChipClick={onChipClick}
                      onRowClick={onRowClick}
                      onAddInlineValue={onAddInlineValue}
                    />
                  }
                />
              </Fragment>
            )),
          },
        ]}
      />

      {/* + Add property — opens a type chooser PopoverMenu */}
      <div className={styles['attribute-table__add-property']} ref={addPropertyRef}>
        <Button
          emphasis="Quaternary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          aria-expanded={addPropertyOpen}
          aria-haspopup="menu"
          onClick={() => setAddPropertyOpen((cur) => !cur)}
        >
          Add property
        </Button>
        {addPropertyOpen && (
          <div className={styles['attribute-table__add-property-menu']}>
            <PopoverMenu>
              {TYPE_CHOICES.map((t) => (
                <MenuItem
                  key={t}
                  label={t}
                  leadingVisual={<Icon size="16" glyph={TYPE_ICON[t]} />}
                  onClick={() => {
                    setAddPropertyOpen(false);
                    onAddProperty?.(t);
                  }}
                />
              ))}
            </PopoverMenu>
          </div>
        )}
      </div>
    </div>
  );
}

interface NewRowNameInputProps {
  placeholder: string;
  onCommit: (next: string) => void;
}

/**
 * Auto-focused inline TextInput rendered in the title cell of a newly-added
 * row. Enter commits; Esc reverts to the placeholder. Blur commits if the
 * value differs from the placeholder.
 */
function NewRowNameInput({ placeholder, onCommit }: NewRowNameInputProps) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <span className={styles['attribute-table__new-row-name']}>
      <TextInput
        ref={ref}
        size="Small"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          const next = value.trim();
          if (next && next !== placeholder) onCommit(next);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const next = value.trim();
            if (next) onCommit(next);
          }
        }}
        aria-label={`Name for new ${placeholder}`}
      />
    </span>
  );
}

interface RowValuesProps {
  row: AttributeRow;
  variant: AttributeTableVariant;
  activeChipId?: string | null;
  onChipClick?: (
    attributeName: string,
    valueId: string,
    anchor: HTMLElement,
  ) => void;
  onRowClick?: (attributeName: string, anchor?: HTMLElement) => void;
  onAddInlineValue?: (attributeName: string, label: string) => void;
}

function RowValues({
  row,
  variant,
  activeChipId,
  onChipClick,
  onRowClick,
  onAddInlineValue,
}: RowValuesProps) {
  // Select rows render plain chips (non-ranked). Retain color on Select per
  // the 2026-05-22 sync — only Ranked attributes lost colors.
  if (row.type === 'Select' && row.selectValues) {
    return (
      <div className={styles['attribute-table__values']}>
        {row.selectValues.map((v) => (
          <RankedValueChip
            key={v.id}
            label={v.label}
            onRemove={() => {
              // Prototype: no-op. Live product would mutate the select options.
            }}
          />
        ))}
        <button
          type="button"
          className={styles['attribute-table__add-chip']}
          aria-label={`Add value to ${row.attribute}`}
          onClick={(e) => onRowClick?.(row.attribute, e.currentTarget)}
        >
          +
        </button>
      </div>
    );
  }

  if (row.type !== 'Ordered' || !row.schema) {
    return <span className={styles['attribute-table__values-empty']}>—</span>;
  }

  const isReadOnly = row.source === 'UAS';
  const ordered = sortByRankDesc(row.schema.values);

  // cell-button variant: render the entire Values cell as a single button.
  // Inline + Add value still surfaces below the cell-button as a separate
  // affordance so admins can add a value without opening the modal.
  if (variant === 'cell-button') {
    return (
      <div className={styles['attribute-table__cell-button-wrap']}>
        <button
          type="button"
          className={styles['attribute-table__cell-button']}
          aria-label={`Edit ranked values for ${row.attribute}`}
          onClick={(e) => onRowClick?.(row.attribute, e.currentTarget)}
        >
          <span className={styles['attribute-table__cell-button-chips']}>
            {ordered.map((v) => (
              <RankedValueChip key={v.id} label={v.label} rank={v.rank} />
            ))}
          </span>
          <span
            className={styles['attribute-table__cell-button-affordance']}
            aria-hidden
          >
            <Icon size="16" glyph={<ChevronRightIcon />} />
          </span>
        </button>
        {!isReadOnly && (
          <AddValueInline
            attribute={row.attribute}
            onCommit={(label) => onAddInlineValue?.(row.attribute, label)}
          />
        )}
      </div>
    );
  }

  // D1 / D2 / d3: flat list of chips + (for non-UAS, non-D2) inline + Add value.
  return (
    <div className={styles['attribute-table__values']}>
      {ordered.map((v) => (
        <RankedValueChip
          key={v.id}
          label={v.label}
          rank={variant === 'D1' || variant === 'd3' ? v.rank : undefined}
          active={variant === 'D1' && activeChipId === v.id}
          onClick={
            variant === 'D1' && !isReadOnly
              ? (e) =>
                  onChipClick?.(
                    row.attribute,
                    v.id,
                    e.currentTarget as HTMLElement,
                  )
              : undefined
          }
          onRemove={
            variant === 'D1' && !isReadOnly
              ? () => {
                  // Removal flows through the popover's Remove button.
                }
              : undefined
          }
        />
      ))}
      {!isReadOnly && variant !== 'D2' && (
        <AddValueInline
          attribute={row.attribute}
          onCommit={(label) => onAddInlineValue?.(row.attribute, label)}
        />
      )}
      {isReadOnly && variant !== 'D2' && (
        <UasAddValueDisabled />
      )}
    </div>
  );
}

interface AddValueInlineProps {
  attribute: string;
  onCommit: (label: string) => void;
}

/**
 * Inline "+ Add value" affordance. Renders as a small Quaternary Button;
 * click swaps it for a TextInput. Enter commits with an auto-assigned rank
 * (handled by the parent via `onCommit`). Esc cancels.
 */
function AddValueInline({ attribute, onCommit }: AddValueInlineProps) {
  const [active, setActive] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active]);

  if (!active) {
    return (
      <Button
        emphasis="Quaternary"
        size="X-Small"
        leadingIcon={<Icon size="12" glyph={<PlusIcon />} />}
        aria-label={`Add value to ${attribute}`}
        onClick={() => setActive(true)}
      >
        Add value
      </Button>
    );
  }

  function commit() {
    const next = draft.trim();
    if (next) onCommit(next);
    setDraft('');
    setActive(false);
  }

  return (
    <span className={styles['attribute-table__add-value-input']}>
      <TextInput
        ref={inputRef}
        size="Small"
        value={draft}
        placeholder="Value name…"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft.trim()) commit();
          else setActive(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setDraft('');
            setActive(false);
          }
        }}
        aria-label={`New value name for ${attribute}`}
      />
    </span>
  );
}

function UasAddValueDisabled() {
  return (
    <span className={styles['attribute-table__uas-add-wrap']}>
      <Button
        emphasis="Quaternary"
        size="X-Small"
        disabled
        leadingIcon={<Icon size="12" glyph={<PlusIcon />} />}
      >
        Add value
      </Button>
      <span className={styles['attribute-table__uas-add-tooltip']} aria-hidden>
        <Tooltip label="UAS-sourced; managed by connector." arrow="Bottom" />
      </span>
    </span>
  );
}

interface RowOverflowMenuProps {
  row: AttributeRow;
  open: boolean;
  onClose: () => void;
  onEdit: (anchor: HTMLElement) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onChangeVisibility: (v: AttributeVisibility) => void;
  onChangeEditable: (checked: boolean) => void;
}

/**
 * Per-row overflow menu — matches Figma 4215-37673.
 *
 * Items (in order): Edit ranking · Visibility → · Editable by end users (switch) ·
 * Link to AD/LDAP · — · Duplicate property · Delete property.
 *
 * Gating logic:
 *  - UAS-sourced rows: Edit ranking enabled (opens read-only modal); other
 *    items disabled with rationale tooltips.
 *  - Policy-referenced rows (`policyCount > 0`): Delete disabled with tooltip.
 *  - Regular Local rows: all 7 items enabled.
 *  - Locked Compass-fixed rows never render this menu (gated upstream).
 */
function RowOverflowMenu({
  row,
  open,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onChangeVisibility,
  onChangeEditable,
}: RowOverflowMenuProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const visibilityWrapRef = useRef<HTMLDivElement>(null);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const deleteDescId = useId();
  const editableDescId = useId();
  const linkDescId = useId();
  const duplicateDescId = useId();
  const uasDeleteDescId = useId();

  // Outside-click + Esc close.
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (wrapRef.current.contains(e.target as Node)) return;
      onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (visibilityOpen) setVisibilityOpen(false);
        else onClose();
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey as unknown as EventListener);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener(
        'keydown',
        onKey as unknown as EventListener,
      );
    };
  }, [open, onClose, visibilityOpen]);

  const isUas = row.source === 'UAS';
  const isOrdered = row.type === 'Ordered';
  const policyBlocked = row.policyCount > 0;
  const policyMessage = `Used in ${row.policyCount} ${row.policyCount === 1 ? 'policy' : 'policies'}; cannot delete.`;
  const visibility = row.visibility ?? 'Hide when empty';

  return (
    <div className={styles['attribute-table__overflow']} ref={wrapRef}>
      {open && (
        <div className={styles['attribute-table__overflow-menu']}>
          <PopoverMenu>
            {/* 1. Edit ranking — Ordered only; opens modal/popover even for UAS (read-only) */}
            {isOrdered && (
              <MenuItem
                label="Edit ranking"
                leadingVisual={
                  <Icon size="16" glyph={<FormatListNumberedIcon />} />
                }
                onClick={(e) =>
                  onEdit(e.currentTarget as HTMLElement)
                }
              />
            )}

            {/* 2. Visibility → with submenu */}
            <div
              className={styles['attribute-table__sub-wrap']}
              ref={visibilityWrapRef}
              onMouseEnter={() => setVisibilityOpen(true)}
              onMouseLeave={() => setVisibilityOpen(false)}
            >
              <MenuItem
                label="Visibility"
                leadingVisual={<Icon size="16" glyph={<EyeOutlineIcon />} />}
                secondaryLabel={visibility}
                secondaryLabelPosition="Inline"
                trailingElement
                trailingVisual={
                  <Icon size="16" glyph={<ChevronRightIcon />} />
                }
                aria-haspopup="menu"
                aria-expanded={visibilityOpen}
                onClick={() => setVisibilityOpen((cur) => !cur)}
                onFocus={() => setVisibilityOpen(true)}
              />
              {visibilityOpen && (
                <div className={styles['attribute-table__submenu']}>
                  <PopoverMenu variant="child">
                    {VISIBILITY_CHOICES.map((choice) => (
                      <MenuItem
                        key={choice}
                        label={choice}
                        trailingElement={choice === visibility}
                        trailingVisual={
                          <Icon size="16" glyph={<CheckIcon />} />
                        }
                        aria-checked={choice === visibility}
                        role="menuitemradio"
                        onClick={() => {
                          onChangeVisibility(choice);
                          setVisibilityOpen(false);
                          onClose();
                        }}
                      />
                    ))}
                  </PopoverMenu>
                </div>
              )}
            </div>

            {/* 3. Editable by end users — switch on the right */}
            <div className={styles['attribute-table__menu-row']}>
              <div className={styles['attribute-table__menu-row-leading']}>
                <span
                  className={styles['attribute-table__menu-row-icon']}
                  aria-hidden
                >
                  <Icon size="16" glyph={<PlusBoxOutlineIcon />} />
                </span>
                <span className={styles['attribute-table__menu-row-label']}>
                  Editable by end users
                </span>
              </div>
              {isUas ? (
                <div className={styles['attribute-table__menu-row-trailing-tip']}>
                  <Switch
                    size="Small"
                    checked={false}
                    disabled
                    aria-describedby={editableDescId}
                    onChange={() => {}}
                  />
                  <span
                    id={editableDescId}
                    className={styles['attribute-table__sr-only']}
                  >
                    UAS-sourced; not editable.
                  </span>
                  <div
                    className={styles['attribute-table__menu-tooltip']}
                    aria-hidden
                  >
                    <Tooltip
                      label="UAS-sourced; not editable."
                      arrow="Right"
                    />
                  </div>
                </div>
              ) : (
                <Switch
                  size="Small"
                  checked={Boolean(row.editableByEndUsers)}
                  onChange={(e) =>
                    onChangeEditable((e.target as HTMLInputElement).checked)
                  }
                  aria-label={`Editable by end users — ${row.attribute}`}
                />
              )}
            </div>

            {/* 4. Link to AD/LDAP */}
            <div
              className={
                isUas
                  ? styles['attribute-table__menu-tooltip-wrap']
                  : undefined
              }
            >
              <MenuItem
                label="Link to AD/LDAP"
                leadingVisual={<Icon size="16" glyph={<SyncIcon />} />}
                disabled={isUas}
                aria-describedby={isUas ? linkDescId : undefined}
                onClick={() => {
                  // Prototype: no-op. Would launch AD/LDAP attribute mapping flow.
                  onClose();
                }}
              />
              {isUas && (
                <>
                  <span
                    id={linkDescId}
                    className={styles['attribute-table__sr-only']}
                  >
                    Already linked to UAS connector.
                  </span>
                  <div
                    className={styles['attribute-table__menu-tooltip']}
                    aria-hidden
                  >
                    <Tooltip
                      label="Already linked to UAS connector."
                      arrow="Right"
                    />
                  </div>
                </>
              )}
            </div>

            <PopoverMenuLocalDivider />

            {/* 5. Duplicate property */}
            <div
              className={
                isUas
                  ? styles['attribute-table__menu-tooltip-wrap']
                  : undefined
              }
            >
              <MenuItem
                label="Duplicate property"
                leadingVisual={<Icon size="16" glyph={<ContentCopyIcon />} />}
                disabled={isUas}
                aria-describedby={isUas ? duplicateDescId : undefined}
                onClick={onDuplicate}
              />
              {isUas && (
                <>
                  <span
                    id={duplicateDescId}
                    className={styles['attribute-table__sr-only']}
                  >
                    UAS-sourced; cannot duplicate.
                  </span>
                  <div
                    className={styles['attribute-table__menu-tooltip']}
                    aria-hidden
                  >
                    <Tooltip
                      label="UAS-sourced; cannot duplicate."
                      arrow="Right"
                    />
                  </div>
                </>
              )}
            </div>

            {/* 6. Delete property — UAS-blocked OR policy-count-blocked */}
            {isUas ? (
              <div className={styles['attribute-table__menu-tooltip-wrap']}>
                <MenuItem
                  label="Delete property"
                  leadingVisual={
                    <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                  }
                  destructive
                  disabled
                  aria-describedby={uasDeleteDescId}
                />
                <span
                  id={uasDeleteDescId}
                  className={styles['attribute-table__sr-only']}
                >
                  UAS-sourced; remove the connector to unlink.
                </span>
                <div
                  className={styles['attribute-table__menu-tooltip']}
                  aria-hidden
                >
                  <Tooltip
                    label="UAS-sourced; remove the connector to unlink."
                    arrow="Right"
                  />
                </div>
              </div>
            ) : (
              <div
                className={
                  policyBlocked
                    ? styles['attribute-table__menu-tooltip-wrap']
                    : undefined
                }
              >
                <MenuItem
                  label="Delete property"
                  leadingVisual={
                    <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                  }
                  destructive
                  disabled={policyBlocked}
                  aria-describedby={policyBlocked ? deleteDescId : undefined}
                  onClick={onDelete}
                />
                {policyBlocked && (
                  <>
                    <span
                      id={deleteDescId}
                      className={styles['attribute-table__sr-only']}
                    >
                      {policyMessage}
                    </span>
                    <div
                      className={styles['attribute-table__menu-tooltip']}
                      aria-hidden
                    >
                      <Tooltip label={policyMessage} arrow="Right" />
                    </div>
                  </>
                )}
              </div>
            )}
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}

/** Local divider — re-exports `PopoverMenuDivider` indirectly to avoid an
 * extra import statement for one use. */
function PopoverMenuLocalDivider() {
  return (
    <div className={styles['attribute-table__menu-divider']} role="separator" />
  );
}
