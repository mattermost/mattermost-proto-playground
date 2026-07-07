import type { EditorKind } from './components/automationFormTypes';

export interface AutomationsPanelOptions {
  showAgentSelector?: boolean;
  showAgentPicker?: boolean;
  contextAgentId?: string;
  editorKind?: EditorKind;
}

export const OPTION1_PANEL_OPTIONS: AutomationsPanelOptions = {
  showAgentSelector: false,
  showAgentPicker: true,
};

export const OPTION2_PANEL_OPTIONS: AutomationsPanelOptions = {
  showAgentSelector: false,
  showAgentPicker: true,
};

export const OPTION3_PANEL_OPTIONS: AutomationsPanelOptions = {
  showAgentSelector: false,
  showAgentPicker: false,
  editorKind: 'entity',
};
