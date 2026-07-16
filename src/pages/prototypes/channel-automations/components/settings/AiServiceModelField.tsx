import { Select } from '@mattermost/compass-ui';
import type { ChangeEvent } from 'react';
import {
  AI_SERVICES,
  modelsForAiService,
} from '../../channelAutomationsData';
import SettingsHelpText from './SettingsHelpText';
import styles from './AiServiceModelField.module.scss';

export interface AiServiceModelFieldProps {
  aiServiceId: string;
  modelId: string;
  onAiServiceChange: (serviceId: string) => void;
  onModelChange: (modelId: string) => void;
  help?: string;
  className?: string;
}

const DEFAULT_HELP =
  'Select an AI service to load model suggestions and configure vision, tools, native provider tools, reasoning, and structured output.';

/** Side-by-side AI service + model selects with help text. */
export default function AiServiceModelField({
  aiServiceId,
  modelId,
  onAiServiceChange,
  onModelChange,
  help = DEFAULT_HELP,
  className = '',
}: AiServiceModelFieldProps) {
  const models = modelsForAiService(aiServiceId);

  return (
    <div
      className={[styles['model-field'], className].filter(Boolean).join(' ')}
    >
      <div className={styles['model-field__row']}>
        <Select
          className={styles['model-field__control']}
          value={aiServiceId}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            onAiServiceChange(e.target.value)
          }
          aria-label="AI Service"
        >
          {AI_SERVICES.map((service) => (
            <option key={service.id} value={service.id}>
              {service.label}
            </option>
          ))}
        </Select>
        <Select
          className={styles['model-field__control']}
          value={modelId}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            onModelChange(e.target.value)
          }
          aria-label="Model"
        >
          {models.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      {help ? <SettingsHelpText>{help}</SettingsHelpText> : null}
    </div>
  );
}
