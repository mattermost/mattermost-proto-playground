import PlusIcon from '@mattermost/compass-icons/components/plus';
import FilePdfOutlineIcon from '@mattermost/compass-icons/components/file-pdf-outline';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import styles from './BookmarksBar.module.scss';

const DESIGN_BOARD_ICON_SRC =
  'https://www.figma.com/api/mcp/asset/7f92b797-96c8-466b-91aa-984a7de34e42.png';

export interface BookmarkItem {
  id: string;
  label: string;
  kind: 'avatar' | 'pdf';
  avatarSrc?: string;
  avatarAlt?: string;
}

export const DEMO_BOOKMARKS: BookmarkItem[] = [
  {
    id: 'mission-tracker',
    label: 'Mission Tracker',
    kind: 'avatar',
    avatarSrc: DESIGN_BOARD_ICON_SRC,
    avatarAlt: 'Jira mission tracker',
  },
  {
    id: 'command-frago',
    label: 'Command FRAGO — 16 Mar',
    kind: 'pdf',
  },
];

export interface BookmarksBarProps {
  items?: BookmarkItem[];
  className?: string;
  onAddBookmark?: () => void;
  onBookmarkClick?: (id: string) => void;
}

export default function BookmarksBar({
  items = DEMO_BOOKMARKS,
  className = '',
  onAddBookmark,
  onBookmarkClick,
}: BookmarksBarProps) {
  const rootClass = [styles['bookmarks-bar'], className].filter(Boolean).join(' ');

  return (
    <nav className={rootClass} aria-label="Channel bookmarks">
      <div className={styles['bookmarks-bar__items']}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={styles['bookmarks-bar__item']}
            onClick={() => onBookmarkClick?.(item.id)}
          >
            {item.kind === 'avatar' && item.avatarSrc ? (
              <span className={styles['bookmarks-bar__item-icon']}>
                <img
                  className={styles['bookmarks-bar__item-avatar']}
                  src={item.avatarSrc}
                  alt={item.avatarAlt ?? ''}
                  width={12}
                  height={12}
                />
              </span>
            ) : (
              <span className={styles['bookmarks-bar__item-icon']}>
                <Icon
                  size="12"
                  glyph={
                    <FilePdfOutlineIcon
                      style={{ color: 'var(--attachment-red)' }}
                    />
                  }
                />
              </span>
            )}
            <span className={styles['bookmarks-bar__item-label']}>{item.label}</span>
          </button>
        ))}
        <IconButton
          className={styles['bookmarks-bar__add']}
          size="X-Small"
          padding="Compact"
          aria-label="Add a bookmark"
          icon={<Icon size="16" glyph={<PlusIcon />} />}
          onClick={onAddBookmark}
        />
      </div>
    </nav>
  );
}
