import type { ReactNode } from 'react';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import sidebarStyles from '@/components/ui/ConsoleSidebar/ConsoleSidebar.module.scss';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  HUB_SIDEBAR_CATEGORIES,
} from '@/pages/AttributeManagementHub/hubSidebar';
import type { ConsoleSidebarCategoryData } from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import styles from './BotAttributesConsoleShell.module.scss';

/** Sidebar with Bot Accounts under User Management for this prototype. */
const BOT_SIDEBAR_CATEGORIES: ConsoleSidebarCategoryData[] = HUB_SIDEBAR_CATEGORIES.map(
  (category) => {
    if (category.id !== 'user-management') return category;
    return {
      ...category,
      items: [
        ...category.items,
        { id: 'bot-accounts', label: 'Bot Accounts' },
      ],
    };
  },
);

type BotAttributesConsoleShellProps = {
  title: string;
  subtitle?: string;
  activeItemId: string;
  children: ReactNode;
};

/**
 * System Console chrome shared by Bot account + Permission policy scenes —
 * same shell as Attribute Hub so the walkthrough reads as one product surface.
 */
export default function BotAttributesConsoleShell({
  title,
  subtitle,
  activeItemId,
  children,
}: BotAttributesConsoleShellProps) {
  return (
    <div className={styles['console']}>
      <ConsoleSidebar
        className={sidebarStyles['console-sidebar--product']}
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={BOT_SIDEBAR_CATEGORIES}
        activeItemId={activeItemId}
      />
      <div className={styles['console__center']}>
        <ConsolePageHeader title={title} subtitle={subtitle} backButton />
        <div className={styles['console__scroll']}>
          <Scrollbars>
            <div className={styles['console__content']}>{children}</div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
}
