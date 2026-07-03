import { useCallback, useRef, useState, type ReactNode } from 'react';

const AGENT_TYPING_MS = 720;
const PAUSE_AFTER_USER_MS = 280;
const PAUSE_AFTER_AGENT_MS = 320;

let bubbleCounter = 0;

function nextBubbleId() {
  bubbleCounter += 1;
  return `chat-bubble-${bubbleCounter}`;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export interface ScriptedChatBubble {
  id: string;
  from: 'agent' | 'user';
  text: ReactNode;
}

export type ScriptedChatBubbleInput = Omit<ScriptedChatBubble, 'id'>;

export function useScriptedChatQueue() {
  const [displayed, setDisplayed] = useState<ScriptedChatBubble[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const queueRef = useRef<ScriptedChatBubble[]>([]);
  const drainingRef = useRef(false);

  const drain = useCallback(async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;

    while (queueRef.current.length > 0) {
      const next = queueRef.current.shift();
      if (!next) break;

      if (next.from === 'agent') {
        setIsTyping(true);
        await sleep(AGENT_TYPING_MS);
        setIsTyping(false);
      }

      setDisplayed((prev) => [...prev, next]);
      await sleep(
        next.from === 'user' ? PAUSE_AFTER_USER_MS : PAUSE_AFTER_AGENT_MS,
      );
    }

    drainingRef.current = false;
  }, []);

  const enqueue = useCallback(
    (...bubbles: ScriptedChatBubbleInput[]) => {
      if (bubbles.length === 0) return;
      queueRef.current.push(
        ...bubbles.map((bubble) => ({ ...bubble, id: nextBubbleId() })),
      );
      void drain();
    },
    [drain],
  );

  return { displayed, isTyping, enqueue };
}
