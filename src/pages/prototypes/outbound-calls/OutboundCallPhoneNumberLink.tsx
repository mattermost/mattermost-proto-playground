import PhoneIcon from '@mattermost/compass-icons/components/phone';
import Icon from '@/components/ui/Icon/Icon';
import styles from './OutboundCalls.module.scss';

export function OutboundCallPhoneNumberLink({
  number,
  onClick,
}: {
  number: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={styles['phone-link']} onClick={onClick}>
      <Icon glyph={<PhoneIcon />} size="12" />
      <span>{number}</span>
    </button>
  );
}
