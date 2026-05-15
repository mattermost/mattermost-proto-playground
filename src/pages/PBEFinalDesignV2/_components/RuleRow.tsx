import CloseIcon from '@mattermost/compass-icons/components/close';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import styles from './RuleRow.module.scss';

export interface RuleRowProps {
  /** 1-based row number shown in the leading numbered chip. */
  index: number;
  /** Attribute name (e.g. "role"). */
  attribute: string;
  /** Operator label (e.g. "equals"). */
  operator: string;
  /** Attribute value (e.g. "encryption_manager"). */
  value: string;
  /** Callback when the trailing remove button is clicked. */
  onRemove?: () => void;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * RuleRow — single attribute rule row used inside the Encryption Manager
 * Eligibility panel: numbered chip + attribute chip + operator label +
 * value chip + remove icon button.
 *
 * Page-local to the PBE Final Design V2 prototype. Gap G9 of the port plan.
 */
export default function RuleRow({
  index,
  attribute,
  operator,
  value,
  onRemove,
  className = '',
}: RuleRowProps) {
  const rootClass = [styles['rule-row'], className].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      <span className={styles['rule-row__num']}>{index}</span>
      <span className={styles['rule-row__chip']}>{attribute}</span>
      <span className={styles['rule-row__operator']}>{operator}</span>
      <span className={styles['rule-row__chip']}>{value}</span>
      <span className={styles['rule-row__spacer']} />
      <IconButton
        size="X-Small"
        aria-label={`Remove rule ${index}`}
        icon={<Icon size="12" glyph={<CloseIcon />} />}
        onClick={onRemove}
      />
    </div>
  );
}
