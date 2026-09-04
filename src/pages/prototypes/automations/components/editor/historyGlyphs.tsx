import type { SVGProps } from 'react';

type GlyphProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  color?: string;
};

/** Material-style undo glyph (compass-icons has no undo/redo pair). */
export function UndoGlyph({ size = '1em', color = 'currentColor', ...rest }: GlyphProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill={color}
      viewBox="0 0 24 24"
      aria-hidden
      {...rest}
    >
      <path d="M12.5 8C9.85 8 7.45 9 5.6 10.6L2 7v9h9l-3.62-3.62C8.77 11.22 10.54 10.5 12.5 10.5c3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8Z" />
    </svg>
  );
}

/** Material-style redo glyph (compass-icons has no undo/redo pair). */
export function RedoGlyph({ size = '1em', color = 'currentColor', ...rest }: GlyphProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill={color}
      viewBox="0 0 24 24"
      aria-hidden
      {...rest}
    >
      <path d="M18.4 10.6C16.55 9 14.15 8 11.5 8 6.85 8 2.92 11.03 1.53 15.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6Z" />
    </svg>
  );
}
