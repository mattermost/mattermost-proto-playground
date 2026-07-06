// Shared types across the three narrow-track comparison approaches.
// Product-canvas components import these; the harness reads the enums for its switchers.

export type ApproachId = 'a' | 'b' | 'c';

export const APPROACH_IDS: ApproachId[] = ['a', 'b', 'c'];

export type SurfaceId =
  | 's1-link' // Classification↔clearance link affordance (FR-1)
  | 's2-scope' // System-wide policy scope + static missing-attribute warning (FR-2/FR-3)
  | 's3-ceiling' // Constrained channel-classification ceiling dropdown (FR-5)
  | 's4-roles' // Delegated Attribute Manager role surface (FR-6)
  | 's5-removal'; // Continuous re-eval / removal notice (FR-10)

export const SURFACE_IDS: SurfaceId[] = [
  's1-link',
  's2-scope',
  's3-ceiling',
  's4-roles',
  's5-removal',
];

// Comparison-minimal per-surface state set (Q3=A): default + populated + the
// one state that carries each surface's posture. Not every surface exposes all
// three — the harness only offers the states a surface actually renders.
export type StateId = 'default' | 'populated' | 'posture';

export const STATE_IDS: StateId[] = ['default', 'populated', 'posture'];

export interface SurfaceScreenProps {
  approach: ApproachId;
  state: StateId;
}

// Ranked classification / clearance scale shared by both sides of a link.
// Source-of-truth scale; both channel.classification and user.clearance draw
// from it (FR-8 shared-scale inheritance).
export interface ClassificationLevel {
  id: string;
  label: string;
  rank: number; // higher = more restrictive
  // A level can be disabled for new assignment but preserved on existing ones
  // (FR-1 disable-not-delete).
  disabledForNew?: boolean;
}

export interface ProvenanceSource {
  id: string;
  label: string; // e.g. "UAS attribute sync", "LDAP / SAML"
  managedNote: string; // plausible product microcopy shown on the lock indicator
}

export interface DemoUser {
  id: string;
  name: string;
  avatar: string;
  clearanceLevelId: string | null; // null = no clearance value (deny under Option A)
  provenanceId: string;
}

export interface DemoChannel {
  id: string;
  name: string;
  private: boolean;
  classificationLevelId: string | null; // null = unclassified (abstain under Option A)
}
