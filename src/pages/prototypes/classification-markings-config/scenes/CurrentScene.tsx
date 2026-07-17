import { useId, useState } from 'react';
import {
  AdminPanel,
  Radio,
  SectionNotice,
  Select,
} from '@mattermost/compass-ui';
import {
  DEFAULT_ENFORCE_RESOURCES,
  DEFAULT_LEVEL_COLOR,
  EXISTING_ATTRIBUTE_OPTIONS,
  PRESET_CUSTOM_ID,
  PRESET_OPTIONS,
  US_PRESET_LEVELS,
  getPresetLevels,
  nextLevelId,
  reRankLevels,
  type ClassificationLevel,
  type ClassificationSource,
} from '../classificationMarkingsData';
import EnforcingAttributeRow from '../components/EnforcingAttributeRow';
import LevelsTable from '../components/LevelsTable';
import ResourceEnforceList from '../components/ResourceEnforceList';
import SourceChoiceCards from '../components/SourceChoiceCards';
import styles from '../ClassificationMarkingsConfig.module.scss';

export default function CurrentScene() {
  const radioNs = useId().replace(/\W/g, '');

  const [enabled, setEnabled] = useState(true);
  const [source, setSource] = useState<ClassificationSource>('preset');
  const [preset, setPreset] = useState<string>('us');
  const [existingAttribute, setExistingAttribute] =
    useState<string>('classification');
  const [levels, setLevels] = useState<ClassificationLevel[]>(US_PRESET_LEVELS);
  const [globalBanner, setGlobalBanner] = useState(true);
  const [bannerVisibility, setBannerVisibility] = useState<'top' | 'both'>(
    'top',
  );
  const [globalLevelId, setGlobalLevelId] = useState(US_PRESET_LEVELS[0].id);
  const [enforce, setEnforce] = useState(true);
  const [resources] = useState(DEFAULT_ENFORCE_RESOURCES);

  const resolvedGlobalLevelId = levels.some((level) => level.id === globalLevelId)
    ? globalLevelId
    : (levels[0]?.id ?? '');
  const globalLevel =
    levels.find((level) => level.id === resolvedGlobalLevelId) ?? levels[0];

  const handleChangeText = (id: string, text: string) => {
    setLevels((prev) =>
      prev.map((level) => (level.id === id ? { ...level, text } : level)),
    );
  };

  const handleChangeColor = (id: string, color: string) => {
    setLevels((prev) =>
      prev.map((level) => (level.id === id ? { ...level, color } : level)),
    );
  };

  const handlePresetChange = (presetId: string) => {
    setPreset(presetId);
    if (presetId === PRESET_CUSTOM_ID) return;
    const nextLevels = getPresetLevels(presetId);
    if (!nextLevels) return;
    setLevels(nextLevels);
    setGlobalLevelId(nextLevels[0]?.id ?? '');
  };

  const handleDeleteLevel = (id: string) => {
    setLevels((prev) => {
      if (prev.length <= 1) return prev;
      return reRankLevels(prev.filter((level) => level.id !== id));
    });
  };

  const handleAddLevel = () => {
    setLevels((prev) =>
      reRankLevels([
        ...prev,
        {
          id: nextLevelId(),
          text: '',
          color: DEFAULT_LEVEL_COLOR,
          rank: prev.length + 1,
        },
      ]),
    );
  };

  return (
    <div className={styles['markings-config__body']}>
      <div className={styles['markings-config__top-settings']}>
        <div className={styles['markings-config__settings']}>
          <div className={styles['markings-config__setting']}>
            <div className={styles['markings-config__setting-label']}>
              Enable classification markings
            </div>
            <div className={styles['markings-config__setting-fields']}>
              <div className={styles['markings-config__radio-row']}>
                <Radio
                  name={`${radioNs}-enabled`}
                  value="true"
                  checked={enabled}
                  size="Medium"
                  onChange={() => setEnabled(true)}
                >
                  True
                </Radio>
                <Radio
                  name={`${radioNs}-enabled`}
                  value="false"
                  checked={!enabled}
                  size="Medium"
                  onChange={() => setEnabled(false)}
                >
                  False
                </Radio>
              </div>
              <p className={styles['markings-config__help']}>
                Use this to enable classification markings as banners at the
                system and channel level. You can select text and colors for
                your banner, as well as set a default option for consistency.
              </p>
            </div>
          </div>

          <div className={styles['markings-config__setting']}>
            <div className={styles['markings-config__setting-label']}>
              Classification source
            </div>
            <div className={styles['markings-config__setting-fields']}>
              <SourceChoiceCards value={source} onChange={setSource} />
            </div>
          </div>

          {source === 'preset' ? (
            <div className={styles['markings-config__setting']}>
              <div className={styles['markings-config__setting-label']}>
                Classification preset
              </div>
              <div className={styles['markings-config__setting-fields']}>
                <div className={styles['markings-config__select-wrap']}>
                  <Select
                    size="Medium"
                    label="Preset"
                    value={preset}
                    aria-label="Classification preset"
                    onChange={(e) => handlePresetChange(e.target.value)}
                  >
                    {PRESET_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <p className={styles['markings-config__help']}>
                  Select a classification preset based on your country
                  affiliation, or pick custom to define your own levels below.
                </p>
              </div>
            </div>
          ) : (
            <div className={styles['markings-config__setting']}>
              <div className={styles['markings-config__setting-label']}>
                Existing attribute
              </div>
              <div className={styles['markings-config__setting-fields']}>
                <div className={styles['markings-config__select-wrap']}>
                  <Select
                    size="Medium"
                    label="Attribute"
                    value={existingAttribute}
                    aria-label="Existing classification attribute"
                    onChange={(e) => setExistingAttribute(e.target.value)}
                  >
                    {EXISTING_ATTRIBUTE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <p className={styles['markings-config__help']}>
                  Choose a ranked attribute already defined in your system to
                  drive classification markings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AdminPanel
        title="Classification levels"
        subtitle="Text and colors for the classification levels used across the system. Saving creates a Classification attribute from these levels."
      >
        <LevelsTable
          levels={levels}
          onChangeText={handleChangeText}
          onChangeColor={handleChangeColor}
          onDelete={handleDeleteLevel}
          onAdd={handleAddLevel}
        />
      </AdminPanel>

      <AdminPanel
        title="Global Classification Indicators"
        subtitle="Configure the global classification banner to be displayed at the very top of the Mattermost application."
      >
        <div className={styles['markings-config__settings']}>
          <div className={styles['markings-config__setting']}>
            <div className={styles['markings-config__setting-label']}>
              Global Classification Banner
            </div>
            <div className={styles['markings-config__setting-fields']}>
              <div className={styles['markings-config__radio-row']}>
                <Radio
                  name={`${radioNs}-banner`}
                  value="true"
                  checked={globalBanner}
                  size="Medium"
                  onChange={() => setGlobalBanner(true)}
                >
                  True
                </Radio>
                <Radio
                  name={`${radioNs}-banner`}
                  value="false"
                  checked={!globalBanner}
                  size="Medium"
                  onChange={() => setGlobalBanner(false)}
                >
                  False
                </Radio>
              </div>
              <p className={styles['markings-config__help']}>
                Displays a global banner for the system-wide classification.
              </p>
            </div>
          </div>

          <div className={styles['markings-config__setting']}>
            <div className={styles['markings-config__setting-label']}>
              Banner visibility
            </div>
            <div className={styles['markings-config__setting-fields']}>
              <div className={styles['markings-config__radio-row']}>
                <Radio
                  name={`${radioNs}-visibility`}
                  value="top"
                  checked={bannerVisibility === 'top'}
                  size="Medium"
                  onChange={() => setBannerVisibility('top')}
                >
                  Top only
                </Radio>
                <Radio
                  name={`${radioNs}-visibility`}
                  value="both"
                  checked={bannerVisibility === 'both'}
                  size="Medium"
                  onChange={() => setBannerVisibility('both')}
                >
                  Top and bottom
                </Radio>
              </div>
            </div>
          </div>

          <div className={styles['markings-config__setting']}>
            <div className={styles['markings-config__setting-label']}>
              Global classification level
            </div>
            <div className={styles['markings-config__setting-fields']}>
              <div className={styles['markings-config__level-select']}>
                {globalLevel ? (
                  <span
                    className={styles['markings-config__level-swatch']}
                    style={{ backgroundColor: globalLevel.color }}
                    aria-hidden
                  />
                ) : null}
                <div className={styles['markings-config__level-select-field']}>
                  <Select
                    size="Medium"
                    label="Level"
                    value={resolvedGlobalLevelId}
                    aria-label="Global classification level"
                    onChange={(e) => setGlobalLevelId(e.target.value)}
                  >
                    {levels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.text || `Level ${level.rank}`}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <p className={styles['markings-config__help']}>
                Select the level at which your entire Mattermost server is
                required to operate.
              </p>
            </div>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel
        title="Classification Enforcement"
        subtitle="Configure which resources utilize classification for enforcement."
      >
        <div className={styles['markings-config__enforce-stack']}>
          <div className={styles['markings-config__settings']}>
            <div className={styles['markings-config__setting']}>
              <div className={styles['markings-config__setting-label']}>
                Enforce classification markings
              </div>
              <div className={styles['markings-config__setting-fields']}>
                <div className={styles['markings-config__radio-row']}>
                  <Radio
                    name={`${radioNs}-enforce`}
                    value="true"
                    checked={enforce}
                    size="Medium"
                    onChange={() => setEnforce(true)}
                  >
                    True
                  </Radio>
                  <Radio
                    name={`${radioNs}-enforce`}
                    value="false"
                    checked={!enforce}
                    size="Medium"
                    onChange={() => setEnforce(false)}
                  >
                    False
                  </Radio>
                </div>
                <p className={styles['markings-config__help']}>
                  Enabling enforcement of classification markings will create a
                  corresponding Clearance attribute and will require
                  implementing a Membership policy where users&apos; defined
                  Clearance level will determine their access permissions.
                </p>
              </div>
            </div>
          </div>

          {enforce ? (
            <>
              <SectionNotice
                type="Info"
                title="Enforcement adds a Clearance attribute and a membership policy"
                description="Turning this on creates a Clearance user attribute and a membership policy that compares each user's clearance against a resource's classification to determine access. Choose the resources to enforce below."
              />
              <EnforcingAttributeRow levels={levels} />
              <ResourceEnforceList resources={resources} />
            </>
          ) : null}
        </div>
      </AdminPanel>
    </div>
  );
}
