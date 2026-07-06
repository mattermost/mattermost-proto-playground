// SG3 — System Console > Teams > Team Configuration page.
// Pixel-perfect redraw of the current product (reference: "Team Config.png"
// screenshot in /reference) with one NEW section: Membership Policy.
//
// Existing sections (match screenshot byte-for-byte):
//   1. Team Profile — name, description, team icon, archive button
//   2. Team Management — sync group members, anyone can join, email domain
//   3. Groups — Add Group button + empty state
//   4. Members — search + filters + member table + pagination
//
// NEW section (spec v0.3 + decisions-2026-05-21):
//   * Membership Policy — policy status, Sync now, Disconnect from policy
//     (OQ-2 parity with channels), View member details (OQ-3 diagnostic)
//
// State variants via step nav:
//   A — Policy applied (default): full policy panel + diagnostic
//   B — No policy assigned: empty state in Membership Policy panel
//   C — Group-synced: warning notice + sync group members switch ON
import { useState } from 'react';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import LinkVariantOffIcon from '@mattermost/compass-icons/components/link-variant-off';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import Modal from '@/components/ui/Modal/Modal';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import TextInput from '@/components/ui/TextInput/TextInput';
import Switch from '@/components/ui/Switch/Switch';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import AdminPanel from '@/components/ui/AdminPanel/AdminPanel';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import styles from '../MembershipPoliciesTeams.module.scss';

const TEAM_NAME = 'Delta Operations Division';
const TEAM_INITIALS = 'Do';

interface DiagnosticRow {
  id: string;
  name: string;
  handle: string;
  email: string;
  status: 'meets' | 'missing';
  lastEvaluated: string;
  source: 'policy-managed' | 'group-synced' | 'manually-added';
  role: 'Team Admin' | 'System Admin' | 'Member';
}

const ROWS: DiagnosticRow[] = [
  {
    id: 'u1',
    name: 'abhijits',
    handle: 'abhijits',
    email: 'user-1@sample.mattermost.com',
    status: 'meets',
    lastEvaluated: '12 min ago',
    source: 'policy-managed',
    role: 'Team Admin',
  },
  {
    id: 'u2',
    name: 'admin',
    handle: 'admin',
    email: 'user-2@sample.mattermost.com',
    status: 'meets',
    lastEvaluated: '12 min ago',
    source: 'manually-added',
    role: 'System Admin',
  },
  {
    id: 'u3',
    name: 'dennis.owens',
    handle: 'dennis.owens - Dennis Owens',
    email: 'user-9@sample.mattermost.com',
    status: 'missing',
    lastEvaluated: '12 min ago',
    source: 'manually-added',
    role: 'Team Admin',
  },
];

type DemoState = 'applied' | 'empty' | 'group-sync';

