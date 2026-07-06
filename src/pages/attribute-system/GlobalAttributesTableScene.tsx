import { useEffect, useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CloseIcon from '@mattermost/compass-icons/components/close';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import Select from '@/components/ui/Select/Select';
import Radio from '@/components/ui/Radio/Radio';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Switch from '@/components/ui/Switch/Switch';
import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import { TYPE_ICON } from './attrIcons';
import CellPopover from './CellPopover';
import GlobalAttributeRowMenu from './GlobalAttributeRowMenu';
import {
  ALL_RESOURCE_TYPES,
  allowsAddingOptions,
  assignTiersForFloor,
  ensureDefinitionMutability,
  hasMaskedValuesForCaller,
  isExternallyManagedCatalog,
  MASKED_VALUE_TOKEN,
  MASKING_NOTICE,
  mutabilityLocked,
  readAccessDisplay,
  readAccessLocked,
  READ_ACCESS_LABEL,
  V2_MUTABILITY_LABEL,
  V2_MUTABILITY_OPTIONS,
  V2_READ_OPTIONS,
  visibleValuesForCaller,
  WRITE_FLOOR_DESC,
  WRITE_FLOOR_LABEL,
  WRITE_PRIVILEGE_ORDER,
  writeAccessSummary,
  writeWithAddOptions,
} from './data';
import type {
  AttrDef,
  AttrType,
  AttrValue,
  DefinitionMutability,
  Mutability,
  ReadAccess,
  ResourceType,
  WriteTier,
} from './data';
import styles from './AttributeSystem.module.scss';

type Col =
  | 'property'
  | 'type'
  | 'source'
  | 'values'
  | 'appliesTo'
  | 'read'
  | 'write'
  | 'mutability';

interface SceneProps {
  defs: AttrDef[];
  onPatch: (defId: string, patch: Partial<AttrDef>) => void;
  onToggleResource: (defId: string, resource: ResourceType, on: boolean) => void;
  onConfigureBinding: (defId: string, resource: ResourceType) => void;
  onConfigureAccess: (defId: string) => void;
  onDuplicate: (defId: string) => void;
  onDelete: (defId: string) => void;
  /** When false, the Write access column and editor are omitted. */
  showWriteAccess?: boolean;
  readColumnLabel?: string;
  readPopoverTitle?: string;
  sectionNoticeTitle?: string;
  sectionNoticeDescription?: string;
  /** v2: plugin-locked visibility, definition mutability column, open vocab in values. */
  simplifiedDefinition?: boolean;
}

const TYPE_OPTIONS: AttrType[] = ['Text', 'Select', 'Multiselect', 'Ranked', 'Date'];
const READ_OPTIONS: ReadAccess[] = ['Public', 'Restricted', 'Plugin-managed'];

const TIER_SHORT: Record<WriteTier, string> = {
  owner: 'Owners',
  sysadmin: 'System Admins',
  admin: 'Resource Admins',
  member: 'Members',
  none: 'Anyone',
};

const SOURCE_OPTIONS = ['Local', 'AD/LDAP', 'SAML', 'SCIM', 'Plugin'] as const;
type SourceChoice = (typeof SOURCE_OPTIONS)[number];

const COLS: Col[] = [
  'property',
  'type',
  'source',
  'values',
  'appliesTo',
  'read',
  'write',
];

/** Optional `?cell=values&row=classification` deep-link to pre-open a popover. */
function initialOpen(
  defs: AttrDef[],
  showWriteAccess: boolean,
  simplifiedDefinition: boolean,
): { id: string; col: Col } | null {
  if (typeof window === 'undefined') return null;
  const allowed = COLS.filter((c) => {
    if (c === 'write') return showWriteAccess;
    if (c === 'mutability') return simplifiedDefinition;
    return true;
  });
  const params = new URLSearchParams(window.location.search);
  const col = params.get('cell');
  if (!col || !allowed.includes(col as Col)) return null;
  const row = params.get('row');
  const def = defs.find((d) => d.id === row) ?? defs[0];
  return def ? { id: def.id, col: col as Col } : null;
}

function sourceLabel(def: AttrDef): string {
  if (def.owner) return def.owner.type === 'plugin' ? 'Plugin' : def.owner.id;
  if (def.promotedFrom) return `${def.promotedFrom} Attributes`;
  return 'Local';
}

function sourceChoice(def: AttrDef): SourceChoice {
  if (!def.owner) return 'Local';
  if (def.owner.type === 'plugin') return 'Plugin';
  if (def.owner.id === 'AD/LDAP') return 'AD/LDAP';
  if (def.owner.id === 'SAML') return 'SAML';
  if (def.owner.id === 'SCIM') return 'SCIM';
  return 'Local';
}

function valuesSummary(def: AttrDef): string {
  if (def.type === 'Text') return 'Free text';
  if (def.type === 'Date') return 'Date';
  const visible = visibleValuesForCaller(def);
  if (hasMaskedValuesForCaller(def)) {
    if (visible.length === 0) return 'Restricted values';
    return `${visible.length} ${visible.length === 1 ? 'value' : 'values'}`;
  }
  const n = def.values.length;
  return `${n} ${n === 1 ? 'value' : 'values'}`;
}

function writeSummary(def: AttrDef): string {
  return writeAccessSummary(def.write.value);
}

function mutabilitySummary(def: AttrDef): string {
  const m = ensureDefinitionMutability(def);
  const parts: string[] = [];
  if (def.appliesTo.includes('Users') && m.user) {
    parts.push(`Users: ${m.user}`);
  }
  const hasResource = def.appliesTo.some((r) => r !== 'Users');
  if (hasResource && m.resource) {
    parts.push(`Resources: ${m.resource}`);
  }
  return parts.length ? parts.join(' · ') : '—';
}

export default function GlobalAttributesTableScene({
  defs,
  onPatch,
  onToggleResource,
  onConfigureBinding,
  onConfigureAccess,
  onDuplicate,
  onDelete,
  showWriteAccess = true,
  simplifiedDefinition = false,
  readColumnLabel = 'Read access',
  readPopoverTitle = 'Read access',
  sectionNoticeTitle = 'Global Attributes — every value is editable in place',
  sectionNoticeDescription =
    'Click any cell to view its options and edit them inline. A single definition governed by the permissions model (source + read / write access), applied to many resource types.',
}: SceneProps) {
  const [open, setOpen] = useState<{ id: string; col: Col } | null>(() =>
    initialOpen(defs, showWriteAccess, simplifiedDefinition),
  );
  const [menuId, setMenuId] = useState<string | null>(null);

  const isOpen = (id: string, col: Col) =>
    open?.id === id && open?.col === col;
  const toggle = (id: string, col: Col) =>
    setOpen((c) => (c?.id === id && c?.col === col ? null : { id, col }));
  const close = () => setOpen(null);

  return (
    <>
      <SectionNotice
        type="Info"
        title={sectionNoticeTitle}
        description={sectionNoticeDescription}
      />

      <AdminPanel
        className={styles.widePanel}
        title="Configure Global Attributes"
        subtitle="Customize the attributes and values that can be used on resources across the system"
        expandable
        defaultExpandedState="Expanded"
      >
        <div className={styles.gaTableWrap}>
          <table className={styles.gaTable}>
            <thead>
              <tr>
                <th className={styles.gaTable__handleCol} />
                <th>Property</th>
                <th>Type</th>
                <th>Source</th>
                <th>Values</th>
                <th>Applies to</th>
                <th>{readColumnLabel}</th>
                {showWriteAccess && <th>Write access</th>}
                {simplifiedDefinition && <th>Editability</th>}
                <th className={styles.gaTable__actionsCol}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {defs.map((def) => (
                <tr key={def.id}>
                  <td className={styles.gaTable__handle}>
                    <Icon size="16" glyph={<DragVerticalIcon />} />
                  </td>

                  {/* Property */}
                  <td>
                    <CellPopover
                      open={isOpen(def.id, 'property')}
                      onToggle={() => toggle(def.id, 'property')}
                      onClose={close}
                      title="Property name"
                      ariaLabel={`Edit name of ${def.name}`}
                      trigger={
                        <span className={styles.gaCell__strong}>{def.name}</span>
                      }
                    >
                      <NameEditor
                        value={def.name}
                        onApply={(name) => {
                          onPatch(def.id, { name });
                          close();
                        }}
                      />
                    </CellPopover>
                  </td>

                  {/* Type */}
                  <td>
                    <CellPopover
                      open={isOpen(def.id, 'type')}
                      onToggle={() => toggle(def.id, 'type')}
                      onClose={close}
                      title="Attribute type"
                      ariaLabel={`Edit type of ${def.name}`}
                      trigger={
                        <span className={styles.gaCell__withIcon}>
                          <Icon size="16" glyph={TYPE_ICON[def.type]} />
                          {def.type}
                        </span>
                      }
                    >
                      <div className={styles.popRadios}>
                        {TYPE_OPTIONS.map((t) => (
                          <label key={t} className={styles.popRadio}>
                            <Radio
                              size="Small"
                              name={`type-${def.id}`}
                              checked={def.type === t}
                              onChange={() => onPatch(def.id, { type: t })}
                            />
                            <Icon size="16" glyph={TYPE_ICON[t]} />
                            <span>{t}</span>
                          </label>
                        ))}
                      </div>
                    </CellPopover>
                  </td>

                  {/* Source */}
                  <td>
                    <CellPopover
                      open={isOpen(def.id, 'source')}
                      onToggle={() => toggle(def.id, 'source')}
                      onClose={close}
                      title="Value source"
                      ariaLabel={`Edit source of ${def.name}`}
                      trigger={<span>{sourceLabel(def)}</span>}
                    >
                      <p className={styles.popHelp}>
                        Where this attribute’s values are mastered. External
                        sources keep values read-only in Mattermost.
                      </p>
                      <Select
                        size="Small"
                        value={sourceChoice(def)}
                        onChange={(e) => {
                          const v = e.target.value as SourceChoice;
                          onPatch(def.id, {
                            owner:
                              v === 'Local'
                                ? null
                                : v === 'Plugin'
                                  ? { type: 'plugin', id: 'Plugin' }
                                  : { type: 'service', id: v },
                          });
                        }}
                      >
                        {SOURCE_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </CellPopover>
                  </td>

                  {/* Values */}
                  <td>
                    <CellPopover
                      open={isOpen(def.id, 'values')}
                      onToggle={() => toggle(def.id, 'values')}
                      onClose={close}
                      title="Values"
                      ariaLabel={`Edit values of ${def.name}`}
                      trigger={<span>{valuesSummary(def)}</span>}
                    >
                      <ValuesEditor
                        def={def}
                        showOpenVocabulary={simplifiedDefinition}
                        onApply={(values) => {
                          onPatch(def.id, { values });
                          close();
                        }}
                        onPatch={(patch) => onPatch(def.id, patch)}
                      />
                    </CellPopover>
                  </td>

                  {/* Applies to */}
                  <td>
                    <CellPopover
                      open={isOpen(def.id, 'appliesTo')}
                      onToggle={() => toggle(def.id, 'appliesTo')}
                      onClose={close}
                      title="Applies to"
                      ariaLabel={`Edit resource types for ${def.name}`}
                      trigger={
                        <span>
                          {def.appliesTo.length
                            ? def.appliesTo.join(', ')
                            : '—'}
                        </span>
                      }
                    >
                      <div className={styles.popChecks}>
                        {ALL_RESOURCE_TYPES.map((r) => (
                          <label key={r} className={styles.popCheck}>
                            <Checkbox
                              size="Small"
                              checked={def.appliesTo.includes(r)}
                              onChange={(e) =>
                                onToggleResource(
                                  def.id,
                                  r,
                                  (e.target as HTMLInputElement).checked,
                                )
                              }
                            />
                            <span>{r}</span>
                          </label>
                        ))}
                      </div>
                    </CellPopover>
                  </td>

                  {/* Attribute value visibility / read access */}
                  <td>
                    {simplifiedDefinition && readAccessLocked(def) ? (
                      <span
                        className={styles.gaCell__locked}
                        title="Managed by the plugin; unlink to change."
                      >
                        Plugin-managed
                      </span>
                    ) : (
                      <CellPopover
                        open={isOpen(def.id, 'read')}
                        onToggle={() => toggle(def.id, 'read')}
                        onClose={close}
                        title={readPopoverTitle}
                        align={showWriteAccess ? 'right' : undefined}
                        ariaLabel={`Edit ${readColumnLabel.toLowerCase()} of ${def.name}`}
                        trigger={
                          <span>
                            {simplifiedDefinition
                              ? readAccessDisplay(def)
                              : def.read}
                          </span>
                        }
                      >
                        <div className={styles.popRadios}>
                          {(simplifiedDefinition
                            ? V2_READ_OPTIONS
                            : READ_OPTIONS
                          ).map((r) => (
                            <label key={r} className={styles.popRadioStack}>
                              <span className={styles.popRadio}>
                                <Radio
                                  size="Small"
                                  name={`read-${def.id}`}
                                  checked={
                                    simplifiedDefinition
                                      ? (r === 'Restricted'
                                          ? def.read === 'Restricted'
                                          : def.read === 'Public')
                                      : def.read === r
                                  }
                                  onChange={() => onPatch(def.id, { read: r })}
                                />
                                <span>
                                  {simplifiedDefinition && r === 'Public'
                                    ? 'Visible'
                                    : r}
                                </span>
                              </span>
                              <span className={styles.popRadio__desc}>
                                {READ_ACCESS_LABEL[r]}
                              </span>
                            </label>
                          ))}
                        </div>
                      </CellPopover>
                    )}
                  </td>

                  {showWriteAccess && (
                    <td>
                      <CellPopover
                        open={isOpen(def.id, 'write')}
                        onToggle={() => toggle(def.id, 'write')}
                        onClose={close}
                        title="Write access"
                        align="right"
                        ariaLabel={`Edit write access of ${def.name}`}
                        trigger={<span>{writeSummary(def)}</span>}
                      >
                        <WriteEditor
                          def={def}
                          onPatch={(p) => onPatch(def.id, p)}
                        />
                      </CellPopover>
                    </td>
                  )}

                  {simplifiedDefinition && (
                    <td>
                      {mutabilityLocked(def) ? (
                        <span
                          className={styles.gaCell__locked}
                          title="Classification editability is security-locked."
                        >
                          {mutabilitySummary(def)}
                        </span>
                      ) : (
                        <CellPopover
                          open={isOpen(def.id, 'mutability')}
                          onToggle={() => toggle(def.id, 'mutability')}
                          onClose={close}
                          title="Editability after set"
                          align="right"
                          ariaLabel={`Edit editability of ${def.name}`}
                          trigger={<span>{mutabilitySummary(def)}</span>}
                        >
                          <MutabilityEditor
                            def={def}
                            onPatch={(patch) => onPatch(def.id, patch)}
                          />
                        </CellPopover>
                      )}
                    </td>
                  )}

                  {/* Actions */}
                  <td className={styles.gaTable__actions}>
                    <div style={{ position: 'relative' }}>
                      <IconButton
                        size="X-Small"
                        aria-label={`Actions for ${def.name}`}
                        icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
                        onClick={() =>
                          setMenuId((c) => (c === def.id ? null : def.id))
                        }
                      />
                      <GlobalAttributeRowMenu
                        def={def}
                        open={menuId === def.id}
                        onClose={() => setMenuId(null)}
                        onRename={() => setOpen({ id: def.id, col: 'property' })}
                        onConfigureAccess={() => onConfigureAccess(def.id)}
                        onToggleResource={(r, on) =>
                          onToggleResource(def.id, r, on)
                        }
                        onConfigureBinding={(r) => onConfigureBinding(def.id, r)}
                        onDuplicate={() => onDuplicate(def.id)}
                        onDelete={() => onDelete(def.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" className={styles.gaAdd}>
            <Icon size="16" glyph={<PlusIcon />} />
            Add property
          </button>
        </div>
      </AdminPanel>
    </>
  );
}

function NameEditor({
  value,
  onApply,
}: {
  value: string;
  onApply: (next: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <div className={styles.popForm}>
      <TextInput
        ref={ref}
        size="Small"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && draft.trim()) onApply(draft.trim());
        }}
        aria-label="Property name"
      />
      <div className={styles.popForm__foot}>
        <Button
          emphasis="Primary"
          size="X-Small"
          disabled={!draft.trim()}
          onClick={() => onApply(draft.trim())}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

function ValuesEditor({
  def,
  onApply,
  showOpenVocabulary = false,
  onPatch,
}: {
  def: AttrDef;
  onApply: (values: AttrValue[]) => void;
  showOpenVocabulary?: boolean;
  onPatch?: (patch: Partial<AttrDef>) => void;
}) {
  const ranked = def.type === 'Ranked';
  const external = isExternallyManagedCatalog(def);
  const readOnly = external || def.read === 'Plugin-managed';
  const visible = visibleValuesForCaller(def);
  const masked = hasMaskedValuesForCaller(def);
  const seed =
    ranked && visible.length
      ? [...visible].sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))
      : visible;
  const [labels, setLabels] = useState<string[]>(
    seed.length ? seed.map((v) => v.label) : readOnly ? [] : [''],
  );

  if (def.type === 'Text' || def.type === 'Date') {
    return (
      <div className={styles.popForm}>
        <p className={styles.popHelp}>
          {def.type} attributes have no value list — they accept free{' '}
          {def.type === 'Text' ? 'text' : 'dates'}.
        </p>
        {external && (
          <p className={styles.popHelp}>
            Values are managed by {sourceLabel(def)}. Mattermost does not expose
            a local add or remove control.
          </p>
        )}
      </div>
    );
  }

  if (readOnly) {
    return (
      <ValuesReadOnlyList
        def={def}
        ranked={ranked}
        visible={seed}
        masked={masked}
        external={external}
      />
    );
  }

  const clean = labels.map((l) => l.trim()).filter(Boolean);

  return (
    <div className={styles.popForm}>
      {masked && <MaskingNotice />}
      {ranked && (
        <p className={styles.popHelp}>Ordered top (highest) to bottom.</p>
      )}
      {showOpenVocabulary && onPatch && (
        <div className={styles.popWrite__toggle}>
          <Switch
            size="Small"
            checked={allowsAddingOptions(def)}
            disabled={external}
            onChange={(e) =>
              onPatch({
                write: writeWithAddOptions(
                  def.write,
                  (e.target as HTMLInputElement).checked,
                ),
              })
            }
          >
            Allow new options
          </Switch>
          {external && (
            <p className={styles.popHelp}>
              Option catalog is owned by the external source.
            </p>
          )}
        </div>
      )}
      <div className={styles.valueEditor}>
        {labels.map((label, i) => (
          <div key={i} className={styles.valueEditor__row}>
            {ranked && (
              <span className={styles.valueEditor__rank}>
                {labels.length - i}
              </span>
            )}
            <TextInput
              size="Small"
              value={label}
              placeholder={`Value ${i + 1}`}
              onChange={(e) =>
                setLabels((prev) =>
                  prev.map((v, j) => (j === i ? e.target.value : v)),
                )
              }
              aria-label={`Value ${i + 1}`}
            />
            <IconButton
              size="Small"
              aria-label={`Remove value ${i + 1}`}
              icon={<Icon size="16" glyph={<CloseIcon />} />}
              onClick={() =>
                setLabels((prev) => prev.filter((_, j) => j !== i))
              }
            />
          </div>
        ))}
        {masked && <MaskedValueChip />}
        <Button
          emphasis="Quaternary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          onClick={() => setLabels((prev) => [...prev, ''])}
        >
          Add value
        </Button>
      </div>
      <div className={styles.popForm__foot}>
        <Button
          emphasis="Primary"
          size="X-Small"
          disabled={clean.length === 0}
          onClick={() =>
            onApply(
              clean.map((label, i) => ({
                id: `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`,
                label,
                rank: ranked ? clean.length - i : undefined,
              })),
            )
          }
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

function MaskingNotice() {
  return (
    <p className={styles.maskingNotice} role="note">
      {MASKING_NOTICE}
    </p>
  );
}

function MaskedValueChip() {
  return (
    <span
      className={styles.maskedChip}
      role="img"
      aria-label="Hidden values that you do not have permission to view"
      title="One or more restricted values"
    >
      {MASKED_VALUE_TOKEN}
    </span>
  );
}

function ValuesReadOnlyList({
  def,
  ranked,
  visible,
  masked,
  external,
}: {
  def: AttrDef;
  ranked: boolean;
  visible: AttrValue[];
  masked: boolean;
  external: boolean;
}) {
  const source = sourceLabel(def);

  return (
    <div className={styles.popForm}>
      {masked && <MaskingNotice />}
      {external && (
        <p className={styles.popHelp}>
          Values are synchronized from {source}. Add and remove are disabled in
          Mattermost.
        </p>
      )}
      {def.read === 'Plugin-managed' && !external && (
        <p className={styles.popHelp}>
          Plugin-managed attributes hide values from humans. Only the plugin
          owner can view or change the catalog.
        </p>
      )}
      <div className={styles.valueEditor}>
        {visible.map((val, i) => (
          <div
            key={val.id}
            className={[styles.valueEditor__row, styles['valueEditor__row--readonly']]
              .filter(Boolean)
              .join(' ')}
          >
            {ranked && (
              <span className={styles.valueEditor__rank}>
                {visible.length - i}
              </span>
            )}
            <TextInput
              size="Small"
              value={val.label}
              disabled
              readOnly
              aria-label={val.label}
            />
          </div>
        ))}
        {masked && <MaskedValueChip />}
        {visible.length === 0 && masked && (
          <p className={styles.popHelp}>
            No values in your assignment are visible for this attribute.
          </p>
        )}
      </div>
    </div>
  );
}

function WriteEditor({
  def,
  onPatch,
}: {
  def: AttrDef;
  onPatch: (patch: Partial<AttrDef>) => void;
}) {
  const external = isExternallyManagedCatalog(def);
  const addOptions = allowsAddingOptions(def);
  const included = assignTiersForFloor(def.write.value);

  const setFloor = (floor: WriteTier) => {
    const write = { ...def.write, value: floor };
    onPatch({
      write: addOptions ? writeWithAddOptions(write, true) : write,
    });
  };

  return (
    <div className={styles.popWrite}>
      <AssignmentPreview tiers={included} />

      <p className={styles.popWrite__sectionLabel}>
        Minimum role that may assign
      </p>
      <div className={styles.popRadios}>
        {WRITE_PRIVILEGE_ORDER.map((tier) => (
          <label key={tier} className={styles.popRadioStack}>
            <span className={styles.popRadio}>
              <Radio
                size="Small"
                name={`write-floor-${def.id}`}
                checked={def.write.value === tier}
                onChange={() => setFloor(tier)}
              />
              <span>{WRITE_FLOOR_LABEL[tier]}</span>
            </span>
            <span className={styles.popRadio__desc}>{WRITE_FLOOR_DESC[tier]}</span>
          </label>
        ))}
      </div>

      <div className={styles.popWrite__toggle}>
        <Switch
          size="Small"
          checked={addOptions}
          disabled={external}
          onChange={(e) =>
            onPatch({
              write: writeWithAddOptions(
                def.write,
                (e.target as HTMLInputElement).checked,
              ),
            })
          }
        >
          Allow adding new options
        </Switch>
        {external && (
          <p className={styles.popHelp}>
            Option catalog is owned by the external source — new values cannot be
            added in Mattermost.
          </p>
        )}
      </div>
    </div>
  );
}

function AssignmentPreview({ tiers }: { tiers: WriteTier[] }) {
  return (
    <div className={styles.writePreview}>
      <span className={styles.writePreview__label}>Who can assign</span>
      <div className={styles.writePreview__chips}>
        {tiers.map((tier) => (
          <span key={tier} className={styles.writePreview__chip}>
            {TIER_SHORT[tier]}
          </span>
        ))}
      </div>
    </div>
  );
}

function MutabilityEditor({
  def,
  onPatch,
}: {
  def: AttrDef;
  onPatch: (patch: Partial<AttrDef>) => void;
}) {
  const current = ensureDefinitionMutability(def);
  const appliesUsers = def.appliesTo.includes('Users');
  const appliesResources = def.appliesTo.some((r) => r !== 'Users');

  const setMutability = (
    audience: keyof DefinitionMutability,
    value: Mutability,
  ) => {
    onPatch({
      mutability: { ...current, [audience]: value },
    });
  };

  return (
    <div className={styles.popWrite}>
      <p className={styles.popHelp}>
        How values may change after they are set. Channels, Posts, and Teams
        share one resource setting.
      </p>
      {appliesUsers && (
        <>
          <p className={styles.popWrite__sectionLabel}>User values</p>
          <div className={styles.popRadios}>
            {V2_MUTABILITY_OPTIONS.map((m) => (
              <label key={`user-${m}`} className={styles.popRadioStack}>
                <span className={styles.popRadio}>
                  <Radio
                    size="Small"
                    name={`mut-user-${def.id}`}
                    checked={current.user === m}
                    onChange={() => setMutability('user', m)}
                  />
                  <span>{m}</span>
                </span>
                <span className={styles.popRadio__desc}>
                  {V2_MUTABILITY_LABEL[m as keyof typeof V2_MUTABILITY_LABEL]}
                </span>
              </label>
            ))}
          </div>
        </>
      )}
      {appliesResources && (
        <>
          <p className={styles.popWrite__sectionLabel}>Resource values</p>
          <div className={styles.popRadios}>
            {V2_MUTABILITY_OPTIONS.map((m) => (
              <label key={`resource-${m}`} className={styles.popRadioStack}>
                <span className={styles.popRadio}>
                  <Radio
                    size="Small"
                    name={`mut-resource-${def.id}`}
                    checked={current.resource === m}
                    onChange={() => setMutability('resource', m)}
                  />
                  <span>{m}</span>
                </span>
                <span className={styles.popRadio__desc}>
                  {V2_MUTABILITY_LABEL[m as keyof typeof V2_MUTABILITY_LABEL]}
                </span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
