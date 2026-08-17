import { useState } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import Icon from '@/components/ui/Icon/Icon';
import Switch from '@/components/ui/Switch/Switch';
import Select from '@/components/ui/Select/Select';
import Button from '@/components/ui/Button/Button';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import ConsoleSetting from '@/components/ui/ConsoleSetting/ConsoleSetting';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';
import ColoredRankedInputChip from '@/components/ui/ColoredRankedInputChip/ColoredRankedInputChip';
import type { ColoredRankedInputScheme } from '@/components/ui/ColoredRankedInputChip/ColoredRankedInputChip';
import LevelsList from './shared/LevelsList';
import {
  PRESETS,
  EXISTING_RANKED_ATTRIBUTES,
  existingAttrById,
} from './shared/fixtures';
import type { PresetId } from './shared/types';
import styles from './shared/shared.module.scss';

// "Reversed-Seeding Segmented Mode" — resolved design for the classification
// preset ↔ existing-attribute-linking relationship (previously flagged as an
// open question). Selecting "Link existing attribute" removes the
// Classification preset control from the page entirely rather than disabling
// it, and the Classification Levels table reads directly from the linked
// attribute with no separate mapping step.

type SourceMode = 'preset' | 'existing';

/** Cycle order for the per-row color swatch. Reuses ColoredRankedInputChip's
 * own scheme palette rather than introducing a new color-picker component —
 * "plain" is the closest existing look to an unassigned/outlined swatch. */
const SCHEME_CYCLE: ColoredRankedInputScheme[] = [
  'plain',
  'green',
  'blue',
  'red',
  'orange',
  'purple',
  'neutral',
];

const SCHEME_LABEL: Record<ColoredRankedInputScheme, string> = {
  plain: 'Unassigned',
  green: 'Green',
  blue: 'Blue',
  red: 'Red',
  orange: 'Orange',
  purple: 'Purple',
  neutral: 'Neutral',
};

function nextScheme(current: ColoredRankedInputScheme): ColoredRankedInputScheme {
  const i = SCHEME_CYCLE.indexOf(current);
  return SCHEME_CYCLE[(i + 1) % SCHEME_CYCLE.length];
}

interface LinkedAttributeSceneProps {
  /** Demo-only: simulate an org with no eligible ranked attributes yet. */
  catalogEmpty?: boolean;
}

