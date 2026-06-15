import { useRef, useState, type ReactNode } from 'react';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Message from '@/components/ui/Message/Message';
import MessageInput from '@/components/ui/MessageInput';
import MessageReactions from '@/components/ui/MessageReactions/MessageReactions';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import {
  ACTIVE_CHANNEL,
  CHANNEL_MESSAGES,
  automationsAffecting,
  type Automation,
  type AutomationType,
} from '../channelAutomationsData';
import ChannelAiMenu from './ChannelAiMenu';
import ChannelNameMenu from './ChannelNameMenu';
import AutomationNudge from './AutomationNudge';
import type { HeaderEntryPoint } from '../channelAutomationsScenes';
import styles from './AutomationsShell.module.scss';

export interface AutomationsShellProps {
  automations: Automation[];
  /**
   * Which header treatment surfaces automations. The Agents menu and the
   * dedicated count icon are competing possibilities — only one shows at a time.
   */
  headerEntryPoint: HeaderEntryPoint;
  /** When true, the alternate entry points (channel-name item + in-stream nudge) are active. */
  showAlternates: boolean;
  /** Start the create flow, optionally pre-selecting an automation type. */
  onCreate: (type?: AutomationType) => void;
  /** Open the management surface. */
  onOpenManage: () => void;
  /** Right sidebar content (already wrapped as an <aside> with the right-sidebar class). */
  rhs?: ReactNode;
  /** Layered surface over the shell (e.g. the management modal). */
  overlay?: ReactNode;
}

const MENU_ANIM_MS = 150;

export default function AutomationsShell({
  automations,
  headerEntryPoint,
  showAlternates,
  onCreate,
  onOpenManage,
  rhs,
  overlay,
}: AutomationsShellProps) {
  const count = automations.length;

  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [nameRect, setNameRect] = useState<DOMRect | null>(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const aiAnchorRef = useRef<HTMLSpanElement>(null);
  const nameMenuRef = useRef<HTMLDivElement>(null);

  const aiAnim = useExitAnimation(aiMenuOpen, MENU_ANIM_MS);
  const nameAnim = useExitAnimation(nameRect != null, MENU_ANIM_MS);

  useOutsideClose(aiAnchorRef, aiMenuOpen, () => setAiMenuOpen(false));
  useOutsideClose(nameMenuRef, nameRect != null, () => setNameRect(null));

  const closeAiMenu = () => setAiMenuOpen(false);

  const isAgentsMenu = headerEntryPoint === 'agents-menu';

  // Both header treatments live in the stat-icon row (left side, where the
  // Files icon sits) — shown one at a time, never together.
  const agentsStatIcon = (
    <span ref={aiAnchorRef} className={styles['shell__ai-anchor']}>
      <IconButton
        size="X-Small"
        aria-label="Ask Agents"
        aria-haspopup="menu"
        aria-expanded={aiMenuOpen}
        toggled={aiMenuOpen}
        onClick={() => setAiMenuOpen((o) => !o)}
        icon={<Icon size="12" glyph={<CreationOutlineIcon />} />}
      />
      {aiAnim.rendered && (
        <div
          className={[
            styles['shell__ai-popover'],
            aiAnim.exiting ? styles['shell__ai-popover--exiting'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <ChannelAiMenu
            automationCount={count}
            affecting={automationsAffecting(automations, ACTIVE_CHANNEL)}
            onSelectType={(type) => {
              closeAiMenu();
              onCreate(type);
            }}
            onViewAutomations={() => {
              closeAiMenu();
              onOpenManage();
            }}
          />
        </div>
      )}
    </span>
  );

  const countStatIcon = (
    <IconButton
      size="X-Small"
      aria-label={`${count} automations`}
      count={count}
      toggled={false}
      onClick={onOpenManage}
      icon={<Icon size="12" glyph={<CreationOutlineIcon />} />}
    />
  );

  const showNudge = showAlternates && !nudgeDismissed;

  return (
    <>
      <ChannelShell
        teamName="Contributors"
        channelHeader={
          <ChannelHeader
            type="Channel"
            name="UX Design"
            description="Product design crit, specs, and reviews."
            memberCount={48}
            pinnedCount={2}
            favorited
            showFiles={false}
            extraStatIcons={isAgentsMenu ? agentsStatIcon : countStatIcon}
            onNameClick={(e) => {
              if (!showAlternates) return;
              setNameRect(e.currentTarget.getBoundingClientRect());
            }}
            onInfoClick={onOpenManage}
          />
        }
        trailing={rhs}
        overlay={overlay}
      >
        <div className={shellStyles['channel-shell__messages']}>
          <Scrollbars>
            <div className={shellStyles['channel-shell__messages-list']}>
              <MessageSeparator type="Date" label="Today" />
              {CHANNEL_MESSAGES.map((m) => (
                <Message
                  key={m.id}
                  avatarSrc={m.avatarSrc}
                  avatarAlt={m.username}
                  username={m.username}
                  timestamp={m.timestamp}
                  isBot={m.isBot}
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    {m.body}
                  </p>
                  {m.reactions && (
                    <MessageReactions reactions={m.reactions} showAddReaction />
                  )}
                </Message>
              ))}
              {showNudge && (
                <AutomationNudge
                  onCreate={() => onCreate()}
                  onDismiss={() => setNudgeDismissed(true)}
                />
              )}
            </div>
          </Scrollbars>
        </div>

        <div className={shellStyles['channel-shell__message-input']}>
          <MessageInput placeholder="Write to UX Design" />
        </div>
      </ChannelShell>

      {nameAnim.rendered && nameRect && (
        <div
          ref={nameMenuRef}
          className={[
            styles['shell__name-popover'],
            nameAnim.exiting ? styles['shell__name-popover--exiting'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ top: nameRect.bottom + 4, left: nameRect.left }}
        >
          <ChannelNameMenu
            automationCount={count}
            onViewAutomations={() => {
              setNameRect(null);
              onOpenManage();
            }}
          />
        </div>
      )}
    </>
  );
}
