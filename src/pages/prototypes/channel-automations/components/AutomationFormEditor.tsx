import { Button, Scrollbar, Select, Switch, TextArea } from '@mattermost/compass-ui';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import {
  ACTIVE_CHANNEL,
  AI_SERVICES,
  AUTOMATION_CHANNEL_OPTIONS,
  AUTOMATION_PLAYBOOK_OPTIONS,
  DEFAULT_AI_SERVICE_ID,
  DEFAULT_OWNED_AGENT_ID,
  EVENT_TYPE_LABELS,
  SCHEDULE_FREQUENCY_LABELS,
  SCHEDULE_TIMES,
  SCHEDULE_WEEKDAY_LABELS,
  SCHEDULE_WEEKDAYS,
  agentById,
  applyTriggerPickerOption,
  buildTriggerConfig,
  defaultOwnedAgent,
  playbookEventToPickerOption,
  scheduleNeedsTime,
  scheduleNeedsWeekday,
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
  type ScheduleWeekday,
  type TriggerKind,
  type TriggerPickerOption,
} from '../channelAutomationsData';
import type { EditorKind, FormPatch, FormValues } from './automationFormTypes';
import AccessTab from './AccessTab';
import AdvancedAgentConfig from './AdvancedAgentConfig';
import AgentPickerField from './AgentPickerField';
import AutomationEditChat from './AutomationEditChat';
import AutomationOperateWhere from './AutomationOperateWhere';
import AutomationToolScope from './AutomationToolScope';
import AutomationsTabs from './AutomationsTabs';
import McpsTab from './McpsTab';
import TriggerPicker from './TriggerPicker';
import styles from './AutomationFormEditor.module.scss';

type EditorView = 'chat' | 'form' | 'access' | 'tools';

export type { EditorView };

export const AUTOMATION_EDITOR_VIEW_TABS = [
  { id: 'chat' as const, label: 'Chat' },
  { id: 'form' as const, label: 'Settings' },
];

export const ENTITY_EDITOR_VIEW_TABS = [
  ...AUTOMATION_EDITOR_VIEW_TABS,
  { id: 'access' as const, label: 'Access' },
  { id: 'tools' as const, label: 'Tools' },
];

/** @deprecated Use AUTOMATION_EDITOR_VIEW_TABS or ENTITY_EDITOR_VIEW_TABS */
export const EDITOR_VIEW_TABS = ENTITY_EDITOR_VIEW_TABS;

function editorViewTabs(
  editorKind: EditorKind,
  progressiveDisclosure: boolean,
) {
  if (editorKind === 'entity' && !progressiveDisclosure) {
    return ENTITY_EDITOR_VIEW_TABS;
  }
  return AUTOMATION_EDITOR_VIEW_TABS;
}

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
  showAgentCapabilities?: boolean;
  showAutomationToolScope?: boolean;
  showOperateWhere?: boolean;
  progressiveDisclosure?: boolean;
  /** Controlled automation name (e.g. from an editable title in chrome). */
  name?: string;
  onNameChange?: (name: string) => void;
  view?: EditorView;
  onViewChange?: (view: EditorView) => void;
  onValidityChange?: (valid: boolean) => void;
}

