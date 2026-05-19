import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import type { SceneId } from '@/types/outboundCall';

export const OUTBOUND_SCENES: { id: SceneId; label: string }[] = [
  { id: 'channel', label: 'Channel' },
  { id: 'dm', label: 'Direct message' },
  { id: 'team-sidebar', label: 'Dialer v1' },
];

export function OutboundCallSceneSwitcher({
  active,
  onChange,
}: {
  active: SceneId;
  onChange: (id: SceneId) => void;
}) {
  return (
    <SceneSwitcher
      scenes={OUTBOUND_SCENES}
      activeId={active}
      onChange={(id) => onChange(id as SceneId)}
      ariaLabel="Prototype entry points"
    />
  );
}
