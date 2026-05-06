import styles from './PageHero.module.scss';

export type PageHeroStatus = 'stable' | 'beta' | 'deprecated';

const STATUS_LABELS: Record<PageHeroStatus, string> = {
  stable: 'Stable',
  beta: 'Beta',
  deprecated: 'Deprecated',
};

interface PageHeroProps {
  /** Breadcrumb / eyebrow shown above the title (e.g. "Library / Components"). */
  breadcrumb?: string;
  /** Page title. */
  title: string;
  /** Short description shown beneath the title. */
  description?: string;
  /** Optional status chip rendered next to the title. */
  status?: PageHeroStatus;
}

export default function PageHero({
  breadcrumb,
  title,
  description,
  status,
}: PageHeroProps) {
  return (
    <header className={styles['page-hero']}>
      <div className={styles['page-hero__inner']}>
        {breadcrumb && (
          <p className={styles['page-hero__breadcrumb']}>{breadcrumb}</p>
        )}
        <div className={styles['page-hero__title-row']}>
          <h1 className={styles['page-hero__title']}>{title}</h1>
          {status && (
            <span
              className={`${styles['page-hero__status']} ${
                styles[`page-hero__status--${status}`]
              }`}
            >
              {STATUS_LABELS[status]}
            </span>
          )}
        </div>
        {description && (
          <p className={styles['page-hero__description']}>{description}</p>
        )}
      </div>
    </header>
  );
}
