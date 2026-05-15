import type { ReactNode } from 'react';
import styles from './DocUiEmbed.module.scss';

const EMBED_GLOBAL = 'compass-doc-embed';

export interface DocUiEmbedProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps live UI embedded in docs (guidelines, specimens) so `.doc-shell__body`
 * typography and `.doc-page__prose` bare-tag rules do not leak into demos.
 * Uses the stable global class `compass-doc-embed` (see `DocPage.module.scss`).
 */
export default function DocUiEmbed({ children, className = '' }: DocUiEmbedProps) {
  return (
    <div
      className={[styles['doc-ui-embed'], EMBED_GLOBAL, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
