import type { EditorKind } from './components/automationFormTypes';

export interface AutomationsPanelOptions {
  showAgentSelector?: boolean;
  showAgentPicker?: boolean;
  contextAgentId?: string;
  editorKind?: EditorKind;
  /** Option 2b — surface each agent's tools/access in the picker. */
  showAgentCapabilities?: boolean;
  /**
   * Option 2b — per-automation tool grants (least-privilege), decoupled from
   * the chosen agent's fixed tool set.
   */
  showAutomationToolScope?: boolean;
  /**
   * Options 2b & 3b — where the automation may read/post (operate-where field).
   */
  showOperateWhere?: boolean;
  /**
   * Option 3b — collapse model / tools / access behind an Advanced disclosure
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
  showOperateWhere: true,
};

/** Option 3b — Option 3 entity model with progressive disclosure of agent plumbing. */
export const OPTION5_PANEL_OPTIONS: AutomationsPanelOptions = {
  showAgentSelector: false,
  showAgentPicker: false,
  editorKind: 'entity',
  progressiveDisclosure: true,
  showOperateWhere: true,
};
