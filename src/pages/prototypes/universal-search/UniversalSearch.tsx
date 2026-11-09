import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import {
  ChannelHeader,
  ChannelShell,
  Message,
  MessageInput,
  shellStyles,
} from '@mattermost/compass-proto';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { universalSearchChannelsSidebarModel } from './channelsSidebar.model';
import UniversalSearchModal, {
  type SearchChip,
} from './components/UniversalSearchModal';
import type { SearchTip } from './components/SearchTipBar';
import ChannelsScene from './scenes/ChannelsScene';
import ChannelsTypingScene from './scenes/ChannelsTypingScene';
import FilesScene from './scenes/FilesScene';
import MessagesModifiersScene from './scenes/MessagesModifiersScene';
import MessagesResultsScene from './scenes/MessagesResultsScene';
import MessagesScene from './scenes/MessagesScene';
import PeopleScene from './scenes/PeopleScene';
import PeopleTypingScene from './scenes/PeopleTypingScene';
import {
  ACTIVE_CHANNEL_FILTER,
  ACTIVE_CHANNEL_NAME,
  CHANNEL_QUERY,
  FILE_MODIFIERS,
  MESSAGE_MODIFIERS,
  MESSAGE_RESULTS_QUERY,
  PEOPLE_QUERY,
  RECENT_FILE_SEARCHES,
  RECENT_MESSAGE_SEARCHES,
} from './universalSearchData';
import {
  SCENES,
  isModalOpen,
  tabForScene,
  type SceneId,
  type SearchTab,
} from './universalSearchScenes';
import styles from './UniversalSearch.module.scss';

const PLACEHOLDERS: Record<SearchTab, string> = {
  channels: 'Search channels',
  messages: 'Search messages',
  files: 'Search files',
  people: 'Search people',
};

function sceneFromTab(tab: SearchTab): SceneId {
  switch (tab) {
    case 'messages':
      return 'messages';
    case 'files':
      return 'files';
    case 'people':
      return 'people';
    default:
      return 'channels';
  }
}

