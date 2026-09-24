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

export type WalkthroughFocusEmphasis = 'ring' | 'lightbox';

export type WalkthroughFocusNote = {
  title: string;
  points: string[];
};

export type WalkthroughFocus = {
  /** Matches `data-tour-focus` on a prototype element. */
  id: string;
  /**
   * Visual callouts. When omitted, defaults to `['ring']`.
   * Authors may combine ring and lightbox.
   */
  emphasis?: WalkthroughFocusEmphasis[];
  note?: WalkthroughFocusNote;
};

export type WalkthroughStep = {
  id: string;
  section: string;
  /** Optional group under a section — rendered as MenuGroupHeading. */
  railGroup?: string;
  title: string;
  lead?: string;
  lookFor?: string[];
  bullets?: WalkthroughBullet[];
  callout?: string;
  /** Existing prototype scene id (e.g. SceneSwitcher id). */
  scene: string;
  /** Extra state the prototype already understands. */
  sceneState?: Record<string, string | number | boolean | null | undefined>;
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
  sceneState?: WalkthroughStep['sceneState'],
) => void;
