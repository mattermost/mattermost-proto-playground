import styles from '@/styles/library-demo/foundations.module.scss';

interface SpacingToken {
  name: string;
  token: string;
  px: number;
  desc?: string;
}

const SPACING_TOKENS: SpacingToken[] = [
  { name: 'xxxxs', token: '--spacing-xxxxs', px: 2, desc: 'Hairline gaps inside dense controls' },
  { name: 'xxxs', token: '--spacing-xxxs', px: 4, desc: '4px sub-unit — small elements, type, icons' },
  { name: 'xxs', token: '--spacing-xxs', px: 6 },
  { name: 'xs', token: '--spacing-xs', px: 8, desc: '8px base unit — default rhythm' },
  { name: 's', token: '--spacing-s', px: 10 },
  { name: 'm', token: '--spacing-m', px: 12 },
  { name: 'l', token: '--spacing-l', px: 16, desc: 'Default card and panel padding' },
  { name: 'xl', token: '--spacing-xl', px: 20 },
  { name: 'xxl', token: '--spacing-xxl', px: 24 },
  { name: 'xxxl', token: '--spacing-xxxl', px: 32 },
  { name: 'xxxxl', token: '--spacing-xxxxl', px: 40 },
  { name: 'xxxxxl', token: '--spacing-xxxxxl', px: 48 },
];

export default function SpacingLibrary() {
  return (
    <>
      <p>
        Use spacing tokens for every gap, margin, and padding. Working from the
        scale keeps rhythm consistent across components.
      </p>

      <div className={styles['foundations__spacing-rows']}>
        {SPACING_TOKENS.map(({ name, token, px, desc }) => (
          <div key={token} className={styles['foundations__spacing-row']}>
            <span className={styles['foundations__spacing-name']}>{name}</span>
            <code className={styles['foundations__spacing-token']}>{token}</code>
            <span className={styles['foundations__spacing-value']}>{px}px</span>
            <div className={styles['foundations__spacing-bar-track']}>
              <div
                className={styles['foundations__spacing-bar']}
                style={{ width: `${px}px` }}
              />
            </div>
            <span className={styles['foundations__spacing-desc']}>
              {desc ?? ''}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
