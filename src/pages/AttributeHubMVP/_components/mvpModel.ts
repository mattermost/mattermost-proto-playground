import {
  accessCap,
  assignableValuesForResource,
  defaultResourceConfig,
  postDisplayLabel,
  readIntoActive,
  whoCanSetIsEditable,
  type HubAttribute,
  type PostDisplayLoc,
  type ResourceConfig,
  type ResourceKind,
  type WhoCanSet,
  type WhoSets,
} from '@/pages/AttributeManagementHub/hubData';

/**
 * MVP (P0) applies-to model. Local copy trimmed to P0 scope:
 * - Resources = Users / Channels / Posts only (Teams cut).
 * - No inheritance chips (inherit-from-channel / inherit-to-posts cut).
 * Reuses the shared who-can-set relational-default + roles picker shape.
 */
export const MVP_RESOURCES: ResourceKind[] = ['Users', 'Channels', 'Posts'];

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

function postDisplaySummary(cfg: ResourceConfig): string {
  const shown = (cfg.showWhere ?? [])
    .filter((loc) => loc !== 'Hidden')
    .map((loc) => postDisplayLabel(loc as PostDisplayLoc));
  if (shown.length === 0) {
    return 'Display: Hidden';
  }
  return `Display: ${shown.join(' + ')}`;
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

/** Compact chips for collapsed resource cards. No inheritance (cut in P0). */
export function summaryChips(
  attribute: HubAttribute,
  cfg: ResourceConfig,
): string[] {
  // Required is removed on Users (users are actors), so no requirement chip there.
  const chips: string[] =
    cfg.resource === 'Users'
      ? []
      : [cfg.required ? 'Requirement: Required' : 'Requirement: Optional'];

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
  }

  if (cfg.resource === 'Posts') {
    chips.push(postDisplaySummary(cfg));
  }

  const setters = selectedSetters(cfg);
  if (setters.length === 1) {
    chips.push(`Who sets: ${setters[0]}`);
  } else if (setters.length > 1) {
    chips.push(`Who sets: ${setters.length} roles`);
  } else if (cfg.required) {
    chips.push('Who sets: None selected');
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
  const segments: string[] = [];

  if (cfg.resource !== 'Users') {
    segments.push(cfg.required ? 'Required' : 'Optional');
  }

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
  }

  const setters = selectedSetters(cfg);
  if (setters.length === 1) {
    segments.push(`Set by ${setters[0]}`);
  } else if (setters.length > 1) {
    segments.push(`Set by ${setters.length} roles`);
  } else if (cfg.required) {
    segments.push('Set by: none');
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

/** Fresh default config for a newly-enabled resource. */
export function newResourceConfig(resource: ResourceKind): ResourceConfig {
  return defaultResourceConfig(resource);
}
