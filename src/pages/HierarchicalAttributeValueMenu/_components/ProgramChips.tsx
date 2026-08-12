import Chip from '@/components/ui/Chip/Chip';
import { labelOf } from '../valueMenuModel';

export interface ProgramChipsProps {
  ids: string[];
  /** Omit for read-only hosts (the Channel Info chip trigger). */
  onRemove?: (id: string) => void;
}

/**
 * Selected values, rendered inside the field control.
 *
 * NO NUMERAL, in either ranking mode. The shipping `[2] Captain` / `[4] TS` chips
 * work because Rank and Clearance are single flat ladders where "2" is globally
 * meaningful. A hierarchical value's ordinal is PER-PARENT: Mission Casper is 2
 * under Raptor Flight and 1 under Dragon Spacecraft, so a chip in a field with no
 * parent context would have to pick one arbitrarily, and two chips both reading
 * "2" from different parents would imply a comparability the data does not have.
 * Numerals stay in the authoring surface, where positions are being edited.
 */
export default function ProgramChips({ ids, onRemove }: ProgramChipsProps) {
  return (
    <>
      {ids.map((id) => (
        <Chip
          key={id}
          size="Small"
          onRemove={onRemove != null ? () => onRemove(id) : undefined}
          removeLabel={`Remove ${labelOf(id)}`}
        >
          {labelOf(id)}
        </Chip>
      ))}
    </>
  );
}
