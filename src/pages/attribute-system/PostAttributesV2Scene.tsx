import { useEffect, useMemo, useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
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
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import { TYPE_ICON } from './attrIcons';
import AttributeRowMenu from './AttributeRowMenu';
import type { AttributeMenuItem } from './AttributeRowMenu';
import ValueChipsCell from './ValueChipsCell';
import ClassificationPill from './ClassificationPill';
import DeleteAttributeConfirmModal from './DeleteAttributeConfirmModal';
import {
  deleteDisposition,
  globalsNotAppliedTo,
  inheritanceReadout,
  INHERITANCE_READOUT_LABEL,
  postBinding,
} from './data';
import type { AttrDef, AttrValue, Binding } from './data';
import sharedStyles from './AttributeSystem.module.scss';
import styles from './PostAttributesScene.module.scss';

interface PostAttributesV2SceneProps {
  defs: AttrDef[];
  onPatchBinding: (
    defId: string,
    resource: 'Posts',
    patch: Partial<Binding>,
  ) => void;
  onPatch: (defId: string, patch: Partial<AttrDef>) => void;
  onPatchValues: (defId: string, values: AttrValue[]) => void;
  onRename: (defId: string, name: string) => void;
  onDuplicate: (defId: string) => void;
  onDelete: (defId: string) => void;
  onDeactivate: (defId: string) => void;
  onAdd: (mode: 'existing' | 'create') => void;
}

export default function PostAttributesV2Scene({
  defs,
  onPatchBinding,
  onPatch,
  onPatchValues,
  onRename,
  onDuplicate,
  onDelete,
  onDeactivate,
  onAdd,
}: PostAttributesV2SceneProps) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AttrDef | null>(null);
  const [renameFor, setRenameFor] = useState<AttrDef | null>(null);
  const addWrapRef = useRef<HTMLDivElement>(null);

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
    return [
      {
        kind: 'item',
        id: 'rename',
        label: 'Rename',
        icon: <Icon size="16" glyph={<PencilOutlineIcon />} />,
        disabled: def.protected,
        onClick: () => setRenameFor(def),
      },
      {
        kind: 'item',
        id: 'duplicate',
        label: 'Duplicate attribute',
        icon: <Icon size="16" glyph={<ContentCopyIcon />} />,
        onClick: () => onDuplicate(def.id),
      },
      { kind: 'divider', id: 'destructive-divider' },
      {
        kind: 'item',
        id: 'delete',
        label:
          disposition === 'deactivate'
            ? 'Deactivate attribute'
            : 'Delete attribute',
        icon: <Icon size="16" glyph={<TrashCanOutlineIcon />} />,
        destructive: true,
        disabled: disposition === 'blocked',
        onClick:
          disposition === 'blocked'
            ? undefined
            : () => setConfirmDelete(def),
      },
    ];
  }

  return (
    <>
      <SectionNotice
        type="Info"
        title="Post Attributes — simplified (v2)"
        description="Only Required is editable here. Channel inheritance is configured on Channel Attributes and reflected read-only below. Post authors may set values by default."
      />

      <AdminPanel
        className={sharedStyles.widePanel}
        title="Post attributes"
        subtitle="Minimal post binding — inheritance reflects Channel Attributes."
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
                <th scope="col" className={styles['col--required']}>
                  Required
                </th>
                <th scope="col" className={styles['col--inherit']}>
                  Channel inheritance
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
                const binding = postBinding(def);
                if (!binding) return null;
                const readout = inheritanceReadout(def);
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
                        {def.scope === 'global' && (
                          <span className={sharedStyles.userAttrName__scope}>
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
                        <span className={styles.classificationValues}>
                          {def.values.map((v) => (
                            <ClassificationPill
                              key={v.id}
                              valueId={v.id}
                              label={v.label}
                            />
                          ))}
                        </span>
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
                      <span
                        className={sharedStyles.gaCell__locked}
                        title={
                          readout === 'post-only'
                            ? 'Configure on Channel Attributes to enable inheritance.'
                            : 'Configured on Channel Attributes.'
                        }
                      >
                        {INHERITANCE_READOUT_LABEL[readout]}
                      </span>
                    </td>
                    <td className={sharedStyles.gaTable__actions}>
                      <div className={styles.menuAnchor}>
                        <IconButton
                          size="X-Small"
                          aria-label={`More actions for ${def.name}`}
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
            </tbody>
          </table>

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
              <div className={sharedStyles.gaAddMenu} role="menu">
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
  }, []);

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
        onClose={onCancel}
        footer={
          <>
            <Button emphasis="Tertiary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              emphasis="Primary"
              disabled={!draft.trim()}
              onClick={() => onApply(draft.trim())}
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
          aria-label="Attribute name"
        />
      </Modal>
    </div>
  );
}