export default function LinkedAttributeScene({
  catalogEmpty = false,
}: LinkedAttributeSceneProps) {
  const [enableMarkings, setEnableMarkings] = useState(true);
  const [presetId, setPresetId] = useState<PresetId>('united-states');
  const [sourceMode, setSourceMode] = useState<SourceMode>('existing');
  const [existingAttrId, setExistingAttrId] = useState('clearance-existing');
  const [rowColors, setRowColors] = useState<Record<string, ColoredRankedInputScheme>>({});

  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const existingAttr = existingAttrById(existingAttrId);
  const noEligibleAttrs = catalogEmpty;

  const cycleColor = (valueId: string) => {
    setRowColors((prev) => ({
      ...prev,
      [valueId]: nextScheme(prev[valueId] ?? 'plain'),
    }));
  };

  return (
    <>
      <ConsolePanel
        title="Classification Markings"
        subtitle="Configure classification levels for messages and channels in this workspace."
      >
        <ConsoleSetting label="Enable classification markings">
          <Switch
            checked={enableMarkings}
            onChange={(e) => setEnableMarkings(e.target.checked)}
          >
            {enableMarkings ? 'Enabled' : 'Disabled'}
          </Switch>
        </ConsoleSetting>

        {enableMarkings && (
          <ConsoleSetting label="Clearance requirement">
            <div className={styles['segmented']} role="group" aria-label="Clearance attribute source">
              <button
                type="button"
                className={[
                  styles['segmented__btn'],
                  sourceMode === 'preset' ? styles['segmented__btn--active'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setSourceMode('preset')}
              >
                Build from preset
              </button>
              <button
                type="button"
                className={[
                  styles['segmented__btn'],
                  sourceMode === 'existing' ? styles['segmented__btn--active'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setSourceMode('existing')}
              >
                Link existing attribute
              </button>
            </div>
          </ConsoleSetting>
        )}

        {/* ── "Build from preset" — Classification preset control lives here ── */}
        {enableMarkings && sourceMode === 'preset' && (
          <>
            <ConsoleSetting
              label="Classification preset"
              helpText="Generates the ranked levels below. Switching presets replaces the level set."
            >
              <Select
                size="Medium"
                width="fit"
                value={presetId}
                onChange={(e) => setPresetId(e.target.value as PresetId)}
                aria-label="Classification preset"
              >
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </ConsoleSetting>

            <ConsoleSetting label="Classification Levels">
              <LevelsList
                levels={preset.levels}
                emptyLabel="Custom preset — add your own ranked levels."
              />
            </ConsoleSetting>

            <StatusLine text="Classification enforcement is active using the newly created Clearance attribute." />
          </>
        )}

        {/* ── "Link existing attribute" — no Classification preset control ──── */}
        {enableMarkings && sourceMode === 'existing' && (
          <>
            <ConsoleSetting label="Existing ranked attribute">
              {noEligibleAttrs ? (
                <Select
                  size="Medium"
                  width="full"
                  value=""
                  disabled
                  aria-label="Existing ranked attribute"
                >
                  <option value="">
                    No ranked attributes found — create one in Attribute
                    Management, or switch to &quot;Build from preset.&quot;
                  </option>
                </Select>
              ) : (
                <Select
                  size="Medium"
                  width="full"
                  value={existingAttrId}
                  aria-label="Existing ranked attribute"
                  onChange={(e) => setExistingAttrId(e.target.value)}
                >
                  {EXISTING_RANKED_ATTRIBUTES.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.values.length} values, ranks 1–{a.values.length}
                    </option>
                  ))}
                </Select>
              )}
            </ConsoleSetting>

            {!noEligibleAttrs && (
              <>
                <div className={styles['linked-copy-row']}>
                  <p className={styles['linked-copy-row__text']}>
                    Levels below are read from {existingAttr.name}. Text and
                    rank cannot be edited here — update them in Attribute
                    Management.
                  </p>
                  <Button emphasis="Tertiary" size="Small" disabled>
                    Edit in Attribute Management
                  </Button>
                </div>

                <ConsoleSetting label="Classification Levels">
                  <div className={styles['locked-table']}>
                    <div className={styles['locked-table__head']}>
                      <span aria-hidden />
                      <span>Rank</span>
                      <span>Level</span>
                      <span>Color</span>
                    </div>
                    {existingAttr.values
                      .slice()
                      .sort((a, b) => a.rank - b.rank)
                      .map((v) => {
                        const scheme = rowColors[v.id] ?? 'plain';
                        return (
                          <div key={v.id} className={styles['locked-table__row']}>
                            <span className={styles['locked-table__lock']} aria-hidden>
                              <Icon size="12" glyph={<LockOutlineIcon />} />
                            </span>
                            <span className={styles['locked-table__rank']}>
                              {v.rank + 1}
                            </span>
                            <span className={styles['locked-table__label']}>
                              {v.label}
                            </span>
                            <ColoredRankedInputChip
                              label={SCHEME_LABEL[scheme]}
                              scheme={scheme}
                              onClick={() => cycleColor(v.id)}
                            />
                          </div>
                        );
                      })}
                  </div>
                </ConsoleSetting>

                <StatusLine text="Classification enforcement is active using the linked attribute." />
              </>
            )}
          </>
        )}
      </ConsolePanel>

      <ConsoleFooter saveDisabled={false} onSave={() => undefined} onCancel={() => undefined} />
    </>
  );
}

function StatusLine({ text }: { text: string }) {
  return (
    <p className={styles['status-line']}>
      <span className={styles['status-line__icon']} aria-hidden>
        <Icon size="16" glyph={<CheckCircleOutlineIcon />} />
      </span>
      {text}
    </p>
  );
}
