import type { ReactNode } from 'react';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import styles from './Type.module.scss';

export type TypeLevel =
  | 25
  | 50
  | 75
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 1000;

export type TypeKind = 'heading' | 'body';
export type TypeWeight = 'light' | 'regular' | 'semibold' | 'bold';

const FONT_SIZE_PX: Record<TypeLevel, number> = {
  25: 10,
  50: 11,
  75: 12,
  100: 14,
  200: 16,
  300: 18,
  400: 20,
  500: 22,
  600: 25,
  700: 28,
  800: 32,
  900: 36,
  1000: 40,
};

const LINE_HEIGHT_PX: Record<TypeLevel, number> = {
  25: 16,
  50: 16,
  75: 16,
  100: 20,
  200: 24,
  300: 24,
  400: 28,
  500: 28,
  600: 30,
  700: 36,
  800: 40,
  900: 44,
  1000: 48,
};

const FONT_WEIGHT_VAL: Record<TypeWeight, number> = {
  light: 300,
  regular: 400,
  semibold: 600,
  bold: 700,
};

function familyFor(
  kind: TypeKind,
  level: TypeLevel,
): 'Metropolis' | 'Open Sans' {
  if (kind === 'body') return 'Open Sans';
  return level >= 300 ? 'Metropolis' : 'Open Sans';
}

interface TypefaceCardProps {
  name: string;
  family: string;
  /** Big display sample, defaults to "Aa". */
  display?: string;
  description?: ReactNode;
  /** Token (e.g. "font-family-heading"). */
  token?: string;
  /** Optional download URL. */
  href?: string;
  hrefLabel?: string;
  /** Removes the large display panel for token-reference contexts. */
  compact?: boolean;
}

