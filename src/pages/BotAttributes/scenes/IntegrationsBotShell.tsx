import type { ReactNode } from 'react';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import styles from './IntegrationsBotShell.module.scss';

const INTEGRATION_NAV = [
  { id: 'incoming', label: 'Incoming Webhooks' },
  { id: 'outgoing', label: 'Outgoing Webhooks' },
  { id: 'slash', label: 'Slash Commands' },
  { id: 'oauth', label: 'OAuth 2.0 Applications' },
  { id: 'bot-accounts', label: 'Bot Accounts' },
] as const;

export type IntegrationsBotView = 'list' | 'add';

type IntegrationsBotShellProps = {
  children: ReactNode;
  view?: IntegrationsBotView;
  /** Right side of the page header (e.g. Add Bot Account). */
  headerAction?: ReactNode;
  onBackToList?: () => void;
};

/**
 * Integrations backstage chrome — Bot Accounts list or Add.
 */
export default function IntegrationsBotShell({
  children,
  view = 'add',
  headerAction,
  onBackToList,
}: IntegrationsBotShellProps) {
  const isAdd = view === 'add';

  return (
    <div className={styles['integrations']}>
      <header className={styles['integrations__navbar']}>
        <a href="#back" className={styles['integrations__back']}>
          ← Back to Mattermost
        </a>
      </header>
      <div className={styles['integrations__body']}>
        <aside
          className={styles['integrations__sidebar']}
          aria-label="Integrations"
        >
          <div className={styles['integrations__category']}>
            <p className={styles['integrations__category-title']}>
              Integrations
            </p>
            <ul className={styles['integrations__nav']}>
              {INTEGRATION_NAV.map((item) => (
                <li key={item.id}>
                  <span
                    className={[
                      styles['integrations__nav-item'],
                      item.id === 'bot-accounts'
                        ? styles['integrations__nav-item--active']
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div className={styles['integrations__main']}>
          <Scrollbars>
            <div className={styles['integrations__main-inner']}>
              <div className={styles['integrations__content']}>
                <div className={styles['integrations__header']}>
                  <h1
                    className={[
                      styles['integrations__heading'],
                      isAdd ? styles['integrations__heading--add'] : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {isAdd ? (
                      <>
                        <button
                          type="button"
                          className={styles['integrations__heading-parent']}
                          onClick={onBackToList}
                        >
                          Bot Accounts
                        </button>
                        <span
                          className={styles['integrations__heading-sep']}
                          aria-hidden
                        >
                          ›
                        </span>
                        <span>Add</span>
                      </>
                    ) : (
                      <span>Bot Accounts</span>
                    )}
                  </h1>
                  {headerAction}
                </div>
                <div
                  className={
                    isAdd
                      ? styles['integrations__form']
                      : styles['integrations__panel']
                  }
                >
                  {children}
                </div>
              </div>
            </div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
}
