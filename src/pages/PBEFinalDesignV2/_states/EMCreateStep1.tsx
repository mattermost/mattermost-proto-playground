import PBEChrome from '../_components/PBEChrome';
import PBEChannelSurface from '../_components/PBEChannelSurface';
import CreateChannelStep1 from './CreateChannelStep1';

export interface EMCreateStep1Props {
  /** Called when the modal is dismissed (× button or Cancel). */
  onCancel: () => void;
  /** Called when Next is clicked — typically navigates to em-create-step2. */
  onNext: () => void;
  /** Optional handler for the non-encrypted Create Channel CTA. */
  onCreate?: () => void;
}

/**
 * State 7 wrapper — renders PBE chrome with the operations-alpha channel
 * surface behind the Create Channel Step 1 modal overlay.
 */
export default function EMCreateStep1({
  onCancel,
  onNext,
  onCreate,
}: EMCreateStep1Props) {
  return (
    <PBEChrome activeChannel="operations-alpha">
      <PBEChannelSurface
        channelName="operations-alpha"
        overlay={
          <CreateChannelStep1
            onCancel={onCancel}
            onNext={onNext}
            onCreate={onCreate}
          />
        }
      />
    </PBEChrome>
  );
}
