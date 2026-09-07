import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentType,
} from 'react';
import { createPortal } from 'react-dom';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import LockIcon from '@mattermost/compass-icons/components/lock';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TuneIcon from '@mattermost/compass-icons/components/tune';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { Modal } from '@mattermost/compass-ui/components/modal';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { SearchInput } from '@mattermost/compass-ui/components/search-input';
import { Select } from '@mattermost/compass-ui/components/select';
import { TextArea } from '@mattermost/compass-ui/components/text-area';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import {
  AGENT_ACCESS_ENTRIES,
  AGENT_ACCESS_ROLE_OPTIONS,
  AGENT_COLORS,
  AGENT_COLOR_STOPS,
  AGENT_MODEL_OPTIONS,
  AGENT_SHAPES,
  DEFAULT_AGENT_MODEL,
  DEFAULT_AGENT_VISIBILITY,
  type AgentAccessRole,
  type AgentColor,
  type AgentProfile,
  type AgentShape,
  type AgentVisibility,
} from '../agentsData';
import type { AgentUpdates } from '../context/AgentsContext';
import AgentAvatar from './AgentAvatar';
import styles from './AgentSettingsModal.module.scss';

const EXIT_MS = 150;

type SettingsTab = 'info' | 'model' | 'access' | 'advanced';

type TabDef = {
  id: SettingsTab;
  label: string;
  IconGlyph: ComponentType;
};

const TABS: TabDef[] = [
  { id: 'info', label: 'Info', IconGlyph: InformationOutlineIcon },
  {
    id: 'model',
    label: 'Model & Instructions',
    IconGlyph: FileTextOutlineIcon,
  },
  {
    id: 'access',
    label: 'Access & sharing',
    IconGlyph: AccountMultipleOutlineIcon,
  },
  { id: 'advanced', label: 'Advanced', IconGlyph: TuneIcon },
];

type VisibilityOption = {
  value: AgentVisibility;
  title: string;
  description: string;
  IconGlyph: ComponentType;
};

const VISIBILITY_OPTIONS: VisibilityOption[] = [
  {
    value: 'public',
    title: 'Public agent',
    description: 'Any member can use',
    IconGlyph: GlobeIcon,
  },
  {
    value: 'private',
    title: 'Private agent',
    description: 'Only invited members',
    IconGlyph: LockIcon,
  },
];

type DraftState = {
  name: string;
  description: string;
  purpose: string;
  shape: AgentShape;
  color: AgentColor;
  model: string;
  visibility: AgentVisibility;
  customImageSrc: string | null;
};

function profileToDraft(agent: AgentProfile): DraftState {
  return {
    name: agent.name,
    description: agent.description ?? '',
    purpose: agent.purpose ?? '',
    shape: agent.shape,
    color: agent.color,
    model: agent.model || DEFAULT_AGENT_MODEL,
    visibility: agent.visibility || DEFAULT_AGENT_VISIBILITY,
    customImageSrc: agent.customImageSrc ?? null,
  };
}

function draftsEqual(a: DraftState, b: DraftState): boolean {
  return (
    a.name === b.name &&
    a.description === b.description &&
    a.purpose === b.purpose &&
    a.shape === b.shape &&
    a.color === b.color &&
    a.model === b.model &&
    a.visibility === b.visibility &&
    a.customImageSrc === b.customImageSrc
  );
}

type AgentSettingsModalProps = {
  open: boolean;
  agent: AgentProfile;
  onClose: () => void;
  onSave: (updates: AgentUpdates) => void;
};

