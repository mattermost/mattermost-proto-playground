import type { SessionView } from '../sessionModel';
import styles from './AcvcSessionControls.module.scss';

export interface AcvcSessionControlsProps {
  label: string;
  session: SessionView;
  /**
   * Participation drives Create Posts. Shown on the read-only surface; hidden
   * on Denial / Traces where the story is Read Channel and every session is a
   * Participant by default.
   */
  showParticipation?: boolean;
}

function Segmented<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className={styles['acvc-session-controls__group']}>
      <span className={styles['acvc-session-controls__legend']}>{legend}</span>
      <div className={styles['acvc-session-controls__segmented']} role="group" aria-label={legend}>
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option)}
              className={[
                styles['acvc-session-controls__option'],
                active ? styles['acvc-session-controls__option--active'] : '',
              ]
                .join(' ')
                .trim()}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Verdict({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <span
      className={[
        styles['acvc-session-controls__verdict'],
        allowed
          ? styles['acvc-session-controls__verdict--allow']
          : styles['acvc-session-controls__verdict--deny'],
      ].join(' ')}
    >
      {label}: {allowed ? 'Allowed' : 'Denied'}
    </span>
  );
}

/**
 * Session attribute controls, rendered OUTSIDE the product frame.
 *
 * These are the prototype's instrument panel, not product UI — flipping one
 * changes what the policy engine would evaluate for that session, so the causal
 * link between an attribute change and the verdict is visible rather than
 * asserted. Each session is driven independently so divergence can be shown.
 */
export default function AcvcSessionControls({
  label,
  session,
  showParticipation = false,
}: AcvcSessionControlsProps) {
  const { state, canRead, canPost, setNetwork, setDevice, setParticipation } = session;

  return (
    <div className={styles['acvc-session-controls']}>
      <div className={styles['acvc-session-controls__identity']}>
        <span className={styles['acvc-session-controls__label']}>{label}</span>
        <Verdict label="Read Channels" allowed={canRead} />
        <Verdict label="Write to Channels" allowed={canPost} />
      </div>

      <div className={styles['acvc-session-controls__inputs']}>
        <Segmented
          legend="Network"
          value={state.ctx.network}
          options={['Trusted', 'Public'] as const}
          onChange={setNetwork}
        />
        <Segmented
          legend="Device"
          value={state.ctx.device}
          options={['Managed', 'Unmanaged'] as const}
          onChange={setDevice}
        />
        {showParticipation ? (
          <Segmented
            legend="Participation"
            value={state.ctx.participation}
            options={['Participant', 'Observer'] as const}
            onChange={setParticipation}
          />
        ) : null}
      </div>
    </div>
  );
}
