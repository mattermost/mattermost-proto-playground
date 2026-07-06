import { useEffect, useMemo, useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import PoundIcon from '@mattermost/compass-icons/components/pound';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Switch from '@/components/ui/Switch/Switch';
import TextInput from '@/components/ui/TextInput/TextInput';
import { TYPE_ICON } from './attrIcons';
import AttributeRowMenu from './AttributeRowMenu';
import type { AttributeMenuItem } from './AttributeRowMenu';
import ValueChipsCell from './ValueChipsCell';
import ClassificationPill from './ClassificationPill';
import DeleteAttributeConfirmModal from './DeleteAttributeConfirmModal';
import ChannelConfigModal from './ChannelConfigModal';
import {
  channelBinding,
  deleteDisposition,
  globalsNotAppliedTo,
  makeBinding,
  postBinding,
} from './data';
import type {
  AttrDef,
  AttrValue,
  Binding,
  Mutability,
  PostInheritanceMode,
  WriteTier,
} from './data';
import sharedStyles from './AttributeSystem.module.scss';
import styles from './ChannelAttributesScene.module.scss';

type Variant = 'inline' | 'hybrid';

interface ChannelAttributesSceneProps {
  /** All attribute defs — rows are filtered to defs that apply to Channels. */
  defs: AttrDef[];
  /** Patches the Channels binding (Required, Show-in-header, vocabulary, mutability, who-can-set, propagateToPosts). */
  onPatchBinding: (
    defId: string,
    resource: 'Channels',
    patch: Partial<Binding>,
  ) => void;
  /** Definition-level patches (rename routes here too via { name }). */
  onPatch: (defId: string, patch: Partial<AttrDef>) => void;
  /** Value-catalog edits (Add / remove inline chips). */
  onPatchValues: (defId: string, values: AttrValue[]) => void;
  /** Rename handler — kept separate to mirror UserAttributesScene's shape. */
  onRename: (defId: string, name: string) => void;
  onDuplicate: (defId: string) => void;
  onDelete: (defId: string) => void;
  onDeactivate: (defId: string) => void;
  /**
   * Legacy hook from the previous build — kept to preserve the prop contract
   * passed in `AttributeSystem.tsx`. The Configure cog now opens
   * `ChannelConfigModal` locally; this handler is retained for parity but no
   * longer wired. Safe to remove on a future contract bump.
   */
  onConfigureBinding?: (defId: string, resource: 'Channels') => void;
  /** "+ Add attribute" footer — opens the Add modal in the 'Channels' flow. */
  onAdd: (mode: 'existing' | 'create') => void;
  /**
   * Visual variant.
   *  - 'inline'  — Direction C primary. Required / Show in header / Open
   *                options / Inherited→posts promoted to dedicated columns.
   *                Configure cog opens a tabbed modal (Behavior / Posts) for
   *                the two multi-option axes. `…` is lifecycle-only.
   *  - 'hybrid'  — Direction C comparison. Minimal table (Property / Type /
   *                Values / Configure / `…`). All axes live in a single
   *                grouped modal opened by Configure.
   */
  variant?: Variant;
}

/**
 * Channel Attributes — System Console admin surface.
 *
 * Implements Direction C from
 * `specs/attribute-system/ideation-channel-attr-config.md`:
 *   "Quick-toggle columns + tabbed Configure modal."
 *
 * The columns ARE the state. Below-name badges have been removed; the four
 * boolean axes (Required, Show in header, Open vocab, Inherited → posts)
 * each get a dedicated column whose cell editor is also the state read-out.
 * The two multi-option radio axes (Value editability after set, Who can set
 * the value) live behind a per-row Configure cog that opens
 * `ChannelConfigModal`. Lifecycle actions (Rename, Duplicate,
 * Delete/Deactivate) collapse back into the `…` overflow menu.
 *
 * Polish bar: matches `ChannelAssignScene` / `ChannelSettingsModal` —
 * tokenized spacing, semantic colors only, no hard-coded hex, focus-visible
 * outlines, accessible legends/fieldsets in the modal.
 */
export default function ChannelAttributesScene({
  defs,
  onPatchBinding,
  onPatch,
  onPatchValues,
  onRename,
  onDuplicate,
  onDelete,
  onDeactivate,
  onAdd,
  variant = 'inline',
}: ChannelAttributesSceneProps) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AttrDef | null>(null);
  const [renameFor, setRenameFor] = useState<AttrDef | null>(null);
  const [configureFor, setConfigureFor] = useState<AttrDef | null>(null);
  const addWrapRef = useRef<HTMLDivElement>(null);

  // Rows = defs whose appliesTo includes 'Channels'. Exclude system rows and
  // deactivated defs — Channels has no built-in CPA fields.
  const rows = useMemo(
    () =>
      defs.filter(
        (d) => d.appliesTo.includes('Channels') && !d.system && !d.deactivated,
      ),
    [defs],
  );

  const globalsAvailable = useMemo(
    () => globalsNotAppliedTo(defs, 'Channels').length,
    [defs],
  );

  // Outside-click + Escape closes the "+ Add attribute" dropdown.
  useEffect(() => {
    if (!addOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (addWrapRef.current?.contains(e.target as Node)) return;
      setAddOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setAddOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [addOpen]);

  function buildMenuItems(def: AttrDef): AttributeMenuItem[] {
    const disposition = deleteDisposition(def);
    const items: AttributeMenuItem[] = [];

    items.push({
      kind: 'item',
      id: 'rename',
      label: 'Rename',
      icon: <Icon size="16" glyph={<PencilOutlineIcon />} />,
      disabled: def.protected,
      disabledTooltip: def.protected
        ? 'Protected system attribute — name is fixed.'
        : undefined,
      onClick: () => setRenameFor(def),
    });

    items.push({
      kind: 'item',
      id: 'duplicate',
      label: 'Duplicate attribute',
      icon: <Icon size="16" glyph={<ContentCopyIcon />} />,
      onClick: () => onDuplicate(def.id),
    });

    items.push({ kind: 'divider', id: 'destructive-divider' });

    if (disposition === 'blocked') {
      items.push({
        kind: 'item',
        id: 'delete',
        label: 'Delete attribute',
        icon: <Icon size="16" glyph={<TrashCanOutlineIcon />} />,
        destructive: true,
        disabled: true,
        disabledTooltip: def.system
          ? 'Built-in system attribute — cannot be deleted.'
          : 'Protected system attribute — cannot be deleted.',
      });
    } else {
      items.push({
        kind: 'item',
        id: 'delete',
        label:
          disposition === 'deactivate'
            ? 'Deactivate attribute'
            : 'Delete attribute',
        icon: <Icon size="16" glyph={<TrashCanOutlineIcon />} />,
        destructive: true,
        onClick: () => setConfirmDelete(def),
      });
    }

    return items;
  }

  const isHybrid = variant === 'hybrid';

  return (
    <>
      <AdminPanel
        className={sharedStyles.widePanel}
        title="Channel attributes"
        subtitle="Govern the attributes channels carry: required values, where they show, who can set them, and how posts inherit them."
        expandable
        defaultExpandedState="Expanded"
      >
        <div className={sharedStyles.gaTableWrap}>
          <table className={sharedStyles.gaTable}>
            <thead>
              <tr>
                <th className={sharedStyles.gaTable__handleCol} />
                <th scope="col">Property</th>
                <th scope="col">Type</th>
                <th scope="col">Values</th>
                {!isHybrid && (
                  <>
                    <th scope="col" className={styles['col--required']}>
                      <span className={styles.colHeader} title="Required on save">
                        Required
                      </span>
                    </th>
                    <th scope="col" className={styles['col--show']}>
                      <span
                        className={styles.colHeader}
                        title="Show the assigned value in the channel header"
                      >
                        Show in header
                      </span>
                    </th>
                    <th scope="col" className={styles['col--open']}>
                      <span
                        className={styles.colHeader}
                        title="Resource admins may add new options to the catalog"
                      >
                        Open options
                      </span>
                    </th>
                    <th scope="col" className={styles['col--inherit']}>
                      <span
                        className={styles.colHeader}
                        title="Inherit the channel's value onto new posts"
                      >
                        Inherited &rarr; posts
                      </span>
                    </th>
                  </>
                )}
                <th
                  scope="col"
                  className={
                    isHybrid
                      ? sharedStyles.gaTable__actionsCol
                      : styles['col--cog']
                  }
                >
                  <span className={styles.colHeader}>
                    {isHybrid ? 'Actions' : 'Configure'}
                  </span>
                </th>
                <th
                  scope="col"
                  className={sharedStyles.gaTable__actionsCol}
                  aria-label="Row actions"
                />
              </tr>
            </thead>
            <tbody>
              {rows.map((def) => {
                const binding = channelBinding(def);
                if (!binding) return null;
                const post = postBinding(def);
                const externallyManaged = Boolean(def.owner);
                const isClassification = def.id === 'classification';

                return (
                  <tr key={def.id}>
                    <td className={sharedStyles.gaTable__handle}>
                      <Icon size="16" glyph={<DragVerticalIcon />} />
                    </td>
                    <td>
                      <span className={styles.propertyCell}>
                        <span className={styles.propertyCell__name}>
                          {def.name}
                        </span>
                        {binding.required === 'Required' && (
                          <span
                            className={styles.propertyCell__required}
                            aria-label="required"
                            title="Required on save"
                          >
                            *
                          </span>
                        )}
                        {def.scope === 'global' && (
                          <span
                            className={sharedStyles.userAttrName__scope}
                          >
                            Global
                          </span>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className={sharedStyles.gaCell__withIcon}>
                        <Icon size="16" glyph={TYPE_ICON[def.type]} />
                        {def.type}
                      </span>
                    </td>
                    <td>
                      {isClassification ? (
                        <ClassificationValuesCell def={def} />
                      ) : (
                        <ValueChipsCell
                          def={def}
                          onPatch={(values) => onPatchValues(def.id, values)}
                        />
                      )}
                    </td>

                    {!isHybrid && (
                      <>
                        <td className={styles['col--required']}>
                          <span className={styles.switchCell}>
                            <Switch
                              size="Small"
                              checked={binding.required === 'Required'}
                              aria-label={`Required on save — ${def.name}`}
                              onChange={(e) =>
                                onPatchBinding(def.id, 'Channels', {
                                  required: (e.target as HTMLInputElement)
                                    .checked
                                    ? 'Required'
                                    : 'Optional',
                                })
                              }
                            />
                          </span>
                        </td>
                        <td className={styles['col--show']}>
                          <span className={styles.switchCell}>
                            <Switch
                              size="Small"
                              checked={binding.showInHeader}
                              aria-label={`Show in channel header — ${def.name}`}
                              onChange={(e) =>
                                onPatchBinding(def.id, 'Channels', {
                                  showInHeader: (e.target as HTMLInputElement)
                                    .checked,
                                })
                              }
                            />
                          </span>
                        </td>
                        <td className={styles['col--open']}>
                          {externallyManaged ? (
                            <MutedDash
                              tip="Value catalog is owned by an external source — new options must be added there."
                            />
                          ) : (
                            <span className={styles.switchCell}>
                              <Switch
                                size="Small"
                                checked={binding.vocabulary === 'Open'}
                                aria-label={`Allow new options — ${def.name}`}
                                onChange={(e) =>
                                  onPatchBinding(def.id, 'Channels', {
                                    vocabulary: (
                                      e.target as HTMLInputElement
                                    ).checked
                                      ? 'Open'
                                      : 'Closed',
                                  })
                                }
                              />
                            </span>
                          )}
                        </td>
                        <td className={styles['col--inherit']}>
                          {/* Any channel attribute can inherit to its posts —
                              enabling creates the Posts binding on the fly
                              (local snapshot; no global promotion required). */}
                          <InheritSegment
                            channelPropagates={Boolean(binding.propagateToPosts)}
                            postMode={post?.inheritanceMode ?? 'none'}
                            onChange={(next) =>
                              writeInheritance(def.id, next, onPatch, def)
                            }
                            attrName={def.name}
                          />
                        </td>
                      </>
                    )}

                    <td
                      className={
                        isHybrid
                          ? sharedStyles.gaTable__actions
                          : styles['col--cog']
                      }
                    >
                      {isHybrid ? (
                        <button
                          type="button"
                          className={styles.hybridConfigureBtn}
                          aria-label={`Configure ${def.name}`}
                          onClick={() => setConfigureFor(def)}
                        >
                          <Icon size="12" glyph={<CogOutlineIcon />} />
                          Configure
                        </button>
                      ) : (
                        <div className={styles.cog}>
                          <span className={styles.cog__row}>
                            <button
                              type="button"
                              className={styles.cog__button}
                              aria-label={`Configure ${def.name}`}
                              onClick={() => setConfigureFor(def)}
                            >
                              <span className={styles.cog__button__icon}>
                                <Icon size="12" glyph={<CogOutlineIcon />} />
                              </span>
                              <span className={styles.cog__button__label}>
                                Configure
                              </span>
                            </button>
                          </span>
                          <span className={styles.cog__summary}>
                            {shortMutability(binding.mutability)}
                            <span className={styles['cog__summary-sep']}>
                              ·
                            </span>
                            {shortWriteFloor(binding.whoCanSet)}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className={sharedStyles.gaTable__actions}>
                      <div className={styles.menuAnchor}>
                        <IconButton
                          size="X-Small"
                          aria-label={`More actions for ${def.name}`}
                          aria-haspopup="menu"
                          aria-expanded={menuId === def.id}
                          icon={
                            <Icon size="16" glyph={<DotsHorizontalIcon />} />
                          }
                          onClick={() =>
                            setMenuId((c) => (c === def.id ? null : def.id))
                          }
                        />
                        <AttributeRowMenu
                          open={menuId === def.id}
                          onClose={() => setMenuId(null)}
                          triggerLabel={def.name}
                          items={buildMenuItems(def)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td />
                  <td colSpan={isHybrid ? 5 : 9}>
                    <p className={sharedStyles.copy}>
                      No attributes apply to channels yet. Use “+ Add
                      attribute” to reuse a global attribute or create one
                      scoped to channels.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* "+ Add attribute" footer with dropdown menu. */}
          <div className={sharedStyles.gaAddWrap} ref={addWrapRef}>
            <button
              type="button"
              className={sharedStyles.gaAdd}
              aria-haspopup="menu"
              aria-expanded={addOpen}
              onClick={() => setAddOpen((c) => !c)}
            >
              <Icon size="16" glyph={<PlusIcon />} />
              Add attribute
              <Icon size="12" glyph={<ChevronDownIcon />} />
            </button>
            {addOpen && (
              <div
                className={sharedStyles.gaAddMenu}
                role="menu"
                aria-label="Add attribute options"
              >
                <PopoverMenu>
                  <MenuItem
                    label="Add a global attribute"
                    secondaryLabel={`${globalsAvailable} available`}
                    secondaryLabelPosition="Inline"
                    leadingVisual={<Icon size="16" glyph={<GlobeIcon />} />}
                    onClick={() => {
                      setAddOpen(false);
                      onAdd('existing');
                    }}
                  />
                  <MenuItem
                    label="Create new attribute"
                    secondaryLabel="Define a new attribute scoped to channels"
                    secondaryLabelPosition="Below"
                    leadingVisual={
                      <Icon size="16" glyph={<PoundIcon />} />
                    }
                    onClick={() => {
                      setAddOpen(false);
                      onAdd('create');
                    }}
                  />
                </PopoverMenu>
              </div>
            )}
          </div>
        </div>
      </AdminPanel>

      {configureFor && (
        <ChannelConfigModal
          def={configureFor}
          mode={isHybrid ? 'grouped' : 'tabbed'}
          onApply={(defId, channelPatch, postsPatch) => {
            // Rewrite both bindings atomically in a single onPatch — two
            // sequential setAttrs calls would race against React's snapshot.
            const target = defs.find((d) => d.id === defId);
            if (!target) return;
            onPatch(defId, {
              bindings: target.bindings.map((b) => {
                if (b.resource === 'Channels')
                  return { ...b, ...channelPatch };
                if (b.resource === 'Posts' && postsPatch)
                  return { ...b, ...postsPatch };
                return b;
              }),
            });
          }}
          onClose={() => setConfigureFor(null)}
        />
      )}

      {confirmDelete && (
        <DeleteAttributeConfirmModal
          def={confirmDelete}
          onDelete={(id) => {
            onDelete(id);
            setConfirmDelete(null);
          }}
          onDeactivate={(id) => {
            onDeactivate(id);
            setConfirmDelete(null);
          }}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {renameFor && (
        <RenamePrompt
          def={renameFor}
          onApply={(name) => {
            onPatch(renameFor.id, { name });
            onRename(renameFor.id, name);
            setRenameFor(null);
          }}
          onCancel={() => setRenameFor(null)}
        />
      )}
    </>
  );
}

/* ─── Inheritance segmented control ────────────────────────────────────── */

interface InheritSegmentProps {
  channelPropagates: boolean;
  postMode: PostInheritanceMode;
  attrName: string;
  onChange: (next: 'off' | 'inherit' | 'inherit-locked') => void;
}

function InheritSegment({
  channelPropagates,
  postMode,
  attrName,
  onChange,
}: InheritSegmentProps) {
  const state: 'off' | 'inherit' | 'inherit-locked' = !channelPropagates
    ? 'off'
    : postMode === 'channel-locked'
      ? 'inherit-locked'
      : 'inherit';

  const opts: Array<{
    value: 'off' | 'inherit' | 'inherit-locked';
    label: string;
    tip: string;
  }> = [
    {
      value: 'off',
      label: 'Off',
      tip: 'Posts do not inherit this channel attribute.',
    },
    {
      value: 'inherit',
      label: 'Inherit',
      tip: 'New posts copy the channel value at creation; authors may change it.',
    },
    {
      value: 'inherit-locked',
      label: 'Inherit + lock',
      tip: 'New posts copy the channel value at creation; authors cannot change it.',
    },
  ];

  return (
    <div
      className={styles.inheritSegment}
      role="radiogroup"
      aria-label={`Inheritance to posts — ${attrName}`}
    >
      {opts.map((o) => {
        const active = state === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.tip}
            className={[
              styles.inheritSegment__btn,
              active ? styles['inheritSegment__btn--active'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Persists a 3-state inheritance change as a single atomic patch covering
 * both Channels (`propagateToPosts`) and Posts (`inheritanceMode`).
 *
 * Two separate calls would race (the second reads a stale snapshot and clobbers
 * the first), so we emit ONE `onPatch` with the fully-rewritten def.
 *
 * If the attribute has no Posts binding yet (a channel-scoped attribute, not
 * promoted to global), enabling inheritance ADDS a Posts binding and extends
 * `appliesTo` — i.e. a resource-scoped attribute may span Channels + its Posts
 * for local inheritance, without full global promotion.
 */
function writeInheritance(
  defId: string,
  next: 'off' | 'inherit' | 'inherit-locked',
  onPatch: (defId: string, patch: Partial<AttrDef>) => void,
  def: AttrDef,
) {
  const propagateToPosts = next !== 'off';
  const postMode: PostInheritanceMode =
    next === 'off'
      ? 'none'
      : next === 'inherit-locked'
        ? 'channel-locked'
        : 'channel-default';

  const hasPostBinding = def.bindings.some((b) => b.resource === 'Posts');

  let bindings = def.bindings.map((b) => {
    if (b.resource === 'Channels') return { ...b, propagateToPosts };
    if (b.resource === 'Posts') return { ...b, inheritanceMode: postMode };
    return b;
  });

  let appliesTo = def.appliesTo;

  // First time inheritance is enabled on a channel-only attribute: give it a
  // Posts binding so the value can snapshot onto new posts. (No-op when turning
  // off with no existing Posts binding.)
  if (!hasPostBinding && next !== 'off') {
    bindings = [
      ...bindings,
      makeBinding('Posts', {
        inheritanceMode: postMode,
        whoCanSet: 'member',
      }),
    ];
    appliesTo = def.appliesTo.includes('Posts')
      ? def.appliesTo
      : [...def.appliesTo, 'Posts'];
  }

  onPatch(defId, { bindings, appliesTo });
}

/* ─── Classification values cell (uses ClassificationPill) ─────────────── */

function ClassificationValuesCell({ def }: { def: AttrDef }) {
  // Ranked Classification renders as filled banner-colored pills; static
  // (catalog edits happen via the Configure modal / Global Attributes scene).
  return (
    <span className={styles.classificationValues}>
      {def.values.map((v) => (
        <ClassificationPill key={v.id} valueId={v.id} label={v.label} />
      ))}
    </span>
  );
}

/* ─── Muted "—" with tooltip (used when an axis is N/A on this row) ───── */

function MutedDash({ tip }: { tip: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      className={styles.inheritUnavailable}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable so keyboard users can surface the tooltip
      tabIndex={0}
      aria-label={tip}
    >
      —
      {hovered && (
        <span className={styles.inheritUnavailable__tooltip} role="tooltip">
          {tip}
        </span>
      )}
    </span>
  );
}

/* ─── Short labels for the per-row Configure summary subtext ──────────── */

function shortMutability(m: Mutability): string {
  switch (m) {
    case 'Editable':
      return 'Editable';
    case 'Ratchet':
      return 'Raise only';
    case 'Locked':
      return 'Locked';
    case 'Approval':
      return 'Approval';
  }
}

function shortWriteFloor(tier: WriteTier): string {
  // Compressed labels for the row token; full WRITE_FLOOR_LABEL still lives
  // in the Configure modal where it gets the descriptions and breathing room.
  switch (tier) {
    case 'owner':
      return 'Owners';
    case 'sysadmin':
      return 'Sys Admins+';
    case 'admin':
      return 'Resource Admins+';
    case 'member':
      return 'Members+';
    case 'none':
      return 'Anyone';
  }
}

/* ─── Rename prompt (unchanged from prior build) ──────────────────────── */

function RenamePrompt({
  def,
  onApply,
  onCancel,
}: {
  def: AttrDef;
  onApply: (name: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(def.name);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const apply = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onApply(trimmed);
  };

  return (
    <div
      className={sharedStyles.modalOverlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <Modal
        size="Small"
        title={`Rename ‘${def.name}’`}
        subtitle="Choose a clear, human-friendly name. Policies referencing the attribute keep working."
        onClose={onCancel}
        footer={
          <>
            <Button emphasis="Tertiary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              emphasis="Primary"
              disabled={!draft.trim() || draft.trim() === def.name}
              onClick={apply}
            >
              Apply
            </Button>
          </>
        }
      >
        <TextInput
          ref={inputRef}
          size="Medium"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              apply();
            }
          }}
          aria-label="Attribute name"
        />
      </Modal>
    </div>
  );
}
