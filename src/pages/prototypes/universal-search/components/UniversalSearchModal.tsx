import { useEffect, useRef, type ReactNode } from 'react';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Modal, ModalOverlay } from '@mattermost/compass-ui/components/modal';
import { SearchInput } from '@mattermost/compass-ui/components/search-input';
import { Tabs } from '@mattermost/compass-ui/components/tabs';
import type { SearchTab } from '../universalSearchScenes';
import SearchTipBar, { type SearchTip } from './SearchTipBar';
import styles from './UniversalSearchModal.module.scss';

const TABS: { key: SearchTab; label: string }[] = [
  { key: 'channels', label: 'Channels' },
  { key: 'messages', label: 'Messages' },
  { key: 'files', label: 'Files' },
  { key: 'people', label: 'People' },
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
  showEnterHint?: boolean;
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
  showEnterHint = false,
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

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open, activeTab]);

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
        size="medium"
        title="Search"
        hideTitle
        bodyPadding="menu"
        onClose={onClose}
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
              <div
                className={[
                  styles['universal-search-modal__field'],
                  showEnterHint &&
                    styles['universal-search-modal__field--with-hint'],
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <SearchInput
                  ref={inputRef}
                  value={query}
                  label={placeholder}
                  onChange={(event) => onQueryChange(event.target.value)}
                  onClear={onClearQuery}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      onSubmitQuery?.();
                    }
                  }}
                />
                {showEnterHint && (
                  <p
                    className={styles['universal-search-modal__enter-hint']}
                    aria-hidden
                  >
                    Enter to search
                  </p>
                )}
              </div>
            </div>
            <Tabs
              appearance="underlined"
              activeKey={activeTab}
              onChange={(key) => onTabChange(key as SearchTab)}
              tabs={TABS}
              aria-label="Search modes"
            />
          </div>
        }
        footerLeading={<SearchTipBar tip={tip} />}
        footerType="pagination"
        footerDivider
      >
        <div className={styles['universal-search-modal__list']}>{children}</div>
      </Modal>
    </ModalOverlay>
  );
}
