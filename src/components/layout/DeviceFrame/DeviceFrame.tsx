import type {CSSProperties, ReactNode} from 'react';
import styles from './DeviceFrame.module.scss';

/** iPhone logical display size (points). */
export const DEVICE_FRAME_WIDTH = 393;
export const DEVICE_FRAME_HEIGHT = 852;

/** Portrait safe-area insets for iPhone 17. */
export const DEVICE_SAFE_TOP = 62;
export const DEVICE_SAFE_BOTTOM = 34;
export const DEVICE_STATUS_BAR_HEIGHT = 54;

export type DeviceFrameStatusBarStyle = 'dark' | 'light';

export interface DeviceFrameProps {
  children?: ReactNode;
  /** Clock text in the status bar. Defaults to Apple’s demo time. */
  time?: string;
  /**
   * Status bar glyph/text color.
   * `dark` = dark content on a light screen; `light` = light content on a dark screen.
   */
  statusBarStyle?: DeviceFrameStatusBarStyle;
  /**
   * When true (default), children sit between the status bar and home-indicator
   * safe areas. Set false for full-bleed scenes that manage insets themselves.
   */
  insetContent?: boolean;
  className?: string;
}

function SignalIcon() {
  return (
    <svg
      className={styles['device-frame__status-icon']}
      width='17'
      height='12'
      viewBox='0 0 17 12'
      aria-hidden
    >
      <rect x='0' y='7.5' width='3' height='4.5' rx='0.5' fill='currentColor' />
      <rect x='4.5' y='5' width='3' height='7' rx='0.5' fill='currentColor' />
      <rect x='9' y='2.5' width='3' height='9.5' rx='0.5' fill='currentColor' />
      <rect x='13.5' y='0' width='3' height='12' rx='0.5' fill='currentColor' />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg
      className={styles['device-frame__status-icon']}
      width='16'
      height='12'
      viewBox='0 0 16 12'
      aria-hidden
    >
      <path
        fill='currentColor'
        d='M8 9.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm-3.1-2.05a4.4 4.4 0 0 1 6.2 0l-.95.95a3.05 3.05 0 0 0-4.3 0l-.95-.95Zm-2.15-2.15a7.45 7.45 0 0 1 10.5 0l-.95.95a6.1 6.1 0 0 0-8.6 0l-.95-.95Z'
      />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg
      className={styles['device-frame__status-icon']}
      width='27'
      height='13'
      viewBox='0 0 27 13'
      aria-hidden
    >
      <rect
        x='0.5'
        y='0.5'
        width='23'
        height='12'
        rx='3.5'
        fill='none'
        stroke='currentColor'
        strokeOpacity='0.4'
      />
      <rect x='2' y='2' width='18' height='9' rx='2' fill='currentColor' />
      <path
        fill='currentColor'
        fillOpacity='0.4'
        d='M25 4.5c.8.4 1.3 1.2 1.3 2s-.5 1.6-1.3 2V4.5Z'
      />
    </svg>
  );
}

/**
 * iPhone device chrome for mobile prototypes.
 * Display canvas is 393×852 logical points with Dynamic Island, status bar, and home indicator.
 */
export default function DeviceFrame({
  children,
  time = '9:41',
  statusBarStyle = 'dark',
  insetContent = true,
  className,
}: DeviceFrameProps) {
  const rootClass = [
    styles['device-frame'],
    styles[`device-frame--status-${statusBarStyle}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const rootStyle = {
    '--device-width': `${DEVICE_FRAME_WIDTH}px`,
    '--device-height': `${DEVICE_FRAME_HEIGHT}px`,
    '--device-safe-top': `${DEVICE_SAFE_TOP}px`,
    '--device-safe-bottom': `${DEVICE_SAFE_BOTTOM}px`,
    '--device-status-bar-height': `${DEVICE_STATUS_BAR_HEIGHT}px`,
  } as CSSProperties;

  return (
    <div className={rootClass} data-device='iphone-17' style={rootStyle}>
      <div className={styles['device-frame__chassis']}>
        <div className={styles['device-frame__buttons']} aria-hidden>
          <span className={styles['device-frame__button-action']} />
          <span className={styles['device-frame__button-volume-up']} />
          <span className={styles['device-frame__button-volume-down']} />
          <span className={styles['device-frame__button-power']} />
        </div>

        <div className={styles['device-frame__bezel']}>
          <div
            className={styles['device-frame__screen']}
            style={{
              width: DEVICE_FRAME_WIDTH,
              height: DEVICE_FRAME_HEIGHT,
            }}
          >
            <div className={styles['device-frame__status-bar']}>
              <span className={styles['device-frame__time']}>{time}</span>
              <div className={styles['device-frame__status-trailing']}>
                <SignalIcon />
                <WifiIcon />
                <BatteryIcon />
              </div>
            </div>

            <div className={styles['device-frame__dynamic-island']} aria-hidden />

            <div
              className={[
                styles['device-frame__content'],
                insetContent && styles['device-frame__content--inset'],
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {children}
            </div>

            <div className={styles['device-frame__home-indicator']} aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
