import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import CheckIcon from '@mattermost/compass-icons/components/check';
import ProductChannelsIcon from '@mattermost/compass-icons/components/product-channels';
import ProductBoardsIcon from '@mattermost/compass-icons/components/product-boards';
import ProductPlaybooksIcon from '@mattermost/compass-icons/components/product-playbooks';
import CodeTagsIcon from '@mattermost/compass-icons/components/code-tags';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import DownloadOutlineIcon from '@mattermost/compass-icons/components/download-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import BookOutlineIcon from '@mattermost/compass-icons/components/book-outline';
import TextBoxOutlineIcon from '@mattermost/compass-icons/components/text-box-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import AtIcon from '@mattermost/compass-icons/components/at';
import CheckboxMarkedCircleOutlineIcon from '@mattermost/compass-icons/components/checkbox-marked-circle-outline';
import CalendarCheckOutlineIcon from '@mattermost/compass-icons/components/calendar-check-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Button from '@/components/ui/Button/Button';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import ChannelsSidebar from '@/components/ui/ChannelsSidebar/ChannelsSidebar';
import GlobalHeader from '@/components/ui/GlobalHeader/GlobalHeader';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import LabelTag, { type LabelTagType } from '@/components/ui/LabelTag/LabelTag';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import MessageInput from '@/components/ui/MessageInput';
import MessageReactions from '@/components/ui/MessageReactions/MessageReactions';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import { Modal } from '@/components/ui/Modal';
import Message from '@/components/ui/Message/Message';
import messageStyles from '@/components/ui/Message/Message.module.scss';
import RightSidebar, {
  RightSidebarHeader,
} from '@/components/ui/RightSidebar';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import TeamSidebar from '@/components/ui/TeamSidebar/TeamSidebar';
import ThreadListItem from '@/components/ui/ThreadListItem/ThreadListItem';
import type { UserAvatarGroupItem } from '@/components/ui/UserAvatarGroup/UserAvatarGroup';
import TextArea from '@/components/ui/TextArea/TextArea';
import { usePopoverTransition } from '@/hooks/usePopoverTransition';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import styles from './ProductSwitcher.module.scss';
import {
  AgentCreateView,
  AgentsManageView,
  AutomationCreateView,
  AutomationsManageView,
  CustomPromptFormView,
  CustomPromptsManageView,
  DEFAULT_AUTOMATIONS,
  DEFAULT_CUSTOM_PROMPTS,
  DEFAULT_SUPER_AGENTS,
  MattyCodeView,
  MATTY_CODE_IN_PROGRESS,
  WikiCreateView,
  type AgentsIntent,
  type AgentsPanel,
  type ChannelAutomation,
  type CustomPrompt,
  type SuperAgent,
  type WikiPageDraft,
} from './productSwitcherAiFeatures';

const PRODUCT_VIEW_PARAM = 'view';
const VALID_PRODUCT_VIEWS = new Set<ProductView>([
  'channels',
  'boards',
  'playbooks',
  'agents',
]);

function readProductView(param: string | null): ProductView {
  if (param && VALID_PRODUCT_VIEWS.has(param as ProductView)) {
    return param as ProductView;
  }
  return 'channels';
}

// ----------------------------------------------------------------
// Default Mattermost layout + Product Switcher menu (top-left).
// Selecting "Agents" swaps the channels sidebar + center panel for
// an AI/Agents view (Brain composer + quick action cards).
// ----------------------------------------------------------------

type ProductView = 'channels' | 'boards' | 'playbooks' | 'agents';

interface SwitcherEntry {
  key: ProductView;
  label: string;
  icon: ComponentType<{ size?: number }>;
}

const SWITCHER_PRODUCTS: SwitcherEntry[] = [
  { key: 'channels', label: 'Channels', icon: ProductChannelsIcon },
  { key: 'boards', label: 'Boards', icon: ProductBoardsIcon },
  { key: 'playbooks', label: 'Playbooks', icon: ProductPlaybooksIcon },
  { key: 'agents', label: 'Agents', icon: CreationOutlineIcon },
];

