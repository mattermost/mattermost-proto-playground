// SGPresentation — quick overview of what the prototype demonstrates and
// which spec sections / locked decisions each screen group maps to.
// Pure static content. No interaction.
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import Icon from '@/components/ui/Icon/Icon';
import styles from '../MembershipPoliciesTeams.module.scss';

interface Decision {
  id: string;
  question: string;
  decision: string;
  reflected: string;
}

const DECISIONS: Decision[] = [
  {
    id: 'OQ-1',
    question: 'Removal notification — DM, push, or both?',
    decision: 'DM system message only (shield-with-X icon).',
    reflected: 'SG6 — Removal DM static screen.',
  },
  {
    id: 'OQ-2',
    question:
      'Per-team page: editor-only assignment, or allow Disconnect action?',
    decision: 'Allow Disconnect from per-team page (parity with channel side).',
    reflected: 'SG3 — Disconnect from policy action + confirmation dialog.',
  },
  {
    id: 'OQ-3',
    question: 'User-centric diagnostic view in MVF?',
    decision: 'No — per-team member table suffices.',
    reflected: 'SG3 — per-team inline member diagnostic table only.',
  },
  {
    id: 'OQ-4',
    question: 'Team Admin custom rules: immediate or System Admin approval?',
    decision: 'Immediate — matches Phase 2 channel admin pattern.',
    reflected: 'SG5 — Save flow applies immediately (no approval step).',
  },
  {
    id: 'OQ-5',
    question:
      'Custom + system rules yield zero qualifying users — block or warn?',
    decision: 'Block via self-exclusion check.',
    reflected: 'SG5 — self-exclusion error; SG7 — error state callout.',
  },
  {
    id: 'VP-3',
    question: 'Team Admin authoring vs view-only?',
    decision: 'Authoring (Basic mode).',
    reflected: 'SG5 — Basic-mode editor present; no Advanced/CEL.',
  },
  {
    id: 'NEW-1',
    question: 'Last-admin guardrail when sync would remove the last admin?',
    decision:
      'Block at save (proactive); tolerate post-save drift with orphan + mmctl recovery path.',
    reflected:
      'SG5 — orphan-team error blocks save; SG7 — orphaned-team sync warning copy.',
  },
];

interface ScreenMap {
  group: string;
  surface: string;
  specSection: string;
}

const SPEC_MAPPING: ScreenMap[] = [
  {
    group: 'SG1 — Policy Editor',
    surface: 'System Console',
    specSection: '§3.1 Applies-to + segmented control + Save flow + orphan-admin block',
  },
  {
    group: 'SG2 — Add Teams modal',
    surface: 'System Console',
    specSection: '§3.4 Add Teams Modal',
  },
  {
    group: 'SG3 — Per-Team Configuration',
    surface: 'System Console',
    specSection: '§3.2 + OQ-2 Disconnect',
  },
  {
    group: 'SG4 — Sync details',
    surface: 'System Console',
    specSection: '§3.5 Membership sync jobs',
  },
  {
    group: 'SG5 — Team Settings',
    surface: 'Team Settings',
    specSection: '§3.3 + NEW-1 orphan guardrail',
  },
  {
    group: 'SG6 — End-user surfaces',
    surface: 'End User',
    specSection: '§4.1 Directory, §4.2 Invite, §4.3 RHS, §4.4 Removal DM',
  },
  {
    group: 'SG7 — Error + edge states',
    surface: 'Mixed',
    specSection: '§4.4 Mass-removal, NEW-1 orphan, OQ-5 self-exclusion, §3.1 deletion-blocked, §4.5 group-sync exclusivity',
  },
];

interface NewOQ {
  id: string;
  question: string;
  assumption: string;
}

const NEW_OPEN: NewOQ[] = [
  {
    id: 'OQ-6',
    question:
      'On Disconnect of the policy\'s last team via per-team page: auto-delete the (now-empty) policy, or persist it?',
    assumption: 'Persist — admin manually deletes via the policy editor.',
  },
  {
    id: 'OQ-7',
    question:
      'When both self-exclusion and orphan-admin errors apply to the same save in Team Settings: stack, combine, or show only the first?',
    assumption: 'Stack both as separate SectionNotices.',
  },
  {
    id: 'OQ-8',
    question:
      'Attribute pill sort order in the qualifying-member RHS and Invite modal: alphabetical, declared, or relevance?',
    assumption: 'Declared attribute order matching the policy definition.',
  },
];

