// Team Membership Policies — Phase 6 prototype (sandbox port).
//
// Mirrors the layout of PBEFinalDesignV2 and SimulateAccess: a self-contained
// page with internal navigation between an overview/presentation screen and
// individual screen groups. Each screen group lives in its own module under
// ./screens/.
//
// Source-of-truth artifacts (see /specs/team-membership-policies/):
//   - decisions-2026-05-21.md       (locked decisions; resolves OQ-1..5, NEW-1, VP-3)
//   - phase7-ux-spec.md (v0.3)      (canonical spec; reflects locked decisions
//                                    and surfaces OQ-6, OQ-7, OQ-8)
//
// Phase 6 build target: prototype-playground/mattermost-proto-playground
// Registered in src/manifests/prototypes.ts.
import { useState, type ComponentType, type KeyboardEvent } from 'react';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import Icon from '@/components/ui/Icon/Icon';
import styles from './MembershipPoliciesTeams.module.scss';

import SGPresentation from './screens/SGPresentation';
import SG1PolicyEditor from './screens/SG1PolicyEditor';
import SG2AddTeamsModal from './screens/SG2AddTeamsModal';
import SG3PerTeamConfig from './screens/SG3PerTeamConfig';
import SG4SyncDetails from './screens/SG4SyncDetails';
import SG5TeamSettings from './screens/SG5TeamSettings';
import SG6EndUserStates from './screens/SG6EndUserStates';
import SG7EdgeStates from './screens/SG7EdgeStates';

interface ScreenGroup {
  id: string;
  num: string;
  name: string;
  desc: string;
  surface: 'System Console' | 'Team Settings' | 'End User' | 'Edge';
  mode: 'Interactive' | 'Static' | 'Mixed';
  featured?: boolean;
}

const SCREEN_GROUPS: ScreenGroup[] = [
  {
    id: 'presentation',
    num: 'P',
    name: 'Prototype overview',
    desc: 'Walkthrough of what is built and which decisions from 2026-05-21 are reflected. Maps each screen group to the spec v0.3 section it implements.',
    surface: 'System Console',
    mode: 'Static',
    featured: true,
  },
  {
    id: 'sg1',
    num: '1',
    name: 'Policy Editor — Applies to (Channels / Teams)',
    desc: 'System Console policy editor with the pill-style segmented control switching between Channels and Teams panels. Teams panel shows assigned teams, non-qualifying-member banner, Save confirmation dialog, and empty-team warning.',
    surface: 'System Console',
    mode: 'Interactive',
  },
  {
    id: 'sg2',
    num: '2',
    name: 'Add Teams modal',
    desc: 'Type-ahead search picker with checkboxes. Includes the three eligibility states: assignable, dimmed-because-assigned-to-other-policy, and disabled-because-group-synced.',
    surface: 'System Console',
    mode: 'Interactive',
  },
  {
    id: 'sg3',
    num: '3',
    name: 'Per-Team Configuration page',
    desc: 'System Console > Teams > [Team] read-only status surface: policy summary, sync counts, "Sync now", inline member diagnostic table, and the "Disconnect from policy" action (OQ-2). Empty + group-sync conflict states included.',
    surface: 'System Console',
    mode: 'Interactive',
  },
  {
    id: 'sg4',
    num: '4',
    name: 'Membership sync jobs — details',
    desc: 'Renamed "Membership sync jobs" section, sync history table, and the details view with Teams and Channels tabs plus drill-down rows.',
    surface: 'System Console',
    mode: 'Interactive',
  },
  {
    id: 'sg5',
    num: '5',
    name: 'Team Settings — Team Membership',
    desc: 'Team Settings modal with left-nav, Team Membership panel: system policy SectionNotice, Basic-mode custom rules editor, "Test access rules" modal, save confirmation with Allowed/Restricted parity. Self-exclusion + orphan-team errors (NEW-1).',
    surface: 'Team Settings',
    mode: 'Interactive',
  },
  {
    id: 'sg6',
    num: '6',
    name: 'End-user surfaces',
    desc: 'Team Members RHS for qualifying users (attribute pills + hover tooltip), Invite People modal, Team Directory join states (qualifying / non-qualifying), and the removal DM (OQ-1: DM only).',
    surface: 'End User',
    mode: 'Mixed',
  },
  {
    id: 'sg7',
    num: '7',
    name: 'Error + edge states',
    desc: 'Static error/edge screens with callouts: orphaned-team sync warning (NEW-1), self-exclusion block, mass-removal guardrail, policy-deletion-blocked tooltip, group-sync mutual exclusivity, generic denial copy.',
    surface: 'Edge',
    mode: 'Static',
  },
];

