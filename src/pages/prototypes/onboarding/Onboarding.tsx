import { useEffect, useState } from 'react';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { VIGNETTES, type VignetteId } from './onboarding.scenes';
import FirstSessionVignette from './vignettes/FirstSessionVignette';
import WorkspaceCreationVignette from './vignettes/WorkspaceCreationVignette';
import AdminOnboardingVignette from './vignettes/AdminOnboardingVignette';
import EmptyStatesVignette from './vignettes/EmptyStatesVignette';
import FeatureIntroVignette from './vignettes/FeatureIntroVignette';
import styles from './Onboarding.module.scss';

export default function Onboarding() {
  const { setCenterSlot } = usePrototypeChrome();
  const [vignette, setVignette] = useState<VignetteId>('first-session');

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={VIGNETTES}
        activeId={vignette}
        onChange={(id) => setVignette(id as VignetteId)}
        ariaLabel="Onboarding vignette"
      />,
    );
    return () => setCenterSlot(null);
  }, [vignette, setCenterSlot]);

  return (
    <div className={styles['onboarding']}>
      {vignette === 'first-session' && <FirstSessionVignette />}
      {vignette === 'workspace-creation' && <WorkspaceCreationVignette />}
      {vignette === 'admin' && <AdminOnboardingVignette />}
      {vignette === 'empty-states' && <EmptyStatesVignette />}
      {vignette === 'feature-intro' && <FeatureIntroVignette />}
    </div>
  );
}
