/**
 * Create-channel classification picker data.
 *
 * The Classification field is a cascading hierarchical picker matching the
 * ranked-hierarchical tree: ranked tiers with nested display-only markings.
 * Only valid combinations are selectable, filtered to the user's attributes,
 * no free text. Releasability/Caveat is a SEPARATE multiselect field.
 */

export interface PickerNode {
  id: string;
  /** Label shown in the menu. */
  label: string;
  /** Full selection label once chosen (e.g. "Unclassified — TLP-AMBER"). */
  selectionLabel?: string;
  /** Submenu — a branch that opens a cascading child menu. */
  children?: PickerNode[];
  /** True when this node can be chosen as the final value. */
  selectable?: boolean;
  /** Whether the user's own attributes permit this value. */
  allowedForUser?: boolean;
}

/**
 * Cascading picker structure. Top level = ranked tiers (+ tier-with-marking
 * shortcuts and a TLP submenu under Unclassified).
 */
export const CLASSIFICATION_PICKER: PickerNode[] = [
  {
    id: 'unclassified',
    label: 'Unclassified',
    selectionLabel: 'Unclassified',
    selectable: true,
    allowedForUser: true,
  },
  {
    id: 'unclassified-ofuo',
    label: 'Unclassified — Official use only',
    selectionLabel: 'Unclassified — Official use only',
    selectable: true,
    allowedForUser: true,
  },
  {
    id: 'unclassified-tlp',
    label: 'Unclassified — TLP',
    children: [
      {
        id: 'tlp-clear',
        label: 'TLP-CLEAR',
        selectionLabel: 'Unclassified — TLP-CLEAR',
        selectable: true,
        allowedForUser: true,
      },
      {
        id: 'tlp-green',
        label: 'TLP-GREEN',
        selectionLabel: 'Unclassified — TLP-GREEN',
        selectable: true,
        allowedForUser: true,
      },
      {
        id: 'tlp-amber',
        label: 'TLP-AMBER',
        selectionLabel: 'Unclassified — TLP-AMBER',
        selectable: true,
        allowedForUser: true,
      },
      {
        id: 'tlp-amber-strict',
        label: 'TLP-AMBER_STRICT',
        selectionLabel: 'Unclassified — TLP-AMBER_STRICT',
        selectable: true,
        allowedForUser: true,
      },
      {
        id: 'tlp-red',
        label: 'TLP-RED',
        selectionLabel: 'Unclassified — TLP-RED',
        selectable: true,
        allowedForUser: true,
      },
    ],
  },
  {
    id: 'protected-a',
    label: 'Protected A',
    selectionLabel: 'Protected A',
    selectable: true,
    allowedForUser: true,
  },
  {
    id: 'protected-b',
    label: 'Protected B',
    selectionLabel: 'Protected B',
    selectable: true,
    allowedForUser: true,
  },
  {
    // Above the current user's clearance — present but not selectable.
    id: 'protected-c',
    label: 'Protected C',
    selectionLabel: 'Protected C',
    selectable: true,
    allowedForUser: false,
  },
];

/** Releasability = separate multiselect attribute (compared to Nationality). */
export const RELEASABILITY_OPTIONS = [
  { id: 'noforn', label: 'NOFORN' },
  { id: 'rel-gbr', label: 'REL TO GBR' },
  { id: 'rel-can', label: 'REL TO CAN' },
  { id: 'rel-fvey', label: 'REL TO FVEY' },
];
