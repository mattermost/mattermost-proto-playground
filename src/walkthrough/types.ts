import type { TagType } from '@mattermost/compass-ui/components/tag';

/** Optional freeform status badge on a jump-list section. */
export type WalkthroughSectionBadge = {
  label: string;
  /** Maps to Compass Tag `type`. Omit for default. */
  appearance?: TagType;
};

export type WalkthroughSection = {
  id: string;
  label: string;
  badge?: WalkthroughSectionBadge;
};

export type WalkthroughBullet =
  | string
  | {
      text: string;
      sub?: string[];
    };

/** Visual callout style. Lightbox also draws a ring around the target. */
export type WalkthroughFocusEmphasis = 'ring' | 'lightbox';

/** Preferred TourPoint side relative to the focus target. Omit → auto. */
export type WalkthroughNotePlacement = 'above' | 'below' | 'left' | 'right';

export type WalkthroughFocusNote = {
  title: string;
  points: string[];
};

export type WalkthroughFocus = {
  /** Matches `data-wt-focus` on a prototype element. */
  id: string;
  /**
   * Visual callout. Omit → `'ring'`.
   * `'lightbox'` dims the shell and rings the target. Arrays accepted for compat.
   */
  emphasis?: WalkthroughFocusEmphasis | WalkthroughFocusEmphasis[];
  note?: WalkthroughFocusNote;
  /** Prefer TourPoint on this side of the target (falls back if it does not fit). */
  notePlacement?: WalkthroughNotePlacement;
};

/** Freeform JSON-like bag; each prototype documents its own keys. */
export type WalkthroughSceneState = Record<string, unknown>;

export type WalkthroughStep = {
  id: string;
  section: string;
  /** Optional narrative eyebrow (overrides section label in the step panel). Not used in Jump to. */
  railGroup?: string;
  title: string;
  lead?: string;
  lookFor?: string[];
  bullets?: WalkthroughBullet[];
  callout?: string;
  /** Existing prototype scene id (e.g. SceneSwitcher id). */
  scene: string;
  /**
   * Prototype-owned state applied when this step becomes active.
   * Shape is per-prototype (menus open, call status, popovers, etc.).
   * Handled in `useRegisterWalkthrough(..., { onScene })`.
   */
  sceneState?: WalkthroughSceneState;
  focus?: WalkthroughFocus;
};

export type WalkthroughDocument = {
  /** Matches PrototypeEntry.id or path slug. */
  prototypeId: string;
  title: string;
  /** Optional one-line intent for slim chrome / first-step context. */
  intent?: string;
  sections: WalkthroughSection[];
  steps: WalkthroughStep[];
};

export type WalkthroughSceneHandler = (
  scene: string,
  sceneState?: WalkthroughSceneState,
) => void;
