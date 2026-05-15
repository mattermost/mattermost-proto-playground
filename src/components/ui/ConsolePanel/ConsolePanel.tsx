import type { ReactNode } from 'react';
import ConsolePanelHeader from '@/components/ui/ConsolePanelHeader/ConsolePanelHeader';
import type { ConsolePanelHeaderProps } from '@/components/ui/ConsolePanelHeader/ConsolePanelHeader';
import styles from './ConsolePanel.module.scss';

export interface ConsolePanelProps extends ConsolePanelHeaderProps {
  /** Panel body content. Hidden when the panel is expandable and collapsed. */
  children?: ReactNode;
}

/**
 * System Console settings panel — a bordered card with a header and body.
 * Composes ConsolePanelHeader with a content slot. When `expandable` is true,
 * the body shows or hides via the chevron toggle in the header.
 *
 * @see Figma: Compass System Console → Panel
 */
export default function ConsolePanel({
  children,
  className = '',
  expandable,
  expanded,
  onExpandToggle,
  ...headerProps
}: ConsolePanelProps) {
  // Default expanded when uncontrolled.
  const isExpanded = expanded ?? true;
  const showBody = !expandable || isExpanded;

  const rootClass = [styles['console-panel'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <ConsolePanelHeader
        {...headerProps}
        expandable={expandable}
        expanded={expanded}
        onExpandToggle={onExpandToggle}
      />
      {showBody && children != null && (
        <div className={styles['console-panel__body']}>{children}</div>
      )}
    </div>
  );
}
