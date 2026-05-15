import type { ReactNode } from 'react';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import PowerPlugOutlineIcon from '@mattermost/compass-icons/components/power-plug-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import KVRow from './KVRow';
import StatusPill from './StatusPill';
import styles from './ConfigCard.module.scss';

export interface ConfigCardRow {
  /** Row label (left). */
  label: ReactNode;
  /** Row value (right). */
  value: ReactNode;
}

export interface ConfigCardProps {
  /** Configuration display name shown in the card header. */
  name: ReactNode;
  /** Status label rendered as a pill. Default: "Connected". */
  status?: ReactNode;
  /** Key/value rows rendered in the card body. */
  rows: ConfigCardRow[];
  /** When true, renders an inline success panel beneath the rows. */
  showTestResult?: boolean;
  /** Detail lines rendered inside the test result panel. */
  testResultDetails?: ReactNode[];
  /** Test result header label. */
  testResultLabel?: ReactNode;
  /** Edit button click handler. */
  onEdit?: () => void;
  /** Test button click handler. */
  onTest?: () => void;
}

/**
 * Card surface for a single PBE configuration (gap G3). Composes
 * `KVRow` + `StatusPill` plus Edit/Test actions and an optional inline
 * success panel for the Test Configuration state (State 6).
 */
export default function ConfigCard({
  name,
  status = 'Connected',
  rows,
  showTestResult = false,
  testResultDetails,
  testResultLabel = 'Configuration test successful',
  onEdit,
  onTest,
}: ConfigCardProps) {
  return (
    <div className={styles['config-card']}>
      <div className={styles['config-card__header']}>
        <span className={styles['config-card__title']}>{name}</span>
        <StatusPill label={status} tone="success" />
      </div>

      <div className={styles['config-card__body']}>
        {rows.map((row, i) => (
          <KVRow key={i} label={row.label} value={row.value} />
        ))}

        {showTestResult && (
          <div className={styles['config-card__test-result']}>
            <span className={styles['config-card__test-result-header']}>
              <CheckCircleOutlineIcon size={16} aria-hidden />
              {testResultLabel}
            </span>
            {testResultDetails?.map((detail, i) => (
              <span
                key={i}
                className={styles['config-card__test-result-detail']}
              >
                {detail}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles['config-card__actions']}>
        <Button
          size="Small"
          emphasis="Tertiary"
          leadingIcon={<Icon size="16" glyph={<PencilOutlineIcon />} />}
          onClick={onEdit}
        >
          Edit
        </Button>
        <Button
          size="Small"
          emphasis="Tertiary"
          leadingIcon={<Icon size="16" glyph={<PowerPlugOutlineIcon />} />}
          onClick={onTest}
        >
          Test
        </Button>
      </div>
    </div>
  );
}
