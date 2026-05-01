import styles from './PageHero.module.scss';

interface PageHeroProps {
  /** Breadcrumb / eyebrow shown above the title (e.g. "Library / Components"). */
  breadcrumb?: string;
  /** Page title. */
  title: string;
  /** Short description shown beneath the title. */
  description?: string;
}

export default function PageHero({
  breadcrumb,
  title,
  description,
}: PageHeroProps) {
  return (
    <header className={styles['page-hero']}>
      <div className={styles['page-hero__inner']}>
        {breadcrumb && (
          <p className={styles['page-hero__breadcrumb']}>{breadcrumb}</p>
        )}
        <h1 className={styles['page-hero__title']}>{title}</h1>
        {description && (
          <p className={styles['page-hero__description']}>{description}</p>
        )}
      </div>
    </header>
  );
}
