import { useRef, useState, type ComponentType } from 'react';
import CalendarMonthOutlineIcon from '@mattermost/compass-icons/components/calendar-month-outline';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import MessageArrowRightOutlineIcon from '@mattermost/compass-icons/components/message-arrow-right-outline';
import PlaylistCheckIcon from '@mattermost/compass-icons/components/playlist-check';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import UploadOutlineIcon from '@mattermost/compass-icons/components/upload-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { SKILL_CATALOG, type AgentSkill } from '../agentsData';
import styles from './AgentSettingsModal.module.scss';

type AgentSettingsSkillsPanelProps = {
  skillIds: string[];
  onChange: (skillIds: string[]) => void;
};

const SKILL_ICONS: Record<string, ComponentType> = {
  'draft-docs-page': FileTextOutlineIcon,
  'review-content': EyeOutlineIcon,
  'summarize-thread': MessageArrowRightOutlineIcon,
  'create-runbook': PlaylistCheckIcon,
  'weekly-digest': CalendarMonthOutlineIcon,
};

function toTitleCase(s: string): string {
  return s
    .split(/[-_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function fakeParseSkillFile(file: File): AgentSkill {
  const base = file.name.replace(/\.md$/i, '');
  return {
    id: `custom-${base}`,
    name: toTitleCase(base),
    description: 'Custom skill loaded from a markdown file.',
    command: base,
    commandHint: `Run the ${toTitleCase(base)} skill`,
  };
}

export default function AgentSettingsSkillsPanel({
  skillIds,
  onChange,
}: AgentSettingsSkillsPanelProps) {
  const [localSkills, setLocalSkills] = useState<AgentSkill[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allKnownSkills = [...SKILL_CATALOG, ...localSkills];
  const installed = allKnownSkills.filter((s) => skillIds.includes(s.id));
  const available = SKILL_CATALOG.filter((s) => !skillIds.includes(s.id));

  const addSkill = (skill: AgentSkill) => {
    if (
      !localSkills.find((s) => s.id === skill.id) &&
      !SKILL_CATALOG.find((s) => s.id === skill.id)
    ) {
      setLocalSkills((prev) => [...prev, skill]);
    }
    onChange([...skillIds, skill.id]);
  };

  const removeSkill = (id: string) => {
    onChange(skillIds.filter((x) => x !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = Array.from(e.dataTransfer.files).find((f) =>
      f.name.toLowerCase().endsWith('.md'),
    );
    if (!file) return;
    addSkill(fakeParseSkillFile(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addSkill(fakeParseSkillFile(file));
    e.target.value = '';
  };

  return (
    <div className={styles['agent-settings-modal__access']}>
      {/* Installed skills — only rendered when non-empty */}
      {installed.length > 0 && (
        <div className={styles['agent-settings-modal__access-block']}>
          <div className={styles['agent-settings-modal__section-header']}>
            <h3 className={styles['agent-settings-modal__section-title']}>
              Installed skills
            </h3>
            <p className={styles['agent-settings-modal__help']}>
              Slash commands are available in DMs with this agent.
            </p>
          </div>
          <div className={styles['agent-settings-modal__mcps']} role="list">
            {installed.map((skill) => (
              <div
                key={skill.id}
                className={styles['agent-settings-modal__mcp']}
                role="listitem"
              >
                <div className={styles['agent-settings-modal__mcp-header']}>
                  <span>{skill.name}</span>
                  <IconButton
                    size="small"
                    padding="compact"
                    destructive
                    icon={<Icon glyph={<TrashCanOutlineIcon />} size="16" />}
                    aria-label={`Remove ${skill.name}`}
                    onClick={() => removeSkill(skill.id)}
                  />
                </div>
                <p className={styles['agent-settings-modal__help']}>
                  {skill.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload custom skill */}
      <div className={styles['agent-settings-modal__access-block']}>
        <div className={styles['agent-settings-modal__section-header']}>
          <h3 className={styles['agent-settings-modal__section-title']}>
            Upload custom skill
          </h3>
        </div>
        <div
          className={[
            styles['agent-settings-modal__skill-drop'],
            dragOver ? styles['agent-settings-modal__skill-drop--over'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload skill file"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
          }}
        >
          <Icon glyph={<UploadOutlineIcon />} size="16" />
          <span className={styles['agent-settings-modal__skill-drop-label']}>
            {dragOver ? 'Drop to install' : 'Drop a .md file or click to browse'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md"
            className={styles['agent-settings-modal__file-input']}
            tabIndex={-1}
            aria-hidden
            onChange={handleFileChange}
          />
        </div>
        <p className={styles['agent-settings-modal__help']}>
          The file must include a YAML frontmatter block with <code>name</code> and <code>description</code> fields.
        </p>
      </div>

      {/* Preset catalog */}
      {available.length > 0 && (
        <div className={styles['agent-settings-modal__access-block']}>
          <h3 className={styles['agent-settings-modal__section-title']}>
            Add a preset skill
          </h3>
          <div className={styles['agent-settings-modal__skill-grid']}>
            {available.map((skill) => {
              const IconGlyph = SKILL_ICONS[skill.id] ?? FileTextOutlineIcon;
              return (
                <div
                  key={skill.id}
                  className={styles['agent-settings-modal__skill-card']}
                >
                  <span className={styles['agent-settings-modal__skill-card-icon']}>
                    <Icon glyph={<IconGlyph />} size="16" />
                  </span>
                  <div className={styles['agent-settings-modal__skill-card-body']}>
                    <p className={styles['agent-settings-modal__skill-card-name']}>
                      {skill.name}
                    </p>
                    <p className={styles['agent-settings-modal__skill-card-desc']}>
                      {skill.description}
                    </p>
                  </div>
                  <div className={styles['agent-settings-modal__skill-card-action']}>
                    <IconButton
                      size="small"
                      icon={<Icon glyph={<PlusIcon />} size="16" />}
                      aria-label={`Add ${skill.name}`}
                      onClick={() => addSkill(skill)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
