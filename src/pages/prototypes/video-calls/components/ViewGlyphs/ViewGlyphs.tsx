import type { SVGProps } from 'react';
import AppsIcon from '@mattermost/compass-icons/components/apps';

/**
 * Call-layout glyphs for the View button and menu. Grid uses the compass-icons
 * `apps` glyph. compass-icons has no speaker-with-filmstrip glyph yet, so the
 * speaker glyph is the design team's "view-gallery-outline" SVG (24x24),
 * flipped vertically so the large tile sits below the row of small ones.
 * The speaker-side glyph is drawn to match it: same frame, the large tile on
 * the left and a column of small tiles on the right.
 * Replace with a compass-icons glyph once one is added there.
 */
export interface ViewGlyphProps extends Omit<
  SVGProps<SVGSVGElement>,
  'width' | 'height'
> {
  /** Pixel size or CSS length. Default 20. */
  size?: number | string;
}

/** Grid view: compass-icons `apps`. */
export function ViewGridGlyph(props: Omit<ViewGlyphProps, 'size'>) {
  return <AppsIcon {...props} />;
}

/** Speaker view: one large tile with a strip of small tiles along the top. */
export function ViewSpeakerGlyph({ size = 20, ...rest }: ViewGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path
        transform="translate(0 24) scale(1 -1)"
        d="M1 3V21H23V3H1M21 5V14H3V5H21M11 16V19H8V16H11M3 16H6V19H3V16M13 19V16H16V19H13M18 19V16H21V19H18Z"
      />
    </svg>
  );
}

/** Speaker-side view: one large tile with a column of small tiles on the right. */
export function ViewSpeakerSideGlyph({ size = 20, ...rest }: ViewGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path
        fillRule="evenodd"
        d="M1 3H23V21H1V3M3 5V19H16V5H3M18 5V8H21V5H18M18 10.5V13.5H21V10.5H18M18 16V19H21V16H18Z"
      />
    </svg>
  );
}
