import type { ReactNode } from 'react';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import styles from './HoverTip.module.scss';

export interface HoverTipProps {
  label: string;
  hint?: string;
  align?: 'center' | 'end';
  children: ReactNode;
}

export default function HoverTip({
  label,
  hint,
  align = 'center',
  children,
}: HoverTipProps) {
  return (
    <span
      className={[
        styles['hover-tip'],
        align === 'end' ? styles['hover-tip--end'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      <span className={styles['hover-tip__bubble']} aria-hidden>
        <Tooltip label={label} hint={hint} arrow="Bottom" />
      </span>
    </span>
  );
}
