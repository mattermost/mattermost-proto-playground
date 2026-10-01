import { useState, type ReactNode } from 'react';
import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import CheckIcon from '@mattermost/compass-icons/components/check';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CloseIcon from '@mattermost/compass-icons/components/close';
import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import PlaylistCheckIcon from '@mattermost/compass-icons/components/playlist-check';
import { Button } from '@mattermost/compass-ui/components/button';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { SearchInput } from '@mattermost/compass-ui/components/search-input';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { MessageInput, shellStyles } from '@mattermost/compass-proto';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import AcvcChannelApp from '../components/AcvcChannelApp';
import AcvcSessionStage from '../components/AcvcSessionStage';
import AcvcScreenNav from '../components/AcvcScreenNav';
import { TRACES_SCREENS } from '../actionControlsScenes';
import { PUBLIC_RESTRICTED_CHANNEL, RESTRICTED_CHANNEL } from '../channelData';
import { useSession, type SessionView } from '../sessionModel';
import styles from './TracesScene.module.scss';

type ScreenId = (typeof TRACES_SCREENS)[number]['id'];

const TEAM = 'Acme Co.';

/* ------------------------------------------------------------------ */
/* 1. Find Channels — the quick switcher modal                        */
/* ------------------------------------------------------------------ */

const RECENT_CHANNELS = [
  { name: 'Town Square', team: TEAM, private: false },
  { name: 'Off-Topic', team: TEAM, private: false },
  { name: 'Engineering', team: TEAM, private: false },
];

