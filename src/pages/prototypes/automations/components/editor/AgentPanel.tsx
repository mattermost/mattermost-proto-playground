import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import { Button, Icon, Scrollbar, TextArea } from '@mattermost/compass-ui';
import { useState, type ChangeEvent } from 'react';
import {
  AI_SUGGESTED_PROMPTS,
  buildAiProgressionScript,
  graphSlice,
  type AiScriptTurn,
} from '../../data/aiCreateScript';
import type { WorkflowEdge, WorkflowNode } from '../../data/types';
import styles from './editor.module.scss';

type AgentPanelProps = {
  onClose: () => void;
  onApplyGraph: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
};

export default function AgentPanel({
  onClose,
  onApplyGraph,
}: AgentPanelProps) {
  const [messages, setMessages] = useState<AiScriptTurn[]>([
    {
      role: 'assistant',
      text: 'Describe what you want to happen. I’ll draft a workflow from available triggers and steps.',
    },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const runScript = (prompt: string) => {
    if (busy) return;
    setBusy(true);
    const turns = buildAiProgressionScript(prompt);
    setMessages((prev) => [...prev, { role: 'user', text: prompt }]);
    setDraft('');

    let i = 1;
    const tick = () => {
      if (i >= turns.length) {
        setBusy(false);
        return;
      }
      const turn = turns[i];
      setMessages((prev) => [...prev, turn]);
      if (turn.revealThroughNodeIndex != null) {
        const slice = graphSlice(turn.revealThroughNodeIndex);
        onApplyGraph(slice.nodes, slice.edges);
      }
      i += 1;
      window.setTimeout(tick, 700);
    };
    window.setTimeout(tick, 500);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panel__header}>
        <h2 className={styles.panel__title}>
          <Icon size="16" glyph={<CreationOutlineIcon />} /> Describe a workflow
        </h2>
        <Button emphasis="Tertiary" size="X-Small" onClick={onClose}>
          Close
        </Button>
      </div>
      <Scrollbar className={styles.panel__body}>
        <div className={styles.agent__messages}>
          {messages.map((m, idx) => (
            <div
              key={`${m.role}-${idx}`}
              className={[
                styles.agent__bubble,
                m.role === 'assistant'
                  ? styles['agent__bubble--assistant']
                  : styles['agent__bubble--user'],
              ].join(' ')}
            >
              {m.text}
            </div>
          ))}
        </div>
        {!busy && messages.length < 3 ? (
          <div className={styles.agent__prompts}>
            {AI_SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                className={styles.agent__prompt}
                onClick={() => runScript(p)}
              >
                {p}
              </button>
            ))}
          </div>
        ) : null}
      </Scrollbar>
      <div className={styles.agent__compose}>
        <TextArea
          label="Describe the workflow"
          value={draft}
          disabled={busy}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value)}
          rows={3}
        />
        <Button
          emphasis="Primary"
          size="Small"
          disabled={busy || !draft.trim()}
          onClick={() => runScript(draft.trim())}
        >
          Generate
        </Button>
      </div>
    </div>
  );
}
