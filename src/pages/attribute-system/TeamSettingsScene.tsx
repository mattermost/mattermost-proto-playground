import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import RankedValueChip from '@/components/ui/RankedValueChip/RankedValueChip';
import { TYPE_ICON } from './attrIcons';
import BindingSummary from './bindingSummary';
import type { AttrDef, ResourceType } from './data';
import styles from './AttributeSystem.module.scss';

const RESOURCE: ResourceType = 'Channels';

interface SceneProps {
  globalDefs: AttrDef[];
  teamDefs: AttrDef[];
  onConfigureBinding: (defId: string, resource: ResourceType) => void;
}

/**
 * Team admin surface. Two classes of attribute:
 *  - Inherited global attributes — definition is read-only; only delegated
 *    bindings may be tightened.
 *  - Team-defined attributes (delegation = define_scoped) — created within
 *    sysadmin-set bounds (closed vocabulary, no owners, no global scope).
 */
export default function TeamSettingsScene({
  globalDefs,
  teamDefs,
  onConfigureBinding,
}: SceneProps) {
  const inherited = globalDefs.filter((d) => d.appliesTo.includes(RESOURCE));

  return (
    <>
      <SectionNotice
        type="Hint"
        title="Team Settings · Attributes — Operation Shield"
        description="As a team admin you consume the system administrator’s attributes and may define your own team-scoped ones within bounds: closed vocabulary, no external owners, channel scope only. You cannot loosen a governance setting a system admin has locked."
      />

      <AdminPanel
        title="From the system administrator"
        subtitle="Inherited global attributes — definition is read-only; tighten delegated bindings only"
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
                    <Button
                      emphasis="Secondary"
                      size="X-Small"
                      leadingIcon={<Icon size="12" glyph={<CogOutlineIcon />} />}
                      onClick={() => onConfigureBinding(def.id, RESOURCE)}
                    >
                      Tighten binding
                    </Button>
                  ) : (
                    <span className={styles.field__lock}>
                      <Icon size="12" glyph={<LockOutlineIcon />} /> locked by
                      system admin
                    </span>
                  )}
                </div>
                {binding && <BindingSummary binding={binding} />}
              </div>
            );
          })}
        </div>
      </AdminPanel>

      <AdminPanel
        title="Team-defined attributes"
        subtitle="Channel attributes you created for Operation Shield"
        showEnterpriseLabel
        expandable
        defaultExpandedState="Expanded"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {teamDefs.map((def) => {
            const binding = def.bindings.find((b) => b.resource === RESOURCE);
            return (
              <div key={def.id} className={styles.assignCard}>
                <div className={styles.assignCard__row}>
                  <span className={styles.assignCard__name}>
                    <Icon size="16" glyph={TYPE_ICON[def.type]} />
                    {def.name}
                  </span>
                  <Button
                    emphasis="Secondary"
                    size="X-Small"
                    leadingIcon={<Icon size="12" glyph={<CogOutlineIcon />} />}
                    onClick={() => onConfigureBinding(def.id, RESOURCE)}
                  >
                    Configure binding
                  </Button>
                </div>
                <div className={styles.values}>
                  {def.values.map((v) => (
                    <RankedValueChip key={v.id} label={v.label} />
                  ))}
                </div>
                {binding && <BindingSummary binding={binding} />}
              </div>
            );
          })}

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
