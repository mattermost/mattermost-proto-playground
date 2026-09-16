import type { SVGProps } from 'react';

export default function FilesDocumentIcon({ size, color, ...rest }: { size?: string | number; color?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? '1em'}
      height={size ?? '1em'}
      viewBox="0 0 24 24"
      fill={color ?? 'currentColor'}
      {...rest}
    >
      <g transform="translate(3, 3)">
        <path d="M12 0H2C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2V16C0 16.5304 0.210714 17.0391 0.585786 17.4142C0.960859 17.7893 1.46957 18 2 18H16C16.5304 18 17.0391 17.7893 17.4142 17.4142C17.7893 17.0391 18 16.5304 18 16V6L12 0ZM16 16H2V2H11V7H16M14 11H4V9H14M11 14H4V12H11" />
      </g>
    </svg>
  );
}
