import type { WalkthroughSceneState } from '@/walkthrough/types';

/** Working Hours keys under step.sceneState. */
export type WorkingHoursWalkthroughApply = {
  /** Settings modal: the Working hours row collapsed, or its editor open. */
  settings?: 'collapsed' | 'editing';
};

export function parseWorkingHoursWalkthroughApply(
  state?: WalkthroughSceneState,
): WorkingHoursWalkthroughApply {
  if (!state) return {};
  const settings =
    state.settings === 'collapsed' || state.settings === 'editing'
      ? state.settings
      : undefined;
  return { settings };
}
