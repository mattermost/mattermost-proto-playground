import { useState } from 'react';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import SendIcon from '@mattermost/compass-icons/components/send';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuGroup,
  PopoverMenuGroupTitle,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import {
  AUTOMATION_TYPE_META,
  AUTOMATION_TYPES,
  type AffectingAutomation,
  type AutomationType,
} from '../channelAutomationsData';
import { automationGlyph } from './automationIcons';
import styles from './ChannelAiMenu.module.scss';

export interface ChannelAiMenuProps {
  automationCount: number;
  /** Automations whose scope reaches the active channel, with the match reason. */
  affecting: AffectingAutomation[];
  onSelectType: (type: AutomationType) => void;
  onViewAutomations: () => void;
}

/**
 * The channel-header Agents menu (Figma `4258-42989`): an ask-input, a
 * Summarize group, the "Create an automation [NEW]" submenu, a "View
 * automations" row that surfaces the count, and a generation-engine selector.
 */
export default function ChannelAiMenu({
  automationCount,
  affecting,
  onSelectType,
  onViewAutomations,
}: ChannelAiMenuProps) {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [activeOpen, setActiveOpen] = useState(false);

  return (
    <PopoverMenu className={styles['ai-menu']}>
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
        onMouseLeave={() => setSubmenuOpen(false)}
      >
        <MenuItem
          leadingElement={false}
          label="Create an automation"
          tag
          active={submenuOpen}
          trailingElement
          trailingVisual={<Icon size="16" glyph={<ChevronRightIcon />} />}
          aria-haspopup="menu"
          aria-expanded={submenuOpen}
          onMouseEnter={() => setSubmenuOpen(true)}
          onClick={() => setSubmenuOpen((o) => !o)}
        />

        {submenuOpen && (
          <PopoverMenu variant="child" className={styles['ai-menu__submenu']}>
            {AUTOMATION_TYPES.map((meta) => (
              <MenuItem
                key={meta.type}
                label={meta.menuLabel}
                leadingVisual={
                  <Icon size="16" glyph={automationGlyph(meta.iconKey)} />
                }
                onClick={() => onSelectType(meta.type)}
              />
            ))}
            <PopoverMenuDivider />
            <MenuItem
              label="View automations in this channel"
              leadingVisual={
                <Icon size="16" glyph={<FormatListBulletedIcon />} />
              }
              secondaryLabel={String(automationCount)}
              secondaryLabelPosition="Inline"
              onClick={onViewAutomations}
            />
          </PopoverMenu>
        )}
      </PopoverMenuGroup>

      {affecting.length > 0 && (
        <>
          <PopoverMenuDivider />
          <PopoverMenuGroup
            aria-label="Active in this channel"
            className={styles['ai-menu__automation-group']}
            onMouseLeave={() => setActiveOpen(false)}
          >
            <MenuItem
              leadingElement={false}
              label="Active in this channel"
              secondaryLabel={String(affecting.length)}
              secondaryLabelPosition="Inline"
              active={activeOpen}
              trailingElement
              trailingVisual={<Icon size="16" glyph={<ChevronRightIcon />} />}
              aria-haspopup="menu"
              aria-expanded={activeOpen}
              onMouseEnter={() => setActiveOpen(true)}
              onClick={() => setActiveOpen((o) => !o)}
            />

            {activeOpen && (
              <PopoverMenu variant="child" className={styles['ai-menu__submenu']}>
                {affecting.map(({ automation, match }) => (
                  <MenuItem
                    key={automation.id}
                    label={automation.name}
                    leadingVisual={
                      <Icon
                        size="16"
                        glyph={automationGlyph(
                          AUTOMATION_TYPE_META[automation.type].iconKey,
                        )}
                      />
                    }
                    secondaryLabel={match.label}
                    secondaryLabelPosition="Below"
                    onClick={onViewAutomations}
                  />
                ))}
                <PopoverMenuDivider />
                <MenuItem
                  leadingElement={false}
                  label="View all automations"
                  secondaryLabel={String(automationCount)}
                  secondaryLabelPosition="Inline"
                  onClick={onViewAutomations}
                />
              </PopoverMenu>
            )}
          </PopoverMenuGroup>
        </>
      )}

      <PopoverMenuDivider />

      <div className={styles['ai-menu__generate']}>
        <span className={styles['ai-menu__generate-label']}>Generate with</span>
        <select
          className={styles['ai-menu__generate-select']}
          defaultValue="openai"
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
        </select>
      </div>
    </PopoverMenu>
  );
}
