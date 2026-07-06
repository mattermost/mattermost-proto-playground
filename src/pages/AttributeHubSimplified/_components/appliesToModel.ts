import {
  accessCap,
  channelBinding,
  defaultResourceConfig,
  postDisplayLabel,
  readIntoActive,
  resolveInheritMode,
  takesValueList,
  teamBinding,
  type HubAttribute,
  type InheritMode,
  type PostDisplayLoc,
  type ResourceConfig,
  type ResourceKind,
  type WhoCanSet,
  type WhoSets,
} from '@/pages/AttributeManagementHub/hubData';

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

export const INHERIT_MODE_OPTIONS: Array<{ key: InheritMode; label: string }> = [
  { key: 'off', label: 'Off' },
  { key: 'inherit', label: 'Inherit' },
  { key: 'inherit-lock', label: 'Inherit + lock' },
];

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
    const team = teamBinding(attribute);
    if (team) {
      const mode = resolveInheritMode(team);
      if (mode === 'inherit-lock') {
        chips.push('Inheritance: Locked from team');
      } else if (mode === 'inherit') {
        chips.push('Inheritance: From team');
      }
    }
  }

  if (cfg.resource === 'Teams') {
    const mode = resolveInheritMode(cfg);
    if (mode === 'inherit-lock') {
      chips.push('Inheritance: Locked to channels');
    } else if (mode === 'inherit') {
      chips.push('Inheritance: To channels');
    }
  }

  if (cfg.resource === 'Posts') {
    chips.push(postDisplaySummary(cfg));
    const channel = channelBinding(attribute);
    if (channel) {
      const mode = resolveInheritMode(channel);
      if (mode === 'inherit-lock') {
        chips.push('Inheritance: Locked from channel');
      } else if (mode === 'inherit') {
        chips.push('Inheritance: From channel');
      }
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
        ? 'Values: All allowed'
        : `Values: ${disabled} disabled`,
    );
  }

  return chips;
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

  // Inheritance — Channels (from Team) / Teams (to Channels) / Posts (from Channel).
  const mode = resolveInheritMode(cfg);
  if ((cfg.resource === 'Channels' || cfg.resource === 'Teams') && mode !== 'off') {
    const src = cfg.resource === 'Channels' ? 'Team' : 'Channels';
    out.push({
      field: 'inheritance',
      label: mode === 'inherit-lock' ? `Locked to ${src}` : `Inherits from ${src}`,
    });
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

  return out;
}

/** Parent-inheritance lock (R3): a child setter is locked by an inherit+lock parent. */
export function setterLock(
  attribute: HubAttribute,
  resource: ResourceKind,
): { locked: boolean; parent?: ResourceKind } {
  if (resource === 'Posts') {
    const parent = channelBinding(attribute);
    if (parent && resolveInheritMode(parent) === 'inherit-lock') {
      return { locked: true, parent: 'Channels' };
    }
  }
  if (resource === 'Channels') {
    const parent = teamBinding(attribute);
    if (parent && resolveInheritMode(parent) === 'inherit-lock') {
      return { locked: true, parent: 'Teams' };
    }
  }
  return { locked: false };
}
