import { Button, Scrollbar, Select, Switch, TextArea, TextInput } from '@mattermost/compass-ui';
import { forwardRef, useCallback, useImperativeHandle, useState, type ChangeEvent } from 'react';
import {
  ACTIVE_CHANNEL,
  AUTOMATION_CHANNEL_OPTIONS,
  AUTOMATION_PLAYBOOK_OPTIONS,
  DEFAULT_OWNED_AGENT_ID,
  EVENT_TYPE_LABELS,
  SCHEDULE_FREQUENCY_LABELS,
  SCHEDULE_TIMES,
  applyTriggerPickerOption,
  buildTriggerConfig,
  defaultOwnedAgent,
  playbookEventToPickerOption,
  seedForAutomationType,
  triggerConfigToPickerOption,
  triggerPickerNeedsChannel,
  triggerPickerNeedsPlaybook,
  type Automation,
  type AutomationDraft,
  type AutomationEntity,
  type AutomationType,
  type EventType,
  type PlaybookEventType,
  type ScheduleFrequency,
  type TriggerKind,
  type TriggerPickerOption,
} from '../channelAutomationsData';
import type { EditorKind, FormPatch, FormValues } from './automationFormTypes';
import AgentPickerField from './AgentPickerField';
import AutomationEditChat from './AutomationEditChat';
import AutomationsTabs from './AutomationsTabs';
import TriggerPicker from './TriggerPicker';
import styles from './AutomationFormEditor.module.scss';

type EditorView = 'form' | 'chat';

export type { EditorView };

export const EDITOR_VIEW_TABS = [
  { id: 'chat' as const, label: 'Chat' },
  { id: 'form' as const, label: 'Settings' },
];

export interface AutomationFormEditorProps {
  initial?: Automation;
  initialEntity?: AutomationEntity;
  createType?: AutomationType;
  onSubmit: (draft: AutomationDraft) => void;
  onCancel: () => void;
  showViewTabs?: boolean;
  showFooter?: boolean;
  showEnabledSwitch?: boolean;
  showAgentPicker?: boolean;
  contextAgentId?: string;
  editorKind?: EditorKind;
  view?: EditorView;
  onViewChange?: (view: EditorView) => void;
}

export interface AutomationFormEditorHandle {
  submit: () => void;
}

const SCHEDULE_FREQUENCIES = Object.keys(
  SCHEDULE_FREQUENCY_LABELS,
) as ScheduleFrequency[];

const AutomationFormEditor = forwardRef<
  AutomationFormEditorHandle,
  AutomationFormEditorProps
