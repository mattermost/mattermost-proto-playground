import PBEChrome from '../_components/PBEChrome';
import PBEChannelSurface from '../_components/PBEChannelSurface';
import MemberRHS from './MemberRHS';

export interface InChannelMemberProps {
  /** Called when the Encryption Details pill is clicked (toggles RHS off). */
  onCloseEncryption: () => void;
  /** Called when the product switcher's Encryption Management item is picked. */
  onOpenEncryptionManagement?: () => void;
}

/**
 * State 11 — In-Channel with Encryption Details RHS open (Member view).
 * Same chrome composition as State 10 but renders the simpler `MemberRHS`
 * panel — no Add EM affordance, no Test Configuration button, no member
 * list.
 */
export default function InChannelMember({
  onCloseEncryption,
  onOpenEncryptionManagement,
}: InChannelMemberProps) {
  return (
    <PBEChrome
      activeChannel="operations-alpha"
      rightRail={<MemberRHS onClose={onCloseEncryption} />}
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
