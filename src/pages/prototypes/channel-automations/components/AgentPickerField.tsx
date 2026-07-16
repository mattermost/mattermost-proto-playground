import { Icon, MenuItem, PopoverMenu, UserAvatar } from '@mattermost/compass-ui';
import { useId, useRef, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  AGENTS,
  agentAvatarProps,
  agentById,
  agentCapabilitySummary,
} from '../channelAutomationsData';
import styles from './AgentPickerField.module.scss';

export interface AgentPickerFieldProps {
  value: string;
  onChange: (agentId: string) => void;
  /** Accessible name when no external labelledBy is provided. */
  label?: string;
  /** External label id for aria-labelledby (e.g. section title). */
  labelledBy?: string;
  className?: string;
  /** Option 4 — show each agent's tools/access so fit is judgeable. */
  showCapabilities?: boolean;
}

export default function AgentPickerField({
  value,
  onChange,
  label = 'Agent',
  labelledBy,
  className = '',
  showCapabilities = false,
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
        <button
          type="button"
          className={styles['picker__trigger']}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={labelledBy}
          aria-label={labelledBy ? undefined : label}
          aria-controls={listboxId}
          onClick={() => setOpen((current) => !current)}
        >
          {selected ? (
            <UserAvatar
              className={styles['picker__avatar']}
              size="28"
              {...agentAvatarProps(selected)}
            />
          ) : null}
          <span className={styles['picker__value-stack']}>
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
            {selected && showCapabilities ? (
              <span className={styles['picker__capability']}>
                {agentCapabilitySummary(selected)}
              </span>
            ) : null}
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
              secondaryLabel={
                showCapabilities ? agentCapabilitySummary(agent) : undefined
              }
              active={value === agent.id}
              trailingElement={value === agent.id}
              leadingVisual={
                <UserAvatar size="24" {...agentAvatarProps(agent)} />
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
