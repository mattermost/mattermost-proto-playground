import { useEffect, useMemo, useRef, useState } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import Icon from '@/components/ui/Icon/Icon';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { useAnchoredMenuOpensAbove } from '@/hooks/useAnchoredMenuOpensAbove';
import ClassificationPill from './ClassificationPill';
import DisplayLocationControl from './DisplayLocationControl';
import {
  channelBinding,
  hasMaskedValuesForCaller,
  inheritanceIsActive,
  MASKED_VALUE_TOKEN,
  normalizeDisplayLocations,
  visibleValuesForCaller,
} from './data';
import type {
  AttrDef,
  AttrValue,
  Binding,
  DisplayLocations,
  ResourceType,
} from './data';
import styles from './ChannelSettingsModal.module.scss';

const RESOURCE: ResourceType = 'Channels';

const channelSettingsModalSelector = `.${styles['channel-settings-modal']}`;

/** Channel admins may set values when the binding allows admin / member. */
function channelAdminCanSet(tier: string): boolean {
  return tier === 'admin' || tier === 'member' || tier === 'none';
}

export interface ChannelAssignSceneProps {
  defs: AttrDef[];
  /**
   * Seeded display-location overrides (per-resource setting). When omitted,
   * falls back to the binding's `displayLocations`, then to header for
   * showInHeader bindings, otherwise hidden.
   */
  displayLocationOverrides?: Record<string, DisplayLocations>;
  /** Notifies parent (ChannelSettingsModal) when local state diverges. */
  onDirtyChange?: (dirty: boolean) => void;
  /** Notifies parent of validation state (true when a required attr is unset). */
  onValidityChange?: (hasRequiredUnset: boolean) => void;
  /**
   * When non-null, the parent has requested a save attempt. The scene flips
   * dirty → false. Bumped by the parent each save request.
   */
  saveToken?: number;
  /** When bumped, scene resets to initial state (Undo from modal footer). */
  resetToken?: number;
  /** Stub: "+ Add attribute". Hooked by parent when defined. */
  onAddAttribute?: () => void;
}

/**
 * Initial assignments shape: each attribute id holds an array of value ids
 * (single-value attrs simply hold a single-element array). Empty array means
 * unset. This shape lets Program (Select) carry one item and a future
 * Multiselect carry many, without changing the table render path.
 */
type Assignments = Record<string, string[]>;

/**
 * Channel admin value-assignment surface. Lives inside the Attributes tab of
 * `ChannelSettingsModal`. Columns: Property | Value | Inherited to posts |
 * Show in | Actions.
 *
 * Visual baseline matches the Figma reference at
 * `specs/attribute-system/mockups/Channel Settings - Assign (figma reference).png`.
 * Notable departures from the previous implementation:
 *
 *  - Locked attributes (e.g. Classification) render as a single filled pill —
 *    the lock affordance lives in a Tooltip on hover rather than as inline
 *    copy below the row.
 *  - Multi-value attributes (e.g. Program) render as removable Chips plus a
 *    leading "+" Add affordance — no chevron-style picker for v1.
 *  - Empty attributes (e.g. Timezone) render as a clean "Select a value ▾"
 *    select-style trigger that matches the DisplayLocationControl pill.
 *  - Trash button: error-tone red for editable rows, neutral gray-disabled
 *    for required/locked rows.
 */
