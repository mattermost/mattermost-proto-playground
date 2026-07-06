import GlobalAttributesTableScene from './GlobalAttributesTableScene';
import type { AttrDef, ResourceType } from './data';

interface SceneProps {
  defs: AttrDef[];
  onPatch: (defId: string, patch: Partial<AttrDef>) => void;
  onToggleResource: (defId: string, resource: ResourceType, on: boolean) => void;
  onConfigureBinding: (defId: string, resource: ResourceType) => void;
  onConfigureAccess: (defId: string) => void;
  onDuplicate: (defId: string) => void;
  onDelete: (defId: string) => void;
}

/** v2 Global Attributes — no write floor; plugin-locked visibility; definition mutability. */
export default function GlobalAttributesV2Scene(props: SceneProps) {
  return (
    <GlobalAttributesTableScene
      {...props}
      simplifiedDefinition
      showWriteAccess={false}
      readColumnLabel="Value visibility"
      readPopoverTitle="Value visibility"
      sectionNoticeTitle="Global Attributes — simplified (v2)"
      sectionNoticeDescription="Definition-level settings only. Who may assign values is derived per resource type. Open vocabulary and editability are configured here once — not repeated on Channel or Post surfaces."
    />
  );
}
