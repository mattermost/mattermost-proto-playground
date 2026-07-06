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
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
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
import PostConfigModal from './PostConfigModal';
import {
  appliesToPostsAndChannels,
  deleteDisposition,
  globalsNotAppliedTo,
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
import styles from './PostAttributesScene.module.scss';

interface PostAttributesSceneProps {
  /** All attribute defs — rows are filtered to defs that apply to Posts. */
  defs: AttrDef[];
  /** Patches the Posts binding (Required, inheritanceMode, vocabulary, mutability, who-can-set). */
  onPatchBinding: (
    defId: string,
    resource: 'Posts',
    patch: Partial<Binding>,
  ) => void;
  /** Definition-level patches (rename routes here too via { name }). */
  onPatch: (defId: string, patch: Partial<AttrDef>) => void;
  /** Value-catalog edits (Add / remove inline chips). */
  onPatchValues: (defId: string, values: AttrValue[]) => void;
  /** Rename handler — kept separate to mirror ChannelAttributesScene's shape. */
  onRename: (defId: string, name: string) => void;
  onDuplicate: (defId: string) => void;
  onDelete: (defId: string) => void;
  onDeactivate: (defId: string) => void;
  /** "+ Add attribute" footer — opens the Add modal in the 'Posts' flow. */
  onAdd: (mode: 'existing' | 'create') => void;
}

/**
 * Post Attributes — System Console admin surface.
 *
 * Mirrors `ChannelAttributesScene` (Direction C, inline variant) adapted for
 * Posts. The columns ARE the state: Required and Open options ride dedicated
 * switches; Channel inheritance is a 3-state segmented control (None / Inherit
 * / Inherit + lock) that writes directly to the Posts binding's
 * `inheritanceMode`. Configure cog opens `PostConfigModal` for the two
 * multi-option radio axes (value editability + who can set). Lifecycle
 * actions live in the `…` overflow menu.
 *
 * Posts differ from Channels on two axes:
 *  - There is no "Show in channel header" column (channel-only concern).
 *  - There is no `propagateToPosts` toggle — that lives on the channel side.
 *    The post side owns its own `inheritanceMode` axis, which is a simple
 *    single-binding write (no cross-binding atomic patch needed).
 *
 * Polish bar: matches `ChannelAttributesScene` — tokenized spacing, semantic
 * colors only, focus-visible outlines, accessible legends/fieldsets in the
 * modal.
 */
export default function PostAttributesScene({
  defs,
  onPatchBinding,
  onPatch,
  onPatchValues,
  onRename,
  onDuplicate,
  onDelete,
  onDeactivate,
  onAdd,
}: PostAttributesSceneProps) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AttrDef | null>(null);
  const [renameFor, setRenameFor] = useState<AttrDef | null>(null);
  const [configureFor, setConfigureFor] = useState<AttrDef | null>(null);
  const addWrapRef = useRef<HTMLDivElement>(null);

  // Rows = defs whose appliesTo includes 'Posts'. Exclude system rows and
  // deactivated defs — Posts has no built-in CPA fields.
  const rows = useMemo(
    () =>
      defs.filter(
        (d) => d.appliesTo.includes('Posts') && !d.system && !d.deactivated,
      ),
    [defs],
  );

  const globalsAvailable = useMemo(
    () => globalsNotAppliedTo(defs, 'Posts').length,
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

  return (
    <>
      <AdminPanel
        className={sharedStyles.widePanel}
        title="Post attributes"
        subtitle="Govern the attributes posts carry: required values, whether authors can add to the vocabulary, and how each post inherits from its channel."
        expandable
        defaultExpandedState="Expanded"
      >
        <div className={sharedStyles.gaTableWrap}>
          <table className={sharedStyles.gaTable}>
            <thead>
              <tr>
                <th className={sharedStyles['gaTable__handleCol']} />
                <th scope="col">Property</th>
                <th scope="col">Type</th>
                <th scope="col">Values</th>
                <th scope="col" className={styles['col--required']}>
                  <span className={styles.colHeader} title="Required on save">
                    Required
                  </span>
                </th>
                <th scope="col" className={styles['col--inherit']}>
                  <span
                    className={styles.colHeader}
                    title="How a new post inherits this attribute from its channel"
                  >
                    Channel inheritance
                  </span>
                </th>
                <th scope="col" className={styles['col--open']}>
                  <span
                    className={styles.colHeader}
                    title="Authors may add new options to the catalog from the composer"
                  >
                    Open options
                  </span>
                </th>
                <th scope="col" className={styles['col--cog']}>
                  <span className={styles.colHeader}>Configure</span>
                </th>
                <th
                  scope="col"
                  className={sharedStyles['gaTable__actionsCol']}
                  aria-label="Row actions"
                />
              </tr>
            </thead>
            <tbody>
              {rows.map((def) => {
                const binding = postBinding(def);
                if (!binding) return null;
                const supportsChannels = appliesToPostsAndChannels(def);
                const externallyManaged = Boolean(def.owner);
                const isClassification = def.id === 'classification';

                return (
                  <tr key={def.id}>
                    <td className={sharedStyles['gaTable__handle']}>
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
                            className={sharedStyles['userAttrName__scope']}
                          >
                            Global
                          </span>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className={sharedStyles['gaCell__withIcon']}>
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

                    <td className={styles['col--required']}>
                      <span className={styles.switchCell}>
                        <Switch
                          size="Small"
                          checked={binding.required === 'Required'}
                          aria-label={`Required on save — ${def.name}`}
                          onChange={(e) =>
                            onPatchBinding(def.id, 'Posts', {
                              required: (e.target as HTMLInputElement).checked
                                ? 'Required'
                                : 'Optional',
                            })
                          }
                        />
                      </span>
                    </td>

                    <td className={styles['col--inherit']}>
                      {supportsChannels ? (
                        <InheritSegment
                          mode={binding.inheritanceMode ?? 'none'}
                          onChange={(next) =>
                            onPatchBinding(def.id, 'Posts', {
                              inheritanceMode: next,
                            })
                          }
                          attrName={def.name}
                        />
                      ) : (
                        <MutedDash
                          label="Post-only"
                          tip="This attribute is defined only for Posts — there is no channel value to inherit. Apply it to Channels on Channel Attributes to enable inheritance."
                        />
                      )}
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
                              onPatchBinding(def.id, 'Posts', {
                                vocabulary: (e.target as HTMLInputElement)
                                  .checked
                                  ? 'Open'
                                  : 'Closed',
                              })
                            }
                          />
                        </span>
                      )}
                    </td>

                    <td className={styles['col--cog']}>
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
                    </td>

                    <td className={sharedStyles['gaTable__actions']}>
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
                  <td colSpan={8}>
                    <p className={sharedStyles.copy}>
                      No attributes apply to posts yet. Use “+ Add attribute” to
                      reuse a global attribute or create one scoped to posts.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* "+ Add attribute" footer with dropdown menu. */}
          <div className={sharedStyles['gaAddWrap']} ref={addWrapRef}>
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
                className={sharedStyles['gaAddMenu']}
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
                    secondaryLabel="Define a new attribute scoped to posts"
                    secondaryLabelPosition="Below"
                    leadingVisual={
                      <Icon size="16" glyph={<MessageTextOutlineIcon />} />
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
        <PostConfigModal
          def={configureFor}
          onApply={(defId, postsPatch) => {
            onPatchBinding(defId, 'Posts', postsPatch);
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
  mode: PostInheritanceMode;
  attrName: string;
  onChange: (next: PostInheritanceMode) => void;
}

/**
 * 3-state segmented control writing directly to the Posts binding's
 * `inheritanceMode`. Mirrors the Channel scene's segmented control visually,
 * but on this side it is a single-binding write (no cross-binding atomic
 * patch).
 */
function InheritSegment({ mode, attrName, onChange }: InheritSegmentProps) {
  const opts: Array<{
    value: PostInheritanceMode;
    label: string;
    tip: string;
  }> = [
    {
      value: 'none',
      label: 'None',
      tip: 'Posts do not inherit a channel value for this attribute.',
    },
    {
      value: 'channel-default',
      label: 'Inherit',
      tip: 'New posts copy the channel value at creation; authors may change it while composing.',
    },
    {
      value: 'channel-locked',
      label: 'Inherit + lock',
      tip: 'New posts copy the channel value at creation; authors cannot change it in the composer.',
    },
  ];

  return (
    <div
      className={styles.inheritSegment}
      role="radiogroup"
      aria-label={`Channel inheritance — ${attrName}`}
    >
      {opts.map((o) => {
        const active = mode === o.value;
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

/* ─── Muted token with tooltip (used when an axis is N/A on this row) ─── */

interface MutedDashProps {
  /** Visible label. Defaults to an em-dash. */
  label?: string;
  tip: string;
}

function MutedDash({ label = '—', tip }: MutedDashProps) {
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
      {label}
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

/* ─── Rename prompt (mirrors ChannelAttributesScene) ──────────────────── */

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
