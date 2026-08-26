import type { ReactNode } from 'react';
import styles from './ChannelAttributeHeaderStack.module.scss';

export interface ChannelAttributeHeaderStackProps {
  titleBar: ReactNode;
  chips?: ReactNode;
  banner?: ReactNode;
}

/** Aligned title + attribute chips + classification banner (channel + thread RHS). */
export default function ChannelAttributeHeaderStack({
  titleBar,
  chips,
  banner,
}: ChannelAttributeHeaderStackProps) {
  return (
    <div className={styles['header-stack']}>
      <div className={styles['header-stack__main']}>
        <div className={styles['header-stack__title-bar']}>{titleBar}</div>
        {chips != null && (
          <div className={styles['header-stack__attrs']}>{chips}</div>
        )}
      </div>
      {banner != null && (
        <div className={styles['header-stack__banner']}>{banner}</div>
      )}
    </div>
  );
}
