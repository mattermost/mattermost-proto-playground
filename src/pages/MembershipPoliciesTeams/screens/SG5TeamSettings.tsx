// SG5 — Team Settings modal with left-nav (§3.3).
// "Team Membership" is the new nav item added by this spec (NAV-1).
// Custom Access Rules editor uses Basic-mode (VP-3); editor saves
// immediately (OQ-4); save flow checks self-exclusion (OQ-5) and
// orphan-team guardrail (NEW-1).
//
// Interactive:
//   1. Left-nav: General / Members / Team Membership (new) / Notifications
//   2. Add / remove / edit rule rows
//   3. "Test access rules" -> result modal with allowed list
//   4. Save -> impact confirmation, with Allowed/Restricted tabs
//   5. Force error states via step nav: self-exclusion, orphan-team
import { useState } from 'react';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import ForumOutlineIcon from '@mattermost/compass-icons/components/forum-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CloseIcon from '@mattermost/compass-icons/components/close';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import EqualIcon from '@mattermost/compass-icons/components/equal';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import Icon from '@/components/ui/Icon/Icon';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Select from '@/components/ui/Select/Select';
import Switch from '@/components/ui/Switch/Switch';
import TextInput from '@/components/ui/TextInput/TextInput';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Tabs from '@/components/ui/Tabs/Tabs';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import styles from '../MembershipPoliciesTeams.module.scss';

type Operator = 'is' | 'in' | 'ends with' | 'starts with';

interface Rule {
  id: string;
  attribute: string;
  operator: Operator;
  values: string[];
}

const STARTER_RULES: Rule[] = [
  {
    id: 'r1',
    attribute: 'User email',
    operator: 'ends with',
    values: ['mattermost.com'],
  },
  { id: 'r2', attribute: 'Clearance', operator: 'is', values: ['Confidential'] },
];

type Scenario = 'happy' | 'self-exclusion' | 'orphan';

interface MatchUser {
  name: string;
  handle: string;
  avatar: string;
  attrs: string[];
}

const MATCHING_USERS: MatchUser[] = [
  { name: 'Aiko Tan', handle: 'aiko.tan', avatar: avatarAiko, attrs: ['Engineering', 'Secret'] },
  { name: 'Arjun Patel', handle: 'arjun.patel', avatar: avatarArjun, attrs: ['Engineering', 'Secret'] },
  { name: 'Sofia Bauer', handle: 'sofia.bauer', avatar: avatarSofia, attrs: ['Engineering', 'Top Secret'] },
];

const RESTRICTED_USERS: MatchUser[] = [
  { name: 'Danielle Okoro', handle: 'danielle.okoro', avatar: avatarDanielle, attrs: ['Marketing'] },
  { name: 'Emma Novak', handle: 'emma.novak', avatar: avatarEmma, attrs: ['Engineering', 'Unclassified'] },
  { name: 'Ethan Brooks', handle: 'ethan.brooks', avatar: avatarEthan, attrs: ['Operations'] },
];

type NavKey = 'info' | 'access' | 'membership' | 'channel-membership';

