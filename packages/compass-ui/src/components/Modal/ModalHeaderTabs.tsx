import styles from './Modal.module.scss';

export interface ModalHeaderTabItem {
  key: string;
  label: string;
}

export interface ModalHeaderTabsProps {
  tabs: ModalHeaderTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  ariaLabel?: string;
}

export default function ModalHeaderTabs({
  tabs,
  activeKey,
  onChange,
  ariaLabel = 'Modal sections',
}: ModalHeaderTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={styles['modal__header-tabs']}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={[
              styles['modal__header-tab'],
              isActive ? styles['modal__header-tab--active'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
