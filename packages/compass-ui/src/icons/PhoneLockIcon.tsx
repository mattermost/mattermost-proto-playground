import type { SVGAttributes } from 'react';

interface PhoneLockIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'color'> {
  size?: number | string;
  color?: string;
}

/**
 * Phone handset with a lock badge — used to indicate a secure/classified
 * extension (e.g. SIPR). Sourced from the MM-56584 Outbound Calling Figma
 * (node 5520:40125) since @mattermost/compass-icons does not ship a
 * phone-lock glyph. API matches the compass-icons components so it can be
 * passed directly as the `glyph` prop on the shared Icon component.
 */
export default function PhoneLockIcon({
  size,
  color,
  ...rest
}: PhoneLockIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || '1em'}
      height={size || '1em'}
      fill={color || 'currentColor'}
      viewBox="0 0 24 24"
      {...rest}
    >
      <path d="M4 3c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.5-.3-.9-.8-1l-3.5-.8c-.4-.1-.7 0-1 .3L13.9 17c-2.8-1.4-5-3.6-6.5-6.4l1.8-1.8c.3-.2.4-.6.3-1L8.3 4.3c-.1-.5-.5-.8-1-.8H4z" />
      <path d="M15.7 6V4.9c0-1.3 1-2.4 2.4-2.4 1.3 0 2.4 1 2.4 2.4V6c.4 0 .8.4.8.8v3c0 .4-.4.7-.8.7h-4.7c-.4 0-.8-.3-.8-.7v-3c0-.4.4-.8.7-.8zm1.2 0h2.3V4.9c0-.6-.5-1.1-1.2-1.1-.6 0-1.2.5-1.2 1.1V6z" />
    </svg>
  );
}
