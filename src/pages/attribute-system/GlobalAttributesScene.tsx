import { Fragment, useEffect, useRef, useState } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import IconButton from '@/components/ui/IconButton/IconButton';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import Icon from '@/components/ui/Icon/Icon';
import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import ConsolePropertyTable from '@/components/ui/ConsolePropertyTable/ConsolePropertyTable';
import ConsolePropertyRow from '@/components/ui/ConsolePropertyRow/ConsolePropertyRow';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import TextInput from '@/components/ui/TextInput/TextInput';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import { TYPE_ICON } from './attrIcons';
import GlobalAttributeRowMenu from './GlobalAttributeRowMenu';
import { ownerBadgeText } from './data';
import type { AttrDef, ResourceType } from './data';
import styles from './AttributeSystem.module.scss';

interface SceneProps {
  defs: AttrDef[];
  onRename: (defId: string, name: string) => void;
  onToggleResource: (defId: string, resource: ResourceType, on: boolean) => void;
  onConfigureBinding: (defId: string, resource: ResourceType) => void;
  onConfigureAccess: (defId: string) => void;
  onDuplicate: (defId: string) => void;
  onDelete: (defId: string) => void;
}

function ValueChips({ def }: { def: AttrDef }) {
  if (def.type === 'Text' || def.type === 'Date') {
    return (
      <span className={styles.values__empty}>
        {def.type === 'Text' ? 'Free text' : 'Date'}
      </span>
    );
  }
  const ordered =
    def.type === 'Ranked'
      ? [...def.values].sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))
      : def.values;
  return (
    <div className={styles.values}>
      {ordered.map((v) => (
        <RankedValueChip
          key={v.id}
          label={v.label}
          rank={def.type === 'Ranked' ? v.rank : undefined}
        />
      ))}
    </div>
  );
}

export default function GlobalAttributesScene({
  defs,
  onRename,
  onToggleResource,
  onConfigureBinding,
  onConfigureAccess,
  onDuplicate,
  onDelete,
}: SceneProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  return (
    <>
      <SectionNotice
        type="Info"
        title="Global Attributes — defined once, applied to many resource types"
        description="A single definition governed by the permissions model (owners + read/write restrictions). Use Applies to → {Resource} to open the per-resource binding (required, header display, vocabulary, mutability)."
      />

      <AdminPanel
        title="Global Attributes"
        subtitle="Attributes and values that can be used on resources across the system"
        showEnterpriseLabel
        expandable
        defaultExpandedState="Expanded"
      >
        <ConsolePropertyTable
          sections={[
            {
              columns: [
                { key: 'attribute', label: 'Attribute', width: 180 },
                { key: 'type', label: 'Type', width: 130 },
                { key: 'values', label: 'Values' },
                { key: 'actions', label: 'Actions', width: 72 },
              ],
              rows: defs.map((def) => (
                <Fragment key={def.id}>
                  <ConsolePropertyRow
                    title={
                      renamingId === def.id ? (
                        <RenameInput
                          initial={def.name}
                          onCommit={(next) => {
                            if (next) onRename(def.id, next);
                            setRenamingId(null);
                          }}
                          onCancel={() => setRenamingId(null)}
                        />
                      ) : (
                        def.name
                      )
                    }
                    typeIcon={TYPE_ICON[def.type]}
                    typeLabel={def.type}
                    value={
                      <div className={styles.values}>
                        <ValueChips def={def} />
                        {def.owner && (
                          <span className={styles.ownerBadge}>
                            <span className={styles.ownerBadge__icon}>
                              <Icon size="12" glyph={<LockOutlineIcon />} />
                            </span>
                            {ownerBadgeText(def.owner)}
                          </span>
                        )}
                      </div>
                    }
                    trailingAction={
                      <div style={{ position: 'relative' }}>
                        <IconButton
                          size="X-Small"
                          aria-label={`Actions for ${def.name}`}
                          icon={
                            <Icon size="12" glyph={<DotsHorizontalIcon />} />
                          }
                          onClick={() =>
                            setOpenMenu((c) => (c === def.id ? null : def.id))
                          }
                        />
                        <GlobalAttributeRowMenu
                          def={def}
                          open={openMenu === def.id}
                          onClose={() => setOpenMenu(null)}
                          onRename={() => setRenamingId(def.id)}
                          onConfigureAccess={() => onConfigureAccess(def.id)}
                          onToggleResource={(r, on) =>
                            onToggleResource(def.id, r, on)
                          }
                          onConfigureBinding={(r) =>
                            onConfigureBinding(def.id, r)
                          }
                          onDuplicate={() => onDuplicate(def.id)}
                          onDelete={() => onDelete(def.id)}
                        />
                      </div>
                    }
                  />
                </Fragment>
              )),
            },
          ]}
          addLabel="Add attribute"
          onAdd={() => {
            /* Prototype: creation flow out of scope for this scene. */
          }}
        />
      </AdminPanel>
    </>
  );
}

interface RenameInputProps {
  initial: string;
  onCommit: (next: string) => void;
  onCancel: () => void;
}

function RenameInput({ initial, onCommit, onCancel }: RenameInputProps) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <TextInput
      ref={ref}
      size="Small"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onCommit(value.trim())}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onCommit(value.trim());
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      }}
      aria-label="Rename attribute"
    />
  );
}
