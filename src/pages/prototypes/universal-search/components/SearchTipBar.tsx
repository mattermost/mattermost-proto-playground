import { useEffect, useRef, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import KeyboardReturnIcon from '@mattermost/compass-icons/components/keyboard-return';
import LightbulbOutlineIcon from '@mattermost/compass-icons/components/lightbulb-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { PopoverMenu } from '@mattermost/compass-ui/components/popover-menu';
import { ShortcutTag } from '@mattermost/compass-ui/components/shortcut-tag';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import type { SearchAgent } from '../universalSearchData';
import styles from './SearchTipBar.module.scss';

type BrowseChannelsTip = {
  kind: 'browse-channels';
  onBrowse?: () => void;
};

type ModifierTip = {
  kind: 'modifiers';
  modifiers: readonly string[];
  onModifierClick?: (modifier: string) => void;
};

type ShortcutTip = {
  kind: 'shortcut';
  prefix: string;
  keys: string[];
  suffix: string;
};

type PeopleTip = {
  kind: 'people';
};

type NoteTip = {
  kind: 'note';
  text: string;
};

type EnterSearchTip = {
  kind: 'enter-search';
};

type AgentsTip = {
  kind: 'agents';
  agents: readonly SearchAgent[];
  selectedId: string;
  onSelect: (id: string) => void;
  onMenuOpenChange?: (open: boolean) => void;
};

export type SearchTip =
  | BrowseChannelsTip
  | ModifierTip
  | ShortcutTip
  | PeopleTip
  | NoteTip
  | EnterSearchTip
  | AgentsTip;

type SearchTipBarProps = {
  tip: SearchTip;
};

function TipIcon() {
  return (
    <Icon
      className={styles['search-tip-bar__icon']}
      glyph={<LightbulbOutlineIcon />}
      size="16"
    />
  );
}

function AgentsTipBar({ tip }: { tip: AgentsTip }) {
  const [open, setOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  useOutsideClose(selectorRef, open, () => setOpen(false));
  useEffect(() => {
    tip.onMenuOpenChange?.(open);
    return () => tip.onMenuOpenChange?.(false);
  }, [open, tip.onMenuOpenChange]);
  const selected =
    tip.agents.find((agent) => agent.id === tip.selectedId) ?? tip.agents[0];

  return (
    <div className={`${styles['search-tip-bar']} ${styles['search-tip-bar--agents']}`}>
      <div className={styles['search-tip-bar__hint']}>
        <TipIcon />
        <p className={styles['search-tip-bar__text']}>
          Agents searches only content you have access to
        </p>
      </div>
      <div className={styles['search-tip-bar__search-with']} ref={selectorRef}>
        <span className={styles['search-tip-bar__search-with-label']}>
          Search with
        </span>
        <button
          type="button"
          className={styles['search-tip-bar__agent']}
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((current) => !current)}
        >
          <span className={styles['search-tip-bar__agent-name']}>
            {selected?.name}
          </span>
          <Icon glyph={<ChevronDownIcon />} size="16" />
        </button>
        {open ? (
          <PopoverMenu
            className={styles['search-tip-bar__agent-menu']}
            role="menu"
            aria-label="Choose an Agent"
          >
            <div className={styles['search-tip-bar__agent-menu-header']}>
              <MenuGroupHeading label="Choose an Agent" />
              <Button
                emphasis="link"
                size="x-small"
                type="button"
                onClick={() => setOpen(false)}
              >
                Manage
              </Button>
            </div>
            {tip.agents.map((agent) => (
              <MenuItem
                key={agent.id}
                label={agent.name}
                leadingVisual={
                  <UserAvatar
                    src={agent.avatarSrc}
                    alt={agent.name}
                    size="24"
                  />
                }
                trailingElement={agent.id === selected?.id}
                onClick={() => {
                  tip.onSelect(agent.id);
                  setOpen(false);
                }}
              />
            ))}
          </PopoverMenu>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchTipBar({ tip }: SearchTipBarProps) {
  if (tip.kind === 'agents') {
    return <AgentsTipBar tip={tip} />;
  }

  if (tip.kind === 'browse-channels') {
    return (
      <div className={styles['search-tip-bar']}>
        <TipIcon />
        <p className={styles['search-tip-bar__text']}>
          Looking for more channels?{' '}
          <Button
            emphasis="link"
            size="small"
            type="button"
            onClick={tip.onBrowse}
          >
            Browse channels
          </Button>
        </p>
      </div>
    );
  }

  if (tip.kind === 'modifiers') {
    return (
      <div className={styles['search-tip-bar']}>
        <TipIcon />
        <p className={styles['search-tip-bar__label']}>Tip: Try</p>
        <div className={styles['search-tip-bar__modifiers']}>
          {tip.modifiers.map((modifier) => (
            <Button
              key={modifier}
              compact
              emphasis="dim"
              size="x-small"
              type="button"
              onClick={() => tip.onModifierClick?.(modifier)}
            >
              {modifier}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (tip.kind === 'note') {
    return (
      <div className={styles['search-tip-bar']}>
        <TipIcon />
        <p className={styles['search-tip-bar__text']}>{tip.text}</p>
      </div>
    );
  }

  if (tip.kind === 'people') {
    return (
      <div className={styles['search-tip-bar']}>
        <TipIcon />
        <p className={styles['search-tip-bar__text']}>
          Use ⌘-Shift-K to{' '}
          <Button emphasis="link" size="small" type="button">
            browse for teammates
          </Button>{' '}
          or{' '}
          <Button emphasis="link" size="small" type="button">
            start a group message
          </Button>
        </p>
      </div>
    );
  }

  if (tip.kind === 'enter-search') {
    return (
      <div className={styles['search-tip-bar']}>
        <span className={styles['search-tip-bar__enter-key']} aria-hidden>
          <Icon glyph={<KeyboardReturnIcon />} size="12" />
        </span>
        <p className={styles['search-tip-bar__text']}>Enter to search</p>
      </div>
    );
  }

  return (
    <div className={styles['search-tip-bar']}>
      <TipIcon />
      <p className={styles['search-tip-bar__label']}>{tip.prefix}</p>
      <span className={styles['search-tip-bar__shortcuts']}>
        {tip.keys.map((key) => (
          <ShortcutTag key={key} label={key} size="small" />
        ))}
      </span>
      <p className={styles['search-tip-bar__text']}>{tip.suffix}</p>
    </div>
  );
}
