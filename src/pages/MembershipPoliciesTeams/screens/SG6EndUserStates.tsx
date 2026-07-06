// SG6 — End-user surfaces (§4.1, 4.2, 4.3, 4.4).
// At least one is interactive (RHS hover-to-tooltip for attribute pills);
// the rest are static screens with annotated callouts.
//
// Includes:
//   - Team Members RHS (qualifying member view)
//   - Invite People to Team modal (qualifying member view)
//   - Team Directory entries (qualifying + non-qualifying)
//   - Removal DM (OQ-1: DM only)
import { useState } from 'react';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import ShieldAlertOutlineIcon from '@mattermost/compass-icons/components/shield-alert-outline';
import EyeOffOutlineIcon from '@mattermost/compass-icons/components/eye-off-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import LightbulbOutlineIcon from '@mattermost/compass-icons/components/lightbulb-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import Modal from '@/components/ui/Modal/Modal';
import TextInput from '@/components/ui/TextInput/TextInput';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarLukas from '@/assets/avatars/Lukas Meyer.png';
import avatarLeila from '@/assets/avatars/Leila Haddad.png';
import styles from '../MembershipPoliciesTeams.module.scss';

interface AttributePill {
  attribute: string;
  value: string;
}

// OQ-8 (spec v0.3 §11): declared attribute order matching the policy
// definition. Surfaced for design review; this prototype uses declared.
const PILLS: AttributePill[] = [
  { attribute: 'Clearance', value: 'Secret' },
  { attribute: 'Program', value: 'ALPHA' },
  { attribute: 'Department', value: 'Engineering' },
];

function HoverPill({ p }: { p: AttributePill }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      className={styles['mpt__rhs-attr-pill']}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setHover(false);
      }}
      aria-label={`${p.attribute}: ${p.value}`}
    >
      {p.value}
      {hover && (
        <span className={styles['mpt__rhs-tooltip']} role="tooltip">
          {p.attribute}
        </span>
      )}
    </button>
  );
}

type View = 'rhs' | 'manage' | 'invite' | 'directory' | 'dm' | 'autoadd-dm';

interface MemberRow {
  handle: string;
  fullName?: string;
  email: string;
  avatar?: string;
  role: 'Team Admin' | 'System Admin' | 'Member';
}

const MEMBER_LIST: MemberRow[] = [
  { handle: 'abhijits', email: 'user-1@sample.mattermost.com', role: 'Team Admin' },
  { handle: 'admin', email: 'user-2@sample.mattermost.com', role: 'System Admin' },
  { handle: 'dennis.owens', fullName: 'Dennis Owens', email: 'user-9@sample.mattermost.com', role: 'Team Admin' },
];

