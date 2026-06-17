import { useState } from 'react';
import Button from '@/components/ui/Button/Button';
import Select from '@/components/ui/Select/Select';
import Switch from '@/components/ui/Switch/Switch';
import TextArea from '@/components/ui/TextArea/TextArea';
import TextInput from '@/components/ui/TextInput/TextInput';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import {
  ACTIVE_CHANNEL,
  AUTOMATION_CHANNEL_OPTIONS,
  EVENT_TYPE_LABELS,
  SCHEDULE_FREQUENCY_LABELS,
  SCHEDULE_TIMES,
  applyTriggerPickerOption,
  triggerConfigToPickerOption,
  triggerPickerNeedsChannel,
  type Automation,
  type AutomationDraft,
  type EventType,
  type ScheduleFrequency,
  type TriggerConfig,
  type TriggerKind,
  type TriggerPickerOption,
} from '../channelAutomationsData';
import type { FormPatch, FormValues } from './automationFormTypes';
import AutomationEditChat from './AutomationEditChat';
import AutomationsTabs from './AutomationsTabs';
import TriggerPicker from './TriggerPicker';
import styles from './AutomationFormEditor.module.scss';

export type { FormPatch, FormValues } from './automationFormTypes';

type EditorView = 'form' | 'chat';

export type { EditorView };

export const EDITOR_VIEW_TABS = [
  { id: 'chat' as const, label: 'Chat' },
  { id: 'form' as const, label: 'Settings' },
];

const VIEW_TABS = EDITOR_VIEW_TABS;

export interface AutomationFormEditorProps {
  /** When provided, the editor opens in edit mode pre-filled from this automation. */
  initial?: Automation;
  onSubmit: (draft: AutomationDraft) => void;
  onCancel: () => void;
  /** When false, hides Chat/Settings tabs and keeps the chat editor. Default: true. */
  showViewTabs?: boolean;
  /** When false, hides Cancel/Save on the Settings tab. Default: true. */
  showFooter?: boolean;
  /** When false, hides the Enabled switch. Default: true. */
  showEnabledSwitch?: boolean;
  /** Controlled Chat/Settings view — used when tabs render in the modal header. */
  view?: EditorView;
  onViewChange?: (view: EditorView) => void;
}

const SCHEDULE_FREQUENCIES = Object.keys(
  SCHEDULE_FREQUENCY_LABELS,
) as ScheduleFrequency[];

/**
 * Create / edit editor for an agent automation, rendered as a drill-in subview
 * inside the Edit Agent Automations tab.
 */
export default function AutomationFormEditor({
  initial,
  onSubmit,
  onCancel,
  showViewTabs = true,
  showFooter = true,
  showEnabledSwitch = true,
  view: controlledView,
  onViewChange,
}: AutomationFormEditorProps) {
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
  const [channelId, setChannelId] = useState(
    initial?.scope.channelIds?.[0] ?? ACTIVE_CHANNEL.id,
  );
  const [instructions, setInstructions] = useState(initial?.instructions ?? '');
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);

  const [internalView, setInternalView] = useState<EditorView>(() =>
    !showViewTabs && initial != null ? 'form' : 'chat',
  );
  const view = controlledView ?? internalView;
  const setView = onViewChange ?? setInternalView;

  const values: FormValues = {
    name,
    kind,
    frequency,
    time,
    event,
    keyword,
    channelId,
    instructions,
    enabled,
  };

  const patch: FormPatch = (changes) => {
    if (changes.name !== undefined) setName(changes.name);
    if (changes.frequency !== undefined) setFrequency(changes.frequency);
    if (changes.time !== undefined) setTime(changes.time);
    if (changes.keyword !== undefined) setKeyword(changes.keyword);
    if (changes.channelId !== undefined) setChannelId(changes.channelId);
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
    onSubmit({
      name,
      triggerConfig,
      instructions,
      enabled,
      ...(triggerPickerNeedsChannel(triggerPicker)
        ? { triggerChannelId: channelId }
        : {}),
    });
  };

  const enabledSwitch = showEnabledSwitch ? (
    <Switch
      className={styles['editor__enabled']}
      checked={enabled}
      onChange={(e) => setEnabled(e.target.checked)}
      semiBold
    >
      Enabled
    </Switch>
  ) : null;

  const toolbar = showViewTabs ? (
    <AutomationsTabs
      className={styles['editor__tabs']}
      tabs={VIEW_TABS.map((tab) => ({ key: tab.id, label: tab.label }))}
      activeKey={view}
      onChange={(id) => setView(id as EditorView)}
      ariaLabel="Automation editor view"
      controls={enabledSwitch}
      rhsInset
    />
  ) : null;

  const body = (
    <div className={styles['editor__body']}>
      {view === 'chat' ? (
        <AutomationEditChat
          values={values}
          patch={patch}
          onReviewInForm={() => setView('form')}
          onSave={handleSubmit}
          canSave={isValid}
          saveLabel={isEdit ? 'Save changes' : 'Add automation'}
          isEdit={isEdit}
          automationType={initial?.type}
        />
      ) : (
        <div className={styles['editor__scroll']}>
          <Scrollbars>
            <div className={styles['editor__form']}>
              <TextInput
                className={styles['editor__form-control']}
                label="Automation name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <TriggerPicker
                className={styles['editor__form-control']}
                value={triggerPicker}
                fallbackLabel={triggerFallbackLabel}
                onChange={handleTriggerPickerChange}
              />

              {triggerPicker === 'schedule' ? (
                <div className={styles['editor__form-row']}>
                  <Select
                    className={styles['editor__form-control']}
                    label="Frequency"
                    value={frequency}
                    onChange={(e) =>
                      setFrequency(e.target.value as ScheduleFrequency)
                    }
                  >
                    {SCHEDULE_FREQUENCIES.map((f) => (
                      <option key={f} value={f}>
                        {SCHEDULE_FREQUENCY_LABELS[f]}
                      </option>
                    ))}
                  </Select>
                  <Select
                    className={styles['editor__form-control']}
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

              {triggerPickerNeedsChannel(triggerPicker) ? (
                <Select
                  className={styles['editor__form-control']}
                  label="Channel"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                >
                  {AUTOMATION_CHANNEL_OPTIONS.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.label}
                    </option>
                  ))}
                </Select>
              ) : null}

              <TextArea
                className={styles['editor__form-control']}
                label="Instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={5}
                maxLength={500}
              />
            </div>
          </Scrollbars>
        </div>
      )}
    </div>
  );

  const footerVisible = view === 'form';

  const footer = showFooter && footerVisible ? (
    <div className={styles['editor__footer']}>
      <Button emphasis="Tertiary" onClick={onCancel}>
        Cancel
      </Button>
      <Button emphasis="Primary" disabled={!isValid} onClick={handleSubmit}>
        {isEdit ? 'Save changes' : 'Add automation'}
      </Button>
    </div>
  ) : null;

  return (
    <div className={styles['editor']}>
      {toolbar}
      {body}
      {footer}
    </div>
  );
}
