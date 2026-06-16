import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import { RightSidebarHeader } from '@/components/ui/RightSidebar';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import type { Automation } from '../channelAutomationsData';
import AgentSelector from './AgentSelector';
import AutomationsList from './AutomationsList';

export interface AutomationsPanelProps {
  automations: Automation[];
  /** Return to the agents panel the list was opened from. */
  onBack?: () => void;
  onClose: () => void;
  /** Switch the management presentation to the modal variant. */
  onExpand: () => void;
  onCreate: () => void;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

/** RHS container (recommended default) for the management list. */
export default function AutomationsPanel({
  automations,
  onBack,
  onClose,
  onExpand,
  onCreate,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
}: AutomationsPanelProps) {
  return (
    <aside className={shellStyles['channel-shell__right-sidebar']}>
      <RightSidebarHeader
        title="Automations"
        secondaryContent={<AgentSelector />}
        onBack={onBack}
        onExpand={onExpand}
        onClose={onClose}
      />
      <div className={shellStyles['channel-shell__right-sidebar-body']}>
        <Scrollbars>
          <AutomationsList
            automations={automations}
            onCreate={onCreate}
            onToggle={onToggle}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        </Scrollbars>
      </div>
    </aside>
  );
}
