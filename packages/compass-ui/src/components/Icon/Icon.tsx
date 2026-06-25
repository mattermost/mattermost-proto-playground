import React, { type ReactNode } from 'react';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import styles from './Icon.module.scss';

export type IconSize =
  | '10'
  | '12'
  | '16'
  | '20'
  | '24'
  | '28'
  | '32'
  | '40'
  | '52'
  | '64'
  | '104';

/**
 * Maps container size → SVG render size. Icons bleed slightly past the container
 * to strip the built-in clear-space padding from compass-icons SVGs.
 * Pass SVG_SIZE_MAP[size] as the `size` prop on any compass-icons component
 * used as a glyph (e.g. <GlobeIcon size={SVG_SIZE_MAP['24']} />).
 */
export const SVG_SIZE_MAP: Record<IconSize, number> = {
  '10': 12,
  '12': 14,
  '16': 18,
  '20': 24,
  '24': 28,
  '28': 32,
  '32': 36,
  '40': 48,
  '52': 60,
  '64': 72,
  '104': 120,
};

export interface IconProps {
  /** Optional CSS class name applied to the container. */
  className?: string;
  /**
   * Icon SVG from @mattermost/compass-icons (e.g. `<GlobeIcon />`).
   * Icon automatically injects the correct SVG size — no need to pass a size
   * prop on the glyph element. When omitted, shows emoticon-happy-outline.
   */
  glyph?: ReactNode | null;
  /** Container size from the Mattermost icon scale. Default 24. */
  size?: IconSize;
}

const SIZE_CLASS_MAP: Record<IconSize, string> = {
  '10': styles['icon--size-10'],
  '12': styles['icon--size-12'],
  '16': styles['icon--size-16'],
  '20': styles['icon--size-20'],
  '24': styles['icon--size-24'],
  '28': styles['icon--size-28'],
  '32': styles['icon--size-32'],
  '40': styles['icon--size-40'],
  '52': styles['icon--size-52'],
  '64': styles['icon--size-64'],
  '104': styles['icon--size-104'],
};

/**
 * Icon container using @mattermost/compass-icons. The `size` prop sets the
 * clipping container; the SVG itself renders at SVG_SIZE_MAP[size] to bleed
 * past the container edges and eliminate compass-icons clear-space padding.
 *
 * @see https://compass.mattermost.com/29be2c109/p/19c648-iconography
 */
export default function Icon({
  className = '',
  glyph = null,
  size = '24',
}: IconProps) {
  const sizeClass = SIZE_CLASS_MAP[size];
  const rootClass = [styles.icon, sizeClass, className]
    .filter(Boolean)
    .join(' ');

  const svgSize = SVG_SIZE_MAP[size];
  const glyphContent = (() => {
    if (glyph === undefined || glyph === null) {
      return <EmoticonHappyOutlineIcon size={svgSize} aria-hidden />;
    }
    // Inject the correct SVG size into the glyph so callers don't need to
    // know about SVG_SIZE_MAP — the container size is all that's needed.
    if (React.isValidElement(glyph)) {
      return React.cloneElement(
        glyph as React.ReactElement<{ size?: number }>,
        {
          size: svgSize,
        },
      );
    }
    return glyph;
  })();

  return (
    <div className={rootClass} aria-hidden>
      <div className={styles['icon__glyph-area']}>{glyphContent}</div>
    </div>
  );
}