export default function ChannelAssignScene({
  defs,
  displayLocationOverrides,
  onDirtyChange,
  onValidityChange,
  saveToken,
  resetToken,
  onAddAttribute,
}: ChannelAssignSceneProps) {
  const applicable = useMemo(
    () => defs.filter((d) => d.appliesTo.includes(RESOURCE)),
    [defs],
  );

  // Seed: Classification → UNCLASSIFIED, Program → Huntsville (synthetic
  // value id; see "Data seed deltas" notes returned with this build).
  const seedAssignments: Assignments = useMemo(() => {
    const map: Assignments = {};
    for (const def of applicable) {
      if (def.id === 'classification') map[def.id] = ['u'];
      else if (def.id === 'program') map[def.id] = ['huntsville'];
      else map[def.id] = [];
    }
    return map;
  }, [applicable]);

  const [assigned, setAssigned] = useState<Assignments>(seedAssignments);
  const [saved, setSaved] = useState<Set<string>>(() => {
    // Locked attributes that already have a value start as committed.
    const next = new Set<string>();
    for (const def of applicable) {
      const b = channelBinding(def);
      if (
        b &&
        (b.mutability === 'Locked' || b.mutability === 'Approval') &&
        (seedAssignments[def.id]?.length ?? 0) > 0
      ) {
        next.add(def.id);
      }
    }
    return next;
  });

  // Per-row display-location state — seeded from binding or override.
  const initialDisplayLocations = useMemo(() => {
    const map: Record<string, DisplayLocations> = {};
    for (const def of applicable) {
      const b = channelBinding(def);
      const seed =
        displayLocationOverrides?.[def.id] ??
        b?.displayLocations ??
        (b?.showInHeader ? (['header'] as DisplayLocations) : 'hidden');
      map[def.id] = normalizeDisplayLocations(seed);
    }
    return map;
  }, [applicable, displayLocationOverrides]);

  const [displayLocations, setDisplayLocations] = useState<
    Record<string, DisplayLocations>
  >(initialDisplayLocations);

  const [dirty, setDirty] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Required-not-set validation.
  const requiredUnset = useMemo(
    () =>
      applicable.filter((def) => {
        const b = channelBinding(def);
        if (!b || b.required !== 'Required') return false;
        return (assigned[def.id]?.length ?? 0) === 0;
      }),
    [applicable, assigned],
  );
  const hasRequiredUnset = requiredUnset.length > 0;

  // Reset to seeded state when parent bumps resetToken (Undo).
  useEffect(() => {
    if (resetToken === undefined) return;
    setAssigned(seedAssignments);
    setSaved(() => {
      const next = new Set<string>();
      for (const def of applicable) {
        const b = channelBinding(def);
        if (
          b &&
          (b.mutability === 'Locked' || b.mutability === 'Approval') &&
          (seedAssignments[def.id]?.length ?? 0) > 0
        ) {
          next.add(def.id);
        }
      }
      return next;
    });
    setDisplayLocations(initialDisplayLocations);
    setDirty(false);
    setShowValidation(false);
    onDirtyChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  // Commit save when parent bumps saveToken.
  useEffect(() => {
    if (saveToken === undefined) return;
    setSaved((prev) => {
      const next = new Set(prev);
      for (const def of applicable) {
        if ((assigned[def.id]?.length ?? 0) > 0) next.add(def.id);
      }
      return next;
    });
    if (hasRequiredUnset) {
      setShowValidation(true);
    } else {
      setDirty(false);
      setShowValidation(false);
      onDirtyChange?.(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveToken]);

  useEffect(() => {
    onValidityChange?.(hasRequiredUnset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRequiredUnset]);

  function markDirty() {
    if (!dirty) {
      setDirty(true);
      onDirtyChange?.(true);
    }
  }

  function setSingleValue(def: AttrDef, binding: Binding, next: string | null) {
    setAssigned((prev) => ({
      ...prev,
      [def.id]: next ? [next] : [],
    }));
    markDirty();
    if (
      next &&
      (binding.mutability === 'Locked' || binding.mutability === 'Approval')
    ) {
      setSaved((prev) => new Set(prev).add(def.id));
    }
  }

  function removeValueFromMulti(def: AttrDef, valueId: string) {
    setAssigned((prev) => ({
      ...prev,
      [def.id]: (prev[def.id] ?? []).filter((id) => id !== valueId),
    }));
    markDirty();
  }

  function addValueToMulti(def: AttrDef, valueId: string) {
    setAssigned((prev) => {
      const current = prev[def.id] ?? [];
      if (current.includes(valueId)) return prev;
      return { ...prev, [def.id]: [...current, valueId] };
    });
    markDirty();
  }

  function setLocationFor(defId: string, next: DisplayLocations) {
    setDisplayLocations((prev) => ({
      ...prev,
      [defId]: normalizeDisplayLocations(next),
    }));
    markDirty();
  }

  return (
    <div className={styles['attrs-pane']}>
      <header className={styles['attrs-pane__header']}>
        <h2 className={styles['attrs-pane__title']}>Channel attributes</h2>
        <p className={styles['attrs-pane__subtitle']}>
          Control what channel attributes are currently active or displayed in
          the channel header.
        </p>
      </header>

      {showValidation && hasRequiredUnset && (
        <div className={styles['attrs-pane__validation']} role="alert">
          <Icon size="16" glyph={<AlertOutlineIcon />} />
          <span>
            {requiredUnset.length === 1
              ? `${requiredUnset[0].name} is required.`
              : `${requiredUnset.length} required attributes are unset.`}
          </span>
        </div>
      )}

      <div className={styles['attrs-table-wrap']}>
        <table className={styles['attrs-table']}>
          <thead>
            <tr>
              <th scope="col" className={styles['attrs-table__col-property']}>
                Property
              </th>
              <th scope="col" className={styles['attrs-table__col-value']}>
                Value
              </th>
              <th scope="col" className={styles['attrs-table__col-inherited']}>
                Inherited to posts
              </th>
              <th scope="col" className={styles['attrs-table__col-show-in']}>
                Show in
              </th>
              <th
                scope="col"
                className={styles['attrs-table__col-actions']}
                aria-label="Actions"
              />
            </tr>
          </thead>
          <tbody>
            {applicable.map((def) => {
              const binding = channelBinding(def);
              if (!binding) return null;

              const values = assigned[def.id] ?? [];
              const isLocked =
                saved.has(def.id) &&
                (binding.mutability === 'Locked' ||
                  binding.mutability === 'Approval');
              const noPermission = !channelAdminCanSet(binding.whoCanSet);
              const inheritActive = inheritanceIsActive(def);
              const isRequired = binding.required === 'Required';
              const requiredUnsetRow = isRequired && values.length === 0;
              const masked =
                hasMaskedValuesForCaller(def) && values.length === 0;

              // Trash semantics: error-tone for editable removable rows;
              // neutral-disabled for protected/required-locked rows.
              const cannotRemove =
                def.protected || isRequired || isLocked || noPermission;

              return (
                <tr key={def.id} className={styles['attrs-table__row']}>
                  <td className={styles['attrs-table__cell-property']}>
                    <span className={styles['attrs-table__property']}>
                      {def.name}
                      {isRequired && (
                        <span
                          className={styles['attrs-table__required']}
                          aria-label="required"
                        >
                          *
                        </span>
                      )}
                    </span>
                  </td>

                  <td className={styles['attrs-table__cell-value']}>
                    <ValueCell
                      def={def}
                      binding={binding}
                      values={values}
                      isLocked={isLocked}
                      noPermission={noPermission}
                      masked={masked}
                      requiredUnset={showValidation && requiredUnsetRow}
                      onSetSingle={(id) => setSingleValue(def, binding, id)}
                      onRemoveMulti={(id) => removeValueFromMulti(def, id)}
                      onAddMulti={(id) => addValueToMulti(def, id)}
                    />
                  </td>

                  <td className={styles['attrs-table__cell-inherited']}>
                    <InheritedCell active={inheritActive} />
                  </td>

                  <td className={styles['attrs-table__cell-show-in']}>
                    <DisplayLocationControl
                      def={def}
                      value={displayLocations[def.id]}
                      onChange={(next) => setLocationFor(def.id, next)}
                      disabled={noPermission}
                    />
                  </td>

                  <td className={styles['attrs-table__cell-actions']}>
                    <button
                      type="button"
                      className={[
                        styles['attrs-table__trash'],
                        cannotRemove
                          ? styles['attrs-table__trash--disabled']
                          : styles['attrs-table__trash--danger'],
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-label={`Remove ${def.name} from channel`}
                      disabled={cannotRemove}
                      title={
                        def.protected || isRequired
                          ? `${def.name} is required and cannot be removed`
                          : isLocked
                            ? 'Locked — contact a system admin'
                            : `Remove ${def.name} from channel`
                      }
                    >
                      <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <button
          type="button"
          className={styles['attrs-pane__add']}
          onClick={() => onAddAttribute?.()}
        >
          <span className={styles['attrs-pane__add-icon']} aria-hidden>
            <Icon size="16" glyph={<PlusIcon />} />
          </span>
          Add attribute
        </button>
      </div>
    </div>
  );
}

interface ValueCellProps {
  def: AttrDef;
  binding: Binding;
  values: string[];
  isLocked: boolean;
  noPermission: boolean;
  masked: boolean;
  requiredUnset: boolean;
  onSetSingle: (id: string | null) => void;
  onRemoveMulti: (id: string) => void;
  onAddMulti: (id: string) => void;
}

/**
 * Value cell renderer. Switches on the binding + assignment shape:
 *
 *  - Locked + has value → solid filled pill with hover Tooltip carrying the
 *    lock reason (no inline copy).
 *  - Masked + empty → masked monospace token.
 *  - Multi-value (e.g. Program) → removable chips + leading "+" add affordance.
 *  - Single-value (e.g. Classification when editable, Timezone) → either the
 *    selected value as a chip OR a "Select a value ▾" trigger.
 */
function ValueCell({
  def,
  binding,
  values,
  isLocked,
  noPermission,
  masked,
  requiredUnset,
  onSetSingle,
  onRemoveMulti,
  onAddMulti,
}: ValueCellProps) {
  const visible = visibleValuesForCaller(def);
  const isRanked = def.type === 'Ranked';
  const isMulti = def.type === 'Multiselect';

  if (isLocked && values.length > 0) {
    return (
      <LockedValuePill
        def={def}
        binding={binding}
        valueIds={values}
        ranked={isRanked}
      />
    );
  }

  if (masked) {
    return (
      <span
        className={styles['value-cell__masked']}
        aria-label="Masked value"
      >
        {MASKED_VALUE_TOKEN}
      </span>
    );
  }

  // Multi-value (Program). Render removable chips + a small "+" add button.
  if (isMulti) {
    return (
      <MultiValueCell
        def={def}
        valueIds={values}
        visible={visible}
        disabled={noPermission}
        onRemove={onRemoveMulti}
        onAdd={onAddMulti}
      />
    );
  }

  // Single-value: either picker trigger (no value) or selected chip.
  if (values.length === 0) {
    return (
      <SingleValueTrigger
        visible={visible}
        disabled={noPermission}
        invalid={requiredUnset}
        onPick={onSetSingle}
      />
    );
  }

  const valueId = values[0];
  const value = def.values.find((v) => v.id === valueId);
  if (!value) {
    return (
      <SingleValueTrigger
        visible={visible}
        disabled={noPermission}
        invalid={requiredUnset}
        onPick={onSetSingle}
      />
    );
  }

  if (isRanked) {
    return (
      <RankedValueChip
        label={value.label}
        rank={value.rank}
        size="Small"
        onRemove={
          binding.required === 'Required' || isLocked
            ? undefined
            : () => onSetSingle(null)
        }
      />
    );
  }

  return (
    <SingleValueTrigger
      visible={visible}
      disabled={noPermission}
      invalid={false}
      onPick={onSetSingle}
      currentLabel={value.label}
    />
  );
}

/**
 * Locked, filled pill. Reuses RankedValueChip for ranked attributes so the
 * brand-treatment carries through. Plain-text variant for other attributes.
 * Lock affordance lives entirely in the Tooltip — no inline copy.
 */
function LockedValuePill({
  def,
  binding,
  valueIds,
  ranked,
}: {
  def: AttrDef;
  binding: Binding;
  valueIds: string[];
  ranked: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const value = def.values.find((v) => v.id === valueIds[0]);
  if (!value) return null;

  const lockCopy =
    binding.mutability === 'Approval'
      ? `${def.name} is locked. Changes require second-person approval.`
      : `${def.name} is locked after assignment.`;

  return (
    <span
      className={styles['locked-value']}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable so keyboard users can surface the lock-reason Tooltip
      tabIndex={0}
      aria-label={`${def.name}: ${value.label}. ${lockCopy}`}
    >
      {def.id === 'classification' ? (
        <ClassificationPill
          valueId={value.id}
          label={value.label}
          size="Small"
          locked
        />
      ) : (
        <>
          {ranked ? (
            <span className={styles['locked-value__ranked']}>
              <RankedValueChip
                label={value.label}
                rank={value.rank}
                size="Small"
              />
            </span>
          ) : (
            <span className={styles['locked-value__plain']}>{value.label}</span>
          )}
          <span className={styles['locked-value__lock']} aria-hidden>
            <Icon size="12" glyph={<LockOutlineIcon />} />
          </span>
        </>
      )}
      {hovered && (
        <span className={styles['locked-value__tooltip']} role="tooltip">
          {lockCopy}
        </span>
      )}
    </span>
  );
}

/**
 * Multi-value cell: removable chips + leading "+" trigger. The Add trigger
 * opens a tiny anchored popover with the remaining options.
 */
function MultiValueCell({
  def,
  valueIds,
  visible,
  disabled,
  onRemove,
  onAdd,
}: {
  def: AttrDef;
  valueIds: string[];
  visible: AttrValue[];
  disabled: boolean;
  onRemove: (id: string) => void;
  onAdd: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useOutsideClose(rootRef, open, () => setOpen(false));
  const opensAbove = useAnchoredMenuOpensAbove(
    open,
    rootRef,
    menuRef,
    channelSettingsModalSelector,
  );

  // Pool of values: any in the visible catalog OR synthetic seeded values
  // (e.g. Huntsville, which lives only in the Assign scene's seed today).
  const allValues: AttrValue[] = [
    ...visible,
    ...SYNTHETIC_VALUES_BY_ATTR[def.id]?.filter(
      (v) => !visible.some((vv) => vv.id === v.id),
    ) ?? [],
  ];

  const remaining = allValues.filter((v) => !valueIds.includes(v.id));

  return (
    <div className={styles['multi-value']} ref={rootRef}>
      {valueIds.map((id) => {
        const value = allValues.find((v) => v.id === id);
        const label = value?.label ?? id;
        return (
          <span key={id} className={styles['multi-value__chip']}>
            <span className={styles['multi-value__chip-label']}>{label}</span>
            {!disabled && (
              <button
                type="button"
                className={styles['multi-value__chip-remove']}
                onClick={() => onRemove(id)}
                aria-label={`Remove ${label}`}
              >
                <CloseCircleIcon size={12} aria-hidden />
              </button>
            )}
          </span>
        );
      })}

      {!disabled && remaining.length > 0 && (
        <>
          <button
            type="button"
            className={styles['multi-value__add']}
            aria-label={`Add another ${def.name} value`}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((c) => !c)}
          >
            <Icon size="12" glyph={<PlusIcon />} />
          </button>

          {open && (
            <div
              ref={menuRef}
              className={[
                styles['multi-value__menu'],
                opensAbove ? styles['multi-value__menu--above'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
              role="listbox"
            >
              {remaining.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className={styles['multi-value__menu-item']}
                  onClick={() => {
                    onAdd(v.id);
                    setOpen(false);
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Select-style trigger for single-value attributes. Matches the
 * DisplayLocationControl pill: gray bg, hairline border, chevron, radius-s.
 */
function SingleValueTrigger({
  visible,
  disabled,
  invalid,
  onPick,
  currentLabel,
}: {
  visible: AttrValue[];
  disabled: boolean;
  invalid: boolean;
  onPick: (id: string | null) => void;
  currentLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useOutsideClose(rootRef, open, () => setOpen(false));
  const opensAbove = useAnchoredMenuOpensAbove(
    open,
    rootRef,
    menuRef,
    channelSettingsModalSelector,
  );

  return (
    <div className={styles['select-trigger']} ref={rootRef}>
      <button
        type="button"
        className={[
          styles['select-trigger__button'],
          open ? styles['select-trigger__button--open'] : '',
          invalid ? styles['select-trigger__button--invalid'] : '',
          !currentLabel ? styles['select-trigger__button--empty'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((c) => !c)}
      >
        <span className={styles['select-trigger__label']}>
          {currentLabel ?? 'Select a value'}
        </span>
        <Icon
          size="12"
          glyph={<ChevronDownIcon />}
          className={styles['select-trigger__chevron']}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          className={[
            styles['select-trigger__menu'],
            opensAbove ? styles['select-trigger__menu--above'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          role="listbox"
        >
          {visible.length === 0 ? (
            <div className={styles['select-trigger__menu-empty']}>
              No values available
            </div>
          ) : (
            <>
              {currentLabel && (
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  className={styles['select-trigger__menu-item']}
                  onClick={() => {
                    onPick(null);
                    setOpen(false);
                  }}
                >
                  Clear value
                </button>
              )}
              {visible.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="option"
                  aria-selected={currentLabel === v.label}
                  className={styles['select-trigger__menu-item']}
                  onClick={() => {
                    onPick(v.id);
                    setOpen(false);
                  }}
                >
                  {v.label}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Synthetic seeded values used by the Assign scene only. Keeping this here
 * (rather than mutating `data.ts`) means the rest of the prototype is not
 * coupled to the Figma's "Huntsville" example. Returned in the build notes
 * as a candidate seed delta for `data.ts`.
 */
const SYNTHETIC_VALUES_BY_ATTR: Record<string, AttrValue[]> = {
  program: [
    { id: 'huntsville', label: 'Huntsville' },
    { id: 'shield', label: 'Operation Shield' },
    { id: 'sentinel', label: 'Project Sentinel' },
  ],
};

function InheritedCell({ active }: { active: boolean }) {
  // Plain "Yes"/"No" copy per Figma. Tooltip carries the consequence.
  const [hovered, setHovered] = useState(false);
  const text = active ? 'Yes' : 'No';
  const help = active
    ? 'Posts created in this channel will inherit this value at creation.'
    : 'Posts in this channel will not inherit this value.';
  return (
    <span
      className={styles['inherited-cell']}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable so keyboard users can surface the consequence Tooltip
      tabIndex={0}
      title={help}
      aria-label={`Inherited to posts: ${text}. ${help}`}
    >
      {text}
      {hovered && (
        <span className={styles['inherited-cell__tooltip']} role="tooltip">
          {help}
        </span>
      )}
    </span>
  );
}
