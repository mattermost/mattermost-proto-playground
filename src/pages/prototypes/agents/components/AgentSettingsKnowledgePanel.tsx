import {
  type DragEvent,
  type ChangeEvent,
  useId,
  useRef,
  useState,
} from 'react';
import UploadOutlineIcon from '@mattermost/compass-icons/components/upload-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Combobox } from '@mattermost/compass-ui/components/combobox';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { SectionNotice } from '@mattermost/compass-ui/components/section-notice';
import {
  AGENT_KNOWLEDGE_CHANNEL_OPTIONS,
  type KnowledgeOption,
} from '../agentsData';
import styles from './AgentSettingsModal.module.scss';

const KNOWLEDGE_FILE_ACCEPT =
  '.pdf,.md,.txt,.doc,.docx,.csv,.json,.html,.png,.jpg,.jpeg';

type AgentSettingsKnowledgePanelProps = {
  name: string;
  knowledgeChannelIds: string[];
  knowledgeDocIds: string[];
  preview: string | null;
  onChannelsChange: (ids: string[]) => void;
  onDocsChange: (ids: string[]) => void;
};

function knowledgeFileId(file: File) {
  const base = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `upload-${base || 'file'}-${file.size}-${file.lastModified}`;
}

export default function AgentSettingsKnowledgePanel({
  name,
  knowledgeChannelIds,
  knowledgeDocIds,
  preview,
  onChannelsChange,
  onDocsChange,
}: AgentSettingsKnowledgePanelProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<KnowledgeOption[]>([]);

  const addFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) {
      return;
    }

    const nextUploads: KnowledgeOption[] = [];
    const nextIds: string[] = [];

    for (const file of list) {
      const value = knowledgeFileId(file);
      if (
        knowledgeDocIds.includes(value) ||
        uploadedDocs.some((doc) => doc.value === value) ||
        nextIds.includes(value)
      ) {
        continue;
      }
      nextUploads.push({ value, label: file.name });
      nextIds.push(value);
    }

    if (nextIds.length === 0) {
      return;
    }

    setUploadedDocs((prev) => [...prev, ...nextUploads]);
    onDocsChange([...knowledgeDocIds, ...nextIds]);
  };

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }
    setDragActive(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    addFiles(event.dataTransfer.files);
  };

  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(event.target.files);
      event.target.value = '';
    }
  };

  return (
    <div className={styles['agent-settings-modal__access']}>
      <div className={styles['agent-settings-modal__access-block']}>
        <div className={styles['agent-settings-modal__section-header']}>
          <h3 className={styles['agent-settings-modal__section-title']}>
            Knowledge sources
          </h3>
          <p className={styles['agent-settings-modal__help']}>
            Connect channels and docs so {name.trim() || 'this agent'} opens
            already knowing the team&apos;s context.
          </p>
        </div>
        <Combobox
          label="Channels"
          placeholder="Add channels"
          multiple
          options={AGENT_KNOWLEDGE_CHANNEL_OPTIONS}
          value={knowledgeChannelIds}
          onChange={(next) =>
            onChannelsChange(
              Array.isArray(next) ? next : next ? [next] : [],
            )
          }
          zIndex={1400}
        />
        <div
          className={[
            styles['agent-settings-modal__dropzone'],
            dragActive
              ? styles['agent-settings-modal__dropzone--active']
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            id={fileInputId}
            className={styles['agent-settings-modal__file-input']}
            type="file"
            multiple
            accept={KNOWLEDGE_FILE_ACCEPT}
            onChange={onFileInputChange}
          />
          <Icon glyph={<UploadOutlineIcon />} size="24" />
          <div className={styles['agent-settings-modal__dropzone-copy']}>
            <p className={styles['agent-settings-modal__dropzone-title']}>
              Drag and drop files here
            </p>
            <p className={styles['agent-settings-modal__help']}>
              PDF, Markdown, text, Office docs, and images
            </p>
          </div>
          <Button
            type="button"
            size="small"
            emphasis="tertiary"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse files
          </Button>
        </div>
        {preview ? (
          <SectionNotice
            type="info"
            title="Context on day one"
            description={preview}
          />
        ) : null}
      </div>
    </div>
  );
}
