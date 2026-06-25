import { useState } from 'react';
import PlayOutlineIcon from '@mattermost/compass-icons/components/play-outline';
import { Icon } from '@mattermost/compass-ui';
import {
  ICON_BUTTON_ICON_SIZES,
  IconButton} from '@mattermost/compass-ui';
import { Button } from '@mattermost/compass-ui';
import styles from './AnimationSamples.module.scss';

interface MatrixCell {
  id: string;
  title: string;
  scenario: string;
  duration: string;
  easing: string;
  /** Which keyframe family the chip uses. */
  demo: 'small' | 'large' | 'entrance' | 'exit';
}

const MATRIX: MatrixCell[] = [
  {
    id: 'small',
    title: 'Small movement',
    scenario: 'Element already on screen, short distance.',
    duration: '--duration-quick',
    easing: '--ease-transition',
    demo: 'small',
  },
  {
    id: 'large',
    title: 'Large movement',
    scenario: 'Element already on screen, long distance.',
    duration: '--duration-moderate',
    easing: '--ease-transition',
    demo: 'large',
  },
  {
    id: 'entrance',
    title: 'Entrance',
    scenario: 'Element entering the screen.',
    duration: '--duration-moderate',
    easing: '--ease-entrance',
    demo: 'entrance',
  },
  {
    id: 'exit',
    title: 'Exit',
    scenario: 'Element leaving the screen.',
    duration: '--duration-moderate',
    easing: '--ease-exit',
    demo: 'exit',
  },
];

export function MotionMatrix() {
  const [keys, setKeys] = useState<Record<string, number>>({});
  const play = (id: string) =>
    setKeys((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

  return (
    <div className={styles['motion-matrix']}>
      {MATRIX.map((cell) => {
        const played = keys[cell.id] !== undefined;
        const chipClass = [
          styles['motion-matrix__chip'],
          styles[`motion-matrix__chip--${cell.demo}`],
        ].join(' ');

        return (
          <div key={cell.id} className={styles['motion-matrix__cell']}>
            <div className={styles['motion-matrix__header']}>
              <div className={styles['motion-matrix__title']}>{cell.title}</div>
              <div className={styles['motion-matrix__scenario']}>
                {cell.scenario}
              </div>
            </div>

            <div
              className={`${styles['motion-matrix__stage']} ${styles[`motion-matrix__stage--${cell.demo}`]}`}
            >
              <span
                key={keys[cell.id] ?? 0}
                className={chipClass}
                style={{
                  animationDuration: `var(${cell.duration})`,
                  animationTimingFunction: `var(${cell.easing})`,
                  animationPlayState: played ? 'running' : 'paused',
                }}
              />
            </div>

            <div className={styles['motion-matrix__footer']}>
              <div className={styles['motion-matrix__tokens']}>
                <code>{cell.duration}</code>
                <code>{cell.easing}</code>
              </div>
              <IconButton
                icon={
                  <Icon
                    glyph={<PlayOutlineIcon />}
                    size={ICON_BUTTON_ICON_SIZES['Small']}
                  />
                }
                size="Small"
                aria-label={`Play ${cell.title}`}
                onClick={() => play(cell.id)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PopoverPattern() {
  const [open, setOpen] = useState(false);
  const panelClass = [
    styles['popover-pattern__panel'],
    open ? styles['popover-pattern__panel--open'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles['popover-pattern']}>
      <div className={styles['popover-pattern__anchor']}>
        <Button
          emphasis="Secondary"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? 'Close popover' : 'Open popover'}
        </Button>

        <div className={panelClass} aria-hidden={!open}>
          <div className={styles['popover-pattern__item']}>Edit profile</div>
          <div className={styles['popover-pattern__item']}>Preferences</div>
          <div className={styles['popover-pattern__item']}>Sign out</div>
        </div>
      </div>

      <div className={styles['popover-pattern__caption']}>
        Click the trigger to play the open and close animations.
      </div>
    </div>
  );
}