export default function SG3PerTeamConfig() {
  const [state, setState] = useState<DemoState>('applied');
  const [showMembers, setShowMembers] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [filter, setFilter] = useState('');

  // Switch states reflect screenshot defaults
  const [syncGroups, setSyncGroups] = useState(state === 'group-sync');
  const [anyoneJoin, setAnyoneJoin] = useState(true);
  const [emailDomainOn, setEmailDomainOn] = useState(false);

  // Sync state with demo step
  const handleStateChange = (next: DemoState) => {
    setState(next);
    setSyncGroups(next === 'group-sync');
  };

  const rows = ROWS.filter(
    (r) =>
      filter.trim().length === 0 ||
      r.name.toLowerCase().includes(filter.toLowerCase()) ||
      r.handle.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div>
      <div className={styles['mpt__step-nav']}>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${state === 'applied' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => handleStateChange('applied')}
        >
          A. Policy applied (interactive)
        </button>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${state === 'empty' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => handleStateChange('empty')}
        >
          B. No policy assigned (empty)
        </button>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${state === 'group-sync' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => handleStateChange('group-sync')}
        >
          C. Group-synced (conflict)
        </button>
      </div>

      <div className={styles['mpt__sc-page']}>
        <div className={styles['mpt__tc-back-link']}>
          <Icon size="12" glyph={<ChevronLeftIcon />} />
          Back to {TEAM_NAME}
        </div>

        <ConsolePageHeader title="Team Configuration" backButton />

        <div
          className={`${styles['mpt__sc-body']} ${styles['mpt__sc-body--gray']}`}
        >
          {/* ──────── Team Profile ──────── */}
          <AdminPanel
            title="Team Profile"
            subtitle="Summary of the team, including team name and description."
          >
            <div className={styles['mpt__tc-profile-row']}>
              <div className={styles['mpt__tc-profile-fields']}>
                <div className={styles['mpt__tc-field']}>
                  <label className={styles['mpt__tc-field-label']}>
                    Team Name:
                  </label>
                  <TextInput defaultValue={TEAM_NAME} />
                  <p className={styles['mpt__tc-field-help']}>
                    This name will appear on your sign-in screen and at the top
                    of the left sidebar.
                  </p>
                </div>
                <div className={styles['mpt__tc-field']}>
                  <label className={styles['mpt__tc-field-label']}>
                    Description:
                  </label>
                  <TextInput defaultValue="Team description provides additional information" />
                  <p className={styles['mpt__tc-field-help']}>
                    Team description provides additional information to help
                    users select the right team. Maximum of 50 characters.
                  </p>
                </div>
              </div>
              <div className={styles['mpt__tc-profile-icon-col']}>
                <span className={styles['mpt__tc-field-label']}>Team Icon</span>
                <div className={styles['mpt__tc-icon-tile']}>
                  <span className={styles['mpt__tc-icon-letters']}>
                    {TEAM_INITIALS}
                  </span>
                  <button
                    type="button"
                    className={styles['mpt__tc-icon-edit']}
                    aria-label="Edit team icon"
                  >
                    <Icon size="12" glyph={<PencilOutlineIcon />} />
                  </button>
                </div>
                <p className={styles['mpt__tc-field-help']}>
                  Upload a picture in BMP, JPG, JPEG, or PNG format. Maximum
                  file size: 50MB
                </p>
              </div>
            </div>
            <div className={styles['mpt__tc-archive']}>
              <Button
                emphasis="Tertiary"
                destructive
                leadingIcon={<Icon size="16" glyph={<ArchiveOutlineIcon />} />}
              >
                Archive Team
              </Button>
            </div>
          </AdminPanel>

          {/* ──────── Team Management ──────── */}
          <AdminPanel
            title="Team Management"
            subtitle="Choose between inviting members manually or syncing members automatically from groups."
          >
            <div className={styles['mpt__tc-switch-row']}>
              <div className={styles['mpt__tc-switch-text']}>
                <span className={styles['mpt__tc-switch-label']}>
                  Sync Group Members
                </span>
                <p className={styles['mpt__tc-switch-help']}>
                  When enabled, adding and removing users from groups will add
                  or remove them from this team. The only way of inviting
                  members to this team is by adding the groups they belong to.{' '}
                  <a className={styles['mpt__inline-link-text']}>Learn More</a>
                </p>
              </div>
              <Switch
                checked={syncGroups}
                onChange={(e) => setSyncGroups(e.currentTarget.checked)}
                aria-label="Sync Group Members"
              />
            </div>
            <div className={styles['mpt__tc-switch-divider']} />
            <div className={styles['mpt__tc-switch-row']}>
              <div className={styles['mpt__tc-switch-text']}>
                <span className={styles['mpt__tc-switch-label']}>
                  Anyone can join this team
                </span>
                <p className={styles['mpt__tc-switch-help']}>
                  This team can be discovered allowing anyone with an account
                  to join this team.
                </p>
              </div>
              <Switch
                checked={anyoneJoin}
                onChange={(e) => setAnyoneJoin(e.currentTarget.checked)}
                aria-label="Anyone can join this team"
              />
            </div>
            <div className={styles['mpt__tc-switch-divider']} />
            <div className={styles['mpt__tc-switch-row']}>
              <div className={styles['mpt__tc-switch-text']}>
                <span className={styles['mpt__tc-switch-label']}>
                  Only specific email domains can join this team
                </span>
                <p className={styles['mpt__tc-switch-help']}>
                  Users can only join the team if their email matches one of
                  the specified domains
                </p>
              </div>
              <Switch
                checked={emailDomainOn}
                onChange={(e) => setEmailDomainOn(e.currentTarget.checked)}
                aria-label="Only specific email domains can join this team"
              />
            </div>
            {emailDomainOn && (
              <div className={styles['mpt__tc-nested-input']}>
                <label className={styles['mpt__tc-field-label']}>
                  Comma Separated Email Domain List
                </label>
                <TextInput placeholder="mattermost.com" />
              </div>
            )}
          </AdminPanel>

          {/* ──────── NEW: Membership Policy ──────── */}
          <AdminPanel
            title="Membership Policy"
            subtitle="Attribute-based access control rules governing who can be a member of this team."
            headerActions={
              state === 'applied' ? (
                <div className={styles['mpt__tc-policy-actions']}>
                  <Button
                    emphasis="Tertiary"
                    size="Small"
                    destructive
                    leadingIcon={
                      <Icon size="16" glyph={<LinkVariantOffIcon />} />
                    }
                    onClick={() => setShowDisconnect(true)}
                  >
                    Disconnect from policy
                  </Button>
                  <Button
                    emphasis="Secondary"
                    size="Small"
                    leadingIcon={<Icon size="16" glyph={<SyncIcon />} />}
                    onClick={() => setShowSyncConfirm(true)}
                  >
                    Sync now
                  </Button>
                </div>
              ) : undefined
            }
          >
            {state === 'applied' && (
              <>
                <div className={styles['mpt__property-list']}>
                  <div className={styles['mpt__property-row']}>
                    <div className={styles['mpt__property-key']}>Policy</div>
                    <div className={styles['mpt__property-value']}>
                      <span className={styles['mpt__property-link']}>
                        Program ALPHA Clearance
                      </span>{' '}
                      <LabelTag
                        label="System-level"
                        type="Info Dim"
                        size="X-Small"
                      />
                    </div>
                  </div>
                  <div className={styles['mpt__property-row']}>
                    <div className={styles['mpt__property-key']}>
                      Access rules
                    </div>
                    <div className={styles['mpt__property-value']}>
                      <span className={styles['mpt__inline-code']}>
                        Clearance is "Secret"
                      </span>{' '}
                      AND{' '}
                      <span className={styles['mpt__inline-code']}>
                        Program in ["ALPHA"]
                      </span>
                    </div>
                  </div>
                  <div className={styles['mpt__property-row']}>
                    <div className={styles['mpt__property-key']}>Last sync</div>
                    <div className={styles['mpt__property-value']}>
                      2026-05-21 09:14 (12 minutes ago)
                    </div>
                  </div>
                </div>

                <div className={styles['mpt__per-team-grid']}>
                  <div className={styles['mpt__per-team-stat']}>
                    <span className={styles['mpt__per-team-stat-label']}>
                      Meeting criteria
                    </span>
                    <span
                      className={`${styles['mpt__per-team-stat-value']} ${styles['mpt__per-team-stat-value--good']}`}
                    >
                      87
                    </span>
                  </div>
                  <div className={styles['mpt__per-team-stat']}>
                    <span className={styles['mpt__per-team-stat-label']}>
                      Not meeting criteria
                    </span>
                    <span
                      className={`${styles['mpt__per-team-stat-value']} ${styles['mpt__per-team-stat-value--bad']}`}
                    >
                      3
                    </span>
                  </div>
                  <div className={styles['mpt__per-team-stat']}>
                    <span className={styles['mpt__per-team-stat-label']}>
                      Total members
                    </span>
                    <span className={styles['mpt__per-team-stat-value']}>
                      90
                    </span>
                  </div>
                </div>

                <div>
                  <Button
                    emphasis="Tertiary"
                    size="Small"
                    leadingIcon={
                      <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
                    }
                    onClick={() => setShowMembers((v) => !v)}
                  >
                    {showMembers ? 'Hide' : 'View'} member details (90)
                  </Button>
                </div>

                {showMembers && (
                  <>
                    <div className={styles['mpt__tc-diag-toolbar']}>
                      <div className={styles['mpt__tc-diag-search']}>
                        <TextInput
                          size="Small"
                          placeholder="Filter members"
                          leadingIcon={
                            <Icon size="16" glyph={<MagnifyIcon />} />
                          }
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                        />
                      </div>
                      <Button
                        emphasis="Tertiary"
                        size="Small"
                        leadingIcon={
                          <Icon size="16" glyph={<FilterVariantIcon />} />
                        }
                      >
                        All sources
                      </Button>
                    </div>
                    <div className={styles['mpt__member-table']}>
                      <div className={styles['mpt__member-table-header']}>
                        <div
                          className={styles['mpt__member-table-header-cell']}
                          style={{ flex: 2 }}
                        >
                          User
                        </div>
                        <div
                          className={styles['mpt__member-table-header-cell']}
                          style={{ flex: 1.2 }}
                        >
                          Policy status
                        </div>
                        <div
                          className={styles['mpt__member-table-header-cell']}
                          style={{ flex: 1 }}
                        >
                          Last evaluated
                        </div>
                        <div
                          className={styles['mpt__member-table-header-cell']}
                          style={{ flex: 1.2 }}
                        >
                          Source
                        </div>
                      </div>
                      {rows.map((r) => (
                        <div
                          key={r.id}
                          className={styles['mpt__member-table-row']}
                        >
                          <div
                            className={styles['mpt__member-table-cell']}
                            style={{ flex: 2 }}
                          >
                            <div className={styles['mpt__member-id']}>
                              <UserAvatar
                                name={r.name}
                                alt={r.name}
                                size="24"
                              />
                              <div className={styles['mpt__member-id-text']}>
                                <span
                                  className={styles['mpt__member-id-name']}
                                >
                                  {r.name}
                                </span>
                                <span
                                  className={styles['mpt__member-id-handle']}
                                >
                                  @{r.handle}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div
                            className={styles['mpt__member-table-cell']}
                            style={{ flex: 1.2 }}
                          >
                            <span
                              className={
                                r.status === 'meets'
                                  ? `${styles['mpt__status-pill']} ${styles['mpt__status-pill--meets']}`
                                  : `${styles['mpt__status-pill']} ${styles['mpt__status-pill--missing']}`
                              }
                            >
                              <Icon
                                size="12"
                                glyph={
                                  r.status === 'meets' ? (
                                    <CheckCircleIcon />
                                  ) : (
                                    <CloseCircleIcon />
                                  )
                                }
                              />
                              {r.status === 'meets'
                                ? 'Meets'
                                : 'Does not meet'}
                            </span>
                          </div>
                          <div
                            className={styles['mpt__member-table-cell']}
                            style={{ flex: 1 }}
                          >
                            {r.lastEvaluated}
                          </div>
                          <div
                            className={styles['mpt__member-table-cell']}
                            style={{ flex: 1.2 }}
                          >
                            {r.source === 'policy-managed'
                              ? 'Policy-managed'
                              : r.source === 'group-synced'
                                ? 'Group-synced'
                                : 'Manually added'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {state === 'empty' && (
              <EmptyState
                title="No membership policy assigned"
                description={
                  <>
                    Team membership is managed through standard settings (open,
                    invite-only, or group sync). Go to Membership Policies to
                    assign one.
                  </>
                }
                action={{
                  children: 'Go to Membership Policies',
                  emphasis: 'Secondary',
                }}
              />
            )}

            {state === 'group-sync' && (
              <>
                <SectionNotice
                  type="Warning"
                  title="Group sync is active on this team"
                  description={
                    <>
                      This team's membership is managed via group sync. Remove
                      group sync to use membership policies. ABAC policies and
                      group sync are mutually exclusive for this release.
                    </>
                  }
                />
                <div className={styles['mpt__property-list']}>
                  <div className={styles['mpt__property-row']}>
                    <div className={styles['mpt__property-key']}>
                      Sync source
                    </div>
                    <div className={styles['mpt__property-value']}>
                      AD/LDAP group{' '}
                      <span className={styles['mpt__inline-code']}>
                        cn=field-partners,ou=external
                      </span>
                    </div>
                  </div>
                  <div className={styles['mpt__property-row']}>
                    <div className={styles['mpt__property-key']}>
                      Last sync
                    </div>
                    <div className={styles['mpt__property-value']}>
                      2026-05-21 06:00
                    </div>
                  </div>
                </div>
              </>
            )}
          </AdminPanel>

          {/* ──────── Groups ──────── */}
          <AdminPanel
            title="Groups"
            subtitle="Group members will be added to the team."
            headerActions={
              <Button emphasis="Primary">Add Group</Button>
            }
          >
            <div className={styles['mpt__tc-groups-empty']}>
              No groups specified yet
            </div>
          </AdminPanel>

          {/* ──────── Members ──────── */}
          <AdminPanel
            title="Members"
            subtitle="A list of users who are currently in the team right now"
            headerActions={
              <Button emphasis="Primary">Add Members</Button>
            }
          >
            <div className={styles['mpt__tc-members-toolbar']}>
              <div className={styles['mpt__tc-diag-search']}>
                <TextInput
                  size="Medium"
                  placeholder="Search"
                  leadingIcon={<Icon size="16" glyph={<MagnifyIcon />} />}
                />
              </div>
              <button
                type="button"
                className={styles['mpt__tc-filters-link']}
              >
                <Icon size="16" glyph={<FilterVariantIcon />} />
                Filters
              </button>
            </div>
            <div className={styles['mpt__tc-members-table']}>
              <div className={styles['mpt__tc-members-head']}>
                <div
                  className={styles['mpt__tc-members-th']}
                  style={{ flex: 2 }}
                >
                  Name
                </div>
                <div
                  className={styles['mpt__tc-members-th']}
                  style={{ flex: 1, textAlign: 'right' }}
                >
                  Role
                </div>
              </div>
              {ROWS.map((r) => (
                <div
                  key={`mem-${r.id}`}
                  className={styles['mpt__tc-members-row']}
                >
                  <div
                    className={styles['mpt__tc-members-cell']}
                    style={{ flex: 2 }}
                  >
                    <div className={styles['mpt__tc-member-id']}>
                      <UserAvatar name={r.name} alt={r.name} size="24" />
                      <div className={styles['mpt__tc-member-id-text']}>
                        <span className={styles['mpt__tc-member-id-name']}>
                          {r.name} - {r.email.split('@')[0]}
                        </span>
                        <span className={styles['mpt__tc-member-id-handle']}>
                          {r.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={styles['mpt__tc-members-cell']}
                    style={{
                      flex: 1,
                      justifyContent: 'flex-end',
                      gap: 16,
                    }}
                  >
                    {r.role === 'System Admin' ? (
                      <span className={styles['mpt__tc-role-static']}>
                        System Admin
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={styles['mpt__tc-role-dropdown']}
                      >
                        {r.role}
                        <Icon size="12" glyph={<ChevronDownIcon />} />
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles['mpt__tc-remove-link']}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className={styles['mpt__tc-pagination']}>
                <span className={styles['mpt__where-page-text']}>
                  1 - {ROWS.length} of {ROWS.length}
                </span>
                <IconButton
                  aria-label="Previous page"
                  size="Small"
                  icon={<Icon size="16" glyph={<ChevronLeftIcon />} />}
                />
                <IconButton
                  aria-label="Next page"
                  size="Small"
                  icon={<Icon size="16" glyph={<ChevronRightIcon />} />}
                />
              </div>
            </div>
          </AdminPanel>
        </div>

        <div className={styles['mpt__sc-footer']}>
          <Button emphasis="Primary" disabled>
            Save
          </Button>
          <Button emphasis="Quaternary">Cancel</Button>
        </div>
      </div>

      {/* ──────── Sync now confirmation ──────── */}
      {showSyncConfirm && (
        <div
          style={{ marginTop: 24 }}
          className={`${styles['mpt__modal-frame']} ${styles['mpt__modal-frame--small']}`}
        >
          <Modal
            size="Small"
            title="Sync this team now?"
            onClose={() => setShowSyncConfirm(false)}
            noBodyPadding
            footer={
              <div className={styles['mpt__footer-buttons']}>
                <Button
                  emphasis="Tertiary"
                  onClick={() => setShowSyncConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  emphasis="Primary"
                  onClick={() => setShowSyncConfirm(false)}
                >
                  Run sync
                </Button>
              </div>
            }
          >
            <div className={styles['mpt__confirm-body']}>
              <div className={styles['mpt__confirm-text']}>
                Running a single-team sync re-evaluates all 90 members of{' '}
                <strong>{TEAM_NAME}</strong> against the policy. Members who no
                longer meet criteria will be removed from this team and any
                channels within it.
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* ──────── Disconnect confirmation (OQ-2 verbatim) ──────── */}
      {showDisconnect && (
        <div
          style={{ marginTop: 24 }}
          className={`${styles['mpt__modal-frame']} ${styles['mpt__modal-frame--small']}`}
        >
          <Modal
            size="Small"
            title={
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Icon size="20" glyph={<LinkVariantOffIcon />} />
                Disconnect from policy
              </span>
            }
            onClose={() => setShowDisconnect(false)}
            noBodyPadding
            footer={
              <div className={styles['mpt__footer-buttons']}>
                <Button
                  emphasis="Tertiary"
                  onClick={() => setShowDisconnect(false)}
                >
                  Cancel
                </Button>
                <Button
                  emphasis="Primary"
                  destructive
                  onClick={() => setShowDisconnect(false)}
                >
                  Remove from policy
                </Button>
              </div>
            }
          >
            <div className={styles['mpt__confirm-body']}>
              <div className={styles['mpt__confirm-text']}>
                Remove this team from policy{' '}
                <strong>"Program ALPHA Clearance"</strong>? This team's
                membership will no longer be governed by attribute-based
                rules. Existing members are retained; the team returns to its
                standard access mode at next sync.
              </div>
              <SectionNotice
                type="Info"
                title="OQ-2 decision (2026-05-21)"
                description="Per-team disconnect is allowed for parity with the channel side. Policy editor is no longer the single source of truth for assignment changes; both paths now write the same state and emit the same audit entry."
              />
            </div>
          </Modal>
        </div>
      )}

      <div className={styles['mpt__anno']} style={{ marginTop: 16 }}>
        <span className={styles['mpt__anno-icon']}>
          <Icon size="16" glyph={<InformationOutlineIcon />} />
        </span>
        <span>
          <strong>Pixel-perfect match</strong> for the existing Team
          Configuration page (Team Profile, Team Management, Groups, Members)
          plus one NEW section: Membership Policy. Switch state via step nav
          to see policy-applied / no-policy / group-sync variants.
        </span>
      </div>
      <div
        className={`${styles['mpt__anno']} ${styles['mpt__anno--warning']}`}
        style={{ marginTop: 8 }}
      >
        <span
          className={`${styles['mpt__anno-icon']} ${styles['mpt__anno-icon--warning']}`}
        >
          <Icon size="16" glyph={<ShieldOutlineIcon />} />
        </span>
        <span>
          <em>
            <strong>OQ-6 (new, pending PM):</strong> Should disconnecting the
            policy's last team auto-delete the (now-empty) policy, or persist
            it? This prototype assumes persist — admin manually deletes via
            the policy editor (which is enabled at 0/0 per §3.1).
          </em>
        </span>
      </div>
    </div>
  );
}
