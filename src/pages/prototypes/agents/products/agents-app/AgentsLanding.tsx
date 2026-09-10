import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { SearchInput } from '@mattermost/compass-ui/components/search-input';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { AGENTS_BASE } from '../../agentsScenes';
import {
  FTE_PRECONFIGURED_AGENTS,
  MATTY,
  buildWorkspaceDirectory,
  formatChannelList,
  type WorkspaceAgent,
} from '../../agentsData';
import AgentAvatar from '../../components/AgentAvatar';
import { useAgents } from '../../context/AgentsContext';
import AgentsProductSidebar from './AgentsProductSidebar';
import styles from './AgentsLanding.module.scss';

const FTE_CARD_WIDTH = 320;
const FTE_CARD_GAP = 16; // --spacing-l
const FTE_CARD_STRIDE = FTE_CARD_WIDTH + FTE_CARD_GAP;

const FTE_SHELF_AGENTS = [MATTY, ...FTE_PRECONFIGURED_AGENTS] as const;
const FTE_SLIDE_COUNT = 1 + FTE_SHELF_AGENTS.length; // create + agents

function FirstTimeHome({
  onOpenAgent,
  onCreate,
}: {
  onOpenAgent: (id: string) => void;
  onCreate: () => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;

    const update = () => {
      setViewportWidth(el.clientWidth);
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const visibleCount = useMemo(() => {
    if (viewportWidth <= 0) return 1;
    return Math.max(
      1,
      Math.floor((viewportWidth + FTE_CARD_GAP) / FTE_CARD_STRIDE),
    );
  }, [viewportWidth]);

  const maxStart = Math.max(0, FTE_SLIDE_COUNT - visibleCount);
  const canScroll = maxStart > 0;

  useEffect(() => {
    setStartIndex((prev) => Math.min(prev, maxStart));
  }, [maxStart]);

  const goPrev = useCallback(() => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goNext = useCallback(() => {
    setStartIndex((prev) => Math.min(maxStart, prev + 1));
  }, [maxStart]);

  const onCarouselKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!canScroll) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
    },
    [canScroll, goPrev, goNext],
  );

  const trackStyle = {
    ['--agents-landing-shelf-offset' as string]: canScroll
      ? `-${startIndex * FTE_CARD_STRIDE}px`
      : '0px',
  } as CSSProperties;

  const canGoPrev = canScroll && startIndex > 0;
  const canGoNext = canScroll && startIndex < maxStart;

  return (
    <div className={styles['agents-landing__fte']}>
      <div className={styles['agents-landing__intro']}>
        <h1 className={styles['agents-landing__title']}>
          Meet your first agent
        </h1>
        <p className={styles['agents-landing__subtitle']}>
          You can work with many agents personally or alongside your team.
        </p>
      </div>

      <div
        className={styles['agents-landing__carousel']}
        role="region"
        aria-roledescription="carousel"
        aria-label="Starter agents"
        tabIndex={canScroll ? 0 : undefined}
        onKeyDown={onCarouselKeyDown}
      >
        {canScroll ? (
          <>
            <div
              className={[
                styles['agents-landing__carousel-edge'],
                styles['agents-landing__carousel-edge--prev'],
                canGoPrev
                  ? styles['agents-landing__carousel-edge--visible']
                  : null,
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden
            />
            <div
              className={[
                styles['agents-landing__carousel-edge'],
                styles['agents-landing__carousel-edge--next'],
                canGoNext
                  ? styles['agents-landing__carousel-edge--visible']
                  : null,
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden
            />
            {canGoPrev ? (
              <div
                className={[
                  styles['agents-landing__carousel-nav'],
                  styles['agents-landing__carousel-nav--prev'],
                ].join(' ')}
              >
                <IconButton
                  className={styles['agents-landing__carousel-nav-btn']}
                  size="large"
                  rounded
                  aria-label="Previous agents"
                  icon={<Icon glyph={<ArrowLeftIcon />} size="24" />}
                  onClick={goPrev}
                />
              </div>
            ) : null}
            {canGoNext ? (
              <div
                className={[
                  styles['agents-landing__carousel-nav'],
                  styles['agents-landing__carousel-nav--next'],
                ].join(' ')}
              >
                <IconButton
                  className={styles['agents-landing__carousel-nav-btn']}
                  size="large"
                  rounded
                  aria-label="Next agents"
                  icon={<Icon glyph={<ArrowRightIcon />} size="24" />}
                  onClick={goNext}
                />
              </div>
            ) : null}
          </>
        ) : null}

        <div
          ref={viewportRef}
          className={styles['agents-landing__carousel-viewport']}
        >
          <div
            className={[
              styles['agents-landing__carousel-track'],
              !canScroll
                ? styles['agents-landing__carousel-track--centered']
                : null,
            ]
              .filter(Boolean)
              .join(' ')}
            style={trackStyle}
          >
            <article
              className={[
                styles['agents-landing__card'],
                styles['agents-landing__card--create'],
              ].join(' ')}
            >
              <button
                type="button"
                className={styles['agents-landing__card-hit']}
                aria-label="Create your own agent"
                onClick={onCreate}
              />
              <span
                className={styles['agents-landing__create-icon']}
                aria-hidden
              >
                <Icon glyph={<PlusIcon />} size="32" />
              </span>
              <div className={styles['agents-landing__card-copy']}>
                <h2 className={styles['agents-landing__card-title']}>
                  Create your own
                </h2>
                <p className={styles['agents-landing__card-body']}>
                  Create a custom agent you can share or keep for your private
                  use.
                </p>
              </div>
              <Button emphasis="primary" tabIndex={-1} aria-hidden>
                Get started
              </Button>
            </article>

            {FTE_SHELF_AGENTS.map((agent) => (
              <article key={agent.id} className={styles['agents-landing__card']}>
                <button
                  type="button"
                  className={styles['agents-landing__card-hit']}
                  aria-label={`Chat with ${agent.name}`}
                  onClick={() => onOpenAgent(agent.id)}
                />
                <AgentAvatar
                  shape={agent.shape}
                  color={agent.color}
                  size="lg"
                  eyes
                  shadow
                />
                <div className={styles['agents-landing__card-copy']}>
                  <h2 className={styles['agents-landing__card-title']}>
                    {agent.name}
                  </h2>
                  <p className={styles['agents-landing__card-body']}>
                    {agent.description}
                  </p>
                </div>
                <Button emphasis="tertiary" tabIndex={-1} aria-hidden>
                  {`Chat with ${agent.name}`}
                </Button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DirectoryHome({
  agents,
  onOpenAgent,
  onCreate,
}: {
  agents: WorkspaceAgent[];
  onOpenAgent: (id: string) => void;
  onCreate: () => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((agent) => {
      const channels = formatChannelList(agent.channels).toLowerCase();
      return (
        agent.name.toLowerCase().includes(q) ||
        agent.role.toLowerCase().includes(q) ||
        agent.owner.toLowerCase().includes(q) ||
        (agent.managedBy ?? '').toLowerCase().includes(q) ||
        channels.includes(q)
      );
    });
  }, [agents, query]);

  return (
    <div className={styles['agents-landing__directory']}>
      <div className={styles['agents-landing__dir-header']}>
        <div className={styles['agents-landing__dir-heading']}>
          <h1 className={styles['agents-landing__dir-title']}>All agents</h1>
          <p className={styles['agents-landing__dir-subtitle']}>
            Agents live at the workspace level — like people. Invite them into
            any channel that needs them.
          </p>
        </div>
        <Button
          emphasis="tertiary"
          leadingIcon={<Icon glyph={<PlusIcon />} size="16" />}
          onClick={onCreate}
        >
          Create an agent
        </Button>
      </div>

      <SearchInput
        placeholder="Find agents"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        aria-label="Find agents"
      />

      <div className={styles['agents-landing__dir-list']}>
        <div className={styles['agents-landing__dir-cols']} aria-hidden>
          <span>Agent</span>
          <span>Role</span>
          <span>Created by</span>
          <span>Channels</span>
        </div>
        <Scrollbar className={styles['agents-landing__dir-scroll']}>
          <div className={styles['agents-landing__dir-rows']}>
            {filtered.map((agent) => (
              <button
                key={agent.id}
                type="button"
                className={styles['agents-landing__row']}
                onClick={() => onOpenAgent(agent.id)}
              >
                <span className={styles['agents-landing__row-agent']}>
                  <AgentAvatar
                    shape={agent.shape}
                    color={agent.color}
                    size="xs"
                    eyes
                    imageSrc={agent.customImageSrc}
                  />
                  <span className={styles['agents-landing__row-name']}>
                    {agent.name}
                  </span>
                  {agent.fresh ? (
                    <Tag label="New" type="info" size="x-small" />
                  ) : null}
                </span>
                <span className={styles['agents-landing__row-role']}>
                  <Tag label={agent.role} size="x-small" />
                </span>
                <span className={styles['agents-landing__row-owner']}>
                  {agent.managedBy
                    ? `Managed by ${agent.managedBy}`
                    : agent.owner}
                </span>
                <span className={styles['agents-landing__row-channels']}>
                  {formatChannelList(agent.channels)}
                </span>
              </button>
            ))}
          </div>
        </Scrollbar>
      </div>
    </div>
  );
}

/** Agents product homepage — FTE when only Matty exists, directory otherwise. */
export default function AgentsLanding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openNewAgent, customAgents } = useAgents();
  const forceFte = searchParams.get('fte') === '1';
  const showFte = forceFte || customAgents.length === 0;
  const directory = useMemo(
    () => buildWorkspaceDirectory(customAgents),
    [customAgents],
  );

  const openAgent = (id: string) => navigate(`${AGENTS_BASE}/agents/${id}`);

  return (
    <div className={styles['agents-landing']}>
      <AgentsProductSidebar activeNav="all-agents" />

      <div
        className={[
          styles['agents-landing__center'],
          showFte
            ? styles['agents-landing__center--fte']
            : styles['agents-landing__center--directory'],
        ].join(' ')}
      >
        {showFte ? (
          <FirstTimeHome onOpenAgent={openAgent} onCreate={openNewAgent} />
        ) : (
          <DirectoryHome
            agents={directory}
            onOpenAgent={openAgent}
            onCreate={openNewAgent}
          />
        )}
      </div>
    </div>
  );
}
