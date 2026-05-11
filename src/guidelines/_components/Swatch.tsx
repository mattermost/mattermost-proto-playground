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
}

function humanize(token: string): string {
  return token
    .replace(/^color-/, '')
    .replace(/-rgb$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
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

export default function Swatch({ token, label, size = 'medium' }: SwatchProps) {
  const swatchRef = useRef<HTMLDivElement>(null);
  const hex = useResolvedTokenValue(token, swatchRef);
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
        <div className={styles.swatch__label}>{label ?? humanize(token)}</div>
        {hex && <div className={styles.swatch__value}>{hex.toUpperCase()}</div>}
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

interface SwatchRampProps {
  /** Display name for this color family, e.g. "Blue". */
  label: string;
  /** Token base, e.g. "color-blue" → resolves "color-blue-100", "color-blue-200", … */
  base: string;
  /** Shade numbers to render as a horizontal ramp. */
  shades: number[];
}

export function SwatchRamp({ label, base, shades }: SwatchRampProps) {
  return (
    <div className={styles.ramp}>
      <div className={styles.ramp__label}>{label}</div>
      <div className={styles.ramp__row}>
        {shades.map((shade) => (
          <RampChip key={shade} token={`${base}-${shade}`} shade={shade} />
        ))}
      </div>
    </div>
  );
}

interface RampChipProps {
  token: string;
  shade: number;
}

function RampChip({ token, shade }: RampChipProps) {
  const hex = useResolvedTokenValue(token);
  return (
    <div className={styles.ramp__chip} title={hex.toUpperCase()}>
      <div
        className={styles.ramp__swatch}
        style={{ backgroundColor: `var(--${token})` }}
      />
      <div className={styles.ramp__shade}>{shade}</div>
    </div>
  );
}
