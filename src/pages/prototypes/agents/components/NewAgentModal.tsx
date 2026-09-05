import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@mattermost/compass-ui/components/button';
import { Modal } from '@mattermost/compass-ui/components/modal';
import { TextArea } from '@mattermost/compass-ui/components/text-area';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import {
  AGENT_COLORS,
  AGENT_COLOR_STOPS,
  AGENT_SHAPES,
  SENTINEL_DEFAULT,
  type AgentColor,
  type AgentShape,
} from '../agentsData';
import AgentAvatar from './AgentAvatar';
import styles from './NewAgentModal.module.scss';

const EXIT_MS = 150;

type NewAgentModalProps = {
  open: boolean;
  onClose: () => void;
  /** Slice 1: closes only — does not create chats or roster entries. */
  onSave: () => void;
};

export default function NewAgentModal({
  open,
  onClose,
  onSave,
}: NewAgentModalProps) {
  const { rendered, exiting } = useExitAnimation(open, EXIT_MS);
  const purposeLabelId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(SENTINEL_DEFAULT.name);
  const [purpose, setPurpose] = useState(SENTINEL_DEFAULT.purpose);
  const [shape, setShape] = useState<AgentShape>(SENTINEL_DEFAULT.shape);
  const [color, setColor] = useState<AgentColor>(SENTINEL_DEFAULT.color);

  useEffect(() => {
    if (!open) return;
    setName(SENTINEL_DEFAULT.name);
    setPurpose(SENTINEL_DEFAULT.purpose);
    setShape(SENTINEL_DEFAULT.shape);
    setColor(SENTINEL_DEFAULT.color);
  }, [open]);

  useEffect(() => {
    if (!open || !rendered || exiting) return;
    nameInputRef.current?.focus();
  }, [open, rendered, exiting]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!rendered) return null;

  return createPortal(
    <div
      className={[
        styles['new-agent-modal'],
        exiting ? styles['new-agent-modal--exiting'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className={styles['new-agent-modal__backdrop']}
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className={styles['new-agent-modal__dialog']} role="presentation">
        <Modal
          size="small"
          title="New agent"
          headerDivider={false}
          footerDivider={false}
          onClose={onClose}
          footer={
            <div className={styles['new-agent-modal__footer']}>
              <p className={styles['new-agent-modal__footer-hint']}>
                Agents will guide you through setup in next screen
              </p>
              <div className={styles['new-agent-modal__footer-actions']}>
                <Button emphasis="tertiary" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  emphasis="primary"
                  onClick={() => {
                    onSave();
                    onClose();
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          }
        >
          <div className={styles['new-agent-modal__body']}>
            <div className={styles['new-agent-modal__appearance']}>
              <div className={styles['new-agent-modal__preview']}>
                <AgentAvatar
                  shape={shape}
                  color={color}
                  size="xl"
                  eyes
                  levitate
                />
                <TextInput
                  ref={nameInputRef}
                  className={styles['new-agent-modal__name']}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name your agent"
                  aria-label="Agent name"
                  size="large"
                  autoFocus
                />
              </div>

              <div
                className={styles['new-agent-modal__swatches']}
                role="listbox"
                aria-label="Appearance shape"
              >
                {AGENT_SHAPES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="option"
                    aria-selected={shape === s}
                    className={styles['new-agent-modal__swatch']}
                    onClick={() => setShape(s)}
                  >
                    <AgentAvatar
                      shape={s}
                      color={color}
                      size="sm"
                      selected={shape === s}
                      className={styles['new-agent-modal__swatch-avatar']}
                    />
                  </button>
                ))}
              </div>

              <div
                className={styles['new-agent-modal__colors']}
                role="listbox"
                aria-label="Appearance color"
              >
                {AGENT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="option"
                    aria-selected={color === c}
                    className={[
                      styles['new-agent-modal__color'],
                      color === c
                        ? styles['new-agent-modal__color--selected']
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setColor(c)}
                  >
                    <span
                      className={styles['new-agent-modal__color-dot']}
                      style={{
                        ['--agent-avatar-highlight' as string]:
                          AGENT_COLOR_STOPS[c].highlight,
                        ['--agent-avatar-mid' as string]:
                          AGENT_COLOR_STOPS[c].mid,
                        ['--agent-avatar-edge' as string]:
                          AGENT_COLOR_STOPS[c].edge,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className={styles['new-agent-modal__purpose']}>
              <label
                id={purposeLabelId}
                className={styles['new-agent-modal__purpose-label']}
                htmlFor={`${purposeLabelId}-field`}
              >
                What&apos;s the main thing you want this agent to help you
                with?
              </label>
              <TextArea
                id={`${purposeLabelId}-field`}
                className={styles['new-agent-modal__purpose-field']}
                aria-labelledby={purposeLabelId}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>,
    document.body,
  );
}
