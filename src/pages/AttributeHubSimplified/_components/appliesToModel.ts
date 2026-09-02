import {
  accessCap,
  assignableValuesForResource,
  defaultResourceConfig,
  hasInheritanceParent,
  inheritanceParentKind,
  isInheritFromChannelDefault,
  postDisplayLabel,
  readIntoActive,
  resolveInheritMode,
  resolvePostDisplayMode,
  takesValueList,
  whoCanSetIsEditable,
  type HubAttribute,
  type PostDisplayLoc,
  type ResourceConfig,
  type ResourceKind,
  type WhoCanSet,
  type WhoSets,
} from '@/pages/AttributeManagementHub/hubData';
import { ceilingSummaryLabel, resolveCeiling } from './simplifiedModel';

/**
 * Simplified "who can set" model for the new variation:
 * multi-select combobox for resource defaults + system roles.
 */
export const RELATIONAL_DEFAULTS: Record<ResourceKind, WhoSets[]> = {
  Users: ['System admin', 'Members'],
  Channels: ['Channel admin', 'Team admin', 'System admin', 'Members'],
  Teams: ['Team admin', 'System admin', 'Members'],
  Posts: ['Post author', 'Channel admin', 'System admin'],
};

/** Channel Settings scope — this channel and posts within it. */
export function resourceDisplayName(
  resource: ResourceKind,
  channelScope = false,
): string {
  if (!channelScope) return resource;
  if (resource === 'Channels') return 'This channel';
  if (resource === 'Posts') return 'Posts of this channel';
  return resource;
}

/** Labels for Channel Settings Applies-to (not the global attribute hub). */
export function channelScopedResourceLabels(): Partial<
  Record<ResourceKind, string>
> {
  return {
    Channels: 'This channel',
    Posts: 'Posts of this channel',
  };
}

/** All system-configured roles for the "Other roles" submenu. */
export const OTHER_SYSTEM_ROLES = [
  'Security Administrators',
  'Program Security Officers',
  'Channel Admins',
  'Team Admins',
  'Directory Administrators',
  'People Operations',
  'Finance Administrators',
];

export const DISPLAY_LOCATIONS = ['Header', 'Sidebar', 'Banner'] as const;
export type DisplayLoc = (typeof DISPLAY_LOCATIONS)[number];

function postDisplaySummary(cfg: ResourceConfig): string {
  const shown = (cfg.showWhere ?? [])
    .filter((loc) => loc !== 'Hidden')
    .map((loc) => postDisplayLabel(loc as PostDisplayLoc));
  if (shown.length === 0) {
    return 'Display: Hidden';
  }
  return `Display: ${shown.join(' + ')}`;
}

function inheritanceChipLabel(cfg: ResourceConfig): string | null {
  const summary = ceilingSummaryLabel(resolveCeiling(cfg));
  return summary ? `Inheritance: ${summary}` : null;
}

function defaultValueChip(
  attribute: HubAttribute,
  cfg: ResourceConfig,
): string | null {
  if (cfg.resource === 'Posts') {
    if (
      resolveInheritMode(cfg) === 'inherit' ||
      resolveInheritMode(cfg) === 'inherit-lock' ||
      isInheritFromChannelDefault(cfg.defaultValueId)
    ) {
      return 'Default: Inherit from channel';
    }
  }
  if (
    cfg.defaultValueId &&
    whoCanSetIsEditable(attribute, cfg) &&
    assignableValuesForResource(attribute, cfg).some(
      (v) => v.id === cfg.defaultValueId,
    )
  ) {
    const value = attribute.values.find((v) => v.id === cfg.defaultValueId);
    return value ? `Default: ${value.label}` : null;
  }
  return null;
}

function postDisplayModeChip(cfg: ResourceConfig): string | null {
  if (cfg.resource !== 'Posts') return null;
  return resolvePostDisplayMode(cfg) === 'always'
    ? 'Display: Always show'
    : 'Display: Show when overridden';
}

/** All roles currently allowed to set the value on this resource. */
export function selectedSetters(cfg: ResourceConfig): string[] {
  const out: string[] = [];
  if (cfg.whoCanSet.relationalDefault) {
    out.push(cfg.whoCanSet.relationalDefault);
  }
  for (const grant of cfg.whoCanSet.grants.roles) {
    if (!out.includes(grant.subject)) {
      out.push(grant.subject);
    }
  }
  return out;
}

