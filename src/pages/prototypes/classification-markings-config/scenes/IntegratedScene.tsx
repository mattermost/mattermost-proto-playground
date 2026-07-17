import { useId, useMemo, useState } from 'react';
import {
  AdminPanel,
  Radio,
  Select,
} from '@mattermost/compass-ui';
import {
  DEFAULT_APPLIED_RESOURCES,
  DEFAULT_ENFORCE_CHECKED,
  DEFAULT_LEVEL_COLOR,
  DEFAULT_RESOURCE_SETTINGS,
  PRESET_CUSTOM_ID,
  PRESET_OPTIONS,
  RANKED_USER_ATTRIBUTES,
  US_PRESET_LEVELS,
  autoMapByRank,
  getPresetLevels,
  nextLevelId,
  reRankLevels,
  type ClassificationLevel,
  type EnforceResourceKind,
  type RankMap,
  type RankedUserAttribute,
  type ResourceSpecificConfig,
} from '../classificationMarkingsData';
import EnforceResourceCheckboxes from '../components/EnforceResourceCheckboxes';
import LevelsTable from '../components/LevelsTable';
import ResourceSpecificSettings from '../components/ResourceSpecificSettings';
import styles from '../ClassificationMarkingsConfig.module.scss';

export default function IntegratedScene() {
  const radioNs = useId().replace(/\W/g, '');

  const [enabled, setEnabled] = useState(true);
  const [preset, setPreset] = useState<string>('us');
  const [levels, setLevels] = useState<ClassificationLevel[]>(US_PRESET_LEVELS);
  const [globalBanner, setGlobalBanner] = useState(true);
  const [bannerVisibility, setBannerVisibility] = useState<'top' | 'both'>(
    'top',
  );
  const [globalLevelId, setGlobalLevelId] = useState(US_PRESET_LEVELS[0].id);
  const [enforce, setEnforce] = useState(true);

  const [clearanceAttributeId, setClearanceAttributeId] =
    useState<string>('clearance');
  const [rankMap, setRankMap] = useState<RankMap>(() =>
    autoMapByRank(US_PRESET_LEVELS, RANKED_USER_ATTRIBUTES[0].values),
  );

  const [enforceResources, setEnforceResources] = useState<
    EnforceResourceKind[]
  >(DEFAULT_ENFORCE_CHECKED);
  const [appliedResources, setAppliedResources] = useState<
    EnforceResourceKind[]
  >(() => {
    const initial = [...DEFAULT_APPLIED_RESOURCES];
    for (const resource of DEFAULT_ENFORCE_CHECKED) {
      if (!initial.includes(resource)) {
        initial.push(resource);
      }
    }
    return initial;
  });
  const [resourceSettings, setResourceSettings] = useState<
    Record<EnforceResourceKind, ResourceSpecificConfig>
  >(DEFAULT_RESOURCE_SETTINGS);

  const selectedAttribute = useMemo(
    () =>
      RANKED_USER_ATTRIBUTES.find((attr) => attr.id === clearanceAttributeId) ??
      null,
    [clearanceAttributeId],
  );

  const resolvedGlobalLevelId = levels.some((level) => level.id === globalLevelId)
    ? globalLevelId
    : (levels[0]?.id ?? '');
  const globalLevel =
    levels.find((level) => level.id === resolvedGlobalLevelId) ?? levels[0];

  const syncRankMapForLevels = (
    nextLevels: ClassificationLevel[],
    attribute: RankedUserAttribute | null,
  ) => {
    if (!attribute) return;
    setRankMap(autoMapByRank(nextLevels, attribute.values));
  };

  const handleChangeText = (id: string, text: string) => {
    const next = levels.map((level) =>
      level.id === id ? { ...level, text } : level,
    );
    setLevels(next);
    syncRankMapForLevels(next, selectedAttribute);
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
    syncRankMapForLevels(nextLevels, selectedAttribute);
  };

  const handleDeleteLevel = (id: string) => {
    if (levels.length <= 1) return;
    const next = reRankLevels(levels.filter((level) => level.id !== id));
    setLevels(next);
    syncRankMapForLevels(next, selectedAttribute);
  };

  const handleAddLevel = () => {
    const next = reRankLevels([
      ...levels,
      {
        id: nextLevelId(),
        text: '',
        color: DEFAULT_LEVEL_COLOR,
        rank: levels.length + 1,
      },
    ]);
    setLevels(next);
    syncRankMapForLevels(next, selectedAttribute);
  };

  const handleClearanceAttributeChange = (value: string) => {
    setClearanceAttributeId(value);
    const attr =
      RANKED_USER_ATTRIBUTES.find((item) => item.id === value) ?? null;
    if (attr) {
      setRankMap(autoMapByRank(levels, attr.values));
    } else {
      setRankMap({});
    }
  };

  const handleChangeMapping = (levelId: string, clearanceValueId: string) => {
    setRankMap((prev) => ({ ...prev, [levelId]: clearanceValueId }));
  };

  const handleResourceSettingsChange = (
    resource: EnforceResourceKind,
    next: Partial<ResourceSpecificConfig>,
  ) => {
    setResourceSettings((prev) => ({
      ...prev,
      [resource]: { ...prev[resource], ...next },
    }));
  };

  const handleEnforceResourcesChange = (next: EnforceResourceKind[]) => {
    setEnforceResources(next);
    setAppliedResources((prev) => {
      const merged = [...prev];
      for (const resource of next) {
        if (!merged.includes(resource)) {
          merged.push(resource);
        }
      }
      return merged;
    });
  };

  const handleAddAppliedResource = (resource: EnforceResourceKind) => {
    setAppliedResources((prev) =>
      prev.includes(resource) ? prev : [...prev, resource],
    );
  };

  const handleRemoveAppliedResource = (resource: EnforceResourceKind) => {
    if (enforceResources.includes(resource)) return;
    setAppliedResources((prev) => prev.filter((item) => item !== resource));
  };

  const showClearanceMapping = enforce && selectedAttribute != null;

  return (
    <div className={styles['markings-config__body']}>
      <div className={styles['markings-config__top-settings']}>
        <div className={styles['markings-config__settings']}>
          <div className={styles['markings-config__setting']}>
            <div
              className={[
                styles['markings-config__setting-label'],
                styles['markings-config__setting-label--with-radios'],
              ].join(' ')}
            >
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

          <div
            className={[
              styles['markings-config__gated-inline'],
              !enabled ? styles['markings-config__gated-inline--disabled'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-disabled={!enabled}
          >
            <div
              className={[
                styles['markings-config__setting'],
                styles['markings-config__setting-continuation'],
              ].join(' ')}
            >
              <div className={styles['markings-config__setting-label']}>
                Classification preset
              </div>
              <div className={styles['markings-config__setting-fields']}>
                <div className={styles['markings-config__select-wrap']}>
                  <Select
                    size="Medium"
                    value={preset}
                    disabled={!enabled}
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

            <div className={styles['markings-config__setting']}>
              <div
                className={[
                  styles['markings-config__setting-label'],
                  styles['markings-config__setting-label--with-radios'],
                ].join(' ')}
              >
                Enforce classification markings
              </div>
              <div className={styles['markings-config__setting-fields']}>
                <div className={styles['markings-config__radio-row']}>
                  <Radio
                    name={`${radioNs}-enforce`}
                    value="true"
                    checked={enforce}
                    size="Medium"
                    disabled={!enabled}
                    onChange={() => setEnforce(true)}
                  >
                    True
                  </Radio>
                  <Radio
                    name={`${radioNs}-enforce`}
                    value="false"
                    checked={!enforce}
                    size="Medium"
                    disabled={!enabled}
                    onChange={() => setEnforce(false)}
                  >
                    False
                  </Radio>
                </div>
                <p className={styles['markings-config__help']}>
                  When enabled, access can be gated by users’ clearance attribute.
                </p>
                {enforce ? (
                  <>
                    <div className={styles['markings-config__nested-field']}>
                      <div className={styles['markings-config__nested-label']}>
                        Clearance attribute
                      </div>
                      <div className={styles['markings-config__select-wrap']}>
                        <Select
                          size="Medium"
                          value={clearanceAttributeId}
                          disabled={!enabled}
                          aria-label="Clearance attribute"
                          onChange={(e) =>
                            handleClearanceAttributeChange(e.target.value)
                          }
                        >
                          {RANKED_USER_ATTRIBUTES.map((attr) => (
                            <option key={attr.id} value={attr.id}>
                              {attr.name} (Ranked)
                            </option>
                          ))}
                        </Select>
                      </div>
                      <p className={styles['markings-config__help']}>
                        Must be a ranked type applied to users. After you select
                        an attribute, map it to each level in Classification
                        levels.
                      </p>
                    </div>

                    <div className={styles['markings-config__nested-field']}>
                      <EnforceResourceCheckboxes
                        checked={enforceResources}
                        onChange={handleEnforceResourcesChange}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={[
          styles['markings-config__gated'],
          !enabled ? styles['markings-config__gated--disabled'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-disabled={!enabled}
      >
        <AdminPanel
          title="Classification levels"
          subtitle={
            showClearanceMapping
              ? `Text, colors, and ${selectedAttribute.name} mapping for classification levels. Saving creates a Classification attribute from these levels.`
              : 'Text and colors for the classification levels used across the system. Saving creates a Classification attribute from these levels.'
          }
        >
          <LevelsTable
            levels={levels}
            onChangeText={handleChangeText}
            onChangeColor={handleChangeColor}
            onDelete={handleDeleteLevel}
            onAdd={handleAddLevel}
            clearanceMapping={
              showClearanceMapping
                ? {
                    attributeName: selectedAttribute.name,
                    values: selectedAttribute.values,
                    mapping: rankMap,
                    onChange: handleChangeMapping,
                  }
                : undefined
            }
          />
        </AdminPanel>

        <AdminPanel
          title="Global Classification Indicators"
          subtitle="Configure the global classification banner to be displayed at the very top of the Mattermost application."
        >
          <div className={styles['markings-config__settings']}>
            <div className={styles['markings-config__setting']}>
              <div
                className={[
                  styles['markings-config__setting-label'],
                  styles['markings-config__setting-label--with-radios'],
                ].join(' ')}
              >
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
              <div
                className={[
                  styles['markings-config__setting-label'],
                  styles['markings-config__setting-label--with-radios'],
                ].join(' ')}
              >
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
          title="Apply classification markings to"
          subtitle="Choose which resources can carry classification markings, and configure required and display settings for each."
        >
          <ResourceSpecificSettings
            resources={appliedResources}
            lockedResources={enforce ? enforceResources : []}
            settings={resourceSettings}
            onChange={handleResourceSettingsChange}
            onAdd={handleAddAppliedResource}
            onRemove={handleRemoveAppliedResource}
          />
        </AdminPanel>
      </div>
    </div>
  );
}