const COMPONENTS: Record<string, ComponentType> = {
  presentation: SGPresentation,
  sg1: SG1PolicyEditor,
  sg2: SG2AddTeamsModal,
  sg3: SG3PerTeamConfig,
  sg4: SG4SyncDetails,
  sg5: SG5TeamSettings,
  sg6: SG6EndUserStates,
  sg7: SG7EdgeStates,
};

export default function MembershipPoliciesTeams() {
  const [activeScreen, setActiveScreen] = useState<string | null>(null);

  if (activeScreen && COMPONENTS[activeScreen]) {
    const ScreenComponent = COMPONENTS[activeScreen];
    const sg = SCREEN_GROUPS.find((s) => s.id === activeScreen);
    return (
      <div className={styles['mpt__page']}>
        <div className={styles['mpt__page-header']}>
          <button
            type="button"
            className={styles['mpt__back-btn']}
            onClick={() => setActiveScreen(null)}
          >
            <Icon size="12" glyph={<ArrowLeftIcon />} />
            Back
          </button>
          <span className={styles['mpt__page-title']}>{sg?.name}</span>
          <span className={styles['mpt__page-mode']}>
            {sg?.surface} · {sg?.mode}
          </span>
        </div>
        <ScreenComponent />
      </div>
    );
  }

  const handleCardKey = (e: KeyboardEvent<HTMLButtonElement>, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveScreen(id);
    }
  };

  const chipClass = (mode: ScreenGroup['mode']) =>
    mode === 'Interactive'
      ? `${styles['mpt__screen-chip']} ${styles['mpt__screen-chip--interactive']}`
      : mode === 'Static'
        ? `${styles['mpt__screen-chip']} ${styles['mpt__screen-chip--static']}`
        : `${styles['mpt__screen-chip']} ${styles['mpt__screen-chip--mixed']}`;

  return (
    <div className={styles['mpt']}>
      <div className={styles['mpt__index-header']}>
        <h1 className={styles['mpt__index-title']}>
          Team Membership Policies
        </h1>
        <p className={styles['mpt__index-subtitle']}>
          Phase 6 prototype for Approach A "Unified Resource Panel". Pill-style
          segmented control in the System Console policy editor; new
          "Team Membership" item in the Team Settings left-nav. Reflects the
          2026-05-21 locked decisions (OQ-1 through OQ-5, VP-3, NEW-1) and
          spec v0.3. Happy paths are clickable; error and edge states are
          static screens with annotated callouts. [AI DRAFT] copy throughout.
        </p>
      </div>
      <div className={styles['mpt__screen-grid']}>
        {SCREEN_GROUPS.map((sg) => (
          <button
            key={sg.id}
            type="button"
            className={`${styles['mpt__screen-card']} ${sg.featured ? styles['mpt__screen-card--featured'] : ''}`}
            onClick={() => setActiveScreen(sg.id)}
            onKeyDown={(e) => handleCardKey(e, sg.id)}
            aria-label={`Open ${sg.name}`}
          >
            <span className={styles['mpt__screen-num']}>
              {sg.featured ? 'Overview' : `Screen Group ${sg.num}`}
            </span>
            <span className={styles['mpt__screen-name']}>{sg.name}</span>
            <span className={styles['mpt__screen-desc']}>{sg.desc}</span>
            <div className={styles['mpt__screen-meta']}>
              <span className={styles['mpt__screen-chip']}>{sg.surface}</span>
              <span className={chipClass(sg.mode)}>{sg.mode}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
