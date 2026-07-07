import { Icon, MenuItem, PopoverMenu, UserAvatar } from '@mattermost/compass-ui';
import { useId, useRef, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { AGENTS, agentAvatarProps, agentById } from '../channelAutomationsData';
import styles from './AgentPickerField.module.scss';

export interface AgentPickerFieldProps {
  value: string;
  onChange: (agentId: string) => void;
  label?: string;
  className?: string;
}

export default function AgentPickerField({
  value,
  onChange,
  label = 'Agent',
  className = '',
}: AgentPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useOutsideClose(anchorRef, open, () => setOpen(false));

  const selected = value ? agentById(value) : undefined;

  const close = () => setOpen(false);

  return (
    <div
      ref={anchorRef}
      className={[styles['picker'], className].filter(Boolean).join(' ')}
    >
      <div
        className={[
          styles['picker__wrapper'],
          open ? styles['picker__wrapper--open'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className={styles['picker__label']} id={`${listboxId}-label`}>
          {label}
        </span>
        <button
          type="button"
          className={styles['picker__trigger']}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${listboxId}-label`}
          aria-controls={listboxId}
          onClick={() => setOpen((current) => !current)}
        >
          {selected ? (
            <UserAvatar
              className={styles['picker__avatar']}
              size="16"
              {...agentAvatarProps(selected)}
            />
          ) : null}
          <span
            className={[
              styles['picker__value'],
              selected ? '' : styles['picker__value--placeholder'],
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {selected ? selected.displayName : 'Choose an agent'}
          </span>
          <span
            className={[
              styles['picker__chevron'],
              open ? styles['picker__chevron--open'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden
          >
            <Icon size="12" glyph={<ChevronDownIcon />} />
          </span>
        </button>
      </div>

      {open ? (
        <PopoverMenu
          id={listboxId}
          className={styles['picker__menu']}
          role="listbox"
          aria-label={label}
        >
          {AGENTS.map((agent) => (
            <MenuItem
              key={agent.id}
              label={agent.displayName}
              active={value === agent.id}
              trailingElement={value === agent.id}
              leadingVisual={
                <UserAvatar size="16" {...agentAvatarProps(agent)} />
              }
              onClick={() => {
                onChange(agent.id);
                close();
              }}
            />
          ))}
        </PopoverMenu>
      ) : null}
    </div>
  );
}
