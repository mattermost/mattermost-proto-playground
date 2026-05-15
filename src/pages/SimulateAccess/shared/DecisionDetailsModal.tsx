/**
 * DecisionDetailsModal — user-aggregate Decision Details surface.
 *
 * Visual structure (per engineering reference):
 *   - Title: "Decision details" (sentence case)
 *   - User block: avatar + name + handle (below the title, inside the body)
 *   - Permission cards: one card per permission with the action label on the
 *     left and the verdict pill on the right; denied cards expose a
 *     "Show / Hide evaluation trace" toggle that expands a rich policy
 *     breakdown below the card header.
 *   - Footer: Cancel + Save (read-only at this stage; both close the modal).
 *
 * The trace data is stubbed (`buildTraceData`) because the prototype's
 * verdict model carries only the final outcome, not the underlying policy
 * graph. The stub is deterministic per verdict so the visual is stable.
 */
import { useEffect, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import Chip from '@/components/ui/Chip/Chip';
import VerdictPill from './VerdictPill';
import { ACTION_LABELS } from './types';
import type {
  AdminRole,
  EditorScope,
  EntryContext,
  PerActionVerdict,
  PermissionAction,
  UserSimulationRow,
  VerdictAttribution,
} from './types';
import styles from './SimulateAccess.module.scss';

export interface DecisionDetailsModalProps {
  user: UserSimulationRow;
  /** Preserved for back-compat with the session-row entry point; currently unused
   *  in the flat user-aggregate view. */
  focusedSessionId?: string;
  role: AdminRole;
  context: EntryContext;
  scope: EditorScope;
  onClose: () => void;
}

const DENIED_VERDICTS: ReadonlySet<VerdictAttribution> = new Set<VerdictAttribution>([
  'denied-not-a-member',
  'denied-no-recent-session',
  'denied-this-policy',
  'denied-another-policy',
  'denied-system-policy',
  'denied-both',
]);

// ─────────────────────────────────────────────────────────────────────────────
// Stub trace data
// ─────────────────────────────────────────────────────────────────────────────
// Real product would derive this from the policy evaluation log. For the
// prototype we generate a deterministic, illustrative trace per verdict so the
// visual is stable and consistent with the engineering reference screenshot.

interface TraceClause {
  passed: boolean;
  expr: string;
  /** Shown beneath failed clauses — the attribute's actual resolved value. */
  actual?: string;
}

interface TraceClauseGroup {
  combinator: 'AND' | 'OR';
  passed: boolean;
  clauses: TraceClause[];
}

interface TracePolicy {
  index: number;
  outcome: 'allowed' | 'denied';
  /** Optional policy name — shown alongside "Policy:" prefix for denied entries. */
  name?: string;
  clauseGroup: TraceClauseGroup;
}

interface TraceData {
  summary: string;
  policies: TracePolicy[];
}

function buildTraceData(action: PermissionAction, verdict: VerdictAttribution): TraceData {
  // One reusable allowed-policy that matches on a program membership clause.
  const allowedPolicy: TracePolicy = {
    index: 1,
    outcome: 'allowed',
    clauseGroup: {
      combinator: 'OR',
      passed: true,
      clauses: [
        { passed: true, expr: '"Helios" in user.attributes.Program' },
        {
          passed: false,
          expr: '"Orion" in user.attributes.Program',
          actual: '["Helios"]',
        },
      ],
    },
  };

  // Denied policy varies slightly per verdict to make the trace feel intentional.
  const deniedPolicy: TracePolicy = {
    index: 2,
    outcome: 'denied',
    name: action === 'upload_file_attachment' ? 'Members back up' : 'Members policy',
    clauseGroup: {
      combinator: 'AND',
      passed: false,
      clauses: [
        { passed: true, expr: '"Helios" in user.attributes.Program' },
        {
          passed: false,
          expr: '"Artemis" in user.attributes.Program',
          actual: '["Helios"]',
        },
      ],
    },
  };

  // Special cases that don't involve policy combination at all.
  if (verdict === 'denied-not-a-member') {
    return {
      summary: 'User is not a member of any team scope that grants this permission.',
      policies: [
        {
          index: 1,
          outcome: 'denied',
          name: 'Membership check',
          clauseGroup: {
            combinator: 'AND',
            passed: false,
            clauses: [
              {
                passed: false,
                expr: 'user in team.members',
                actual: 'false',
              },
            ],
          },
        },
      ],
    };
  }

  if (verdict === 'denied-no-recent-session') {
    return {
      summary:
        'No recent session within the last 30 days. The fail-secure default denies the request.',
      policies: [
        {
          index: 1,
          outcome: 'denied',
          name: 'Recent-session check',
          clauseGroup: {
            combinator: 'AND',
            passed: false,
            clauses: [
              {
                passed: false,
                expr: 'session.last_active >= now() - 30d',
                actual: 'null',
              },
            ],
          },
        },
      ],
    };
  }

  // Default deny-wins narrative for the policy-combination cases.
  return {
    summary:
      '1 policy denied; 1 policy allowed. Multiple policies on the same scope combine with deny-wins, so any single deny produces an overall deny.',
    policies: [allowedPolicy, deniedPolicy],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DecisionDetailsModal({
  user,
  role,
  context,
  scope,
  onClose,
}: DecisionDetailsModalProps) {
  const [expandedTraces, setExpandedTraces] = useState<Set<string>>(new Set());

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function toggleTrace(key: string) {
    setExpandedTraces((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Aggregate per-permission verdicts across all sessions.
  const verdicts: PerActionVerdict[] = user.perActionVerdicts;

  return (
    <div
      className={styles['sa-decision-overlay']}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Modal
        size="Medium"
        title="Decision details"
        onClose={onClose}
        footer={
          <>
            <Button emphasis="Tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button emphasis="Primary" onClick={onClose}>
              Save
            </Button>
          </>
        }
      >
        <div className={styles['sa-decision-body']}>
          {/* User block — avatar + name + handle */}
          <div className={styles['sa-decision-user']}>
            <UserAvatar src={user.avatarSrc} alt={user.name} size="40" />
            <div className={styles['sa-decision-user__text']}>
              <span className={styles['sa-decision-user__name']}>{user.name}</span>
              <span className={styles['sa-decision-user__handle']}>@{user.handle}</span>
            </div>
          </div>

          {/* Per-permission cards */}
          <ul className={styles['sa-decision-permissions']}>
            {verdicts.map((entry) => {
              const isDenied = DENIED_VERDICTS.has(entry.verdict);
              const traceKey = entry.action;
              const isTraceOpen = expandedTraces.has(traceKey);
              const trace = isDenied ? buildTraceData(entry.action, entry.verdict) : null;

              return (
                <li
                  key={entry.action}
                  className={[
                    styles['sa-decision-card'],
                    isDenied && styles['sa-decision-card--denied'],
                    isTraceOpen && styles['sa-decision-card--expanded'],
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className={styles['sa-decision-card__header']}>
                    <span className={styles['sa-decision-card__label']}>
                      {ACTION_LABELS[entry.action]}
                    </span>
                    <div className={styles['sa-decision-card__pill']}>
                      <VerdictPill
                        verdict={entry.verdict}
                        role={role}
                        context={context}
                        scope={scope}
                      />
                    </div>
                  </div>

                  {isDenied && trace && (
                    <>
                      <button
                        type="button"
                        className={[
                          styles['sa-decision-card__trace-toggle'],
                          isTraceOpen && styles['sa-decision-card__trace-toggle--open'],
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => toggleTrace(traceKey)}
                        aria-expanded={isTraceOpen}
                        aria-controls={`${traceKey}-trace`}
                      >
                        <span
                          className={styles['sa-decision-card__trace-chevron']}
                          aria-hidden
                        >
                          <Icon glyph={<ChevronDownIcon />} size="12" />
                        </span>
                        {isTraceOpen ? 'Hide evaluation trace' : 'Show evaluation trace'}
                      </button>

                      {isTraceOpen && (
                        <div
                          id={`${traceKey}-trace`}
                          className={styles['sa-decision-trace']}
                        >
                          <p className={styles['sa-decision-trace__summary']}>
                            {trace.summary}
                          </p>
                          <ol className={styles['sa-decision-trace__policies']}>
                            {trace.policies.map((policy) => (
                              <PolicyCard key={policy.index} policy={policy} />
                            ))}
                          </ol>
                        </div>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal subcomponents
// ─────────────────────────────────────────────────────────────────────────────

function PolicyCard({ policy }: { policy: TracePolicy }) {
  const isAllowed = policy.outcome === 'allowed';
  return (
    <li
      className={[
        styles['sa-decision-policy'],
        isAllowed
          ? styles['sa-decision-policy--allowed']
          : styles['sa-decision-policy--denied'],
      ].join(' ')}
    >
      <div className={styles['sa-decision-policy__header']}>
        <span className={styles['sa-decision-policy__number']} aria-hidden>
          {policy.index}
        </span>
        {policy.name && (
          <span className={styles['sa-decision-policy__name']}>
            Policy: {policy.name}
          </span>
        )}
        <span className={styles['sa-decision-policy__outcome']}>
          {isAllowed ? (
            <Chip tone="success" size="Medium">
              Your policy: Allowed
            </Chip>
          ) : (
            <Chip tone="danger" size="Medium">
              Denied
            </Chip>
          )}
        </span>
      </div>

      <ClauseGroup group={policy.clauseGroup} />
    </li>
  );
}

function ClauseGroup({ group }: { group: TraceClauseGroup }) {
  const headerLabel =
    group.combinator === 'AND'
      ? 'ALL OF THE FOLLOWING MUST HOLD (AND)'
      : 'ANY OF THE FOLLOWING MAY HOLD (OR)';

  return (
    <div
      className={[
        styles['sa-decision-clause-group'],
        group.passed
          ? styles['sa-decision-clause-group--passed']
          : styles['sa-decision-clause-group--failed'],
      ].join(' ')}
    >
      <div className={styles['sa-decision-clause-group__header']}>
        <StatusIcon passed={group.passed} />
        <span className={styles['sa-decision-clause-group__label']}>{headerLabel}</span>
      </div>
      <ul className={styles['sa-decision-clause-group__list']}>
        {group.clauses.map((clause, idx) => (
          <li
            key={idx}
            className={[
              styles['sa-decision-clause'],
              clause.passed
                ? styles['sa-decision-clause--passed']
                : styles['sa-decision-clause--failed'],
            ].join(' ')}
          >
            <StatusIcon passed={clause.passed} />
            <div className={styles['sa-decision-clause__body']}>
              <code className={styles['sa-decision-clause__expr']}>{clause.expr}</code>
              {!clause.passed && clause.actual !== undefined && (
                <div className={styles['sa-decision-clause__actual']}>
                  <span className={styles['sa-decision-clause__actual-label']}>Actual:</span>{' '}
                  <code className={styles['sa-decision-clause__actual-value']}>
                    {clause.actual}
                  </code>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusIcon({ passed }: { passed: boolean }) {
  return (
    <span
      className={[
        styles['sa-decision-status-icon'],
        passed
          ? styles['sa-decision-status-icon--passed']
          : styles['sa-decision-status-icon--failed'],
      ].join(' ')}
      aria-hidden
    >
      <Icon glyph={passed ? <CheckCircleIcon /> : <CloseCircleIcon />} size="16" />
    </span>
  );
}
