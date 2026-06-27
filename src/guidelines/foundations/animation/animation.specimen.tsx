import { useState, type CSSProperties } from 'react';
import PlayOutlineIcon from '@mattermost/compass-icons/components/play-outline';
import { Icon, IconButton, ICON_BUTTON_ICON_SIZES } from '@mattermost/compass-ui';
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

function useAnimationReplay() {
  const [playKeys, setPlayKeys] = useState<Record<string, number>>({});
  const replay = (token: string) =>
    setPlayKeys((prev) => ({ ...prev, [token]: (prev[token] ?? 0) + 1 }));
  return { playKeys, replay };
}

function AnimationRow({
  token,
  value,
  desc,
  playKeys,
  replay,
  style,
}: {
  token: string;
  value: string;
  desc: string;
  playKeys: Record<string, number>;
  replay: (token: string) => void;
  style: CSSProperties;
}) {
  return (
    <div className={styles['foundations__anim-row']}>
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
            ...style,
            animationPlayState:
              playKeys[token] !== undefined ? 'running' : 'paused',
          }}
        />
      </div>
      <IconButton
        icon={
          <Icon glyph={<PlayOutlineIcon />} size={ICON_BUTTON_ICON_SIZES['Small']} />
        }
        size="Small"
        aria-label={`Play ${token} preview`}
        onClick={() => replay(token)}
      />
    </div>
  );
}

export function AnimationDurationsContent() {
  const { playKeys, replay } = useAnimationReplay();

  return (
    <div className={styles['foundations__anim-rows']}>
      {DURATIONS.map(({ token, value, desc }) => (
        <AnimationRow
          key={token}
          token={token}
          value={value}
          desc={desc}
          playKeys={playKeys}
          replay={replay}
          style={{
            animationDuration: `var(${token})`,
            animationTimingFunction: 'var(--ease-transition)',
          }}
        />
      ))}
    </div>
  );
}

export function AnimationEasingsContent() {
  const { playKeys, replay } = useAnimationReplay();

  return (
    <div className={styles['foundations__anim-rows']}>
      {EASINGS.map(({ token, value, desc }) => (
        <AnimationRow
          key={token}
          token={token}
          value={value}
          desc={desc}
          playKeys={playKeys}
          replay={replay}
          style={{
            animationDuration: 'var(--duration-moderate)',
            animationTimingFunction: `var(${token})`,
          }}
        />
      ))}
    </div>
  );
}

export default function AnimationLibrary() {
  return (
    <>
      <h3>Duration</h3>
      <AnimationDurationsContent />
      <h3>Easing</h3>
      <AnimationEasingsContent />
    </>
  );
}
