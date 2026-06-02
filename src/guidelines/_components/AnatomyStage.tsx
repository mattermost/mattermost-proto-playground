import type { CSSProperties, ReactNode } from 'react';
import styles from './AnatomyStage.module.scss';

interface AnatomyStageProps {
  children: ReactNode;
  /** Optional override for inner layout (e.g. flex direction, gap). Padding/bg/radius are fixed. */
  style?: CSSProperties;
}

export default function AnatomyStage({ children, style }: AnatomyStageProps) {
  return (
    <div
      className={[styles['stage'], 'compass-doc-embed'].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </div>
  );
}
