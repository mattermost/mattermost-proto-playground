// [AI DRAFT] Session instrument panel, rendered OUTSIDE the product frame.
// Flipping a control changes what the policy engine evaluates for this
// session, so the cause of each verdict is visible rather than asserted.
import { conversationByName, isDirect } from '../conversations';
import { VIEWER } from '../dmgmData';
import type { DmSession } from './useDmSession';
import styles from './DmgmSessionControls.module.scss';

function Segmented({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles['dmgm-session-controls__group']}>
      <span className={styles['dmgm-session-controls__legend']}>{legend}</span>
      <div
        className={styles['dmgm-session-controls__segmented']}
        role="group"
        aria-label={legend}
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={option === value}
            onClick={() => onChange(option)}
            className={[
              styles['dmgm-session-controls__option'],
              option === value
                ? styles['dmgm-session-controls__option--active']
                : '',
            ]
              .join(' ')
              .trim()}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function Verdict({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <span
      className={[
        styles['dmgm-session-controls__verdict'],
        allowed
          ? styles['dmgm-session-controls__verdict--allow']
          : styles['dmgm-session-controls__verdict--deny'],
      ].join(' ')}
    >
      {label}: {allowed ? 'Allowed' : 'Denied'}
    </span>
  );
}

export default function DmgmSessionControls({
  session,
}: {
  session: DmSession;
}) {
  const conversation = conversationByName(session.active);
  const direct = isDirect(conversation);
  return (
    <div className={styles['dmgm-session-controls']}>
      <div className={styles['dmgm-session-controls__identity']}>
        <span className={styles['dmgm-session-controls__label']}>
          {VIEWER.name} · Ashgrove contractor · this session
        </span>
        {direct ? (
          <>
            <span className={styles['dmgm-session-controls__context']}>
              {conversation.name}
            </span>
            <Verdict label="View" allowed={session.canView} />
            <Verdict label="Write" allowed={session.canPost} />
          </>
        ) : (
          <span className={styles['dmgm-session-controls__context']}>
            {conversation.name} is a channel. These policies don’t apply to it.
          </span>
        )}
      </div>
      <div className={styles['dmgm-session-controls__inputs']}>
        <Segmented
          legend="Network"
          value={session.ctx.Network}
          options={['Trusted', 'Public']}
          onChange={session.setNetwork}
        />
        <Segmented
          legend="Device"
          value={session.ctx.Device}
          options={['Managed', 'Unmanaged']}
          onChange={session.setDevice}
        />
      </div>
    </div>
  );
}
