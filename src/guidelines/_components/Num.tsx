import type { ReactNode } from 'react';
// Imported for its side-effect — this file declares `:global(.compass-num)`
// styles plus the list-bullet override rules that reference the same class.
import './Num.module.scss';

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
