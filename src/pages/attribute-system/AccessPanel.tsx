import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import Icon from '@/components/ui/Icon/Icon';
import { Drawer, Field, SelectField, RadioField } from './controls';
import { READ_ACCESS_LABEL, WRITE_TIER_LABEL, ownerBadgeText } from './data';
import type { AttrDef, ReadAccess, WriteTier } from './data';
import styles from './AttributeSystem.module.scss';

interface AccessPanelProps {
  def: AttrDef;
  /** Team admins can view but not change global definition access. */
  readOnly?: boolean;
  onChange: (next: AttrDef) => void;
  onClose: () => void;
}

const WRITE_OPTIONS: { value: WriteTier; label: string }[] = (
  ['owner', 'sysadmin', 'admin', 'member', 'none'] as WriteTier[]
).map((v) => ({ value: v, label: WRITE_TIER_LABEL[v] }));

/**
 * Definition-layer access config — maps 1:1 onto the tech spec `permissions`
 * model (owners + restrictions.read / write / filters).
 */
export default function AccessPanel({
  def,
  readOnly = false,
  onChange,
  onClose,
}: AccessPanelProps) {
  const setWrite = (patch: Partial<AttrDef['write']>) =>
    onChange({ ...def, write: { ...def.write, ...patch } });

  return (
    <Drawer
      eyebrow={`Access · ${def.name}`}
      title="Configure access"
      onClose={onClose}
      saveLabel="Done"
    >
      <RadioField<ReadAccess>
        label="Read access (value visibility)"
        help="Who can see assigned values."
        mapNote="maps to restrictions.read.value + filters.value"
        value={def.read}
        options={[
          {
            value: 'Public',
            title: 'Public',
            desc: READ_ACCESS_LABEL.Public,
          },
          {
            value: 'Restricted',
            title: 'Restricted (shared-only)',
            desc: READ_ACCESS_LABEL.Restricted,
          },
          {
            value: 'Plugin-managed',
            title: 'Plugin-managed',
            desc: READ_ACCESS_LABEL['Plugin-managed'],
          },
        ]}
        onChange={(read) => (readOnly ? undefined : onChange({ ...def, read }))}
      />

      {def.read === 'Restricted' && (
        <Field
          label="Masking override"
          help="System administrators are NOT implicitly added to the override list — shared-only masking binds them too. mmctl is the documented escape hatch."
          mapNote="filters.override (excludes sysadmin)"
        />
      )}

      <SelectField<WriteTier>
        label="Who can edit the definition"
        help="Rename, retype, link/unlink an external source."
        mapNote="restrictions.write.field"
        value={def.write.field}
        locked={readOnly}
        options={WRITE_OPTIONS}
        onChange={(field) => setWrite({ field })}
      />

      <SelectField<WriteTier>
        label="Who can edit options"
        help="Add or remove the allowed values. Drives the per-resource Vocabulary (closed vs open)."
        mapNote="restrictions.write.option"
        value={def.write.option}
        locked={readOnly}
        options={WRITE_OPTIONS}
        onChange={(option) => setWrite({ option })}
      />

      <SelectField<WriteTier>
        label="Who can edit values"
        help="Default ceiling for assigning values; a binding can tighten it per resource."
        mapNote="restrictions.write.value"
        value={def.write.value}
        locked={readOnly}
        options={WRITE_OPTIONS}
        onChange={(value) => setWrite({ value })}
      />

      <Field
        label="Owner / external source"
        help={
          def.owner
            ? 'Ownership is assigned in the owner’s own screen (SCIM / AD-LDAP). Core shows it read-only so admins understand why values are locked.'
            : 'No external owner. Link AD/LDAP, SAML, or a SCIM provider to let it own this attribute’s values.'
        }
        mapNote="permissions.owners (type + scope)"
      >
        {def.owner ? (
          <span className={styles.ownerBadge}>
            <span className={styles.ownerBadge__icon}>
              <Icon size="16" glyph={<LockOutlineIcon />} />
            </span>
            {ownerBadgeText(def.owner)}
          </span>
        ) : (
          <span className={styles.ownerBadge}>
            <span className={styles.ownerBadge__icon}>
              <Icon size="16" glyph={<SyncIcon />} />
            </span>
            Not linked — locally managed
          </span>
        )}
      </Field>
    </Drawer>
  );
}
