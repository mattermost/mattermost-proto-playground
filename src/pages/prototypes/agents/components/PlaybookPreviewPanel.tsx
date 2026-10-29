import { useEffect, useState } from 'react';
import { RightSidebar } from '@mattermost/compass-proto';
import { useAgents, type PlaybookPreview } from '../context/AgentsContext';
import AgentPlaybookPreview, { AgentPlaybookRhsHeader } from './AgentPlaybookPreview';

/** Playbook artifact opened from Matty, for hosts that own the RHS slot. */
export default function PlaybookPreviewPanel() {
  const { playbookPreview, setPlaybookPreview } = useAgents();
  const [lastPreview, setLastPreview] = useState<PlaybookPreview | null>(null);

  // Keep the content while the host plays its exit animation.
  useEffect(() => {
    if (playbookPreview) setLastPreview(playbookPreview);
  }, [playbookPreview]);

  const preview = playbookPreview ?? lastPreview;
  if (!preview) return null;

  const close = () => setPlaybookPreview(null);

  return (
    <RightSidebar
      fill
      header={
        <AgentPlaybookRhsHeader
          secondaryTitle={preview.draft.title}
          onClose={close}
          onSave={() => {
            preview.onSave?.();
            close();
          }}
        />
      }
    >
      <AgentPlaybookPreview key={preview.draft.sourceFileName} draft={preview.draft} />
    </RightSidebar>
  );
}