export default function SGPresentation() {
  return (
    <div className={styles['pres']}>
      <div className={styles['pres__section']}>
        <h2 className={styles['pres__heading']}>What this prototype shows</h2>
        <p className={styles['pres__lead']}>
          This is the Phase 6 code prototype for Team Membership Policies. It
          implements Approach A ("Unified Resource Panel") from Phase 4:
          pill-style segmented control inside the System Console policy editor,
          plus a new "Team Membership" left-nav item inside Team Settings. Both
          surfaces have happy paths wired interactively; error and edge states
          are static screens with annotated callouts.
        </p>

        <ul className={styles['pres__bullets']}>
          <li className={styles['pres__bullet']}>
            <span className={styles['pres__bullet-icon']}>
              <Icon size="16" glyph={<CheckCircleIcon />} />
            </span>
            <span>
              Mounted at{' '}
              <span className={styles['mpt__inline-code']}>
                /prototypes/membership-policies-teams
              </span>
              . Built against spec v0.3 (2026-05-21) and the locked decisions of
              that date.
            </span>
          </li>
          <li className={styles['pres__bullet']}>
            <span className={styles['pres__bullet-icon']}>
              <Icon size="16" glyph={<CheckCircleIcon />} />
            </span>
            <span>
              All copy marked [AI DRAFT] in tone — content is for review, not
              shipping. Sample team and user names are invented (no customer
              names per workspace rule).
            </span>
          </li>
          <li className={styles['pres__bullet']}>
            <span className={styles['pres__bullet-icon']}>
              <Icon size="16" glyph={<CheckCircleIcon />} />
            </span>
            <span>
              Components reused from the sandbox library: Modal, Tabs, Button,
              IconButton, Checkbox, SectionNotice, Select, TextInput, Tooltip,
              UserAvatar, LabelTag, EmptyState, Icon.
            </span>
          </li>
        </ul>
      </div>

      <div className={styles['pres__section']}>
        <h2 className={styles['pres__heading']}>Locked decisions reflected</h2>
        <div className={styles['pres__decision-table']}>
          <div
            className={`${styles['pres__decision-row']} ${styles['pres__decision-row--header']}`}
          >
            <div
              className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--id']}`}
            >
              ID
            </div>
            <div
              className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--q']}`}
            >
              Question
            </div>
            <div
              className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--d']}`}
            >
              Decision &amp; where you'll see it
            </div>
          </div>
          {DECISIONS.map((d) => (
            <div key={d.id} className={styles['pres__decision-row']}>
              <div
                className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--id']}`}
              >
                {d.id}
              </div>
              <div
                className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--q']}`}
              >
                {d.question}
              </div>
              <div
                className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--d']}`}
              >
                <span className={styles['pres__decision-decision']}>
                  {d.decision}
                </span>
                <span className={styles['pres__decision-where']}>
                  {d.reflected}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles['pres__section']}>
        <h2 className={styles['pres__heading']}>Screen group → spec mapping</h2>
        <div className={styles['pres__decision-table']}>
          <div
            className={`${styles['pres__decision-row']} ${styles['pres__decision-row--header']}`}
          >
            <div
              className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--q']}`}
            >
              Screen Group
            </div>
            <div
              className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--surface']}`}
            >
              Surface
            </div>
            <div
              className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--d']}`}
            >
              Spec section
            </div>
          </div>
          {SPEC_MAPPING.map((m) => (
            <div key={m.group} className={styles['pres__decision-row']}>
              <div
                className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--q']}`}
              >
                {m.group}
              </div>
              <div
                className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--surface']}`}
              >
                {m.surface}
              </div>
              <div
                className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--d']}`}
              >
                {m.specSection}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles['pres__section']}>
        <h2 className={styles['pres__heading']}>
          New open questions surfaced during this build
        </h2>
        <p className={styles['pres__lead']}>
          Three OQs were added to spec v0.3 §11 during prototyping. The
          prototype implements the current spec assumption; design review may
          override.
        </p>
        <div className={styles['pres__decision-table']}>
          <div
            className={`${styles['pres__decision-row']} ${styles['pres__decision-row--header']}`}
          >
            <div
              className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--id']}`}
            >
              ID
            </div>
            <div
              className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--q']}`}
            >
              Question
            </div>
            <div
              className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--d']}`}
            >
              Prototype's current assumption
            </div>
          </div>
          {NEW_OPEN.map((d) => (
            <div key={d.id} className={styles['pres__decision-row']}>
              <div
                className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--id']}`}
              >
                {d.id}
              </div>
              <div
                className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--q']}`}
              >
                {d.question}
              </div>
              <div
                className={`${styles['pres__decision-cell']} ${styles['pres__decision-cell--d']}`}
              >
                {d.assumption}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles['pres__section']}>
        <h2 className={styles['pres__heading']}>What's still open from PRD</h2>
        <p className={styles['pres__lead']}>
          One PRD-level question remains unresolved (carried into MVF): a System
          Admin override path for policy denial (VP-1 from PRD). Not implemented
          in this prototype — see spec §4.2.
        </p>
      </div>
    </div>
  );
}