function FindChannels({ canSee }: { canSee: boolean }) {
  const rows = canSee
    ? [
        { name: RESTRICTED_CHANNEL, team: TEAM, private: true },
        ...RECENT_CHANNELS,
      ]
    : RECENT_CHANNELS;

  return (
    <div className={styles['traces__switcher']}>
      <div className={styles['traces__switcher-head']}>
        <h2 className={styles['traces__switcher-title']}>Find Channels</h2>
        <IconButton
          size="small"
          icon={<Icon glyph={<CloseIcon />} size="20" />}
          aria-label="Close"
        />
      </div>
      <p className={styles['traces__switcher-hint']}>
        Type to find a channel. Use <strong>UP/DOWN</strong> to browse, <strong>ENTER</strong> to
        select, <strong>ESC</strong> to dismiss.
      </p>
      <div className={styles['traces__switcher-field']}>
        <SearchInput aria-label="Find channels" />
      </div>

      <div className={styles['traces__switcher-section']}>RECENT</div>
      <div className={styles['traces__switcher-list']}>
        {rows.map((row, i) => (
          <div
            key={row.name}
            className={[
              styles['traces__switcher-row'],
              i === 0 ? styles['traces__switcher-row--selected'] : '',
            ]
              .join(' ')
              .trim()}
          >
            <Icon glyph={row.private ? <LockOutlineIcon /> : <GlobeIcon />} size="20" />
            <span className={styles['traces__switcher-name']}>{row.name}</span>
            <span className={styles['traces__switcher-team']}>{row.team}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Search Results — right-hand sidebar                             */
/* ------------------------------------------------------------------ */

const SEARCH_HITS = [
  {
    channel: RESTRICTED_CHANNEL,
    author: 'Sofia Bauer',
    avatar: avatarSofia,
    time: '8:12 AM',
    before: 'Watch ',
    match: 'turnover',
    after: ' complete. Night shift handed over three open items.',
  },
  {
    channel: RESTRICTED_CHANNEL,
    author: 'Aiko Tan',
    avatar: avatarAikoTan,
    time: '8:44 AM',
    before: "I'll fold the ",
    match: 'turnover',
    after: ' notes into the morning summary.',
  },
];

function SearchResults({ canSee }: { canSee: boolean }) {
  const hits = canSee ? SEARCH_HITS : [];

  return (
    <aside className={styles['traces__rhs']}>
      <div className={styles['traces__rhs-head']}>
        <span className={styles['traces__rhs-title']}>Search Results</span>
        <div className={styles['traces__rhs-actions']}>
          <IconButton
            size="small"
            icon={<Icon glyph={<ArrowExpandIcon />} size="16" />}
            aria-label="Expand"
          />
          <IconButton
            size="small"
            icon={<Icon glyph={<CloseIcon />} size="16" />}
            aria-label="Close"
          />
        </div>
      </div>

      <div className={styles['traces__rhs-tabs']}>
        <span className={[styles['traces__tab'], styles['traces__tab--active']].join(' ')}>
          Messages <span className={styles['traces__tab-count']}>{hits.length}</span>
        </span>
        <span className={styles['traces__tab']}>
          Files <span className={styles['traces__tab-count']}>0</span>
        </span>
        <span className={styles['traces__rhs-team']}>
          {TEAM} <Icon glyph={<ChevronDownIcon />} size="12" />
        </span>
      </div>

      <Scrollbar className={styles['traces__rhs-body']}>
        <div className={styles['traces__divider']}>
          <span>Today</span>
        </div>
        {hits.map((hit) => (
          <article key={hit.time} className={styles['traces__hit']}>
            <p className={styles['traces__hit-channel']}>
              {hit.channel}
              <span className={styles['traces__hit-sep']} />
              <span className={styles['traces__hit-team']}>{TEAM}</span>
            </p>
            <div className={styles['traces__hit-meta']}>
              <UserAvatar src={hit.avatar} alt={hit.author} size="24" />
              <span className={styles['traces__hit-author']}>{hit.author}</span>
              <span className={styles['traces__hit-time']}>{hit.time}</span>
              <span className={styles['traces__hit-jump']}>Jump</span>
            </div>
            <p className={styles['traces__hit-text']}>
              {hit.before}
              <mark className={styles['traces__mark']}>{hit.match}</mark>
              {hit.after}
            </p>
          </article>
        ))}
      </Scrollbar>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Threads — full two-pane view                                    */
/* ------------------------------------------------------------------ */

const THREADS = [
  {
    author: 'admin',
    channel: 'Town Square',
    time: 'now',
    text: 'Reminder that the quarterly roadmap review is at 10:30 today.',
    replies: 1,
    avatar: avatarSofia,
  },
  {
    author: 'admin',
    channel: 'Off-Topic',
    time: 'now',
    text: 'Office is closed Friday for the building inspection.',
    replies: 1,
    avatar: avatarMarco,
  },
];

const RESTRICTED_THREAD = {
  author: 'admin',
  channel: RESTRICTED_CHANNEL,
  time: 'now',
  text: 'Sensor feed on the eastern array came back up at 07:50.',
  replies: 1,
  avatar: avatarAikoTan,
};

function ThreadsView({ canSee }: { canSee: boolean }) {
  const list = canSee ? [RESTRICTED_THREAD, ...THREADS] : THREADS;
  const open = list[0];

  return (
    <div className={styles['traces__threads']}>
      <div className={styles['traces__threads-list']}>
        <div className={styles['traces__threads-tabs']}>
          <span
            className={[styles['traces__threads-tab'], styles['traces__threads-tab--active']].join(
              ' ',
            )}
          >
            Followed threads
          </span>
          <span className={styles['traces__threads-tab']}>Unreads</span>
          <IconButton
            className={styles['traces__threads-markread']}
            size="small"
            icon={<Icon glyph={<PlaylistCheckIcon />} size="16" />}
            aria-label="Mark all as read"
          />
        </div>
        <Scrollbar className={styles['traces__threads-items']}>
          {list.map((t, i) => (
            <article
              key={`${t.channel}-${i}`}
              className={[
                styles['traces__thread-item'],
                i === 0 ? styles['traces__thread-item--active'] : '',
              ]
                .join(' ')
                .trim()}
            >
              <div className={styles['traces__thread-head']}>
                <span className={styles['traces__thread-author']}>{t.author}</span>
                <span className={styles['traces__thread-tag']}>{t.channel}</span>
                <span className={styles['traces__thread-time']}>{t.time}</span>
              </div>
              <p className={styles['traces__thread-text']}>{t.text}</p>
              <div className={styles['traces__thread-footer']}>
                <UserAvatar src={t.avatar} alt={t.author} size="20" />
                <span>{t.replies} reply</span>
              </div>
            </article>
          ))}
        </Scrollbar>
      </div>

      <div className={styles['traces__thread-pane']}>
        <div className={styles['traces__thread-pane-head']}>
          <span className={styles['traces__thread-pane-title']}>Thread</span>
          <span className={styles['traces__thread-pane-sep']} />
          <span className={styles['traces__thread-pane-channel']}>{open.channel}</span>
          <div className={styles['traces__thread-pane-actions']}>
            <Button emphasis="tertiary" size="small">
              Following
            </Button>
            <IconButton
              size="small"
              icon={<Icon glyph={<ArrowExpandIcon />} size="16" />}
              aria-label="Expand"
            />
            <IconButton
              size="small"
              icon={<Icon glyph={<DotsVerticalIcon />} size="16" />}
              aria-label="More"
            />
          </div>
        </div>

        <div className={styles['traces__thread-body']}>
          <div className={styles['traces__thread-root']}>
            <UserAvatar src={open.avatar} alt={open.author} size="32" />
            <div className={styles['traces__thread-root-body']}>
              <p className={styles['traces__thread-root-head']}>
                <span className={styles['traces__thread-author']}>{open.author}</span>
                <span className={styles['traces__thread-time']}>2 minutes ago</span>
              </p>
              <p className={styles['traces__thread-text']}>{open.text}</p>
            </div>
          </div>
          <div className={styles['traces__divider']}>
            <span>{open.replies} reply</span>
          </div>
          <div className={styles['traces__thread-root']}>
            <UserAvatar src={avatarSofia} alt="Sofia Bauer" size="32" />
            <div className={styles['traces__thread-root-body']}>
              <p className={styles['traces__thread-root-head']}>
                <span className={styles['traces__thread-author']}>Sofia Bauer</span>
                <span className={styles['traces__thread-time']}>1 minute ago</span>
              </p>
              <p className={styles['traces__thread-text']}>Acknowledged.</p>
            </div>
          </div>
        </div>

        <div className={styles['traces__thread-composer']}>
          <MessageInput placeholder="Reply to this thread..." />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Browse Channels                                                 */
/* ------------------------------------------------------------------ */

const BROWSE_ROWS = [
  { name: 'Town Square', members: 4, purpose: '', private: false },
  { name: 'Off-Topic', members: 4, purpose: 'Purpose', private: false },
  { name: 'Engineering', members: 1, purpose: '', private: false },
];

function BrowseChannels({ canSee }: { canSee: boolean }) {
  const rows = canSee
    ? [
        ...BROWSE_ROWS,
        {
          name: PUBLIC_RESTRICTED_CHANNEL,
          members: 6,
          purpose: 'Range scheduling and deconfliction',
          private: false,
        },
      ]
    : BROWSE_ROWS;

  return (
    <div className={styles['traces__browse']}>
      <div className={styles['traces__browse-head']}>
        <h2 className={styles['traces__browse-title']}>Browse Channels</h2>
        <Button emphasis="secondary">Create New Channel</Button>
        <IconButton
          size="small"
          icon={<Icon glyph={<CloseIcon />} size="20" />}
          aria-label="Close"
        />
      </div>

      <div className={styles['traces__browse-field']}>
        <SearchInput aria-label="Search channels" />
      </div>

      <div className={styles['traces__browse-controls']}>
        <span className={styles['traces__browse-count']}>{rows.length} Results</span>
        <div className={styles['traces__browse-filters']}>
          <span className={styles['traces__browse-filter']}>
            Channel Type: All <Icon glyph={<ChevronDownIcon />} size="12" />
          </span>
          <Checkbox size="small">Hide Joined</Checkbox>
        </div>
      </div>

      <div className={styles['traces__browse-list']}>
        {rows.map((row) => (
          <div key={row.name} className={styles['traces__browse-row']}>
            <Icon glyph={row.private ? <LockOutlineIcon /> : <GlobeIcon />} size="20" />
            <div className={styles['traces__browse-main']}>
              <p className={styles['traces__browse-name']}>{row.name}</p>
              <p className={styles['traces__browse-meta']}>
                <span className={styles['traces__browse-joined']}>
                  <Icon glyph={<CheckIcon />} size="12" /> Joined
                </span>
                <span className={styles['traces__browse-dot']}>·</span>
                <Icon glyph={<AccountOutlineIcon />} size="12" />
                {row.members}
                {row.purpose ? (
                  <>
                    <span className={styles['traces__browse-dot']}>·</span>
                    {row.purpose}
                  </>
                ) : null}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Permalink — must not unfurl                                     */
/* ------------------------------------------------------------------ */

function Permalinks() {
  return (
    <div className={shellStyles['channel-shell__messages']}>
      <div className={styles['traces__permalinks']}>
        <div className={styles['traces__post']}>
          <UserAvatar src={avatarMarco} alt="Marco Rinaldi" size="32" />
          <div className={styles['traces__post-body']}>
            <p className={styles['traces__post-head']}>
              <span className={styles['traces__post-author']}>Marco Rinaldi</span>
              <span className={styles['traces__post-time']}>9:14 AM</span>
            </p>
            <p className={styles['traces__post-text']}>
              Details are in this message —{' '}
              <a className={styles['traces__link']} href="#permalink">
                https://community.mattermost.com/acme/pl/8f2c1d4a9b7e
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const SCREEN_COPY: Record<ScreenId, { title: string; note: ReactNode }> = {
  switcher: {
    title: 'Find Channels — the restricted channel is simply not in the list',
    note: (
      <>
        Flip Network to Trusted and the channel appears in RECENT; back to Public and it is gone.
        No greyed row, no &ldquo;restricted&rdquo; marker — its absence is indistinguishable from
        never having been a member.
      </>
    ),
  },
  search: {
    title: 'Search Results — nothing from the channel, and the count agrees',
    note: (
      <>
        Results render in the right-hand sidebar. Note the Messages count: filtering the rendered
        list is not enough on its own, because a count that still read &ldquo;2&rdquo; while showing
        nothing would reveal that something had been withheld.
      </>
    ),
  },
  threads: {
    title: 'Followed threads — a thread you follow and were mentioned in, still absent',
    note: (
      <>
        The sharpest case. Hiding only unfollowed threads would leak straight through the mention,
        so a followed thread from the restricted channel has to disappear from this list too.
      </>
    ),
  },
  browse: {
    title: 'Browse Channels — absent, not shown-and-disabled',
    note: (
      <>
        Uses <strong>{PUBLIC_RESTRICTED_CHANNEL}</strong>, a public channel under the same policy,
        since a private channel would not appear here anyway. A greyed-out row would announce both
        the channel&rsquo;s existence and that a restriction applies, so no row is rendered — and
        the Results count drops with it.
      </>
    ),
  },
  permalink: {
    title: 'Permalink — the link does not unfurl, in either state',
    note: (
      <>
        A link into the restricted channel renders as plain link text and nothing more. This screen
        looks identical whether the session is permitted or denied, which is the point: an unfurl
        that appeared for some sessions and not others would turn every pasted link into a probe for
        who can see what.
      </>
    ),
  },
};

export default function TracesScene() {
  const [screen, setScreen] = useState<ScreenId>('switcher');
  // Opens denied — the state under test. Flip Network to Trusted to compare.
  const session = useSession({ network: 'Public', device: 'Managed' });

  const render = (s: SessionView) => {
    const canSee = s.canRead;

    const overlays: Partial<Record<ScreenId, ReactNode>> = {
      switcher: <FindChannels canSee={canSee} />,
      browse: <BrowseChannels canSee={canSee} />,
    };
    const centers: Partial<Record<ScreenId, ReactNode>> = {
      search: (
        <div className={styles['traces__split']}>
          <div className={styles['traces__split-main']}>
            <div className={styles['traces__split-placeholder']} />
          </div>
          <SearchResults canSee={canSee} />
        </div>
      ),
      threads: <ThreadsView canSee={canSee} />,
      permalink: <Permalinks />,
    };

    return (
      <AcvcChannelApp session={s} centerOverride={centers[screen]} overlay={overlays[screen]} />
    );
  };

  return (
    <div className={styles['traces-scene']}>
      <AcvcScreenNav
        screens={TRACES_SCREENS}
        activeId={screen}
        onChange={(id) => setScreen(id as ScreenId)}
        ariaLabel="Trace-removal surface"
      />
      <AcvcSessionStage
        title={SCREEN_COPY[screen].title}
        note={SCREEN_COPY[screen].note}
        session={session}
        label="Session"
      >
        {render(session)}
      </AcvcSessionStage>
    </div>
  );
}
