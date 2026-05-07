import styles from '@/styles/library-demo/foundations.module.scss';

const PALETTES = [
  {
    name: 'Neutral',
    prefix: 'color-neutral',
    steps: [
      0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700,
      750, 800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200,
    ],
  },
  {
    name: 'Blue',
    prefix: 'color-blue',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Cyan',
    prefix: 'color-cyan',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Green',
    prefix: 'color-green',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Indigo',
    prefix: 'color-indigo',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Orange',
    prefix: 'color-orange',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Purple',
    prefix: 'color-purple',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Red',
    prefix: 'color-red',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Teal',
    prefix: 'color-teal',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: 'Yellow',
    prefix: 'color-yellow',
    steps: [100, 200, 300, 400, 500, 600, 700, 800],
  },
];

export default function ColorLibrary() {
  return (
    <div className={styles['foundations__palettes']}>
      {PALETTES.map(({ name, prefix, steps }) => (
        <div key={name} className={styles['foundations__palette-row']}>
          <span className={styles['foundations__palette-name']}>{name}</span>
          <div className={styles['foundations__swatch-strip']}>
            {steps.map((step) => (
              <div
                key={step}
                className={styles['foundations__swatch']}
                title={`--${prefix}-${step}`}
              >
                <div
                  className={styles['foundations__swatch-color']}
                  style={{ background: `var(--${prefix}-${step})` }}
                />
                <span className={styles['foundations__swatch-step']}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
