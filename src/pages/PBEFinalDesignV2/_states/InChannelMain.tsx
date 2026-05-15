import PBEChrome from '../_components/PBEChrome';
import PBEChannelSurface from '../_components/PBEChannelSurface';

export interface InChannelMainProps {
  /** Called when the Encryption Details pill in the channel header is clicked. */
  onOpenEncryption: () => void;
  /** Called when the product switcher's Encryption Management item is picked. */
  onOpenEncryptionManagement?: () => void;
}

/**
 * State 9 — In-Channel Main view. Full PBE chrome (AppBar visible since no
 * right rail) with the operations-alpha channel surface. The Encryption
 * Details pill in the header is shown and navigates to State 10.
 */
export default function InChannelMain({
  onOpenEncryption,
  onOpenEncryptionManagement,
}: InChannelMainProps) {
  return (
    <PBEChrome
      activeChannel="operations-alpha"
      onOpenEncryptionManagement={onOpenEncryptionManagement}
    >
      <PBEChannelSurface
        channelName="operations-alpha"
        showEncryptionDetailsLink
        onEncryptionDetailsClick={onOpenEncryption}
      />
    </PBEChrome>
  );
}
