import DesktopChannelFrame from '../surfaces/DesktopChannelFrame';
import { CLEARED_VIEWER_PAYLOAD } from '../shared/channelAttrData';
import styles from './variant.module.scss';

/**
 * Variant A — header overflow density comparison. A2 (recommended, fixed-priority
 * truncation + masking-aware +N popover) vs A3 (classification-only in header,
 * rest in sidebar). Both count/derive from the cleared payload only.
 */
export default function VariantAHeaderDensity() {
  return (
    <div className={styles.variant}>
      <div className={styles.variant__col}>
        <div className={styles['variant__caption']}>
          A2 — fixed-priority truncation + <code>+N</code> popover (recommended)
        </div>
        <DesktopChannelFrame payload={CLEARED_VIEWER_PAYLOAD} visibleHeaderSlots={1} />
      </div>
      <div className={styles.variant__col}>
        <div className={styles['variant__caption']}>
          A3 — classification-only in header (rest in sidebar)
        </div>
        <DesktopChannelFrame payload={CLEARED_VIEWER_PAYLOAD} classificationOnlyHeader />
      </div>
    </div>
  );
}
