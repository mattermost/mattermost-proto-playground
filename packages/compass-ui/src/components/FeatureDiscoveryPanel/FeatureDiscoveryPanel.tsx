import Button from '@/components/Button/Button';
import type { ButtonProps } from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import Illustration from '@/components/Illustration/Illustration';
import type { IllustrationProps } from '@/components/Illustration/Illustration';
import Tag from '@/components/Tag/Tag';
import MattermostIcon from '@mattermost/compass-icons/components/mattermost';
import styles from './FeatureDiscoveryPanel.module.scss';

export interface FeatureDiscoveryPanelProps {
  /** SKU tag label (e.g. "PROFESSIONAL"). Set to null to hide. */
  skuLabel?: string | null;
  /** Panel heading title. */
  title: string;
  /** Body description text. */
  description: string;
  /** Primary CTA button props (children = label). */
  primaryAction?: ButtonProps;
  /** Secondary CTA button props (children = label). */
  secondaryAction?: ButtonProps;
  /** Illustration props (children = the SVG component). Rendered in the right column. */
  illustration?: IllustrationProps;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Feature Discovery Panel — highlights capabilities only available in higher-tier SKUs.
 * Contains an illustration, SKU tag, title, description, and CTA buttons.
 *
 * @see https://compass.mattermost.com/29be2c109/p/865664-feature-discovery-panel
 */
export default function FeatureDiscoveryPanel({
  skuLabel = 'PROFESSIONAL',
  title,
  description,
  primaryAction,
  secondaryAction,
  illustration,
  className = '',
}: FeatureDiscoveryPanelProps) {
  return (
    <div
      className={[styles['feature-discovery-panel'], className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['feature-discovery-panel__content']}>
        <div className={styles['feature-discovery-panel__text']}>
          <div className={styles['feature-discovery-panel__title-group']}>
            {skuLabel != null && (
              <Tag
                label={skuLabel}
                casing="All Caps"
                leadingIcon={<Icon size="10" glyph={<MattermostIcon />} />}
              />
            )}
            <h2 className={styles['feature-discovery-panel__title']}>
              {title}
            </h2>
          </div>
          <p className={styles['feature-discovery-panel__description']}>
            {description}
          </p>
        </div>

        {(primaryAction != null || secondaryAction != null) && (
          <div className={styles['feature-discovery-panel__actions']}>
            {primaryAction != null && (
              <div className={styles['feature-discovery-panel__action']}>
                <Button size="Medium" {...primaryAction} />
              </div>
            )}
            {secondaryAction != null && (
              <div className={styles['feature-discovery-panel__action']}>
                <Button size="Medium" {...secondaryAction} />
              </div>
            )}
          </div>
        )}
      </div>

      {illustration != null && (
        <div className={styles['feature-discovery-panel__illustration']}>
          <Illustration {...illustration} />
        </div>
      )}
    </div>
  );
}
