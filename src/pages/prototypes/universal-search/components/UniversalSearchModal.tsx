import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Dropdown } from '@mattermost/compass-ui/components/dropdown';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Modal, ModalOverlay } from '@mattermost/compass-ui/components/modal';
import { SearchInput } from '@mattermost/compass-ui/components/search-input';
import { SegmentedControl } from '@mattermost/compass-ui/components/segmented-control';
import type { SearchTab } from '../universalSearchScenes';
import { SearchResults } from './SearchListRows';
import SearchTipBar, { type SearchTip } from './SearchTipBar';
import styles from './UniversalSearchModal.module.scss';

const TABS: { key: SearchTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'channels', label: 'Channels' },
  { key: 'messages', label: 'Messages' },
  { key: 'files', label: 'Files' },
  { key: 'people', label: 'People' },
  { key: 'copilot', label: 'Agents' },
];

export type SearchChip = {
  id: string;
  label: string;
};

type UniversalSearchModalProps = {
  open: boolean;
  container: HTMLElement | null;
  overlayClassName?: string;
  activeTab: SearchTab;
  query: string;
  placeholder: string;
  chips?: SearchChip[];
  tip: SearchTip;
  children: ReactNode;
  onClose: () => void;
  onTabChange: (tab: SearchTab) => void;
  onQueryChange: (value: string) => void;
  onClearQuery?: () => void;
  onChipRemove?: (id: string) => void;
  onSubmitQuery?: () => void;
};

export default function UniversalSearchModal({
  open,
  container,
  overlayClassName,
  activeTab,
  query,
  placeholder,
  chips = [],
  tip,
  children,
  onClose,
  onTabChange,
  onQueryChange,
  onClearQuery,
  onChipRemove,
  onSubmitQuery,
}: UniversalSearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listSignature = useRef<string | null>(null);
  const previousTab = useRef(activeTab);
  const wasOpen = useRef(open);
  const enterFrom = useRef<'forward' | 'back' | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [listGeneration, setListGeneration] = useState(0);
  const [optionCount, setOptionCount] = useState(0);

  const moveActive = (delta: number) => {
    const count =
      listRef.current?.querySelectorAll('[role="option"]').length ?? 0;
    if (count === 0) return;
    setActiveIndex((current) => (current + delta + count) % count);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      onSubmitQuery?.();
    }
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    moveActive(event.key === 'ArrowDown' ? 1 : -1);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open, activeTab]);

  useLayoutEffect(() => {
    const options = listRef.current?.querySelectorAll('[role="option"]');
    const count = options?.length ?? 0;
    const signature = options
      ? [...options].map((option) => option.textContent ?? '').join('\n')
      : '';
    setOptionCount(count);
    if (listSignature.current === null) {
      listSignature.current = signature;
      return;
    }
    if (listSignature.current === signature) return;
    listSignature.current = signature;
    setActiveIndex(0);
    setListGeneration((current) => current + 1);
  }, [activeTab, children, chips, open, query]);

  useEffect(() => {
    const option =
      listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[
        activeIndex
      ];
    option?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (previousTab.current !== activeTab) {
    const delta =
      TABS.findIndex((tab) => tab.key === activeTab) -
      TABS.findIndex((tab) => tab.key === previousTab.current);
    enterFrom.current =
      open && wasOpen.current && delta !== 0
        ? delta > 0
          ? 'forward'
          : 'back'
        : null;
    previousTab.current = activeTab;
  }
  wasOpen.current = open;

  const activeOptionId =
    optionCount > 0 ? `universal-search-option-${activeIndex}` : undefined;

  return (
    <ModalOverlay
      open={open}
      container={container}
      lockScroll={false}
      className={overlayClassName}
      onClose={onClose}
    >
      <Modal
        open={open}
        className={styles['universal-search-modal']}
        size="medium"
        title="Search"
        bodyPadding="menu"
        headerDivider={false}
        onClose={onClose}
        initialFocusRef={inputRef}
        headerLeading={
          <SegmentedControl
            aria-label="Search modes"
            options={TABS.map((tab) => ({
              ...tab,
              icon:
                tab.key === 'copilot' ? (
                  <Icon glyph={<CreationOutlineIcon />} size="12" />
                ) : undefined,
            }))}
            value={activeTab}
            onChange={(key) => onTabChange(key as SearchTab)}
          />
        }
        headerAction={<Dropdown size="small">All teams</Dropdown>}
        headerSlot={
          <div className={styles['universal-search-modal__header']}>
            <div className={styles['universal-search-modal__search-row']}>
              {chips.length > 0 && (
                <div className={styles['universal-search-modal__chips']}>
                  {chips.map((chip) => (
                    <Chip
                      key={chip.id}
                      size="small"
                      onRemove={
                        onChipRemove
                          ? () => onChipRemove(chip.id)
                          : undefined
                      }
                    >
                      {chip.label}
                    </Chip>
                  ))}
                </div>
              )}
              <div className={styles['universal-search-modal__field']}>
                <SearchInput
                  ref={inputRef}
                  size="large"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={optionCount > 0}
                  aria-controls="universal-search-results"
                  aria-activedescendant={activeOptionId}
                  value={query}
                  placeholder={placeholder}
                  aria-label={placeholder}
                  onChange={(event) => onQueryChange(event.target.value)}
                  onClear={onClearQuery}
                  onKeyDown={handleInputKeyDown}
                />
              </div>
            </div>
          </div>
        }
        footerLeading={<SearchTipBar tip={tip} />}
        footerType="pagination"
        footerDivider
      >
        <SearchResults
          activeIndex={activeIndex}
          generation={listGeneration}
          onActiveIndexChange={setActiveIndex}
        >
          <div className={styles['universal-search-modal__stage']}>
            <div
              key={activeTab}
              ref={listRef}
              id="universal-search-results"
              className={[
                styles['universal-search-modal__list'],
                enterFrom.current === 'forward'
                  ? styles['universal-search-modal__list--enter-forward']
                  : '',
                enterFrom.current === 'back'
                  ? styles['universal-search-modal__list--enter-back']
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              role="listbox"
              tabIndex={-1}
              aria-label="Search results"
              onKeyDown={handleListKeyDown}
            >
              {children}
            </div>
          </div>
        </SearchResults>
      </Modal>
    </ModalOverlay>
  );
}