/** Summary label — comma-separated when multiple setters are selected. */
export function currentSetter(cfg: ResourceConfig): string {
  return selectedSetters(cfg).join(', ');
}

export function isRelationalDefault(
  resource: ResourceKind,
  subject: string,
): subject is WhoSets {
  return RELATIONAL_DEFAULTS[resource].includes(subject as WhoSets);
}

export function applySettersList(
  resource: ResourceKind,
  selected: string[],
): WhoCanSet {
  const unique = [...new Set(selected)];

  if (unique.length === 0) {
    return { relationalDefault: null, grants: accessCap() };
  }

  if (unique.length === 1) {
    const single = unique[0];
    if (isRelationalDefault(resource, single)) {
      return { relationalDefault: single, grants: accessCap() };
    }
    return { relationalDefault: null, grants: accessCap([{ subject: single }]) };
  }

  return {
    relationalDefault: null,
    grants: accessCap(unique.map((subject) => ({ subject }))),
  };
}

export function toggleSetterSelection(
  resource: ResourceKind,
  cfg: ResourceConfig,
  subject: string,
): WhoCanSet {
  const current = selectedSetters(cfg);
  const next = current.includes(subject)
    ? current.filter((entry) => entry !== subject)
    : [...current, subject];
  return applySettersList(resource, next);
}

/** Compact chips for collapsed resource rows in the applies-to list. */
export function summaryChips(
  attribute: HubAttribute,
  cfg: ResourceConfig,
  aligned = false,
): string[] {
  const chips: string[] = [
    cfg.required
      ? cfg.resource === 'Posts'
        ? 'Requirement: Required for new posts'
        : 'Requirement: Required'
      : 'Requirement: Optional',
  ];

  if (cfg.resource === 'Users') {
    chips.push(
      cfg.userProfileDisplay === 'always'
        ? 'Profile: Always show'
        : 'Profile: Hide when empty',
    );
    chips.push(
      readIntoActive(attribute)
        ? 'Visibility: Own values only'
        : 'Visibility: Show all values',
    );
  }

  if (cfg.resource === 'Channels') {
    const shown = (cfg.showWhere ?? []).filter((loc) => loc !== 'Hidden');
    chips.push(
      shown.length === 0 ? 'Display: Hidden' : `Display: ${shown.join(' + ')}`,
    );
    if (hasInheritanceParent(attribute, 'Channels')) {
      const label = inheritanceChipLabel(cfg);
      if (label) chips.push(label);
    }
  }

  if (cfg.resource === 'Posts') {
    const modeChip = postDisplayModeChip(cfg);
    if (modeChip) chips.push(modeChip);
    if (!aligned) chips.push(postDisplaySummary(cfg));
  }

  if (
    !aligned &&
    takesValueList(attribute) &&
    attribute.values.length > 0
  ) {
    const disabled = (cfg.disabledValueIds ?? []).length;
    chips.push(
      disabled === 0
        ? 'Options: All allowed'
        : `Options: ${disabled} disabled`,
    );
  }

  const defaultChip = defaultValueChip(attribute, cfg);
  if (defaultChip) chips.push(defaultChip);

  return chips;
}

/**
 * Single-line secondary summary for collapsed resource rows.
 * Compact segments joined with middle dots; truncates via CSS ellipsis.
 */
export function summaryLine(
  attribute: HubAttribute,
  cfg: ResourceConfig,
  aligned = false,
): string {
  const segments: string[] = [
    cfg.required
      ? cfg.resource === 'Posts'
        ? 'Required for new posts'
        : 'Required'
      : 'Optional',
  ];

  if (cfg.resource === 'Users') {
    segments.push(
      cfg.userProfileDisplay === 'always'
        ? 'Profile: always show'
        : 'Profile: hide when empty',
    );
    segments.push(
      readIntoActive(attribute)
        ? 'Visibility: own values only'
        : 'Visibility: show all',
    );
  }

  if (cfg.resource === 'Channels') {
    const shown = (cfg.showWhere ?? []).filter((loc) => loc !== 'Hidden');
    segments.push(
      shown.length === 0
        ? 'Display: hidden'
        : `Display: ${shown.join(' + ')}`,
    );
    if (hasInheritanceParent(attribute, 'Channels')) {
      const label = ceilingSummaryLabel(resolveCeiling(cfg));
      if (label) segments.push(label);
    }
  }

  if (cfg.resource === 'Posts') {
    const modeChip = postDisplayModeChip(cfg);
    if (modeChip) segments.push(modeChip);
    if (!aligned) {
      const shown = (cfg.showWhere ?? [])
        .filter((loc) => loc !== 'Hidden')
        .map((loc) => postDisplayLabel(loc as PostDisplayLoc));
      segments.push(
        shown.length === 0
          ? 'Display: hidden'
          : `Display: ${shown.join(' + ')}`,
      );
    }
  }

  if (
    !aligned &&
    takesValueList(attribute) &&
    attribute.values.length > 0
  ) {
    const disabled = (cfg.disabledValueIds ?? []).length;
    segments.push(
      disabled === 0
        ? 'Options: all allowed'
        : `Options: ${disabled} blocked`,
    );
  }

  const defaultChip = defaultValueChip(attribute, cfg);
  if (defaultChip) segments.push(defaultChip);

  return segments.join(' · ');
}

