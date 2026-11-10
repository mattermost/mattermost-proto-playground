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
import AllScene from './scenes/AllScene';
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
  ALL_QUERY,
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
  all: 'Search channels, messages, files, and people',
  channels: 'Search channels or direct messages',
  messages: 'Search messages',
  files: 'Search files',
  people: 'Search people',
  copilot: 'Search by topic or ask AI a question',
};

function findChannelsRow(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const match = target.closest<HTMLElement>(
    '[class*="channels-sidebar__find-channels"]',
  );
  if (!match) return null;
  const className = match.getAttribute('class') ?? '';
  if (
    className.includes('find-channels-icon') ||
    className.includes('find-channels-label')
  ) {
    return findChannelsRow(match.parentElement);
  }
  return match;
}

function sceneFromTab(tab: SearchTab): SceneId {
  switch (tab) {
    case 'all':
      return 'all';
    case 'messages':
      return 'messages';
    case 'files':
      return 'files';
    case 'people':
      return 'people';
    case 'copilot':
      return 'copilot';
    default:
      return 'channels';
  }
}

export default function UniversalSearch() {
  const { setCenterSlot } = usePrototypeChrome();
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameEl, setFrameEl] = useState<HTMLElement | null>(null);
  const [scene, setScene] = useState<SceneId>('all');
  const [dismissed, setDismissed] = useState(false);
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

  // The shell's Find channels row is a static label. This prototype turns
  // that row into the control that opens channel search.
  useEffect(() => {
    const row = findChannelsRow(
      frameRef.current?.querySelector(
        '[class*="channels-sidebar__find-channels"]',
      ) ?? null,
    );
    if (!row) return;
    const openChannelsSearch = () => {
      setDismissed(false);
      setScene('channels');
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openChannelsSearch();
    };
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.addEventListener('click', openChannelsSearch);
    row.addEventListener('keydown', onKeyDown);
    return () => {
      row.removeEventListener('click', openChannelsSearch);
      row.removeEventListener('keydown', onKeyDown);
      row.removeAttribute('role');
      row.removeAttribute('tabindex');
    };
  }, [frameEl]);

  useEffect(() => {
    switch (scene) {
      case 'all':
        setQuery('');
        setChips([]);
        break;
      case 'all-typing':
        setQuery(ALL_QUERY);
        setChips([]);
        break;
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
      case 'copilot':
        setQuery('');
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
        onChange={(id) => {
          setDismissed(false);
          setScene(id as SceneId);
        }}
        ariaLabel="Universal search entry points"
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, setCenterSlot]);

  const tip: SearchTip = useMemo(() => {
    if (activeTab === 'all') {
      return {
        kind: 'note',
        text: 'Results update as you type',
      };
    }
    if (activeTab === 'channels') {
      return { kind: 'browse-channels' };
    }
    if (activeTab === 'messages' && (query.trim().length > 0 || chips.length > 0)) {
      return { kind: 'enter-search' };
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
    if (activeTab === 'copilot') {
      return {
        kind: 'note',
        text: 'Agents searches all channels and messages you have access to',
      };
    }
    return {
      kind: 'shortcut',
      prefix: 'Tip: Use',
      keys: ['⌘', 'Shift', 'K'],
      suffix: 'to browse teammates or start a group message',
    };
  }, [activeTab, chips.length, query]);

  const handleTabChange = (tab: SearchTab) => {
    setScene(sceneFromTab(tab));
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (activeTab === 'all') {
      if (!value.trim() && scene !== 'all') setScene('all');
      return;
    }
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
      case 'all':
      case 'all-typing':
        return (
          <AllScene
            query={query}
            recentSearches={recentMessageSearches}
            onRemoveSearch={(id) =>
              setRecentMessageSearches((current) =>
                current.filter((item) => item.id !== id),
              )
            }
          />
        );
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
            onSearchClick: () => {
              setDismissed(false);
              setScene('all');
            },
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
          open={modalOpen && !dismissed}
          container={frameEl}
          overlayClassName={styles['universal-search__overlay']}
          activeTab={activeTab}
          query={query}
          placeholder={PLACEHOLDERS[activeTab]}
          chips={chips}
          tip={tip}
          onClose={() => setDismissed(true)}
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
