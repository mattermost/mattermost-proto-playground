/*
 * Material Design Icons (Pictogrammers, Apache 2.0): arrow-up-down and
 * format-vertical-align-center. Compass Icons has no vertical expand/collapse
 * pair, so these are inlined with the same 24px viewBox and currentColor fill.
 */
import type { SVGProps } from 'react';

export function ArrowUpDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z" />
    </svg>
  );
}

export function FormatVerticalAlignCenterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M8,19H11V23H13V19H16L12,15L8,19M16,5H13V1H11V5H8L12,9L16,5M4,11V13H20V11H4Z" />
    </svg>
  );
}
