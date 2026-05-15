import PBEChrome from '../_components/PBEChrome';
import PBEChannelSurface from '../_components/PBEChannelSurface';
import EncryptionRHS from './EncryptionRHS';

export interface InChannelEncryptionProps {
  /** Called when the Encryption Details pill is clicked (toggles RHS off). */
  onCloseEncryption: () => void;
  /** Called when the product switcher's Encryption Management item is picked. */
  onOpenEncryptionManagement?: () => void;
}

/**
 * State 10 — In-Channel with Encryption Details RHS open (EM view).
 * Full PBE chrome with the EncryptionRHS panel replacing the AppBar.
 */
export default function InChannelEncryption({
  onCloseEncryption,
  onOpenEncryptionManagement,
}: InChannelEncryptionProps) {
  return (
    <PBEChrome
      activeChannel="operations-alpha"
      rightRail={<EncryptionRHS onClose={onCloseEncryption} />}
      onOpenEncryptionManagement={onOpenEncryptionManagement}
    >
      <PBEChannelSurface
        channelName="operations-alpha"
        showEncryptionDetailsLink
        encryptionDetailsActive
        onEncryptionDetailsClick={onCloseEncryption}
      />
    </PBEChrome>
  );
}
