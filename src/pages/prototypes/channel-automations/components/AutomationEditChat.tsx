import { Button, Icon, MessageInput } from '@mattermost/compass-ui';
import { useEffect, useRef, useState } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import {
  agentById,
  triggerSummary,
  triggerToType,
  buildTriggerConfig,
  type AutomationType,
} from '../channelAutomationsData';
import type { EditorKind, FormPatch, FormValues } from './automationFormTypes';
import {
  advanceAfterAgentStep,
  advanceAfterStep,
  getStepSelection,
  promptForStep,
  scopeSummaryFromValues,
  type ChatScriptOption,
  type CreateScriptStep,
} from './automationChatScript';
import { AgentMessage, ChatText, UserMessage } from './AgentChatMessage';
import AutomationSummaryCard from './AutomationSummaryCard';
import ChatSelectionOptions from './ChatSelectionOptions';
import ChatTypingIndicator from './ChatTypingIndicator';
import { parseEditIntent } from './parseEditIntent';
import { resolveChatAgent } from './resolveChatAgent';
import { useScriptedChatQueue } from './useScriptedChatQueue';
import styles from './AutomationEditChat.module.scss';

export interface AutomationEditChatProps {
  values: FormValues;
  patch: FormPatch;
  onReviewInForm: () => void;
  onSave: () => void;
  canSave?: boolean;
  saveLabel?: string;
  isEdit?: boolean;
  automationType?: AutomationType;
  contextAgentId?: string;
  editorKind?: EditorKind;
  requireAgentId?: boolean;
}

function valuesToTrigger(values: FormValues) {
  return buildTriggerConfig({
    kind: values.kind,
    frequency: values.frequency,
    time: values.time,
    event: values.event,
    keyword: values.keyword,
    playbookEvent: values.playbookEvent,
    playbookId: values.playbookId,
  });
}

function skipTargetStep(
  step: CreateScriptStep,
  values: FormValues,
): CreateScriptStep {
  switch (step) {
    case 'idea':
      return 'trigger';
    case 'agent':
      return 'trigger';
    case 'schedule-frequency':
      return 'schedule-time';
    case 'schedule-time':
      return 'channel';
    case 'channel':
      return values.event === 'message' ? 'keyword' : 'done';
    case 'playbook':
      return 'done';
    default:
      return 'done';
  }
}

