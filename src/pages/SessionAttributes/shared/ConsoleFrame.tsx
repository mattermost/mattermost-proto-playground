import type { ReactNode } from 'react';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import { SIDEBAR_CATEGORIES } from './mockData';
import styles from './ConsoleFrame.module.scss';

interface ConsoleFrameProps {
  title: string;
  activeItemId: string;
  enterpriseTag?: boolean;
  trailing?: ReactNode;
  backButton?: boolean;
  onBack?: () => void;
  /** When provided, overrides the default sidebar nav callback. */
  onItemClick?: (itemId: string) => void;
  children: ReactNode;
}

/** Reusable System Console chrome — sidebar + page header + scrollable body. */
export default function ConsoleFrame({
  title,
  activeItemId,
  enterpriseTag = true,
  trailing,
  backButton = false,
  onBack,
  onItemClick,
  children,
}: ConsoleFrameProps) {
  return (
    <div className={styles['console-frame']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={SIDEBAR_CATEGORIES}
        activeItemId={activeItemId}
        onItemClick={onItemClick ?? (() => {})}
      />
      <div className={styles['console-frame__center']}>
        <ConsolePageHeader
          title={title}
          tag={enterpriseTag ? 'Enterprise' : undefined}
          backButton={backButton}
          onBack={onBack}
          trailing={trailing}
        />
        <div className={styles['console-frame__scroll']}>
          <div className={styles['console-frame__content']}>{children}</div>
        </div>
      </div>
    </div>
  );
}
