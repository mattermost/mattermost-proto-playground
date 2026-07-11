import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import Icon from '@/components/ui/Icon/Icon';
import ClassificationPill from '../shared/ClassificationPill';
import ClassificationBanner from '../shared/ClassificationBanner';
import {
  CLASSIFICATION_STYLES,
  classificationOf,
  type ChannelAttributePayload,
  type GlobalBandState,
} from '../shared/channelAttrData';
import styles from './mobileFrame.module.scss';

export interface MobileChannelFrameProps {
  payload: ChannelAttributePayload;
  /** 'label' = inline pill under channel name; 'banner' = full-width band below name row. */
  treatment: 'label' | 'banner';
  globalBand?: GlobalBandState;
  advisoryTooltip?: boolean;
}

/**
 * Mobile channel header treatments (FR-22 label, FR-26 banner). Global band sits at
 * the top; the channel-level marking renders either as an inline pill under the name
 * (label) or a full-width band below the name row (banner). Both are prototyped for
 * the V7 / mobile comparison.
 */
export default function MobileChannelFrame({
  payload,
  treatment,
  globalBand,
  advisoryTooltip = true,
}: MobileChannelFrameProps) {
  const level = classificationOf(payload);

  return (
    <div className={styles.phone}>
      <div className={styles.phone__statusbar}>
        <span>9:41</span>
        <span className={styles['phone__notch']} aria-hidden />
        <span>▮▮▮</span>
      </div>

      <div className={styles.phone__nav}>
        {globalBand?.active && (
          <div
            className={styles.phone__globalband}
            style={{
              backgroundColor: CLASSIFICATION_STYLES[globalBand.level].bg,
              color: CLASSIFICATION_STYLES[globalBand.level].fg,
            }}
          >
            {globalBand.level}
          </div>
        )}
        <div className={styles['phone__nav-row']}>
          <Icon size="24" glyph={<ChevronLeftIcon />} />
          <div className={styles['phone__nav-center']}>
            <span className={styles['phone__channel-name']}>{payload.channelName}</span>
            {treatment === 'label' ? (
              level && (
                <span className={styles['phone__label-pill']}>
                  <ClassificationPill level={level} />
                </span>
              )
            ) : (
              <span className={styles['phone__members']}>32 members ›</span>
            )}
          </div>
          <div className={styles['phone__nav-actions']}>
            <Icon size="20" glyph={<MagnifyIcon />} />
            <Icon size="20" glyph={<DotsHorizontalIcon />} />
          </div>
        </div>
      </div>

      {treatment === 'banner' && level && (
        <ClassificationBanner payload={payload} advisoryTooltip={advisoryTooltip} compact />
      )}

      <div className={styles.phone__messages}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles['phone__msg']}>
            <div className={styles['phone__msg-avatar']} aria-hidden />
            <div>
              <div className={styles['phone__msg-name']}>Leonard Riley</div>
              <div className={styles['phone__msg-text']}>
                Confirming the handoff window and the updated distribution list for tonight&rsquo;s
                brief.
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.phone__composer}>Write to {payload.channelName}…</div>
    </div>
  );
}
