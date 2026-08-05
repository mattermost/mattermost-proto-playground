import { ALL_STEPS } from './actions';
import { ALL_TRIGGERS } from './triggers';
import type { PaletteItem } from './types';

const BY_STEP_TYPE = new Map<string, PaletteItem>(
  [...ALL_TRIGGERS, ...ALL_STEPS].map((item) => [item.stepType, item]),
);

export function helpTextForStep(stepType: string): string | undefined {
  return BY_STEP_TYPE.get(stepType)?.helpText;
}
