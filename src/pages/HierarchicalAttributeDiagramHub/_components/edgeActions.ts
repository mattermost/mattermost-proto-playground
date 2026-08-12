import type { GraphOption } from '@/pages/HierarchicalAttributeNonTree/nonTreeModel';

/**
 * Edge-authoring action bundle — the same shape the non-tree surfaces use. Every
 * gesture on the diagram (add value, add/remove a parent edge, rename, deactivate,
 * delete) routes through this so the fail-closed cycle gate and the structural
 * delete gate stay authoritative in one place (the host). Kept local to this
 * prototype so the page is self-contained; the math it wraps is the shared model.
 */
export interface EdgeActions {
  /** Add parentId as a parent of childId. Returns a rejection string, or null on success. */
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
