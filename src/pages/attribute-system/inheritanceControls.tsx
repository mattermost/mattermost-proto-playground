import type { PostInheritanceMode } from './data';
import styles from './ChannelAttributesScene.module.scss';

export interface InheritSegmentProps {
  channelPropagates: boolean;
  postMode: PostInheritanceMode;
  attrName: string;
  onChange: (next: 'off' | 'inherit' | 'inherit-locked') => void;
}

export function InheritSegment({
  channelPropagates,
  postMode,
  attrName,
  onChange,
}: InheritSegmentProps) {
  const state: 'off' | 'inherit' | 'inherit-locked' = !channelPropagates
    ? 'off'
    : postMode === 'channel-locked'
      ? 'inherit-locked'
      : 'inherit';

  const opts: Array<{
    value: 'off' | 'inherit' | 'inherit-locked';
    label: string;
    tip: string;
  }> = [
    {
      value: 'off',
      label: 'Off',
      tip: 'Posts do not inherit this channel attribute.',
    },
    {
      value: 'inherit',
      label: 'Inherit',
      tip: 'New posts copy the channel value at creation; authors may change it.',
    },
    {
      value: 'inherit-locked',
      label: 'Inherit + lock',
      tip: 'New posts copy the channel value at creation; authors cannot change it.',
    },
  ];

  return (
    <div
      className={styles.inheritSegment}
      role="radiogroup"
      aria-label={`Inheritance to posts — ${attrName}`}
    >
      {opts.map((o) => {
        const active = state === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.tip}
            className={[
              styles.inheritSegment__btn,
              active ? styles['inheritSegment__btn--active'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
