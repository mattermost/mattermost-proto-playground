import styles from '@/styles/library-demo/foundations.module.scss';

const RADII = [
  { token: '--radius-xs', value: '2px' },
  { token: '--radius-s', value: '4px' },
  { token: '--radius-m', value: '8px' },
  { token: '--radius-l', value: '12px' },
  { token: '--radius-xl', value: '16px' },
  { token: '--radius-full', value: '9999px' },
];

export default function ShapeLibrary() {
  return (
    <>
      <p>
        Corner radii are expressed as tokens so surfaces stay consistent across
        components. Use the variable that matches the control or container role.
      </p>

      <div className={styles['foundations__shape-rows']}>
        {RADII.map(({ token, value }) => (
          <div key={token} className={styles['foundations__shape-row']}>
            <code className={styles['foundations__shape-token']}>{token}</code>
            <span className={styles['foundations__shape-value']}>{value}</span>
            <div className={styles['foundations__shape-preview']}>
              <div
                className={styles['foundations__shape-box']}
                style={{ borderRadius: `var(${token})` }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
