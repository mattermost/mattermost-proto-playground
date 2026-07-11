import { useState } from 'react';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import ShieldAlertOutlineIcon from '@mattermost/compass-icons/components/shield-alert-outline';
import Icon from '@/components/ui/Icon/Icon';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import {
  CLASSIFICATION_STYLES,
  classificationOf,
  composeBannerString,
  type ChannelAttributePayload,
  type DisplayOverrides,
} from './channelAttrData';
import styles from './shared.module.scss';

export interface ClassificationBannerProps {
  payload: ChannelAttributePayload;
  overrides?: DisplayOverrides;
  /**
   * When true, render the "advisory until enforcement" info glyph + tooltip on the
   * banner (Phase 4 §5, NFR-COPY-1, defuses T-6/T-7). Present in Primary + B1/B3.
   */
  advisoryTooltip?: boolean;
  /** Compact height for mobile full-width band. */
  compact?: boolean;
}

/**
 * Classification banner — full-width, color-coded, persistent, non-dismissable
 * (FR-23, C-13). Text is CAPCO double-slash (FR-24, C-9) composed ONLY from the
 * payload. Two V7 forks are driven purely by the payload:
 *   • B1 → payload.handlingRestrictionWithheld === true → generic Handling glyph.
 *   • B3 → flag absent → no Handling glyph.
 * There is no client-side "compute what's hidden" — the fork is a server-authorized
 * boolean, carrying no value and no count (FR-30).
 */
export default function ClassificationBanner({
  payload,
  overrides,
  advisoryTooltip = true,
  compact = false,
}: ClassificationBannerProps) {
  const [showAdvisory, setShowAdvisory] = useState(false);
  const [showHandling, setShowHandling] = useState(false);

  const level = classificationOf(payload);
  if (!level) return null;
  const style = CLASSIFICATION_STYLES[level];
  const text = composeBannerString(payload, overrides);

  return (
    <div
      className={[styles.banner, compact ? styles['banner--compact'] : '']
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: style.bg, color: style.fg }}
      role="note"
      aria-label={`Channel classification banner: ${text}`}
    >
      <span className={styles['banner__text']}>{text}</span>

      {/* B1 Handling-caveat generic indicator — no value, no count (FR-30).
          Uses a shield-alert glyph so it reads as "restriction" and is visually
          differentiable at a glance from the information-outline advisory glyph. */}
      {payload.handlingRestrictionWithheld && (
        <button
          type="button"
          className={styles['banner__glyph']}
          onMouseEnter={() => setShowHandling(true)}
          onMouseLeave={() => setShowHandling(false)}
          onFocus={() => setShowHandling(true)}
          onBlur={() => setShowHandling(false)}
          aria-label="Additional handling restrictions apply"
        >
          <span style={{ color: style.fg }}>
            <Icon size="16" glyph={<ShieldAlertOutlineIcon />} />
          </span>
          {showHandling && (
            <span className={styles['banner__tooltip']}>
              <Tooltip label="Additional handling restrictions apply" arrow="Top" />
            </span>
          )}
        </button>
      )}

      {/* Advisory-until-enforcement info glyph — information-outline, distinct copy
          and distinct glyph from the shield-alert handling indicator above. */}
      {advisoryTooltip && (
        <button
          type="button"
          className={styles['banner__glyph']}
          onMouseEnter={() => setShowAdvisory(true)}
          onMouseLeave={() => setShowAdvisory(false)}
          onFocus={() => setShowAdvisory(true)}
          onBlur={() => setShowAdvisory(false)}
          aria-label="This marking is informational. Access is not yet restricted by clearance."
        >
          <span style={{ color: style.fg }}>
            <Icon size="16" glyph={<InformationOutlineIcon />} />
          </span>
          {showAdvisory && (
            <span className={styles['banner__tooltip']}>
              <Tooltip
                label="This marking is informational. Access is not yet restricted by clearance."
                arrow="Top"
              />
            </span>
          )}
        </button>
      )}
    </div>
  );
}
