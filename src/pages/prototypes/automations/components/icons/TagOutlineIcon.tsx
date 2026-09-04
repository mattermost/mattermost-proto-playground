import type { SVGProps } from 'react';

type TagOutlineIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

/** MDI tag-outline — not yet in the pinned @mattermost/compass-icons set. */
export default function TagOutlineIcon({
  size = '1em',
  ...rest
}: TagOutlineIconProps) {
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
      <path d="M21.41,11.58l-9-9C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4v7c0,0.55 0.22,1.05 0.59,1.42l9,9c0.36,0.36 0.86,0.58 1.41,0.58c0.55,0 1.05-0.22 1.41-0.59l7-7c0.37-0.36 0.59-0.86 0.59-1.41c0-0.55-0.23-1.06-0.59-1.42M13,20.01L4,11V4h7v0.01l9,9L13,20.01zM6.5,5.5C5.67,5.5 5,6.18 5,7A1.5,1.5 0 0,0 6.5,8.5C7.32,8.5 8,7.82 8,7C8,6.18 7.32,5.5 6.5,5.5z" />
    </svg>
  );
}
