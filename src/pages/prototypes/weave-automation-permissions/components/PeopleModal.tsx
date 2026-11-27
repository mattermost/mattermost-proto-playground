import { Modal, ModalOverlay } from '@mattermost/compass-ui/components/modal';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import type { Person } from '../weaveAutomationPermissionsData';
import { useOverlayContainer } from './OverlayContainer';
import styles from '../WeaveAutomationPermissions.module.scss';

interface PeopleModalProps {
  open: boolean;
  title: string;
  people: Person[];
  onClose: () => void;
  onExited?: () => void;
}

/** "See who" preview: everyone a group or rule matches right now. */
export default function PeopleModal({
  open,
  title,
  people,
  onClose,
  onExited,
}: PeopleModalProps) {
  const container = useOverlayContainer();
  return (
    <ModalOverlay
      open={open}
      onClose={onClose}
      container={container}
      lockScroll={false}
      style={{ position: 'absolute' }}
    >
      <Modal
        open={open}
        onExited={onExited}
        onClose={onClose}
        size="small"
        title={title}
        subtitle={`${people.length} ${people.length === 1 ? 'person' : 'people'}, across all teams`}
        scrollable
      >
        <ul className={styles['weave-permissions__people']}>
          {people.map((p) => (
            <li key={p.id} className={styles['weave-permissions__person']}>
              <UserAvatar size="32" src={p.avatar} name={p.name} alt="" />
              <span>
                <span className={styles['weave-permissions__person-name']}>
                  {p.name}
                </span>
                <span className={styles['weave-permissions__muted']}>
                  @{p.username}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Modal>
    </ModalOverlay>
  );
}
