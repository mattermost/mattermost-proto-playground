import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentType,
} from 'react';
import { createPortal } from 'react-dom';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Modal } from '@mattermost/compass-ui/components/modal';
import { Select } from '@mattermost/compass-ui/components/select';
import { TextArea } from '@mattermost/compass-ui/components/text-area';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import {
  AGENT_COLORS,
  AGENT_COLOR_STOPS,
  AGENT_MODEL_OPTIONS,
  AGENT_SHAPES,
  SENTINEL_DEFAULT,
  type AgentColor,
  type AgentShape,
  type AgentVisibility,
} from '../agentsData';
import type { NewAgentDraft } from '../context/AgentsContext';
import AgentAvatar from './AgentAvatar';
import styles from './NewAgentModal.module.scss';

const EXIT_MS = 150;

type VisibilityOption = {
  value: AgentVisibility;
  title: string;
  description: string;
  IconGlyph: ComponentType;
};

const VISIBILITY_OPTIONS: VisibilityOption[] = [
  {
    value: 'private',
    title: 'Private agent',
    description: 'Only invited members',
    IconGlyph: LockOutlineIcon,
  },
  {
    value: 'public',
    title: 'Public agent',
    description: 'Any member can use',
    IconGlyph: GlobeIcon,
  },
];

type NewAgentModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (draft: NewAgentDraft) => void;
};

export default function NewAgentModal({
  open,
  onClose,
  onSave,
}: NewAgentModalProps) {
  const { rendered, exiting } = useExitAnimation(open, EXIT_MS);
  const purposeLabelId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(SENTINEL_DEFAULT.name);
  const [purpose, setPurpose] = useState(SENTINEL_DEFAULT.description);
  const [shape, setShape] = useState<AgentShape>(SENTINEL_DEFAULT.shape);
  const [color, setColor] = useState<AgentColor>(SENTINEL_DEFAULT.color);
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);
  const [model, setModel] = useState<string>(SENTINEL_DEFAULT.model);
  const [visibility, setVisibility] = useState<AgentVisibility>(
    SENTINEL_DEFAULT.visibility,
  );

  useEffect(() => {
    if (!open) return;
    setName(SENTINEL_DEFAULT.name);
    setPurpose(SENTINEL_DEFAULT.description);
    setShape(SENTINEL_DEFAULT.shape);
    setColor(SENTINEL_DEFAULT.color);
    setCustomImageSrc(null);
    setModel(SENTINEL_DEFAULT.model);
    setVisibility(SENTINEL_DEFAULT.visibility);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [open]);

  const handleCustomImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomImageSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

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
                    onSave({
                      name,
                      shape,
                      color,
                      purpose,
                      model,
                      visibility,
                      customImageSrc: customImageSrc ?? undefined,
                    });
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
                  shadow
                  levitate
                  imageSrc={customImageSrc ?? undefined}
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

              <div className={styles['new-agent-modal__selectors']}>
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
                      aria-selected={!customImageSrc && shape === s}
                      className={styles['new-agent-modal__swatch']}
                      onClick={() => {
                        setShape(s);
                        setCustomImageSrc(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <AgentAvatar
                        shape={s}
                        color={color}
                        size="sm"
                        selected={!customImageSrc && shape === s}
                        className={styles['new-agent-modal__swatch-avatar']}
                      />
                    </button>
                  ))}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className={styles['new-agent-modal__file-input']}
                    tabIndex={-1}
                    aria-hidden
                    onChange={handleCustomImageChange}
                  />
                  <IconButton
                    className={styles['new-agent-modal__upload']}
                    size="medium"
                    rounded
                    icon={<Icon glyph={<PlusIcon />} size="20" />}
                    aria-label="Upload custom image"
                    onClick={() => fileInputRef.current?.click()}
                  />
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
            </div>

            <div className={styles['new-agent-modal__settings']}>
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
                  rows={3}
                />
              </div>

              <div className={styles['new-agent-modal__field']}>
                <Select
                  id="new-agent-model-select"
                  label="Model"
                  size="medium"
                  value={model}
                  options={AGENT_MODEL_OPTIONS}
                  onChange={(val) => setModel(val)}
                  zIndex={1400}
                />
              </div>

              <div
                className={styles['new-agent-modal__visibility']}
                role="radiogroup"
                aria-label="Agent visibility"
              >
                {VISIBILITY_OPTIONS.map(
                  ({ value, title, description, IconGlyph }) => {
                    const selected = visibility === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={[
                          styles['new-agent-modal__visibility-card'],
                          selected
                            ? styles[
                                'new-agent-modal__visibility-card--selected'
                              ]
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => setVisibility(value)}
                      >
                        <span
                          className={
                            styles['new-agent-modal__visibility-icon-wrap']
                          }
                        >
                          <Icon glyph={<IconGlyph />} size="24" />
                        </span>
                        <span
                          className={styles['new-agent-modal__visibility-text']}
                        >
                          <span
                            className={
                              styles['new-agent-modal__visibility-title']
                            }
                          >
                            {title}
                          </span>
                          <span
                            className={
                              styles['new-agent-modal__visibility-description']
                            }
                          >
                            {description}
                          </span>
                        </span>
                        {selected ? (
                          <span
                            className={
                              styles['new-agent-modal__visibility-check']
                            }
                            aria-hidden
                          >
                            <Icon glyph={<CheckCircleIcon />} size="20" />
                          </span>
                        ) : null}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>,
    document.body,
  );
}
