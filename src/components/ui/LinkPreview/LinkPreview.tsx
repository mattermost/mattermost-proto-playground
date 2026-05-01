import styles from './LinkPreview.module.scss';

export interface LinkPreviewProps {
  /** The site/domain label shown above the title. */
  siteName?: string;
  /** The main link title. */
  title?: string;
  /** Description text. */
  description?: string;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Rich URL preview card shown in messages. Displays site name, title (linked),
 * and description. Corresponds to the Figma Link Preview component v2.0.0.
 */
export default function LinkPreview({
  siteName = 'Mattermost.com',
  title = 'Mattermost: Open-source, high-trust, developer-centric collaboration platform',
  description = 'Mattermost is a secure, open source platform for communication, collaboration, and workflow orchestration across tools and teams.',
  className = '',
}: LinkPreviewProps) {
  const rootClass = [styles['link-preview'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['link-preview__card']}>
        <div className={styles['link-preview__text']}>
          <p className={styles['link-preview__site-name']}>{siteName}</p>
          <p className={styles['link-preview__title']}>{title}</p>
          <p className={styles['link-preview__description']}>{description}</p>
        </div>
      </div>
    </div>
  );
}
