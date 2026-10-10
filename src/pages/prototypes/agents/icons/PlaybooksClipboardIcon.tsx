import type { SVGProps } from 'react';

export default function PlaybooksClipboardIcon({ size, color, ...rest }: { size?: string | number; color?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? '1em'}
      height={size ?? '1em'}
      viewBox="0 0 24 24"
      fill={color ?? 'currentColor'}
      {...rest}
    >
      <g transform="translate(3, 2)">
        <path d="M16 1.97857H11.82C11.25 0.41857 9.53 -0.38143 8 0.17857C7.14 0.47857 6.5 1.13857 6.18 1.97857H2C1.46957 1.97857 0.960859 2.18928 0.585786 2.56436C0.210714 2.93943 0 3.44814 0 3.97857V17.9786C0 18.509 0.210714 19.0177 0.585786 19.3928C0.960859 19.7679 1.46957 19.9786 2 19.9786H16C16.5304 19.9786 17.0391 19.7679 17.4142 19.3928C17.7893 19.0177 18 18.509 18 17.9786V3.97857C18 3.44814 17.7893 2.93943 17.4142 2.56436C17.0391 2.18928 16.5304 1.97857 16 1.97857ZM4 4.97857H14V3.97857H16V17.9786H2V3.97857H4V4.97857ZM14 9.97857H4V7.97857H14V9.97857ZM12 13.9786H4V11.9786H12V13.9786Z" />
      </g>
    </svg>
  );
}
