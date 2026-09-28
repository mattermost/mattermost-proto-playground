import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  color?: string;
};

/**
 * Outline robot glyph — compass-icons only ships a filled `robot-happy`.
 * Weight matches sibling outline resources (Users, Posts, etc.).
 */
export default function RobotOutlineIcon({
  size = '1em',
  color = 'currentColor',
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      {...rest}
    >
      {/* Antenna */}
      <path d="M12 2c.55 0 1 .45 1 1v2h-2V3c0-.55.45-1 1-1z" />
      {/* Side arms */}
      <path d="M3.5 11C2.67 11 2 11.67 2 12.5v3C2 16.33 2.67 17 3.5 17S5 16.33 5 15.5v-3C5 11.67 4.33 11 3.5 11zm17 0c-.83 0-1.5.67-1.5 1.5v3c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5z" />
      {/* Head frame (outline) */}
      <path d="M16 7H8c-1.66 0-3 1.34-3 3v6c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3v-6c0-1.66-1.34-3-3-3zm1 9c0 .55-.45 1-1 1H8c-.55 0-1-.45-1-1v-6c0-.55.45-1 1-1h8c.55 0 1 .45 1 1v6z" />
      {/* Eyes */}
      <path d="M9.5 11.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zm5 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z" />
      {/* Mouth */}
      <path d="M9 15.5c0 .28.22.5.5.5h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-5c-.28 0-.5.22-.5.5z" />
    </svg>
  );
}
