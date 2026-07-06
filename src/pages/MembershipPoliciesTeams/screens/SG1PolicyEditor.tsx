// SG1 — System Console > Membership Policies > Edit membership policy.
// Page-level layout matching Figma (Permission Policies file, node 4775:111317).
//
// Interactive:
//   1. Toggle Channels / Teams underline tabs in "Where this policy applies"
//   2. Remove a team -> live count update on tab badge
//   3. "Add teams" opens placeholder note (live picker is SG2)
//   4. Click Save -> confirmation dialog
//   5. Step nav switches to "non-qualifying-members" banner and "empty-team warning" demos
//   6. Both panels collapse via chevron toggle
//
// Spec divergence flag (recorded in SG7 / spec v0.3 §3.1):
//   Figma uses standard underline tabs in "Where this policy applies".
//   Spec v0.3 §3.1 NAV-2 specifies a pill-style segmented control.
//   Pixel-perfect bar applies — prototype matches Figma; flag spec for update.
//
// Spec divergence flag (CLAUDE.md "Primary once per view"):
//   Figma shows two Primary buttons in this view ("Add teams" + "Save").
//   Following Figma since it's the source of truth for the existing System Console.
import { useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import CodeTagsIcon from '@mattermost/compass-icons/components/code-tags';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import TuneIcon from '@mattermost/compass-icons/components/tune';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import Modal from '@/components/ui/Modal/Modal';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import TextInput from '@/components/ui/TextInput/TextInput';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import Tabs from '@/components/ui/Tabs/Tabs';
import styles from '../MembershipPoliciesTeams.module.scss';

interface AssignedTeam {
  id: string;
  name: string;
  initials: string;
}

const INITIAL_TEAMS: AssignedTeam[] = [
  { id: 't-delta-ops', name: 'Delta Operations Division', initials: 'Do' },
  { id: 't-echo-intel', name: 'Echo Intelligence Command', initials: 'Ei' },
  { id: 't-foxtrot-logistics', name: 'Foxtrot Logistics Wing', initials: 'Fl' },
  { id: 't-golf-cyber', name: 'Golf Cyber Operations', initials: 'Gc' },
  { id: 't-hotel-medical', name: 'Hotel Medical Corps', initials: 'Hm' },
];

const ASSIGNED_CHANNELS = 0;

type DemoStep = 'default' | 'banner' | 'save' | 'empty-warning';

interface AttributeRule {
  id: string;
  attribute: string;
  operator: string;
  value: string;
}

const INITIAL_RULES: AttributeRule[] = [
  { id: 'r-rank', attribute: 'Rank', operator: 'is', value: 'Major' },
  { id: 'r-program', attribute: 'Program', operator: 'is', value: 'Dragon Spacecraft' },
];

export default function SG1PolicyEditor() {
  const [step, setStep] = useState<DemoStep>('default');
  const [activeTab, setActiveTab] = useState<'channels' | 'teams'>('teams');
  const [teams, setTeams] = useState<AssignedTeam[]>(INITIAL_TEAMS);
  const [rules, setRules] = useState<AttributeRule[]>(INITIAL_RULES);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  const [addNote, setAddNote] = useState(false);
  const [whoExpanded, setWhoExpanded] = useState(true);
  const [whereExpanded, setWhereExpanded] = useState(true);
  const [policyName, setPolicyName] = useState('DS Program');
  const [editorMode, setEditorMode] = useState<'advanced' | 'simple'>('simple');

  const handleRemoveTeam = (id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRemoveRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = () => {
    if (step === 'empty-warning') {
      setShowEmptyWarning(true);
    } else {
      setShowSaveDialog(true);
    }
  };

  const showBanner = step === 'banner';

  return (
    <div>
      <div className={styles['mpt__step-nav']}>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${step === 'default' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => setStep('default')}
        >
          1. Default (no warnings)
        </button>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${step === 'banner' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => setStep('banner')}
        >
          2. With non-qualifying-members banner
        </button>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${step === 'save' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => setStep('save')}
        >
          3. Save → standard confirm
        </button>
        <button
          type="button"
          className={`${styles['mpt__step-btn']} ${step === 'empty-warning' ? styles['mpt__step-btn--active'] : ''}`}
          onClick={() => setStep('empty-warning')}
        >
          4. Save → empty-team warning
        </button>
      </div>

      {/* Page-level System Console container */}
      <div className={styles['mpt__sc-page']}>
        <ConsolePageHeader title="Edit membership policy" backButton />

        <div className={styles['mpt__sc-body']}>
          {/* Top label row: "Access policy name" + input + helper text */}
          <div className={styles['mpt__label-row']}>
            <div className={styles['mpt__label-col']}>
              <span className={styles['mpt__label-text']}>
                Access policy name:
              </span>
            </div>
            <div className={styles['mpt__label-input']}>
              <TextInput
                value={policyName}
                onChange={(e) => setPolicyName(e.currentTarget.value)}
              />
              <p className={styles['mpt__label-help']}>
                Give your policy a name that will be used to identify it in the
                policies list.
              </p>
            </div>
          </div>

          {/* SECTION 1: Who this policy applies to (collapsible) */}
          <ConsolePanel
            title="Who this policy applies to"
            subtitle="Define rules based on user attributes and values"
            expandable
            expanded={whoExpanded}
            onExpandToggle={setWhoExpanded}
          >
            <div className={styles['mpt__rules-section']}>
              <div className={styles['mpt__rules-header']}>
                <span className={styles['mpt__rules-title']}>
                  User attribute requirements
                </span>
                <div
                  className={styles['mpt__mode-toggle']}
                  role="tablist"
                  aria-label="Editor mode"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={editorMode === 'advanced'}
                    className={`${styles['mpt__mode-btn']} ${editorMode === 'advanced' ? styles['mpt__mode-btn--active'] : ''}`}
                    onClick={() => setEditorMode('advanced')}
                  >
                    <Icon size="12" glyph={<CodeTagsIcon />} />
                    Advanced
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={editorMode === 'simple'}
                    className={`${styles['mpt__mode-btn']} ${editorMode === 'simple' ? styles['mpt__mode-btn--active'] : ''}`}
                    onClick={() => setEditorMode('simple')}
                  >
                    <Icon size="12" glyph={<FormatListBulletedIcon />} />
                    Simple
                  </button>
                </div>
              </div>

              {editorMode === 'simple' ? (
                <>
                  <div className={styles['mpt__rule-table']}>
                    <div className={styles['mpt__rule-table-head']}>
                      <div className={styles['mpt__rule-th']}>Attribute</div>
                      <div className={styles['mpt__rule-th']}>Operator</div>
                      <div
                        className={`${styles['mpt__rule-th']} ${styles['mpt__rule-th--values']}`}
                      >
                        Values
                      </div>
                      <div className={styles['mpt__rule-th-right']}>
                        <button
                          type="button"
                          className={styles['mpt__inline-dropdown']}
                        >
                          <Icon size="12" glyph={<TuneIcon />} />
                          All attributes required
                          <Icon size="12" glyph={<ChevronDownIcon />} />
                        </button>
                      </div>
                    </div>
                    {rules.map((rule) => (
                      <div key={rule.id} className={styles['mpt__rule-row']}>
                        <div className={styles['mpt__rule-cell']}>
                          <span className={styles['mpt__rule-attr-icon']}>
                            <Icon
                              size="16"
                              glyph={<FormatListBulletedIcon />}
                            />
                          </span>
                          <span>{rule.attribute}</span>
                        </div>
                        <div className={styles['mpt__rule-cell']}>
                          <span className={styles['mpt__rule-operator']}>
                            {rule.operator}
                          </span>
                        </div>
                        <div className={styles['mpt__rule-cell']}>
                          <span>{rule.value}</span>
                        </div>
                        <div className={styles['mpt__rule-cell-action']}>
                          <IconButton
                            aria-label={`Remove ${rule.attribute} rule`}
                            size="Small"
                            destructive
                            icon={
                              <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                            }
                            onClick={() => handleRemoveRule(rule.id)}
                          />
                        </div>
                      </div>
                    ))}
                    <div className={styles['mpt__rule-add-row']}>
                      <button
                        type="button"
                        className={styles['mpt__rule-add-btn']}
                      >
                        <Icon size="12" glyph={<PlusIcon />} />
                        Add attribute
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles['mpt__diag-empty']}>
                  Advanced (CEL expression) editor — out of scope for this
                  prototype. Switch back to <strong>Simple</strong> to see the
                  table-based editor.
                </div>
              )}

              <div className={styles['mpt__rules-footer']}>
                <span className={styles['mpt__rules-foot-text']}>
                  Select attributes and values that users must have for this
                  policy
                </span>
                <Button
                  emphasis="Tertiary"
                  size="Small"
                  leadingIcon={<Icon size="12" glyph={<ShieldOutlineIcon />} />}
                >
                  Test matching users
                </Button>
              </div>
            </div>
          </ConsolePanel>

          {/* SECTION 2: Where this policy applies (collapsible) */}
          <ConsolePanel
            title="Where this policy applies"
            subtitle="Define the channels and teams to which this policy will apply"
            expandable
            expanded={whereExpanded}
            onExpandToggle={setWhereExpanded}
          >
            <div className={styles['mpt__where-section']}>
              <Tabs
                tabs={[
                  {
                    key: 'channels',
                    label: 'Channels',
                    countBadge: ASSIGNED_CHANNELS,
                  },
                  { key: 'teams', label: 'Teams', countBadge: teams.length },
                ]}
                activeKey={activeTab}
                onChange={(k) => setActiveTab(k as 'channels' | 'teams')}
              />

              {activeTab === 'teams' && (
                <>
                  {showBanner && (
                    <SectionNotice
                      type="Info"
                      title="Members affected at next sync"
                      description="14 members across 2 newly assigned teams do not meet the current policy criteria. These members will be affected at next sync."
                    />
                  )}

                  <div className={styles['mpt__where-actions']}>
                    <div className={styles['mpt__where-search']}>
                      <TextInput
                        size="Small"
                        placeholder="Search"
                        leadingIcon={
                          <Icon size="16" glyph={<MagnifyIcon />} />
                        }
                      />
                    </div>
                    <Button
                      emphasis="Primary"
                      size="Small"
                      leadingIcon={<Icon size="12" glyph={<PlusIcon />} />}
                      onClick={() => setAddNote(true)}
                    >
                      Add teams
                    </Button>
                  </div>

                  {teams.length === 0 ? (
                    <div className={styles['mpt__diag-empty']}>
                      No teams assigned to this policy yet. Click{' '}
                      <strong>Add teams</strong> to begin.
                    </div>
                  ) : (
                    <div className={styles['mpt__where-table']}>
                      <div className={styles['mpt__where-table-head']}>
                        <div className={styles['mpt__where-th']}>Name</div>
                      </div>
                      {teams.map((t) => (
                        <div
                          key={t.id}
                          className={styles['mpt__where-table-row']}
                        >
                          <div className={styles['mpt__where-name-cell']}>
                            <div className={styles['mpt__where-team-icon']}>
                              {t.initials}
                            </div>
                            <span className={styles['mpt__where-team-name']}>
                              {t.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            className={styles['mpt__where-remove']}
                            onClick={() => handleRemoveTeam(t.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <div className={styles['mpt__where-pagination']}>
                        <span className={styles['mpt__where-page-text']}>
                          1 - {teams.length} of {teams.length}
                        </span>
                        <IconButton
                          aria-label="Previous page"
                          size="Small"
                          icon={
                            <Icon size="16" glyph={<ChevronLeftIcon />} />
                          }
                        />
                        <IconButton
                          aria-label="Next page"
                          size="Small"
                          icon={
                            <Icon size="16" glyph={<ChevronRightIcon />} />
                          }
                        />
                      </div>
                    </div>
                  )}

                  {addNote && (
                    <div className={styles['mpt__add-anno']}>
                      <span className={styles['mpt__anno-icon']}>
                        <Icon size="16" glyph={<InformationOutlineIcon />} />
                      </span>
                      <span>
                        The "Add teams" picker is a separate modal — see{' '}
                        <strong>Screen Group 2: Add Teams modal</strong> for
                        the live interactive prototype with eligibility states.{' '}
                        <button
                          type="button"
                          onClick={() => setAddNote(false)}
                          className={styles['mpt__inline-link']}
                        >
                          Dismiss
                        </button>
                      </span>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'channels' && (
                <div className={styles['mpt__diag-empty']}>
                  Channels tab is the pre-existing behavior from ABAC Phase 1
                  (channel assignment). Toggle to <strong>Teams</strong> to see
                  the new behaviour added by this spec.
                </div>
              )}
            </div>
          </ConsolePanel>
        </div>

        {/* Page-level footer: Save / Cancel */}
        <div className={styles['mpt__sc-footer']}>
          <Button emphasis="Primary" onClick={handleSave}>
            Save
          </Button>
          <Button emphasis="Tertiary">Cancel</Button>
        </div>
      </div>

      {showSaveDialog && (
        <div
          style={{ marginTop: 24 }}
          className={`${styles['mpt__modal-frame']} ${styles['mpt__modal-frame--small']}`}
        >
          <Modal
            size="Small"
            title="Confirm policy save"
            onClose={() => setShowSaveDialog(false)}
            noBodyPadding
            footer={
              <div className={styles['mpt__footer-buttons']}>
                <Button
                  emphasis="Tertiary"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  emphasis="Primary"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Save and sync
                </Button>
              </div>
            }
          >
            <div className={styles['mpt__confirm-body']}>
              <div className={styles['mpt__confirm-text']}>
                Policy will be applied to{' '}
                <strong>{ASSIGNED_CHANNELS} channels</strong> and{' '}
                <strong>{teams.length} teams</strong>.{' '}
                <strong>14 members</strong> do not currently meet criteria and
                will be affected at next sync.
              </div>
              <SectionNotice
                type="Info"
                title="Cascading removals"
                description="Removed users will lose membership in all channels within affected teams. Team membership is a prerequisite for channel membership."
              />
            </div>
          </Modal>
        </div>
      )}

      {showEmptyWarning && (
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
                <Icon size="20" glyph={<AlertOutlineIcon />} />
                Warning: teams will be empty
              </span>
            }
            onClose={() => setShowEmptyWarning(false)}
            noBodyPadding
            footer={
              <div className={styles['mpt__footer-buttons']}>
                <Button
                  emphasis="Tertiary"
                  onClick={() => setShowEmptyWarning(false)}
                >
                  Cancel
                </Button>
                <Button
                  emphasis="Primary"
                  destructive
                  onClick={() => setShowEmptyWarning(false)}
                >
                  Continue
                </Button>
              </div>
            }
          >
            <div className={styles['mpt__confirm-body']}>
              <div className={styles['mpt__confirm-text']}>
                Warning: the access rules for this policy would remove all
                members from the following team(s):
              </div>
              <ul className={styles['mpt__confirm-list']}>
                <li>
                  <strong>Hotel Medical Corps</strong> (124 members)
                </li>
              </ul>
              <div className={styles['mpt__confirm-text']}>
                These teams will become empty until users matching the rules
                are added. Do you want to continue?
              </div>
              <SectionNotice
                type="Warning"
                title="System Admins retain access"
                description="Empty teams remain accessible to System Admins for management purposes."
              />
            </div>
          </Modal>
        </div>
      )}

      <div className={styles['mpt__anno']} style={{ marginTop: 16 }}>
        <span className={styles['mpt__anno-icon']}>
          <Icon size="16" glyph={<AlertCircleOutlineIcon />} />
        </span>
        <span>
          <strong>Try it:</strong> remove a team to see the Teams tab count
          drop in real time. Click <strong>Save</strong> to see the confirmation
          dialog. Switch demo steps above for the non-qualifying-member banner
          or empty-team warning paths. Both panels collapse via the chevron in
          the panel header.
          <br />
          <em>
            Policy deletion (when 0 channels and 0 teams) is shown as a static
            screen in <LabelTag label="Screen Group 7" size="X-Small" />.
          </em>
        </span>
      </div>
    </div>
  );
}
