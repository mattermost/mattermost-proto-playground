import type { SVGProps } from 'react';

type FolderOpenOutlineIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

/** MDI folder-open-outline — not yet in the pinned @mattermost/compass-icons set. */
export default function FolderOpenOutlineIcon({
  size = '1em',
  ...rest
}: FolderOpenOutlineIconProps) {
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
      <path d="M6.1,10L4,18V8H21A2,2 0 0,0 19,6H12L10,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H19C19.9,20 20.7,19.4 20.9,18.5L23.2,10H6.1M19,18H6L7.6,12H20.6L19,18Z" />
    </svg>
  );
}
