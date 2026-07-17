import { type ChangeEvent, type ReactNode } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronUpIcon from '@mattermost/compass-icons/components/chevron-up';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import MattermostIcon from '@mattermost/compass-icons/components/mattermost';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import IconButton from '@/components/IconButton/IconButton';
import Tag from '@/components/Tag/Tag';
import Switch from '@/components/Switch/Switch';
import styles from './AdminPanelHeader.module.scss';

/** System Console admin panel expand/collapse (`expandedState` in Figma). */
export type AdminPanelExpandedState = 'Collapsed' | 'Expanded';

export interface AdminPanelHeaderProps {
  /** Passed to the title `h2` for `aria-labelledby` on the parent panel. */
  titleId: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Trailing accessory actions rendered after Switch / Primary button and before expand. */
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
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  /** Bottom border under the header row (hidden when expandable and collapsed). */
  showDivider?: boolean;
  className?: string;
}

/**
 * Titled rail for a System Console settings section: optional leading icon, tags,
 * subtitle, and trailing controls.
 */
export default function AdminPanelHeader({
  titleId,
  title,
  subtitle,
  headerActions,
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
  isExpanded = false,
  onToggleExpand,
  showDivider = true,
  className = '',
}: AdminPanelHeaderProps) {
  const hasActions =
    showSwitch || showButton || headerActions != null || expandable;

  const defaultLeading = <Icon size="20" glyph={<CogOutlineIcon />} />;

  return (
    <header
      className={[
        styles['admin-panel-header'],
        showDivider ? styles['admin-panel-header--divided'] : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')
        .trim()}
    >
      <div className={styles['admin-panel-header__main']}>
        <div className={styles['admin-panel-header__start']}>
          {iconLeft ? (
            <div
              className={styles['admin-panel-header__leading']}
              aria-hidden
            >
              {leadingIcon ?? defaultLeading}
            </div>
          ) : null}
          <div className={styles['admin-panel-header__title-stack']}>
            <div className={styles['admin-panel-header__title-row']}>
              <h2
                id={titleId}
                className={styles['admin-panel-header__title']}
              >
                {title}
              </h2>
              {showEnterpriseLabel ? (
                <Tag
                  label={enterpriseLabel}
                  size="X-Small"
                  type="Default"
                  leadingIcon={<Icon size="10" glyph={<MattermostIcon />} />}
                />
              ) : null}
              {showBeta ? (
                <Tag label={betaLabel} size="X-Small" type="Default" />
              ) : null}
            </div>
            {subtitle != null ? (
              <p className={styles['admin-panel-header__subtitle']}>
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {hasActions ? (
          <div className={styles['admin-panel-header__actions']}>
            {showSwitch ? (
              <Switch
                size="Medium"
                checked={switchChecked}
                defaultChecked={defaultSwitchChecked}
                disabled={switchDisabled}
                onChange={(e) => {
                  onSwitchChange?.(e.target.checked, e);
                }}
              >
                {switchLabel}
              </Switch>
            ) : null}
            {showButton ? (
              <Button
                type="button"
                size="Medium"
                emphasis="Primary"
                onClick={onButtonClick}
              >
                {buttonLabel}
              </Button>
            ) : null}
            {headerActions}
            {expandable ? (
              <IconButton
                type="button"
                style="Default"
                size="Medium"
                aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
                aria-expanded={isExpanded}
                onClick={onToggleExpand}
                icon={
                  <Icon
                    size="20"
                    glyph={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  />
                }
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
