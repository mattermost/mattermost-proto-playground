import styles from './Foundations.module.scss';

const RADII = [
  { name: 'XS', token: '--radius-xs', value: '2px' },
  { name: 'S', token: '--radius-s', value: '4px' },
  { name: 'M', token: '--radius-m', value: '8px' },
  { name: 'L', token: '--radius-l', value: '12px' },
  { name: 'XL', token: '--radius-xl', value: '16px' },
  { name: 'Full', token: '--radius-full', value: '50%' },
];

export default function ShapeLibrary() {
  return (
    <div className={styles['foundations__radii']}>
      {RADII.map(({ name, token, value }) => (
        <div key={name} className={styles['foundations__radius']}>
          <div
            className={styles['foundations__radius-box']}
            style={{ borderRadius: `var(${token})` }}
          />
          <span className={styles['foundations__radius-name']}>{name}</span>
          <span className={styles['foundations__radius-value']}>{value}</span>
          <code className={styles['foundations__radius-token']}>{token}</code>
        </div>
      ))}
    </div>
  );
}
