import type { SVGProps } from 'react';

/**
 * Stand-ins for the call layout glyphs. compass-icons has no grid-of-four or
 * speaker-with-filmstrip icons yet and Material icons are not installed, so
 * these two are drawn locally (Material-style geometry, 20x20 viewBox, 2px
 * clear-space like the compass set). Replace with compass-icons once the
 * glyphs are added there.
 */
export interface ViewGlyphProps extends Omit<
  SVGProps<SVGSVGElement>,
  'children' | 'viewBox'
> {
  /** Rendered size in px (`Icon` injects this). Default 20. */
  size?: number | string;
}

/** Grid view: four equal boxes (2x2). */
export function ViewGridGlyph({ size = 20, ...rest }: ViewGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <rect x="2" y="2" width="7" height="7" rx="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" />
    </svg>
  );
}

/** Speaker view: one large box with a strip of small boxes along the top. */
export function ViewSpeakerGlyph({ size = 20, ...rest }: ViewGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <rect x="2" y="2" width="4.5" height="3.5" rx="1" />
      <rect x="7.75" y="2" width="4.5" height="3.5" rx="1" />
      <rect x="13.5" y="2" width="4.5" height="3.5" rx="1" />
      <rect x="2" y="7.5" width="16" height="10.5" rx="1.5" />
    </svg>
  );
}
