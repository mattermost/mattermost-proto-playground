import type { ReactNode } from 'react';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import { WithTooltip } from '@mattermost/compass-proto';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import styles from './SettingsPage.module.scss';

interface SaveBarProps {
  /** Show the bar. Like the Agents plugin, it appears only when there is something to save. */
  visible: boolean;
  onSave: () => void;
  onDiscard: () => void;
  saveDisabled?: boolean;
  message?: ReactNode;
}

interface SettingsPageProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Shows a back button before the title (sub-pages). */
  onBack?: () => void;
  backLabel?: string;
  headerActions?: ReactNode;
  saveBar?: SaveBarProps;
  children: ReactNode;
}

/**
 * Page layout borrowed from the Agents plugin's settings view
 * (mattermost-plugin-agents `components/agents/settings/agents_settings_page.tsx`
 * and the back button from `agent_config_view.tsx`): one centered 960px
 * column, a roomy page header, and a sticky save bar that shows only while
 * there are unsaved changes.
 */
export default function SettingsPage({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  headerActions,
  saveBar,
  children,
}: SettingsPageProps) {
  return (
    <div className={styles['settings-page']}>
      <Scrollbar className={styles['settings-page__scroll']}>
        <div className={styles['settings-page__container']}>
          <header className={styles['settings-page__header']}>
            <div className={styles['settings-page__leading']}>
              {onBack && (
                <WithTooltip label={backLabel}>
                  <IconButton
                    className={styles['settings-page__back']}
                    size="small"
                    icon={<Icon glyph={<ArrowLeftIcon />} />}
                    aria-label={backLabel}
                    onClick={onBack}
                  />
                </WithTooltip>
              )}
              <div className={styles['settings-page__titles']}>
                <h1 className={styles['settings-page__title']}>{title}</h1>
                {subtitle && (
                  <p className={styles['settings-page__subtitle']}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {headerActions && (
              <div className={styles['settings-page__actions']}>
                {headerActions}
              </div>
            )}
          </header>
          <div className={styles['settings-page__body']}>{children}</div>
        </div>
      </Scrollbar>
      {saveBar?.visible && (
        <section
          className={styles['settings-page__save-bar']}
          aria-label="Unsaved changes"
        >
          <div className={styles['settings-page__save-bar-content']}>
            <div
              className={styles['settings-page__save-bar-message']}
              role="status"
            >
              {saveBar.message ?? 'You have unsaved changes'}
            </div>
            <Button emphasis="tertiary" onClick={saveBar.onDiscard}>
              Discard
            </Button>
            <Button
              emphasis="primary"
              onClick={saveBar.onSave}
              disabled={saveBar.saveDisabled}
            >
              Save
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
