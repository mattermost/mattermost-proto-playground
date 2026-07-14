import type { EditorKind } from './components/automationFormTypes';

export interface AutomationsPanelOptions {
  showAgentSelector?: boolean;
  showAgentPicker?: boolean;
  contextAgentId?: string;
  editorKind?: EditorKind;
  /** Option 4 — surface each agent's tools/access in the picker. */
  showAgentCapabilities?: boolean;
  /**
   * Option 4 — per-automation tool grants (least-privilege), decoupled from
   * the chosen agent's fixed tool set.
   */
  showAutomationToolScope?: boolean;
  /** Options 4 & 5 — always-visible blast-radius summary (never in Advanced). */
  showBlastRadius?: boolean;
  /**
   * Option 5 — collapse model / tools / access behind an Advanced disclosure
   * instead of exposing Access + Tools as peer tabs.
   */
  progressiveDisclosure?: boolean;
}

export const OPTION1_PANEL_OPTIONS: AutomationsPanelOptions = {
  showAgentSelector: false,
  showAgentPicker: true,
  editorKind: 'assignment',
};

export const OPTION2_PANEL_OPTIONS: AutomationsPanelOptions = {
  showAgentSelector: false,
  showAgentPicker: true,
  editorKind: 'assignment',
};

export const OPTION3_PANEL_OPTIONS: AutomationsPanelOptions = {
  showAgentSelector: false,
  showAgentPicker: false,
  editorKind: 'entity',
};

/** Option 2b — Option 2 backbone + per-automation tool scoping. */
export const OPTION4_PANEL_OPTIONS: AutomationsPanelOptions = {
  showAgentSelector: false,
  showAgentPicker: true,
  editorKind: 'assignment',
  showAgentCapabilities: true,
  showAutomationToolScope: true,
  showBlastRadius: true,
};

/** Option 3b — Option 3 entity model with progressive disclosure of agent plumbing. */
export const OPTION5_PANEL_OPTIONS: AutomationsPanelOptions = {
  showAgentSelector: false,
  showAgentPicker: false,
  editorKind: 'entity',
  showBlastRadius: true,
  progressiveDisclosure: true,
};
