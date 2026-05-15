import type { ReactNode } from 'react';
import styles from './KVRow.module.scss';

export type KVValueColor = 'default' | 'success' | 'warning' | 'danger';

export interface KVRowProps {
  /** Label rendered on the left. */
  label: ReactNode;
  /** Value rendered on the right. */
  value: ReactNode;
  /** Apply a monospace treatment to the value (e.g. for keys/hashes). */
  mono?: boolean;
  /** Semantic color applied to the value text. Default: 'default'. */
  valueColor?: KVValueColor;
}

/**
 * Label-left / value-right row (gap G4). Used by Phase 1 in ConfigCard,
 * RHS panels, and the ConfigForm summary blocks.
 */
export default function KVRow({
  label,
  value,
  mono = false,
  valueColor = 'default',
}: KVRowProps) {
  const valueClass = [
    styles['kv-row__value'],
    mono ? styles['kv-row__value--mono'] : '',
    valueColor !== 'default'
      ? styles[`kv-row__value--${valueColor}`]
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles['kv-row']}>
      <span className={styles['kv-row__label']}>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
