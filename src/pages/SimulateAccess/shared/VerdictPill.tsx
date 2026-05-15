/**
 * VerdictPill — renders an access-decision pill (Allowed / Mixed / Denied),
 * composed on top of the design-system `Chip` component.
 *
 * The verdict-tone mapping mirrors the Figma spec:
 *   allow  → tone="success"  (filled check-circle)
 *   mixed  → tone="warning"  (filled alert-circle)
 *   deny   → tone="danger"   (filled close-circle)
 *
 * When `onClick` is provided, the chip renders as a button with a trailing
 * chevron-down to signal that more detail is available on activation.
 */
import { type MouseEvent } from 'react';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import HelpCircleIcon from '@mattermost/compass-icons/components/help-circle-outline';
import AlertCircleIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import Chip from '@/components/ui/Chip/Chip';
import type { ChipTone } from '@/components/ui/Chip/Chip';
import type { AdminRole, EditorScope, EntryContext, VerdictAttribution } from './types';

export interface VerdictPillProps {
  verdict: VerdictAttribution;
  role: AdminRole;
  context: EntryContext;
  scope?: EditorScope;
  /** When set, pill becomes clickable (used for the per-permission popover trigger). */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /** Hide the secondary attribution text. */
  hideAttribution?: boolean;
}

type VerdictTone = 'allow' | 'deny' | 'mixed';

interface RenderedVerdict {
  tone: VerdictTone;
  primary: string;
  secondary?: string;
  icon: React.ReactNode;
}

const TONE_TO_CHIP: Record<VerdictTone, ChipTone> = {
  allow: 'success',
  mixed: 'warning',
  deny: 'danger',
};

export function computeVerdict(
  verdict: VerdictAttribution,
  role: AdminRole,
  context: EntryContext,
  scope: EditorScope = 'full-graph',
): RenderedVerdict {
  const inEditor = context === 'system-editor' || context === 'channel-editor';
  const inListing = context === 'system-listing' || context === 'channel-listing';
  const isChannel = role === 'channel';

  if (verdict === 'allowed') {
    return { tone: 'allow', primary: 'Allowed', icon: <CheckCircleIcon /> };
  }

  if (verdict === 'mixed') {
    return { tone: 'mixed', primary: 'Mixed', icon: <AlertCircleIcon /> };
  }

  if (inListing && !isChannel) {
    return { tone: 'deny', primary: 'Denied', icon: <CloseCircleIcon /> };
  }

  if (verdict === 'denied-not-a-member') {
    return { tone: 'deny', primary: 'Denied', secondary: 'Not a member', icon: <CloseCircleIcon /> };
  }

  if (verdict === 'denied-no-recent-session') {
    return { tone: 'deny', primary: 'Denied', secondary: 'No recent session', icon: <HelpCircleIcon /> };
  }

  if (inEditor && scope === 'this-policy-only') {
    if (verdict === 'denied-this-policy' || verdict === 'denied-both') {
      return { tone: 'deny', primary: 'Denied by this policy', icon: <CloseCircleIcon /> };
    }
    return { tone: 'allow', primary: 'Allowed by this policy', icon: <CheckCircleIcon /> };
  }

  if (isChannel) {
    if (verdict === 'denied-this-policy') {
      return { tone: 'deny', primary: 'Denied', secondary: 'By this policy', icon: <CloseCircleIcon /> };
    }
    if (verdict === 'denied-system-policy' || verdict === 'denied-another-policy') {
      return { tone: 'deny', primary: 'Denied', secondary: 'By a system policy', icon: <CloseCircleIcon /> };
    }
    if (verdict === 'denied-both') {
      return { tone: 'deny', primary: 'Denied', secondary: 'By this and a system policy', icon: <CloseCircleIcon /> };
    }
  }

  if (verdict === 'denied-this-policy') {
    return { tone: 'deny', primary: 'Denied', secondary: 'By this policy', icon: <CloseCircleIcon /> };
  }
  if (verdict === 'denied-another-policy' || verdict === 'denied-system-policy') {
    return { tone: 'deny', primary: 'Denied', secondary: 'By another policy', icon: <CloseCircleIcon /> };
  }
  if (verdict === 'denied-both') {
    return { tone: 'deny', primary: 'Denied', secondary: 'By this and another policy', icon: <CloseCircleIcon /> };
  }

  return { tone: 'deny', primary: 'Denied', icon: <CloseCircleIcon /> };
}

export default function VerdictPill({
  verdict,
  role,
  context,
  scope = 'full-graph',
  hideAttribution = false,
  onClick,
}: VerdictPillProps) {
  const rendered = computeVerdict(verdict, role, context, scope);
  const chipTone = TONE_TO_CHIP[rendered.tone];

  const label = (
    <>
      {rendered.primary}
      {!hideAttribution && rendered.secondary && (
        <span style={{ fontWeight: 400, opacity: 0.85 }}> · {rendered.secondary}</span>
      )}
    </>
  );

  if (onClick) {
    return (
      <Chip
        as="button"
        tone={chipTone}
        size="Medium"
        leadingIcon={rendered.icon}
        trailingIcon={<ChevronDownIcon />}
        onClick={(e) => {
          e.stopPropagation();
          onClick(e);
        }}
      >
        {label}
      </Chip>
    );
  }

  return (
    <Chip
      role="status"
      tone={chipTone}
      size="Medium"
      leadingIcon={rendered.icon}
    >
      {label}
    </Chip>
  );
}
