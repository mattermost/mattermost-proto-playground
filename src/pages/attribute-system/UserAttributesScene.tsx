import { useEffect, useMemo, useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import EyeOffOutlineIcon from '@mattermost/compass-icons/components/eye-off-outline';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import ArrowUpBoldCircleOutlineIcon from '@mattermost/compass-icons/components/arrow-up-bold-circle-outline';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import { TYPE_ICON } from './attrIcons';
import AttributeRowMenu from './AttributeRowMenu';
import type { AttributeMenuItem } from './AttributeRowMenu';
import ValueChipsCell from './ValueChipsCell';
import DeleteAttributeConfirmModal from './DeleteAttributeConfirmModal';
import {
  BUILT_IN_USER_FIELDS,
  canPromote,
  deleteDisposition,
  globalsNotAppliedTo,
  syncNeedsAttention,
} from './data';
import type { AttrDef, AttrValue, Binding } from './data';
import styles from './AttributeSystem.module.scss';

interface UserAttributesSceneProps {
  /** Configurable user attributes (defs applied to Users that are not `system`). */
  defs: AttrDef[];
  /** All attribute defs — used to count "globals not yet applied to Users". */
  allDefs: AttrDef[];
  onAddGlobal: () => void;
  onCreateNew: () => void;
  onPromote: (defId: string) => void;
  onDuplicate: (defId: string) => void;
  onDelete: (defId: string) => void;
  onDeactivate: (defId: string) => void;
  onPatchValues: (defId: string, values: AttrValue[]) => void;
  onPatchBinding: (
    defId: string,
    resource: 'Users',
    patch: Partial<Binding>,
  ) => void;
  onLinkExternalSource: (defId: string) => void;
  /** v2: hide visibility submenu; hardcode hide-when-empty. */
  simplified?: boolean;
}

function userBinding(def: AttrDef): Binding | undefined {
  return def.bindings.find((b) => b.resource === 'Users');
}

export default function UserAttributesScene({
  defs,
  allDefs,
  onAddGlobal,
  onCreateNew,
  onPromote,
  onDuplicate,
  onDelete,
  onDeactivate,
  onPatchValues,
  onPatchBinding,
  onLinkExternalSource,
  simplified = false,
}: UserAttributesSceneProps) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AttrDef | null>(null);
  const addWrapRef = useRef<HTMLDivElement>(null);

  // Configurable user attributes — defs applied to Users that are not built-in
  // system rows. Surface order: built-in (top) then configurable.
  const configurable = useMemo(
    () =>
      defs.filter(
        (d) => d.appliesTo.includes('Users') && !d.system,
      ),
    [defs],
  );

  const globalsAvailable = useMemo(
    () => globalsNotAppliedTo(allDefs, 'Users').length,
    [allDefs],
  );

  // Close the add dropdown on outside click / Escape.
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
    const binding = userBinding(def);
    const disposition = deleteDisposition(def);
    const showWhenEmpty = binding?.showWhenEmpty ?? false;
    const userEditable = binding?.userEditable ?? false;

    const items: AttributeMenuItem[] = [];

    if (!simplified) {
      items.push({
        kind: 'submenu',
        id: 'visibility',
        label: 'Visibility',
        icon: <Icon size="16" glyph={<EyeOutlineIcon />} />,
        secondaryLabel: showWhenEmpty ? 'Always show' : 'Hide when empty',
        submenu: [
          {
            kind: 'toggle',
            id: 'hide-when-empty',
            label: 'Hide when empty',
            icon: <Icon size="16" glyph={<EyeOffOutlineIcon />} />,
            checked: !showWhenEmpty,
            onToggle: (next) =>
              onPatchBinding(def.id, 'Users', { showWhenEmpty: !next }),
          },
          {
            kind: 'toggle',
            id: 'always-show',
            label: 'Always show',
            icon: <Icon size="16" glyph={<EyeOutlineIcon />} />,
            checked: showWhenEmpty,
            onToggle: (next) =>
              onPatchBinding(def.id, 'Users', { showWhenEmpty: next }),
          },
        ],
      });
    }

    items.push(
      {
        kind: 'toggle',
        id: 'user-editable',
        label: simplified
          ? 'Allow users to edit their own value'
          : 'Editable by users',
        icon: <Icon size="16" glyph={<PencilOutlineIcon />} />,
        checked: userEditable,
        disabled: Boolean(def.owner),
        disabledTooltip: def.owner
          ? 'Externally owned — values are managed by the source.'
          : undefined,
        onToggle: (next) =>
          onPatchBinding(def.id, 'Users', { userEditable: next }),
      },
      {
        kind: 'item',
        id: 'link-source',
        label: 'Link to external source',
        icon: <Icon size="16" glyph={<LinkVariantIcon />} />,
        onClick: () => onLinkExternalSource(def.id),
      },
    );

    if (canPromote(def)) {
      items.push({
        kind: 'item',
        id: 'promote',
        label: 'Promote to Global Attributes',
        icon: <Icon size="16" glyph={<ArrowUpBoldCircleOutlineIcon />} />,
        onClick: () => onPromote(def.id),
      });
    }

    // Divider separates the config group (above) from the lifecycle group
    // (Duplicate · Delete), matching the mockup's two-group menu.
    items.push({ kind: 'divider', id: 'lifecycle-divider' });

    items.push({
      kind: 'item',
      id: 'duplicate',
      label: 'Duplicate attribute',
      icon: <Icon size="16" glyph={<ContentCopyIcon />} />,
      onClick: () => onDuplicate(def.id),
    });

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
          : `Used in ${def.policyCount} ${def.policyCount === 1 ? 'policy' : 'policies'}; cannot delete.`,
      });
    } else {
      items.push({
        kind: 'item',
        id: 'delete',
        label:
          disposition === 'deactivate' ? 'Deactivate attribute' : 'Delete attribute',
        icon: <Icon size="16" glyph={<TrashCanOutlineIcon />} />,
        destructive: true,
        onClick: () => setConfirmDelete(def),
      });
    }

    return items;
  }

  return (
    <>
      {simplified && (
        <SectionNotice
          type="Info"
          title="User Attributes — simplified (v2)"
          description="Who can set values defaults to System Admin unless you allow users to edit their own value (non-externally-owned attributes only). Profile visibility is hide-when-empty by default."
        />
      )}
      <AdminPanel
        className={styles.widePanel}
        title="Configure user attributes"
        subtitle="Customize the attributes to show in user profiles"
        expandable
        defaultExpandedState="Expanded"
      >
        <div className={styles.gaTableWrap}>
          <table
            className={`${styles.gaTable} ${styles['gaTable--comfortable']}`}
          >
            <thead>
              <tr>
                <th className={styles.gaTable__handleCol} />
                <th>Property</th>
                <th>Type</th>
                <th>Values</th>
                <th className={styles.gaTable__actionsCol}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Built-in CPA profile fields — read-only, no drag handle, no menu. */}
              {BUILT_IN_USER_FIELDS.map((def) => (
                <tr key={def.id} className={styles.gaTable__systemRow}>
                  <td className={styles.gaTable__handle} aria-hidden />
                  <td>
                    <span className={styles.gaCell__strong}>{def.name}</span>
                  </td>
                  <td>
                    <span className={styles.gaCell__withIcon}>
                      <Icon size="16" glyph={TYPE_ICON[def.type]} />
                      {def.type}
                    </span>
                  </td>
                  <td>
                    <span className={styles.valueChips__placeholder}>—</span>
                  </td>
                  <td className={styles.gaTable__actions}>
                    <span
                      className={styles.gaTable__lock}
                      aria-label="Built-in field: read-only"
                      title="Built-in field: read-only"
                    >
                      <Icon size="16" glyph={<LockOutlineIcon />} />
                    </span>
                  </td>
                </tr>
              ))}

              {/* Configurable user attributes. */}
              {configurable.map((def) => {
                const owner = def.owner;
                const stale = syncNeedsAttention(owner);
                return (
                  <tr key={def.id}>
                    <td className={styles.gaTable__handle}>
                      <Icon size="16" glyph={<DragVerticalIcon />} />
                    </td>
                    <td>
                      <span className={styles.userAttrName}>
                        <span className={styles.gaCell__strong}>
                          {def.name}
                        </span>
                        {def.scope === 'global' && (
                          <span className={styles.userAttrName__scope}>
                            Global
                          </span>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className={styles.gaCell__withIcon}>
                        <Icon size="16" glyph={TYPE_ICON[def.type]} />
                        {def.type}
                      </span>
                    </td>
                    <td>
                      <div className={styles.userAttrValuesCell}>
                        {owner ? (
                          <span
                            className={[
                              styles.userAttrSync,
                              stale ? styles['userAttrSync--stale'] : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            title={
                              stale
                                ? `Sync stale — last attempted ${owner.lastSyncedLabel ?? 'recently'}`
                                : undefined
                            }
                          >
                            <span className={styles.userAttrSync__icon}>
                              <Icon
                                size="12"
                                glyph={
                                  stale ? (
                                    <AlertCircleOutlineIcon />
                                  ) : (
                                    <SyncIcon />
                                  )
                                }
                              />
                            </span>
                            <span>Managed by {owner.id}</span>
                            {owner.lastSyncedLabel && (
                              <span className={styles.userAttrSync__meta}>
                                · Last synced {owner.lastSyncedLabel}
                              </span>
                            )}
                          </span>
                        ) : (
                          <ValueChipsCell
                            def={def}
                            onPatch={(values) => onPatchValues(def.id, values)}
                          />
                        )}
                      </div>
                    </td>
                    <td className={styles.gaTable__actions}>
                      <div style={{ position: 'relative' }}>
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

              {configurable.length === 0 && (
                <tr>
                  <td />
                  <td colSpan={4}>
                    <p className={styles.copy}>
                      No custom user attributes yet. Use “+ Add attribute” to
                      reuse a global attribute or create a new one.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* "+ Add attribute" footer with dropdown menu. */}
          <div className={styles.gaAddWrap} ref={addWrapRef}>
            <button
              type="button"
              className={styles.gaAdd}
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
                className={styles.gaAddMenu}
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
                      onAddGlobal();
                    }}
                  />
                  <MenuItem
                    label="Create new attribute"
                    secondaryLabel="Define a new attribute scoped to users"
                    secondaryLabelPosition="Below"
                    leadingVisual={
                      <Icon size="16" glyph={<AccountOutlineIcon />} />
                    }
                    onClick={() => {
                      setAddOpen(false);
                      onCreateNew();
                    }}
                  />
                </PopoverMenu>
              </div>
            )}
          </div>
        </div>
      </AdminPanel>

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
    </>
  );
}
