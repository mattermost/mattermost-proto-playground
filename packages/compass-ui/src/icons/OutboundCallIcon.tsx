import type { SVGAttributes } from 'react';

interface OutboundCallIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'color'> {
  size?: number | string;
  color?: string;
}

/**
 * Custom outbound-call glyph (phone handset with outbound arrow) sourced
 * from Figma (MM-56584 Outbound Calling, node 5445:16219). Matches the
 * @mattermost/compass-icons component API so it can be passed directly
 * as the `glyph` prop on the shared Icon component.
 */
export default function OutboundCallIcon({
  size,
  color,
  ...rest
}: OutboundCallIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || '1em'}
      height={size || '1em'}
      fill={color || 'currentColor'}
      viewBox="0 0 24 24"
      {...rest}
    >
      <path
        transform="translate(3 3)"
        d="M1 0C0.734784 0 0.48043 0.105357 0.292893 0.292893C0.105357 0.48043 0 0.734784 0 1C0 5.50868 1.79107 9.8327 4.97918 13.0208C8.1673 16.2089 12.4913 18 17 18C17.2652 18 17.5196 17.8946 17.7071 17.7071C17.8946 17.5196 18 17.2652 18 17V13.5C18 13.2348 17.8946 12.9804 17.7071 12.7929C17.5196 12.6054 17.2652 12.5 17 12.5C15.75 12.5 14.55 12.3 13.43 11.93C13.08 11.82 12.69 11.9 12.41 12.17L10.21 14.37C7.38 12.93 5.06 10.62 3.62 7.78L5.82 5.57C6.1 5.31 6.18 4.92 6.07 4.57C5.7 3.45 5.5 2.25 5.5 1C5.5 0.734784 5.39464 0.48043 5.20711 0.292893C5.01957 0.105357 4.76522 0 4.5 0H1ZM12 0V1.5H15.5L10 7L11 8L16.5 2.5V6H18V0H12Z"
      />
    </svg>
  );
}
