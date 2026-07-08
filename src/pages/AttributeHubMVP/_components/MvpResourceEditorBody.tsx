import MvpResourceConfigPanel from './MvpResourceConfigPanel';
import MvpAllowedValuesPanel from './MvpAllowedValuesPanel';
import type { HubAttribute, ResourceConfig } from '@/pages/AttributeManagementHub/hubData';
import type { InheritanceState } from './mvpTerms';

export interface MvpResourceEditorBodyProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
  /** OPEN — reveal allowed-value subsets (?allowed=on). Hidden by default in P0. */
  allowedOn: boolean;
  inheritance: InheritanceState;
  onInheritanceChange: (next: InheritanceState) => void;
  nameOnResource: string;
  onNameOnResourceChange: (value: string) => void;
}

/** Per-resource editor for the MVP applies-to cards. */
export default function MvpResourceEditorBody({
  attribute,
  config,
  onChange,
  onReadIntoFilteringChange,
  allowedOn,
  inheritance,
  onInheritanceChange,
  nameOnResource,
  onNameOnResourceChange,
}: MvpResourceEditorBodyProps) {
  return (
    <div>
      <MvpResourceConfigPanel
        attribute={attribute}
        config={config}
        onChange={onChange}
        onReadIntoFilteringChange={onReadIntoFilteringChange}
        inheritance={inheritance}
        onInheritanceChange={onInheritanceChange}
        nameOnResource={nameOnResource}
        onNameOnResourceChange={onNameOnResourceChange}
      />
      {allowedOn && (
        <MvpAllowedValuesPanel
          attribute={attribute}
          config={config}
          onChange={onChange}
        />
      )}
    </div>
  );
}
