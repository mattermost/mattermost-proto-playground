import PhoneIcon from '@mattermost/compass-icons/components/phone';
import { Icon } from '@mattermost/compass-ui/components/icon';
import styles from './OutboundCalls.module.scss';

export function OutboundCallPhoneNumberLink({
  number,
  onClick,
  focusId,
}: {
  number: string;
  onClick: () => void;
  /** Optional walkthrough focus anchor (`data-wt-focus`). */
  focusId?: string;
}) {
  return (
    <button
      type="button"
      className={styles['phone-link']}
      onClick={onClick}
      {...(focusId ? { 'data-wt-focus': focusId } : {})}
    >
      <Icon glyph={<PhoneIcon />} size="12" />
      <span>{number}</span>
    </button>
  );
}
