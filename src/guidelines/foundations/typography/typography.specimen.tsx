import {
  TypefaceCard,
  TypeStack,
  TypeSpecimen,
  ScaleTable,
  MarginTable,
  type TypeLevel,
} from '@/guidelines/_components/Type';
import styles from '@/styles/library-demo/foundations.module.scss';

const HEADING_LEVELS: TypeLevel[] = [
  1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 75, 50, 25,
];
const BODY_LEVELS: TypeLevel[] = [300, 200, 100, 75, 50, 25];

const FONT_WEIGHTS = [
  { name: 'Light', value: '300', token: '--font-weight-light' },
  { name: 'Regular', value: '400', token: '--font-weight-regular' },
  { name: 'Semibold', value: '600', token: '--font-weight-semibold' },
  { name: 'Bold', value: '700', token: '--font-weight-bold' },
];

export default function TypographyLibrary() {
  return (
    <>
      <h3>Families</h3>
      <TypefaceCard
        name="Metropolis"
        family="Metropolis, sans-serif"
        token="font-family-heading"
        href="https://fontsarena.com/metropolis-by-chris-simpson/"
        description="Used for headings 300–1000."
      />
      <TypefaceCard
        name="Open Sans"
        family="'Open Sans', sans-serif"
        token="font-family-body"
        href="https://fonts.google.com/specimen/Open+Sans"
        description="Used for body copy and headings 25–200."
      />

      <h3>Scale</h3>
      <ScaleTable base={100} />

      <h3>Headings</h3>
      <TypeStack>
        {HEADING_LEVELS.map((level) => (
          <TypeSpecimen
            key={level}
            level={level}
            kind="heading"
            base={level === 100}
          />
        ))}
      </TypeStack>

      <h3>Body</h3>
      <TypeStack>
        {BODY_LEVELS.map((level) => (
          <TypeSpecimen
            key={level}
            level={level}
            kind="body"
            sample="The quick brown fox jumps over the lazy dog."
            base={level === 100}
          />
        ))}
      </TypeStack>

      <h3>Weights</h3>
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

      <h3>Heading margins</h3>
      <MarginTable kind="heading" />

      <h3>Body margins</h3>
      <MarginTable kind="body" />
    </>
  );
}
