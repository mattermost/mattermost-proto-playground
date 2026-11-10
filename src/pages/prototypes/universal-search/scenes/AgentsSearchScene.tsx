import { RightSidebarHeader } from '@mattermost/compass-ui/components/right-sidebar-header';
import { Message, RightSidebar } from '@mattermost/compass-proto';
import {
  matchesQuery,
  MESSAGE_HITS,
  SEARCH_AGENTS,
} from '../universalSearchData';
import styles from './AgentsSearchScene.module.scss';

type AgentsSearchSceneProps = {
  query: string;
  agentId: string;
  onClose: () => void;
};

export default function AgentsSearchScene({
  query,
  agentId,
  onClose,
}: AgentsSearchSceneProps) {
  const agent =
    SEARCH_AGENTS.find((item) => item.id === agentId) ?? SEARCH_AGENTS[0];
  const hits = MESSAGE_HITS.filter((hit) =>
    matchesQuery(query, [hit.body, hit.username, hit.channelName]),
  ).slice(0, 3);

  return (
    <RightSidebar
      header={
        <RightSidebarHeader title={agent.name} onClose={onClose} />
      }
    >
      <div className={styles['agents-search']}>
        <Message avatarAlt="You" username="You" timestamp="Now">
          <p className={styles['agents-search__text']}>{query}</p>
        </Message>
        <Message
          avatarSrc={agent.avatarSrc}
          avatarAlt={agent.name}
          username={agent.name}
          timestamp="Now"
          isBot
          botLabel="Agent"
        >
          <div className={styles['agents-search__text']}>
            {hits.length === 0 ? (
              <p>
                I searched the channels and messages you can access and didn’t
                find anything about “{query}”.
              </p>
            ) : (
              <>
                <p>Here’s what I found in channels you can access:</p>
                <ul>
                  {hits.map((hit) => (
                    <li key={hit.id}>
                      {hit.username} in ~{hit.channelName}: {hit.body}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </Message>
      </div>
    </RightSidebar>
  );
}
