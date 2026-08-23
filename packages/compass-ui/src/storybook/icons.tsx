import { createElement, type ReactElement, type ReactNode } from 'react';
import Icon from '../components/Icon/Icon';
import type { IconSize } from '../components/Icon/Icon';
import {
  STORYBOOK_ICONS,
  STORYBOOK_ICON_NAMES,
  type StorybookIconName,
} from './compassIcons.generated';

type IconSelectArgType = {
  control: 'select';
  options: string[];
  description?: string;
};

/** Hide an optional icon slot in Storybook controls. */
export const ICON_NONE = 'None';

/**
 * Use the component's built-in default glyph (Button `leadingIcon` /
 * `trailingIcon` boolean `true`, or Icon with no glyph).
 */
export const ICON_DEFAULT = 'Default';

export type StoryIconOption =
  | typeof ICON_NONE
  | typeof ICON_DEFAULT
  | StorybookIconName;

export { STORYBOOK_ICON_NAMES, type StorybookIconName };

function isIconName(value: string): value is StorybookIconName {
  return Object.prototype.hasOwnProperty.call(STORYBOOK_ICONS, value);
}

/** Raw compass-icons glyph element (no Icon wrapper). */
export function renderGlyph(
  name: StorybookIconName,
  size?: number,
): ReactElement {
  const Glyph = STORYBOOK_ICONS[name];
  return createElement(Glyph, size != null ? { size } : undefined);
}

/** Compass Icon wrapper around a named glyph. */
export function renderIcon(
  name: StorybookIconName,
  size: IconSize = '16',
): ReactElement {
  return <Icon glyph={renderGlyph(name)} size={size} />;
}

export type ResolveIconOptions = {
  /** When set, wrap the glyph in `Icon` at this size. */
  wrapSize?: IconSize;
  /** Pixel size on the raw compass-icons component (ActionButton, Tag, Chip). */
  glyphSize?: number;
  /**
   * When the control is `Default`:
   * - `boolean` → `true` (Button boolean icon slots)
   * - `wrapped` → `<Icon size={wrapSize} />` with default glyph
   * - `glyph` → emoticon-happy-outline at glyphSize
   */
  defaultMode?: 'boolean' | 'wrapped' | 'glyph';
};

/**
 * Map a Storybook select value to a component icon prop.
 * `None` → undefined; `Default` → per defaultMode; otherwise a named glyph.
 */
export function resolveStoryIcon(
  value: string | undefined | null,
  options: ResolveIconOptions = {},
): ReactNode | boolean | undefined {
  if (value == null || value === ICON_NONE || value === '') {
    return undefined;
  }

  if (value === ICON_DEFAULT) {
    const mode = options.defaultMode ?? 'wrapped';
    if (mode === 'boolean') return true;
    if (mode === 'glyph') {
      return renderGlyph('emoticon-happy-outline', options.glyphSize);
    }
    return <Icon size={options.wrapSize ?? '16'} />;
  }

  if (!isIconName(value)) {
    return undefined;
  }

  if (options.wrapSize != null) {
    return renderIcon(value, options.wrapSize);
  }

  return renderGlyph(value, options.glyphSize);
}

export type IconSelectArgTypeOptions = {
  /** Include a `None` option (optional icon slots). Default false. */
  optional?: boolean;
  /** Include a `Default` option. Default false. */
  includeDefault?: boolean;
  /** Control description shown in Storybook. */
  description?: string;
};

/** Shared select argType for icon name controls. */
export function iconSelectArgType(
  options: IconSelectArgTypeOptions = {},
): IconSelectArgType {
  const names: string[] = [
    ...(options.optional ? [ICON_NONE] : []),
    ...(options.includeDefault ? [ICON_DEFAULT] : []),
    ...STORYBOOK_ICON_NAMES,
  ];

  return {
    control: 'select',
    options: names,
    description:
      options.description ??
      'Compass icon glyph name (from @mattermost/compass-icons).',
  };
}
