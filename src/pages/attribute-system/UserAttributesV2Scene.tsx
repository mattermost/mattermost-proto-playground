import UserAttributesScene from './UserAttributesScene';
import type { AttrDef, Binding, AttrValue } from './data';

interface UserAttributesV2SceneProps {
  defs: AttrDef[];
  allDefs: AttrDef[];
  onAddGlobal: () => void;
  onCreateNew: () => void;
  onPromote: (defId: string) => void;
  onDuplicate: (defId: string) => void;
  onDelete: (defId: string) => void;
  onDeactivate: (defId: string) => void;
  onPatchValues: (defId: string, values: AttrValue[]) => void;
  onPatchBinding: (
    defId: string,
    resource: 'Users',
    patch: Partial<Binding>,
  ) => void;
  onLinkExternalSource: (defId: string) => void;
}

/** v2 User Attributes — visibility hardcoded; who-can-set derived unless user-editable toggle on. */
export default function UserAttributesV2Scene(props: UserAttributesV2SceneProps) {
  return (
    <UserAttributesScene
      {...props}
      simplified
    />
  );
}
