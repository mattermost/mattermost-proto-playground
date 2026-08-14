import styles from '@/styles/library-demo/foundations.module.scss';

const RADII = [
  { token: '--radius-xs', value: '2px' },
  { token: '--radius-s', value: '4px' },
  { token: '--radius-m', value: '8px' },
  { token: '--radius-l', value: '12px' },
  { token: '--radius-xl', value: '16px' },
  { token: '--radius-full', value: '9999px' },
];

export function ShapeRadiiContent() {
  return (
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
  );
}

export default function ShapeLibrary() {
  return <ShapeRadiiContent />;
}
