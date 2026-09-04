import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import { Icon } from '@mattermost/compass-ui/components/icon';
import styles from './AiAssistant.module.scss';

type AiAssistantFabProps = {
  open: boolean;
  onToggle: () => void;
};

export default function AiAssistantFab({ open, onToggle }: AiAssistantFabProps) {
  return (
    <button
      type="button"
      className={[
        styles['assistant-fab'],
        open ? styles['assistant-fab--open'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
      aria-pressed={open}
      onClick={onToggle}
    >
      <Icon size="20" glyph={open ? <CloseIcon /> : <CreationOutlineIcon />} />
    </button>
  );
}
