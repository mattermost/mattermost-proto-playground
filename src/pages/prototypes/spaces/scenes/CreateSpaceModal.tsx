import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@mattermost/compass-ui/components/button';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Modal, ModalOverlay } from '@mattermost/compass-ui/components/modal';
import { Radio } from '@mattermost/compass-ui/components/radio';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { TextArea } from '@mattermost/compass-ui/components/text-area';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import { LINKABLE_WORK, SPACE } from '../spacesData';
import styles from './CreateSpaceModal.module.scss';

const TYPES = [
  {
    key: 'operation',
    label: 'Operation',
    detail:
      'Has an end. Open, Active, Closing, Closed. Holds runs, channels, a board and pages.',
  },
  {
    key: 'project',
    label: 'Project',
    detail: 'Has an end and milestones. Planned, In progress, Done.',
  },
  {
    key: 'area',
    label: 'Team area',
    detail: 'Ongoing. No end date; work moves in and out.',
  },
];

const TEMPLATES = [
  {
    key: 'campaign',
    label: 'Threat campaign',
    by: 'Warren Daniel',
    adds: [
      '3 channels',
      'Campaign board',
      '4 pages',
      '5 workstreams',
      'Escalate stuck hardening after 2 reminders',
    ],
  },
  {
    key: 'blank',
    label: 'Blank operation',
    by: 'Mattermost',
    adds: ['1 channel'],
  },
];

export interface CreateSpaceModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
}

/** Beats 1 and 2: open a Space from a type and template, then pull in existing work by link. */
export function CreateSpaceModal({
  open,
  onClose,
  onCreate,
}: CreateSpaceModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState('operation');
  const [template, setTemplate] = useState('campaign');
  const [name, setName] = useState(SPACE.name);
  const [outcome, setOutcome] = useState(SPACE.outcome);
  const [linked, setLinked] = useState<string[]>(
    LINKABLE_WORK.map((w) => w.id),
  );

  const toggle = (id: string) =>
    setLinked((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );

  return createPortal(
    <ModalOverlay open={open} onClose={onClose}>
      <Modal
        size="large"
        title={step === 1 ? 'Open a Space' : 'Pull in existing work'}
        subtitle={step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
        onClose={onClose}
        showBackButton={step === 2}
        onBack={() => setStep(1)}
        scrollable
        footer={
          <>
            <Button
              emphasis="tertiary"
              onClick={step === 1 ? onClose : () => setStep(1)}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            {step === 1 ? (
              <Button emphasis="primary" onClick={() => setStep(2)}>
                Next
              </Button>
            ) : (
              <Button emphasis="primary" onClick={onCreate}>
                Open Space
              </Button>
            )}
          </>
        }
      >
        {step === 1 ? (
          <div className={styles['create-space']}>
            <fieldset className={styles['create-space__group']}>
              <legend className={styles['create-space__legend']}>Type</legend>
              {TYPES.map((t) => (
                <Radio
                  key={t.key}
                  className={styles['create-space__option']}
                  name="type"
                  checked={type === t.key}
                  onChange={() => setType(t.key)}
                >
                  <span className={styles['create-space__option-text']}>
                    <span className={styles['create-space__option-title']}>
                      {t.label}
                    </span>
                    <span className={styles['create-space__option-detail']}>
                      {t.detail}
                    </span>
                  </span>
                </Radio>
              ))}
            </fieldset>
            <fieldset className={styles['create-space__group']}>
              <legend className={styles['create-space__legend']}>
                Template
              </legend>
              {TEMPLATES.map((t) => (
                <Radio
                  key={t.key}
                  className={styles['create-space__option']}
                  name="template"
                  checked={template === t.key}
                  onChange={() => setTemplate(t.key)}
                >
                  <span className={styles['create-space__option-text']}>
                    <span className={styles['create-space__option-title']}>
                      {t.label}{' '}
                      <span className={styles['create-space__option-detail']}>
                        by {t.by}
                      </span>
                    </span>
                    <span className={styles['create-space__adds']}>
                      {t.adds.map((a) => (
                        <Tag key={a} label={a} size="x-small" />
                      ))}
                    </span>
                  </span>
                </Radio>
              ))}
            </fieldset>
            <TextInput
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextArea
              label="Outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            />
          </div>
        ) : (
          <div className={styles['create-space']}>
            <p className={styles['create-space__intro']}>
              Linked, not copied: each item stays where it is and also shows up
              in the Space. We found these from the IOCs Koen tagged.
            </p>
            <ul className={styles['create-space__links']}>
              {LINKABLE_WORK.map((w) => (
                <li key={w.id}>
                  <Checkbox
                    className={styles['create-space__option']}
                    checked={linked.includes(w.id)}
                    onChange={() => toggle(w.id)}
                  >
                    <span className={styles['create-space__option-text']}>
                      <span className={styles['create-space__option-title']}>
                        {w.label}{' '}
                        <Icon
                          glyph={<LinkVariantIcon />}
                          size="12"
                          className={styles['create-space__link-icon']}
                        />
                      </span>
                      <span className={styles['create-space__option-detail']}>
                        {w.detail}
                      </span>
                    </span>
                  </Checkbox>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </ModalOverlay>,
    document.body,
  );
}
