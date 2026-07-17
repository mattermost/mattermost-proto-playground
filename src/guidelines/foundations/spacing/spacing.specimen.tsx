import styles from '@/styles/library-demo/foundations.module.scss';

interface SpacingToken {
  token: string;
  px: number;
  desc?: string;
}

const SPACING_TOKENS: SpacingToken[] = [
  { token: '--spacing-xxxxs', px: 2, desc: 'Hairline gaps inside dense controls' },
  { token: '--spacing-xxxs', px: 4, desc: '4px sub-unit — small elements, type, icons' },
  { token: '--spacing-xxs', px: 6 },
  { token: '--spacing-xs', px: 8, desc: '8px base unit — default rhythm' },
  { token: '--spacing-s', px: 10 },
  { token: '--spacing-m', px: 12 },
  { token: '--spacing-l', px: 16, desc: 'Default card and panel padding' },
  { token: '--spacing-xl', px: 20 },
  { token: '--spacing-xxl', px: 24 },
  { token: '--spacing-xxxl', px: 32 },
  { token: '--spacing-xxxxl', px: 40 },
  { token: '--spacing-xxxxxl', px: 48 },
];

export function SpacingScaleContent() {
  return (
    <div className={styles['foundations__spacing-rows']}>
      {SPACING_TOKENS.map(({ token, px, desc }) => (
        <div key={token} className={styles['foundations__spacing-row']}>
          <code className={styles['foundations__spacing-token']}>{token}</code>
          <span className={styles['foundations__spacing-value']}>{px}px</span>
          <div className={styles['foundations__spacing-bar-track']}>
            <div
              className={styles['foundations__spacing-bar']}
              style={{ width: `${px}px` }}
            />
          </div>
          <span className={styles['foundations__spacing-desc']}>{desc ?? ''}</span>
        </div>
      ))}
    </div>
  );
}

export default function SpacingLibrary() {
  return <SpacingScaleContent />;
}