>(function AutomationFormEditor(
  {
  initial,
  initialEntity,
  createType,
  onSubmit,
  onCancel,
  showViewTabs = true,
  showFooter = true,
  showEnabledSwitch = true,
  showAgentPicker = false,
  contextAgentId,
  editorKind = 'assignment',
  view: controlledView,
  onViewChange,
  },
  ref,
) {
  const isEdit = initial != null || initialEntity != null;
  const seed = !isEdit && createType ? seedForAutomationType(createType) : null;
  const source = initial ?? initialEntity;
  const initialTrigger = source?.triggerConfig ?? seed?.triggerConfig;

  const [agentId, setAgentId] = useState(
    initial?.agentId ?? contextAgentId ?? DEFAULT_OWNED_AGENT_ID,
  );
  const [displayName, setDisplayName] = useState(
    initialEntity?.displayName ?? 'New automation',
  );
  const [username, setUsername] = useState(
    initialEntity?.username ?? 'new-automation',
  );
  const [avatarSrc, setAvatarSrc] = useState(
    initialEntity?.avatarSrc ?? defaultOwnedAgent().avatarSrc,
  );
  const [name, setName] = useState(source?.name ?? seed?.name ?? '');
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
  const [playbookEvent, setPlaybookEvent] = useState<PlaybookEventType>(
    initialTrigger?.kind === 'playbook-event'
      ? initialTrigger.event
      : 'run-started',
  );
  const [playbookId, setPlaybookId] = useState(
    initialTrigger?.kind === 'playbook-event'
      ? (initialTrigger.playbookId ?? '')
      : '',
  );
  const [channelId, setChannelId] = useState(
    source?.scope.channelIds?.[0] ?? ACTIVE_CHANNEL.id,
  );
  const [teamId, setTeamId] = useState(
    source?.scope.teamIds?.[0] ?? '',
  );
  const [instructions, setInstructions] = useState(
    source?.instructions ?? seed?.instructions ?? '',
  );
  const [enabled, setEnabled] = useState(source?.enabled ?? true);

  const [internalView, setInternalView] = useState<EditorView>(() =>
    !showViewTabs && isEdit ? 'form' : 'chat',
  );
  const view = controlledView ?? internalView;
  const setView = onViewChange ?? setInternalView;

  const values: FormValues = {
    agentId,
    name,
    kind,
    frequency,
    time,
    event,
    keyword,
    playbookEvent,
    playbookId,
    channelId,
    teamId,
    instructions,
    enabled,
    displayName,
    username,
    avatarSrc,
  };

  const patch: FormPatch = (changes) => {
    if (changes.agentId !== undefined) setAgentId(changes.agentId);
    if (changes.name !== undefined) setName(changes.name);
    if (changes.displayName !== undefined) setDisplayName(changes.displayName);
    if (changes.username !== undefined) setUsername(changes.username);
    if (changes.avatarSrc !== undefined) setAvatarSrc(changes.avatarSrc);
    if (changes.frequency !== undefined) setFrequency(changes.frequency);
    if (changes.time !== undefined) setTime(changes.time);
    if (changes.keyword !== undefined) setKeyword(changes.keyword);
    if (changes.playbookEvent !== undefined) setPlaybookEvent(changes.playbookEvent);
    if (changes.playbookId !== undefined) setPlaybookId(changes.playbookId);
    if (changes.channelId !== undefined) {
      setChannelId(changes.channelId);
      if (changes.channelId) setTeamId('');
    }
    if (changes.teamId !== undefined) {
      setTeamId(changes.teamId);
      if (changes.teamId) setChannelId('');
    }
    if (changes.instructions !== undefined) setInstructions(changes.instructions);
    if (changes.enabled !== undefined) setEnabled(changes.enabled);

    const nextKind = changes.kind ?? kind;
    const nextEvent = changes.event ?? event;
    const nextPlaybookEvent = changes.playbookEvent ?? playbookEvent;
    if (changes.kind !== undefined) setKind(changes.kind);
    if (changes.event !== undefined) setEvent(changes.event);

    if (
      changes.kind !== undefined ||
      changes.event !== undefined ||
      changes.playbookEvent !== undefined
    ) {
      if (nextKind === 'schedule') {
        setTriggerPicker('schedule');
      } else if (nextKind === 'playbook-event') {
        setTriggerPicker(playbookEventToPickerOption(nextPlaybookEvent));
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
  const agentValid = !showAgentPicker || agentId.length > 0;
  const isValid =
    name.trim().length > 0 &&
    instructions.trim().length > 0 &&
    hasTrigger &&
    agentValid;

  const handleTriggerPickerChange = (option: TriggerPickerOption) => {
    const next = applyTriggerPickerOption(option);
    setTriggerPicker(option);
    setKind(next.kind);
    setEvent(next.event);
    if (next.kind === 'playbook-event') {
      setPlaybookEvent(next.playbookEvent);
    }
  };

  const triggerFallbackLabel =
    triggerPicker == null && kind === 'event' && event === 'mention'
      ? EVENT_TYPE_LABELS.mention
      : undefined;

  const handleSubmit = useCallback(() => {
    if (!isValid) return;
    const triggerConfig = buildTriggerConfig({
      kind,
      frequency,
      time,
      event,
      keyword,
      playbookEvent,
      playbookId,
    });
    onSubmit({
      name,
      triggerConfig,
      instructions,
      enabled,
      agentId: showAgentPicker || editorKind === 'assignment' ? agentId : undefined,
      ...(editorKind === 'entity'
        ? { displayName, username, avatarSrc }
        : {}),
      ...(teamId ? { triggerTeamId: teamId } : {}),
      ...(kind === 'schedule' || triggerPickerNeedsChannel(triggerPicker)
        ? { triggerChannelId: channelId || ACTIVE_CHANNEL.id }
        : {}),
    });
  }, [
    isValid,
    kind,
    frequency,
    time,
    event,
    keyword,
    playbookEvent,
    playbookId,
    onSubmit,
    name,
    instructions,
    enabled,
    showAgentPicker,
    editorKind,
    agentId,
    displayName,
    username,
    avatarSrc,
    teamId,
    triggerPicker,
    channelId,
  ]);

  useImperativeHandle(ref, () => ({ submit: handleSubmit }), [handleSubmit]);

  const enabledSwitch = showEnabledSwitch ? (
    <Switch
      className={styles['editor__enabled']}
      checked={enabled}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setEnabled(e.target.checked)}
      semiBold
    >
      Enabled
    </Switch>
  ) : null;

  const toolbar = showViewTabs ? (
    <AutomationsTabs
      className={styles['editor__tabs']}
      tabs={EDITOR_VIEW_TABS.map((tab) => ({ key: tab.id, label: tab.label }))}
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
          automationType={initial?.type ?? initialEntity?.type ?? createType}
          contextAgentId={contextAgentId}
          editorKind={editorKind}
          requireAgentId={showAgentPicker}
        />
      ) : (
        <div className={styles['editor__scroll']}>
          <Scrollbar>
            <div className={styles['editor__form']}>
              <TextInput
                className={styles['editor__form-control']}
                label="Automation name"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              />

              {showAgentPicker ? (
                <AgentPickerField
                  className={styles['editor__form-control']}
                  value={agentId}
                  onChange={setAgentId}
                />
              ) : null}

              {editorKind === 'entity' ? (
                <>
                  <TextInput
                    className={styles['editor__form-control']}
                    label="Display name"
                    value={displayName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
                  />
                  <TextInput
                    className={styles['editor__form-control']}
                    label="Username"
                    value={username}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  />
                </>
              ) : null}

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
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
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
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setTime(e.target.value)}
                  >
                    {SCHEDULE_TIMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : null}

              {kind === 'schedule' || triggerPickerNeedsChannel(triggerPicker) ? (
                <Select
                  className={styles['editor__form-control']}
                  label="Channel"
                  value={channelId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setChannelId(e.target.value)}
                >
                  {AUTOMATION_CHANNEL_OPTIONS.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.label}
                    </option>
                  ))}
                </Select>
              ) : null}

              {triggerPickerNeedsPlaybook(triggerPicker) ? (
                <Select
                  className={styles['editor__form-control']}
                  label="Playbook"
                  value={playbookId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setPlaybookId(e.target.value)}
                >
                  <option value="">Any playbook</option>
                  {AUTOMATION_PLAYBOOK_OPTIONS.map((playbook) => (
                    <option key={playbook.id} value={playbook.id}>
                      {playbook.label}
                    </option>
                  ))}
                </Select>
              ) : null}

              <TextArea
                className={styles['editor__form-control']}
                label="Instructions"
                value={instructions}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
                rows={5}
                maxLength={500}
              />
            </div>
          </Scrollbar>
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
});

export default AutomationFormEditor;
