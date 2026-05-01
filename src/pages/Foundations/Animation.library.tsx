import { useState } from 'react';
import PlayOutlineIcon from '@mattermost/compass-icons/components/play-outline';
import Icon from '@/components/ui/Icon/Icon';
import IconButton, {
  ICON_BUTTON_ICON_SIZES,
} from '@/components/ui/IconButton/IconButton';
import styles from './Foundations.module.scss';

const DURATIONS = [
  {
    name: 'Quick',
    token: '--duration-quick',
    value: '150ms',
    desc: 'Default — hover states, small reveals',
  },
  {
    name: 'Moderate',
    token: '--duration-moderate',
    value: '300ms',
    desc: 'Large movements — panels, drawers',
  },
];

const EASINGS = [
  {
    name: 'Transition',
    token: '--ease-transition',
    value: 'ease-in-out',
    desc: 'Element already on screen',
  },
  {
    name: 'Entrance',
    token: '--ease-entrance',
    value: 'ease-out',
    desc: 'Element entering the screen',
  },
  {
    name: 'Exit',
    token: '--ease-exit',
    value: 'ease-in',
    desc: 'Element leaving the screen',
  },
];

export default function AnimationLibrary() {
  const [playKeys, setPlayKeys] = useState<Record<string, number>>({});
  const replay = (token: string) =>
    setPlayKeys((prev) => ({ ...prev, [token]: (prev[token] ?? 0) + 1 }));

  return (
    <>
      <p>
        Always use animation tokens — never hard-code durations or easing
        keywords directly.
      </p>

      <h3>Duration</h3>
      <div className={styles['foundations__anim-rows']}>
        {DURATIONS.map(({ name, token, value, desc }) => (
          <div key={name} className={styles['foundations__anim-row']}>
            <div className={styles['foundations__anim-meta']}>
              <span className={styles['foundations__anim-name']}>{name}</span>
              <code className={styles['foundations__anim-token']}>{token}</code>
              <span className={styles['foundations__anim-value']}>{value}</span>
              <span className={styles['foundations__anim-desc']}>{desc}</span>
            </div>
            <div className={styles['foundations__anim-track']}>
              <span
                key={playKeys[token] ?? 0}
                className={styles['foundations__anim-dot']}
                style={{
                  animationDuration: `var(${token})`,
                  animationTimingFunction: 'var(--ease-transition)',
                  animationPlayState:
                    playKeys[token] !== undefined ? 'running' : 'paused',
                }}
              />
            </div>
            <IconButton
              icon={
                <Icon
                  glyph={<PlayOutlineIcon />}
                  size={ICON_BUTTON_ICON_SIZES['Small']}
                />
              }
              size="Small"
              aria-label={`Play ${name} duration`}
              onClick={() => replay(token)}
            />
          </div>
        ))}
      </div>

      <h3>Easing</h3>
      <div className={styles['foundations__anim-rows']}>
        {EASINGS.map(({ name, token, value, desc }) => (
          <div key={name} className={styles['foundations__anim-row']}>
            <div className={styles['foundations__anim-meta']}>
              <span className={styles['foundations__anim-name']}>{name}</span>
              <code className={styles['foundations__anim-token']}>{token}</code>
              <span className={styles['foundations__anim-value']}>{value}</span>
              <span className={styles['foundations__anim-desc']}>{desc}</span>
            </div>
            <div className={styles['foundations__anim-track']}>
              <span
                key={playKeys[token] ?? 0}
                className={styles['foundations__anim-dot']}
                style={{
                  animationDuration: 'var(--duration-moderate)',
                  animationTimingFunction: `var(${token})`,
                  animationPlayState:
                    playKeys[token] !== undefined ? 'running' : 'paused',
                }}
              />
            </div>
            <IconButton
              icon={
                <Icon
                  glyph={<PlayOutlineIcon />}
                  size={ICON_BUTTON_ICON_SIZES['Small']}
                />
              }
              size="Small"
              aria-label={`Play ${name} easing`}
              onClick={() => replay(token)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
