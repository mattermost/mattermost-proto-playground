import type { ButtonAppearance, ButtonEmphasis, ButtonSize } from './Button';

export interface MattermostButtonClassOptions {
  appearance?: ButtonAppearance;
  destructive?: boolean;
  emphasis?: ButtonEmphasis;
  size?: ButtonSize;
}

/**
 * Legacy Mattermost `.btn*` classes for plugin CSS and modal-footer sibling
 * selectors. Mirrors webapp/platform/shared button_classes.ts, including the
 * primary+destructive quirk (drop `btn-primary` so `btn-danger` wins).
 */
export function mattermostButtonClasses({
  appearance = 'Default',
  destructive = false,
  emphasis = 'Primary',
  size = 'Medium',
}: MattermostButtonClassOptions): string {
  return [
    'btn',
    mattermostEmphasisClass(emphasis, destructive),
    mattermostSizeClass(size),
    destructive ? 'btn-danger' : '',
    appearance === 'Inverted' ? 'btn-inverted' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function mattermostEmphasisClass(
  emphasis: ButtonEmphasis,
  destructive: boolean,
): string {
  if (emphasis === 'Primary' && destructive) {
    return '';
  }

  switch (emphasis) {
    case 'Primary':
      return 'btn-primary';
    case 'Secondary':
      return 'btn-secondary';
    case 'Tertiary':
      return 'btn-tertiary';
    case 'Quaternary':
      return 'btn-quaternary';
    default: {
      const exhaustive: never = emphasis;
      return exhaustive;
    }
  }
}

function mattermostSizeClass(size: ButtonSize): string {
  switch (size) {
    case 'X-Small':
      return 'btn-xs';
    case 'Small':
      return 'btn-sm';
    case 'Medium':
      return '';
    case 'Large':
      return 'btn-lg';
    default: {
      const exhaustive: never = size;
      return exhaustive;
    }
  }
}
