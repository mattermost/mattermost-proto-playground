import type { GraphOption } from '../nonTreeModel';

/**
 * Edge-authoring actions shared by all three representations. Every surface adds
 * and removes the SAME kind of thing — a single parent→child edge — so they all
 * take the same action bundle. `addParent` re-checks fail-closed and returns a
 * rejection message (or null on success); the matrix, table and list all route
 * their gestures through it.
 */
export interface EdgeActions {
  addParent: (childId: string, parentId: string) => string | null;
  removeEdge: (childId: string, parentId: string) => void;
  addValue: (label: string) => void;
  renameValue: (id: string, label: string) => void;
  toggleDeactivate: (id: string) => void;
  deleteValue: (id: string) => void;
  /** Structural delete gate — a reason string when blocked, null when deletable. */
  deleteBlock: (id: string) => string | null;
}

export interface RepProps {
  options: GraphOption[];
  actions: EdgeActions;
}
