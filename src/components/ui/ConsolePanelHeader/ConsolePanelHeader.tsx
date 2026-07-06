import { useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import ChevronUpIcon from '@mattermost/compass-icons/components/chevron-up';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Switch from '@/components/ui/Switch/Switch';
import styles from './ConsolePanelHeader.module.scss';

export interface ConsolePanelHeaderProps {
  /** Section title (required). */
  title: string;
  /** Section subtitle / description. */
  subtitle?: string;
  /** Compass icon element shown in a circular container on the left. */
  icon?: ReactNode;
  /** Show an "Enterprise" license tag next to the title. */
  enterpriseTag?: boolean;
  /** Show a "Beta" tag next to the title. */
  betaTag?: boolean;
  /** Show a switch toggle in the actions area. */
  showSwitch?: boolean;
  /** Switch checked state (controlled). */
  switchChecked?: boolean;
  /** Switch change handler. */
  onSwitchChange?: (checked: boolean) => void;
  /** Show a primary action button. */
  buttonLabel?: string;
  /** Optional leading icon for the action button. */
  buttonIcon?: ReactNode;
  /** Button click handler. */
  onButtonClick?: () => void;
  /** Whether the panel is expandable (shows chevron toggle). */
  expandable?: boolean;
  /** Whether the panel body is expanded. Controlled externally when provided. */
  expanded?: boolean;
  /** Callback when the expand toggle is clicked. */
  onExpandToggle?: (expanded: boolean) => void;
  /** Optional trailing content in the actions cluster (before expand chevron). */
  trailing?: ReactNode;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * System Console panel header — the top section of a settings panel.
 * Shows title, subtitle, an optional left icon, optional Enterprise / Beta
 * tags, and an actions cluster (Switch, primary button, expand chevron).
 *
 * Can be used standalone or via ConsolePanel, which wraps it with a body slot.
 *
 * @see Figma: Compass System Console → Panel Header
 */
export default function ConsolePanelHeader({
  title,
  subtitle,
  icon,
  enterpriseTag = false,
  betaTag = false,
  showSwitch = false,
  switchChecked,
  onSwitchChange,
  buttonLabel,
  buttonIcon,
  onButtonClick,
  expandable = false,
  expanded: expandedProp,
  onExpandToggle,
  trailing,
  className = '',
}: ConsolePanelHeaderProps) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const expanded = expandedProp ?? internalExpanded;

  const handleExpandToggle = () => {
    const next = !expanded;
    setInternalExpanded(next);
    onExpandToggle?.(next);
  };

  const hasActions =
    showSwitch || buttonLabel != null || trailing != null || expandable;

  const rootClass = [styles['console-panel-header'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['console-panel-header__content']}>
        <div className={styles['console-panel-header__left']}>
          {icon != null && (
            <div className={styles['console-panel-header__icon-container']}>
              <Icon size="20" glyph={icon} />
            </div>
          )}
          <div className={styles['console-panel-header__title-area']}>
            <div className={styles['console-panel-header__title-row']}>
              <h2 className={styles['console-panel-header__title']}>{title}</h2>
              {enterpriseTag && (
                <span
                  className={[
                    styles['console-panel-header__tag'],
                    styles['console-panel-header__tag--enterprise'],
                  ].join(' ')}
                >
                  Enterprise
                </span>
              )}
              {betaTag && (
                <span
                  className={[
                    styles['console-panel-header__tag'],
                    styles['console-panel-header__tag--beta'],
                  ].join(' ')}
                >
                  Beta
                </span>
              )}
            </div>
            {subtitle != null && (
              <p className={styles['console-panel-header__subtitle']}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {hasActions && (
          <div className={styles['console-panel-header__actions']}>
            {showSwitch && (
              <Switch
                size="Medium"
                checked={switchChecked}
                onChange={
                  onSwitchChange
                    ? (e: ChangeEvent<HTMLInputElement>) =>
                        onSwitchChange(e.currentTarget.checked)
                    : undefined
                }
              />
            )}
            {buttonLabel != null && (
              <Button
                emphasis="Primary"
                onClick={onButtonClick}
                leadingIcon={
                  buttonIcon != null ? (
                    <Icon size="16" glyph={buttonIcon} />
                  ) : undefined
                }
              >
                {buttonLabel}
              </Button>
            )}
            {trailing}
            {expandable && (
              <IconButton
                size="Medium"
                aria-label={expanded ? 'Collapse' : 'Expand'}
                icon={
                  <Icon
                    size="20"
                    glyph={expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  />
                }
                onClick={handleExpandToggle}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
