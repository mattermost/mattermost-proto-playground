import type { ElementType } from 'react';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import CloseCircleOutlineIcon from '@mattermost/compass-icons/components/close-circle-outline';
import Chip from '@/components/ui/Chip/Chip';
import type { SyncState } from '../../hubData';
import { syncTone } from '../../hubData';

const GLYPH: Record<SyncState, ElementType> = {
  Synced: SyncIcon,
  Stale: AlertCircleOutlineIcon,
  Failed: AlertOutlineIcon,
  Unreachable: CloseCircleOutlineIcon,
};

export interface SyncPillProps {
  state: SyncState;
  system?: string;
  size?: 'Small' | 'Medium';
}

/**
 * Source-health pill. State is communicated by text + color + a distinct
 * glyph per state — never color alone.
 */
export default function SyncPill({ state, system, size = 'Small' }: SyncPillProps) {
  const Glyph = GLYPH[state];
  const label = system ? `${state} · ${system}` : state;
  return (
    <Chip size={size} tone={syncTone(state)} leadingIcon={<Glyph />}>
      {label}
    </Chip>
  );
}
