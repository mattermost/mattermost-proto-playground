import KeyboardReturnIcon from '@mattermost/compass-icons/components/keyboard-return';
import LightbulbOutlineIcon from '@mattermost/compass-icons/components/lightbulb-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { ShortcutTag } from '@mattermost/compass-ui/components/shortcut-tag';
import styles from './SearchTipBar.module.scss';

type BrowseChannelsTip = {
  kind: 'browse-channels';
  onBrowse?: () => void;
};

type ModifierTip = {
  kind: 'modifiers';
  modifiers: readonly string[];
  onModifierClick?: (modifier: string) => void;
};

type ShortcutTip = {
  kind: 'shortcut';
  prefix: string;
  keys: string[];
  suffix: string;
};

type NoteTip = {
  kind: 'note';
  text: string;
};

type EnterSearchTip = {
  kind: 'enter-search';
};

export type SearchTip =
  | BrowseChannelsTip
  | ModifierTip
  | ShortcutTip
  | NoteTip
  | EnterSearchTip;

type SearchTipBarProps = {
  tip: SearchTip;
};

function TipIcon() {
  return (
    <Icon
      className={styles['search-tip-bar__icon']}
      glyph={<LightbulbOutlineIcon />}
      size="16"
    />
  );
}

export default function SearchTipBar({ tip }: SearchTipBarProps) {
  if (tip.kind === 'browse-channels') {
    return (
      <div className={styles['search-tip-bar']}>
        <TipIcon />
        <p className={styles['search-tip-bar__text']}>
          Looking for more channels?{' '}
          <Button
            emphasis="link"
            size="small"
            type="button"
            onClick={tip.onBrowse}
          >
            Browse channels
          </Button>
        </p>
      </div>
    );
  }

  if (tip.kind === 'modifiers') {
    return (
      <div className={styles['search-tip-bar']}>
        <TipIcon />
        <p className={styles['search-tip-bar__label']}>Tip: Try</p>
        <div className={styles['search-tip-bar__modifiers']}>
          {tip.modifiers.map((modifier) => (
            <Button
              key={modifier}
              compact
              emphasis="dim"
              size="x-small"
              type="button"
              onClick={() => tip.onModifierClick?.(modifier)}
            >
              {modifier}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (tip.kind === 'note') {
    return (
      <div className={styles['search-tip-bar']}>
        <TipIcon />
        <p className={styles['search-tip-bar__text']}>{tip.text}</p>
      </div>
    );
  }

  if (tip.kind === 'enter-search') {
    return (
      <div className={styles['search-tip-bar']}>
        <span className={styles['search-tip-bar__enter-key']} aria-hidden>
          <Icon glyph={<KeyboardReturnIcon />} size="12" />
        </span>
        <p className={styles['search-tip-bar__text']}>Enter to search</p>
      </div>
    );
  }

  return (
    <div className={styles['search-tip-bar']}>
      <TipIcon />
      <p className={styles['search-tip-bar__label']}>{tip.prefix}</p>
      <span className={styles['search-tip-bar__shortcuts']}>
        {tip.keys.map((key) => (
          <ShortcutTag key={key} label={key} size="small" />
        ))}
      </span>
      <p className={styles['search-tip-bar__text']}>{tip.suffix}</p>
    </div>
  );
}
