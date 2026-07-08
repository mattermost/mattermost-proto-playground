import {
  accessCap,
  assignableValuesForResource,
  defaultResourceConfig,
  hasInheritanceParent,
  inheritanceParentKind,
  postDisplayLabel,
  readIntoActive,
  resolveInheritMode,
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
): string[] {
  const chips: string[] = [
    cfg.required ? 'Requirement: Required' : 'Requirement: Optional',
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
    chips.push(postDisplaySummary(cfg));
    if (hasInheritanceParent(attribute, 'Posts')) {
      const label = inheritanceChipLabel(cfg);
      if (label) chips.push(label);
    }
  }

  const setters = selectedSetters(cfg);
  if (setters.length === 1) {
    chips.push(`Who sets: ${setters[0]}`);
  } else if (setters.length > 1) {
    chips.push(`Who sets: ${setters.length} roles`);
  } else if (cfg.required) {
    chips.push('Who sets: None selected');
  }

  if (takesValueList(attribute) && attribute.values.length > 0) {
    const disabled = (cfg.disabledValueIds ?? []).length;
    chips.push(
      disabled === 0
        ? 'Options: All allowed'
        : `Options: ${disabled} disabled`,
    );
  }

  if (
    cfg.defaultValueId &&
    whoCanSetIsEditable(attribute, cfg) &&
    assignableValuesForResource(attribute, cfg).some(
      (v) => v.id === cfg.defaultValueId,
    )
  ) {
    const value = attribute.values.find((v) => v.id === cfg.defaultValueId);
    if (value) {
      chips.push(`Default: ${value.label}`);
    }
  }

  return chips;
}

/**
 * Single-line secondary summary for collapsed resource rows.
 * Compact segments joined with middle dots; truncates via CSS ellipsis.
 */
export function summaryLine(
  attribute: HubAttribute,
  cfg: ResourceConfig,
): string {
  const segments: string[] = [
    cfg.required ? 'Required' : 'Optional',
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
    const shown = (cfg.showWhere ?? [])
      .filter((loc) => loc !== 'Hidden')
      .map((loc) => postDisplayLabel(loc as PostDisplayLoc));
    segments.push(
      shown.length === 0
        ? 'Display: hidden'
        : `Display: ${shown.join(' + ')}`,
    );
    if (hasInheritanceParent(attribute, 'Posts')) {
      const label = ceilingSummaryLabel(resolveCeiling(cfg));
      if (label) segments.push(label);
    }
  }

  const setters = selectedSetters(cfg);
  if (setters.length === 1) {
    segments.push(`Set by ${setters[0]}`);
  } else if (setters.length > 1) {
    segments.push(`Set by ${setters.length} roles`);
  } else if (cfg.required) {
    segments.push('Set by: none');
  }

  if (takesValueList(attribute) && attribute.values.length > 0) {
    const disabled = (cfg.disabledValueIds ?? []).length;
    segments.push(
      disabled === 0
        ? 'Options: all allowed'
        : `Options: ${disabled} blocked`,
    );
  }

  if (
    cfg.defaultValueId &&
    whoCanSetIsEditable(attribute, cfg) &&
    assignableValuesForResource(attribute, cfg).some(
      (v) => v.id === cfg.defaultValueId,
    )
  ) {
    const value = attribute.values.find((v) => v.id === cfg.defaultValueId);
    if (value) {
      segments.push(`Default: ${value.label}`);
    }
  }

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
    out.push({ field: 'required', label: 'Required' });
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
  if (
    cfg.resource === 'Posts' &&
    hasInheritanceParent(attribute, 'Posts') &&
    ceiling
  ) {
    out.push({ field: 'inheritance', label: ceiling });
  }

  // Who can set — deviates from the default single setter.
  const selected = selectedSetters(cfg);
  const baseSelected = selectedSetters(base);
  if (
    selected.length !== baseSelected.length ||
    [...selected].sort().join('|') !== [...baseSelected].sort().join('|')
  ) {
    out.push({
      field: 'setter',
      label:
        selected.length === 0
          ? 'No setters'
          : selected.length === 1
            ? `Set by ${selected[0]}`
            : `Set by ${selected.length} roles`,
    });
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

  if (
    cfg.defaultValueId &&
    whoCanSetIsEditable(attribute, cfg) &&
    assignableValuesForResource(attribute, cfg).some(
      (v) => v.id === cfg.defaultValueId,
    )
  ) {
    const value = attribute.values.find((v) => v.id === cfg.defaultValueId);
    if (value) {
      out.push({ field: 'default', label: `Default: ${value.label}` });
    }
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
