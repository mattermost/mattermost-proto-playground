import type { ReactNode } from 'react';
import { useState } from 'react';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Icon from '@/components/ui/Icon/Icon';
import HeaderPills from '../shared/HeaderPills';
import ClassificationBanner from '../shared/ClassificationBanner';
import {
  CLASSIFICATION_STYLES,
  classificationOf,
  type ChannelAttributePayload,
  type DisplayOverrides,
  type GlobalBandState,
} from '../shared/channelAttrData';
import styles from './desktopFrame.module.scss';

export interface DesktopChannelFrameProps {
  payload: ChannelAttributePayload;
  overrides?: DisplayOverrides;
  channelName?: string;
  /** Global classification band shown above the channel band (FR-25). */
  globalBand?: GlobalBandState;
  /** Show the admin-only "channel > global" non-blocking warning (FR-25, V6). */
  showElevatedWarning?: boolean;
  advisoryTooltip?: boolean;
  /** Right info sidebar content (attribute block, etc.). */
  rightSidebar?: ReactNode;
  rightSidebarTitle?: string;
  visibleHeaderSlots?: number;
  /** A3 variant — Classification pill only in the header. */
  classificationOnlyHeader?: boolean;
}

/**
 * Mockup-faithful desktop channel chrome (dark global header + channel header row
 * with pills + classification banner(s) + optional right info sidebar). Product
 * chrome only — no playground annotations.
 */
export default function DesktopChannelFrame({
  payload,
  overrides,
  channelName,
  globalBand,
  showElevatedWarning = false,
  advisoryTooltip = true,
  rightSidebar,
  rightSidebarTitle = 'Info',
  visibleHeaderSlots = 1,
  classificationOnlyHeader = false,
}: DesktopChannelFrameProps) {
  const [sidebarOpen, setSidebarOpen] = useState(Boolean(rightSidebar));
  const name = channelName ?? payload.channelName;
  const level = classificationOf(payload);

  return (
    <div className={styles.frame}>
      {/* Global app header (dark) */}
      <div className={styles.frame__global}>
        <span className={styles['frame__global-title']}>Channels</span>
        <div className={styles['frame__global-search']}>Search</div>
      </div>

      {globalBand?.active && (
        <div
          className={styles.frame__globalband}
          style={{
            backgroundColor: CLASSIFICATION_STYLES[globalBand.level].bg,
            color: CLASSIFICATION_STYLES[globalBand.level].fg,
          }}
          role="note"
          aria-label={`Workspace classification: ${globalBand.level}`}
        >
          {globalBand.level}
        </div>
      )}

      <div className={styles.frame__body}>
        <div className={styles.frame__center}>
          {/* Channel header row */}
          <div className={styles.frame__header}>
            <button type="button" className={styles['frame__fav']} aria-label="Favorite">
              <Icon size="20" glyph={<StarOutlineIcon />} />
            </button>
            <span className={styles['frame__name']}>{name}</span>
            <Icon size="16" glyph={<ChevronDownIcon />} />
            <span className={styles['frame__hicon']} aria-hidden>
              <Icon size="20" glyph={<ShieldOutlineIcon />} />
            </span>
            <span className={styles['frame__members']}>
              <Icon size="20" glyph={<AccountOutlineIcon />} /> 1
            </span>
            <div className={styles['frame__pills']}>
              <HeaderPills
                payload={payload}
                overrides={overrides}
                visibleSlots={visibleHeaderSlots}
                classificationOnly={classificationOnlyHeader}
              />
            </div>
            <div className={styles['frame__header-actions']}>
              <button type="button" className={styles['frame__hicon']} aria-label="Call">
                <Icon size="20" glyph={<PhoneIcon />} />
              </button>
              <button
                type="button"
                className={styles['frame__hicon']}
                aria-label="Channel info"
                onClick={() => setSidebarOpen((o) => !o)}
              >
                <Icon size="20" glyph={<InformationOutlineIcon />} />
              </button>
            </div>
          </div>

          {/* Channel classification banner */}
          {level && (
            <ClassificationBanner
              payload={payload}
              overrides={overrides}
              advisoryTooltip={advisoryTooltip}
            />
          )}

          {/* Admin-only elevated-classification warning (non-blocking, display-only) */}
          {showElevatedWarning && (
            <div className={styles.frame__warning} role="status">
              <Icon size="16" glyph={<InformationOutlineIcon />} />
              <span>
                This channel&rsquo;s classification exceeds the workspace-wide classification
                level. Contact your system administrator.
              </span>
            </div>
          )}

          {/* Message stub — establishes product context, not the focus */}
          <div className={styles.frame__messages}>
            <div className={styles['frame__msg']}>
              <div className={styles['frame__msg-avatar']} aria-hidden />
              <div>
                <div className={styles['frame__msg-name']}>Michael Whitfield</div>
                <div className={styles['frame__msg-text']}>
                  What are we doing for the logging points in our in-app purchases split test?
                </div>
              </div>
            </div>
          </div>
        </div>

        {sidebarOpen && rightSidebar && (
          <aside className={styles.frame__sidebar} aria-label="Channel info">
            <div className={styles['frame__sidebar-head']}>
              <span className={styles['frame__sidebar-title']}>{rightSidebarTitle}</span>
              {level && (
                <span
                  className={styles['frame__sidebar-band']}
                  style={{
                    backgroundColor: CLASSIFICATION_STYLES[level].bg,
                    color: CLASSIFICATION_STYLES[level].fg,
                  }}
                >
                  {level}
                </span>
              )}
              <button
                type="button"
                className={styles['frame__hicon']}
                aria-label="Close info"
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size="20" glyph={<CloseIcon />} />
              </button>
            </div>
            <div className={styles['frame__sidebar-body']}>{rightSidebar}</div>
          </aside>
        )}
      </div>
    </div>
  );
}
