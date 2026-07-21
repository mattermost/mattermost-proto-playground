export type AutomationsAiSurface =
  | 'home'
  | 'templates'
  | 'editor'
  | 'runs'
  | 'run-detail'
  | 'history'
  | 'unknown';

export type AutomationsAiContext = {
  surface: AutomationsAiSurface;
  /** Human-readable place label, e.g. "Home" or automation name. */
  placeLabel: string;
  automationId?: string;
  automationName?: string;
};

export type AiSuggestion = {
  id: string;
  label: string;
  /** Prompt text sent as the user message when picked. */
  prompt: string;
  action?:
    | 'create-workflow'
    | 'open-editor-agent'
    | 'go-templates'
    | 'explain'
    | 'none';
};

const BASE = '/prototypes/automations';

export function resolveAutomationsAiContext(
  pathname: string,
  automationName?: string,
): AutomationsAiContext {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  if (normalized === BASE) {
    return { surface: 'home', placeLabel: 'Home' };
  }
  if (normalized === `${BASE}/templates`) {
    return { surface: 'templates', placeLabel: 'Templates' };
  }

  const runDetail = normalized.match(
    new RegExp(`^${BASE}/([^/]+)/runs/([^/]+)$`),
  );
  if (runDetail) {
    return {
      surface: 'run-detail',
      placeLabel: automationName
        ? `Run detail · ${automationName}`
        : 'Run detail',
      automationId: runDetail[1],
      automationName,
    };
  }

  const runs = normalized.match(new RegExp(`^${BASE}/([^/]+)/runs$`));
  if (runs) {
    return {
      surface: 'runs',
      placeLabel: automationName ? `Runs · ${automationName}` : 'Runs',
      automationId: runs[1],
      automationName,
    };
  }

  const history = normalized.match(new RegExp(`^${BASE}/([^/]+)/history$`));
  if (history) {
    return {
      surface: 'history',
      placeLabel: automationName ? `History · ${automationName}` : 'History',
      automationId: history[1],
      automationName,
    };
  }

  const editor = normalized.match(new RegExp(`^${BASE}/([^/]+)/editor$`));
  if (editor) {
    return {
      surface: 'editor',
      placeLabel: automationName ?? 'Workflow editor',
      automationId: editor[1],
      automationName,
    };
  }

  return { surface: 'unknown', placeLabel: 'Automations' };
}

export function suggestionsForContext(
  ctx: AutomationsAiContext,
): AiSuggestion[] {
  switch (ctx.surface) {
    case 'home':
      return [
        {
          id: 'create-urgent',
          label: 'Create a workflow for urgent message alerts',
          prompt:
            "When someone posts 'urgent' in a channel, react with 🚨 and DM the channel members.",
          action: 'create-workflow',
        },
        {
          id: 'browse-templates',
          label: 'Help me pick a template to start from',
          prompt: 'Which template should I use for onboarding new teammates?',
          action: 'go-templates',
        },
        {
          id: 'explain-home',
          label: 'What can I do on this page?',
          prompt: 'What can I do from the Automations home screen?',
          action: 'explain',
        },
      ];
    case 'templates':
      return [
        {
          id: 'tpl-welcome',
          label: 'Recommend an onboarding template',
          prompt: 'Which template is best for welcoming new teammates?',
          action: 'explain',
        },
        {
          id: 'create-custom',
          label: 'Describe a custom workflow instead',
          prompt:
            'Every weekday at 9am, post a standup reminder in the Engineering channel.',
          action: 'create-workflow',
        },
      ];
    case 'editor':
      return [
        {
          id: 'build-flow',
          label: 'Help me build this workflow with AI',
          prompt:
            "When someone posts 'urgent' in a channel, react with 🚨 and DM the channel members.",
          action: 'open-editor-agent',
        },
        {
          id: 'explain-editor',
          label: 'Explain the steps on this canvas',
          prompt: `Explain the current workflow${ctx.automationName ? ` for “${ctx.automationName}”` : ''}.`,
          action: 'explain',
        },
        {
          id: 'add-condition',
          label: 'Suggest a condition or branch to add',
          prompt: 'What condition or branch should I add next?',
          action: 'explain',
        },
      ];
    case 'runs':
    case 'run-detail':
      return [
        {
          id: 'debug-run',
          label: 'Help me understand a failed run',
          prompt: 'How do I debug a failed automation run?',
          action: 'explain',
        },
        {
          id: 'back-edit',
          label: 'Suggest changes to fix failures',
          prompt: 'What workflow changes might reduce failed runs?',
          action: 'explain',
        },
      ];
    case 'history':
      return [
        {
          id: 'history-explain',
          label: 'What does change history track?',
          prompt: 'What does automation change history track?',
          action: 'explain',
        },
      ];
    default:
      return [
        {
          id: 'create-workflow',
          label: 'Create a new automation with AI',
          prompt:
            'When a user joins the Sales team, send them a welcome DM with onboarding links.',
          action: 'create-workflow',
        },
      ];
  }
}

export function greetingForContext(ctx: AutomationsAiContext): string {
  switch (ctx.surface) {
    case 'home':
      return 'How can I help — create a workflow, find something, or explore templates?';
    case 'templates':
      return 'You’re browsing templates. I can recommend one or help you describe a custom workflow.';
    case 'editor':
      return ctx.automationName
        ? `You’re editing “${ctx.automationName}”. How can I help with this workflow?`
        : 'You’re in the workflow editor. How can I help?';
    case 'runs':
      return ctx.automationName
        ? `You’re viewing runs for “${ctx.automationName}”. Want help reading results or debugging failures?`
        : 'You’re viewing run history. How can I help?';
    case 'run-detail':
      return 'You’re looking at a run detail. I can help interpret the payload and step results.';
    case 'history':
      return ctx.automationName
        ? `You’re in change history for “${ctx.automationName}”. What would you like to know?`
        : 'You’re in change history. How can I help?';
    default:
      return 'Hi — how can I help with Automations?';
  }
}

export function scriptedReplyFor(
  ctx: AutomationsAiContext,
  prompt: string,
  action: AiSuggestion['action'],
): string {
  if (action === 'create-workflow') {
    return 'Got it. I’ll open the editor behind this panel and build that workflow on the canvas.';
  }
  if (action === 'open-editor-agent') {
    return 'I’ll place triggers and steps on the canvas while we work from this assistant.';
  }
  if (action === 'go-templates') {
    return 'For onboarding, start with “Welcome new teammates.” I’ll take you to Templates so you can use it.';
  }
  if (ctx.surface === 'editor' && /explain/i.test(prompt)) {
    return `This canvas is the visual definition of ${ctx.automationName ? `“${ctx.automationName}”` : 'your automation'}: triggers start the flow, conditions branch, and actions perform work. Select a node to inspect its properties on the right.`;
  }
  if (ctx.surface === 'home') {
    return 'From Home you can search and filter automations, star favorites, open the editor, or start from Templates. Use the + New button for a blank draft.';
  }
  if (ctx.surface === 'runs' || ctx.surface === 'run-detail') {
    return 'Open a run to see the trigger payload and each step’s input/output. Failed steps usually point to missing config or rate limits — fix those in the editor, then Test run.';
  }
  if (ctx.surface === 'history') {
    return 'Change history lists revisions (created, enabled, saved, and so on). Restore is stubbed in this prototype.';
  }
  return 'Happy to help. Pick a suggestion or tell me what you’d like to do next.';
}
