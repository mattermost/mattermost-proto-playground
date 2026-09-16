import type { SVGProps } from 'react';

export default function ChannelsChatIcon({ size, color, ...rest }: { size?: string | number; color?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? '1em'}
      height={size ?? '1em'}
      viewBox="0 0 24 24"
      fill={color ?? 'currentColor'}
      {...rest}
    >
      <g transform="translate(2, 2)">
        <path d="M18 0C18.5304 0 19.0391 0.210714 19.4142 0.585786C19.7893 0.960859 20 1.46957 20 2V14C20 14.5304 19.7893 15.0391 19.4142 15.4142C19.0391 15.7893 18.5304 16 18 16H4L0 20V2C0 0.89 0.9 0 2 0H18ZM2 2V15.17L3.17 14H18V2H2Z" />
        <path d="M7 8C7 8.82843 6.32843 9.5 5.5 9.5C4.67157 9.5 4 8.82843 4 8C4 7.17157 4.67157 6.5 5.5 6.5C6.32843 6.5 7 7.17157 7 8Z" />
        <path d="M11.5 8C11.5 8.82843 10.8284 9.5 10 9.5C9.17157 9.5 8.5 8.82843 8.5 8C8.5 7.17157 9.17157 6.5 10 6.5C10.8284 6.5 11.5 7.17157 11.5 8Z" />
        <path d="M16 8C16 8.82843 15.3284 9.5 14.5 9.5C13.6716 9.5 13 8.82843 13 8C13 7.17157 13.6716 6.5 14.5 6.5C15.3284 6.5 16 7.17157 16 8Z" />
      </g>
    </svg>
  );
}
