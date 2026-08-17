import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import Icon from '@/components/ui/Icon/Icon';
import Switch from '@/components/ui/Switch/Switch';
import Select from '@/components/ui/Select/Select';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Radio from '@/components/ui/Radio/Radio';
import ConsoleSetting from '@/components/ui/ConsoleSetting/ConsoleSetting';
import LevelsList from './shared/LevelsList';
import { PRESETS, existingAttrById, EXISTING_RANKED_ATTRIBUTES } from './shared/fixtures';
import type { ClearanceSourceMode, PresetId } from './shared/types';
import styles from './shared/shared.module.scss';

// ─── "Classification preset" block — shared by every scene ────────────────

interface PresetControlProps {
  enableMarkings: boolean;
  onToggleMarkings: (v: boolean) => void;
  presetId: PresetId;
  onChangePreset: (id: PresetId) => void;
  /** Mockup A / B: preset no longer drives anything once "use an existing
   * attribute" is selected — surface that as an inline, clearly-labeled note
   * rather than silently resolving the open question either way. */
  showLinkNote?: boolean;
}

export function PresetControl({
  enableMarkings,
  onToggleMarkings,
  presetId,
  onChangePreset,
  showLinkNote = false,
}: PresetControlProps) {
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];

  return (
    <>
      <ConsoleSetting label="Enable classification markings">
        <Switch
          checked={enableMarkings}
          onChange={(e) => onToggleMarkings(e.target.checked)}
        >
          {enableMarkings ? 'Enabled' : 'Disabled'}
        </Switch>
      </ConsoleSetting>

      <ConsoleSetting
        label="Classification preset"
        helpText={
          showLinkNote ? (
            <span className={styles['linked-note']}>
              <span className={styles['linked-note__icon']} aria-hidden>
                <Icon size="12" glyph={<LinkVariantIcon />} />
              </span>
              <span>
                <strong>Preset does not apply when using an existing
                attribute</strong> — pending design decision. The levels below
                are shown for reference only; they aren’t generated from this
                preset while “Use an existing ranked attribute” is selected.
              </span>
            </span>
          ) : (
            'Generates the ranked levels below. Switching presets replaces the level set.'
          )
        }
      >
        <Select
          size="Medium"
          width="fit"
          value={presetId}
          disabled={!enableMarkings}
          onChange={(e) => onChangePreset(e.target.value as PresetId)}
          aria-label="Classification preset"
        >
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
      </ConsoleSetting>

      {enableMarkings && (
        <ConsoleSetting label="Levels">
          <LevelsList
            levels={preset.levels}
            emptyLabel="Custom preset — add your own ranked levels."
          />
        </ConsoleSetting>
      )}
    </>
  );
}

// ─── Baseline (shipped) "Enable clearance attribute" — checkbox only ──────

interface BaselineClearanceControlProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  presetId: PresetId;
  disabled?: boolean;
}

export function BaselineClearanceControl({
  checked,
  onChange,
  presetId,
  disabled = false,
}: BaselineClearanceControlProps) {
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];

  return (
    <ConsoleSetting
      label="Enable clearance attribute"
      helpText="Creates a new ranked user attribute named Clearance whose values always match the classification levels above, one to one. There is no picker for reusing an attribute the org already has, and no way to edit the mapping afterward."
    >
      <Checkbox checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)}>
        Enable clearance attribute
      </Checkbox>
      {checked && (
        <div className={styles['baseline-preview']}>
          <LevelsList levels={preset.levels} />
        </div>
      )}
    </ConsoleSetting>
  );
}

// ─── Mockups A + B — create-new vs. use-existing radio choice ─────────────

interface ClearanceLinkingControlProps {
  enabled: boolean;
  onToggleEnabled: (v: boolean) => void;
  mode: ClearanceSourceMode;
  onChangeMode: (m: ClearanceSourceMode) => void;
  presetId: PresetId;
  existingAttrId: string;
  onChangeExistingAttr: (id: string) => void;
  /** Mockup B renames the control; Mockup A keeps the shipped name. */
  controlLabel?: string;
  disabled?: boolean;
}

export function ClearanceLinkingControl({
  enabled,
  onToggleEnabled,
  mode,
  onChangeMode,
  presetId,
  existingAttrId,
  onChangeExistingAttr,
  controlLabel = 'Enable clearance attribute',
  disabled = false,
}: ClearanceLinkingControlProps) {
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const existingAttr = existingAttrById(existingAttrId);

  return (
    <>
      <ConsoleSetting
        label={controlLabel}
        helpText="Requires users to have a matching ranked attribute before they can access classified content."
      >
        <Switch
          checked={enabled}
          disabled={disabled}
          onChange={(e) => onToggleEnabled(e.target.checked)}
        >
          {enabled ? 'Enabled' : 'Disabled'}
        </Switch>
      </ConsoleSetting>

      {enabled && (
        <ConsoleSetting label="Attribute source">
          <div className={styles['radio-group']}>
            <div
              className={[
                styles['radio-option'],
                mode === 'create-new' ? styles['radio-option--selected'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles['radio-option__label']}>
                <Radio
                  name={`clearance-source-${controlLabel}`}
                  checked={mode === 'create-new'}
                  disabled={disabled}
                  onChange={() => onChangeMode('create-new')}
                >
                  <span>
                    <span className={styles['radio-option__title']}>
                      Create a new Clearance attribute from these levels
                    </span>
                    <p className={styles['radio-option__body']}>
                      Adds a ranked user attribute named Clearance with one
                      value per level above, kept in sync one to one with the
                      preset.
                    </p>
                  </span>
                </Radio>
              </div>
              {mode === 'create-new' && (
                <div className={styles['radio-option__detail']}>
                  <LevelsList levels={preset.levels} />
                </div>
              )}
            </div>

            <div
              className={[
                styles['radio-option'],
                mode === 'use-existing' ? styles['radio-option--selected'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles['radio-option__label']}>
                <Radio
                  name={`clearance-source-${controlLabel}`}
                  checked={mode === 'use-existing'}
                  disabled={disabled}
                  onChange={() => onChangeMode('use-existing')}
                >
                  <span>
                    <span className={styles['radio-option__title']}>
                      Use an existing ranked attribute
                    </span>
                    <p className={styles['radio-option__body']}>
                      Reuse a ranked attribute the org already has instead of
                      creating a dedicated one.
                    </p>
                  </span>
                </Radio>
              </div>
              {mode === 'use-existing' && (
                <div className={styles['radio-option__detail']}>
                  <div className={styles['existing-picker']}>
                    <Select
                      size="Medium"
                      width="full"
                      value={existingAttrId}
                      disabled={disabled}
                      aria-label="Existing ranked attribute"
                      onChange={(e) => onChangeExistingAttr(e.target.value)}
                    >
                      {EXISTING_RANKED_ATTRIBUTES.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (Ranked)
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className={styles['existing-values']}>
                    <div className={styles['existing-values__head']}>
                      <p className={styles['existing-values__title']}>
                        {existingAttr.name} values
                      </p>
                      <p className={styles['existing-values__hint']}>
                        Read-only here — no separate mapping step
                      </p>
                    </div>
                    <LevelsList
                      levels={existingAttr.values.map((v) => ({
                        id: v.id,
                        label: v.label,
                        rank: v.rank,
                      }))}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </ConsoleSetting>
      )}
    </>
  );
}