export default function SG5TeamSettings() {
  const [scenario, setScenario] = useState<Scenario>('happy');
  const [activeNav, setActiveNav] = useState<NavKey>('membership');
  const [rules, setRules] = useState<Rule[]>(STARTER_RULES);
  const [logic, setLogic] = useState<'all' | 'any'>('all');
  const [showTest, setShowTest] = useState(false);
  const [autoAdd, setAutoAdd] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTab, setConfirmTab] = useState<'allowed' | 'restricted'>('allowed');

  const addRule = () =>
    setRules((prev) => [
      ...prev,
      { id: `r${Date.now()}`, attribute: '', operator: 'is', values: [] },
    ]);

  const removeRule = (id: string) =>
    setRules((prev) => prev.filter((r) => r.id !== id));

  const updateRule = (id: string, patch: Partial<Rule>) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleSave = () => setShowConfirm(true);

  const renderBlockingErrors = () => {
    // OQ-7: spec assumption is to stack both as separate SectionNotices.
    // In this prototype the user toggles into one scenario at a time —
    // both error variants are exposed via the step nav above the modal.
    if (scenario === 'self-exclusion') {
      return (
        <SectionNotice
          type="Danger"
          title="You cannot save these rules"
          description="You cannot set these rules because that will remove you from the team. Adjust the rules so your own attributes still qualify, or have a different Team Admin make the change."
        />
      );
    }
    if (scenario === 'orphan') {
      return (
        <SectionNotice
          type="Danger"
          title="No admin would remain"
          description="These rules would leave the team without any admin. Assign another admin who meets these rules, or adjust the rules."
        />
      );
    }
    return null;
  };

  const navItem = (key: NavKey, label: string, icon: React.ReactNode) => (
    <div
      className={`${styles['mpt__settings-nav-item']} ${activeNav === key ? styles['mpt__settings-nav-item--active'] : ''}`}
      onClick={() => setActiveNav(key)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveNav(key);
        }
      }}
      aria-label={label}
    >
      <span className={styles['mpt__settings-nav-icon']}>{icon}</span>
      {label}
    </div>
  );

  return (
    <div>
      <div className={styles['mpt__step-nav']}>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${scenario === 'happy' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => setScenario('happy')}
        >
          1. Happy path (interactive)
        </button>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${scenario === 'self-exclusion' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => setScenario('self-exclusion')}
        >
          2. Self-exclusion blocked (OQ-5)
        </button>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${scenario === 'orphan' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => setScenario('orphan')}
        >
          3. Orphan-team blocked (NEW-1)
        </button>
      </div>

      <div
        className={`${styles['mpt__modal-frame']} ${styles['mpt__modal-frame--wide']}`}
      >
        <Modal
          size="Large"
          title="Team settings"
          onClose={() => {}}
          noBodyPadding
          footer={
            <div className={styles['mpt__footer-buttons']}>
              <Button emphasis="Tertiary">Cancel</Button>
              <Button
                emphasis="Primary"
                onClick={handleSave}
                disabled={scenario !== 'happy'}
              >
                Save changes
              </Button>
            </div>
          }
        >
          <div className={styles['mpt__settings-split']}>
            <nav className={styles['mpt__settings-nav']}>
              <div className={styles['mpt__settings-nav-section']}>
                {navItem(
                  'info',
                  'Info',
                  <Icon size="16" glyph={<InformationOutlineIcon />} />,
                )}
                {navItem(
                  'access',
                  'Access',
                  <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />,
                )}
                {navItem(
                  'membership',
                  'Team Membership',
                  <Icon size="16" glyph={<FormatListBulletedIcon />} />,
                )}
                {navItem(
                  'channel-membership',
                  'Channel Membership',
                  <Icon size="16" glyph={<ForumOutlineIcon />} />,
                )}
              </div>
            </nav>

            <div className={styles['mpt__settings-content']}>
              {activeNav === 'channel-membership' && (
                <div className={styles['mpt__diag-empty']}>
                  <strong>Channel Membership tab</strong> — existing Phase 2
                  surface (Team Admin custom rules for channels within this
                  team). Renamed from "Channel Policies" per Figma{' '}
                  <LabelTag label="8393:30728" size="X-Small" />. Layout is
                  unchanged from the existing channel-admin Phase 2 product;
                  not modified by this spec.
                </div>
              )}
              {activeNav === 'info' && (
                <div className={styles['mpt__ts-info']}>
                  <div className={styles['mpt__ts-info-cols']}>
                    <div className={styles['mpt__ts-info-fields']}>
                      <div className={styles['mpt__tc-field']}>
                        <label className={styles['mpt__tc-field-label']}>
                          Team name
                        </label>
                        <TextInput defaultValue="Program ALPHA" />
                        <p className={styles['mpt__tc-field-help']}>
                          Appears on the sign-in screen and at the top of the
                          sidebar.
                        </p>
                      </div>
                      <div className={styles['mpt__tc-field']}>
                        <label className={styles['mpt__tc-field-label']}>
                          Description
                        </label>
                        <TextInput defaultValue="Operations and coordination for the ALPHA program." />
                        <p className={styles['mpt__tc-field-help']}>
                          Provides additional information to help users select
                          the right team.
                        </p>
                      </div>
                    </div>
                    <div className={styles['mpt__ts-info-icon']}>
                      <span className={styles['mpt__tc-field-label']}>
                        Team icon
                      </span>
                      <div className={styles['mpt__tc-icon-tile']}>
                        <span className={styles['mpt__tc-icon-letters']}>
                          PA
                        </span>
                      </div>
                      <p className={styles['mpt__tc-field-help']}>
                        Upload a picture in BMP, JPG, JPEG, or PNG. Max 50MB.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeNav === 'access' && (
                <div className={styles['mpt__ts-access']}>
                  <div className={styles['mpt__ts-section-title']}>
                    Discovery
                  </div>
                  <div className={styles['mpt__ts-section-sub']}>
                    Who can find this team in the directory.
                  </div>
                  <div className={styles['mpt__ts-card-grid']}>
                    <button
                      type="button"
                      className={`${styles['mpt__ts-card']} ${styles['mpt__ts-card--active']}`}
                      aria-pressed="true"
                    >
                      <span className={styles['mpt__ts-card-icon']}>
                        <Icon size="20" glyph={<ShieldOutlineIcon />} />
                      </span>
                      <span className={styles['mpt__ts-card-title']}>
                        Public team
                      </span>
                      <span className={styles['mpt__ts-card-desc']}>
                        Anyone can find and join
                      </span>
                    </button>
                    <button
                      type="button"
                      className={styles['mpt__ts-card']}
                    >
                      <span className={styles['mpt__ts-card-icon']}>
                        <Icon size="20" glyph={<LockOutlineIcon />} />
                      </span>
                      <span className={styles['mpt__ts-card-title']}>
                        Private team
                      </span>
                      <span className={styles['mpt__ts-card-desc']}>
                        Only invited members
                      </span>
                    </button>
                  </div>

                  <div className={styles['mpt__tc-switch-divider']} />

                  <div className={styles['mpt__ts-section-title']}>
                    Invite code
                  </div>
                  <div className={styles['mpt__ts-section-sub']}>
                    Used to generate the team invitation link. Regenerating
                    invalidates the previous link.
                  </div>
                  <div className={styles['mpt__ts-invite-row']}>
                    <code className={styles['mpt__ts-invite-code']}>
                      6aa7nmeoytnbfxht3u6d14b6zy
                    </code>
                    <Button emphasis="Tertiary" size="Small">
                      Regenerate
                    </Button>
                  </div>

                  <div className={styles['mpt__tc-switch-divider']} />

                  <div className={styles['mpt__ts-section-title']}>
                    Email domain restriction
                  </div>
                  <div className={styles['mpt__tc-switch-row']}>
                    <div className={styles['mpt__tc-switch-text']}>
                      <span className={styles['mpt__tc-switch-label']}>
                        Only specific email domains can join this team
                      </span>
                      <p className={styles['mpt__tc-switch-help']}>
                        Users can only join the team if their email matches
                        one of the specified domains. To enforce
                        attribute-based rules beyond email, use the{' '}
                        <button
                          type="button"
                          className={styles['mpt__inline-link-text']}
                          onClick={() => setActiveNav('membership')}
                        >
                          Membership tab
                        </button>
                        .
                      </p>
                    </div>
                    <Switch
                      checked={false}
                      aria-label="Restrict by email domain"
                      onChange={() => {}}
                    />
                  </div>

                  <div className={styles['mpt__tc-switch-divider']} />

                  <div className={styles['mpt__ts-section-title']}>
                    Group sync
                  </div>
                  <div className={styles['mpt__tc-switch-row']}>
                    <div className={styles['mpt__tc-switch-text']}>
                      <span className={styles['mpt__tc-switch-label']}>
                        Sync members from AD/LDAP groups
                      </span>
                      <p className={styles['mpt__tc-switch-help']}>
                        When enabled, adding and removing users from groups
                        will add or remove them from this team. Mutually
                        exclusive with attribute-based Membership policies.
                      </p>
                    </div>
                    <Switch
                      checked={false}
                      disabled
                      aria-label="Sync from groups"
                      onChange={() => {}}
                    />
                  </div>
                  <div className={styles['mpt__anno']}>
                    <span className={styles['mpt__anno-icon']}>
                      <Icon size="16" glyph={<InformationOutlineIcon />} />
                    </span>
                    <span>
                      Group sync is disabled because this team has a system
                      Membership Policy applied. Disconnect the policy to
                      switch to group sync.
                    </span>
                  </div>
                </div>
              )}

              {activeNav === 'membership' && (
                <>
                  <SectionNotice
                    type="Info"
                    title="System membership policy applied to this team"
                    description={
                      <span>
                        This team has a system-level membership policy
                        applied: <strong>Confidential DS-BP</strong>. Any
                        custom access rules you set here will be applied in
                        addition to this policy.
                      </span>
                    }
                  />

                  {renderBlockingErrors()}

                  <div className={styles['mpt__tm-section-title']}>
                    Who can join this team
                  </div>
                  <div className={styles['mpt__tm-section-sub']}>
                    Select user attributes and values as additional rules to
                    restrict team membership
                  </div>

                  <div className={styles['mpt__tm-rule-table']}>
                    <div className={styles['mpt__tm-rule-head']}>
                      <div
                        className={styles['mpt__tm-rule-th']}
                        style={{ flex: 1.4 }}
                      >
                        User Attribute
                      </div>
                      <div
                        className={styles['mpt__tm-rule-th']}
                        style={{ flex: 1 }}
                      >
                        Operator
                      </div>
                      <div
                        className={styles['mpt__tm-rule-th']}
                        style={{ flex: 2.6 }}
                      >
                        Values
                      </div>
                      <div style={{ width: 40 }} />
                    </div>

                    {rules.length === 0 && (
                      <div className={styles['mpt__diag-empty']}>
                        No custom rules set. The system policy alone governs
                        membership.
                      </div>
                    )}

                    {rules.map((r) => (
                      <div key={r.id} className={styles['mpt__tm-rule-row']}>
                        <div
                          className={styles['mpt__tm-rule-cell']}
                          style={{ flex: 1.4 }}
                        >
                          <Icon
                            size="12"
                            glyph={<FormatListBulletedIcon />}
                          />
                          <span className={styles['mpt__tm-rule-attr']}>
                            {r.attribute || 'Select attribute…'}
                          </span>
                        </div>
                        <div
                          className={styles['mpt__tm-rule-cell']}
                          style={{ flex: 1 }}
                        >
                          <Icon size="12" glyph={<EqualIcon />} />
                          <span className={styles['mpt__tm-rule-op']}>
                            {r.operator}
                          </span>
                        </div>
                        <div
                          className={styles['mpt__tm-rule-cell']}
                          style={{ flex: 2.6, gap: 6, flexWrap: 'wrap' }}
                        >
                          {r.values.length === 0 ? (
                            <span className={styles['mpt__tm-rule-placeholder']}>
                              Select value…
                            </span>
                          ) : (
                            <>
                              {r.values.map((v) => (
                                <span
                                  key={v}
                                  className={styles['mpt__tm-value-chip']}
                                >
                                  {v}
                                  <button
                                    type="button"
                                    className={styles['mpt__tm-value-chip-x']}
                                    onClick={() =>
                                      updateRule(r.id, {
                                        values: r.values.filter(
                                          (x) => x !== v,
                                        ),
                                      })
                                    }
                                    aria-label={`Remove ${v}`}
                                  >
                                    <Icon size="12" glyph={<CloseIcon />} />
                                  </button>
                                </span>
                              ))}
                              <button
                                type="button"
                                className={styles['mpt__tm-value-add']}
                                aria-label="Add another value"
                              >
                                <Icon size="12" glyph={<PlusIcon />} />
                              </button>
                            </>
                          )}
                        </div>
                        <div className={styles['mpt__tm-rule-action']}>
                          <button
                            type="button"
                            className={styles['mpt__tm-rule-remove']}
                            onClick={() => removeRule(r.id)}
                            aria-label="Remove rule"
                          >
                            <Icon
                              size="16"
                              glyph={<TrashCanOutlineIcon />}
                            />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className={styles['mpt__tm-add-attr']}
                      onClick={addRule}
                    >
                      <Icon size="12" glyph={<PlusIcon />} />
                      Select attribute
                    </button>
                  </div>

                  <div className={styles['mpt__tm-footer-row']}>
                    <span className={styles['mpt__tm-footer-text']}>
                      Each row is a single condition that must be met for a
                      user to comply with the policy. All rules are combined
                      with logical AND operator (&&).
                    </span>
                    <Button
                      emphasis="Tertiary"
                      size="Small"
                      leadingIcon={
                        <Icon size="16" glyph={<ShieldOutlineIcon />} />
                      }
                      onClick={() => setShowTest(true)}
                    >
                      Test matching users
                    </Button>
                  </div>

                  {rules.length > 1 && (
                    <div className={styles['mpt__logic-row']}>
                      <span className={styles['mpt__logic-label']}>
                        Match:
                      </span>
                      <Select
                        size="Small"
                        value={logic}
                        onChange={(e) =>
                          setLogic(e.target.value as 'all' | 'any')
                        }
                      >
                        <option value="all">All attributes required</option>
                        <option value="any">Any 1 attribute required</option>
                      </Select>
                    </div>
                  )}

                  <div className={styles['mpt__tm-auto-add']}>
                    <Checkbox
                      size="Small"
                      checked={autoAdd}
                      onChange={(e) => setAutoAdd(e.currentTarget.checked)}
                    />
                    <div className={styles['mpt__tm-auto-add-body']}>
                      <span className={styles['mpt__tm-auto-add-label']}>
                        Auto-add members based on access rules
                      </span>
                      <p className={styles['mpt__tm-auto-add-help']}>
                        Users who match the configured attribute values will
                        be automatically added as members.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Modal>
      </div>

      {showTest && (
        <div style={{ marginTop: 24 }} className={styles['mpt__modal-frame']}>
          <Modal
            size="Small"
            title="Test access rules"
            subtitle="Preview"
            onClose={() => setShowTest(false)}
            noBodyPadding
            footer={
              <div className={styles['mpt__footer-buttons']}>
                <Button
                  emphasis="Primary"
                  onClick={() => setShowTest(false)}
                >
                  Close preview
                </Button>
              </div>
            }
          >
            <div className={styles['mpt__modal-section-narrow']}>
              <div className={styles['mpt__test-result']}>
                <div className={styles['mpt__test-count']}>
                  <strong>{MATCHING_USERS.length} users</strong> match the
                  combined system + custom rules.
                </div>
              </div>
              <div className={styles['mpt__user-list']}>
                {MATCHING_USERS.map((u) => (
                  <div key={u.handle} className={styles['mpt__user-row']}>
                    <UserAvatar src={u.avatar} alt={u.name} size="28" />
                    <div className={styles['mpt__user-info']}>
                      <span className={styles['mpt__user-name']}>
                        {u.name}
                      </span>
                      <span className={styles['mpt__user-handle']}>
                        @{u.handle}
                      </span>
                    </div>
                    <div className={styles['mpt__user-attrs']}>
                      {u.attrs.map((a) => (
                        <span
                          key={a}
                          className={styles['mpt__user-attr-pill']}
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        </div>
      )}

      {showConfirm && (
        <div style={{ marginTop: 24 }} className={styles['mpt__modal-frame']}>
          <Modal
            size="Medium"
            title="Confirm rule changes"
            subtitle="Impact summary"
            onClose={() => setShowConfirm(false)}
            noBodyPadding
            footer={
              <div className={styles['mpt__footer-buttons']}>
                <Button
                  emphasis="Tertiary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  emphasis="Primary"
                  onClick={() => setShowConfirm(false)}
                >
                  Save and apply now
                </Button>
              </div>
            }
          >
            <div className={styles['mpt__modal-section-narrow']}>
              <SectionNotice
                type="Info"
                title="Changes apply immediately"
                description="Saving these rules removes restricted users immediately and re-evaluates membership. This matches the channel admin pattern from ABAC Phase 2 (OQ-4 decision)."
              />

              <Tabs
                tabs={[
                  {
                    key: 'allowed',
                    label: 'Allowed',
                    countBadge: MATCHING_USERS.length,
                  },
                  {
                    key: 'restricted',
                    label: 'Restricted',
                    countBadge: RESTRICTED_USERS.length,
                  },
                ]}
                activeKey={confirmTab}
                onChange={(k) =>
                  setConfirmTab(k as 'allowed' | 'restricted')
                }
              />

              <div className={styles['mpt__user-list']}>
                {(confirmTab === 'allowed'
                  ? MATCHING_USERS
                  : RESTRICTED_USERS
                ).map((u) => (
                  <div key={u.handle} className={styles['mpt__user-row']}>
                    <UserAvatar src={u.avatar} alt={u.name} size="28" />
                    <div className={styles['mpt__user-info']}>
                      <span className={styles['mpt__user-name']}>
                        {u.name}
                      </span>
                      <span className={styles['mpt__user-handle']}>
                        @{u.handle}
                      </span>
                    </div>
                    <span
                      className={
                        confirmTab === 'allowed'
                          ? `${styles['mpt__status-pill']} ${styles['mpt__status-pill--meets']}`
                          : `${styles['mpt__status-pill']} ${styles['mpt__status-pill--missing']}`
                      }
                    >
                      <Icon
                        size="12"
                        glyph={
                          confirmTab === 'allowed' ? (
                            <CheckCircleIcon />
                          ) : (
                            <AlertOutlineIcon />
                          )
                        }
                      />
                      {confirmTab === 'allowed'
                        ? 'Remains'
                        : 'Will be removed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        </div>
      )}

      <div className={styles['mpt__anno']}>
        <span className={styles['mpt__anno-icon']}>
          <Icon size="16" glyph={<InformationOutlineIcon />} />
        </span>
        <span>
          <strong>Spec mapping:</strong> NAV-1 — left-nav item "Team
          Membership" directly below Members. VP-3 — Basic-mode editor only.
          OQ-4 — save applies immediately. OQ-5 — self-exclusion blocks save
          (scenario 2). NEW-1 — orphan-team guardrail blocks save (scenario
          3). Save flow mirrors the channel admin pattern from ABAC Phase 2.
        </span>
      </div>
      <div
        className={`${styles['mpt__anno']} ${styles['mpt__anno--warning']}`}
        style={{ marginTop: 8 }}
      >
        <span
          className={`${styles['mpt__anno-icon']} ${styles['mpt__anno-icon--warning']}`}
        >
          <Icon size="16" glyph={<AlertCircleOutlineIcon />} />
        </span>
        <span>
          <em>
            <strong>OQ-7 (new, pending design):</strong> When both
            self-exclusion and orphan-admin errors apply to the same save, the
            spec assumption is to stack both. The prototype's step nav exposes
            each in isolation; production should render both stacked.
          </em>
        </span>
      </div>
    </div>
  );
}
