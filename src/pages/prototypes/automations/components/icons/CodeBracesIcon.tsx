import type { SVGProps } from 'react';

type CodeBracesIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

/** MDI code-braces — not yet in the pinned @mattermost/compass-icons set. */
export default function CodeBracesIcon({
  size = '1em',
  ...rest
}: CodeBracesIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      width={size}
      height={size}
      fill="currentColor"
      viewBox="0 0 24 24"
      {...rest}
    >
      <path d="M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z" />
    </svg>
  );
}