export default function ProductSwitcher() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = readProductView(searchParams.get(PRODUCT_VIEW_PARAM));
  const [menuOpen, setMenuOpen] = useState(false);
  const [automations, setAutomations] =
    useState<ChannelAutomation[]>(DEFAULT_AUTOMATIONS);
  const [agentsIntent, setAgentsIntent] = useState<AgentsIntent>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mounted: menuMounted, visible: menuVisible } =
    usePopoverTransition(menuOpen);

  const setView = (next: ProductView) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (next === 'channels') {
          params.delete(PRODUCT_VIEW_PARAM);
        } else {
          params.set(PRODUCT_VIEW_PARAM, next);
        }
        return params;
      },
      { replace: true }
    );
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (e: MouseEvent) => {
      const el = menuRef.current;
      const target = e.target as Node | null;
      if (!el || !target) return;
      if (el.contains(target)) return;
      const trigger = (target as HTMLElement).closest?.(
        '[aria-label="Product switcher"]'
      );
      if (trigger) return;
      setMenuOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  const handleSelectProduct = (next: ProductView) => {
    setView(next);
    setMenuOpen(false);
  };

  return (
    <div className={styles['product-switcher']}>
      <div className={styles['product-switcher__global-header']}>
        <GlobalHeader
          product="Channels"
          userAvatarSrc={avatarLeonard}
          userAvatarAlt="Leonard Riley"
          onProductSwitcherClick={() => setMenuOpen((o) => !o)}
          productSwitcherOpen={menuOpen}
        />
      </div>

      {menuMounted && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Switch product"
          className={[
            styles['product-switcher__switcher-menu'],
            menuVisible
              ? styles['product-switcher__switcher-menu--visible']
              : styles['product-switcher__switcher-menu--exiting'],
          ].join(' ')}
        >
          {SWITCHER_PRODUCTS.map(({ key, label, icon: ProductIcon }) => {
            const active = view === key;
            return (
              <MenuItem
                key={key}
                role="menuitem"
                label={label}
                leadingVisual={
                  <span
                    className={styles['product-switcher__switcher-icon']}
                    aria-hidden
                  >
                    <Icon size="20" glyph={<ProductIcon />} />
                  </span>
                }
                trailingElement={active}
                trailingVisual={
                  active ? <Icon size="16" glyph={<CheckIcon />} /> : undefined
                }
                onClick={() => handleSelectProduct(key)}
              />
            );
          })}

          <div className={styles['product-switcher__switcher-divider']} />

          <MenuItem
            role="menuitem"
            label="Download apps"
            leadingVisual={<Icon size="16" glyph={<DownloadOutlineIcon />} />}
          />
          <MenuItem
            role="menuitem"
            label="About Mattermost"
            leadingVisual={
              <Icon size="16" glyph={<InformationOutlineIcon />} />
            }
          />
        </div>
      )}

      <div className={styles['product-switcher__body']}>
        <div className={styles['product-switcher__team-sidebar']}>
          <TeamSidebar
            activeTeamId="contributors"
            teams={[
              { id: 'contributors', name: 'Contributors', src: avatarStaffTeam },
              { id: 'design', name: 'Design', initials: 'De', unread: true },
              { id: 'acme', name: 'Acme', initials: 'Ac', mentions: 3 },
            ]}
          />
        </div>

        <div className={styles['product-switcher__outer-panel']}>
          {view === 'agents' ? (
            <AgentsView
              intent={agentsIntent}
              onIntentHandled={() => setAgentsIntent(null)}
              automations={automations}
              onAutomationsChange={setAutomations}
            />
          ) : (
            <ChannelsView />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Channels view — same content as the default Mattermost layout.
// ---------------------------------------------------------------------------
function ChannelsView() {
  return (
    <>
      <div className={styles['product-switcher__channels-sidebar']}>
        <ChannelsSidebar
          teamName="Contributors"
          showFilter
          avatarAikoTan={avatarAikoTan}
          avatarArjunPatel={avatarArjunPatel}
          avatarDanielOkoro={avatarDanielle}
          avatarDariusCole={avatarDariusCole}
          avatarDavidLiang={avatarDavidLiang}
          avatarEmmaNovak={avatarEmmaNovak}
          avatarEthanBrooks={avatarEthanBrooks}
        />
      </div>

      <div className={styles['product-switcher__inner-panel']}>
        <div className={styles['product-switcher__center']}>
          <ChannelHeader
            type="Channel"
            name="Town Square"
            description="Company-wide announcements and general discussion."
            memberCount={124}
            pinnedCount={2}
          />

          <div className={styles['product-switcher__messages']}>
            <MessageSeparator type="Date" label="Today" />

            <Message
              avatarSrc={avatarSofia}
              avatarAlt="Sofia Bauer"
              username="Sofia Bauer"
              timestamp="9:02 AM"
            >
              <p className={styles['product-switcher__post-text']}>
                Morning everyone! Reminder that the Q2 roadmap review is at
                10:30 today.
              </p>
            </Message>

            <Message
              avatarSrc={avatarMarco}
              avatarAlt="Marco Rinaldi"
              username="Marco Rinaldi"
              timestamp="9:14 AM"
            >
              <p className={styles['product-switcher__post-text']}>
                Just pushed the updated onboarding flow to staging — would
                love a second pair of eyes on the empty states before we
                cut a release.
              </p>
            </Message>

            <Message
              avatarSrc={avatarAikoTan}
              avatarAlt="Aiko Tan"
              username="Aiko Tan"
              timestamp="9:33 AM"
            >
              <p className={styles['product-switcher__post-text']}>
                Nice work Marco 🎉 I can take a pass after standup.
              </p>
              <MessageReactions
                reactions={[
                  { emoji: '🎉', count: 4, byCurrentUser: true },
                  { emoji: '👀', count: 2 },
                ]}
                showAddReaction
              />
            </Message>

            <Message
              avatarSrc={avatarArjunPatel}
              avatarAlt="Arjun Patel"
              username="Arjun Patel"
              timestamp="9:47 AM"
            >
              <p className={styles['product-switcher__post-text']}>
                Heads up — I'll be out Friday afternoon.
              </p>
            </Message>

            <MessageSeparator type="New Messages" />

            <Message
              avatarSrc={avatarLeonard}
              avatarAlt="Leonard Riley"
              username="Leonard Riley"
              timestamp="10:12 AM"
            >
              <p className={styles['product-switcher__post-text']}>
                Design review is bumped to 2:00 PM today.
              </p>
            </Message>

            <Message
              avatarSrc={avatarDanielle}
              avatarAlt="Matty"
              username="Matty"
              timestamp="11:04 AM"
              isBot
              botLabel="BOT"
            >
              <p className={styles['product-switcher__post-text']}>
                Matty Code finished{' '}
                <span className={styles['product-switcher__post-emphasis']}>
                  MM-48102
                </span>{' '}
                — product switcher focus restore is ready for review.{' '}
                <a href="#" className={styles['product-switcher__inline-link']}>
                  mattermost/mattermost-webapp#15903
                </a>{' '}
                includes before/after screenshots and passed the CodeRabbit
                review pass.
              </p>
            </Message>
          </div>

          <div className={styles['product-switcher__message-input']}>
            <MessageInput placeholder="Write to Town Square" />
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Agents view — left AI sidebar + centered Brain composer.
// ---------------------------------------------------------------------------

interface AISidebarItem {
  label: string;
  icon: ComponentType<{ size?: number }>;
  /** When set, clicking this item opens that briefing conversation. */
  opens?: BriefingId;
}

const RECENT_CHATS: AISidebarItem[] = [
  { label: 'UI Redesign', icon: MessageTextOutlineIcon, opens: 'tasks' },
  { label: 'Mobile App — Login Screen', icon: MessageTextOutlineIcon },
];

const DEFAULT_RECAP_PROMPT = `Each weekday morning, build my recap of what needs my attention today. Pull together:

• Mentions where I'm tagged but haven't replied yet — surface the channel and a one-line summary so I can decide quickly.
• Tasks assigned to me in Jira or Playbooks with due dates today or earlier, plus anything blocking a teammate.
• Meetings starting in the next 2 hours, including any prep docs or action items from the previous occurrence.
• Decisions waiting on me that are blocking a release, launch, or another person's work.

Group items by urgency, summarise each in one short sentence, and put replies and decisions ahead of informational items. Keep it scannable — I should be able to triage in under two minutes.`;

const DEFAULT_RECAP_TIME = '08:00';

type RecapTool = 'mattermost' | 'github' | 'jira';

interface RecapToolMeta {
  id: RecapTool;
  label: string;
  glyph: ReactNode;
  defaultLabel: string;
  defaultPrompt: string;
}

const RECAP_TOOLS: RecapToolMeta[] = [
  {
    id: 'mattermost',
    label: 'Mattermost',
    glyph: <MattermostGlyph />,
    defaultLabel: 'Mattermost Recap',
    defaultPrompt:
      'Each weekday morning, summarise channels I follow: unread mentions, threads I started that went quiet, and any decisions waiting on me.',
  },
  {
    id: 'github',
    label: 'GitHub',
    glyph: <GitHubGlyph />,
    defaultLabel: 'GitHub Recap',
    defaultPrompt:
      "Each weekday morning, gather my GitHub mentions, my own open pull requests, and pull requests assigned to me for review. Group by repository and surface anything blocking a teammate.",
  },
  {
    id: 'jira',
    label: 'Jira',
    glyph: <JiraGlyph />,
    defaultLabel: 'Jira Recap',
    defaultPrompt:
      'Each weekday morning, list issues assigned to me with due dates today or earlier, plus tickets I reported that are stuck without an update for 3+ days.',
  },
];

interface CustomRecap {
  id: string;
  label: string;
  prompt: string;
  tool: RecapTool;
}

function AgentsView({
  intent,
  onIntentHandled,
  automations,
  onAutomationsChange,
}: {
  intent: AgentsIntent | null;
  onIntentHandled: () => void;
  automations: ChannelAutomation[];
  onAutomationsChange: (next: ChannelAutomation[]) => void;
}) {
  const [agentsPanel, setAgentsPanel] = useState<AgentsPanel>('recaps');
  const [activeId, setActiveId] = useState<BriefingId | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messageCounter = useRef(0);

  const [recapPrompt, setRecapPrompt] = useState(DEFAULT_RECAP_PROMPT);
  const [recapTime, setRecapTime] = useState(DEFAULT_RECAP_TIME);
  const [recapModalOpen, setRecapModalOpen] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState(DEFAULT_RECAP_PROMPT);
  const [draftTime, setDraftTime] = useState(DEFAULT_RECAP_TIME);

  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const { mounted: createMenuMounted, visible: createMenuVisible } =
    usePopoverTransition(createMenuOpen);

  const [playbookOpen, setPlaybookOpen] = useState(false);

  const [attentionInboxOpen, setAttentionInboxOpen] = useState(false);
  const [createRecapOpen, setCreateRecapOpen] = useState(false);
  const [newRecapPrompt, setNewRecapPrompt] = useState('');
  const [newRecapTool, setNewRecapTool] = useState<RecapTool>('github');
  const [customRecaps, setCustomRecaps] = useState<CustomRecap[]>([]);
  const [activeRecapId, setActiveRecapId] = useState<string | null>(null);
  const [automationPrefill, setAutomationPrefill] = useState<string | undefined>();
  const [promptFormTarget, setPromptFormTarget] = useState<'new' | string | null>(
    null
  );
  const [activeMattyCodeTaskId, setActiveMattyCodeTaskId] = useState<string | null>(
    null
  );
  const [superAgents, setSuperAgents] = useState<SuperAgent[]>(
    DEFAULT_SUPER_AGENTS
  );
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>(
    DEFAULT_CUSTOM_PROMPTS
  );

  useEffect(() => {
    if (!intent) return;
    if (intent.type === 'create-automation') {
      setPlaybookOpen(false);
      setActiveId(null);
      setActiveRecapId(null);
      setMessages([]);
      setAutomationPrefill(intent.prefill);
      setAgentsPanel('automation-create');
      onIntentHandled();
      return;
    }
    if (intent.type === 'open-matty-code') {
      setPlaybookOpen(false);
      setActiveId(null);
      setActiveRecapId(null);
      setMessages([]);
      setActiveMattyCodeTaskId(null);
      setAgentsPanel('matty-code');
      onIntentHandled();
    }
  }, [intent, onIntentHandled]);

  const activeRecap = useMemo(
    () => customRecaps.find((r) => r.id === activeRecapId) ?? null,
    [customRecaps, activeRecapId]
  );

  useEffect(() => {
    if (!createMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const el = createMenuRef.current;
      const target = e.target as Node | null;
      if (!el || !target) return;
      if (el.contains(target)) return;
      const trigger = (target as HTMLElement).closest?.(
        '[aria-label="Create"]'
      );
      if (trigger) return;
      setCreateMenuOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCreateMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [createMenuOpen]);

  const openRecapModal = () => {
    setDraftPrompt(recapPrompt);
    setDraftTime(recapTime);
    setRecapModalOpen(true);
  };
  const closeRecapModal = () => setRecapModalOpen(false);
  const saveRecap = () => {
    setRecapPrompt(draftPrompt);
    setRecapTime(draftTime);
    setRecapModalOpen(false);
  };

  useEffect(() => {
    if (!recapModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRecapModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [recapModalOpen]);

  const openCreateRecap = () => {
    const tool = RECAP_TOOLS.find((t) => t.id === newRecapTool) ?? RECAP_TOOLS[0];
    setNewRecapPrompt(tool.defaultPrompt);
    setCreateRecapOpen(true);
  };
  const closeCreateRecap = () => setCreateRecapOpen(false);
  const selectRecapTool = (tool: RecapTool) => {
    const meta = RECAP_TOOLS.find((t) => t.id === tool) ?? RECAP_TOOLS[0];
    setNewRecapTool(tool);
    setNewRecapPrompt(meta.defaultPrompt);
  };
  const createRecap = () => {
    if (!newRecapPrompt.trim()) return;
    const meta = RECAP_TOOLS.find((t) => t.id === newRecapTool) ?? RECAP_TOOLS[0];
    const recap: CustomRecap = {
      id: `recap-${Date.now()}`,
      label: meta.defaultLabel,
      prompt: newRecapPrompt,
      tool: newRecapTool,
    };
    setCustomRecaps((prev) => [...prev, recap]);
    setCreateRecapOpen(false);
    setPlaybookOpen(false);
    setActiveId(null);
    setActiveRecapId(recap.id);
    setPromptFormTarget(null);
    setAgentsPanel('custom-prompts');
  };

  const openRecapDetail = (id: string) => {
    setPlaybookOpen(false);
    setActiveId(null);
    setMessages([]);
    setActiveRecapId(id);
    setPromptFormTarget(null);
    setAgentsPanel('custom-prompts');
  };

  useEffect(() => {
    if (!createRecapOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCreateRecap();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [createRecapOpen]);

  const handleSelectCreate = (action: 'recaps' | 'playbook' | 'board') => {
    setCreateMenuOpen(false);
    if (action === 'recaps') {
      openCreateRecap();
      return;
    }
    if (action === 'playbook') {
      setPlaybookOpen(true);
      setActiveId(null);
      setActiveRecapId(null);
      setAgentsPanel('create');
      return;
    }
    // 'board' is a no-op in this prototype.
  };

  const activeConversation = useMemo(
    () => (activeId ? CONVERSATIONS[activeId] : null),
    [activeId]
  );

  const nextId = (prefix: string) => {
    messageCounter.current += 1;
    return `${prefix}-${messageCounter.current}`;
  };

  const openConversation = (id: BriefingId) => {
    const convo = CONVERSATIONS[id];
    messageCounter.current = 0;
    setPlaybookOpen(false);
    setActiveRecapId(null);
    setPromptFormTarget(null);
    setActiveId(id);
    setAgentsPanel('recaps');
    setMessages(
      id === 'mentions'
        ? []
        : [
            {
              id: nextId('a'),
              role: 'assistant',
              text: convo.starter.text,
              list: convo.starter.list,
              posts: convo.starter.posts,
              chips: convo.starter.chips,
            },
          ]
    );
  };

  const handleChip = (chip: QuickReply) => {
    setMessages((prev) => [
      ...prev,
      {
        id: nextId('u'),
        role: 'user',
        text: chip.userText ?? chip.label,
      },
      {
        id: nextId('a'),
        role: 'assistant',
        text: chip.reply,
        list: chip.list,
        posts: chip.posts,
      },
    ]);
  };

  const goToRecaps = () => {
    setActiveId(null);
    setMessages([]);
    setPlaybookOpen(false);
    setActiveRecapId(null);
    setPromptFormTarget(null);
    setActiveMattyCodeTaskId(null);
    setAttentionInboxOpen(false);
    setAgentsPanel('recaps');
  };

  const openCreatePanel = () => {
    setPlaybookOpen(false);
    setActiveId(null);
    setActiveRecapId(null);
    setPromptFormTarget(null);
    setActiveMattyCodeTaskId(null);
    setMessages([]);
    setAgentsPanel('create');
  };

  const handleCreateCardClick = (id: string) => {
    if (id === 'agent') {
      openAgentCreate();
      return;
    }
    if (id === 'wikis') {
      openWikiCreate();
      return;
    }
    if (id === 'playbook') {
      handleSelectCreate('playbook');
      return;
    }
    if (id === 'board') {
      handleSelectCreate('board');
    }
  };

  const openAutomationsManage = () => {
    setPlaybookOpen(false);
    setActiveId(null);
    setActiveRecapId(null);
    setPromptFormTarget(null);
    setMessages([]);
    setAgentsPanel('automations');
  };

  const openAgentsManage = () => {
    setPlaybookOpen(false);
    setActiveId(null);
    setActiveRecapId(null);
    setPromptFormTarget(null);
    setActiveMattyCodeTaskId(null);
    setMessages([]);
    setAgentsPanel('agents');
  };

  const openAgentCreate = () => {
    setPlaybookOpen(false);
    setActiveId(null);
    setActiveRecapId(null);
    setPromptFormTarget(null);
    setActiveMattyCodeTaskId(null);
    setMessages([]);
    setAgentsPanel('agent-create');
  };

  const handleAgentCreated = (agent: SuperAgent) => {
    setSuperAgents((prev) => [...prev, agent]);
    setAgentsPanel('agents');
  };

  const openMattyCode = () => {
    setPlaybookOpen(false);
    setActiveId(null);
    setActiveRecapId(null);
    setPromptFormTarget(null);
    setActiveMattyCodeTaskId(null);
    setMessages([]);
    setAgentsPanel('matty-code');
  };

  const openMattyCodeTask = (taskId: string) => {
    setPlaybookOpen(false);
    setActiveId(null);
    setActiveRecapId(null);
    setPromptFormTarget(null);
    setMessages([]);
    setActiveMattyCodeTaskId(taskId);
    setAgentsPanel('matty-code');
  };

  const openAutomationCreate = (prefill?: string) => {
    setPlaybookOpen(false);
    setActiveId(null);
    setActiveRecapId(null);
    setPromptFormTarget(null);
    setMessages([]);
    setAutomationPrefill(prefill);
    setAgentsPanel('automation-create');
  };

  const handleAutomationCreated = (automation: ChannelAutomation) => {
    onAutomationsChange([...automations, automation]);
    setAutomationPrefill(undefined);
    setAgentsPanel('automations');
  };

  const openWikiCreate = () => {
    setPlaybookOpen(false);
    setActiveId(null);
    setActiveRecapId(null);
    setPromptFormTarget(null);
    setActiveMattyCodeTaskId(null);
    setMessages([]);
    setAgentsPanel('wiki-create');
  };

  const handleWikiCreated = (_wiki: WikiPageDraft) => {
    openCreatePanel();
  };

  const openCustomPromptsManage = () => {
    setPlaybookOpen(false);
    setActiveId(null);
    setActiveRecapId(null);
    setPromptFormTarget(null);
    setMessages([]);
    setAgentsPanel('custom-prompts');
  };

  const openCustomPromptCreate = () => {
    setPlaybookOpen(false);
    setActiveId(null);
    setActiveRecapId(null);
    setMessages([]);
    setAgentsPanel('custom-prompts');
    setPromptFormTarget('new');
  };

  const openCustomPromptDetail = (id: string) => {
    setPlaybookOpen(false);
    setActiveId(null);
    setActiveRecapId(null);
    setMessages([]);
    setAgentsPanel('custom-prompts');
    setPromptFormTarget(id);
  };

  const handleCustomPromptSave = (updated: CustomPrompt) => {
    setCustomPrompts((prev) =>
      prev.map((prompt) => (prompt.id === updated.id ? updated : prompt))
    );
  };

  const handleCustomPromptFormSave = (prompt: CustomPrompt) => {
    if (promptFormTarget === 'new') {
      setCustomPrompts((prev) => [...prev, prompt]);
    } else {
      handleCustomPromptSave(prompt);
    }
    setPromptFormTarget(null);
  };

  const editingPrompt = useMemo(
    () =>
      promptFormTarget && promptFormTarget !== 'new'
        ? customPrompts.find((prompt) => prompt.id === promptFormTarget) ?? null
        : null,
    [customPrompts, promptFormTarget]
  );

  const isRecapsHome =
    agentsPanel === 'recaps' &&
    activeId === null &&
    !playbookOpen &&
    !activeRecapId &&
    !promptFormTarget;

  return (
    <>
      <aside className={styles['product-switcher__agents-sidebar']}>
        <div className={styles['product-switcher__ai-header']}>
          <span className={styles['product-switcher__ai-title']}>AI</span>
          <div className={styles['product-switcher__ai-create']}>
            <IconButton
              size="X-Small"
              style="Inverted"
              padding="Compact"
              aria-label="Create"
              aria-haspopup="menu"
              aria-expanded={createMenuOpen}
              icon={<Icon size="16" glyph={<PlusIcon />} />}
              onClick={() => setCreateMenuOpen((o) => !o)}
            />

            {createMenuMounted && (
              <div
                ref={createMenuRef}
                role="menu"
                aria-label="Create"
                className={[
                  styles['product-switcher__create-menu'],
                  createMenuVisible
                    ? styles['product-switcher__create-menu--visible']
                    : styles['product-switcher__create-menu--exiting'],
                ].join(' ')}
              >
              <MenuItem
                role="menuitem"
                label="Create new recap"
                leadingVisual={
                  <Icon size="20" glyph={<TextBoxOutlineIcon />} />
                }
                onClick={() => handleSelectCreate('recaps')}
              />
              <MenuItem
                role="menuitem"
                label="Create Playbook with AI"
                leadingVisual={
                  <Icon size="20" glyph={<ProductPlaybooksIcon />} />
                }
                onClick={() => handleSelectCreate('playbook')}
              />
              <MenuItem
                role="menuitem"
                label="Create Board with AI"
                leadingVisual={
                  <Icon size="20" glyph={<ProductBoardsIcon />} />
                }
                onClick={() => handleSelectCreate('board')}
              />
            </div>
          )}
          </div>
        </div>

        <div className={styles['product-switcher__ai-list']}>
          <button
            type="button"
            className={[
              styles['product-switcher__ai-item'],
              agentsPanel === 'create' && !playbookOpen
                ? styles['product-switcher__ai-item--active']
                : '',
              agentsPanel === 'create' && !playbookOpen
                ? styles['product-switcher__ai-item--accent']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={openCreatePanel}
          >
            <span className={styles['product-switcher__ai-item-icon']}>
              <Icon size="16" glyph={<CreationOutlineIcon />} />
            </span>
            <span className={styles['product-switcher__ai-item-label']}>
              Create
            </span>
          </button>
          <button
            type="button"
            className={[
              styles['product-switcher__ai-item'],
              isRecapsHome ? styles['product-switcher__ai-item--active'] : '',
              isRecapsHome ? styles['product-switcher__ai-item--accent'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={goToRecaps}
          >
            <span className={styles['product-switcher__ai-item-icon']}>
              <Icon size="16" glyph={<TextBoxOutlineIcon />} />
            </span>
            <span className={styles['product-switcher__ai-item-label']}>
              Recaps
            </span>
          </button>
        </div>

        <div className={styles['product-switcher__ai-section-label']}>
          Agents
        </div>
        <div className={styles['product-switcher__ai-list']}>
          <button
            type="button"
            className={[
              styles['product-switcher__ai-item'],
              agentsPanel === 'custom-prompts' ||
              promptFormTarget ||
              activeRecapId
                ? styles['product-switcher__ai-item--active']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={openCustomPromptsManage}
          >
            <span className={styles['product-switcher__ai-item-icon']}>
              <Icon size="16" glyph={<BookmarkOutlineIcon />} />
            </span>
            <span className={styles['product-switcher__ai-item-label']}>
              Custom prompts
            </span>
          </button>
          <button
            type="button"
            className={[
              styles['product-switcher__ai-item'],
              agentsPanel === 'automations' || agentsPanel === 'automation-create'
                ? styles['product-switcher__ai-item--active']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={openAutomationsManage}
          >
            <span className={styles['product-switcher__ai-item-icon']}>
              <Icon size="16" glyph={<LightningBoltOutlineIcon />} />
            </span>
            <span className={styles['product-switcher__ai-item-label']}>
              Automations
            </span>
          </button>
          <button
            type="button"
            className={[
              styles['product-switcher__ai-item'],
              agentsPanel === 'agents' || agentsPanel === 'agent-create'
                ? styles['product-switcher__ai-item--active']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={openAgentsManage}
          >
            <span className={styles['product-switcher__ai-item-icon']}>
              <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
            </span>
            <span className={styles['product-switcher__ai-item-label']}>
              All agents
            </span>
          </button>
        </div>

        <div className={styles['product-switcher__ai-section-label']}>
          Matty Code
        </div>
        <div className={styles['product-switcher__ai-list']}>
          <button
            type="button"
            className={[
              styles['product-switcher__ai-item'],
              agentsPanel === 'matty-code' && !activeMattyCodeTaskId
                ? styles['product-switcher__ai-item--active']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={openMattyCode}
          >
            <span className={styles['product-switcher__ai-item-icon']}>
              <Icon size="16" glyph={<CodeTagsIcon />} />
            </span>
            <span className={styles['product-switcher__ai-item-label']}>
              Overview
            </span>
          </button>
          {MATTY_CODE_IN_PROGRESS.map((task) => (
            <button
              key={task.id}
              type="button"
              className={[
                styles['product-switcher__ai-item'],
                agentsPanel === 'matty-code' &&
                activeMattyCodeTaskId === task.id
                  ? styles['product-switcher__ai-item--active']
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => openMattyCodeTask(task.id)}
              aria-label={`${task.ticket}: ${task.title}`}
            >
              <span className={styles['product-switcher__ai-item-icon']}>
                <Icon size="16" glyph={<ClockOutlineIcon />} />
              </span>
              <span className={styles['product-switcher__ai-item-label']}>
                {task.ticket}
              </span>
            </button>
          ))}
        </div>

        <div className={styles['product-switcher__ai-section-label']}>
          Recent Chats
        </div>
        <div className={styles['product-switcher__ai-list']}>
          {RECENT_CHATS.map(({ label, icon: ItemIcon, opens }) => (
            <button
              key={label}
              type="button"
              className={[
                styles['product-switcher__ai-item'],
                opens && activeId === opens
                  ? styles['product-switcher__ai-item--active']
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => opens && openConversation(opens)}
            >
              <span className={styles['product-switcher__ai-item-icon']}>
                <Icon size="16" glyph={<ItemIcon />} />
              </span>
              <span className={styles['product-switcher__ai-item-label']}>
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className={styles['product-switcher__ai-spacer']} />
      </aside>

      <div className={styles['product-switcher__inner-panel']}>
        {playbookOpen ? (
          <PlaybookGeneratorView
            onBack={() => {
              setPlaybookOpen(false);
              setAgentsPanel('create');
            }}
          />
        ) : activeRecap ? (
          <RecapDetailView
            recap={activeRecap}
            onBack={
              agentsPanel === 'custom-prompts'
                ? openCustomPromptsManage
                : goToRecaps
            }
          />
        ) : promptFormTarget && (promptFormTarget === 'new' || editingPrompt) ? (
          <CustomPromptFormView
            mode={promptFormTarget === 'new' ? 'create' : 'edit'}
            prompt={editingPrompt ?? undefined}
            onClose={() => setPromptFormTarget(null)}
            onSave={handleCustomPromptFormSave}
          />
        ) : agentsPanel === 'custom-prompts' ? (
          <CustomPromptsManageView
            prompts={customPrompts}
            recaps={customRecaps.map((recap) => {
              const meta =
                RECAP_TOOLS.find((t) => t.id === recap.tool) ?? RECAP_TOOLS[0];
              return {
                id: recap.id,
                label: recap.label,
                leadingVisual: meta.glyph,
              };
            })}
            onBack={goToRecaps}
            onCreatePrompt={openCustomPromptCreate}
            onSelectPrompt={openCustomPromptDetail}
            onSelectRecap={openRecapDetail}
          />
        ) : agentsPanel === 'matty-code' ? (
          <MattyCodeView
            taskId={activeMattyCodeTaskId}
            onBack={goToRecaps}
            onBackToOverview={() => setActiveMattyCodeTaskId(null)}
            onSelectTask={openMattyCodeTask}
          />
        ) : agentsPanel === 'automations' ? (
          <AutomationsManageView
            automations={automations}
            onAutomationsChange={onAutomationsChange}
            onBack={goToRecaps}
            onCreateAutomation={() => openAutomationCreate()}
          />
        ) : agentsPanel === 'agent-create' ? (
          <AgentCreateView
            onBack={openAgentsManage}
            onCreated={handleAgentCreated}
          />
        ) : agentsPanel === 'agents' ? (
          <AgentsManageView
            agents={superAgents}
            onBack={goToRecaps}
            onCreateAgent={openAgentCreate}
          />
        ) : agentsPanel === 'automation-create' ? (
          <AutomationCreateView
            prefill={automationPrefill}
            onBack={() => {
              setAutomationPrefill(undefined);
              openAutomationsManage();
            }}
            onSave={handleAutomationCreated}
          />
        ) : agentsPanel === 'wiki-create' ? (
          <WikiCreateView
            onBack={openCreatePanel}
            onSave={handleWikiCreated}
          />
        ) : agentsPanel === 'recaps' && attentionInboxOpen ? (
          <AttentionSeeAllView
            onBack={() => setAttentionInboxOpen(false)}
            onOpenBriefing={(id) => {
              setAttentionInboxOpen(false);
              openConversation(id);
            }}
          />
        ) : activeConversation && activeId === 'mentions' ? (
          <RepliesNeededView
            conversation={activeConversation}
            messages={messages}
            onBack={goToRecaps}
            onChip={handleChip}
          />
        ) : activeConversation ? (
          <ConversationView
            conversation={activeConversation}
            messages={messages}
            onBack={goToRecaps}
            onChip={handleChip}
          />
        ) : agentsPanel === 'recaps' ? (
        <>
        <Button
          className={styles['product-switcher__recap-trigger']}
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<CreationOutlineIcon />} />}
          onClick={openRecapModal}
        >
          Edit recap prompt
        </Button>
        <div className={styles['product-switcher__agents-center']}>
          <div className={styles['product-switcher__brand']}>
            <span className={styles['product-switcher__brand-icon']} aria-hidden>
              <Icon size="24" glyph={<TextBoxOutlineIcon />} />
            </span>
            <span className={styles['product-switcher__brand-name']}>
              Recaps
            </span>
          </div>

          <div className={styles['product-switcher__agents-input-wrapper']}>
            <MessageInput placeholder="Ask about today's recap or what needs your attention…" />
          </div>

          <div className={styles['product-switcher__for-you']}>
            <div className={styles['product-switcher__for-you-header']}>
              <div className={styles['product-switcher__for-you-heading']}>
                <span className={styles['product-switcher__for-you-title']}>
                  For you, Leonard
                </span>
                <span className={styles['product-switcher__for-you-subtitle']}>
                  Here's what needs your attention today
                </span>
              </div>
              <Button
                emphasis="Tertiary"
                size="Small"
                onClick={() => setAttentionInboxOpen(true)}
              >
                See all
              </Button>
            </div>

            <div className={styles['product-switcher__agents-cards']}>
              {BRIEFING_ITEMS.map((item) => (
                <AgentCard
                  key={item.id}
                  {...item}
                  onClick={() => openConversation(item.id)}
                />
              ))}
            </div>
          </div>
        </div>
        </>
        ) : agentsPanel === 'create' ? (
        <div className={styles['product-switcher__agents-center']}>
          <div className={styles['product-switcher__brand']}>
            <span className={styles['product-switcher__brand-icon']} aria-hidden>
              <Icon size="24" glyph={<CreationOutlineIcon />} />
            </span>
            <span className={styles['product-switcher__brand-name']}>
              Create
            </span>
          </div>

          <div className={styles['product-switcher__agents-input-wrapper']}>
            <MessageInput placeholder="Describe what you want to create…" />
          </div>

          <div className={styles['product-switcher__for-you']}>
            <div className={styles['product-switcher__for-you-header']}>
              <div className={styles['product-switcher__for-you-heading']}>
                <span className={styles['product-switcher__for-you-title']}>
                  Start something new
                </span>
                <span className={styles['product-switcher__for-you-subtitle']}>
                  Pick a template or describe it in the input above
                </span>
              </div>
            </div>

            <div className={styles['product-switcher__agents-cards']}>
              {CREATE_ITEMS.map((item) => (
                <AgentCard
                  key={item.id}
                  icon={item.icon}
                  tone={item.tone}
                  eyebrow={item.eyebrow}
                  title={item.title}
                  subtitle={item.subtitle}
                  onClick={() => handleCreateCardClick(item.id)}
                />
              ))}
            </div>
          </div>
        </div>
        ) : null}
      </div>

      {recapModalOpen && (
        <div
          className={styles['product-switcher__modal-backdrop']}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeRecapModal();
          }}
        >
          <Modal
            title="Edit recap prompt"
            subtitle="Runs each weekday morning to assemble what needs your attention."
            size="Medium"
            onClose={closeRecapModal}
            footer={
              <>
                <Button emphasis="Tertiary" onClick={closeRecapModal}>
                  Cancel
                </Button>
                <Button onClick={saveRecap}>Save changes</Button>
              </>
            }
          >
            <div className={styles['product-switcher__recap-form']}>
              <div className={styles['product-switcher__recap-schedule']}>
                <span className={styles['product-switcher__recap-schedule-icon']}>
                  <Icon size="16" glyph={<ClockOutlineIcon />} />
                </span>
                <div className={styles['product-switcher__recap-schedule-text']}>
                  <span className={styles['product-switcher__recap-schedule-label']}>
                    Run each weekday at
                  </span>
                  <span className={styles['product-switcher__recap-schedule-hint']}>
                    Local time. Skips weekends and company holidays.
                  </span>
                </div>
                <input
                  type="time"
                  className={styles['product-switcher__recap-time']}
                  value={draftTime}
                  onChange={(e) => setDraftTime(e.target.value)}
                  aria-label="Recap run time"
                />
              </div>

              <TextArea
                className={styles['product-switcher__recap-textarea']}
                label="Prompt"
                value={draftPrompt}
                onChange={(e) => setDraftPrompt(e.target.value)}
                rows={12}
              />

              <p className={styles['product-switcher__recap-helper']}>
                The agent uses this prompt to gather mentions, tasks, meetings,
                and decisions across Channels, Jira, Boards and Playbooks before
                showing your <strong>For you</strong> cards.
              </p>
            </div>
          </Modal>
        </div>
      )}

      {createRecapOpen && (
        <div
          className={styles['product-switcher__modal-backdrop']}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeCreateRecap();
          }}
        >
          <Modal
            title="Create new recap"
            subtitle="Pick the source you want to summarise and tell the agent what to gather."
            size="Medium"
            onClose={closeCreateRecap}
            footer={
              <>
                <Button emphasis="Tertiary" onClick={closeCreateRecap}>
                  Cancel
                </Button>
                <Button
                  onClick={createRecap}
                  disabled={!newRecapPrompt.trim()}
                >
                  Create recap
                </Button>
              </>
            }
          >
            <div className={styles['product-switcher__recap-form']}>
              <TextArea
                className={styles['product-switcher__recap-textarea']}
                label="Prompt"
                value={newRecapPrompt}
                onChange={(e) => setNewRecapPrompt(e.target.value)}
                rows={8}
              />

              <div className={styles['product-switcher__mcp-row']}>
                <span className={styles['product-switcher__mcp-row-label']}>
                  MCPs accessed
                </span>
                <div className={styles['product-switcher__mcp-row-chips']}>
                  {RECAP_TOOLS.map((tool) => {
                    const selected = newRecapTool === tool.id;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        className={[
                          styles['product-switcher__mcp-chip'],
                          selected
                            ? styles['product-switcher__mcp-chip--selected']
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => selectRecapTool(tool.id)}
                        aria-pressed={selected}
                      >
                        <span className={styles['product-switcher__mcp-chip-logo']}>
                          {tool.glyph}
                        </span>
                        <span className={styles['product-switcher__mcp-chip-name']}>
                          {tool.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Briefing items + conversation data
// ---------------------------------------------------------------------------

type BriefingId = 'mentions' | 'tasks' | 'standup' | 'decision';
type CardTone = 'info' | 'warning' | 'danger' | 'success';
type SourceId = 'channels' | 'playbooks' | 'boards' | 'jira';

interface BriefingItem {
  id: BriefingId;
  icon: ComponentType<{ size?: number }>;
  tone: CardTone;
  eyebrow: string;
  title: string;
  subtitle: string;
  sources: SourceId[];
}

interface SourceMeta {
  label: string;
  brand: string;
  glyph: ReactNode;
}

function MattermostGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      aria-hidden
      focusable="false"
    >
      <rect x="2" y="2" width="60" height="60" rx="14" fill="#1B68B3" />
      <path
        d="M19 44V20h6l7 14 7-14h6v24h-5V28l-6 12h-4l-6-12v16h-5z"
        fill="#ffffff"
      />
    </svg>
  );
}

function GitHubGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        fill="#181717"
        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
      />
    </svg>
  );
}

function JiraGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient
          id="product-switcher-jira-a"
          gradientUnits="userSpaceOnUse"
          x1="22.034"
          y1="9.773"
          x2="17.118"
          y2="14.842"
          gradientTransform="scale(4)"
        >
          <stop offset=".176" stopColor="#0052cc" />
          <stop offset="1" stopColor="#2684ff" />
        </linearGradient>
        <linearGradient
          id="product-switcher-jira-b"
          gradientUnits="userSpaceOnUse"
          x1="16.641"
          y1="15.564"
          x2="10.957"
          y2="21.094"
          gradientTransform="scale(4)"
        >
          <stop offset=".176" stopColor="#0052cc" />
          <stop offset="1" stopColor="#2684ff" />
        </linearGradient>
      </defs>
      <path
        d="M108.023 16H61.805c0 11.52 9.324 20.848 20.847 20.848h8.5v8.226c0 11.52 9.328 20.848 20.848 20.848V19.977A3.98 3.98 0 00108.023 16zm0 0"
        fill="#2684ff"
      />
      <path
        d="M85.121 39.04H38.902c0 11.519 9.325 20.847 20.844 20.847h8.504v8.226c0 11.52 9.328 20.848 20.848 20.848V43.016a3.983 3.983 0 00-3.977-3.977zm0 0"
        fill="url(#product-switcher-jira-a)"
      />
      <path
        d="M62.219 62.078H16c0 11.524 9.324 20.848 20.848 20.848h8.5v8.23c0 11.52 9.328 20.844 20.847 20.844V66.059a3.984 3.984 0 00-3.976-3.98zm0 0"
        fill="url(#product-switcher-jira-b)"
      />
    </svg>
  );
}

const SOURCES: Record<SourceId, SourceMeta> = {
  channels: {
    label: 'Channels',
    brand: 'var(--button-bg)',
    glyph: <ProductChannelsIcon />,
  },
  playbooks: {
    label: 'Playbooks',
    brand: '#46b072',
    glyph: <ProductPlaybooksIcon />,
  },
  boards: {
    label: 'Boards',
    brand: '#1592e0',
    glyph: <ProductBoardsIcon />,
  },
  jira: {
    label: 'Jira',
    brand: '#2684ff',
    glyph: <JiraGlyph />,
  },
};

const BRIEFING_ITEMS: BriefingItem[] = [
  {
    id: 'mentions',
    icon: AtIcon,
    tone: 'info',
    eyebrow: '3 mentions',
    title: 'Replies needed',
    subtitle: 'Sofia, Marco and Aiko are waiting on you',
    sources: ['channels'],
  },
  {
    id: 'tasks',
    icon: CheckboxMarkedCircleOutlineIcon,
    tone: 'warning',
    eyebrow: '2 tasks due today',
    title: 'Review UI redesign',
    subtitle: 'Q2 retro notes also due by 5 PM',
    sources: ['jira', 'channels'],
  },
  {
    id: 'standup',
    icon: CalendarCheckOutlineIcon,
    tone: 'success',
    eyebrow: 'In 25 minutes',
    title: 'Engineering standup',
    subtitle: 'Roadmap review follows at 10:30 AM',
    sources: ['playbooks'],
  },
  {
    id: 'decision',
    icon: AlertCircleOutlineIcon,
    tone: 'danger',
    eyebrow: 'Decision needed',
    title: 'Approve pricing tier',
    subtitle: 'Blocking #product release',
    sources: ['channels', 'boards'],
  },
];

type AttentionRequestTag =
  | 'Mention'
  | 'Reply needed'
  | 'Approval requested'
  | 'Task due'
  | 'Meeting soon'
  | 'Decision needed'
  | 'Blocked by you';

interface AttentionItem {
  id: string;
  briefingId: BriefingId;
  requestTag: AttentionRequestTag;
  tagType: LabelTagType;
  authorName: string;
  channelLabel: string;
  previewText: string;
  timestamp: string;
  threadTitle?: string;
  replyCount?: number;
  badge?: 'Mention' | 'Unread' | 'None';
  mentionCount?: number;
  participants?: UserAvatarGroupItem[];
  detailTitle: string;
  detailBody: string;
  detailList?: DetailItem[];
  openLabel: string;
}

const ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: 'mention-sofia',
    briefingId: 'mentions',
    requestTag: 'Reply needed',
    tagType: 'Info',
    authorName: 'Sofia Bauer',
    channelLabel: formatChannelLabel('town-square'),
    previewText:
      '@leonard reminder that the Q2 roadmap review is at 10:30 today. Agenda is in the thread below.',
    timestamp: '9:02 AM',
    replyCount: 7,
    badge: 'Mention',
    mentionCount: 1,
    participants: [{ key: 'sofia', name: 'Sofia Bauer', src: avatarSofia }],
    detailTitle: 'Reply to Sofia',
    detailBody:
      'Sofia pinged you about the Q2 roadmap review at 10:30. No decisions pending — a quick acknowledgment is enough.',
    openLabel: 'Open replies needed',
  },
  {
    id: 'mention-marco',
    briefingId: 'mentions',
    requestTag: 'Mention',
    tagType: 'Info Dim',
    authorName: 'Marco Rinaldi',
    channelLabel: formatChannelLabel('town-square'),
    previewText:
      '@leonard just pushed the updated onboarding flow to staging — would love a second pair of eyes on the empty states.',
    timestamp: '9:14 AM',
    replyCount: 4,
    badge: 'Mention',
    mentionCount: 1,
    participants: [{ key: 'marco', name: 'Marco Rinaldi', src: avatarMarco }],
    detailTitle: "Review Marco's staging build",
    detailBody:
      'Marco needs design and copy feedback on onboarding empty states before the release cut.',
    openLabel: 'Open replies needed',
  },
  {
    id: 'mention-aiko',
    briefingId: 'mentions',
    requestTag: 'Reply needed',
    tagType: 'Info',
    authorName: 'Aiko Tan',
    channelLabel: formatChannelLabel('design'),
    previewText:
      '@leonard can you take a look at the empty state copy when you have a sec? I think the tone is off.',
    timestamp: 'Yesterday',
    replyCount: 2,
    badge: 'Mention',
    mentionCount: 1,
    participants: [{ key: 'aiko', name: 'Aiko Tan', src: avatarAikoTan }],
    detailTitle: 'Empty state copy review',
    detailBody:
      'Aiko wants a second opinion on the no-channels-yet screen before she ships the update.',
    openLabel: 'Open replies needed',
  },
  {
    id: 'task-ui-redesign',
    briefingId: 'tasks',
    requestTag: 'Task due',
    tagType: 'Warning',
    authorName: 'Design team',
    channelLabel: 'JIRA',
    threadTitle: 'Review UI redesign',
    previewText: 'Due today at 5 PM · 12 screens updated since your last pass.',
    timestamp: 'Due 5 PM',
    replyCount: 0,
    participants: [],
    detailTitle: 'Review UI redesign',
    detailBody:
      'Four open comments from Aiko and Sofia still need a reply or resolution before you can ship the review.',
    detailList: [
      {
        primary: 'Onboarding (5 screens)',
        secondary: 'New empty states and reordered welcome flow.',
      },
      {
        primary: 'Settings (4 screens)',
        secondary: 'Notification grouping and simplified account section.',
      },
    ],
    openLabel: 'Open tasks due today',
  },
  {
    id: 'task-retro',
    briefingId: 'tasks',
    requestTag: 'Task due',
    tagType: 'Warning',
    authorName: 'Leonard Riley',
    channelLabel: 'NOTES',
    threadTitle: 'Q2 retro notes',
    previewText: 'Due today at 5 PM · outline ready in your drafts.',
    timestamp: 'Due 5 PM',
    replyCount: 0,
    participants: [],
    detailTitle: 'Finish Q2 retro notes',
    detailBody:
      'Your outline needs three wins, three risks, and next steps before you share with the team.',
    openLabel: 'Open tasks due today',
  },
  {
    id: 'standup',
    briefingId: 'standup',
    requestTag: 'Meeting soon',
    tagType: 'Success',
    authorName: 'Playbooks',
    channelLabel: 'ENGINEERING',
    threadTitle: 'Engineering standup',
    previewText: 'Starts in 25 minutes · roadmap review follows at 10:30 AM.',
    timestamp: 'In 25 min',
    replyCount: 0,
    participants: [],
    detailTitle: 'Engineering standup',
    detailBody:
      "Matty assembled standup notes from yesterday's threads and your open work for today.",
    detailList: [
      {
        primary: 'Today',
        secondary:
          'Pricing tier decision in #product, Q2 roadmap review, finish UI redesign review.',
      },
      {
        primary: 'Blockers',
        secondary:
          'Waiting on design review from Aiko on 4 empty states before merging onboarding flow.',
      },
    ],
    openLabel: 'Open standup prep',
  },
  {
    id: 'decision-pricing',
    briefingId: 'decision',
    requestTag: 'Approval requested',
    tagType: 'Danger',
    authorName: 'Sasha Cole',
    channelLabel: formatChannelLabel('product'),
    previewText:
      'Mid-tier Team plan at $12/user needs your call before Friday — blocking the Q2 release branch.',
    timestamp: '3 days ago',
    replyCount: 3,
    participants: [{ key: 'sasha', name: 'Sasha Cole', src: avatarDariusCole }],
    detailTitle: 'Approve pricing tier',
    detailBody:
      'You are the tiebreaker on the Team plan proposal. The release is blocked until this is decided.',
    detailList: [
      {
        primary: 'Where it stands',
        secondary: '2 in favor, 1 wants more info, you have not weighed in yet.',
      },
      {
        primary: 'Recommendation',
        secondary:
          'Approve with a follow-up note clarifying enterprise tier limits.',
      },
    ],
    openLabel: 'Open decision',
  },
  {
    id: 'blocker-onboarding',
    briefingId: 'standup',
    requestTag: 'Blocked by you',
    tagType: 'Warning',
    authorName: 'Marco Rinaldi',
    channelLabel: formatChannelLabel('town-square'),
    threadTitle: 'Onboarding flow release',
    previewText:
      'Marco is waiting on your empty-state review before merging to main.',
    timestamp: 'This morning',
    replyCount: 1,
    participants: [{ key: 'marco', name: 'Marco Rinaldi', src: avatarMarco }],
    detailTitle: 'You are blocking onboarding',
    detailBody:
      'Marco cannot cut the release until you finish reviewing four empty states on staging.',
    openLabel: 'Open standup prep',
  },
];

interface CreateCardItem {
  id: string;
  icon: ComponentType<{ size?: number }>;
  tone: CardTone;
  eyebrow: string;
  title: string;
  subtitle: string;
}

const CREATE_ITEMS: CreateCardItem[] = [
  {
    id: 'agent',
    icon: AccountPlusOutlineIcon,
    tone: 'info',
    eyebrow: 'Super Agent',
    title: 'Create Agent',
    subtitle: 'Spin up a dedicated agent with tools and a system prompt.',
  },
  {
    id: 'board',
    icon: ProductBoardsIcon,
    tone: 'info',
    eyebrow: 'Boards',
    title: 'Create Board',
    subtitle: 'Start from a blank board or describe one with AI.',
  },
  {
    id: 'wikis',
    icon: BookOutlineIcon,
    tone: 'success',
    eyebrow: 'Wikis',
    title: 'Create Wikis',
    subtitle: 'Draft a wiki page structure from notes or a brief.',
  },
  {
    id: 'playbook',
    icon: ProductPlaybooksIcon,
    tone: 'warning',
    eyebrow: 'Playbooks',
    title: 'Create Playbook',
    subtitle: 'Generate a checklist workflow from a goal or template.',
  },
];

interface DetailItem {
  primary: string;
  secondary?: string;
}

interface PostPreview {
  /** Optional channel breadcrumb shown above the post. */
  channel?: string;
  /** When true, the channel is private. */
  privateChannel?: boolean;
  avatarSrc: string;
  avatarAlt: string;
  username: string;
  timestamp: string;
  body: string;
  /** When true, marks the post as a draft preview (e.g. an unsent reply). */
  draft?: boolean;
  /** Per-post action buttons (e.g. "Draft a reply" / "Send" / "Tweak"). */
  actions?: QuickReply[];
}

interface QuickReply {
  label: string;
  /** Text shown as the user message. Defaults to label. */
  userText?: string;
  reply: string;
  list?: DetailItem[];
  posts?: PostPreview[];
  /** When true, render with primary button styling. */
  primary?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  list?: DetailItem[];
  posts?: PostPreview[];
  chips?: QuickReply[];
}

interface BriefingConversation {
  topic: string;
  topicIcon: ComponentType<{ size?: number }>;
  starter: Omit<ChatMessage, 'id' | 'role'>;
}

/**
 * Builds a 2-variant draft cycle so a "Rewrite" action is always available.
 * Clicking Rewrite on the first variant shows the second; clicking Rewrite on
 * the second shows the first. Both variants keep their Send action.
 */
function buildRewritableDraft(opts: {
  channel: string;
  privateChannel?: boolean;
  name: string;
  variantA: string;
  variantB: string;
  introA: string;
  introB: string;
}): PostPreview {
  const { channel, privateChannel, name, variantA, variantB, introA, introB } =
    opts;

  const sendAction: QuickReply = {
    label: 'Send',
    userText: `Send the reply to ${name}`,
    primary: true,
    reply: `Sent your reply to ${name} in #${channel}. ✓`,
  };

  const draftA: PostPreview = {
    channel,
    privateChannel,
    avatarSrc: avatarLeonard,
    avatarAlt: 'Leonard Riley',
    username: 'Leonard Riley',
    timestamp: 'draft',
    draft: true,
    body: variantA,
    actions: [],
  };
  const draftB: PostPreview = {
    channel,
    privateChannel,
    avatarSrc: avatarLeonard,
    avatarAlt: 'Leonard Riley',
    username: 'Leonard Riley',
    timestamp: 'draft · v2',
    draft: true,
    body: variantB,
    actions: [],
  };

  draftA.actions = [
    {
      label: 'Rewrite',
      userText: `Rewrite the draft for ${name}`,
      reply: introB,
      posts: [draftB],
    },
    sendAction,
  ];
  draftB.actions = [
    {
      label: 'Rewrite',
      userText: `Rewrite the draft for ${name}`,
      reply: introA,
      posts: [draftA],
    },
    sendAction,
  ];

  return draftA;
}

const CONVERSATIONS: Record<BriefingId, BriefingConversation> = {
  mentions: {
    topic: 'Replies needed',
    topicIcon: AtIcon,
    starter: {
      text: "Hi Leonard — you've got 3 mentions waiting on a reply. Here's each one in context. I can draft a reply for any of them when you're ready.",
      posts: [
        {
          channel: 'town-square',
          avatarSrc: avatarSofia,
          avatarAlt: 'Sofia Bauer',
          username: 'Sofia Bauer',
          timestamp: '9:02 AM',
          body: '@leonard reminder that the Q2 roadmap review is at 10:30 today. Agenda is in the thread below.',
          actions: [
            {
              label: 'Open thread',
              userText: "Open Sofia's thread",
              reply:
                "Opened Sofia's thread in #town-square. The full conversation is in the side panel.",
            },
            {
              label: 'Draft a reply',
              userText: 'Draft a reply to Sofia',
              primary: true,
              reply:
                "Here's a draft reply to Sofia. Tweak it or send when you're ready.",
              posts: [
                buildRewritableDraft({
                  channel: 'town-square',
                  name: 'Sofia',
                  variantA:
                    "Thanks Sofia — joining at 10:30. I'll come with the spec changes from yesterday so we can lock the roadmap order.",
                  variantB:
                    "Got it Sofia — I'll be at 10:30 with yesterday's spec updates so we can lock the roadmap order on the call.",
                  introB: "Here's another take — a bit more direct:",
                  introA: 'Switching back to the warmer version:',
                }),
              ],
            },
          ],
        },
        {
          channel: 'town-square',
          avatarSrc: avatarMarco,
          avatarAlt: 'Marco Rinaldi',
          username: 'Marco Rinaldi',
          timestamp: '9:14 AM',
          body: '@leonard just pushed the updated onboarding flow to staging — would love a second pair of eyes on the empty states before we cut a release.',
          actions: [
            {
              label: 'Open thread',
              userText: "Open Marco's thread",
              reply: "Opened Marco's thread in #town-square.",
            },
            {
              label: 'Draft a reply',
              userText: 'Draft a reply to Marco',
              primary: true,
              reply:
                "Here's a draft reply to Marco. Tweak it or send when you're ready.",
              posts: [
                buildRewritableDraft({
                  channel: 'town-square',
                  name: 'Marco',
                  variantA:
                    'Looking now — will leave comments inline before standup. Loving the new illustrations 🎉',
                  variantB:
                    "On it — I'll review the empty states this morning and drop inline comments before standup. The illustrations are great.",
                  introB: "Here's another take — more focused on next steps:",
                  introA: 'Going back to the casual version:',
                }),
              ],
            },
          ],
        },
        {
          channel: 'design',
          privateChannel: true,
          avatarSrc: avatarAikoTan,
          avatarAlt: 'Aiko Tan',
          username: 'Aiko Tan',
          timestamp: 'yesterday',
          body: '@leonard can you take a look at the empty state copy when you have a sec? I think the tone is off on the "no channels yet" screen.',
          actions: [
            {
              label: 'Open thread',
              userText: "Open Aiko's thread",
              reply: "Opened Aiko's thread in #design.",
            },
            {
              label: 'Draft a reply',
              userText: 'Draft a reply to Aiko',
              primary: true,
              reply:
                "Here's a draft reply to Aiko. Tweak it or send when you're ready.",
              posts: [
                buildRewritableDraft({
                  channel: 'design',
                  privateChannel: true,
                  name: 'Aiko',
                  variantA:
                    "Picking this up after standup. I'll suggest a couple of friendlier variants and tag you for a quick review.",
                  variantB:
                    "Will tackle this right after standup, Aiko. I'll ping you with two warmer variants for the no-channels-yet screen so you can pick a direction.",
                  introB: "Here's another take — warmer and a bit more specific:",
                  introA: 'Switching back to the shorter version:',
                }),
              ],
            },
          ],
        },
      ],
      chips: [
        {
          label: 'Summarize each thread',
          reply:
            "Here's a one-line summary per thread so you can decide which to dive into first:",
          list: [
            {
              primary: 'Sofia · Q2 roadmap review',
              secondary: 'Logistics only — no decisions pending. Low effort.',
            },
            {
              primary: 'Marco · Onboarding flow on staging',
              secondary:
                'Needs design + copy review on 4 empty states before release.',
            },
            {
              primary: 'Aiko · Empty state copy',
              secondary:
                'Wants a second opinion on tone — quick to unblock her.',
            },
          ],
        },
        {
          label: 'Snooze until after standup',
          reply:
            "Snoozed all three threads until 10:00 AM. I'll bump them back into your inbox right after standup.",
        },
      ],
    },
  },
  tasks: {
    topic: 'Tasks due today',
    topicIcon: CheckboxMarkedCircleOutlineIcon,
    starter: {
      text: "Two tasks land today. Here's what each one needs from you:",
      list: [
        {
          primary: 'Review UI redesign · due 5 PM',
          secondary:
            '12 screens updated since your last pass. 4 open comments from Aiko and Sofia.',
        },
        {
          primary: 'Q2 retro notes · due 5 PM',
          secondary:
            "Outline ready in your drafts — needs 3 wins, 3 risks, and next steps.",
        },
      ],
      chips: [
        {
          label: 'Walk me through what changed',
          reply:
            "Here are the changes worth your time on the redesign — I've grouped them by theme:",
          list: [
            {
              primary: 'Onboarding (5 screens)',
              secondary:
                'New empty states, reordered welcome flow, new "skip" affordance on every step.',
            },
            {
              primary: 'Settings (4 screens)',
              secondary:
                'Notification grouping, new appearance tab, simpler account section.',
            },
            {
              primary: 'Channel header (3 screens)',
              secondary:
                'Repositioned member avatars, new pinned messages affordance.',
            },
          ],
        },
        {
          label: 'Show open comments',
          reply:
            "Four comments still need a reply or resolution before you can ship the review:",
          list: [
            {
              primary: 'Aiko · Empty state copy',
              secondary:
                'Asking for a friendlier tone on the "no channels yet" screen.',
            },
            {
              primary: 'Aiko · Skip affordance',
              secondary:
                "Wants to confirm the skip button doesn't exit the entire flow.",
            },
            {
              primary: 'Sofia · Member avatars',
              secondary:
                'Suggesting a +N badge when over 5 members are visible.',
            },
            {
              primary: 'Sofia · Notification grouping',
              secondary:
                'Wants to confirm grouping rules for muted channels.',
            },
          ],
        },
        {
          label: 'Draft my Q2 retro notes',
          reply:
            "Drafted your retro notes from this quarter's threads, decisions, and shipped work. Edit anything before you share:",
          list: [
            {
              primary: 'Wins',
              secondary:
                'Calls GA, redesigned onboarding, search performance up 38%.',
            },
            {
              primary: 'Risks',
              secondary:
                'Pricing tier still unresolved, CI flake rate climbing, on-call coverage gap in EU.',
            },
            {
              primary: 'Next steps',
              secondary:
                'Lock pricing this week, audit flaky tests, recruit one EU SRE.',
            },
          ],
        },
      ],
    },
  },
  standup: {
    topic: 'Engineering standup',
    topicIcon: CalendarCheckOutlineIcon,
    starter: {
      text: "Standup is in 25 minutes. Here's a starter you can read straight from:",
      list: [
        {
          primary: 'Yesterday',
          secondary:
            'Shipped the product switcher menu, reviewed Marco\'s onboarding PR, paired with Aiko on empty state copy.',
        },
        {
          primary: 'Today',
          secondary:
            'Pricing tier decision in #product, kick off Q2 roadmap review, finish UI redesign review.',
        },
        {
          primary: 'Blockers',
          secondary:
            'Waiting on design review from Aiko on 4 empty states before merging onboarding flow.',
        },
      ],
      chips: [
        {
          label: 'Use as my standup notes',
          reply:
            "Saved as your standup notes for today. I'll keep them open in the call so you can read directly.",
        },
        {
          label: 'Send to #engineering',
          reply:
            "Posted your standup to #engineering as a thread. I tagged Aiko on the blocker so she's pulled in.",
        },
        {
          label: "What's the team status?",
          reply:
            "Quick read on the team going into standup — based on yesterday's threads and PR activity:",
          list: [
            {
              primary: 'Marco — green',
              secondary:
                'Onboarding flow on staging, no blockers, ready for design review.',
            },
            {
              primary: 'Aiko — yellow',
              secondary:
                'Pulled into 3 reviews. Likely needs help offloading something today.',
            },
            {
              primary: 'Arjun — out',
              secondary:
                "Heads up: he's out Friday afternoon. Leila is the on-call backup.",
            },
          ],
        },
      ],
    },
  },
  decision: {
    topic: 'Approve pricing tier',
    topicIcon: AlertCircleOutlineIcon,
    starter: {
      text: "This decision is blocking #product. Here's the original proposal:",
      posts: [
        {
          channel: 'product',
          privateChannel: true,
          avatarSrc: avatarDariusCole,
          avatarAlt: 'Sasha Cole',
          username: 'Sasha Cole',
          timestamp: '3 days ago',
          body: 'Proposal: introduce a mid-tier "Team" plan at $12/user, sitting between Free and Enterprise. Targets the gap we keep hearing about from <50 seat orgs. Need a call before Friday so we can include it in the Q2 release branch.',
        },
      ],
      list: [
        {
          primary: 'Where it stands',
          secondary:
            '2 in favor (Sasha, Priya), 1 wants more info (Devon), you are the tiebreaker.',
        },
        {
          primary: 'My recommendation',
          secondary:
            'Approve with a follow-up note clarifying enterprise tier limits — risk is low and the release is blocked otherwise.',
        },
      ],
      chips: [
        {
          label: 'Approve and post in #product',
          reply:
            "Posted your approval in #product and pinged @Sasha to update the release branch. I added a note about the enterprise tier limit follow-up so it doesn't get lost.",
        },
        {
          label: 'Ask Sasha for more context',
          reply:
            "Asked Sasha three clarifying questions in DM. I'll surface her replies as soon as they come back:",
          list: [
            {
              primary: 'Q1',
              secondary:
                'How does the new tier affect existing Enterprise contracts in the next 90 days?',
            },
            {
              primary: 'Q2',
              secondary:
                'What is the projected churn impact from Free → Team conversion?',
            },
            {
              primary: 'Q3',
              secondary:
                'Are there any regions where this pricing needs localization?',
            },
          ],
        },
        {
          label: 'Defer to product review on Friday',
          reply:
            "Deferred the decision to Friday's product review. I'll add it to the agenda and let Sasha know the release will slip by 2 days.",
        },
      ],
    },
  },
};

interface AgentCardProps {
  icon: ComponentType<{ size?: number }>;
  tone: CardTone;
  eyebrow: string;
  title: string;
  subtitle: string;
  sources?: SourceId[];
  onClick?: () => void;
}

function AgentCard({
  icon: CardIcon,
  tone,
  eyebrow,
  title,
  subtitle,
  sources = [],
  onClick,
}: AgentCardProps) {
  const toneClass = styles[`product-switcher__agents-card--${tone}`];
  return (
    <button
      type="button"
      className={[styles['product-switcher__agents-card'], toneClass]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      <span className={styles['product-switcher__agents-card-icon']}>
        <Icon size="16" glyph={<CardIcon />} />
      </span>
      <span className={styles['product-switcher__agents-card-eyebrow']}>
        {eyebrow}
      </span>
      <span className={styles['product-switcher__agents-card-title']}>
        {title}
      </span>
      <span className={styles['product-switcher__agents-card-subtitle']}>
        {subtitle}
      </span>
      {sources.length > 0 && (
        <span className={styles['product-switcher__agents-card-sources']}>
          {sources.map((id) => {
            const meta = SOURCES[id];
            return (
              <span
                key={id}
                className={styles['product-switcher__source-chip']}
                style={{ '--source-brand': meta.brand } as React.CSSProperties}
              >
                <span className={styles['product-switcher__source-chip-logo']}>
                  {meta.glyph}
                </span>
                {meta.label}
              </span>
            );
          })}
        </span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Playbook generator — Cursor-style split: chat on the left, generated
// playbook draft on the right. Clicking "Create Playbook with AI" from the
// AI sidebar's + menu opens this view.
// ---------------------------------------------------------------------------

interface PlaybookTask {
  id: string;
  label: string;
  done?: boolean;
}

interface PlaybookSection {
  id: string;
  title: string;
  tasks: PlaybookTask[];
}

const PLAYBOOK_TITLE = 'Customer Onboarding';
const PLAYBOOK_DESCRIPTION =
  'Help new customers get set up and reach first value within their first 30 days. Run this once per new account.';

const PLAYBOOK_SECTIONS: PlaybookSection[] = [
  {
    id: 'day-1',
    title: 'Day 1 — Welcome',
    tasks: [
      { id: 'd1-t1', label: 'Send welcome email with onboarding guide', done: true },
      { id: 'd1-t2', label: 'Provision their workspace and seats' },
      { id: 'd1-t3', label: 'Schedule kickoff call within 48 hours' },
    ],
  },
  {
    id: 'week-1',
    title: 'Week 1 — Setup',
    tasks: [
      { id: 'w1-t1', label: 'Run kickoff call with primary stakeholders' },
      { id: 'w1-t2', label: 'Configure their starter project from template' },
      { id: 'w1-t3', label: 'Walk through their top 2 use cases live' },
      { id: 'w1-t4', label: 'Connect them with their CSM in #onboarding' },
    ],
  },
  {
    id: 'month-1',
    title: 'Month 1 — Activation',
    tasks: [
      { id: 'm1-t1', label: 'Confirm 3+ active users in the workspace' },
      { id: 'm1-t2', label: 'Review usage and adoption metrics together' },
      { id: 'm1-t3', label: 'Schedule recurring monthly check-in' },
      { id: 'm1-t4', label: 'Identify expansion / referral opportunities' },
    ],
  },
];

const PLAYBOOK_QUICK_REFINEMENTS = [
  'Add a 60-day retention checkpoint',
  'Include a compliance review step',
  'Tighten Day 1 to fewer tasks',
];

// ---------------------------------------------------------------------------
// Recap detail view — opens when a user clicks a saved recap in the sidebar.
// Each tool can render its own custom UI; GitHub is fleshed out as the
// reference. Mattermost / Jira show a placeholder until built out.
// ---------------------------------------------------------------------------

interface GhMention {
  id: string;
  repo: string;
  number: number;
  kind: 'issue' | 'pr' | 'discussion';
  title: string;
  excerpt: string;
  authorName: string;
  authorAvatar: string;
  time: string;
}

interface GhPullRequest {
  id: string;
  repo: string;
  number: number;
  title: string;
  status: 'open' | 'draft' | 'review-requested' | 'changes-requested' | 'approved';
  authorName: string;
  authorAvatar: string;
  comments: number;
  reviews: number;
  time: string;
}

const GITHUB_MENTIONS: GhMention[] = [
  {
    id: 'm1',
    repo: 'mattermost/mattermost-server',
    number: 28847,
    kind: 'issue',
    title: 'API: bulk channel import returns 500 on duplicate name',
    excerpt:
      "@leonard mind taking a look at the validation path? I think we're swallowing the error before the response is built.",
    authorName: 'Sofia Bauer',
    authorAvatar: avatarSofia,
    time: '2h ago',
  },
  {
    id: 'm2',
    repo: 'mattermost/mattermost-webapp',
    number: 15903,
    kind: 'pr',
    title: 'Switch product menu to popover hook',
    excerpt:
      "@leonard left a few questions inline about the focus restore behaviour — once those are settled I think we're good to ship.",
    authorName: 'Marco Rinaldi',
    authorAvatar: avatarMarco,
    time: '5h ago',
  },
  {
    id: 'm3',
    repo: 'mattermost/desktop',
    number: 1240,
    kind: 'discussion',
    title: 'Notification grouping by team',
    excerpt:
      '@leonard does this match the channels-side grouping you had in mind? Want to make sure we are consistent before mobile picks it up.',
    authorName: 'Aiko Tan',
    authorAvatar: avatarAikoTan,
    time: 'yesterday',
  },
];

const GITHUB_MY_PRS: GhPullRequest[] = [
  {
    id: 'p1',
    repo: 'mattermost/mattermost-webapp',
    number: 15921,
    title: 'Add Custom Prompts sidebar to the Agents view',
    status: 'open',
    authorName: 'Leonard Riley',
    authorAvatar: avatarLeonard,
    comments: 3,
    reviews: 1,
    time: 'updated 35m ago',
  },
  {
    id: 'p2',
    repo: 'mattermost/playbooks',
    number: 842,
    title: 'Generate playbook from an AI prompt',
    status: 'draft',
    authorName: 'Leonard Riley',
    authorAvatar: avatarLeonard,
    comments: 0,
    reviews: 2,
    time: 'updated 2h ago',
  },
  {
    id: 'p3',
    repo: 'mattermost/agents-go',
    number: 18,
    title: 'Recap modal — multi-tool source picker',
    status: 'approved',
    authorName: 'Leonard Riley',
    authorAvatar: avatarLeonard,
    comments: 0,
    reviews: 1,
    time: 'updated yesterday',
  },
];

const GITHUB_ASSIGNED_PRS: GhPullRequest[] = [
  {
    id: 'a1',
    repo: 'mattermost/mattermost-server',
    number: 28851,
    title: 'Refactor session GC for high-churn workspaces',
    status: 'review-requested',
    authorName: 'Darius Cole',
    authorAvatar: avatarDariusCole,
    comments: 1,
    reviews: 0,
    time: 'waiting 4h',
  },
  {
    id: 'a2',
    repo: 'mattermost/desktop',
    number: 2110,
    title: 'Migrate webview-tag → BrowserView for the in-app browser',
    status: 'review-requested',
    authorName: 'David Liang',
    authorAvatar: avatarDavidLiang,
    comments: 4,
    reviews: 0,
    time: 'waiting 1d',
  },
  {
    id: 'a3',
    repo: 'mattermost/playbooks',
    number: 845,
    title: 'Conditional retros for runtime branches',
    status: 'changes-requested',
    authorName: 'Arjun Patel',
    authorAvatar: avatarArjunPatel,
    comments: 6,
    reviews: 1,
    time: 'waiting 2d',
  },
];

const GH_STATUS_LABEL: Record<GhPullRequest['status'], string> = {
  open: 'Open',
  draft: 'Draft',
  'review-requested': 'Review requested',
  'changes-requested': 'Changes requested',
  approved: 'Approved',
};

const GH_KIND_LABEL: Record<GhMention['kind'], string> = {
  issue: 'Issue',
  pr: 'Pull request',
  discussion: 'Discussion',
};

interface GhAction {
  label: string;
  /** AI-powered action — shown with the sparkle icon. */
  ai?: boolean;
}

function mentionActions(m: GhMention): GhAction[] {
  const aiLabel: Record<GhMention['kind'], string> = {
    issue: 'Draft reply',
    pr: 'Draft review note',
    discussion: 'Draft answer',
  };
  return [
    { label: aiLabel[m.kind], ai: true },
    { label: 'Open on GitHub' },
  ];
}

function prActions(
  pr: GhPullRequest,
  assigned: boolean
): GhAction[] {
  if (assigned) {
    return [
      { label: 'Skim with AI', ai: true },
      { label: 'Open review' },
    ];
  }
  switch (pr.status) {
    case 'open':
      return [
        { label: 'Summarise feedback', ai: true },
        { label: 'View on GitHub' },
      ];
    case 'draft':
      return [
        { label: 'Polish description', ai: true },
        { label: 'Mark ready' },
      ];
    case 'approved':
      return [
        { label: 'Draft merge note', ai: true },
        { label: 'Merge' },
      ];
    case 'changes-requested':
      return [
        { label: 'Address feedback', ai: true },
        { label: 'View on GitHub' },
      ];
    default:
      return [{ label: 'View on GitHub' }];
  }
}

function GhActions({ actions }: { actions: GhAction[] }) {
  return (
    <div className={styles['product-switcher__gh-actions']}>
      {actions.map((a) => (
        <Button
          key={a.label}
          emphasis="Tertiary"
          size="Small"
          leadingIcon={
            a.ai ? <Icon size="16" glyph={<CreationOutlineIcon />} /> : undefined
          }
          className={
            a.ai ? styles['product-switcher__gh-action-ai'] : undefined
          }
        >
          {a.label}
        </Button>
      ))}
    </div>
  );
}

function RecapDetailView({
  recap,
  onBack,
}: {
  recap: CustomRecap;
  onBack: () => void;
}) {
  const meta = RECAP_TOOLS.find((t) => t.id === recap.tool) ?? RECAP_TOOLS[0];

  return (
    <div className={styles['product-switcher__recap-detail']}>
      <header className={styles['product-switcher__recap-detail-header']}>
        <IconButton
          aria-label="Back to home"
          size="Small"
          icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          onClick={onBack}
        />
        <span className={styles['product-switcher__recap-detail-logo']} aria-hidden>
          {meta.glyph}
        </span>
        <div className={styles['product-switcher__recap-detail-titles']}>
          <span className={styles['product-switcher__recap-detail-title']}>
            {recap.label}
          </span>
          <span className={styles['product-switcher__recap-detail-subtitle']}>
            Generated each weekday from {meta.label}
          </span>
        </div>
        <Button
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<PencilOutlineIcon />} />}
        >
          Edit prompt
        </Button>
      </header>

      <div className={styles['product-switcher__recap-detail-body']}>
        {recap.tool === 'github' ? (
          <GitHubRecapContent />
        ) : (
          <div className={styles['product-switcher__recap-empty']}>
            <Icon size="32" glyph={<TextBoxOutlineIcon />} />
            <h2>{meta.label} preview coming soon</h2>
            <p>
              Tomorrow at 8:00 AM the agent will run your prompt against{' '}
              {meta.label} and surface results here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function GitHubRecapContent() {
  return (
    <div className={styles['product-switcher__gh']}>
      <section className={styles['product-switcher__gh-section']}>
        <div className={styles['product-switcher__gh-section-header']}>
          <h2 className={styles['product-switcher__gh-section-title']}>
            Mentions
          </h2>
          <span className={styles['product-switcher__gh-section-count']}>
            {GITHUB_MENTIONS.length}
          </span>
        </div>
        <p className={styles['product-switcher__gh-section-hint']}>
          Places you've been @-mentioned across issues, pull requests, and
          discussions.
        </p>
        <ul className={styles['product-switcher__gh-list']}>
          {GITHUB_MENTIONS.map((m) => (
            <li key={m.id} className={styles['product-switcher__gh-item']}>
              <span
                className={[
                  styles['product-switcher__gh-status'],
                  styles[`product-switcher__gh-status--${m.kind}`],
                ].join(' ')}
                aria-hidden
              />
              <div className={styles['product-switcher__gh-item-body']}>
                <div className={styles['product-switcher__gh-item-meta']}>
                  <span className={styles['product-switcher__gh-repo']}>
                    {m.repo}
                  </span>
                  <span className={styles['product-switcher__gh-number']}>
                    #{m.number}
                  </span>
                  <span className={styles['product-switcher__gh-kind']}>
                    {GH_KIND_LABEL[m.kind]}
                  </span>
                </div>
                <a
                  href="#"
                  className={styles['product-switcher__gh-title']}
                  onClick={(e) => e.preventDefault()}
                >
                  {m.title}
                </a>
                <p className={styles['product-switcher__gh-excerpt']}>
                  {m.excerpt}
                </p>
                <div className={styles['product-switcher__gh-bottom']}>
                  <div className={styles['product-switcher__gh-byline']}>
                    <img
                      className={styles['product-switcher__gh-avatar']}
                      src={m.authorAvatar}
                      alt=""
                    />
                    <span>{m.authorName}</span>
                    <span className={styles['product-switcher__gh-dot']}>
                      ·
                    </span>
                    <span>{m.time}</span>
                  </div>
                  <GhActions actions={mentionActions(m)} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles['product-switcher__gh-section']}>
        <div className={styles['product-switcher__gh-section-header']}>
          <h2 className={styles['product-switcher__gh-section-title']}>
            My pull requests
          </h2>
          <span className={styles['product-switcher__gh-section-count']}>
            {GITHUB_MY_PRS.length}
          </span>
        </div>
        <p className={styles['product-switcher__gh-section-hint']}>
          Pull requests you opened that are still in flight.
        </p>
        <ul className={styles['product-switcher__gh-list']}>
          {GITHUB_MY_PRS.map((pr) => (
            <PullRequestRow key={pr.id} pr={pr} showAuthor={false} />
          ))}
        </ul>
      </section>

      <section className={styles['product-switcher__gh-section']}>
        <div className={styles['product-switcher__gh-section-header']}>
          <h2 className={styles['product-switcher__gh-section-title']}>
            Assigned to me
          </h2>
          <span className={styles['product-switcher__gh-section-count']}>
            {GITHUB_ASSIGNED_PRS.length}
          </span>
        </div>
        <p className={styles['product-switcher__gh-section-hint']}>
          Pull requests waiting on your review.
        </p>
        <ul className={styles['product-switcher__gh-list']}>
          {GITHUB_ASSIGNED_PRS.map((pr) => (
            <PullRequestRow key={pr.id} pr={pr} showAuthor />
          ))}
        </ul>
      </section>
    </div>
  );
}

function PullRequestRow({
  pr,
  showAuthor,
}: {
  pr: GhPullRequest;
  showAuthor: boolean;
}) {
  return (
    <li className={styles['product-switcher__gh-item']}>
      <span
        className={[
          styles['product-switcher__gh-status'],
          styles[`product-switcher__gh-status--${pr.status}`],
        ].join(' ')}
        aria-hidden
      />
      <div className={styles['product-switcher__gh-item-body']}>
        <div className={styles['product-switcher__gh-item-meta']}>
          <span className={styles['product-switcher__gh-repo']}>{pr.repo}</span>
          <span className={styles['product-switcher__gh-number']}>
            #{pr.number}
          </span>
          <span
            className={[
              styles['product-switcher__gh-badge'],
              styles[`product-switcher__gh-badge--${pr.status}`],
            ].join(' ')}
          >
            {GH_STATUS_LABEL[pr.status]}
          </span>
        </div>
        <a
          href="#"
          className={styles['product-switcher__gh-title']}
          onClick={(e) => e.preventDefault()}
        >
          {pr.title}
        </a>
        <div className={styles['product-switcher__gh-bottom']}>
          <div className={styles['product-switcher__gh-byline']}>
            {showAuthor && (
              <>
                <img
                  className={styles['product-switcher__gh-avatar']}
                  src={pr.authorAvatar}
                  alt=""
                />
                <span>{pr.authorName}</span>
                <span className={styles['product-switcher__gh-dot']}>·</span>
              </>
            )}
            <span>{pr.comments} comments</span>
            <span className={styles['product-switcher__gh-dot']}>·</span>
            <span>{pr.time}</span>
          </div>
          <GhActions actions={prActions(pr, showAuthor)} />
        </div>
      </div>
    </li>
  );
}

function PlaybookGeneratorView({ onBack }: { onBack: () => void }) {
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      id: 'pb-u-1',
      role: 'user',
      text: 'Generate a customer onboarding playbook for our SaaS product.',
    },
    {
      id: 'pb-a-1',
      role: 'assistant',
      text: "Here's a starter playbook for customer onboarding. I broke it into Day 1, Week 1, and Month 1 phases so the new account always knows the next step. Tweak any phase or send me a refinement and I'll update the draft on the right.",
    },
  ]);
  const counter = useRef(chat.length);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chat]);

  const sendRefinement = (text: string) => {
    counter.current += 1;
    const userId = `pb-u-${counter.current}`;
    counter.current += 1;
    const aId = `pb-a-${counter.current}`;
    setChat((prev) => [
      ...prev,
      { id: userId, role: 'user', text },
      {
        id: aId,
        role: 'assistant',
        text: "Updated the draft on the right. Let me know what else to adjust — I can also split, reorder, or drop sections.",
      },
    ]);
  };

  return (
    <div className={styles['product-switcher__playbook']}>
      <header className={styles['product-switcher__playbook-header']}>
        <IconButton
          aria-label="Back to home"
          size="Small"
          icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          onClick={onBack}
        />
        <span className={styles['product-switcher__playbook-header-title']}>
          {PLAYBOOK_TITLE}
        </span>
        <span className={styles['product-switcher__playbook-header-tag']}>
          <Icon size="12" glyph={<CreationOutlineIcon />} />
          AI draft
        </span>
        <Button
          size="Small"
          leadingIcon={<Icon size="16" glyph={<CheckIcon />} />}
          onClick={onBack}
        >
          Confirm playbook
        </Button>
      </header>

      <div className={styles['product-switcher__playbook-split']}>
        <aside className={styles['product-switcher__playbook-chat']}>
          <div
            ref={threadRef}
            className={styles['product-switcher__playbook-chat-thread']}
          >
            {chat.map((message) => (
              <MessageBubble key={message.id} message={message} onChip={() => {}} />
            ))}

            <div className={styles['product-switcher__playbook-chips']}>
              {PLAYBOOK_QUICK_REFINEMENTS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className={styles['product-switcher__playbook-chip']}
                  onClick={() => sendRefinement(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles['product-switcher__playbook-chat-input']}>
            <MessageInput
              placeholder="Refine the playbook…"
              defaultFormattingOpen
            />
            <div className={styles['product-switcher__playbook-chat-help']}>
              <a href="#" className={styles['product-switcher__playbook-chat-help-link']}>
                Help
              </a>
            </div>
          </div>
        </aside>

        <main className={styles['product-switcher__playbook-editor']}>
          <article className={styles['product-switcher__playbook-doc']}>
            <header className={styles['product-switcher__playbook-doc-header']}>
              <h1 className={styles['product-switcher__playbook-doc-title']}>
                {PLAYBOOK_TITLE}
              </h1>
              <p
                className={styles['product-switcher__playbook-doc-description']}
              >
                {PLAYBOOK_DESCRIPTION}
              </p>
            </header>

            {PLAYBOOK_SECTIONS.map((section) => (
              <section
                key={section.id}
                className={styles['product-switcher__playbook-section']}
              >
                <h2
                  className={styles['product-switcher__playbook-section-title']}
                >
                  {section.title}
                </h2>
                <ul className={styles['product-switcher__playbook-tasks']}>
                  {section.tasks.map((task) => (
                    <li
                      key={task.id}
                      className={styles['product-switcher__playbook-task']}
                    >
                      <Checkbox defaultChecked={task.done}>{task.label}</Checkbox>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </article>
        </main>
      </div>
    </div>
  );
}

function formatChannelLabel(channel?: string) {
  if (!channel) return 'CHANNEL';
  return channel.replace(/-/g, ' ').toUpperCase();
}

function formatChannelTitle(channel?: string) {
  if (!channel) return 'Channel';
  return channel
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// Attention inbox — See all recap items in a threads-style list.
// ---------------------------------------------------------------------------

interface AttentionSeeAllViewProps {
  onBack: () => void;
  onOpenBriefing: (id: BriefingId) => void;
}

function AttentionSeeAllView({ onBack, onOpenBriefing }: AttentionSeeAllViewProps) {
  const [selectedId, setSelectedId] = useState(ATTENTION_ITEMS[0]?.id ?? '');
  const selected =
    ATTENTION_ITEMS.find((item) => item.id === selectedId) ?? ATTENTION_ITEMS[0];

  if (!selected) return null;

  return (
    <div className={styles['product-switcher__replies-needed']}>
      <header className={styles['product-switcher__conversation-header']}>
        <IconButton
          aria-label="Back to recaps"
          size="Small"
          icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          onClick={onBack}
        />
        <span
          className={styles['product-switcher__conversation-topic-icon']}
          aria-hidden
        >
          <Icon size="16" glyph={<TextBoxOutlineIcon />} />
        </span>
        <span className={styles['product-switcher__conversation-topic']}>
          Needs your attention
        </span>
      </header>

      <div className={styles['product-switcher__replies-split']}>
        <div className={styles['product-switcher__replies-inbox']}>
          <div className={styles['product-switcher__replies-list']}>
            <Scrollbars>
              <div className={styles['product-switcher__replies-list-inner']}>
                {ATTENTION_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className={styles['product-switcher__attention-row']}
                  >
                    <LabelTag
                      label={item.requestTag}
                      type={item.tagType}
                      size="X-Small"
                      className={styles['product-switcher__attention-row-tag']}
                    />
                    <ThreadListItem
                      active={selectedId === item.id}
                      badge={item.badge ?? 'None'}
                      mentionCount={item.mentionCount}
                      authorName={item.authorName}
                      channelLabel={item.channelLabel}
                      previewText={item.previewText}
                      timestamp={item.timestamp}
                      threadTitle={item.threadTitle}
                      replyCount={item.replyCount ?? 0}
                      participants={item.participants ?? []}
                      onClick={() => setSelectedId(item.id)}
                    />
                  </div>
                ))}
              </div>
            </Scrollbars>
          </div>
        </div>

        <RightSidebar
          fill
          className={styles['product-switcher__replies-thread-panel']}
          header={
            <RightSidebarHeader
              title={selected.detailTitle}
              secondaryTitle={selected.requestTag}
            />
          }
          footer={
            <div className={styles['product-switcher__attention-detail-footer']}>
              <Button
                emphasis="Primary"
                size="Small"
                onClick={() => onOpenBriefing(selected.briefingId)}
              >
                {selected.openLabel}
              </Button>
            </div>
          }
        >
          <div className={styles['product-switcher__attention-detail']}>
            <p className={styles['product-switcher__attention-detail-body']}>
              {selected.detailBody}
            </p>
            {selected.detailList && selected.detailList.length > 0 && (
              <ul className={styles['product-switcher__attention-detail-list']}>
                {selected.detailList.map((entry) => (
                  <li
                    key={entry.primary}
                    className={styles['product-switcher__attention-detail-list-item']}
                  >
                    <span
                      className={
                        styles['product-switcher__attention-detail-list-primary']
                      }
                    >
                      {entry.primary}
                    </span>
                    {entry.secondary && (
                      <span
                        className={
                          styles['product-switcher__attention-detail-list-secondary']
                        }
                      >
                        {entry.secondary}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </RightSidebar>
      </div>
    </div>
  );
}

const MENTION_REPLY_COUNTS = [7, 4, 2];

// ---------------------------------------------------------------------------
// Replies needed — threads-style split inbox + thread detail.
// ---------------------------------------------------------------------------

interface RepliesNeededViewProps {
  conversation: BriefingConversation;
  messages: ChatMessage[];
  onBack: () => void;
  onChip: (chip: QuickReply) => void;
}

function RepliesNeededView({
  conversation,
  messages,
  onBack,
  onChip,
}: RepliesNeededViewProps) {
  const posts = conversation.starter.posts ?? [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [draftByThread, setDraftByThread] = useState<
    Record<number, PostPreview>
  >({});

  const selectedPost = posts[selectedIndex];
  const selectedDraft = draftByThread[selectedIndex];
  const summaryMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant' && message.list?.length);

  const handlePostAction = (action: QuickReply) => {
    onChip(action);
    if (action.posts?.[0]) {
      setDraftByThread((prev) => ({
        ...prev,
        [selectedIndex]: action.posts![0],
      }));
    }
  };

  const handleDraftAction = (action: QuickReply) => {
    onChip(action);
    if (action.posts?.[0]) {
      setDraftByThread((prev) => ({
        ...prev,
        [selectedIndex]: action.posts![0],
      }));
    }
  };

  if (!selectedPost) return null;

  const textClass = messageStyles['message__body-text'];

  return (
    <div className={styles['product-switcher__replies-needed']}>
      <header className={styles['product-switcher__conversation-header']}>
        <IconButton
          aria-label="Back to recaps"
          size="Small"
          icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          onClick={onBack}
        />
        <span
          className={styles['product-switcher__conversation-topic-icon']}
          aria-hidden
        >
          <Icon size="16" glyph={<AtIcon />} />
        </span>
        <span className={styles['product-switcher__conversation-topic']}>
          {conversation.topic}
        </span>
      </header>

      <div className={styles['product-switcher__replies-split']}>
        <div className={styles['product-switcher__replies-inbox']}>
          <div className={styles['product-switcher__replies-list']}>
            <Scrollbars>
              <div className={styles['product-switcher__replies-list-inner']}>
                {posts.map((post, index) => (
                  <ThreadListItem
                    key={`${post.username}-${post.timestamp}`}
                    active={selectedIndex === index}
                    badge="Mention"
                    authorName={post.username}
                    channelLabel={formatChannelLabel(post.channel)}
                    previewText={post.body}
                    timestamp={post.timestamp}
                    replyCount={MENTION_REPLY_COUNTS[index] ?? 1}
                    participants={[
                      {
                        key: post.username,
                        name: post.username,
                        src: post.avatarSrc,
                      },
                    ]}
                    onClick={() => setSelectedIndex(index)}
                  />
                ))}
              </div>
            </Scrollbars>
          </div>

          <div className={styles['product-switcher__replies-inbox-footer']}>
            {summaryMessage?.list && summaryMessage.list.length > 0 && (
              <ul className={styles['product-switcher__replies-summary']}>
                {summaryMessage.list.map((item) => (
                  <li
                    key={item.primary}
                    className={styles['product-switcher__replies-summary-item']}
                  >
                    <span
                      className={
                        styles['product-switcher__replies-summary-primary']
                      }
                    >
                      {item.primary}
                    </span>
                    {item.secondary && (
                      <span
                        className={
                          styles['product-switcher__replies-summary-secondary']
                        }
                      >
                        {item.secondary}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {conversation.starter.chips && (
              <div className={styles['product-switcher__replies-chips']}>
                {conversation.starter.chips.map((chip) => (
                  <Button
                    key={chip.label}
                    size="Small"
                    emphasis="Tertiary"
                    onClick={() => onChip(chip)}
                  >
                    {chip.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        <RightSidebar
          fill
          alignBody="end"
          className={styles['product-switcher__replies-thread-panel']}
          header={
            <RightSidebarHeader
              title="Thread"
              secondaryTitle={formatChannelTitle(selectedPost.channel)}
              actionLabel="Following"
              actionActive
            />
          }
          footer={
            <div className={styles['product-switcher__replies-thread-input']}>
              <MessageInput placeholder="Reply to this thread…" width="narrow" />
            </div>
          }
        >
          <div className={styles['product-switcher__replies-thread']}>
            <div className={styles['product-switcher__replies-thread-messages']}>
              <Message
                avatarSrc={selectedPost.avatarSrc}
                avatarAlt={selectedPost.avatarAlt}
                username={selectedPost.username}
                timestamp={selectedPost.timestamp}
              >
                <p className={textClass}>{selectedPost.body}</p>
              </Message>
              <MessageSeparator
                type="Reply Count"
                label={`${MENTION_REPLY_COUNTS[selectedIndex] ?? 1} replies`}
              />
              {selectedDraft && (
                <Message
                  avatarSrc={selectedDraft.avatarSrc}
                  avatarAlt={selectedDraft.avatarAlt}
                  username={selectedDraft.username}
                  timestamp={selectedDraft.timestamp}
                >
                  <p className={textClass}>{selectedDraft.body}</p>
                </Message>
              )}
            </div>
            {(selectedPost.actions?.length || selectedDraft?.actions?.length) && (
              <div className={styles['product-switcher__replies-thread-actions']}>
                {(selectedDraft?.actions ?? selectedPost.actions ?? []).map(
                  (action) => (
                    <Button
                      key={action.label}
                      size="Small"
                      emphasis={action.primary ? 'Primary' : 'Tertiary'}
                      onClick={() =>
                        selectedDraft
                          ? handleDraftAction(action)
                          : handlePostAction(action)
                      }
                    >
                      {action.label}
                    </Button>
                  )
                )}
              </div>
            )}
          </div>
        </RightSidebar>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conversation view — the chat thread that opens after a briefing card click.
// ---------------------------------------------------------------------------

interface ConversationViewProps {
  conversation: BriefingConversation;
  messages: ChatMessage[];
  onBack: () => void;
  onChip: (chip: QuickReply) => void;
}

function ConversationView({
  conversation,
  messages,
  onBack,
  onChip,
}: ConversationViewProps) {
  const TopicIcon = conversation.topicIcon;
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className={styles['product-switcher__conversation']}>
      <header className={styles['product-switcher__conversation-header']}>
        <IconButton
          aria-label="Back to home"
          size="Small"
          icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          onClick={onBack}
        />
        <span
          className={styles['product-switcher__conversation-topic-icon']}
          aria-hidden
        >
          <Icon size="16" glyph={<TopicIcon />} />
        </span>
        <span className={styles['product-switcher__conversation-topic']}>
          {conversation.topic}
        </span>
      </header>

      <div
        ref={threadRef}
        className={styles['product-switcher__conversation-thread']}
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onChip={onChip}
          />
        ))}
      </div>

      <div className={styles['product-switcher__conversation-input']}>
        <MessageInput placeholder="Reply to Agents…" />
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  onChip: (chip: QuickReply) => void;
}

function MessageBubble({ message, onChip }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div
        className={[
          styles['product-switcher__bubble'],
          styles['product-switcher__bubble--user'],
        ].join(' ')}
      >
        <span className={styles['product-switcher__bubble-text']}>
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div
      className={[
        styles['product-switcher__bubble'],
        styles['product-switcher__bubble--assistant'],
      ].join(' ')}
    >
      <span className={styles['product-switcher__bubble-avatar']} aria-hidden>
        <Icon size="16" glyph={<CreationOutlineIcon />} />
      </span>
      <div className={styles['product-switcher__bubble-body']}>
        <div className={styles['product-switcher__bubble-text']}>
          {message.text}
        </div>
        {message.posts && message.posts.length > 0 && (
          <div className={styles['product-switcher__bubble-posts']}>
            {message.posts.map((post, i) => (
              <PostPreviewCard key={i} post={post} onChip={onChip} />
            ))}
          </div>
        )}
        {message.list && message.list.length > 0 && (
          <ul className={styles['product-switcher__bubble-list']}>
            {message.list.map((item, i) => (
              <li
                key={i}
                className={styles['product-switcher__bubble-list-item']}
              >
                <span
                  className={styles['product-switcher__bubble-list-primary']}
                >
                  {item.primary}
                </span>
                {item.secondary && (
                  <span
                    className={
                      styles['product-switcher__bubble-list-secondary']
                    }
                  >
                    {item.secondary}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        {message.chips && message.chips.length > 0 && (
          <div className={styles['product-switcher__bubble-chips']}>
            {message.chips.map((chip) => (
              <Button
                key={chip.label}
                size="Small"
                emphasis="Tertiary"
                onClick={() => onChip(chip)}
              >
                {chip.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PostPreviewCard({
  post,
  onChip,
}: {
  post: PostPreview;
  onChip: (chip: QuickReply) => void;
}) {
  return (
    <div
      className={[
        styles['product-switcher__post-preview'],
        post.draft
          ? styles['product-switcher__post-preview--draft']
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {post.channel && (
        <div className={styles['product-switcher__post-preview-header']}>
          <span
            className={styles['product-switcher__post-preview-channel-icon']}
            aria-hidden
          >
            <Icon
              size="12"
              glyph={
                post.privateChannel ? <LockOutlineIcon /> : <GlobeIcon />
              }
            />
          </span>
          <span
            className={styles['product-switcher__post-preview-channel']}
          >
            {post.channel}
          </span>
          {post.draft && (
            <span className={styles['product-switcher__post-preview-tag']}>
              Draft
            </span>
          )}
        </div>
      )}
      <Message
        avatarSrc={post.avatarSrc}
        avatarAlt={post.avatarAlt}
        username={post.username}
        timestamp={post.timestamp}
      >
        <p className={styles['product-switcher__post-preview-body']}>
          {post.body}
        </p>
      </Message>
      {post.actions && post.actions.length > 0 && (
        <div className={styles['product-switcher__post-preview-actions']}>
          {post.actions.map((action) => (
            <Button
              key={action.label}
              size="Small"
              emphasis={action.primary ? 'Primary' : 'Tertiary'}
              onClick={() => onChip(action)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
