import type { ReactNode } from 'react';
import AcvcSessionControls from './AcvcSessionControls';
import type { SessionView } from '../sessionModel';
import styles from './AcvcSessionStage.module.scss';

/** Standard laptop viewport. The frame renders at this size and never reflows. */
export const FRAME_WIDTH = 1366;
export const FRAME_HEIGHT = 768;

export interface AcvcSessionStageProps {
  title: string;
  note?: ReactNode;
  /**
   * Omit for surfaces whose behaviour does not depend on session attributes —
   * admin authoring, for instance. The controls are then not rendered at all,
   * rather than shown inert.
   */
  session?: SessionView;
  /** Label for the session control row. */
  label?: string;
  /** Show the Participation control (Create Posts). Off by default. */
  showParticipation?: boolean;
  children: ReactNode;
}

/**
 * Caption, session controls, and one product frame.
 *
 * Single session by design. An earlier version rendered two sessions side by
 * side to prove the verdict is per-session; that became redundant once the
 * attribute controls moved above every screen — the reviewer reaches both
 * states by flipping a control rather than by comparing two frames, and one
 * full-size frame reads better than two.
 *
 * The controls sit deliberately OUTSIDE the frame: they are the prototype's
 * instrument panel, not product UI.
 */
export default function AcvcSessionStage({
  title,
  note,
  session,
  label = 'This session',
  showParticipation = false,
  children,
}: AcvcSessionStageProps) {
  return (
    <section className={styles['acvc-session-stage']}>
      <header className={styles['acvc-session-stage__caption']}>
        <h2 className={styles['acvc-session-stage__title']}>{title}</h2>
        {note ? <p className={styles['acvc-session-stage__note']}>{note}</p> : null}
      </header>

      {session ? (
        <AcvcSessionControls
          label={label}
          session={session}
          showParticipation={showParticipation}
        />
      ) : null}

      <div className={styles['acvc-session-stage__viewport']}>
        <div
          className={styles['acvc-session-stage__frame']}
          style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
