import Chip from '@/components/ui/Chip/Chip';
import ClassificationPill from '@/pages/attribute-system/ClassificationPill';

export interface AttributeHeaderChipValueProps {
  label: string;
  valueId: string;
  isClassification: boolean;
  locked?: boolean;
}

/** Compact attribute value chip — ClassificationPill or Compass Chip Small. */
export default function AttributeHeaderChipValue({
  label,
  valueId,
  isClassification,
  locked = false,
}: AttributeHeaderChipValueProps) {
  if (isClassification) {
    return (
      <ClassificationPill
        valueId={valueId}
        label={label}
        size="Small"
        locked={locked}
      />
    );
  }

  return <Chip size="Small">{label}</Chip>;
}
