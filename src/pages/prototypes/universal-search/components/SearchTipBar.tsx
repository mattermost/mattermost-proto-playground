import { Button } from '@mattermost/compass-ui/components/button';
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

export type SearchTip = BrowseChannelsTip | ModifierTip | ShortcutTip;

type SearchTipBarProps = {
  tip: SearchTip;
};

export default function SearchTipBar({ tip }: SearchTipBarProps) {
  if (tip.kind === 'browse-channels') {
    return (
      <div className={styles['search-tip-bar']}>
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
        <p className={styles['search-tip-bar__label']}>Tip: Try</p>
        <div className={styles['search-tip-bar__modifiers']}>
          {tip.modifiers.map((modifier) => (
            <Button
              key={modifier}
              emphasis="tertiary"
              size="small"
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

  return (
    <div className={styles['search-tip-bar']}>
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