export default function AutomationEditChat({
  values,
  patch,
  onReviewInForm,
  onSave,
  canSave = true,
  saveLabel = 'Add automation',
  isEdit = false,
  automationType,
  contextAgentId,
  editorKind = 'assignment',
  requireAgentId = false,
}: AutomationEditChatProps) {
  const chatAgent = resolveChatAgent(values, { editorKind, contextAgentId });
  const summaryType =
    automationType ?? triggerToType(valuesToTrigger(values));

  const hasDraft =
    !isEdit &&
    values.name.trim().length > 0 &&
    values.instructions.trim().length > 0;

  const scopeSummary = scopeSummaryFromValues(values);
  const runsAsAgent = values.agentId ? agentById(values.agentId) : undefined;

  const draftCard = {
    name: values.name || 'Untitled automation',
    type: summaryType,
    when: triggerSummary(valuesToTrigger(values)),
    where: scopeSummary,
    posts: values.instructions,
    runsAs: runsAsAgent?.displayName ?? null,
  };

  const [createStep, setCreateStep] = useState<CreateScriptStep>('idea');
  const [composer, setComposer] = useState('');
  const { displayed: log, isTyping, enqueue } = useScriptedChatQueue();
  const logRef = useRef<HTMLDivElement>(null);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    if (isEdit) {
      enqueue({
        from: 'agent',
        text: (
          <>
            Here’s how this automation is set up. What would you like to change?
          </>
        ),
      });
      return;
    }

    enqueue({
      from: 'agent',
      text: (
        <>
          What kind of automation would you like to create? There are a lot of
          possibilities. Below are some suggestions to get you started, but feel
          free to write your own.
        </>
      ),
    });
  }, [enqueue, isEdit]);

  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [log, isTyping, createStep]);

  const recordSelection = (option: ChatScriptOption) => {
    if (Object.keys(option.patch).length > 0) {
      patch(option.patch);
    }
    enqueue({ from: 'user', text: option.label });
  };

  const confirmDraft = (message?: string) => {
    enqueue({
      from: 'agent',
      text: (
        <>
          <span className={styles['chat__check']}>
            <Icon size="16" glyph={<CheckIcon />} />
          </span>
          {message ?? 'Got it — review settings below or tell me what to tweak.'}
        </>
      ),
    });
  };

  const goToStep = (step: CreateScriptStep) => {
    setCreateStep(step);
    const prompt = promptForStep(step);
    if (prompt) {
      enqueue({ from: 'agent', text: prompt });
    }
  };

  const finishCreateFlow = () => {
    setCreateStep('done');
    confirmDraft();
  };

  const needsAgentSelection =
    requireAgentId && !contextAgentId && !values.agentId;

  const handleStepAccept = (step: CreateScriptStep, option: ChatScriptOption) => {
    if (option.id === 'something-else') {
      if (step === 'idea') {
        if (needsAgentSelection) {
          goToStep('agent');
        } else {
          goToStep('trigger');
        }
        return;
      }
      setCreateStep('done');
      return;
    }

    const merged: FormValues = { ...values, ...option.patch };
    recordSelection(option);
    let next = advanceAfterStep(step, merged, option);

    if (step === 'idea' && requireAgentId && !contextAgentId && !merged.agentId) {
      next = 'agent';
    } else if (step === 'agent') {
      next = advanceAfterAgentStep(merged);
    }

    if (next === 'done') {
      finishCreateFlow();
      return;
    }

    goToStep(next);
  };

  const handleStepSkip = (step: CreateScriptStep) => {
    const next = skipTargetStep(step, values);
    if (next === 'done') {
      setCreateStep('done');
      return;
    }
    goToStep(next);
  };

  const handleSend = () => {
    const text = composer.trim();
    if (!text) return;
    setComposer('');

    if (isEdit) {
      const intent = parseEditIntent(text);
      enqueue({ from: 'user', text });
      if (intent) {
        patch(intent);
        enqueue({
          from: 'agent',
          text: (
            <>
              <span className={styles['chat__check']}>
                <Icon size="16" glyph={<CheckIcon />} />
              </span>
              Updated — check the summary below or open Settings for details.
            </>
          ),
        });
      } else {
        enqueue({
          from: 'agent',
          text: 'Try asking to rename it, change the time, update the channel, or revise the instructions.',
        });
      }
      return;
    }

    enqueue({ from: 'user', text });
    patch({ instructions: text });
    enqueue({
      from: 'agent',
      text: 'Updated the instructions. Review settings or save when you’re ready.',
    });
  };

  const stepSelection = getStepSelection(createStep);

  const showSave =
    !isEdit &&
    createStep === 'done' &&
    hasDraft &&
    (!requireAgentId || Boolean(values.agentId));

  const lastIndex = log.length - 1;
  const showInteractiveChrome = !isTyping;

  return (
    <div className={styles['chat']}>
      <div ref={logRef} className={styles['chat__log']}>
        <div className={styles['chat__log-inner']}>
          {log.map((b, i) => {
            const isLast = i === lastIndex;
            if (b.from === 'agent') {
              return (
                <div key={b.id} className={styles['chat__bubble']}>
                  <AgentMessage agent={chatAgent}>
                    <ChatText>{b.text}</ChatText>
                    {isLast && !isEdit && showInteractiveChrome && stepSelection ? (
                      <ChatSelectionOptions
                        title={stepSelection.title}
                        options={stepSelection.options}
                        onAccept={(option) => handleStepAccept(createStep, option)}
                        onSkip={() => handleStepSkip(createStep)}
                        ariaLabel={stepSelection.ariaLabel}
                        className={styles['chat__selection']}
                        variant={stepSelection.variant}
                        selectLabel={stepSelection.selectLabel}
                      />
                    ) : null}
                    {showInteractiveChrome &&
                    (isEdit || (isLast && hasDraft)) &&
                    (isEdit || createStep === 'done') ? (
                      <div className={styles['chat__addon']}>
                        <AutomationSummaryCard
                          name={draftCard.name}
                          type={draftCard.type}
                          when={draftCard.when}
                          where={draftCard.where}
                          posts={draftCard.posts}
                          runsAs={draftCard.runsAs}
                        />
                      </div>
                    ) : null}
                    {isLast && showSave && showInteractiveChrome ? (
                      <div
                        className={[
                          styles['chat__addon'],
                          styles['chat__actions'],
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <Button
                          emphasis="Primary"
                          size="Small"
                          disabled={!canSave}
                          onClick={onSave}
                        >
                          {saveLabel}
                        </Button>
                        <Button
                          emphasis="Tertiary"
                          size="Small"
                          onClick={onReviewInForm}
                        >
                          Review settings
                        </Button>
                      </div>
                    ) : null}
                  </AgentMessage>
                </div>
              );
            }
            return (
              <div key={b.id} className={styles['chat__bubble']}>
                <UserMessage>
                  <ChatText>{b.text}</ChatText>
                </UserMessage>
              </div>
            );
          })}

          {isTyping ? (
            <div
              className={[
                styles['chat__bubble'],
                styles['chat__bubble--typing'],
              ].join(' ')}
            >
              <AgentMessage agent={chatAgent}>
                <ChatTypingIndicator />
              </AgentMessage>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles['chat__composer']}>
        <MessageInput
          className={styles['chat__message-input']}
          placeholder={`Reply to ${chatAgent.displayName}…`}
          width="narrow"
          showFormatting={false}
          showEmoji={false}
          value={composer}
          onChange={setComposer}
          onSubmit={handleSend}
        />
      </div>
    </div>
  );
}
