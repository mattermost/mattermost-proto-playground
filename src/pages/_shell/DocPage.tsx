import type { ReactNode } from 'react';
import styles from './DocPage.module.scss';

interface DocPageProps {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
}

export default function DocPage({ eyebrow, title, children }: DocPageProps) {
  return (
    <div className={styles['doc-page']}>
      <div className={styles['doc-page__inner']}>
        {(eyebrow || title) && (
          <header className={styles['doc-page__header']}>
            {eyebrow && <p className={styles['doc-page__eyebrow']}>{eyebrow}</p>}
            {title && <h1 className={styles['doc-page__title']}>{title}</h1>}
          </header>
        )}
        <div className={styles['doc-page__body']}>{children}</div>
      </div>
    </div>
  );
}
