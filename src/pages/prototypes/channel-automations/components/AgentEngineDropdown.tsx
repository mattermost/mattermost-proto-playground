import { Icon, MenuItem, PopoverMenu } from '@mattermost/compass-ui';
import { useRef, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { AGENT, AGENTS } from '../channelAutomationsData';
import styles from './AgentEngineDropdown.module.scss';

/** Agent picker chip for the channel-header Agents menu. */
export default function AgentEngineDropdown() {
  const [open, setOpen] = useState(false);
  const [agentId, setAgentId] = useState(AGENT.id);
  const anchorRef = useRef<HTMLDivElement>(null);

  useOutsideClose(anchorRef, open, () => setOpen(false));

  const selected = AGENTS.find((agent) => agent.id === agentId) ?? AGENT;

  return (
    <div ref={anchorRef} className={styles['engine-dropdown']}>
      <button
        type="button"
        className={[
          styles['engine-dropdown__trigger'],
          open ? styles['engine-dropdown__trigger--open'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Agent: ${selected.displayName}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected.displayName}</span>
        <Icon size="12" glyph={<ChevronDownIcon />} />
      </button>

      {open && (
        <PopoverMenu
          variant="child"
          className={styles['engine-dropdown__menu']}
          role="listbox"
          aria-label="Choose agent"
        >
          {AGENTS.map((agent) => (
            <MenuItem
              key={agent.id}
              label={agent.displayName}
              leadingElement={false}
              active={agentId === agent.id}
              trailingElement={agentId === agent.id}
              onClick={() => {
                setAgentId(agent.id);
                setOpen(false);
              }}
            />
          ))}
        </PopoverMenu>
      )}
    </div>
  );
}
