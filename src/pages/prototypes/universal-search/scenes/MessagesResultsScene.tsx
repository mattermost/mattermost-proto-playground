import { RightSidebarHeader } from '@mattermost/compass-ui/components/right-sidebar-header';
import { Message, RightSidebar } from '@mattermost/compass-proto';
import SearchEmptyState from '../components/SearchEmptyState';
import { matchesQuery, MESSAGE_HITS } from '../universalSearchData';
import styles from './MessagesResultsScene.module.scss';

type MessagesResultsSceneProps = {
  query: string;
  onClose: () => void;
};

export default function MessagesResultsScene({
  query,
  onClose,
}: MessagesResultsSceneProps) {
  const hits = query.trim()
    ? MESSAGE_HITS.filter((hit) =>
        matchesQuery(query, [hit.body, hit.username, hit.channelName]),
      )
    : MESSAGE_HITS;

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
        {hits.length === 0 ? (
          <SearchEmptyState />
        ) : (
          <>
            <h2 className={styles['messages-results__query']}>
              Results for “{query}”
            </h2>
            <div className={styles['messages-results__list']}>
              {hits.map((hit) => (
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
          </>
        )}
      </div>
    </RightSidebar>
  );
}
