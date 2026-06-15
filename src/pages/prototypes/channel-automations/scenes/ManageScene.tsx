import AutomationsShell from '../components/AutomationsShell';
import AutomationsPanel from '../components/AutomationsPanel';
import AutomationsModal from '../components/AutomationsModal';
import type { Automation, AutomationType } from '../channelAutomationsData';
import type {
  HeaderEntryPoint,
  ManagePresentation,
} from '../channelAutomationsScenes';

export interface ManageSceneProps {
  automations: Automation[];
  headerEntryPoint: HeaderEntryPoint;
  showAlternates: boolean;
  presentation: ManagePresentation;
  onPresentationChange: (value: ManagePresentation) => void;
  onCreate: (type?: AutomationType) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

/**
 * Manage scene — the management list, rendered either in the RHS panel
 * (default) or the modal variant for comparison.
 */
export default function ManageScene({
  automations,
  headerEntryPoint,
  showAlternates,
  presentation,
  onPresentationChange,
  onCreate,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
  onClose,
}: ManageSceneProps) {
  const isModal = presentation === 'modal';

  return (
    <AutomationsShell
      automations={automations}
      headerEntryPoint={headerEntryPoint}
      showAlternates={showAlternates}
      onCreate={onCreate}
      onOpenManage={() => onPresentationChange(presentation)}
      rhs={
        isModal ? undefined : (
          <AutomationsPanel
            automations={automations}
            onClose={onClose}
            onExpand={() => onPresentationChange('modal')}
            onCreate={() => onCreate()}
            onToggle={onToggle}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        )
      }
      overlay={
        isModal ? (
          <AutomationsModal
            automations={automations}
            onClose={onClose}
            onCreate={() => onCreate()}
            onToggle={onToggle}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        ) : undefined
      }
    />
  );
}
