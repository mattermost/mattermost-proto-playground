import { useId } from 'react';
import { Radio } from '@mattermost/compass-ui';
import type { ClassificationSource } from '../classificationMarkingsData';
import styles from './SourceChoiceCards.module.scss';

export type SourceChoiceCardsProps = {
  value: ClassificationSource;
  onChange: (value: ClassificationSource) => void;
};

const OPTIONS: {
  id: ClassificationSource;
  title: string;
  description: string;
}[] = [
  {
    id: 'preset',
    title: 'Use a preset',
    description:
      'Start from a built-in scheme. Creates a new Classification attribute from the levels you define.',
  },
  {
    id: 'existing',
    title: 'Use an existing attribute',
    description:
      'Base markings on a ranked attribute that already exists in your system.',
  },
];

export default function SourceChoiceCards({
  value,
  onChange,
}: SourceChoiceCardsProps) {
  const name = useId();

  return (
    <div
      className={styles['source-cards']}
      role="radiogroup"
      aria-label="Classification source"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.id;
        return (
          <Radio
            key={option.id}
            name={name}
            value={option.id}
            checked={selected}
            size="Medium"
            className={[
              styles['source-cards__card'],
              selected ? styles['source-cards__card--selected'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onChange={() => onChange(option.id)}
          >
            <span className={styles['source-cards__copy']}>
              <span className={styles['source-cards__title']}>
                {option.title}
              </span>
              <span className={styles['source-cards__description']}>
                {option.description}
              </span>
            </span>
          </Radio>
        );
      })}
    </div>
  );
}
