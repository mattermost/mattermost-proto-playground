import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import { TYPE_ICON } from './attrIcons';
import {
  derivedWhoCanSet,
  displayLocationsLabel,
  effectiveMutability,
  normalizeDisplayLocations,
} from './data';
import type { AttrDef, ResourceType } from './data';
import styles from './AttributeSystem.module.scss';

const RESOURCE: ResourceType = 'Channels';

interface SceneProps {
  globalDefs: AttrDef[];
  teamDefs: AttrDef[];
}

function bindingSummary(def: AttrDef) {
  const binding = def.bindings.find((b) => b.resource === RESOURCE);
  if (!binding) return null;
  const display = normalizeDisplayLocations(binding.displayLocations);
  return (
    <p className={styles.copy}>
      Required: {binding.required} · Display: {displayLocationsLabel(display)} ·
      Who can set: Resource Admins+ · Editability:{' '}
      {effectiveMutability(def, RESOURCE)}
    </p>
  );
}

/** v2 Team Settings — read-only inherited globals; team-defined attrs show derived defaults. */
export default function TeamAttributesV2Scene({
  globalDefs,
  teamDefs,
}: SceneProps) {
  const inherited = globalDefs.filter((d) => d.appliesTo.includes(RESOURCE));

  return (
    <>
      <SectionNotice
        type="Hint"
        title="Team Settings · Attributes — simplified (v2)"
        description="Inherited globals are read-only. Team-defined attributes use the same smart defaults as system-wide channel attributes — no per-binding Configure modal."
      />

      <AdminPanel
        title="From the system administrator"
        subtitle="Inherited global attributes — definition is read-only"
        showEnterpriseLabel
        expandable
        defaultExpandedState="Expanded"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {inherited.map((def) => {
            const binding = def.bindings.find((b) => b.resource === RESOURCE);
            const canTune = Boolean(binding?.delegable);
            return (
              <div key={def.id} className={styles.assignCard}>
                <div className={styles.assignCard__row}>
                  <span className={styles.assignCard__name}>
                    <Icon size="16" glyph={TYPE_ICON[def.type]} />
                    {def.name}
                  </span>
                  {canTune ? (
                    <span className={styles.field__lock}>
                      Tighten on Channel Settings
                    </span>
                  ) : (
                    <span className={styles.field__lock}>
                      <Icon size="12" glyph={<LockOutlineIcon />} /> locked by
                      system admin
                    </span>
                  )}
                </div>
                {bindingSummary(def)}
              </div>
            );
          })}
        </div>
      </AdminPanel>

      <AdminPanel
        title="Team-defined attributes"
        subtitle="Channel attributes for Operation Shield — who can set: Team Admins+"
        showEnterpriseLabel
        expandable
        defaultExpandedState="Expanded"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {teamDefs.map((def) => (
            <div key={def.id} className={styles.assignCard}>
              <div className={styles.assignCard__row}>
                <span className={styles.assignCard__name}>
                  <Icon size="16" glyph={TYPE_ICON[def.type]} />
                  {def.name}
                </span>
                <span className={styles.copy}>
                  Who can set: {derivedWhoCanSet(def, 'Teams')}
                </span>
              </div>
              <div className={styles.values}>
                {def.values.map((v) => (
                  <RankedValueChip key={v.id} label={v.label} />
                ))}
              </div>
              {bindingSummary(def)}
            </div>
          ))}

          <div>
            <Button
              emphasis="Quaternary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
            >
              Add team attribute
            </Button>
          </div>
        </div>
      </AdminPanel>
    </>
  );
}
