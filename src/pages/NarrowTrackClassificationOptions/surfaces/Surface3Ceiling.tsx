// Surface 3 — Constrained channel-classification ceiling dropdown (FR-5).
// Selector constrained to values at/below the effective ceiling; ceiling source
// shown in context. Approach A adds a "why is this disabled" affordance on
// capped values; B/C rely on the self-evident label. Identical enforcement.

import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';

import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import ConsoleSetting from '@/components/ui/ConsoleSetting/ConsoleSetting';
import Select from '@/components/ui/Select/Select';
import Icon from '@/components/ui/Icon/Icon';

import type { SurfaceScreenProps } from '../shared/types';
import {
  CLASSIFICATION_SCALE,
  SERVER_CEILING_ID,
  levelById,
} from '../shared/fixtures';
import shared from '../shared/shared.module.scss';

export default function Surface3Ceiling({ approach, state }: SurfaceScreenProps) {
  const ceiling = levelById(SERVER_CEILING_ID);
  const ceilingRank = ceiling?.rank ?? 0;

  // populated = an already-assigned channel; default = a fresh assignment;
  // posture = an at-ceiling / capped selection is shown.
  const selectedId =
    state === 'default' ? 'unclassified' : state === 'posture' ? SERVER_CEILING_ID : 'cui';

  const helpText =
    approach === 'a'
      ? `Server ceiling: ${ceiling?.label}. Values above the ceiling are disabled here and rejected if set another way.`
      : `Server ceiling: ${ceiling?.label}. You can classify at or below this level.`;

  return (
    <ConsolePanel
      title="Channel classification"
      subtitle="Set the classification for this channel. Classification cannot exceed the level set for the team or the server."
    >
      <ConsoleSetting label="Classification level" helpText={helpText}>
        <Select
          size="Medium"
          leadingIcon={<Icon size="16" glyph={<ShieldOutlineIcon />} />}
          value={selectedId}
          onChange={() => {}}
        >
          {CLASSIFICATION_SCALE.map((lvl) => {
            const capped = lvl.rank > ceilingRank;
            return (
              <option key={lvl.id} value={lvl.id} disabled={capped}>
                {lvl.label}
                {capped && approach === 'a' ? ' — above server ceiling' : ''}
              </option>
            );
          })}
        </Select>
      </ConsoleSetting>

      <ConsoleSetting label="Ceiling source">
        <span className={shared['managed-value']}>
          <span className={shared['managed-value__lock']}>
            <Icon size="12" glyph={<ShieldOutlineIcon />} />
          </span>
          Server ceiling: {ceiling?.label}
        </span>
      </ConsoleSetting>
    </ConsolePanel>
  );
}