export function TypefaceCard({
  name,
  family,
  display = 'Aa',
  description,
  token,
  href,
  hrefLabel = 'Download',
  compact = false,
}: TypefaceCardProps) {
  const className = [
    styles['typeface'],
    compact ? styles['typeface--compact'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      {!compact && (
        <div
          className={styles['typeface__display']}
          style={{ fontFamily: family }}
        >
          {display}
        </div>
      )}
      <div className={styles['typeface__meta']}>
        <div
          className={styles['typeface__name']}
          style={{ fontFamily: family }}
        >
          {name}
        </div>
        {token && (
          <div className={styles['typeface__token']}>
            <code>{`var(--${token})`}</code>
          </div>
        )}
        {description && (
          <div className={styles['typeface__description']}>{description}</div>
        )}
        {!compact && (
          <div
            className={styles['typeface__alphabet']}
            style={{ fontFamily: family }}
          >
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
            <br />
            abcdefghijklmnopqrstuvwxyz
            <br />
            0123456789 &amp; ! ? @ # $ %
          </div>
        )}
        {href && (
          <a
            className={styles['typeface__link']}
            href={href}
            target="_blank"
            rel="noreferrer"
          >
            {hrefLabel}
            <OpenInNewIcon
              className={styles['typeface__link-icon']}
              aria-hidden="true"
            />
          </a>
        )}
      </div>
    </div>
  );
}

interface TypeStackProps {
  children: ReactNode;
}

export function TypeStack({ children }: TypeStackProps) {
  return <div className={styles['type-stack']}>{children}</div>;
}

interface TypeSpecimenProps {
  level: TypeLevel;
  kind?: TypeKind;
  weight?: TypeWeight;
  /** Override the rendered sample text. */
  sample?: ReactNode;
  /** Mark this row as the base of the scale. */
  base?: boolean;
  /** Hide CSS custom property names — use in guideline pages. */
  compact?: boolean;
}

export function TypeSpecimen({
  level,
  kind = 'heading',
  weight = kind === 'heading' ? 'semibold' : 'regular',
  sample,
  base = false,
  compact = false,
}: TypeSpecimenProps) {
  const family = familyFor(kind, level);
  const sizePx = FONT_SIZE_PX[level];
  const linePx = LINE_HEIGHT_PX[level];
  const fontWeight = FONT_WEIGHT_VAL[weight];
  const label = kind === 'heading' ? 'Heading' : 'Body';
  const fallback =
    kind === 'heading'
      ? `${label} ${level}`
      : `${label} ${level} — the quick brown fox`;

  const rootClass = [
    styles['specimen'],
    compact ? styles['specimen--compact'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div
        className={styles['specimen__sample']}
        style={{
          fontFamily: `'${family}', sans-serif`,
          fontSize: `${sizePx}px`,
          lineHeight: `${linePx}px`,
          fontWeight,
        }}
      >
        {sample ?? fallback}
      </div>
      <div className={styles['specimen__meta']}>
        <div className={styles['specimen__label']}>
          {label} {level}
          {base && <span className={styles['specimen__pill']}>Base</span>}
        </div>
        {compact ? (
          <div className={styles['specimen__summary']}>
            {sizePx}/{linePx} · {family} {weight}
          </div>
        ) : (
          <dl className={styles['specimen__details']}>
            <div>
              <dt>Token</dt>
              <dd>
                <code>{`--font-size-${level}`}</code>
              </dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>{sizePx}px</dd>
            </div>
            <div>
              <dt>Line</dt>
              <dd>{linePx}px</dd>
            </div>
            <div>
              <dt>Family</dt>
              <dd>{family}</dd>
            </div>
            <div>
              <dt>Weight</dt>
              <dd>
                {fontWeight}{' '}
                <span className={styles['specimen__muted']}>({weight})</span>
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}

interface ScaleTableRow {
  level: TypeLevel;
  size: number;
  line: number;
}

interface ScaleTableProps {
  /** Levels to include — defaults to the full scale. */
  levels?: TypeLevel[];
  /** Highlight a specific row as the base size (also used for the ratio column). */
  base?: TypeLevel;
  /** Optional second highlight, e.g. mobile reference step. */
  mobileBase?: TypeLevel;
}

export function ScaleTable({
  levels = [25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
  base = 100,
  mobileBase,
}: ScaleTableProps) {
  const rows: ScaleTableRow[] = levels.map((level) => ({
    level,
    size: FONT_SIZE_PX[level],
    line: LINE_HEIGHT_PX[level],
  }));

  return (
    <table className={styles['scale']}>
      <thead>
        <tr>
          <th>Step</th>
          <th>Token</th>
          <th>Size</th>
          <th>Line height</th>
          <th>Ratio to base</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const ratio = row.size / FONT_SIZE_PX[base];
          const rowClass = [
            row.level === base ? styles['scale__row--base'] : '',
            mobileBase !== undefined && row.level === mobileBase
              ? styles['scale__row--mobile-base']
              : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <tr
              key={row.level}
              className={rowClass || undefined}
            >
              <td>
                {row.level}
                {row.level === base && (
                  <span className={styles['scale__pill']}>Base</span>
                )}
                {mobileBase !== undefined && row.level === mobileBase && (
                  <span className={styles['scale__pill']}>Mobile base</span>
                )}
              </td>
              <td>
                <code>{`--font-size-${row.level}`}</code>
              </td>
              <td>{row.size}px</td>
              <td>{row.line}px</td>
              <td>{ratio.toFixed(3).replace(/\.?0+$/, '')}×</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

interface MarginRow {
  level: TypeLevel;
  top: number;
  bottom: number;
}

function roundToFour(n: number, min = 0) {
  return Math.max(min, Math.round(n / 4) * 4);
}

interface MarginTableProps {
  kind: TypeKind;
  /** Levels to include. */
  levels?: TypeLevel[];
}

export function MarginTable({ kind, levels }: MarginTableProps) {
  const defaults: TypeLevel[] =
    kind === 'heading'
      ? [200, 300, 400, 500, 600, 700, 800, 900, 1000]
      : [25, 50, 75, 100, 200, 300];
  const list = levels ?? defaults;

  const rows: MarginRow[] = list.map((level) => {
    const size = FONT_SIZE_PX[level];
    if (kind === 'heading') {
      return {
        level,
        top: roundToFour(size / 1.125),
        bottom: roundToFour(size * 0.25, 8),
      };
    }
    return {
      level,
      top: roundToFour(size * 0.75, 8),
      bottom: roundToFour(size * 0.75, 8),
    };
  });

  return (
    <table className={styles['scale']}>
      <thead>
        <tr>
          <th>Step</th>
          <th>Size</th>
          <th>Top margin</th>
          <th>Bottom margin</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.level}>
            <td>
              {kind === 'heading' ? 'Heading' : 'Body'} {row.level}
            </td>
            <td>{FONT_SIZE_PX[row.level]}px</td>
            <td>{row.top}px</td>
            <td>{row.bottom}px</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
