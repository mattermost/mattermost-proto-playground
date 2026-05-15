/**
 * Option C — Persistent "Custom session" card.
 *
 * Renders below the user's real sessions inside the expanded session list.
 * Collapsed-by-default for users with real sessions (one-line prompt + Set up button).
 * Expanded-by-default for users with 0 real sessions — that case is the highest-value entry.
 *
 * Three states:
 *   1. collapsed — 36px tall row with "Try a custom session" prompt + Set up button
 *   2. editing — form fields visible, Cancel / Test buttons
 *   3. result — synthetic session row inline + Edit / Clear links
 *
 * Synthetic chrome is unmistakable: dashed top border, 3px info left bar,
 * faint info-tone background, persistent CUSTOM SESSION kicker.
 */
import { useState } from 'react';
import Icon from '@/components/ui/Icon/Icon';
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

export interface CustomSessionPersistentCardProps {
  user: UserSimulationRow;
  role: AdminRole;
  context: EntryContext;
  scope: EditorScope;
  policy?: PolicyContext;
}

type CardState = 'collapsed' | 'editing' | 'result';

export default function CustomSessionPersistentCard({
  user,
  role,
  context,
  scope,
  policy,
}: CustomSessionPersistentCardProps) {
  const realSessions = user.sessions.filter((s) => !s.isPlaceholder);
  const emptyMode = realSessions.length === 0;

  // 0-session users: card is expanded by default.
  const [state, setState] = useState<CardState>(emptyMode ? 'editing' : 'collapsed');
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
    setState(emptyMode ? 'editing' : 'collapsed');
  }

  return (
    <div
      className={[
        styles['sa-cs-card'],
        emptyMode && styles['sa-cs-card--empty-mode'],
      ].filter(Boolean).join(' ')}
    >
      <div className={styles['sa-cs-card__kicker']}>
        <Icon glyph={<FlaskOutlineIcon />} size="12" />
        <span>CUSTOM SESSION</span>
      </div>

      {state === 'collapsed' && (
        <div className={styles['sa-cs-card__collapsed']}>
          <span className={styles['sa-cs-card__prompt']}>
            Try a custom session — test what would happen under different conditions
          </span>
          <button
            type="button"
            className={styles['sa-cs-card__cta']}
            onClick={() => setState('editing')}
          >
            Set it up
          </button>
        </div>
      )}

      {state === 'editing' && (
        <>
          {emptyMode ? (
            <p className={styles['sa-cs-card__empty-copy']}>
              No recent session for this user, so the policy denies them by default.
              Build a custom session to find conditions that would allow access.
            </p>
          ) : (
            <p className={styles['sa-cs-card__edit-copy']}>
              This doesn't change anything about the user's real sessions.
            </p>
          )}
          <CustomSessionForm
            user={user}
            policy={policy}
            emptyMode={emptyMode}
            initialValues={lastFields ?? undefined}
            onCancel={() => setState(emptyMode ? 'editing' : 'collapsed')}
            onSubmit={handleSubmit}
          />
        </>
      )}

      {state === 'result' && result && (
        <div className={styles['sa-cs-card__result']}>
          <div className={styles['sa-cs-card__result-row']}>
            <div className={styles['sa-cs-card__result-device']}>
              <span className={styles['sa-cs-card__result-name']}>Custom session</span>
              <span className={styles['sa-cs-card__result-meta']}>Built by you · just now</span>
            </div>
            <div className={styles['sa-cs-card__result-verdict']}>
              <VerdictPill
                verdict={result.verdict}
                role={role}
                context={context}
                scope={scope}
              />
            </div>
          </div>
          <div className={styles['sa-cs-card__result-actions']}>
            <button
              type="button"
              className={styles['sa-cs-card__link']}
              onClick={() => setState('editing')}
            >
              Change values
            </button>
            <button
              type="button"
              className={styles['sa-cs-card__link']}
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
