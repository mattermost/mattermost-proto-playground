import CloseIcon from '@mattermost/compass-icons/components/close';
import Icon from '@/components/ui/Icon/Icon';
import AttributeSidebarBlock from '../shared/AttributeSidebarBlock';
import {
  CLASSIFICATION_STYLES,
  classificationOf,
  type ChannelAttributePayload,
  type DisplayOverrides,
} from '../shared/channelAttrData';
import styles from './mobileInfo.module.scss';

export interface MobileInfoPanelProps {
  payload: ChannelAttributePayload;
  overrides?: DisplayOverrides;
  mode: 'admin' | 'member';
  onGovernedChange?: () => void;
  openConfigFor?: string | null;
  onToggleConfig?: (id: string | null) => void;
}

/**
 * Mobile channel info modal with the attribute block (Gap-06). Member = read-only
 * (block absent when cleared set empty); admin = inline edit + config access.
 */
export default function MobileInfoPanel({
  payload,
  overrides,
  mode,
  onGovernedChange,
  openConfigFor,
  onToggleConfig,
}: MobileInfoPanelProps) {
  const level = classificationOf(payload);

  return (
    <div className={styles.info}>
      <div className={styles.info__head}>
        <span className={styles['info__title']}>Channel info</span>
        <Icon size="20" glyph={<CloseIcon />} />
      </div>

      {level && (
        <div
          className={styles.info__band}
          style={{
            backgroundColor: CLASSIFICATION_STYLES[level].bg,
            color: CLASSIFICATION_STYLES[level].fg,
          }}
        >
          {level}
        </div>
      )}

      <div className={styles.info__name}>{payload.channelName}</div>
      <div className={styles.info__purpose}>
        Discussion of UX by core contributors and staff.
      </div>

      <div className={styles['info__section-title']}>Channel attributes</div>
      <AttributeSidebarBlock
        payload={payload}
        overrides={overrides}
        mode={mode}
        onGovernedChange={onGovernedChange}
        openConfigFor={openConfigFor}
        onToggleConfig={onToggleConfig}
      />
    </div>
  );
}
