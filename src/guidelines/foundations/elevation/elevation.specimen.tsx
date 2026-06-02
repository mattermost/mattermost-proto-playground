import { ELEVATION_STEPS } from '@/guidelines/_components/ElevationSamples';
import styles from '@/styles/library-demo/foundations.module.scss';

export default function ElevationSpecimen() {
  return (
    <>
      <p>
        Each elevation level maps to a shadow token. Use the variable that matches
        the role of the layered surface — do not tune shadows by eye.
      </p>

      <div className={styles['foundations__elevation-rows']}>
        {ELEVATION_STEPS.map(({ level, token, summary }) => (
          <div key={level} className={styles['foundations__elevation-row']}>
            {token ? (
              <code className={styles['foundations__elevation-token']}>{token}</code>
            ) : (
              <span className={styles['foundations__elevation-token-placeholder']}>
                —
              </span>
            )}
            <div className={styles['foundations__elevation-preview']}>
              <div
                className={styles['foundations__elevation-tile']}
                style={token ? { boxShadow: `var(${token})` } : undefined}
              >
                <span className={styles['foundations__elevation-tile-level']}>
                  {level}
                </span>
              </div>
            </div>
            <span className={styles['foundations__elevation-desc']}>{summary}</span>
          </div>
        ))}
      </div>
    </>
  );
}
