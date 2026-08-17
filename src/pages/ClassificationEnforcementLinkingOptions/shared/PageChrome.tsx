import type { ReactNode } from 'react';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import ServerVariantIcon from '@mattermost/compass-icons/components/server-variant';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import ConsoleSidebar, {
  type ConsoleSidebarCategoryData,
} from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import styles from './shared.module.scss';

// Same System Console IA shape used by DataSpillageConsole / MembershipPolicy
// editors, with a Compliance category pointing at the page this mockup
// discusses (the shipped page lives under Compliance in production).
const CATEGORIES: ConsoleSidebarCategoryData[] = [
  {
    id: 'compliance',
    label: 'Compliance',
    icon: <FileTextOutlineIcon />,
    items: [
      { id: 'data-retention', label: 'Data Retention Policy' },
      { id: 'compliance-export', label: 'Compliance Export' },
      { id: 'classification-markings', label: 'Classification Markings' },
    ],
  },
  {
    id: 'user-management',
    label: 'User Management',
    icon: <ShieldOutlineIcon />,
    items: [
      { id: 'users', label: 'Users' },
      { id: 'permissions', label: 'Permissions' },
    ],
  },
  {
    id: 'environment',
    label: 'Environment',
    icon: <ServerVariantIcon />,
    items: [
      { id: 'web-server', label: 'Web Server' },
      { id: 'database', label: 'Database' },
    ],
  },
];

interface PageChromeProps {
  headerTitle: string;
  demoBand: ReactNode;
  children: ReactNode;
}

/**
 * Self-contained System Console shell for this mockup — sidebar + header +
 * body. Mirrors the ConsoleSidebar / ConsolePageHeader shape used by
 * DataSpillageConsole and the Membership Policy editors. Discussion
 * prototype only; not wired to any other prototype's frame.
 */
export default function PageChrome({
  headerTitle,
  demoBand,
  children,
}: PageChromeProps) {
  return (
    <div className={styles['chrome']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={CATEGORIES}
        activeItemId="classification-markings"
        onItemClick={() => undefined}
      />

      <div className={styles['chrome__main']}>
        <ConsolePageHeader
          title={headerTitle}
          trailing={
            <LabelTag
              label="Discussion mockup · [AI DRAFT]"
              type="Info Dim"
              size="X-Small"
            />
          }
        />

        {demoBand}

        <div className={styles['chrome__scroll']}>
          <Scrollbars>
            <div className={styles['chrome__panels']}>{children}</div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
}
