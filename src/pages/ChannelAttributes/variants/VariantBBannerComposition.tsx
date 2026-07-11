import DesktopChannelFrame from '../surfaces/DesktopChannelFrame';
import MobileChannelFrame from '../surfaces/MobileChannelFrame';
import {
  UNCLEARED_VIEWER_PAYLOAD_B1,
  UNCLEARED_VIEWER_PAYLOAD_B3,
} from '../shared/channelAttrData';
import styles from './variant.module.scss';

/**
 * Variant B — banner composition for the UNCLEARED viewer (the V7 decision axis
 * for the security-officer review). B1 (generic "additional handling restrictions
 * apply" indicator, no count/value) vs B3 (full omission, classification only).
 * Program values are fully omitted in BOTH forks — never hinted.
 */
export default function VariantBBannerComposition() {
  return (
    <div className={styles.variant}>
      <div className={styles.variant__col}>
        <div className={styles['variant__caption']}>
          B1 — generic Handling indicator (no count, no value)
        </div>
        <DesktopChannelFrame payload={UNCLEARED_VIEWER_PAYLOAD_B1} />
        <div className={styles['variant__mobile']}>
          <MobileChannelFrame payload={UNCLEARED_VIEWER_PAYLOAD_B1} treatment="banner" />
        </div>
      </div>
      <div className={styles.variant__col}>
        <div className={styles['variant__caption']}>
          B3 — full omission (classification only)
        </div>
        <DesktopChannelFrame payload={UNCLEARED_VIEWER_PAYLOAD_B3} />
        <div className={styles['variant__mobile']}>
          <MobileChannelFrame payload={UNCLEARED_VIEWER_PAYLOAD_B3} treatment="banner" />
        </div>
      </div>
    </div>
  );
}
