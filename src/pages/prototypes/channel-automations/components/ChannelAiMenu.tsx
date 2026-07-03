import { Icon, IconButton, MenuItem, TextInput } from '@mattermost/compass-ui';
import { useState } from 'react';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import SendIcon from '@mattermost/compass-icons/components/send';
import {
  PopoverMenu,
  PopoverMenuDivider,
  PopoverMenuGroup,
  PopoverMenuGroupTitle,
} from '@mattermost/compass-ui';
import {
  AUTOMATION_TYPE_META,
  type AutomationType,
} from '../channelAutomationsData';
import AgentEngineDropdown from './AgentEngineDropdown';
import styles from './ChannelAiMenu.module.scss';

/** Create actions in the Automations submenu (Figma `4265-40105`). */
const CREATE_MENU_ORDER: AutomationType[] = [
  'custom',
  'recurring-post',
  'recap',
  'auto-responder',
];

export interface ChannelAiMenuProps {
  onSelectType: (type: AutomationType) => void;
  onViewAutomations: () => void;
  onManageAgents: () => void;
}

/**
 * The channel-header Agents menu (Figma `4258-42989`): an agent selector,
 * an ask-input, a Summarize group, and an Automations submenu [NEW].
 */
export default function ChannelAiMenu({
  onSelectType,
  onViewAutomations,
  onManageAgents,
}: ChannelAiMenuProps) {
  const [automationsOpen, setAutomationsOpen] = useState(false);

  return (
    <PopoverMenu className={styles['ai-menu']}>
      <div className={styles['ai-menu__generate']}>
        <span className={styles['ai-menu__generate-label']}>Agent</span>
        <AgentEngineDropdown />
      </div>

      <div className={styles['ai-menu__ask']}>
        <TextInput
          aria-label="Ask Agents about this channel"
          placeholder="Ask Agents about this channel…"
          leadingIcon={<Icon size="16" glyph={<CreationOutlineIcon />} />}
          trailingIcon={
            <IconButton
              size="X-Small"
              aria-label="Send"
              icon={<Icon size="16" glyph={<SendIcon />} />}
            />
          }
        />
      </div>

      <PopoverMenuDivider />

      <PopoverMenuGroup aria-label="Summarize">
        <PopoverMenuGroupTitle>Summarize</PopoverMenuGroupTitle>
        <MenuItem leadingElement={false} label="Summarize unreads" />
        <MenuItem leadingElement={false} label="Summarize last 7 days" />
        <MenuItem
          leadingElement={false}
          label="Select date range to summarize"
        />
      </PopoverMenuGroup>

      <PopoverMenuDivider />

      <PopoverMenuGroup
        aria-label="Automations"
        className={styles['ai-menu__automation-group']}
        onMouseLeave={() => setAutomationsOpen(false)}
      >
        <MenuItem
          leadingElement={false}
          label="Automations"
          tag
          active={automationsOpen}
          trailingElement
          trailingVisual={<Icon size="16" glyph={<ChevronRightIcon />} />}
          aria-haspopup="menu"
          aria-expanded={automationsOpen}
          onMouseEnter={() => setAutomationsOpen(true)}
          onClick={() => setAutomationsOpen((open) => !open)}
        />

        {automationsOpen && (
          <PopoverMenu variant="child" className={styles['ai-menu__submenu']}>
            <MenuItem
              leadingElement={false}
              label="Automations in this channel"
              onClick={onViewAutomations}
            />

            <PopoverMenuDivider />

            {CREATE_MENU_ORDER.map((type) => (
              <MenuItem
                key={type}
                leadingElement={false}
                label={AUTOMATION_TYPE_META[type].menuLabel}
                onClick={() => onSelectType(type)}
              />
            ))}

            <PopoverMenuDivider />

            <MenuItem
              leadingElement={false}
              label="Manage agents"
              onClick={onManageAgents}
            />
          </PopoverMenu>
        )}
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}
