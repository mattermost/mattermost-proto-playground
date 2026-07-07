import { ChannelHeader, ChannelShell, Icon, IconButton, Message, MessageInput, MessageReactions, MessageSeparator, Scrollbar } from '@mattermost/compass-ui';
import { useRef, useState, type ReactNode } from 'react';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { shellStyles } from '@mattermost/compass-ui';
import {
  CHANNEL_MESSAGES,
  type AutomationType,
} from '../channelAutomationsData';
import ChannelAiMenu from './ChannelAiMenu';
import styles from './AutomationsShell.module.scss';

export interface AutomationsShellProps {
  /** Start the create flow, optionally pre-selecting an automation type and agent. */
  onCreate: (type?: AutomationType, agentId?: string) => void;
  /** Open the management surface. */
  onOpenManage: () => void;
  /** Open the agents index. */
  onManageAgents: () => void;
  /** Right sidebar content (already wrapped as an <aside> with the right-sidebar class). */
  rhs?: ReactNode;
  /** Layered surface over the shell (e.g. a modal). */
  overlay?: ReactNode;
}

const MENU_ANIM_MS = 150;

export default function AutomationsShell({
  onCreate,
  onOpenManage,
  onManageAgents,
  rhs,
  overlay,
}: AutomationsShellProps) {
  const [aiMenuOpen, setAiMenuOpen] = useState(false);

  const aiAnchorRef = useRef<HTMLSpanElement>(null);

  const aiAnim = useExitAnimation(aiMenuOpen, MENU_ANIM_MS);

  useOutsideClose(aiAnchorRef, aiMenuOpen, () => setAiMenuOpen(false));

  const closeAiMenu = () => setAiMenuOpen(false);

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
            onSelectType={(type) => {
              closeAiMenu();
              onCreate(type);
            }}
            onViewAutomations={() => {
              closeAiMenu();
              onOpenManage();
            }}
            onManageAgents={() => {
              closeAiMenu();
              onManageAgents();
            }}
          />
        </div>
      )}
    </span>
  );

  return (
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
          extraStatIcons={agentsStatIcon}
          onInfoClick={onOpenManage}
        />
      }
      trailing={rhs}
      overlay={overlay}
    >
      <div className={shellStyles['channel-shell__messages']}>
        <Scrollbar>
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
          </div>
        </Scrollbar>
      </div>

      <div className={shellStyles['channel-shell__message-input']}>
        <MessageInput placeholder="Write to UX Design" />
      </div>
    </ChannelShell>
  );
}
