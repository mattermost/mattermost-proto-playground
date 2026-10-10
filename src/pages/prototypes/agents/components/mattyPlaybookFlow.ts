import {
  INCIDENT_RESPONSE_PLAYBOOK_DRAFT,
  type PlaybookDraft,
} from '../agentsData';

export const PLAYBOOK_FLOW_TRIGGER = /start a playbook/i;

export const PLAYBOOK_FLOW_INTRO =
  "I can definitely create a Playbook for you. If you have a document or file you'd like to start from, drop it in the chat.";

export const PLAYBOOK_NOT_PDF_REPLY = 'I can only read PDFs for now. Try dropping a PDF.';

export function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

export function formatFileMeta(file: File): string {
  return `PDF · ${Math.max(1, Math.round(file.size / 1024))} KB`;
}

export function buildPlaybookDraft(fileName: string): PlaybookDraft {
  return {
    ...INCIDENT_RESPONSE_PLAYBOOK_DRAFT,
    sourceFileName: fileName,
    summary: `Converted by Matty from ${fileName}. Review the checklists and assign owners before activating.`,
  };
}

export function buildPlaybookToolSteps(fileName: string): string[] {
  return [
    `Reading ${fileName}`,
    'Extracting stages and tasks',
    'Drafting status updates and retrospective',
    'Creating playbook draft',
  ];
}
