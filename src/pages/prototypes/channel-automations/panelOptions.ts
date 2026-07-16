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
   * Options 2b & 3b — sectioned trigger/instructions layout in the form editor.
   */
  showOperateWhere?: boolean;
  /** Option 2b — show per-automation read scope controls. */
  showReadScope?: boolean;
  /**
   * Option 3b — Chat / Settings / Access / Tools as peer tabs; only model
   * knobs stay behind an Advanced disclosure on Settings.
   */
  progressiveDisclosure?: boolean;
}

/** Option 2b — assignment backbone + per-automation tool scoping. */
export const OPTION2B_PANEL_OPTIONS: AutomationsPanelOptions = {
  showAgentSelector: false,
  showAgentPicker: true,
  editorKind: 'assignment',
  showAgentCapabilities: true,
  showAutomationToolScope: true,
  showOperateWhere: true,
  showReadScope: true,
};

/** Option 3b — entity model; Access/Tools as tabs, model knobs in Advanced. */
export const OPTION3B_PANEL_OPTIONS: AutomationsPanelOptions = {
  showAgentSelector: false,
  showAgentPicker: false,
  editorKind: 'entity',
  progressiveDisclosure: true,
  showOperateWhere: true,
};