export default function AgentSettingsModal({
  open,
  agent,
  onClose,
  onSave,
}: AgentSettingsModalProps) {
  const { rendered, exiting } = useExitAnimation(open, EXIT_MS);
  const baseId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('info');
  const [baseline, setBaseline] = useState<DraftState>(() =>
    profileToDraft(agent),
  );
  const [draft, setDraft] = useState<DraftState>(() => profileToDraft(agent));
  const [accessRoles, setAccessRoles] = useState<
    Record<string, AgentAccessRole>
  >(() =>
    Object.fromEntries(
      AGENT_ACCESS_ENTRIES.map((entry) => [entry.id, entry.role]),
    ),
  );
  const [peopleQuery, setPeopleQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    const next = profileToDraft(agent);
    setBaseline(next);
    setDraft(next);
    setActiveTab('info');
    setPeopleQuery('');
    setAccessRoles(
      Object.fromEntries(
        AGENT_ACCESS_ENTRIES.map((entry) => [entry.id, entry.role]),
      ),
    );
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [open, agent]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const isDirty = useMemo(
    () => !draftsEqual(draft, baseline),
    [draft, baseline],
  );

  const handleCustomImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const src = reader.result;
        setDraft((prev) => ({ ...prev, customImageSrc: src }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave({
      name: draft.name,
      description: draft.description,
      purpose: draft.purpose,
      shape: draft.shape,
      color: draft.color,
      model: draft.model,
      visibility: draft.visibility,
      customImageSrc: draft.customImageSrc ?? undefined,
    });
    onClose();
  };

  const filteredAccess = useMemo(() => {
    const q = peopleQuery.trim().toLowerCase();
    if (!q) return AGENT_ACCESS_ENTRIES;
    return AGENT_ACCESS_ENTRIES.filter(
      (entry) =>
        entry.name.toLowerCase().includes(q) ||
        entry.secondaryLabel.toLowerCase().includes(q),
    );
  }, [peopleQuery]);

  if (!rendered) return null;

  const panelId = `${baseId}-panel`;

  return createPortal(
    <div
      className={[
        styles['agent-settings-modal'],
        exiting ? styles['agent-settings-modal--exiting'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className={styles['agent-settings-modal__backdrop']}
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className={styles['agent-settings-modal__dialog']}
        role="presentation"
      >
        <Modal
          size="large"
          title="Agent Settings"
          subtitle={agent.name}
          headerDivider
          footerDivider={false}
          onClose={onClose}
        >
          <div className={styles['agent-settings-modal__layout']}>
            <nav
              className={styles['agent-settings-modal__sidebar']}
              aria-label="Agent settings sections"
            >
              <div
                className={styles['agent-settings-modal__tablist']}
                role="tablist"
                aria-orientation="vertical"
              >
                {TABS.map(({ id, label, IconGlyph }) => {
                  const selected = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      id={`${baseId}-tab-${id}`}
                      aria-selected={selected}
                      aria-controls={panelId}
                      tabIndex={selected ? 0 : -1}
                      className={[
                        styles['agent-settings-modal__tab'],
                        selected
                          ? styles['agent-settings-modal__tab--selected']
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => setActiveTab(id)}
                    >
                      <Icon glyph={<IconGlyph />} size="16" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className={styles['agent-settings-modal__main']}>
              <div className={styles['agent-settings-modal__scroll']}>
                <Scrollbar>
                  <div
                    className={styles['agent-settings-modal__panel']}
                    role="tabpanel"
                    id={panelId}
                    aria-labelledby={`${baseId}-tab-${activeTab}`}
                  >
                    {activeTab === 'info' ? (
                      <div className={styles['agent-settings-modal__info']}>
                        <div
                          className={
                            styles['agent-settings-modal__appearance']
                          }
                        >
                          <div
                            className={styles['agent-settings-modal__preview']}
                          >
                            <AgentAvatar
                              shape={draft.shape}
                              color={draft.color}
                              size="xl"
                              eyes
                              shadow
                              levitate
                              imageSrc={draft.customImageSrc ?? undefined}
                            />
                            <p
                              className={
                                styles['agent-settings-modal__preview-name']
                              }
                            >
                              {draft.name.trim() || 'Untitled agent'}
                            </p>
                          </div>

                          <div
                            className={
                              styles['agent-settings-modal__selectors']
                            }
                          >
                            <div
                              className={
                                styles['agent-settings-modal__swatches']
                              }
                              role="listbox"
                              aria-label="Appearance shape"
                            >
                              {AGENT_SHAPES.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  role="option"
                                  aria-selected={
                                    !draft.customImageSrc && draft.shape === s
                                  }
                                  className={
                                    styles['agent-settings-modal__swatch']
                                  }
                                  onClick={() => {
                                    setDraft((prev) => ({
                                      ...prev,
                                      shape: s,
                                      customImageSrc: null,
                                    }));
                                    if (fileInputRef.current) {
                                      fileInputRef.current.value = '';
                                    }
                                  }}
                                >
                                  <AgentAvatar
                                    shape={s}
                                    color={draft.color}
                                    size="sm"
                                    selected={
                                      !draft.customImageSrc &&
                                      draft.shape === s
                                    }
                                    className={
                                      styles[
                                        'agent-settings-modal__swatch-avatar'
                                      ]
                                    }
                                  />
                                </button>
                              ))}
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className={
                                  styles['agent-settings-modal__file-input']
                                }
                                tabIndex={-1}
                                aria-hidden
                                onChange={handleCustomImageChange}
                              />
                              <IconButton
                                className={
                                  styles['agent-settings-modal__upload']
                                }
                                size="medium"
                                rounded
                                icon={<Icon glyph={<PlusIcon />} size="20" />}
                                aria-label="Upload custom image"
                                onClick={() => fileInputRef.current?.click()}
                              />
                            </div>

                            <div
                              className={
                                styles['agent-settings-modal__colors']
                              }
                              role="listbox"
                              aria-label="Appearance color"
                            >
                              {AGENT_COLORS.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  role="option"
                                  aria-selected={draft.color === c}
                                  className={[
                                    styles['agent-settings-modal__color'],
                                    draft.color === c
                                      ? styles[
                                          'agent-settings-modal__color--selected'
                                        ]
                                      : '',
                                  ]
                                    .filter(Boolean)
                                    .join(' ')}
                                  onClick={() =>
                                    setDraft((prev) => ({
                                      ...prev,
                                      color: c,
                                    }))
                                  }
                                >
                                  <span
                                    className={
                                      styles['agent-settings-modal__color-dot']
                                    }
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

                        <div className={styles['agent-settings-modal__fields']}>
                          <TextInput
                            label="Name"
                            value={draft.name}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            aria-label="Agent name"
                          />
                          <div
                            className={
                              styles['agent-settings-modal__field-with-help']
                            }
                          >
                            <TextArea
                              value={draft.description}
                              onChange={(e) =>
                                setDraft((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              placeholder="Enter a description for this agent"
                              rows={3}
                              aria-label="Agent description"
                              aria-describedby={`${baseId}-description-help`}
                            />
                            <p
                              id={`${baseId}-description-help`}
                              className={styles['agent-settings-modal__help']}
                            >
                              Describe what this agent can do and what it
                              should be used for
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {activeTab === 'model' ? (
                      <div className={styles['agent-settings-modal__fields']}>
                        <Select
                          id={`${baseId}-model`}
                          label="AI Model"
                          size="large"
                          value={draft.model}
                          options={AGENT_MODEL_OPTIONS}
                          onChange={(val) =>
                            setDraft((prev) => ({ ...prev, model: val }))
                          }
                          zIndex={1400}
                        />
                        <div
                          className={
                            styles['agent-settings-modal__field-with-help']
                          }
                        >
                          <TextArea
                            value={draft.purpose}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                purpose: e.target.value,
                              }))
                            }
                            placeholder="Enter custom instructions for how you'd like this agent to work."
                            rows={10}
                            aria-label="Custom instructions"
                            aria-describedby={`${baseId}-instructions-help`}
                          />
                          <p
                            id={`${baseId}-instructions-help`}
                            className={styles['agent-settings-modal__help']}
                          >
                            Custom instructions allow you to share anything
                            you&apos;d like the agent to consider in its
                            response. This can include things like the
                            agent&apos;s role, its tone and personality, its
                            scope, do&apos;s and don&apos;ts, or how you want
                            responses formatted.
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {activeTab === 'access' ? (
                      <div className={styles['agent-settings-modal__access']}>
                        <div
                          className={styles['agent-settings-modal__access-block']}
                        >
                          <h3
                            className={
                              styles['agent-settings-modal__section-title']
                            }
                          >
                            Access
                          </h3>
                          <div
                            className={
                              styles['agent-settings-modal__visibility']
                            }
                            role="radiogroup"
                            aria-label="Agent visibility"
                          >
                            {VISIBILITY_OPTIONS.map(
                              ({
                                value,
                                title,
                                description,
                                IconGlyph,
                              }) => {
                                const selected = draft.visibility === value;
                                return (
                                  <button
                                    key={value}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    className={[
                                      styles[
                                        'agent-settings-modal__visibility-card'
                                      ],
                                      selected
                                        ? styles[
                                            'agent-settings-modal__visibility-card--selected'
                                          ]
                                        : '',
                                    ]
                                      .filter(Boolean)
                                      .join(' ')}
                                    onClick={() =>
                                      setDraft((prev) => ({
                                        ...prev,
                                        visibility: value,
                                      }))
                                    }
                                  >
                                    <span
                                      className={
                                        styles[
                                          'agent-settings-modal__visibility-icon-wrap'
                                        ]
                                      }
                                    >
                                      <Icon glyph={<IconGlyph />} size="24" />
                                    </span>
                                    <span
                                      className={
                                        styles[
                                          'agent-settings-modal__visibility-text'
                                        ]
                                      }
                                    >
                                      <span
                                        className={
                                          styles[
                                            'agent-settings-modal__visibility-title'
                                          ]
                                        }
                                      >
                                        {title}
                                      </span>
                                      <span
                                        className={
                                          styles[
                                            'agent-settings-modal__visibility-description'
                                          ]
                                        }
                                      >
                                        {description}
                                      </span>
                                    </span>
                                    {selected ? (
                                      <span
                                        className={
                                          styles[
                                            'agent-settings-modal__visibility-check'
                                          ]
                                        }
                                        aria-hidden
                                      >
                                        <Icon
                                          glyph={<CheckCircleIcon />}
                                          size="20"
                                        />
                                      </span>
                                    ) : null}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>

                        <div
                          className={styles['agent-settings-modal__access-block']}
                        >
                          <div
                            className={
                              styles['agent-settings-modal__section-header']
                            }
                          >
                            <h3
                              className={
                                styles['agent-settings-modal__section-title']
                              }
                            >
                              People and groups with access
                            </h3>
                            <p
                              className={styles['agent-settings-modal__help']}
                            >
                              Specific people, groups, and links that override
                              general access.
                            </p>
                          </div>
                          <SearchInput
                            placeholder="Add people, groups or channels"
                            value={peopleQuery}
                            onChange={(e) => setPeopleQuery(e.target.value)}
                            onClear={() => setPeopleQuery('')}
                            aria-label="Add people, groups or channels"
                          />
                          <div
                            className={
                              styles['agent-settings-modal__access-list']
                            }
                            role="list"
                            aria-label="People and groups with access"
                          >
                            {filteredAccess.map((entry) => (
                              <div
                                key={entry.id}
                                className={
                                  styles['agent-settings-modal__access-row']
                                }
                                role="listitem"
                              >
                                <MenuItem
                                  className={
                                    styles[
                                      'agent-settings-modal__access-item'
                                    ]
                                  }
                                  label={entry.name}
                                  secondaryLabel={entry.secondaryLabel}
                                  secondaryLabelPosition="inline"
                                  leadingVisual={
                                    <UserAvatar
                                      alt={entry.name}
                                      name={entry.name}
                                      src={entry.avatarSrc}
                                      size="24"
                                    />
                                  }
                                  trailingVisual={
                                    <span
                                      className={
                                        styles[
                                          'agent-settings-modal__access-role'
                                        ]
                                      }
                                    >
                                      {
                                        AGENT_ACCESS_ROLE_OPTIONS.find(
                                          (opt) =>
                                            opt.value ===
                                            accessRoles[entry.id],
                                        )?.label
                                      }
                                      <Icon
                                        glyph={<ChevronDownIcon />}
                                        size="16"
                                      />
                                    </span>
                                  }
                                  trailingElement
                                  onClick={() => {
                                    const order: AgentAccessRole[] = [
                                      'admin',
                                      'editor',
                                      'viewer',
                                    ];
                                    const current =
                                      accessRoles[entry.id] ?? entry.role;
                                    const next =
                                      order[
                                        (order.indexOf(current) + 1) %
                                          order.length
                                      ];
                                    setAccessRoles((prev) => ({
                                      ...prev,
                                      [entry.id]: next,
                                    }));
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {activeTab === 'advanced' ? (
                      <div
                        className={styles['agent-settings-modal__placeholder']}
                      >
                        <h3
                          className={
                            styles['agent-settings-modal__section-title']
                          }
                        >
                          Advanced
                        </h3>
                        <p className={styles['agent-settings-modal__help']}>
                          Temperature, tool permissions, retention, and other
                          advanced controls will live here. Nothing to
                          configure in this prototype yet.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </Scrollbar>
              </div>

              {isDirty ? (
                <div className={styles['agent-settings-modal__floating']}>
                  <div
                    className={
                      styles['agent-settings-modal__floating-inner']
                    }
                  >
                    <p
                      className={
                        styles['agent-settings-modal__floating-hint']
                      }
                    >
                      There are unsaved changes
                    </p>
                    <div
                      className={
                        styles['agent-settings-modal__floating-actions']
                      }
                    >
                      <Button emphasis="tertiary" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button emphasis="primary" onClick={handleSave}>
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Modal>
      </div>
    </div>,
    document.body,
  );
}
