import { Fragment, useState } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import {
  AUTOMATION_TYPE_META,
  CREATE_SCRIPT,
  SCRIPTED_RESULT,
  SCRIPTED_RESULT_MESSAGE,
} from '../channelAutomationsData';
import { AgentMessage, ChatText, UserMessage } from './AgentChatMessage';
import { automationGlyph } from './automationIcons';
import styles from './ScriptedAgentConversation.module.scss';

export interface ScriptedAgentConversationProps {
  /** Add the produced automation to the managed list. */
  onCreate: () => void;
  /** Jump to the management surface after creating. */
  onViewAutomations: () => void;
}

export default function ScriptedAgentConversation({
  onCreate,
  onViewAutomations,
}: ScriptedAgentConversationProps) {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [created, setCreated] = useState(false);

  const done = step >= CREATE_SCRIPT.length;
  const meta = AUTOMATION_TYPE_META[SCRIPTED_RESULT.type];

  const pick = (reply: string) => {
    setPicks((prev) => [...prev, reply]);
    setStep((s) => s + 1);
  };

  const reset = () => {
    setStep(0);
    setPicks([]);
    setCreated(false);
  };

  const create = () => {
    onCreate();
    setCreated(true);
  };

  return (
    <div className={styles['convo']}>
      {CREATE_SCRIPT.map((s, i) => {
        if (i > step) return null;
        return (
          <Fragment key={i}>
            <AgentMessage>
              <ChatText>{s.agent}</ChatText>
              {i === step && !done && (
                <div className={styles['convo__options']}>
                  {s.options.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      className={styles['convo__chip']}
                      onClick={() => pick(opt.reply)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </AgentMessage>
            {i < step && picks[i] && (
              <UserMessage>
                <ChatText>{picks[i]}</ChatText>
              </UserMessage>
            )}
          </Fragment>
        );
      })}

      {done && !created && (
        <AgentMessage>
          <ChatText>Here’s the automation I’ll set up:</ChatText>
          <div className={styles['card']}>
            <div className={styles['card__head']}>
              <span className={styles['card__icon']} aria-hidden>
                <Icon size="20" glyph={automationGlyph(meta.iconKey)} />
              </span>
              <div className={styles['card__titles']}>
                <p className={styles['card__name']}>{SCRIPTED_RESULT.name}</p>
                <p className={styles['card__type']}>{meta.label}</p>
              </div>
            </div>
            <dl className={styles['card__rows']}>
              <div className={styles['card__row']}>
                <dt className={styles['card__label']}>When</dt>
                <dd className={styles['card__value']}>
                  {SCRIPTED_RESULT.trigger}
                </dd>
              </div>
              <div className={styles['card__row']}>
                <dt className={styles['card__label']}>Posts</dt>
                <dd className={styles['card__value']}>
                  {SCRIPTED_RESULT_MESSAGE}
                </dd>
              </div>
            </dl>
          </div>
          <div className={styles['convo__actions']}>
            <Button emphasis="Primary" size="Small" onClick={create}>
              Create automation
            </Button>
            <Button emphasis="Tertiary" size="Small" onClick={reset}>
              Start over
            </Button>
          </div>
        </AgentMessage>
      )}

      {created && (
        <AgentMessage>
          <ChatText>
            <span className={styles['convo__check']}>
              <Icon size="16" glyph={<CheckIcon />} />
            </span>
            Done — <strong>{SCRIPTED_RESULT.name}</strong> is now active. It’ll
            first run tomorrow at 9:00 AM.
          </ChatText>
          <div className={styles['convo__actions']}>
            <Button emphasis="Tertiary" size="Small" onClick={onViewAutomations}>
              View in automations
            </Button>
          </div>
        </AgentMessage>
      )}
    </div>
  );
}
