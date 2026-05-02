import type { ReactNode } from 'react';
// Plain SCSS (not .module.scss) so the `compass-num` class and the
// `ul:has(.compass-num)` bullet-suppression rules stay global.
import './Num.scss';

interface NumProps {
  children: ReactNode;
}

/**
 * Numbered-circle marker. Use inline in MDX to label a list item that
 * corresponds to a numbered callout in an anatomy diagram above.
 */
export default function Num({ children }: NumProps) {
  return <span className="compass-num">{children}</span>;
}
