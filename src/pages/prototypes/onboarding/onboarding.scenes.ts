export type VignetteId =
  | 'first-session'
  | 'workspace-creation'
  | 'admin'
  | 'empty-states'
  | 'feature-intro';

export const VIGNETTES: { id: VignetteId; label: string }[] = [
  { id: 'first-session', label: 'First session' },
  { id: 'workspace-creation', label: 'Workspace creation' },
  { id: 'admin', label: 'Admin setup' },
  { id: 'empty-states', label: 'Empty states' },
  { id: 'feature-intro', label: 'Feature intro' },
];
