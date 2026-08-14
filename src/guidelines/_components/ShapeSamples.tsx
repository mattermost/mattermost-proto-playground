import type { ReactNode } from 'react';
import { Button } from '@mattermost/compass-ui';
import { MentionBadge } from '@mattermost/compass-ui';
import { StatusBadge } from '@mattermost/compass-ui';
import { UnreadBadge } from '@mattermost/compass-ui';
import { UserAvatar } from '@mattermost/compass-ui';
import { TeamAvatar } from '@mattermost/compass-ui';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import styles from './ShapeSamples.module.scss';

interface CoreShape {
  name: string;
  hint: string;
  /** Border-radius value applied to the illustration. */
  radius: string;
  /** When true, render as a 1:1 square so 9999px radius yields a circle. */
  square?: boolean;
}

const CORE_SHAPES: CoreShape[] = [
  {
    name: 'Rectangle',
    hint: 'Global containers and full-bleed surfaces.',
    radius: '0',
    square: true,
  },
  {
    name: 'Rounded rectangle',
    hint: 'Buttons, modals, popovers, cards.',
    radius: '8px',
    square: true,
  },
  {
    name: 'Pill',
    hint: 'Mention badges and single-row counts.',
    radius: '9999px',
  },
  {
    name: 'Circle',
    hint: 'Avatars, status dots, unread indicators.',
    radius: '9999px',
    square: true,
  },
];

export function CoreShapes() {
  return (
    <div className={styles['core-shapes']}>
      {CORE_SHAPES.map(({ name, hint, radius, square }) => (
        <div key={name} className={styles['core-shapes__card']}>
          <div
            className={
              styles['core-shapes__illustration'] +
              (square ? ` ${styles['core-shapes__illustration--square']}` : '')
            }
            style={{ borderRadius: radius }}
          />
          <div className={styles['core-shapes__name']}>{name}</div>
          <div className={styles['core-shapes__hint']}>{hint}</div>
        </div>
      ))}
    </div>
  );
}

interface RadiusStep {
  px: number;
  note?: string;
  default?: boolean;
}

const RADIUS_STEPS: RadiusStep[] = [
  { px: 2, note: 'Very small elements (e.g. checkbox)' },
  { px: 4, default: true, note: 'Default — most interactive elements' },
  { px: 8 },
  { px: 12 },
  { px: 16 },
  { px: 20 },
  { px: 24 },
  {
    px: 9999,
    note: 'Full radius — pills, capsules, and fully rounded controls',
  },
];

export function RadiusRamp() {
  return (
    <div className={styles['radius-ramp']}>
      {RADIUS_STEPS.map(({ px, note, default: isDefault }) => (
        <div
          key={px}
          className={
            styles['radius-ramp__row'] +
            (isDefault ? ` ${styles['radius-ramp__row--default']}` : '')
          }
        >
          <div
            className={styles['radius-ramp__chip']}
            style={{ borderRadius: `${px}px` }}
          />
          <div className={styles['radius-ramp__meta']}>
            <div className={styles['radius-ramp__label']}>
              {px}px
              {isDefault && (
                <span className={styles['radius-ramp__pill']}>Default</span>
              )}
            </div>
            {note && (
              <div className={styles['radius-ramp__note']}>{note}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface ShapeExampleProps {
  label: string;
  /** Render the stage on a sidebar-bg surface for components tuned to that context. */
  inverted?: boolean;
  children: ReactNode;
}

function ShapeExample({ label, inverted = false, children }: ShapeExampleProps) {
  const stageClass = [
    styles['example__stage'],
    inverted ? styles['example__stage--inverted'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles['example']}>
      <div className={stageClass}>{children}</div>
      <div className={styles['example__label']}>{label}</div>
    </div>
  );
}

interface ShapeExamplesProps {
  kind: 'rounded' | 'pill' | 'circle';
}

export function ShapeExamples({ kind }: ShapeExamplesProps) {
  return (
    <div className={styles['examples']}>
      {kind === 'rounded' && (
        <>
          <ShapeExample label="Button">
            <Button emphasis="Primary">Sign in</Button>
          </ShapeExample>
          <ShapeExample label="Popover Menu">
            <div className={styles['popover-demo']}>
              <div className={styles['popover-demo__item']}>Edit profile</div>
              <div className={styles['popover-demo__item']}>Preferences</div>
              <div className={styles['popover-demo__item']}>Sign out</div>
            </div>
          </ShapeExample>
          <ShapeExample label="Team Avatar" inverted>
            <TeamAvatar initials="Mm" size="48" />
          </ShapeExample>
        </>
      )}
      {kind === 'pill' && (
        <ShapeExample label="Mention Badge" inverted>
          <div className={styles['pill-demo-stage']}>
            <MentionBadge count={3} size="Medium" />
            <MentionBadge count={42} size="Medium" />
            <MentionBadge count={120} size="Medium" />
          </div>
        </ShapeExample>
      )}
      {kind === 'circle' && (
        <>
          <ShapeExample label="User Avatar">
            <UserAvatar src={avatarLeonard} alt="Leonard Riley" size="48" />
          </ShapeExample>
          <ShapeExample label="Status Badge">
            <div className={styles['circle-demo-stage']}>
              <StatusBadge status="Online" size="Large" />
            </div>
          </ShapeExample>
          <ShapeExample label="Unread Badge" inverted>
            <div className={styles['circle-demo-stage']}>
              <UnreadBadge size="8" />
            </div>
          </ShapeExample>
        </>
      )}
    </div>
  );
}
