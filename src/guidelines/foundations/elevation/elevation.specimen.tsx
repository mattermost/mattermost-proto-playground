import { ELEVATION_STEPS } from '@/guidelines/_components/ElevationSamples';
import styles from '@/styles/library-demo/foundations.module.scss';

export function ElevationScaleContent() {
  return (
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
  );
}

export default function ElevationSpecimen() {
  return <ElevationScaleContent />;
}
