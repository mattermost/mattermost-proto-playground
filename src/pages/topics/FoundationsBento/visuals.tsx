import type { ComponentType, SVGProps } from 'react';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import CalendarOutlineIcon from '@mattermost/compass-icons/components/calendar-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import EmoticonOutlineIcon from '@mattermost/compass-icons/components/emoticon-outline';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import PaperclipIcon from '@mattermost/compass-icons/components/paperclip';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import type { TopicVisual } from '@/manifests/topics';
import styles from './FoundationsBento.module.scss';

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const SWATCHES = [
  'var(--color-info)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-danger)',
  'var(--color-purple-500)',
  'var(--color-cyan-500)',
];

const ICON_SET: IconComponent[] = [
  MagnifyIcon,
  BellOutlineIcon,
  BookmarkOutlineIcon,
  EmoticonOutlineIcon,
  PaperclipIcon,
  CheckCircleOutlineIcon,
  CalendarOutlineIcon,
  PencilOutlineIcon,
];

const SPACING_TOKENS = ['--spacing-xs', '--spacing-m', '--spacing-l', '--spacing-xl', '--spacing-xxl'];
const RADIUS_TOKENS = ['--radius-s', '--radius-m', '--radius-l', '--radius-xl'];
const ELEVATION_TOKENS = ['--elevation-1', '--elevation-3', '--elevation-5'];

function Swatches() {
  return (
    <div className={styles['visual-swatches']} aria-hidden="true">
      {SWATCHES.map((c) => (
        <span
          key={c}
          className={styles['visual-swatches__chip']}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

function TypeSpecimen() {
  return (
    <div className={styles['visual-type']} aria-hidden="true">
      <span className={styles['visual-type__display']}>Aa</span>
      <span className={styles['visual-type__caption']}>Metropolis · Open Sans</span>
    </div>
  );
}

function IconGrid() {
  return (
    <div className={styles['visual-icons']} aria-hidden="true">
      {ICON_SET.map((Icon, i) => (
        <span key={i} className={styles['visual-icons__cell']}>
          <Icon size={20} />
        </span>
      ))}
    </div>
  );
}

function SpacingStack() {
  return (
    <div className={styles['visual-spacing']} aria-hidden="true">
      {SPACING_TOKENS.map((t) => (
        <span
          key={t}
          className={styles['visual-spacing__bar']}
          style={{ width: `var(${t})` }}
        />
      ))}
    </div>
  );
}

function ShapeStack() {
  return (
    <div className={styles['visual-shape']} aria-hidden="true">
      {RADIUS_TOKENS.map((t) => (
        <span
          key={t}
          className={styles['visual-shape__tile']}
          style={{ borderRadius: `var(${t})` }}
        />
      ))}
    </div>
  );
}

function ElevationStack() {
  return (
    <div className={styles['visual-elevation']} aria-hidden="true">
      {ELEVATION_TOKENS.map((t) => (
        <span
          key={t}
          className={styles['visual-elevation__tile']}
          style={{ boxShadow: `var(${t})` }}
        />
      ))}
    </div>
  );
}

function ThemeSplit() {
  return (
    <div className={styles['visual-theme']} aria-hidden="true">
      <span className={`${styles['visual-theme__half']} ${styles['visual-theme__half--light']}`}>
        <span className={styles['visual-theme__line']} />
        <span className={`${styles['visual-theme__line']} ${styles['visual-theme__line--short']}`} />
      </span>
      <span className={`${styles['visual-theme__half']} ${styles['visual-theme__half--dark']}`}>
        <span className={styles['visual-theme__line']} />
        <span className={`${styles['visual-theme__line']} ${styles['visual-theme__line--short']}`} />
      </span>
    </div>
  );
}

function Motion() {
  return (
    <div className={styles['visual-motion']} aria-hidden="true">
      <span className={styles['visual-motion__dot']} />
      <span className={styles['visual-motion__dot']} />
      <span className={styles['visual-motion__dot']} />
    </div>
  );
}

function LayoutGrid() {
  return (
    <div className={styles['visual-layout']} aria-hidden="true">
      <span className={styles['visual-layout__sidebar']} />
      <span className={styles['visual-layout__center']} />
      <span className={styles['visual-layout__rhs']} />
    </div>
  );
}

const VISUALS: Record<TopicVisual['kind'], ComponentType> = {
  swatches: Swatches,
  'type-specimen': TypeSpecimen,
  'icon-grid': IconGrid,
  'spacing-stack': SpacingStack,
  'shape-stack': ShapeStack,
  'elevation-stack': ElevationStack,
  'theme-split': ThemeSplit,
  motion: Motion,
  'layout-grid': LayoutGrid,
};

export function Visual({ kind }: { kind: TopicVisual['kind'] }) {
  const Component = VISUALS[kind];
  return <Component />;
}
