import { useState } from 'react';
import PlayOutlineIcon from '@mattermost/compass-icons/components/play-outline';
import Icon from '@/components/ui/Icon/Icon';
import IconButton, {
  ICON_BUTTON_ICON_SIZES,
} from '@/components/ui/IconButton/IconButton';
import styles from '@/styles/library-demo/foundations.module.scss';

const DURATIONS = [
  {
    token: '--duration-quick',
    value: '150ms',
    desc: 'Default — hover states, small reveals',
  },
  {
    token: '--duration-moderate',
    value: '300ms',
    desc: 'Large movements — panels, drawers',
  },
];

const EASINGS = [
  {
    token: '--ease-transition',
    value: 'ease-in-out',
    desc: 'Element already on screen',
  },
  {
    token: '--ease-entrance',
    value: 'ease-out',
    desc: 'Element entering the screen',
  },
  {
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
        {DURATIONS.map(({ token, value, desc }) => (
          <div key={token} className={styles['foundations__anim-row']}>
            <div className={styles['foundations__anim-meta']}>
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
              aria-label={`Play ${token} preview`}
              onClick={() => replay(token)}
            />
          </div>
        ))}
      </div>

      <h3>Easing</h3>
      <div className={styles['foundations__anim-rows']}>
        {EASINGS.map(({ token, value, desc }) => (
          <div key={token} className={styles['foundations__anim-row']}>
            <div className={styles['foundations__anim-meta']}>
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
              aria-label={`Play ${token} preview`}
              onClick={() => replay(token)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
