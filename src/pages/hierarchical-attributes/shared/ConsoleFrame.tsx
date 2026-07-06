import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import { SIDEBAR_CATEGORIES } from './sidebarFixture';
import styles from './ConsoleFrame.module.scss';

export type ConsoleFrameDirectionTag =
  | 'D1 (leader)'
  | 'D2 (challenger)'
  | 'shared landing'
  | 'state matrix';

interface ConsoleFrameProps {
  title: string;
  /** Optional eyebrow rendered above the title in a slim sub-header strip. */
  eyebrow?: string;
  /** Optional subtitle rendered under the eyebrow. */
  subtitle?: ReactNode;
  /** Active sidebar item id. Defaults to 'user-attributes'. */
  activeItemId?: string;
  /** Sidebar nav click handler. Sites can route based on the selected id. */
  onSidebarItemClick?: (itemId: string) => void;
  /** Show a back button in the page header. */
  backButton?: boolean;
  /** Called when the back button is clicked. */
  onBack?: () => void;
  /** Right-side trailing content rendered inside the page header. */
  trailing?: ReactNode;
  /** Optional banner rendered between the header and the scroll body. */
  banner?: ReactNode;
  /** Sticky footer slot, e.g. ConsoleFooter with Save / Cancel. */
  footer?: ReactNode;
  /** Direction tag chip. */
  directionTag?: ConsoleFrameDirectionTag;
  /** When true, surfaces an "Exit prototype" link in the header trailing slot. */
  showExit?: boolean;
  children: ReactNode;
}

/**
 * Hierarchical Attributes System Console chrome.
 * Composes ConsoleSidebar + ConsolePageHeader + an optional ConsoleFooter slot,
 * mirroring SessionAttributes' shared frame.
 */
export default function ConsoleFrame({
  title,
  eyebrow,
  subtitle,
  activeItemId = 'user-attributes',
  onSidebarItemClick,
  backButton = false,
  onBack,
  trailing,
  banner,
  footer,
  directionTag,
  showExit = true,
  children,
}: ConsoleFrameProps) {
  const headerTrailing =
    trailing != null || directionTag != null || showExit ? (
      <div className={styles['console-frame__trailing']}>
        {trailing}
        {directionTag && (
          <LabelTag
            label={directionTag}
            type={
              directionTag === 'D1 (leader)'
                ? 'Danger'
                : directionTag === 'D2 (challenger)'
                  ? 'Info'
                  : 'Default'
            }
            size="X-Small"
          />
        )}
        {showExit && (
          <Link
            to="/hierarchical-attributes"
            className={styles['console-frame__exit']}
          >
            Back to landing
          </Link>
        )}
      </div>
    ) : null;

  return (
    <div className={styles['console-frame']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={SIDEBAR_CATEGORIES}
        activeItemId={activeItemId}
        onItemClick={onSidebarItemClick ?? (() => {})}
      />
      <div className={styles['console-frame__center']}>
        <ConsolePageHeader
          title={title}
          backButton={backButton}
          onBack={onBack}
          trailing={headerTrailing}
        />
        {(eyebrow || subtitle) && (
          <div className={styles['console-frame__subheader']}>
            {eyebrow && (
              <span className={styles['console-frame__eyebrow']}>{eyebrow}</span>
            )}
            {subtitle && (
              <div className={styles['console-frame__subtitle']}>{subtitle}</div>
            )}
          </div>
        )}
        {banner && (
          <div className={styles['console-frame__banner']}>{banner}</div>
        )}
        <div className={styles['console-frame__scroll']}>
          <div className={styles['console-frame__content']}>{children}</div>
        </div>
        {footer && (
          <div className={styles['console-frame__footer']}>{footer}</div>
        )}
      </div>
    </div>
  );
}