/**
 * A single deviation chip. `field` groups them; `label` is the chip copy.
 * Compares against `defaultResourceConfig` so the "all defaults" card stays quiet.
 */
export interface Deviation {
  field: string;
  label: string;
}

export function deviationsFor(
  attribute: HubAttribute,
  cfg: ResourceConfig,
): Deviation[] {
  const base = defaultResourceConfig(cfg.resource);
  const out: Deviation[] = [];

  if (cfg.required && !base.required) {
    out.push({
      field: 'required',
      label: cfg.resource === 'Posts' ? 'Required for new posts' : 'Required',
    });
  }

  // Display — Channels / Posts.
  if (cfg.resource === 'Channels') {
    const cur = (cfg.showWhere ?? [])
      .filter((l) => l !== 'Hidden')
      .sort()
      .join(',');
    const def = (base.showWhere ?? []).sort().join(',');
    if (cur !== def) {
      const shown = (cfg.showWhere ?? []).filter((l) => l !== 'Hidden');
      out.push({
        field: 'display',
        label: shown.length === 0 ? 'Hidden' : shown.join(' + '),
      });
    }
  }

  if (cfg.resource === 'Posts') {
    const mode = resolvePostDisplayMode(cfg);
    const defMode = resolvePostDisplayMode(base);
    if (mode !== defMode) {
      out.push({
        field: 'post-display',
        label:
          mode === 'always' ? 'Always show' : 'Show when overridden',
      });
    }
    const cur = (cfg.showWhere ?? [])
      .filter((l) => l !== 'Hidden')
      .sort()
      .join(',');
    const def = (base.showWhere ?? []).sort().join(',');
    if (cur !== def) {
      const shown = (cfg.showWhere ?? [])
        .filter((l) => l !== 'Hidden')
        .map((loc) => postDisplayLabel(loc as PostDisplayLoc));
      out.push({
        field: 'display',
        label: shown.length === 0 ? 'Hidden' : shown.join(' + '),
      });
    }
  }

  // Inheritance — configured on child bindings when parent is applied.
  const ceiling = ceilingSummaryLabel(resolveCeiling(cfg));
  if (
    cfg.resource === 'Channels' &&
    hasInheritanceParent(attribute, 'Channels') &&
    ceiling
  ) {
    out.push({ field: 'inheritance', label: ceiling });
  }

  // Allowed values — a subset was disabled.
  const disabled = cfg.disabledValueIds ?? [];
  if (disabled.length > 0 && attribute.type !== 'Text') {
    const total = attribute.values.filter((v) => v.tier != null || attribute.type !== 'Ranked-hierarchical').length;
    out.push({
      field: 'values',
      label: `${total - disabled.length} of ${total} values`,
    });
  }

  const defaultChip = defaultValueChip(attribute, cfg);
  if (defaultChip && cfg.defaultValueId !== base.defaultValueId) {
    out.push({ field: 'default', label: defaultChip });
  }

  return out;
}

/** Setter locked when this binding inherits with lock from its parent. */
export function setterLock(
  attribute: HubAttribute,
  resource: ResourceKind,
): { locked: boolean; parent?: ResourceKind } {
  const parentKind = inheritanceParentKind(resource);
  if (!parentKind || !hasInheritanceParent(attribute, resource)) {
    return { locked: false };
  }

  const cfg = attribute.appliesTo.find((c) => c.resource === resource);
  if (cfg && resolveInheritMode(cfg) === 'inherit-lock') {
    return { locked: true, parent: parentKind };
  }
  return { locked: false };
}
