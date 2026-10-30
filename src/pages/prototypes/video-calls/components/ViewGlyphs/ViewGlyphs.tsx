import type { SVGProps } from 'react';

/**
 * Outline call-layout glyphs. The installed compass-icons has no suitable
 * outline grid / speaker-with-filmstrip glyph (`apps` is filled,
 * `view-grid-plus-outline` carries a plus), so these two are hand-drawn:
 * 24x24 viewBox, 2px stroke, rounded joins, `currentColor`. No third-party
 * path data is used.
 */
export interface ViewGlyphProps extends Omit<
  SVGProps<SVGSVGElement>,
  'children' | 'viewBox'
> {
  /** Rendered size in px (`Icon` injects this). Default 20. */
  size?: number | string;
}

const outline = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
} as const;

/** Grid view: four outlined rounded squares (2x2). */
export function ViewGridGlyph({ size = 20, ...rest }: ViewGlyphProps) {
  return (
    <svg width={size} height={size} {...outline} {...rest}>
      <rect x="4" y="4" width="6" height="6" rx="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1.5" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" />
      <rect x="14" y="14" width="6" height="6" rx="1.5" />
    </svg>
  );
}

/** Speaker view: one large outlined rect with a row of small ones along the top. */
export function ViewSpeakerGlyph({ size = 20, ...rest }: ViewGlyphProps) {
  return (
    <svg width={size} height={size} {...outline} {...rest}>
      <rect x="4" y="4" width="3" height="3" rx="1" />
      <rect x="10.5" y="4" width="3" height="3" rx="1" />
      <rect x="17" y="4" width="3" height="3" rx="1" />
      <rect x="4" y="11" width="16" height="9" rx="1.5" />
    </svg>
  );
}
