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
      <h2>Typography Tokens</h2>
      <p>
        Typography tokens expose the Compass font families, scale, line heights,
        and weights as CSS custom properties. Use this page as the
        implementation reference for product UI and documentation examples.
      </p>

      <h3>Font Stack</h3>
      <p>
        Use the family tokens instead of writing font stacks directly in
        component styles.
      </p>
      <TypefaceCard
        name="Metropolis"
        family="Metropolis, sans-serif"
        token="font-family-heading"
        href="https://fontsarena.com/metropolis-by-chris-simpson/"
        description="Heading family. Used for heading steps 300-1000."
        compact
      />
      <TypefaceCard
        name="Open Sans"
        family="'Open Sans', sans-serif"
        token="font-family-body"
        href="https://fonts.google.com/specimen/Open+Sans"
        description="Body family. Used for body copy and heading steps 25-200."
        compact
      />

      <pre>
        <code>{`/* Heading text */
font-family: var(--font-family-heading);

/* Body text */
font-family: var(--font-family-body);`}</code>
      </pre>

      <h3>Scale Tokens</h3>
      <p>
        Each step has a size token and a matching line-height value. The 100
        step is the 14px base size for the Mattermost web app; on mobile, the
        200 step is the default body reference size (16px).
      </p>
      <ScaleTable base={100} mobileBase={200} />

      <h3>Heading Scale</h3>
      <p>
        Heading rows show the rendered sample plus the token, size, line height,
        family, and default weight.
      </p>
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

      <h3>Body Scale</h3>
      <p>
        Body rows use Open Sans with regular weight by default. Use semibold for
        emphasis when needed.
      </p>
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

      <h3>Weight Tokens</h3>
      <p>
        Prefer semibold for emphasis. Reserve bold for cases where the smallest
        type sizes need extra legibility.
      </p>
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

      <h3>Margin Tables</h3>
      <p>
        These computed margins are defaults for prose-like text. Component and
        pattern layout can override them with explicit spacing.
      </p>

      <h4>Heading Margins</h4>
      <p>
        Top margin is font size divided by 1.125, rounded to the nearest 4px.
        Bottom margin is font size multiplied by 0.25, rounded to the nearest
        4px, with an 8px minimum.
      </p>
      <MarginTable kind="heading" />

      <h4>Body Margins</h4>
      <p>
        Top and bottom margins are font size multiplied by 0.75, rounded to the
        nearest 4px, with an 8px minimum.
      </p>
      <MarginTable kind="body" />
    </>
  );
}
