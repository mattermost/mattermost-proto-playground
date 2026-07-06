// Effective Access — the combined-effect indicator. Shows, per Role × Action,
// how the channel rules COMBINE (any-of which rules), and where the system
// ceiling caps them. This is the primary "how rules work together" surface.
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import Icon from '@/components/ui/Icon/Icon';
import type { ChannelRole, ChannelRule } from './types';
import { ROLE_LABEL } from './types';
import { AVAILABLE_PERMISSIONS, CEILING_ALLOWED_KEYS } from './fixtures';
import styles from './ChannelPermissionRulesFinal.module.scss';

const ROLE_ORDER: ChannelRole[] = ['channel_user', 'channel_guest', 'channel_admin'];

export default function EffectiveAccess({ rules }: { rules: ChannelRule[] }) {
  const rolesPresent = ROLE_ORDER.filter((r) => rules.some((x) => x.role === r));
  if (rolesPresent.length === 0) return null;

  return (
    <section className={styles['cprf__effective']} aria-label="Effective access">
      <div className={styles['cprf__effective-head']}>
        <span className={styles['cprf__effective-title']}>Effective access</span>
        <span className={styles['cprf__effective-sub']}>How your rules combine for each role and action</span>
      </div>

      {rolesPresent.map((role) => (
        <div key={role} className={styles['cprf__eff-role']}>
          <div className={styles['cprf__eff-role-name']}>{ROLE_LABEL[role]}</div>
          <div className={styles['cprf__eff-rows']}>
            {AVAILABLE_PERMISSIONS.map((perm) => {
              const contributing = rules.filter(
                (r) => r.role === role && r.permissions.some((p) => p.key === perm.key),
              );
              if (contributing.length === 0) return null;
              const cappedByCeiling = !CEILING_ALLOWED_KEYS.has(perm.key);
              const names = contributing.map((r) => r.name).join(', ');

              return (
                <div key={perm.key} className={styles['cprf__eff-row']}>
                  <span className={styles['cprf__eff-action']}>{perm.label}</span>

                  {cappedByCeiling ? (
                    <span className={`${styles['cprf__eff-verdict']} ${styles['cprf__eff-verdict--blocked']}`}>
                      <Icon size="16" glyph={<AlertOutlineIcon />} />
                      Blocked by system ceiling
                      <span className={styles['cprf__eff-note']}>
                        would be granted by {names}, but the system doesn’t allow this action here
                      </span>
                    </span>
                  ) : contributing.length === 1 ? (
                    <span className={`${styles['cprf__eff-verdict']} ${styles['cprf__eff-verdict--ok']}`}>
                      <Icon size="16" glyph={<CheckCircleIcon />} />
                      Allowed · 1 rule
                      <span className={styles['cprf__eff-note']}>{names}</span>
                    </span>
                  ) : (
                    <span className={`${styles['cprf__eff-verdict']} ${styles['cprf__eff-verdict--ok']}`}>
                      <Icon size="16" glyph={<LinkVariantIcon />} />
                      Allowed · any of {contributing.length} rules
                      <span className={styles['cprf__eff-note']}>
                        a user qualifies via any of: {names}
                      </span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <p className={styles['cprf__effective-foot']}>
        “Any of N rules” means a user is allowed if they match <strong>any one</strong> of them. The system ceiling can still block an
        action even when a rule grants it.
      </p>
    </section>
  );
}
