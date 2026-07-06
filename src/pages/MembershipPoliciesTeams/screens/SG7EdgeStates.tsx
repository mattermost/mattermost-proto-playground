// SG7 — Error + edge states (all static with annotated callouts).
//
// Includes:
//   - Orphaned-team sync warning (NEW-1)
//   - Mass-removal guardrail (>50%) (§4.4)
//   - Policy deletion blocked (§3.1)
//   - Group-sync vs ABAC mutual exclusivity (§4.5)
//   - Self-exclusion compact reference (OQ-5)
//   - Generic denial copy — non-qualifying user (Attack Vector 4 / SEC-2)
//
// NOTE: To preserve the single-Primary-per-view convention across this
// screen, SectionNotice action labels are intentionally omitted; the
// representative "Delete policy" disabled button is the one Primary slot
// (rendered as destructive Tertiary, not Primary, to stay neutral).
import ShieldAlertOutlineIcon from '@mattermost/compass-icons/components/shield-alert-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import styles from '../MembershipPoliciesTeams.module.scss';

export default function SG7EdgeStates() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section>
        <div className={styles['mpt__sample-label']}>
          1. Orphaned-team sync warning (NEW-1)
        </div>
        <div className={styles['mpt__surface']} style={{ marginTop: 8 }}>
          <div className={styles['mpt__surface-header']}>
            <div className={styles['mpt__surface-title']}>
              Sync details — 06:00 May 22, 2026{' '}
              <LabelTag
                label="With warnings"
                type="Warning"
                size="X-Small"
              />
            </div>
          </div>
          <div className={styles['mpt__surface-body']}>
            <SectionNotice
              type="Warning"
              title="Field Operations has no qualifying admin remaining"
              description={
                <span>
                  <strong>Field Operations</strong> has no qualifying admin
                  remaining. The team is orphaned. Use{' '}
                  <span className={styles['mpt__inline-code']}>
                    mmctl team admin grant
                  </span>{' '}
                  to restore admin access, or remove the policy assignment in
                  the policy editor.
                </span>
              }
            />
          </div>
        </div>
        <div className={styles['mpt__anno']}>
          <span className={styles['mpt__anno-icon']}>
            <Icon size="16" glyph={<InformationOutlineIcon />} />
          </span>
          <span>
            <strong>NEW-1 decision:</strong> proactive block at save time
            (SG5 scenario 3) covers most cases; this state surfaces when{' '}
            <em>post-save attribute drift</em> orphans the team. Recovery is
            via mmctl, not the UI — documented explicitly in copy.
          </span>
        </div>
      </section>

      <section>
        <div className={styles['mpt__sample-label']}>
          2. Mass-removal guardrail ({'>'} 50%)
        </div>
        <div className={styles['mpt__surface']} style={{ marginTop: 8 }}>
          <div className={styles['mpt__surface-body']}>
            <SectionNotice
              type="Warning"
              title="Mass removal detected"
              description={
                <span>
                  <strong>Logistics &amp; Supply:</strong> 88 of 142 members
                  (62%) do not meet policy criteria. Review policy conditions
                  to ensure this is intentional.
                </span>
              }
            />
          </div>
        </div>
        <div className={styles['mpt__anno']}>
          <span className={styles['mpt__anno-icon']}>
            <Icon size="16" glyph={<InformationOutlineIcon />} />
          </span>
          <span>
            <strong>Spec §4.4:</strong> warning is surfaced in sync results,
            not pre-flight. Admin can still proceed; this is a safety
            checkpoint, not a hard block (unlike orphan/self-exclusion).
          </span>
        </div>
      </section>

      <section>
        <div className={styles['mpt__sample-label']}>
          3. Policy deletion blocked when resources assigned (§3.1)
        </div>
        <div className={styles['mpt__surface']} style={{ marginTop: 8 }}>
          <div className={styles['mpt__surface-body']}>
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--center-channel-color)',
                  }}
                >
                  Program ALPHA Clearance
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-75)',
                    color: 'rgba(var(--center-channel-color-rgb), 0.56)',
                    marginTop: 2,
                  }}
                >
                  4 channels &nbsp;·&nbsp; 3 teams
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <Button
                  emphasis="Tertiary"
                  size="Small"
                  destructive
                  disabled
                  leadingIcon={
                    <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                  }
                >
                  Delete policy
                </Button>
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 6px)',
                  }}
                >
                  <Tooltip
                    label="Remove all teams and channels from this policy before deleting."
                    arrow="Top"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles['mpt__anno']}>
          <span className={styles['mpt__anno-icon']}>
            <Icon size="16" glyph={<InformationOutlineIcon />} />
          </span>
          <span>
            Delete is disabled while resources are assigned (4 channels + 3
            teams ≠ 0). Tooltip explains why. When the count reaches 0/0 the
            button enables and a confirmation dialog gates the action.
          </span>
        </div>
      </section>

      <section>
        <div className={styles['mpt__sample-label']}>
          4. Group Sync vs. ABAC mutual exclusivity (§4.5)
        </div>
        <div className={styles['mpt__surface']} style={{ marginTop: 8 }}>
          <div className={styles['mpt__surface-body']}>
            <SectionNotice
              type="Warning"
              icon={<Icon size="20" glyph={<LockOutlineIcon />} />}
              title="Enabling group sync will replace the membership policy"
              description={
                <span>
                  This team is currently governed by membership policy{' '}
                  <strong>"Program ALPHA Clearance"</strong>. Enabling group
                  sync will remove this team from the policy and transfer
                  membership control to group sync. Continue?
                </span>
              }
            />
          </div>
        </div>
        <div className={styles['mpt__anno']}>
          <span className={styles['mpt__anno-icon']}>
            <Icon size="16" glyph={<InformationOutlineIcon />} />
          </span>
          <span>
            Hard constraint: ABAC and group sync cannot coexist. Reverse path
            (assigning policy to a group-synced team) is shown disabled in{' '}
            <strong>Screen Group 2</strong>.
          </span>
        </div>
      </section>

      <section>
        <div className={styles['mpt__sample-label']}>
          5. Self-exclusion error — compact reference (OQ-5)
        </div>
        <div className={styles['mpt__surface']} style={{ marginTop: 8 }}>
          <div className={styles['mpt__surface-body']}>
            <SectionNotice
              type="Danger"
              icon={<Icon size="20" glyph={<ShieldAlertOutlineIcon />} />}
              title="You cannot save these rules"
              description="You cannot set these rules because that will remove you from the team. Adjust the rules so your own attributes still qualify, or have a different Team Admin make the change."
            />
          </div>
        </div>
        <div className={styles['mpt__anno']}>
          <span className={styles['mpt__anno-icon']}>
            <Icon size="16" glyph={<InformationOutlineIcon />} />
          </span>
          <span>
            See <strong>Screen Group 5</strong> scenario 2 for the
            interactive context (Team Settings &gt; Team Membership).
          </span>
        </div>
      </section>

      <section>
        <div className={styles['mpt__sample-label']}>
          6. Generic denial copy — non-qualifying user (Attack Vector 4)
        </div>
        <div className={styles['mpt__surface']} style={{ marginTop: 8 }}>
          <div className={styles['mpt__surface-body']}>
            <SectionNotice
              type="Info"
              icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
              title="You do not meet the requirements for this team"
              description="Contact your admin. Generic, uniform copy across all denied teams — no policy name, no failing attribute, no recommendation."
            />
          </div>
        </div>
        <div className={styles['mpt__anno']}>
          <span className={styles['mpt__anno-icon']}>
            <Icon size="16" glyph={<InformationOutlineIcon />} />
          </span>
          <span>
            <strong>SEC-2 (Attack Vector 4):</strong> uniform copy prevents
            policy enumeration. Server returns 403 with{' '}
            <span className={styles['mpt__inline-code']}>
              reason: policy_denied
            </span>{' '}
            and no policy metadata.
          </span>
        </div>
      </section>
    </div>
  );
}
