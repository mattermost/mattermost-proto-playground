import { useState } from 'react';
import Button from '@/components/ui/Button/Button';
import { Modal, ModalHeaderTabs } from '@/components/ui/Modal';
import Select from '@/components/ui/Select/Select';
import Switch from '@/components/ui/Switch/Switch';
import TextArea from '@/components/ui/TextArea/TextArea';
import TextInput from '@/components/ui/TextInput/TextInput';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import {
  EVENT_TYPE_LABELS,
  SCHEDULE_FREQUENCY_LABELS,
  SCHEDULE_TIMES,
  applyTriggerPickerOption,
  triggerConfigToPickerOption,
  type Automation,
  type AutomationDraft,
  type EventType,
  type ScheduleFrequency,
  type TriggerConfig,
  type TriggerKind,
  type TriggerPickerOption,
} from '../channelAutomationsData';
import AutomationEditChat from './AutomationEditChat';
import TriggerPicker from './TriggerPicker';
import styles from './AutomationFormModal.module.scss';

/** The draft fields shared between the Form and Chat views. */
export interface FormValues {
  name: string;
  kind: TriggerKind;
  frequency: ScheduleFrequency;
  time: string;
  event: EventType;
  keyword: string;
  instructions: string;
  enabled: boolean;
}

export type FormPatch = (changes: Partial<FormValues>) => void;

type EditorView = 'form' | 'chat';

const VIEW_TABS = [
  { id: 'chat', label: 'Chat' },
  { id: 'form', label: 'Form' },
];

export interface AutomationFormModalProps {
  /** When provided, the form opens in edit mode pre-filled from this automation. */
  initial?: Automation;
  onSubmit: (draft: AutomationDraft) => void;
  onClose: () => void;
}

const SCHEDULE_FREQUENCIES = Object.keys(
  SCHEDULE_FREQUENCY_LABELS,
) as ScheduleFrequency[];

/**
 * Focused create / edit editor for an agent automation (Cursor-style). Captures
 * a name, a schedule- or event-based trigger, the agent instructions, and
 * whether it starts enabled. Rendered as a modal over the Edit Agent view.
 */
