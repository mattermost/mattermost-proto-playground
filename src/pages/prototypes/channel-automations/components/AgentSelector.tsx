import {
  Dropdown,
  MenuItem,
  PopoverMenu,
  UserAvatar,
} from '@mattermost/compass-ui';
import { useEffect, useId, useRef, useState } from 'react';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  AGENT,
  AGENTS,
  agentAvatarProps,
  agentById,
} from '../channelAutomationsData';
import styles from './AgentSelector.module.scss';

export interface AgentSelectorProps {
  agentId?: string;
  onChange?: (agentId: string) => void;
}

export default function AgentSelector({
  agentId,
  onChange,
}: AgentSelectorProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(
    () => agentId ?? AGENT.id,
  );

  useEffect(() => {
    if (agentId) setSelectedId(agentId);
  }, [agentId]);

  useOutsideClose(rootRef, open, () => setOpen(false));

  const agent = agentById(selectedId) ?? AGENT;

  return (
    <div ref={rootRef} className={styles['selector']}>
      <Dropdown
        className={styles['selector__trigger']}
        size="Small"
        isOpen={open}
        aria-label={`Agent: ${agent.displayName}`}
        aria-controls={listboxId}
        leadingIcon={<UserAvatar size="16" {...agentAvatarProps(agent)} />}
        onClick={() => setOpen((current) => !current)}
      >
        {agent.displayName}
      </Dropdown>

      {open ? (
        <PopoverMenu
          id={listboxId}
          className={styles['selector__menu']}
          role="listbox"
          aria-label="Choose an agent"
        >
          {AGENTS.map((option) => (
            <MenuItem
              key={option.id}
              label={option.displayName}
              active={option.id === selectedId}
              trailingElement={option.id === selectedId}
              leadingVisual={
                <UserAvatar size="24" {...agentAvatarProps(option)} />
              }
              onClick={() => {
                setSelectedId(option.id);
                onChange?.(option.id);
                setOpen(false);
              }}
            />
          ))}
        </PopoverMenu>
      ) : null}
    </div>
  );
}
