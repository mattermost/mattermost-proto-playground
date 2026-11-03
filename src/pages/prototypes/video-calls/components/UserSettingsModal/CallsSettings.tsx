import { useId } from 'react';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Radio } from '@mattermost/compass-ui/components/radio';
import { Select } from '@mattermost/compass-ui/components/select';
import {
  CALLS_SECTIONS,
  EXPANDED_TITLES,
  type CallsSectionId,
  type CallsSettingsValues,
  type DeviceOption,
} from './userSettingsData';
import styles from './CallsSettings.module.scss';

type Props = {
  values: CallsSettingsValues;
  microphones: DeviceOption[];
  speakers: DeviceOption[];
  cameras: DeviceOption[];
  onChange: (patch: Partial<CallsSettingsValues>) => void;
  expanded: ReadonlySet<CallsSectionId>;
  onEdit: (id: CallsSectionId) => void;
  onSave: (id: CallsSectionId) => void;
  onCancel: (id: CallsSectionId) => void;
};

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles['calls-settings__field']}>
      <label
        className={styles['calls-settings__field-label']}
        htmlFor={htmlFor}
      >
        {label}
      </label>
      <div className={styles['calls-settings__field-control']}>{children}</div>
    </div>
  );
}

export default function CallsSettings({
  values,
  microphones,
  speakers,
  cameras,
  onChange,
  expanded,
  onEdit,
  onSave,
  onCancel,
}: Props) {
  const uid = useId();

  const actions = (id: CallsSectionId) => (
    <div className={styles['calls-settings__actions']}>
      <Button emphasis="primary" onClick={() => onSave(id)}>
        Save
      </Button>
      <Button emphasis="tertiary" onClick={() => onCancel(id)}>
        Cancel
      </Button>
    </div>
  );

  const body = (id: CallsSectionId, description: string) => {
    switch (id) {
      case 'audio':
        return (
          <>
            <Field label="Microphone input" htmlFor={`${uid}-mic`}>
              <Select
                id={`${uid}-mic`}
                options={microphones}
                value={values.microphone}
                onChange={(microphone) => onChange({ microphone })}
              />
            </Field>
            <Field label="Speaker output" htmlFor={`${uid}-speaker`}>
              <Select
                id={`${uid}-speaker`}
                options={speakers}
                value={values.speaker}
                onChange={(speaker) => onChange({ speaker })}
              />
            </Field>
            <p className={styles['calls-settings__hint']}>{description}</p>
          </>
        );
      case 'screen':
        return (
          <>
            <div
              className={styles['calls-settings__choices']}
              role="radiogroup"
              aria-label="Share sound with screen"
            >
              <Radio
                name={`${uid}-share-sound`}
                checked={values.shareSound === 'on'}
                onChange={() => onChange({ shareSound: 'on' })}
              >
                On
              </Radio>
              <Radio
                name={`${uid}-share-sound`}
                checked={values.shareSound === 'off'}
                onChange={() => onChange({ shareSound: 'off' })}
              >
                Off
              </Radio>
            </div>
            <p className={styles['calls-settings__hint']}>
              When enabled, audio from your browser tab or system (depending on
              what&apos;s shared) will be included with the screen content.
            </p>
          </>
        );
      case 'video':
        return (
          <>
            <Field label="Camera input" htmlFor={`${uid}-camera`}>
              <Select
                id={`${uid}-camera`}
                options={cameras}
                value={values.camera}
                onChange={(camera) => onChange({ camera })}
              />
            </Field>
            <div
              className={styles['calls-settings__preview']}
              data-mirrored={values.mirrorVideo || undefined}
              data-blurred={values.blurBackground || undefined}
              role="img"
              aria-label="Camera preview"
            >
              <Icon glyph={<VideoOutlineIcon />} size="52" />
              <span>Camera preview</span>
            </div>
            <div className={styles['calls-settings__choices']}>
              <Checkbox
                checked={values.mirrorVideo}
                onChange={(e) => onChange({ mirrorVideo: e.target.checked })}
              >
                Mirror video
              </Checkbox>
              <Checkbox
                checked={values.blurBackground}
                onChange={(e) => onChange({ blurBackground: e.target.checked })}
              >
                Blur background
              </Checkbox>
            </div>
            <p className={styles['calls-settings__hint']}>{description}</p>
          </>
        );
    }
  };

  return (
    <section
      className={styles['calls-settings']}
      aria-labelledby={`${uid}-title`}
    >
      <h2 className={styles['calls-settings__title']} id={`${uid}-title`}>
        Calls Settings
      </h2>
      <div className={styles['calls-settings__list']}>
        {CALLS_SECTIONS.map(({ id, title, description }) => {
          const isOpen = expanded.has(id);
          return (
            // Row click is a pointer shortcut; the Edit button is the keyboard path.
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
              key={id}
              className={`${styles['calls-settings__section']} ${isOpen ? styles['calls-settings__section--expanded'] : ''}`}
              onClick={isOpen ? undefined : () => onEdit(id)}
            >
              {isOpen ? (
                <>
                  <h3 className={styles['calls-settings__section-title']}>
                    {EXPANDED_TITLES[id]}
                  </h3>
                  <div className={styles['calls-settings__section-body']}>
                    {body(id, description)}
                    {actions(id)}
                  </div>
                </>
              ) : (
                <>
                  <h3 className={styles['calls-settings__section-title']}>
                    {title}
                  </h3>
                  <Button
                    emphasis="quaternary"
                    size="small"
                    className={styles['calls-settings__edit']}
                    leadingIcon={
                      <Icon glyph={<PencilOutlineIcon />} size="16" />
                    }
                    aria-label={`Edit ${title}`}
                  >
                    Edit
                  </Button>
                  <p className={styles['calls-settings__description']}>
                    {description}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
