import { useId, useState, type ChangeEvent, type ReactNode } from 'react';
import AdminPanelHeader, {
  type AdminPanelExpandedState,
} from '@/components/AdminPanelHeader/AdminPanelHeader';
import styles from './AdminPanel.module.scss';

export type { AdminPanelExpandedState };

export interface AdminPanelProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
  headerActions?: ReactNode;
  iconLeft?: boolean;
  leadingIcon?: ReactNode;
  showBeta?: boolean;
  betaLabel?: string;
  showEnterpriseLabel?: boolean;
  enterpriseLabel?: string;
  showButton?: boolean;
  buttonLabel?: string;
  onButtonClick?: () => void;
  showSwitch?: boolean;
  switchLabel?: ReactNode;
  switchChecked?: boolean;
  defaultSwitchChecked?: boolean;
  onSwitchChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  switchDisabled?: boolean;
  expandable?: boolean;
  expandedState?: AdminPanelExpandedState;
  defaultExpandedState?: AdminPanelExpandedState;
  onExpandedStateChange?: (state: AdminPanelExpandedState) => void;
}

/**
 * System Console admin settings panel: `AdminPanelHeader` plus a body slot
 * for grouped fields. Expand/collapse state is owned here and passed to the header.
 */
export default function AdminPanel({
  title,
  subtitle,
  headerActions,
  children,
  className = '',
  iconLeft = false,
  leadingIcon,
  showBeta = false,
  betaLabel = 'Beta',
  showEnterpriseLabel = false,
  enterpriseLabel = 'Enterprise',
  showButton = false,
  buttonLabel = 'Button',
  onButtonClick,
  showSwitch = false,
  switchLabel = 'Off',
  switchChecked,
  defaultSwitchChecked,
  onSwitchChange,
  switchDisabled,
  expandable = false,
  expandedState: expandedStateProp,
  defaultExpandedState = 'Collapsed',
  onExpandedStateChange,
}: AdminPanelProps) {
  const titleId = useId();

  const [uncontrolledExpanded, setUncontrolledExpanded] =
    useState<AdminPanelExpandedState>(defaultExpandedState);

  const isExpandControlled = expandable && expandedStateProp !== undefined;
  const resolvedExpandedState: AdminPanelExpandedState = !expandable
    ? 'Expanded'
    : isExpandControlled
      ? expandedStateProp!
      : uncontrolledExpanded;

  const isExpanded = resolvedExpandedState === 'Expanded';

  const setExpandedState = (next: AdminPanelExpandedState) => {
    if (!expandable) return;
    if (!isExpandControlled) {
      setUncontrolledExpanded(next);
    }
    onExpandedStateChange?.(next);
  };

  const toggleExpanded = () => {
    setExpandedState(isExpanded ? 'Collapsed' : 'Expanded');
  };

  const showHeaderDivider = !expandable || isExpanded;

  return (
    <section
      className={[styles['admin-panel'], className].join(' ').trim()}
      aria-labelledby={titleId}
    >
      <AdminPanelHeader
        titleId={titleId}
        title={title}
        subtitle={subtitle}
        headerActions={headerActions}
        iconLeft={iconLeft}
        leadingIcon={leadingIcon}
        showBeta={showBeta}
        betaLabel={betaLabel}
        showEnterpriseLabel={showEnterpriseLabel}
        enterpriseLabel={enterpriseLabel}
        showButton={showButton}
        buttonLabel={buttonLabel}
        onButtonClick={onButtonClick}
        showSwitch={showSwitch}
        switchLabel={switchLabel}
        switchChecked={switchChecked}
        defaultSwitchChecked={defaultSwitchChecked}
        onSwitchChange={onSwitchChange}
        switchDisabled={switchDisabled}
        expandable={expandable}
        isExpanded={isExpanded}
        onToggleExpand={toggleExpanded}
        showDivider={showHeaderDivider}
      />
      {expandable ? (
        <div
          className={[
            styles['admin-panel__collapse'],
            isExpanded ? styles['admin-panel__collapse--expanded'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden={!isExpanded}
        >
          <div className={styles['admin-panel__collapse-inner']}>
            <div className={styles['admin-panel__body']}>{children}</div>
          </div>
        </div>
      ) : (
        <div className={styles['admin-panel__body']}>{children}</div>
      )}
    </section>
  );
}