export default function SG6EndUserStates() {
  const [view, setView] = useState<View>('rhs');

  return (
    <div>
      <div className={styles['mpt__step-nav']}>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${view === 'rhs' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => setView('rhs')}
        >
          1. Team Members RHS (interactive)
        </button>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${view === 'manage' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => setView('manage')}
        >
          2. Manage Members modal
        </button>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${view === 'invite' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => setView('invite')}
        >
          3. Invite People modal
        </button>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${view === 'directory' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => setView('directory')}
        >
          4. Team Directory (static)
        </button>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${view === 'dm' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => setView('dm')}
        >
          5. Removal DM (OQ-1)
        </button>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${view === 'autoadd-dm' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => setView('autoadd-dm')}
        >
          6. Auto-add DM (NEW-2)
        </button>
      </div>

      {view === 'rhs' && (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div className={styles['mpt__rhs-frame']}>
            <div className={styles['mpt__rhs-header']}>
              <span className={styles['mpt__rhs-title']}>Members</span>
              <LabelTag label="3" type="Default" size="X-Small" />
            </div>
            <div className={styles['mpt__rhs-body']}>
              <div className={styles['mpt__rhs-notice']}>
                <span className={styles['mpt__rhs-notice-icon']}>
                  <Icon size="12" glyph={<ShieldOutlineIcon />} />
                </span>
                <span>
                  Membership in this team is restricted based on user
                  attributes.
                </span>
              </div>

              <div>
                <div className={styles['mpt__rhs-section-label']}>
                  Required attributes (hover to see name)
                </div>
                <div className={styles['mpt__rhs-attrs']}>
                  {PILLS.map((p) => (
                    <HoverPill key={p.value} p={p} />
                  ))}
                </div>
              </div>

              <div>
                <div className={styles['mpt__rhs-section-label']}>
                  Team members
                </div>
                <div className={styles['mpt__rhs-member-list']}>
                  <div className={styles['mpt__rhs-member-row']}>
                    <UserAvatar src={avatarAiko} alt="Aiko Tan" size="24" />
                    <span className={styles['mpt__rhs-member-name']}>
                      Aiko Tan
                    </span>
                    <span className={styles['mpt__rhs-member-role']}>
                      Admin
                    </span>
                  </div>
                  <div className={styles['mpt__rhs-member-row']}>
                    <UserAvatar
                      src={avatarArjun}
                      alt="Arjun Patel"
                      size="24"
                    />
                    <span className={styles['mpt__rhs-member-name']}>
                      Arjun Patel
                    </span>
                  </div>
                  <div className={styles['mpt__rhs-member-row']}>
                    <UserAvatar
                      src={avatarSofia}
                      alt="Sofia Bauer"
                      size="24"
                    />
                    <span className={styles['mpt__rhs-member-name']}>
                      Sofia Bauer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, maxWidth: 480 }}>
            <div className={styles['mpt__anno']}>
              <span className={styles['mpt__anno-icon']}>
                <Icon size="16" glyph={<InformationOutlineIcon />} />
              </span>
              <span>
                <strong>Interactive:</strong> hover (or tab to focus) the
                attribute value pills to see the corresponding attribute name
                tooltip. Pills show <em>only</em> to qualifying members; the
                non-qualifying view in the directory is intentionally
                attribute-blind (Attack Vector 4 mitigation).
              </span>
            </div>
            <div
              className={`${styles['mpt__anno']} ${styles['mpt__anno--warning']}`}
              style={{ marginTop: 8 }}
            >
              <span
                className={`${styles['mpt__anno-icon']} ${styles['mpt__anno-icon--warning']}`}
              >
                <Icon size="16" glyph={<InformationOutlineIcon />} />
              </span>
              <span>
                <strong>OQ-8 (new, pending design):</strong> Pill sort order.
                This prototype shows declared attribute order matching the
                policy (Clearance → Program → Department). Alphabetical or
                value-frequency are alternatives.
              </span>
            </div>
          </div>
        </div>
      )}

      {view === 'manage' && (
        <div className={styles['mpt__modal-frame']}>
          <Modal
            size="Medium"
            title="Program ALPHA Members"
            onClose={() => {}}
            noBodyPadding
            headerAction={
              <Button emphasis="Primary" onClick={() => setView('invite')}>
                Invite People
              </Button>
            }
          >
            <div className={styles['mpt__mm-section']}>
              <div className={styles['mpt__mm-search']}>
                <TextInput
                  size="Medium"
                  placeholder="Search users"
                  leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
                />
              </div>

              <div className={styles['mpt__mm-policy-strip']}>
                <Icon size="12" glyph={<ShieldOutlineIcon />} />
                <span>
                  Membership in this team is restricted based on user
                  attributes.
                </span>
                <div className={styles['mpt__mm-policy-pills']}>
                  {PILLS.map((p) => (
                    <HoverPill key={p.value} p={p} />
                  ))}
                </div>
              </div>

              <p className={styles['mpt__mm-count']}>
                1 - {MEMBER_LIST.length} members of {MEMBER_LIST.length} total
              </p>

              <div className={styles['mpt__mm-list']}>
                {MEMBER_LIST.map((m, idx) => (
                  <div key={m.handle} className={styles['mpt__mm-row']}>
                    <div className={styles['mpt__mm-avatar-wrap']}>
                      <UserAvatar
                        name={m.fullName ?? m.handle}
                        alt={m.handle}
                        size="40"
                      />
                      {idx === 1 && (
                        <span className={styles['mpt__mm-avatar-online']} />
                      )}
                    </div>
                    <div className={styles['mpt__mm-id']}>
                      <span className={styles['mpt__mm-handle']}>
                        @{m.handle}
                        {m.fullName ? `  -  ${m.fullName}` : ''}
                      </span>
                      <span className={styles['mpt__mm-email']}>
                        {m.email}
                      </span>
                    </div>
                    {m.role === 'System Admin' ? (
                      <span className={styles['mpt__mm-role-static']}>
                        System Admin
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={styles['mpt__mm-role-dropdown']}
                      >
                        {m.role}
                        <span className={styles['mpt__mm-role-chev']}>▾</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Modal>
          <div className={styles['mpt__anno']} style={{ marginTop: 16 }}>
            <span className={styles['mpt__anno-icon']}>
              <Icon size="16" glyph={<InformationOutlineIcon />} />
            </span>
            <span>
              <strong>Pixel-perfect match</strong> for the existing Members
              modal (Acme Co. Members screenshot) plus the new
              attribute-restriction strip above the count line. Pills hover to
              reveal attribute name (same pattern as RHS). Invite People
              button in the modal header opens{' '}
              <LabelTag label="Step 3" size="X-Small" />.
            </span>
          </div>
        </div>
      )}

      {view === 'invite' && (
        <div
          className={`${styles['mpt__modal-frame']} ${styles['mpt__modal-frame--small']}`}
        >
          <Modal
            size="Small"
            title="Add people to Program ALPHA"
            onClose={() => {}}
            noBodyPadding
            footer={
              <div className={styles['mpt__footer-buttons']}>
                <Button emphasis="Tertiary">Cancel</Button>
                <Button emphasis="Primary" disabled>
                  Add
                </Button>
              </div>
            }
          >
            <div className={styles['mpt__invite-section']}>
              <div className={styles['mpt__invite-search']}>
                <TextInput
                  size="Medium"
                  placeholder="Search for people or groups"
                  autoFocus
                />
              </div>
              <p className={styles['mpt__invite-hint']}>
                You can add 3 more people.
              </p>

              <div className={styles['mpt__invite-policy-strip']}>
                <Icon size="12" glyph={<ShieldOutlineIcon />} />
                <span>
                  Only users with specific attributes can be added. Required:
                </span>
                <div className={styles['mpt__mm-policy-pills']}>
                  {PILLS.map((p) => (
                    <HoverPill key={p.value} p={p} />
                  ))}
                </div>
              </div>
            </div>
          </Modal>
          <div className={styles['mpt__anno']} style={{ marginTop: 16 }}>
            <span className={styles['mpt__anno-icon']}>
              <Icon size="16" glyph={<InformationOutlineIcon />} />
            </span>
            <span>
              <strong>Pattern:</strong> matches Figma{' '}
              <LabelTag label="Patterns - Modals" type="Info Dim" size="X-Small" />{' '}
              node 856:11625 (Add people to team). Spec layers add a compact
              restriction strip below the search hint, listing the required
              attribute pills (hover for attribute name).
              <br />
              <em>
                Functional restriction (server-side): non-matching users do
                not surface in search results. There is no client-side filter
                step.
              </em>
            </span>
          </div>
        </div>
      )}

      {view === 'directory' && (
        <div className={styles['mpt__select-team-page']}>
          <div className={styles['mpt__select-team-back']}>
            <Icon size="12" glyph={<ChevronLeftIcon />} />
            Back
          </div>

          <div className={styles['mpt__select-team-body']}>
            <h1 className={styles['mpt__select-team-title']}>Hello</h1>
            <p className={styles['mpt__select-team-subtitle']}>
              All team communication in one place, searchable and accessible
              anywhere
            </p>

            <div className={styles['mpt__select-team-section-row']}>
              <span className={styles['mpt__select-team-section-label']}>
                Teams you can join:
              </span>
              <a className={styles['mpt__select-team-learn']}>
                <span className={styles['mpt__select-team-learn-icon']}>
                  <Icon size="12" glyph={<LightbulbOutlineIcon />} />
                </span>
                Learn about teams
              </a>
            </div>

            <div className={styles['mpt__select-team-list']}>
              {/* Public + ABAC, user qualifies → globe icon, Recommended tag */}
              <div className={styles['mpt__select-team-row']}>
                <span className={styles['mpt__select-team-row-icon']}>
                  <Icon size="16" glyph={<GlobeIcon />} />
                </span>
                <span className={styles['mpt__select-team-row-name']}>
                  Program ALPHA
                </span>
                <span className={styles['mpt__select-team-rec-tag']}>
                  <Icon size="12" glyph={<LightbulbOutlineIcon />} />
                  Recommended
                </span>
                <span className={styles['mpt__select-team-row-chev']}>
                  <Icon size="16" glyph={<ChevronRightIcon />} />
                </span>
              </div>

              {/* Public + ABAC, user does NOT qualify → globe icon, no tag */}
              <div className={styles['mpt__select-team-row']}>
                <span className={styles['mpt__select-team-row-icon']}>
                  <Icon size="16" glyph={<GlobeIcon />} />
                </span>
                <span className={styles['mpt__select-team-row-name']}>
                  Field Operations
                </span>
                <span className={styles['mpt__select-team-row-chev']}>
                  <Icon size="16" glyph={<ChevronRightIcon />} />
                </span>
              </div>

              {/* Open team (no policy) → globe icon */}
              <div className={styles['mpt__select-team-row']}>
                <span className={styles['mpt__select-team-row-icon']}>
                  <Icon size="16" glyph={<GlobeIcon />} />
                </span>
                <span className={styles['mpt__select-team-row-name']}>
                  Workplace Hub
                </span>
                <span className={styles['mpt__select-team-row-chev']}>
                  <Icon size="16" glyph={<ChevronRightIcon />} />
                </span>
              </div>

              {/* Private team, user invited or qualifies → lock icon */}
              <div className={styles['mpt__select-team-row']}>
                <span className={styles['mpt__select-team-row-icon']}>
                  <Icon size="16" glyph={<LockOutlineIcon />} />
                </span>
                <span className={styles['mpt__select-team-row-name']}>
                  Operational Sigma
                </span>
                <span className={styles['mpt__select-team-row-chev']}>
                  <Icon size="16" glyph={<ChevronRightIcon />} />
                </span>
              </div>
            </div>

            <a className={styles['mpt__select-team-action-link']}>
              Create a team
            </a>
            <a className={styles['mpt__select-team-action-link']}>
              Go to System Console
            </a>
          </div>

          <div className={styles['mpt__anno']} style={{ marginTop: 24 }}>
            <span className={styles['mpt__anno-icon']}>
              <Icon size="16" glyph={<LightbulbOutlineIcon />} />
            </span>
            <span>
              <strong>Program ALPHA</strong> — public team + ABAC, viewer
              qualifies. <em>Recommended</em> tag appears next to the name.
              Clicking the row joins the team. ABAC is{' '}
              <em>advisory only</em> on public teams (ABAC-MODEL decision in
              v0.5 §4.1).
            </span>
          </div>
          <div className={styles['mpt__anno']} style={{ marginTop: 8 }}>
            <span className={styles['mpt__anno-icon']}>
              <Icon size="16" glyph={<InformationOutlineIcon />} />
            </span>
            <span>
              <strong>Field Operations</strong> — public team + ABAC, viewer
              does <em>not</em> qualify. No tag. The team is still listed and
              joinable; channel policies inside continue to enforce per AND
              composition.
            </span>
          </div>
          <div className={styles['mpt__anno']} style={{ marginTop: 8 }}>
            <span className={styles['mpt__anno-icon']}>
              <Icon size="16" glyph={<InformationOutlineIcon />} />
            </span>
            <span>
              <strong>Workplace Hub</strong> — open team, no policy. Standard
              discovery + join. Globe icon signals public.
            </span>
          </div>
          <div className={styles['mpt__anno']} style={{ marginTop: 8 }}>
            <span className={styles['mpt__anno-icon']}>
              <Icon size="16" glyph={<LockOutlineIcon />} />
            </span>
            <span>
              <strong>Operational Sigma</strong> — private team, viewer has been
              invited or qualifies under ABAC. Lock icon signals private. The
              row is visible because the viewer has access; private+ABAC teams
              the viewer does not qualify for are filtered out of the list
              entirely.
            </span>
          </div>
          <div
            className={`${styles['mpt__anno']} ${styles['mpt__anno--warning']}`}
            style={{ marginTop: 8 }}
          >
            <span
              className={`${styles['mpt__anno-icon']} ${styles['mpt__anno-icon--warning']}`}
            >
              <Icon size="16" glyph={<EyeOffOutlineIcon />} />
            </span>
            <span>
              <strong>Private+ABAC teams the viewer does not qualify for</strong>{' '}
              are not shown in this list at all. Server-side filtering ensures
              the user has no way to enumerate the team's existence from this
              surface or any team-list API.
            </span>
          </div>
        </div>
      )}

      {view === 'dm' && (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div className={styles['mpt__dm-frame']}>
            <div className={styles['mpt__dm-header']}>
              <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
              <span className={styles['mpt__dm-header-name']}>System</span>
              <span className={styles['mpt__dm-header-time']}>
                Today 09:14
              </span>
            </div>
            <div className={styles['mpt__dm-body']}>
              <div className={styles['mpt__dm-icon']}>
                <Icon size="20" glyph={<ShieldAlertOutlineIcon />} />
              </div>
              <div className={styles['mpt__dm-content']}>
                <div className={styles['mpt__dm-sender']}>
                  Removed from Program ALPHA
                </div>
                <p className={styles['mpt__dm-text']}>
                  You have been removed from <strong>Program ALPHA</strong>{' '}
                  because you no longer meet the membership requirements.
                  Contact your System Administrator for assistance.
                </p>
              </div>
            </div>
            <div className={styles['mpt__dm-footer']}>
              <UserAvatar src={avatarMarco} alt="Marco Rinaldi" size="20" />
              <span>Delivered to @marco.rinaldi</span>
            </div>
          </div>

          <div style={{ flex: 1, maxWidth: 480 }}>
            <div className={styles['mpt__anno']}>
              <span className={styles['mpt__anno-icon']}>
                <Icon size="16" glyph={<InformationOutlineIcon />} />
              </span>
              <span>
                <strong>OQ-1 decision:</strong> DM system message only (no
                push, no email). Shield-with-X icon. The team disappears from
                the user's sidebar at the moment of removal; the DM is the
                only durable artifact.
              </span>
            </div>
            <div className={styles['mpt__anno']} style={{ marginTop: 8 }}>
              <span className={styles['mpt__anno-icon']}>
                <Icon size="16" glyph={<InformationOutlineIcon />} />
              </span>
              <span>
                <em>
                  <strong>[VERIFY WITH PM]:</strong> If the user is offline
                  when removal happens, the DM is delivered next time they
                  reconnect. No backup notification channel. Confirm this is
                  acceptable for IL4/IL5 ops where users may be off-network
                  for long stretches.
                </em>
              </span>
            </div>
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: 'rgba(var(--center-channel-color-rgb), 0.56)',
              }}
            >
              <UserAvatar src={avatarLukas} alt="Lukas Meyer" size="20" />
              <UserAvatar src={avatarLeila} alt="Leila Haddad" size="20" />
              <span>
                Same DM also delivered to 4 other removed users in this sync
                batch.
              </span>
            </div>
          </div>
        </div>
      )}

      {view === 'autoadd-dm' && (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div className={styles['mpt__dm-frame']}>
            <div className={styles['mpt__dm-header']}>
              <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
              <span className={styles['mpt__dm-header-name']}>System</span>
              <span className={styles['mpt__dm-header-time']}>
                Today 09:14
              </span>
            </div>
            <div className={styles['mpt__dm-body']}>
              <div
                className={`${styles['mpt__dm-icon']} ${styles['mpt__dm-icon--success']}`}
              >
                <Icon size="20" glyph={<AccountPlusOutlineIcon />} />
              </div>
              <div className={styles['mpt__dm-content']}>
                <div className={styles['mpt__dm-sender']}>
                  Added to Program ALPHA
                </div>
                <p className={styles['mpt__dm-text']}>
                  You've been added to <strong>Program ALPHA</strong> because
                  you meet the team's membership policy. Contact your Team
                  Admin for more information.
                </p>
              </div>
            </div>
            <div className={styles['mpt__dm-footer']}>
              <UserAvatar src={avatarMarco} alt="Marco Rinaldi" size="20" />
              <span>Delivered to @marco.rinaldi</span>
            </div>
          </div>

          <div style={{ flex: 1, maxWidth: 480 }}>
            <div className={styles['mpt__anno']}>
              <span className={styles['mpt__anno-icon']}>
                <Icon size="16" glyph={<InformationOutlineIcon />} />
              </span>
              <span>
                <strong>NEW-2:</strong> auto-add notification. System bot DM
                with a shield-with-check icon (companion to the shield-with-X
                used for removals). Same pattern, opposite semantic.
              </span>
            </div>
            <div className={styles['mpt__anno']} style={{ marginTop: 8 }}>
              <span className={styles['mpt__anno-icon']}>
                <Icon size="16" glyph={<InformationOutlineIcon />} />
              </span>
              <span>
                Triggered when the user is added during the sync auto-add
                pass — either at initial population (policy first attached,
                or auto-add toggled on) or on subsequent syncs when the
                user's attributes newly qualify.
              </span>
            </div>
            <div
              className={`${styles['mpt__anno']} ${styles['mpt__anno--warning']}`}
              style={{ marginTop: 8 }}
            >
              <span
                className={`${styles['mpt__anno-icon']} ${styles['mpt__anno-icon--warning']}`}
              >
                <Icon size="16" glyph={<InformationOutlineIcon />} />
              </span>
              <span>
                <em>
                  <strong>OQ-14:</strong> Auto-add is currently shown for
                  active human members only. Confirm with Engineering that
                  deactivated users are skipped at scan, and that guests are
                  never auto-added regardless of attribute match.
                </em>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