export default function UniversalSearch() {
  const { setCenterSlot } = usePrototypeChrome();
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameEl, setFrameEl] = useState<HTMLElement | null>(null);
  const [scene, setScene] = useState<SceneId>('channels');
  const [query, setQuery] = useState('');
  const [chips, setChips] = useState<SearchChip[]>([]);
  const [recentMessageSearches, setRecentMessageSearches] = useState(
    RECENT_MESSAGE_SEARCHES,
  );
  const [recentFileSearches, setRecentFileSearches] =
    useState(RECENT_FILE_SEARCHES);

  const activeTab = tabForScene(scene);
  const modalOpen = isModalOpen(scene);

  useEffect(() => {
    setFrameEl(frameRef.current);
  }, []);

  useEffect(() => {
    switch (scene) {
      case 'channels':
        setQuery('');
        setChips([]);
        break;
      case 'channels-typing':
        setQuery(CHANNEL_QUERY);
        setChips([]);
        break;
      case 'messages':
        setQuery('');
        setChips([]);
        break;
      case 'messages-modifiers':
        setQuery('');
        setChips([
          {
            id: 'in-channel',
            label: `${ACTIVE_CHANNEL_FILTER.label} ${ACTIVE_CHANNEL_FILTER.value}`,
          },
          { id: 'from-pending', label: 'From:' },
        ]);
        break;
      case 'messages-results':
        setQuery(MESSAGE_RESULTS_QUERY);
        setChips([]);
        break;
      case 'files':
        setQuery('');
        setChips([]);
        break;
      case 'people':
        setQuery('');
        setChips([]);
        break;
      case 'people-typing':
        setQuery(PEOPLE_QUERY);
        setChips([]);
        break;
      default:
        break;
    }
  }, [scene]);

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={SCENES}
        activeId={scene}
        onChange={(id) => setScene(id as SceneId)}
        ariaLabel="Universal search entry points"
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, setCenterSlot]);

  const tip: SearchTip = useMemo(() => {
    if (activeTab === 'channels') {
      return { kind: 'browse-channels' };
    }
    if (activeTab === 'messages') {
      return {
        kind: 'modifiers',
        modifiers: MESSAGE_MODIFIERS,
        onModifierClick: (modifier) => {
          setScene('messages-modifiers');
          setChips((current) => [
            ...current.filter((chip) => chip.id !== 'from-pending'),
            {
              id: `mod-${modifier}`,
              label: modifier.endsWith(':') ? modifier : `${modifier}`,
            },
          ]);
        },
      };
    }
    if (activeTab === 'files') {
      return {
        kind: 'modifiers',
        modifiers: FILE_MODIFIERS,
      };
    }
    return {
      kind: 'shortcut',
      prefix: 'Tip: Use',
      keys: ['⌘', 'Shift', 'K'],
      suffix: 'to browse teammates or start a group message',
    };
  }, [activeTab]);

  const showEnterHint =
    activeTab === 'messages' &&
    (scene === 'messages-modifiers' || query.trim().length > 0);

  const handleTabChange = (tab: SearchTab) => {
    setScene(sceneFromTab(tab));
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (activeTab === 'channels') {
      setScene(value.trim() ? 'channels-typing' : 'channels');
      return;
    }
    if (activeTab === 'people') {
      setScene(value.trim() ? 'people-typing' : 'people');
      return;
    }
    if (activeTab === 'messages' && value.trim().toLowerCase().startsWith('from:')) {
      setScene('messages-modifiers');
    }
  };

  const handleSubmitQuery = () => {
    if (activeTab === 'messages' && (query.trim() || chips.length > 0)) {
      setScene('messages-results');
    }
  };

  const modalBody = (() => {
    switch (scene) {
      case 'channels':
        return <ChannelsScene />;
      case 'channels-typing':
        return <ChannelsTypingScene />;
      case 'messages':
        return (
          <MessagesScene
            searches={recentMessageSearches}
            onRemoveSearch={(id) =>
              setRecentMessageSearches((current) =>
                current.filter((item) => item.id !== id),
              )
            }
          />
        );
      case 'messages-modifiers':
        return (
          <MessagesModifiersScene
            onSelect={(id, label) => {
              setChips((current) => [
                ...current.filter((chip) => chip.id !== 'from-pending'),
                { id: `from-${id}`, label: `From: ${label}` },
              ]);
              setQuery('');
            }}
          />
        );
      case 'files':
        return (
          <FilesScene
            searches={recentFileSearches}
            onRemoveSearch={(id) =>
              setRecentFileSearches((current) =>
                current.filter((item) => item.id !== id),
              )
            }
          />
        );
      case 'people':
        return <PeopleScene />;
      case 'people-typing':
        return <PeopleTypingScene />;
      default:
        return null;
    }
  })();

  return (
    <div className={styles['universal-search']}>
      <div ref={frameRef} className={styles['universal-search__frame']}>
        <ChannelShell
          channelsSidebarModel={universalSearchChannelsSidebarModel}
          globalHeaderProps={{
            onSearchClick: () => setScene('channels'),
          }}
          channelHeader={
            <ChannelHeader
              type="channel"
              name={ACTIVE_CHANNEL_NAME}
              description="Design reviews and ongoing work."
              memberCount={24}
              pinnedCount={2}
            />
          }
          trailing={
            scene === 'messages-results' ? (
              <MessagesResultsScene onClose={() => setScene('messages')} />
            ) : undefined
          }
        >
          <div className={shellStyles['channel-shell__messages']}>
            <Scrollbar>
              <div className={shellStyles['channel-shell__messages-list']}>
                <MessageSeparator type="date" label="Today" />
                <Message
                  avatarSrc={avatarSofia}
                  avatarAlt="Sofia Bauer"
                  username="Sofia Bauer"
                  timestamp="9:02 AM"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Dropping the launch checklist here so we can find it later
                    from search.
                  </p>
                </Message>
                <Message
                  avatarSrc={avatarMarco}
                  avatarAlt="Marco Rinaldi"
                  username="Marco Rinaldi"
                  timestamp="9:18 AM"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Perfect — I&apos;ll also look for related files in the Files
                    tab.
                  </p>
                </Message>
              </div>
            </Scrollbar>
          </div>
          <div className={shellStyles['channel-shell__message-input']}>
            <MessageInput placeholder={`Write to ${ACTIVE_CHANNEL_NAME}`} />
          </div>
        </ChannelShell>

        <UniversalSearchModal
          open={modalOpen}
          container={frameEl}
          overlayClassName={styles['universal-search__overlay']}
          activeTab={activeTab}
          query={query}
          placeholder={PLACEHOLDERS[activeTab]}
          showEnterHint={showEnterHint}
          chips={chips}
          tip={tip}
          onClose={() => setScene('channels')}
          onTabChange={handleTabChange}
          onQueryChange={handleQueryChange}
          onClearQuery={() => handleQueryChange('')}
          onChipRemove={(id) =>
            setChips((current) => current.filter((chip) => chip.id !== id))
          }
          onSubmitQuery={handleSubmitQuery}
        >
          {modalBody}
        </UniversalSearchModal>
      </div>
    </div>
  );
}
