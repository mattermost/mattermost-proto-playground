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

/**
 * Variant of the inline-edit Global Attributes table without a Write access
 * column. Read access is reframed as attribute value visibility (masking).
 */
export default function GlobalAttributesVisibilityScene(props: SceneProps) {
  return (
    <GlobalAttributesTableScene
      {...props}
      showWriteAccess={false}
      readColumnLabel="Attribute value visibility"
      readPopoverTitle="Attribute value visibility"
      sectionNoticeTitle="Global Attributes — visibility on the definition"
      sectionNoticeDescription="Who may assign values is configured per resource binding, not here. This surface sets attribute value visibility (Public, Restricted, Plugin-managed) and governs shared-only masking."
    />
  );
}
