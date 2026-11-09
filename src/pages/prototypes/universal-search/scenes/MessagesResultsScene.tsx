import { RightSidebarHeader } from '@mattermost/compass-ui/components/right-sidebar-header';
import { Message, RightSidebar } from '@mattermost/compass-proto';
import { MESSAGE_HITS, MESSAGE_RESULTS_QUERY } from '../universalSearchData';
import styles from './MessagesResultsScene.module.scss';

type MessagesResultsSceneProps = {
  onClose: () => void;
};

export default function MessagesResultsScene({
  onClose,
}: MessagesResultsSceneProps) {
  return (
    <RightSidebar
      header={
        <RightSidebarHeader
          title="Search results"
          onClose={onClose}
        />
      }
    >
      <div className={styles['messages-results']}>
        <h2 className={styles['messages-results__query']}>
          Results for “{MESSAGE_RESULTS_QUERY}”
        </h2>
        <div className={styles['messages-results__list']}>
          {MESSAGE_HITS.map((hit) => (
            <div key={hit.id} className={styles['messages-results__hit']}>
              <p className={styles['messages-results__meta']}>
                in ~{hit.channelName}
              </p>
              <Message
                avatarSrc={hit.avatarSrc}
                avatarAlt={hit.username}
                username={hit.username}
                timestamp={hit.timestamp}
              >
                <p>{hit.body}</p>
              </Message>
            </div>
          ))}
        </div>
      </div>
    </RightSidebar>
  );
}
