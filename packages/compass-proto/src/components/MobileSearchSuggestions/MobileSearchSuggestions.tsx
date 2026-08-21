import {useState} from 'react';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import PlusBoxOutlineIcon from '@mattermost/compass-icons/components/plus-box-outline';
import { Icon } from '@mattermost/compass-ui';
import MobileMenuItem from '@/components/MobileMenuItem/MobileMenuItem';
import styles from './MobileSearchSuggestions.module.scss';

export interface MobileSearchOption {
  id: string;
  /** Bold modifier prefix, e.g. “From:”. */
  modifier: string;
  /** Rest of the row copy, e.g. “ a specific user”. */
  description: string;
  onClick?: () => void;
}

export interface MobileSearchRecentItem {
  id: string;
  query: string;
  onSelect?: () => void;
  onRemove?: () => void;
}

export interface MobileSearchSuggestionsProps {
  options?: MobileSearchOption[];
  recent?: MobileSearchRecentItem[];
  onShowMore?: () => void;
  showMoreLabel?: string;
  className?: string;
}

const DEFAULT_OPTIONS: MobileSearchOption[] = [
  {id: 'from', modifier: 'From:', description: ' a specific user'},
  {id: 'in', modifier: 'In:', description: ' a specific channel'},
  {id: 'on', modifier: 'On:', description: ' a specific date'},
];

const DEFAULT_RECENT: MobileSearchRecentItem[] = [
  {id: '1', query: 'Welcome in:town-square'},
  {id: '2', query: 'Figma'},
  {id: '3', query: 'RC Test from:amy.blais'},
];

function OptionLabel({
  modifier,
  description,
}: {
  modifier: string;
  description: string;
}) {
  return (
    <>
      <span className={styles['mobile-search-suggestions__modifier']}>
        {modifier}
      </span>
      {description}
    </>
  );
}

/**
 * Idle Search sheet content — modifiers and recent history.
 *
 * @see https://www.figma.com/design/Z0s8A8qSfNZ10lVxGM0XPp/MM-39758-Search-UX---Phase-1?node-id=201-39695
 */
export default function MobileSearchSuggestions({
  options = DEFAULT_OPTIONS,
  recent: recentProp,
  onShowMore,
  showMoreLabel = 'Show more',
  className = '',
}: MobileSearchSuggestionsProps) {
  const [recent, setRecent] = useState<MobileSearchRecentItem[]>(
    () => recentProp ?? DEFAULT_RECENT,
  );

  const rootClass = [styles['mobile-search-suggestions'], className]
    .filter(Boolean)
    .join(' ');

  const handleRemove = (item: MobileSearchRecentItem) => {
    if (item.onRemove) {
      item.onRemove();
      return;
    }
    setRecent((prev) => prev.filter((entry) => entry.id !== item.id));
  };

  return (
    <div className={rootClass}>
      <section className={styles['mobile-search-suggestions__section']}>
        <h2 className={styles['mobile-search-suggestions__heading']}>
          Search options
        </h2>
        {options.map((option) => (
          <MobileMenuItem
            key={option.id}
            label={
              <OptionLabel
                modifier={option.modifier}
                description={option.description}
              />
            }
            leadingVisual={<Icon size='20' glyph={<PlusBoxOutlineIcon />} />}
            onClick={option.onClick}
          />
        ))}
        <button
          type='button'
          className={styles['mobile-search-suggestions__show-more']}
          onClick={onShowMore}
        >
          {showMoreLabel}
        </button>
      </section>

      <div
        className={styles['mobile-search-suggestions__divider']}
        role='separator'
      >
        <hr className={styles['mobile-search-suggestions__divider-line']} />
      </div>

      <section className={styles['mobile-search-suggestions__section']}>
        <h2 className={styles['mobile-search-suggestions__heading']}>
          Recent searches
        </h2>
        {recent.map((item) => (
          <MobileMenuItem
            key={item.id}
            label={item.query}
            leadingVisual={<Icon size='20' glyph={<ClockOutlineIcon />} />}
            trailingElement
            trailingVisual={
              <span
                className={styles['mobile-search-suggestions__remove']}
                data-remove
                aria-hidden
              >
                <Icon size='16' glyph={<CloseIcon />} />
              </span>
            }
            aria-label={item.query}
            onClick={(event) => {
              const target = event.target as HTMLElement;
              if (target.closest('[data-remove]')) {
                handleRemove(item);
                return;
              }
              item.onSelect?.();
            }}
          />
        ))}
      </section>
    </div>
  );
}