export default function AutomationFormModal({
  initial,
  onSubmit,
  onClose,
}: AutomationFormModalProps) {
  const isEdit = initial != null;
  const initialTrigger = initial?.triggerConfig;

  const [name, setName] = useState(initial?.name ?? '');
  const [triggerPicker, setTriggerPicker] = useState<TriggerPickerOption | null>(
    () => triggerConfigToPickerOption(initialTrigger),
  );
  const [kind, setKind] = useState<TriggerKind>(initialTrigger?.kind ?? 'schedule');
  const [frequency, setFrequency] = useState<ScheduleFrequency>(
    initialTrigger?.kind === 'schedule' ? initialTrigger.frequency : 'weekdays',
  );
  const [time, setTime] = useState(
    initialTrigger?.kind === 'schedule' ? initialTrigger.time : SCHEDULE_TIMES[1],
  );
  const [event, setEvent] = useState<EventType>(
    initialTrigger?.kind === 'event' ? initialTrigger.event : 'mention',
  );
  const [keyword, setKeyword] = useState(
    initialTrigger?.kind === 'event' ? (initialTrigger.keyword ?? '') : '',
  );
  const [instructions, setInstructions] = useState(initial?.instructions ?? '');
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);

  const [view, setView] = useState<EditorView>('chat');

  const values: FormValues = {
    name,
    kind,
    frequency,
    time,
    event,
    keyword,
    instructions,
    enabled,
  };

  // Shared patch used by the Chat view so conversational edits land on the same
  // draft the form edits — flip back to Form and the fields reflect the change.
  const patch: FormPatch = (changes) => {
    if (changes.name !== undefined) setName(changes.name);
    if (changes.frequency !== undefined) setFrequency(changes.frequency);
    if (changes.time !== undefined) setTime(changes.time);
    if (changes.keyword !== undefined) setKeyword(changes.keyword);
    if (changes.instructions !== undefined) setInstructions(changes.instructions);
    if (changes.enabled !== undefined) setEnabled(changes.enabled);

    const nextKind = changes.kind ?? kind;
    const nextEvent = changes.event ?? event;
    if (changes.kind !== undefined) setKind(changes.kind);
    if (changes.event !== undefined) setEvent(changes.event);

    if (changes.kind !== undefined || changes.event !== undefined) {
      if (nextKind === 'schedule') {
        setTriggerPicker('schedule');
      } else if (nextEvent === 'message' || nextEvent === 'keyword') {
        setTriggerPicker('message');
      } else if (nextEvent === 'join') {
        setTriggerPicker('join');
      } else if (nextEvent === 'channel-created') {
        setTriggerPicker('channel-created');
      } else {
        setTriggerPicker(null);
      }
    }
  };

  const hasTrigger =
    triggerPicker != null || (kind === 'event' && event === 'mention');
  const isValid =
    name.trim().length > 0 &&
    instructions.trim().length > 0 &&
    hasTrigger;

  const handleTriggerPickerChange = (option: TriggerPickerOption) => {
    const next = applyTriggerPickerOption(option);
    setTriggerPicker(option);
    setKind(next.kind);
    setEvent(next.event);
  };

  const triggerFallbackLabel =
    triggerPicker == null && kind === 'event' && event === 'mention'
      ? EVENT_TYPE_LABELS.mention
      : undefined;

  const handleSubmit = () => {
    if (!isValid) return;
    const triggerConfig: TriggerConfig =
      kind === 'schedule'
        ? { kind: 'schedule', frequency, time }
        : {
            kind: 'event',
            event,
            ...(event === 'keyword' ? { keyword: keyword.trim() } : {}),
          };
    onSubmit({ name, triggerConfig, instructions, enabled });
  };

  return (
    <div className={styles['layer']}>
      <div className={styles['layer__backdrop']} aria-hidden onClick={onClose} />
      <div className={styles['layer__dialog']}>
        <Modal
          size="Medium"
          bodyClassName={view === 'chat' ? styles['chatBody'] : undefined}
          title={isEdit ? 'Edit automation' : 'New automation'}
          headerTabs={
            <ModalHeaderTabs
              tabs={VIEW_TABS.map((tab) => ({ key: tab.id, label: tab.label }))}
              activeKey={view}
              onChange={(id) => setView(id as EditorView)}
              ariaLabel="Edit automation view"
            />
          }
          onClose={onClose}
          headerActions={
            <Switch
              className={styles['headerSwitch']}
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              semiBold
            >
              Enabled
            </Switch>
          }
          footer={
            <>
              <Button emphasis="Tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button emphasis="Primary" disabled={!isValid} onClick={handleSubmit}>
                {isEdit ? 'Save changes' : 'Add automation'}
              </Button>
            </>
          }
        >
          <div className={styles['body']}>
          {view === 'chat' ? (
            <AutomationEditChat
              values={values}
              patch={patch}
              onReviewInForm={() => setView('form')}
              isEdit={isEdit}
            />
          ) : (
            <div className={styles['scroll']}>
              <Scrollbars>
                <div className={styles['form']}>
            <TextInput
              className={styles['form__fieldControl']}
              label="Automation name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <TriggerPicker
              className={styles['form__fieldControl']}
              value={triggerPicker}
              fallbackLabel={triggerFallbackLabel}
              onChange={handleTriggerPickerChange}
            />

            {triggerPicker === 'schedule' ? (
              <div className={styles['form__row']}>
                <Select
                  className={styles['form__fieldControl']}
                  label="Frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)}
                >
                  {SCHEDULE_FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {SCHEDULE_FREQUENCY_LABELS[f]}
                    </option>
                  ))}
                </Select>
                <Select
                  className={styles['form__fieldControl']}
                  label="Time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                >
                  {SCHEDULE_TIMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}

            <TextArea
              className={styles['form__fieldControl']}
              label="Instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
              maxLength={500}
              showCharacterCount
            />
                </div>
              </Scrollbars>
            </div>
          )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
