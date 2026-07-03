import type { ReactNode } from 'react';
import GlobalHeader from '@/components/ui/GlobalHeader/GlobalHeader';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import AutomationsTabs from './AutomationsTabs';
import styles from './AgentsShell.module.scss';

export type AgentsProductNavTab = 'agents' | 'automations';

export interface AgentsProductNav {
  active: AgentsProductNavTab;
  onChange: (tab: AgentsProductNavTab) => void;
}

const PRODUCT_NAV_TABS = [
  { key: 'agents', label: 'Agents' },
  { key: 'automations', label: 'Automations' },
] as const;

export interface AgentsShellProps {
  /** Main content area below the global header (e.g. the Edit Agent view). */
  children: ReactNode;
  /** Layered surface over the shell (e.g. a modal). */
  overlay?: ReactNode;
  /** Remove inner padding so list views can align to the shell edge. */
  flushContent?: boolean;
  /** Top-level Agents product navigation (index screens only). */
  productNav?: AgentsProductNav;
}

/**
 * Standalone Agents app frame (Figma `4304-32132`): the Agents global header
 * over a full-bleed main content area — the same windowed panel as the channel
 * scenes, without the team/channel sidebars.
 */
export default function AgentsShell({
  children,
  overlay,
  flushContent = false,
  productNav,
}: AgentsShellProps) {
  const contentClass = [
    styles['agents-shell__content'],
    flushContent ? styles['agents-shell__content--flush'] : '',
    productNav ? styles['agents-shell__content--with-product-nav'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles['agents-shell']}>
      <div className={styles['agents-shell__global-header']}>
        <GlobalHeader
          product="Agents"
          userAvatarSrc={avatarLeonard}
          userAvatarAlt="Leonard Riley"
        />
      </div>

      <div className={styles['agents-shell__body']}>
        <div className={styles['agents-shell__inner']}>
          {productNav ? (
            <div className={styles['agents-shell__product-nav']}>
              <AutomationsTabs
                tabs={PRODUCT_NAV_TABS.map((tab) => ({
                  key: tab.key,
                  label: tab.label,
                }))}
                activeKey={productNav.active}
                onChange={(key) =>
                  productNav.onChange(key as AgentsProductNavTab)
                }
                ariaLabel="Agents product"
                showDivider={false}
              />
            </div>
          ) : null}
          <div className={contentClass}>{children}</div>
        </div>
      </div>

      {overlay}
    </div>
  );
}
