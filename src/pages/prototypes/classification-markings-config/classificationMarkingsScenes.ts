export type MarkingsSceneId = 'current' | 'reworked' | 'integrated';

export const MARKINGS_SCENES: { id: MarkingsSceneId; label: string }[] = [
  { id: 'integrated', label: 'Integrated Mapping' },
  { id: 'reworked', label: 'Mapping' },
  { id: 'current', label: 'Current' },
];
