import MvpResourceConfigPanel from './MvpResourceConfigPanel';
import MvpAllowedValuesPanel from './MvpAllowedValuesPanel';
import type { HubAttribute, ResourceConfig } from '@/pages/AttributeManagementHub/hubData';

export interface MvpResourceEditorBodyProps {
  attribute: HubAttribute;
  config: ResourceConfig;
  onChange: (next: Partial<ResourceConfig>) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
  /** OPEN — reveal allowed-value subsets (?allowed=on). Hidden by default in P0. */
  allowedOn: boolean;
}

/** Per-resource editor for the MVP applies-to cards. */
export default function MvpResourceEditorBody({
  attribute,
  config,
  onChange,
  onReadIntoFilteringChange,
  allowedOn,
}: MvpResourceEditorBodyProps) {
  return (
    <div>
      <MvpResourceConfigPanel
        attribute={attribute}
        config={config}
        onChange={onChange}
        onReadIntoFilteringChange={onReadIntoFilteringChange}
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
