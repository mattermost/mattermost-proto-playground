import type { ReactNode } from 'react';
import styles from './ChannelAttributeHeaderStack.module.scss';

export type ChannelAttributeHeaderLayout = 'stacked' | 'inline';

export interface ChannelAttributeHeaderStackProps {
  titleBar: ReactNode;
  chips?: ReactNode;
  banner?: ReactNode;
  bookmarksBar?: ReactNode;
  layout?: ChannelAttributeHeaderLayout;
}

/** Aligned title + attribute chips + classification banner (channel + thread RHS). */
export default function ChannelAttributeHeaderStack({
  titleBar,
  chips,
  banner,
  bookmarksBar,
  layout = 'stacked',
}: ChannelAttributeHeaderStackProps) {
  const inline = layout === 'inline';
  const rootClass = [
    styles['header-stack'],
    inline ? styles['header-stack--inline'] : '',
    bookmarksBar != null ? styles['header-stack--with-bookmarks'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['header-stack__main']}>
        <div className={styles['header-stack__title-bar']}>{titleBar}</div>
        {!inline && chips != null && (
          <div className={styles['header-stack__attrs']}>{chips}</div>
        )}
      </div>
      {banner != null && (
        <div className={styles['header-stack__banner']}>{banner}</div>
      )}
      {bookmarksBar != null && (
        <div className={styles['header-stack__bookmarks']}>{bookmarksBar}</div>
      )}
    </div>
  );
}
