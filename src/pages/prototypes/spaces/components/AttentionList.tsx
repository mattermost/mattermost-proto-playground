import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import FlagOutlineIcon from '@mattermost/compass-icons/components/flag-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import { PEOPLE } from '../spacesData';
import type { AttentionItem } from '../spacesStory';
import styles from '../Spaces.module.scss';

const ICON = {
  decision: { glyph: <FlagOutlineIcon />, tone: 'danger' },
  blocked: { glyph: <AlertOutlineIcon />, tone: 'warning' },
  agent: { glyph: <CreationOutlineIcon />, tone: 'info' },
  incident: { glyph: <ShieldOutlineIcon />, tone: 'warning' },
} as const;

export interface AttentionListProps {
  items: AttentionItem[];
  onAction?: (item: AttentionItem) => void;
  actionLabel?: (item: AttentionItem) => string | null;
  /** Label each row with where it comes from (day view, across Spaces). */
  sourceLabel?: string;
}

export function AttentionList({
  items,
  onAction,
  actionLabel,
  sourceLabel,
}: AttentionListProps) {
  return (
    <ul className={styles['spaces__list']}>
      {items.map((item) => {
        const icon = ICON[item.kind];
        const owner = PEOPLE[item.ownerId]!;
        const label = actionLabel?.(item);
        return (
          <li key={item.id} className={styles['spaces__row']}>
            <span
              className={`${styles['spaces__icon-tile']} ${styles[`spaces__icon-tile--${icon.tone}`]}`}
              aria-hidden
            >
              <Icon glyph={icon.glyph} size="20" />
            </span>
            <div className={styles['spaces__row-main']}>
              <span className={styles['spaces__row-title']}>{item.title}</span>
              <span className={styles['spaces__row-meta']}>{item.detail}</span>
              <span className={styles['spaces__row-meta']}>
                {sourceLabel ? `${sourceLabel} · ` : ''}
                {item.waiting} · with {owner.name}
              </span>
            </div>
            <div className={styles['spaces__row-end']}>
              <UserAvatar src={owner.avatar} alt={owner.name} size="24" />
              {label && onAction ? (
                <Button
                  emphasis="tertiary"
                  size="small"
                  onClick={() => onAction(item)}
                >
                  {label}
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
