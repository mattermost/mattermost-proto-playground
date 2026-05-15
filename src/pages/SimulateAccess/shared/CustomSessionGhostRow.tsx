/**
 * Option B — Inline ghost row that morphs into an editable session.
 *
 * Renders below the user's real sessions inside the expanded session list as a
 * dashed-border ghost row. Click to morph in place into editable fields. After
 * test, the form collapses to a synthetic session row matching the real-session
 * row layout (with synthetic chrome).
 *
 * For 0-session users, the ghost row is the dominant CTA in place of the
 * fail-secure-deny placeholder — copy is amplified accordingly.
 */
import { useState } from 'react';
import Icon from '@/components/ui/Icon/Icon';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import FlaskOutlineIcon from '@mattermost/compass-icons/components/flask-outline';
import VerdictPill from './VerdictPill';
import CustomSessionForm from './CustomSessionForm';
import { buildCustomSession } from './customSession';
import type { CustomSessionFields } from './customSession';
import type {
  AdminRole,
  EditorScope,
  EntryContext,
  PolicyContext,
  SessionDecision,
  UserSimulationRow,
} from './types';
import styles from './SimulateAccess.module.scss';

export interface CustomSessionGhostRowProps {
  user: UserSimulationRow;
  role: AdminRole;
  context: EntryContext;
  scope: EditorScope;
  policy?: PolicyContext;
}

type GhostState = 'ghost' | 'editing' | 'result';

export default function CustomSessionGhostRow({
  user,
  role,
  context,
  scope,
  policy,
}: CustomSessionGhostRowProps) {
  const realSessions = user.sessions.filter((s) => !s.isPlaceholder);
  const emptyMode = realSessions.length === 0;

  const [state, setState] = useState<GhostState>(emptyMode ? 'editing' : 'ghost');
  const [result, setResult] = useState<SessionDecision | null>(null);
  const [lastFields, setLastFields] = useState<CustomSessionFields | null>(null);

  function handleSubmit(fields: CustomSessionFields) {
    setResult(buildCustomSession(fields, policy));
    setLastFields(fields);
    setState('result');
  }

  function handleClear() {
    setResult(null);
    setLastFields(null);
    setState(emptyMode ? 'editing' : 'ghost');
  }

  if (state === 'ghost') {
    return (
      <button
        type="button"
        className={[
          styles['sa-cs-ghost'],
          emptyMode && styles['sa-cs-ghost--empty-mode'],
        ].filter(Boolean).join(' ')}
        onClick={() => setState('editing')}
      >
        <span className={styles['sa-cs-ghost__kicker']}>
          <Icon glyph={<FlaskOutlineIcon />} size="12" />
          CUSTOM SESSION
        </span>
        <span className={styles['sa-cs-ghost__label']}>
          <Icon glyph={<PlusIcon />} size="12" />
          {emptyMode ? 'Build a custom session to test this user' : 'Try a custom session'}
        </span>
      </button>
    );
  }

  if (state === 'editing') {
    return (
      <div className={styles['sa-cs-ghost-edit']}>
        <div className={styles['sa-cs-ghost-edit__kicker']}>
          <Icon glyph={<FlaskOutlineIcon />} size="12" />
          <span>CUSTOM SESSION</span>
        </div>
        {emptyMode ? (
          <p className={styles['sa-cs-ghost-edit__copy']}>
            No recent session for this user, so the policy denies them by default.
            Build a custom session to find conditions that would allow access.
          </p>
        ) : (
          <p className={styles['sa-cs-ghost-edit__copy']}>
            This doesn't change anything about the user's real sessions.
          </p>
        )}
        <CustomSessionForm
          user={user}
          policy={policy}
          emptyMode={emptyMode}
          initialValues={lastFields ?? undefined}
          onCancel={() => setState(emptyMode ? 'editing' : 'ghost')}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  if (state === 'result' && result) {
    return (
      <div className={styles['sa-cs-result-row']}>
        <div className={styles['sa-cs-result-row__device']}>
          <span className={styles['sa-cs-result-row__kicker']}>
            <Icon glyph={<FlaskOutlineIcon />} size="12" />
            CUSTOM SESSION
          </span>
          <span className={styles['sa-cs-result-row__name']}>Custom session</span>
          <span className={styles['sa-cs-result-row__meta']}>Built by you · just now</span>
        </div>
        <div className={styles['sa-cs-result-row__verdict']}>
          <VerdictPill
            verdict={result.verdict}
            role={role}
            context={context}
            scope={scope}
          />
        </div>
        <div className={styles['sa-cs-result-row__actions']}>
          <button
            type="button"
            className={styles['sa-cs-result-row__link']}
            onClick={() => setState('editing')}
          >
            Change values
          </button>
          <button
            type="button"
            className={styles['sa-cs-result-row__link']}
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>
    );
  }

  return null;
}
