import type { ReactNode } from 'react';
import OnThisPage from '@/components/layout/OnThisPage/OnThisPage';
import styles from './DocPage.module.scss';

interface DocPageProps {
  eyebrow?: string;
  title?: string;
  /** When set, renders this in place of the eyebrow/title header. */
  hero?: ReactNode;
  /** When true, renders an "On this page" right rail next to the body. */
  toc?: boolean;
  children: ReactNode;
}

export default function DocPage({
  eyebrow,
  title,
  hero,
  toc = false,
  children,
}: DocPageProps) {
  const innerClass = [
    styles['doc-page__inner'],
    toc ? styles['doc-page__inner--with-toc'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles['doc-page']}>
      <div className={innerClass}>
        {hero ? (
          <div className={styles['doc-page__hero']}>{hero}</div>
        ) : (
          (eyebrow || title) && (
            <header className={styles['doc-page__header']}>
              {eyebrow && (
                <p className={styles['doc-page__eyebrow']}>{eyebrow}</p>
              )}
              {title && <h1 className={styles['doc-page__title']}>{title}</h1>}
            </header>
          )
        )}
        {toc ? (
          <div className={styles['doc-page__columns']}>
            <div className={styles['doc-page__body']} data-doc-body>
              {children}
            </div>
            <aside className={styles['doc-page__toc']}>
              <OnThisPage />
            </aside>
          </div>
        ) : (
          <div className={styles['doc-page__body']} data-doc-body>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
