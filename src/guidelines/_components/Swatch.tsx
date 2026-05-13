import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import styles from './Swatch.module.scss';

type SwatchSize = 'small' | 'medium' | 'large';

interface SwatchProps {
  /** CSS custom property name without the leading "--", e.g. "color-blue-500". */
  token: string;
  /** Display label. Defaults to a humanized form of the token. */
  label?: string;
  size?: SwatchSize;
  /** Library layout: meta shows `--token`, hex, and rgb() (specimen / dense reference). */
  showFullColorMeta?: boolean;
}

function humanize(token: string): string {
  return token
    .replace(/^color-/, '')
    .replace(/-rgb$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Normalizes computed `color` to `#RRGGBB` when possible. */
function cssColorToHex(computed: string): string {
  const t = computed.trim();
  if (!t) return '';
  if (t.startsWith('#')) {
    if (t.length === 4) {
      const r = t[1];
      const g = t[2];
      const b = t[3];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }
    return t.length === 7 ? t.toUpperCase() : t.toUpperCase();
  }
  const m = t.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i,
  );
  if (!m) return t.toUpperCase();
  const r = Math.round(Number(m[1]));
  const g = Math.round(Number(m[2]));
  const b = Math.round(Number(m[3]));
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function hexToRgbTriplet(hex: string): string | null {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return `${parseInt(m[1], 10)}, ${parseInt(m[2], 10)}, ${parseInt(m[3], 10)}`;
}

function formatRgbForDisplay(rgbTokenValue: string, computedColor: string): string {
  const triplet = rgbTokenValue.trim();
  if (/^\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}/.test(triplet)) {
    return `rgb(${triplet})`;
  }
  const hex = cssColorToHex(computedColor);
  const derived = hex.startsWith('#') ? hexToRgbTriplet(hex) : null;
  return derived ? `rgb(${derived})` : '';
}

function useResolvedTokenValue(
  token: string,
  ref?: RefObject<HTMLElement | null>,
): string {
  const [value, setValue] = useState('');
  useEffect(() => {
    const read = () => {
      const element = ref?.current ?? document.documentElement;
      const v = getComputedStyle(element).getPropertyValue(`--${token}`).trim();
      setValue(v);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, [ref, token]);
  return value;
}

export default function Swatch({
  token,
  label,
  size = 'medium',
  showFullColorMeta = false,
}: SwatchProps) {
  const swatchRef = useRef<HTMLDivElement>(null);
  const rawColor = useResolvedTokenValue(token, swatchRef);
  const rgbTokenRaw = useResolvedTokenValue(`${token}-rgb`);
  const hexDisplay = rawColor ? cssColorToHex(rawColor) : '';
  const rgbDisplay = showFullColorMeta
    ? formatRgbForDisplay(rgbTokenRaw, rawColor)
    : '';

  return (
    <div
      ref={swatchRef}
      className={`${styles.swatch} ${styles[`swatch--${size}`]}`}
    >
      <div
        className={styles.swatch__chip}
        style={{ backgroundColor: `var(--${token})` }}
      />
      <div className={styles.swatch__meta}>
        {showFullColorMeta ? (
          <>
            <div className={styles.swatch__token}>{`--${token}`}</div>
            {hexDisplay ? (
              <div className={styles.swatch__value}>{hexDisplay}</div>
            ) : null}
            {rgbDisplay ? (
              <div className={styles.swatch__rgb}>{rgbDisplay}</div>
            ) : null}
          </>
        ) : (
          <>
            <div className={styles.swatch__label}>
              {label ?? humanize(token)}
            </div>
            {hexDisplay ? (
              <div className={styles.swatch__value}>{hexDisplay}</div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

interface SwatchGridProps {
  /** Column count: large = 3, medium = 4, small = 6. */
  size?: SwatchSize;
  children: ReactNode;
}

export function SwatchGrid({ size = 'medium', children }: SwatchGridProps) {
  const className = `${styles.swatchGrid} ${styles[`swatchGrid--${size}`]}`;
  return <div className={className}>{children}</div>;
}

type RampChipSize = 'medium' | 'small';

interface SwatchRampProps {
  /** Display name for this color family, e.g. "Blue". */
  label: string;
  /** Token base, e.g. "color-blue" → resolves "color-blue-100", "color-blue-200", … */
  base: string;
  /** Shade numbers to render as a horizontal ramp. */
  shades: number[];
  /** Compact ramp cells (e.g. dense specimen layouts). */
  chipSize?: RampChipSize;
  /** Show `--token`, hex, and rgb() under each chip (specimen layouts). */
  showTokenDetails?: boolean;
}

export function SwatchRamp({
  label,
  base,
  shades,
  chipSize = 'medium',
  showTokenDetails = false,
}: SwatchRampProps) {
  const rampClass = [
    styles.ramp,
    chipSize === 'small' ? styles['ramp--small'] : '',
    showTokenDetails ? styles['ramp--detail'] : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={rampClass}>
      <div className={styles.ramp__label}>{label}</div>
      <div className={styles.ramp__row}>
        {shades.map((shade) => (
          <RampChip
            key={shade}
            token={`${base}-${shade}`}
            shade={shade}
            showTokenDetails={showTokenDetails}
          />
        ))}
      </div>
    </div>
  );
}

interface RampChipProps {
  token: string;
  shade: number;
  showTokenDetails?: boolean;
}

function RampChip({ token, shade, showTokenDetails = false }: RampChipProps) {
  const computedColor = useResolvedTokenValue(token);
  const rgbTokenRaw = useResolvedTokenValue(`${token}-rgb`);
  const hex = cssColorToHex(computedColor);
  const rgb = formatRgbForDisplay(rgbTokenRaw, computedColor);
  const title = [hex, rgb].filter(Boolean).join(' · ');

  if (showTokenDetails) {
    return (
      <div
        className={styles.ramp__chip}
        title={[`--${token}`, hex, rgb].filter(Boolean).join(' · ')}
      >
        <div
          className={styles.ramp__swatch}
          style={{ backgroundColor: `var(--${token})` }}
        />
        <div className={styles.ramp__detail}>
          <div className={styles.ramp__token}>{`--${token}`}</div>
          {hex ? <div className={styles.ramp__hex}>{hex}</div> : null}
          {rgb ? <div className={styles.ramp__rgb}>{rgb}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.ramp__chip} title={title || undefined}>
      <div
        className={styles.ramp__swatch}
        style={{ backgroundColor: `var(--${token})` }}
      />
      <div className={styles.ramp__shade}>{shade}</div>
    </div>
  );
}