export interface AutomationFormEditorHandle {
  submit: () => void;
  isValid: boolean;
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
  showAgentCapabilities = false,
  showAutomationToolScope = false,
  showOperateWhere = false,
  progressiveDisclosure = false,
  name: nameProp,
  onNameChange,
  view: controlledView,
  onViewChange,
  onValidityChange,
  },
  ref,
) {
  const isEdit = initial != null || initialEntity != null;
  const seed = !isEdit && createType ? seedForAutomationType(createType) : null;
  const source = initial ?? initialEntity;
  const initialTrigger = source?.triggerConfig ?? seed?.triggerConfig;
  const defaultName =
    source?.name ?? seed?.name ?? (isEdit ? '' : 'New automation');

  const [agentId, setAgentId] = useState(
    initial?.agentId ??
      contextAgentId ??
      (showAgentPicker ? '' : DEFAULT_OWNED_AGENT_ID),
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
  const [internalName, setInternalName] = useState(defaultName);
  const name = nameProp ?? internalName;
  const setName = (next: string) => {
    if (nameProp === undefined) setInternalName(next);
    onNameChange?.(next);
  };
  const [triggerPicker, setTriggerPicker] = useState<TriggerPickerOption | null>(
    () => triggerConfigToPickerOption(initialTrigger),
  );
  const [kind, setKind] = useState<TriggerKind>(initialTrigger?.kind ?? 'schedule');
  const [frequency, setFrequency] = useState<ScheduleFrequency>(
    initialTrigger?.kind === 'schedule' ? initialTrigger.frequency : 'daily',
  );
  const [time, setTime] = useState(
    initialTrigger?.kind === 'schedule'
      ? (initialTrigger.time ?? SCHEDULE_TIMES[1])
      : SCHEDULE_TIMES[1],
  );
  const [weekday, setWeekday] = useState<ScheduleWeekday>(
    initialTrigger?.kind === 'schedule'
      ? (initialTrigger.weekday ?? 'monday')
      : 'monday',
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
  const [aiServiceId, setAiServiceId] = useState(DEFAULT_AI_SERVICE_ID);

  const triggerSectionId = useId();
  const tasksSectionId = useId();

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
    weekday,
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
    if (changes.weekday !== undefined) setWeekday(changes.weekday);
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

  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

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
      weekday,
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
        ? { displayName: name, username, avatarSrc }
        : {}),
      ...(teamId ? { triggerTeamId: teamId } : {}),
      ...(triggerPickerNeedsChannel(triggerPicker) ||
      (!showOperateWhere && kind === 'schedule')
        ? { triggerChannelId: channelId || ACTIVE_CHANNEL.id }
        : {}),
    });
  }, [
    isValid,
    kind,
    frequency,
    time,
    weekday,
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
    username,
    avatarSrc,
    teamId,
    triggerPicker,
    channelId,
    showOperateWhere,
  ]);

  useImperativeHandle(ref, () => ({ submit: handleSubmit, isValid }), [handleSubmit, isValid]);

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

  const assignedAgent = agentById(
    agentId || initial?.agentId || initialEntity?.id || DEFAULT_OWNED_AGENT_ID,
  );
  const toolsActiveMcps = initialEntity?.activeMcps ?? assignedAgent?.activeMcps ?? 0;
  const toolsCount = initialEntity?.toolCount ?? assignedAgent?.toolCount ?? 0;

  const viewTabs = editorViewTabs(editorKind, progressiveDisclosure);

  const showChannelField = showOperateWhere
    ? triggerPickerNeedsChannel(triggerPicker)
    : kind === 'schedule' || triggerPickerNeedsChannel(triggerPicker);

  const scheduleFields =
    triggerPicker === 'schedule' ? (
      <>
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
        {scheduleNeedsWeekday(frequency) || scheduleNeedsTime(frequency) ? (
          <div className={styles['editor__form-row']}>
            {scheduleNeedsWeekday(frequency) ? (
              <Select
                className={styles['editor__form-control']}
                label="Day of the week"
                value={weekday}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setWeekday(e.target.value as ScheduleWeekday)
                }
              >
                {SCHEDULE_WEEKDAYS.map((day) => (
                  <option key={day} value={day}>
                    {SCHEDULE_WEEKDAY_LABELS[day]}
                  </option>
                ))}
              </Select>
            ) : null}
            {scheduleNeedsTime(frequency) ? (
              <Select
                className={styles['editor__form-control']}
                label="Time"
                value={time}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setTime(e.target.value)
                }
              >
                {SCHEDULE_TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            ) : null}
          </div>
        ) : null}
      </>
    ) : null;

  const channelField = showChannelField ? (
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
  ) : null;

  const playbookField = triggerPickerNeedsPlaybook(triggerPicker) ? (
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
  ) : null;

  const formSection = (title: string, titleId: string, children: ReactNode) => (
    <section className={styles['editor__section']} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles['editor__section-title']}>
        {title}
      </h3>
      <div className={styles['editor__section-fields']}>{children}</div>
    </section>
  );

  const toolbar = showViewTabs ? (
    <AutomationsTabs
      className={styles['editor__tabs']}
      tabs={viewTabs.map((tab) => ({ key: tab.id, label: tab.label }))}
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
      ) : editorKind === 'entity' &&
        !progressiveDisclosure &&
        view === 'access' ? (
        <div className={styles['editor__scroll']}>
          <Scrollbar>
            <div className={styles['editor__panel-tab']}>
              <AccessTab />
            </div>
          </Scrollbar>
        </div>
      ) : editorKind === 'entity' &&
        !progressiveDisclosure &&
        view === 'tools' ? (
        <div className={styles['editor__scroll']}>
          <Scrollbar>
            <div className={styles['editor__panel-tab']}>
              <McpsTab
                activeMcps={toolsActiveMcps}
                toolCount={toolsCount}
              />
            </div>
          </Scrollbar>
        </div>
      ) : (
        <div className={styles['editor__scroll']}>
          <Scrollbar>
            <div className={styles['editor__form']}>
              {showAgentPicker ? (
                <AgentPickerField
                  className={styles['editor__form-control']}
                  value={agentId}
                  onChange={setAgentId}
                  label="Runs as"
                  showCapabilities={showAgentCapabilities}
                />
              ) : null}

              {showOperateWhere ? (
                formSection(
                  'What starts the automation?',
                  triggerSectionId,
                  <>
                    <TriggerPicker
                      className={styles['editor__form-control']}
                      value={triggerPicker}
                      fallbackLabel={triggerFallbackLabel}
                      emptyLabel="Choose a trigger"
                      onChange={handleTriggerPickerChange}
                    />
                    {scheduleFields}
                    {channelField}
                    {playbookField}
                  </>,
                )
              ) : (
                <>
                  <TriggerPicker
                    className={styles['editor__form-control']}
                    value={triggerPicker}
                    fallbackLabel={triggerFallbackLabel}
                    onChange={handleTriggerPickerChange}
                  />
                  {scheduleFields}
                  {channelField}
                  {playbookField}
                </>
              )}

              {showOperateWhere ? <AutomationOperateWhere /> : null}

              {showOperateWhere ? (
                formSection(
                  'What should the automation do?',
                  tasksSectionId,
                  <TextArea
                    className={styles['editor__form-control']}
                    value={instructions}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      setInstructions(e.target.value)
                    }
                    placeholder="Describe the tasks this automation should perform…"
                    rows={5}
                    maxLength={500}
                    aria-labelledby={tasksSectionId}
                  />,
                )
              ) : (
                <TextArea
                  className={styles['editor__form-control']}
                  label="Automation tasks"
                  value={instructions}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setInstructions(e.target.value)
                  }
                  rows={5}
                  maxLength={500}
                />
              )}

              {editorKind === 'entity' ? (
                <Select
                  className={styles['editor__form-control']}
                  label="AI service"
                  value={aiServiceId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setAiServiceId(e.target.value)
                  }
                >
                  {AI_SERVICES.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.label}
                    </option>
                  ))}
                </Select>
              ) : null}

              {showAutomationToolScope ? (
                <AutomationToolScope
                  agentName={assignedAgent?.displayName}
                  agentToolSummary={
                    assignedAgent
                      ? `${assignedAgent.activeMcps} MCP · ${assignedAgent.toolCount} tools`
                      : null
                  }
                />
              ) : null}

              {progressiveDisclosure ? (
                <AdvancedAgentConfig
                  activeMcps={toolsActiveMcps}
                  toolCount={toolsCount}
                  aiServiceId={aiServiceId}
                />
              ) : null}
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
