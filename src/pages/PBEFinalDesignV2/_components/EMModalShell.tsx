import type { ReactNode } from 'react';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import Modal from '@/components/ui/Modal/Modal';
import Tabs from '@/components/ui/Tabs/Tabs';
import StackedModalLayer from './StackedModalLayer';
import styles from './EMModalShell.module.scss';

export type EMTab = 'configurations' | 'channels';

export interface EMModalShellProps {
  /** Currently active tab. */
  activeTab: EMTab;
  /** Called when the user switches tabs. */
  onTabChange: (tab: EMTab) => void;
  /** Called when the modal is dismissed. */
  onClose: () => void;
  /** Tab content. */
  children: ReactNode;
  /** Optional sub-modal stacked above (e.g. Add Configuration form). */
  subModal?: ReactNode;
}

/**
 * Encryption Management modal shell (gap G5). Wraps dest `Modal`
 * (`size="Large"` = 832px per plan recommendation; override to 880px later
 * if Figma visual review demands) with a shield-icon title and the
 * Configurations / My Channels tab strip pinned to the top of the body.
 *
 * Sub-modals (Add/Edit Configuration) render through `StackedModalLayer`
 * which sits above this modal's overlay.
 */
export default function EMModalShell({
  activeTab,
  onTabChange,
  onClose,
  children,
  subModal,
}: EMModalShellProps) {
  return (
    <div className={styles['em-modal-shell']}>
      <div className={styles['em-modal-shell__overlay']}>
        <div className={styles['em-modal-shell__dialog']}>
          <Modal
            size="Large"
            onClose={onClose}
            title={
              <span className={styles['em-modal-shell__title']}>
                <ShieldOutlineIcon size={20} aria-hidden />
                <span className={styles['em-modal-shell__title-label']}>
                  Encryption Management
                </span>
              </span>
            }
            headerDivider={false}
            footerDivider={false}
            noBodyPadding
          >
            <div className={styles['em-modal-shell__tabs']}>
              <Tabs
                tabs={[
                  {
                    key: 'configurations',
                    label: 'Configurations',
                    countBadge: 1,
                  },
                  { key: 'channels', label: 'My Channels', countBadge: 2 },
                ]}
                activeKey={activeTab}
                onChange={(k) => onTabChange(k as EMTab)}
              />
            </div>
            <div className={styles['em-modal-shell__content']}>{children}</div>
          </Modal>
        </div>
      </div>

      {subModal && <StackedModalLayer>{subModal}</StackedModalLayer>}
    </div>
  );
}
