import { useEffect, useState } from 'react';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { ACVC_SURFACES, type AcvcSurfaceId } from './actionControlsScenes';
import AuthoringScene from './scenes/AuthoringScene';
import ChannelAuthoringScene from './scenes/ChannelAuthoringScene';
import DenialScene from './scenes/DenialScene';
import ReadOnlyScene from './scenes/ReadOnlyScene';
import TracesScene from './scenes/TracesScene';
import styles from './ActionControlsViewChannel.module.scss';

export default function ActionControlsViewChannel() {
  const { setCenterSlot } = usePrototypeChrome();
  const [surface, setSurface] = useState<AcvcSurfaceId>('denial');
  // AppShell clears the centre slot in a `pathname` effect, which runs after
  // this child's effect on first mount and blanks the switcher. Flipping
  // `mounted` re-runs the effect below one render later, after that reset.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={ACVC_SURFACES}
        activeId={surface}
        onChange={(id) => setSurface(id as AcvcSurfaceId)}
        ariaLabel="Prototype surface"
      />,
    );
    return () => setCenterSlot(null);
  }, [surface, setCenterSlot, mounted]);

  return (
    <div className={styles['acvc']}>
      {surface === 'authoring' && <AuthoringScene />}
      {surface === 'channel' && <ChannelAuthoringScene />}
      {surface === 'denial' && <DenialScene />}
      {surface === 'readonly' && <ReadOnlyScene />}
      {surface === 'traces' && <TracesScene />}
    </div>
  );
}
