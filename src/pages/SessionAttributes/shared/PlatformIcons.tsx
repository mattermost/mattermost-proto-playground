import LaptopIcon from '@mattermost/compass-icons/components/laptop';
import CellphoneIcon from '@mattermost/compass-icons/components/cellphone';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import Icon from '@/components/ui/Icon/Icon';
import type { PlatformCoverage, PlatformState } from './types';
import styles from './PlatformIcons.module.scss';

interface PlatformIconsProps {
  desktop: PlatformState;
  mobile: PlatformState;
  browser: PlatformState;
  size?: 12 | 16;
}

function coverageClass(cov: PlatformCoverage) {
  if (cov === 'available') return styles['platform-icons__icon--available'];
  if (cov === 'caveats') return styles['platform-icons__icon--caveats'];
  return styles['platform-icons__icon--unavailable'];
}

function tooltipFor(platform: string, ps: PlatformState) {
  const stateLabel =
    ps.state === 'available'
      ? 'Available'
      : ps.state === 'caveats'
        ? 'Available with caveats'
        : 'Not collectible';
  if (ps.detail) return `${platform} — ${stateLabel}. ${ps.detail}`;
  return `${platform} — ${stateLabel}.`;
}

export default function PlatformIcons({
  desktop,
  mobile,
  browser,
  size = 16,
}: PlatformIconsProps) {
  const iconSize: '12' | '16' = size === 12 ? '12' : '16';
  return (
    <span className={styles['platform-icons']}>
      <span
        className={`${styles['platform-icons__icon']} ${coverageClass(desktop.state)}`}
        title={tooltipFor('Desktop', desktop)}
      >
        <Icon size={iconSize} glyph={<LaptopIcon />} />
      </span>
      <span
        className={`${styles['platform-icons__icon']} ${coverageClass(mobile.state)}`}
        title={tooltipFor('Mobile', mobile)}
      >
        <Icon size={iconSize} glyph={<CellphoneIcon />} />
      </span>
      <span
        className={`${styles['platform-icons__icon']} ${coverageClass(browser.state)}`}
        title={tooltipFor('Browser', browser)}
      >
        <Icon size={iconSize} glyph={<GlobeIcon />} />
      </span>
    </span>
  );
}
