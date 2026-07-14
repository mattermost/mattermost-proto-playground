import type { UserProfileDisplay } from '@/pages/AttributeManagementHub/hubData';

/** Profile display options for MVP · Next (Users binding). */
export const MVP_NEXT_PROFILE_DISPLAY_OPTIONS: {
  key: UserProfileDisplay;
  label: string;
}[] = [
  { key: 'always', label: 'Always' },
  { key: 'hide-empty', label: 'When set' },
  { key: 'hidden', label: 'Hidden' },
];

export function mvpNextProfileDisplayLabel(
  mode: UserProfileDisplay | undefined,
): string {
  switch (mode) {
    case 'always':
      return 'Profile: Always';
    case 'hidden':
      return 'Profile: Hidden';
    case 'hide-empty':
    default:
      return 'Profile: When set';
  }
}
