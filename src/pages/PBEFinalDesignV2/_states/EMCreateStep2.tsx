import PBEChrome from '../_components/PBEChrome';
import PBEChannelSurface from '../_components/PBEChannelSurface';
import CreateChannelStep2 from './CreateChannelStep2';

export interface EMCreateStep2Props {
  /** Called when the modal is dismissed (× button). */
  onCancel: () => void;
  /** Called when Previous is clicked — navigates back to em-create-step1. */
  onBack: () => void;
  /** Called when Create Channel is clicked — finalizes channel creation. */
  onCreate: () => void;
}

/**
 * State 8 wrapper — renders PBE chrome with the operations-alpha channel
 * surface behind the Create Channel Step 2 (Classification + ABAC) modal.
 */
export default function EMCreateStep2({
  onCancel,
  onBack,
  onCreate,
}: EMCreateStep2Props) {
  return (
    <PBEChrome activeChannel="operations-alpha">
      <PBEChannelSurface
        channelName="operations-alpha"
        overlay={
          <CreateChannelStep2
            onCancel={onCancel}
            onBack={onBack}
            onCreate={onCreate}
          />
        }
      />
    </PBEChrome>
  );
}
