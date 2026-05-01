import styles from './Foundations.module.scss';

const FONT_FAMILIES = [
  { name: 'Heading', token: '--font-family-heading', value: 'Metropolis' },
  { name: 'Body', token: '--font-family-body', value: 'Open Sans' },
  { name: 'Mono', token: '--font-family-mono', value: 'Menlo' },
];

const TYPE_SCALE = [
  { step: '25', size: '10px', lineHeight: '16px' },
  { step: '50', size: '11px', lineHeight: '16px' },
  { step: '75', size: '12px', lineHeight: '16px' },
  { step: '100', size: '14px', lineHeight: '20px' },
  { step: '200', size: '16px', lineHeight: '24px' },
  { step: '300', size: '18px', lineHeight: '24px' },
  { step: '400', size: '20px', lineHeight: '28px' },
  { step: '500', size: '22px', lineHeight: '28px' },
  { step: '600', size: '25px', lineHeight: '30px' },
  { step: '700', size: '28px', lineHeight: '36px' },
  { step: '800', size: '32px', lineHeight: '40px' },
  { step: '900', size: '36px', lineHeight: '44px' },
  { step: '1000', size: '40px', lineHeight: '48px' },
];

const FONT_WEIGHTS = [
  { name: 'Light', value: '300', token: '--font-weight-light' },
  { name: 'Regular', value: '400', token: '--font-weight-regular' },
  { name: 'Semibold', value: '600', token: '--font-weight-semibold' },
  { name: 'Bold', value: '700', token: '--font-weight-bold' },
];

export default function TypographyLibrary() {
  return (
    <>
      <h3 className={styles['foundations__subsection-title']}>Families</h3>
      <div className={styles['foundations__type-families']}>
        {FONT_FAMILIES.map(({ name, token, value }) => (
          <div key={name} className={styles['foundations__type-family']}>
            <span
              className={styles['foundations__type-family-sample']}
              style={{ fontFamily: `var(${token})` }}
            >
              Aa
            </span>
            <div className={styles['foundations__type-family-meta']}>
              <span className={styles['foundations__type-family-name']}>
                {name}
              </span>
              <span className={styles['foundations__type-family-value']}>
                {value}
              </span>
              <code className={styles['foundations__type-family-token']}>
                {token}
              </code>
            </div>
          </div>
        ))}
      </div>

      <h3 className={styles['foundations__subsection-title']}>Scale</h3>
      <div className={styles['foundations__type-scale']}>
        {TYPE_SCALE.map(({ step, size, lineHeight }) => (
          <div key={step} className={styles['foundations__type-row']}>
            <div className={styles['foundations__type-meta']}>
              <span className={styles['foundations__type-step']}>{step}</span>
              <span className={styles['foundations__type-dim']}>
                {size} / {lineHeight}
              </span>
            </div>
            <span
              className={styles['foundations__type-sample']}
              style={{
                fontSize: `var(--font-size-${step})`,
                lineHeight: `var(--line-height-${step})`,
              }}
            >
              The quick brown fox
            </span>
          </div>
        ))}
      </div>

      <h3 className={styles['foundations__subsection-title']}>Weights</h3>
      <div className={styles['foundations__type-weights']}>
        {FONT_WEIGHTS.map(({ name, value, token }) => (
          <div key={name} className={styles['foundations__weight-row']}>
            <div className={styles['foundations__type-meta']}>
              <span className={styles['foundations__type-step']}>{name}</span>
              <span className={styles['foundations__type-dim']}>{value}</span>
            </div>
            <span
              className={styles['foundations__weight-sample']}
              style={{ fontWeight: `var(${token})` }}
            >
              The quick brown fox jumps over the lazy dog
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
