import { useEffect, useId, useMemo, useRef, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Radio from '@/components/ui/Radio/Radio';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import Select from '@/components/ui/Select/Select';
import Modal from '@/components/ui/Modal/Modal';
import PopoverMenu, {
  PopoverMenuGroup,
  PopoverMenuGroupTitle,
  PopoverMenuDivider,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import AddResourceMenu from '@/pages/AttributeManagementHub/_components/AppliesToEditor/AddResourceMenu';
import ConsolePanel from '@/components/ui/ConsolePanel/ConsolePanel';
import type {
  HubAttribute,
  ResourceConfig,
  ResourceKind,
} from '@/pages/AttributeManagementHub/hubData';
import AppliesToSection, {
  type AppliesToRowSummaryVariant,
} from './AppliesToSection';
import HoverTip from './classificationMarkings/HoverTip';
import {
  COPY,
  PRESETS,
  attributeById,
  decodeSource,
  encodeSource,
  hubAttributesToRanked,
  levelsFromAttribute,
  presetById,
  rememberedColor,
  sourceLabel,
  type Level,
  type SourceValue,
} from './classificationMarkings/classificationMarkingsData';
import styles from './ClassificationMarkingsPage.module.scss';

export interface ClassificationMarkingsPageProps {
  attribute: HubAttribute;
  clearanceAttributes: HubAttribute[];
  onBindingChange: (resource: ResourceKind, next: Partial<ResourceConfig>) => void;
  onAddResourceValue: (resource: ResourceKind, label: string) => void;
  onReadIntoFilteringChange: (value: boolean) => void;
  onAddResource: (resource: ResourceKind) => void;
  onRemoveResource: (resource: ResourceKind) => void;
  appliesToRowSummary?: AppliesToRowSummaryVariant;
  channelAlignment?: boolean;
  perResourceEditability?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
}

export default function ClassificationMarkingsPage({
  attribute,
  clearanceAttributes,
  onBindingChange,
  onAddResourceValue,
  onReadIntoFilteringChange,
  onAddResource,
  onRemoveResource,
  appliesToRowSummary = 'inline',
  channelAlignment = false,
  perResourceEditability = false,
  onDirtyChange,
}: ClassificationMarkingsPageProps) {
  const radioNs = useId().replace(/\W/g, '');
  const rankedAttributes = useMemo(
    () => hubAttributesToRanked(clearanceAttributes),
    [clearanceAttributes],
  );
  const hasRankedAttributes = rankedAttributes.length > 0;

  const [enabled, setEnabled] = useState(true);
  const [source, setSource] = useState<SourceValue>({ kind: 'preset', id: 'us' });
  const [levels, setLevels] = useState<Level[]>(presetById('us')!.levels);
  const [useAsClearance, setUseAsClearance] = useState(true);
  const [globalClassificationEnabled, setGlobalClassificationEnabled] = useState(true);
  const [globalBannerPosition, setGlobalBannerPosition] = useState<'top' | 'both'>('top');
  const [globalLevel, setGlobalLevel] = useState('UNCLASSIFIED');
  const [pendingSource, setPendingSource] = useState<SourceValue | null>(null);
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  const sourceMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClose(sourceMenuRef, sourceMenuOpen, () => setSourceMenuOpen(false));

  const markDirty = () => setDirty(true);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const isAttributeMode = source.kind === 'attribute';
  const locked = isAttributeMode;
  const linkedAttrLabel = isAttributeMode
    ? attributeById(rankedAttributes, source.id)?.label ?? 'User attribute'
    : '';

  function applySource(next: SourceValue) {
    setSource(next);
    if (next.kind === 'preset') {
      const preset = presetById(next.id);
      if (preset) {
        setLevels(
          preset.levels.map((level) => ({
            ...level,
            color: level.color ?? rememberedColor(level.text),
          })),
        );
        setGlobalLevel(preset.levels[0]?.text ?? '');
      }
    } else if (next.kind === 'attribute') {
      const attr = attributeById(rankedAttributes, next.id);
      if (attr) {
        const nextLevels = levelsFromAttribute(attr);
        setLevels(nextLevels);
        setGlobalLevel(nextLevels[0]?.text ?? '');
      }
    }
    setPendingSource(null);
    markDirty();
  }

  function selectSource(raw: string) {
    setSourceMenuOpen(false);
    const next = decodeSource(raw);
    if (encodeSource(next) === encodeSource(source)) return;
    if (levels.length === 0) {
      applySource(next);
      return;
    }
    setPendingSource(next);
  }

  function updateLevel(id: string, patch: Partial<Level>) {
    setLevels((prev) => prev.map((level) => (level.id === id ? { ...level, ...patch } : level)));
    markDirty();
  }

  function deleteLevel(id: string) {
    setLevels((prev) => prev.filter((level) => level.id !== id));
    markDirty();
  }

  function addLevel() {
    setLevels((prev) => [
      ...prev,
      { id: `new-${prev.length + 1}-${prev.length}`, text: '', color: null },
    ]);
    if (source.kind === 'preset') {
      setSource({ kind: 'custom', id: null });
    }
    markDirty();
  }

  const resolvedGlobalLevel = levels.some((level) => level.text === globalLevel)
    ? globalLevel
    : (levels[0]?.text ?? '');

  return (
    <div className={styles['markings']}>
      <div className={styles['markings__page']}>
        <section className={styles['markings__card']}>
          <div className={styles['markings__field']}>
            <div className={[styles['markings__label'], styles['markings__label--with-radios']].join(' ')}>
              {COPY.enableLabel}
            </div>
            <div className={styles['markings__control']}>
              <div className={styles['markings__radios']}>
                <Radio
                  className={styles['markings__radio']}
                  name={`${radioNs}-enabled`}
                  checked={enabled}
                  onChange={() => {
                    setEnabled(true);
                    markDirty();
                  }}
                >
                  True
                </Radio>
                <Radio
                  className={styles['markings__radio']}
                  name={`${radioNs}-enabled`}
                  checked={!enabled}
                  onChange={() => {
                    setEnabled(false);
                    markDirty();
                  }}
                >
                  False
                </Radio>
              </div>
              <p className={styles['markings__help']}>{COPY.enableHelp}</p>
            </div>
          </div>

          {enabled && (
            <>
              <div className={styles['markings__field']}>
                <span className={styles['markings__label']} id="levels-source-label">
                  {COPY.sourceLabel}
                </span>
                <div className={styles['markings__control']}>
                  <div className={styles['markings__select-wrap']} ref={sourceMenuRef}>
                    <button
                      type="button"
                      id="levels-source"
                      className={styles['markings__source-trigger']}
                      aria-labelledby="levels-source-label levels-source"
                      aria-haspopup="listbox"
                      aria-expanded={sourceMenuOpen}
                      onClick={() => setSourceMenuOpen((open) => !open)}
                    >
                      <span className={styles['markings__source-trigger-label']}>
                        {sourceLabel(source, rankedAttributes)}
                      </span>
                      <Icon size="12" glyph={<ChevronDownIcon />} />
                    </button>

                    {sourceMenuOpen && (
                      <div className={styles['markings__source-menu']} role="listbox">
                        <PopoverMenu className={styles['markings__source-popover']}>
                          <PopoverMenuGroup aria-label={COPY.sourceGroupPresets}>
                            <PopoverMenuGroupTitle>{COPY.sourceGroupPresets}</PopoverMenuGroupTitle>
                            {PRESETS.map((preset) => (
                              <MenuItem
                                key={preset.id}
                                leadingElement={false}
                                label={preset.label}
                                active={source.kind === 'preset' && source.id === preset.id}
                                trailingElement={
                                  source.kind === 'preset' && source.id === preset.id
                                }
                                onClick={() => selectSource(`preset:${preset.id}`)}
                              />
                            ))}
                            <MenuItem
                              leadingElement={false}
                              label={COPY.sourceOptionCustom}
                              active={source.kind === 'custom'}
                              trailingElement={source.kind === 'custom'}
                              onClick={() => selectSource('custom')}
                            />
                          </PopoverMenuGroup>

                          <PopoverMenuDivider />

                          <PopoverMenuGroup aria-label={COPY.sourceGroupAttributes}>
                            <PopoverMenuGroupTitle>
                              {COPY.sourceGroupAttributes}
                            </PopoverMenuGroupTitle>
                            {hasRankedAttributes ? (
                              rankedAttributes.map((attr) => (
                                <MenuItem
                                  key={attr.id}
                                  leadingElement={false}
                                  label={attr.label}
                                  active={
                                    source.kind === 'attribute' && source.id === attr.id
                                  }
                                  trailingElement={
                                    source.kind === 'attribute' && source.id === attr.id
                                  }
                                  onClick={() => selectSource(`attribute:${attr.id}`)}
                                />
                              ))
                            ) : (
                              <MenuItem
                                leadingElement={false}
                                label={COPY.sourceEmptyTitle}
                                disabled
                                onClick={() => undefined}
                              />
                            )}
                          </PopoverMenuGroup>
                        </PopoverMenu>
                      </div>
                    )}
                  </div>
                  <p className={styles['markings__help']}>{COPY.sourceHelp}</p>

                  {isAttributeMode ? (
                    <p className={styles['markings__help']}>
                      {COPY.clearanceLinkedHelp}{' '}
                      <span className={styles['markings__link']}>{COPY.clearanceHelpLink}</span>
                    </p>
                  ) : (
                    <div className={styles['markings__suboption']}>
                      <Checkbox
                        checked={useAsClearance}
                        onChange={(e) => {
                          setUseAsClearance(e.target.checked);
                          markDirty();
                        }}
                      >
                        {COPY.clearanceLabel}
                      </Checkbox>
                      <p className={styles['markings__help']}>{COPY.clearanceHelp}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>

        {enabled && (
          <section className={styles['markings__card']}>
            <div className={styles['markings__card-head']}>
              <div className={styles['markings__card-head-text']}>
                <h2 className={styles['markings__card-title']}>{COPY.levelsTitle}</h2>
                <p className={styles['markings__card-subtitle']}>{COPY.levelsHelp}</p>
              </div>

              {isAttributeMode && (
                <>
                  <span id="markings-linked-desc" className={styles['markings__sr-only']}>
                    {`${COPY.levelsNoticeLinkedPrefix} “${linkedAttrLabel}”. ${COPY.levelsNoticeLinkedTail}`}
                  </span>
                  <HoverTip
                    align="end"
                    label={`${COPY.levelsNoticeLinkedPrefix} “${linkedAttrLabel}”`}
                    hint={COPY.levelsNoticeLinkedTail}
                  >
                    <Button
                      emphasis="Tertiary"
                      size="Small"
                      aria-describedby="markings-linked-desc"
                      trailingIcon={<Icon size="16" glyph={<OpenInNewIcon />} />}
                      onClick={() => undefined}
                    >
                      {COPY.levelsNoticeLinkedLink}
                    </Button>
                  </HoverTip>
                </>
              )}
            </div>

            <div className={styles['markings__card-body']}>
              <div className={styles['markings__table']} role="table">
                <div className={styles['markings__thead']} role="row">
                  <div className={styles['markings__th-handle']} />
                  <div className={styles['markings__th']} role="columnheader">
                    {COPY.levelsColText}
                  </div>
                  <div className={styles['markings__th']} role="columnheader">
                    {COPY.levelsColColor}
                  </div>
                  <div className={styles['markings__th']} role="columnheader">
                    {COPY.levelsColRank}
                  </div>
                  <div className={styles['markings__th-actions']} />
                </div>

                {levels.length === 0 && (
                  <div className={styles['markings__empty']}>{COPY.levelsEmptyCustom}</div>
                )}

                {levels.map((level, index) => (
                  <div
                    key={level.id}
                    className={[
                      styles['markings__row'],
                      level.color == null ? styles['markings__row--warn'] : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    role="row"
                  >
                    <div className={styles['markings__cell-handle']}>
                      {locked ? (
                        <span
                          className={styles['markings__lock']}
                          title={COPY.lockTooltip}
                          aria-label={COPY.lockAria}
                        >
                          <Icon size="16" glyph={<LockOutlineIcon />} />
                        </span>
                      ) : (
                        <span className={styles['markings__drag']} aria-hidden="true">
                          <Icon size="16" glyph={<DragVerticalIcon />} />
                        </span>
                      )}
                    </div>

                    <div className={styles['markings__cell']} role="cell">
                      {locked ? (
                        <span className={styles['markings__text-locked']} aria-readonly="true">
                          {level.text}
                        </span>
                      ) : (
                        <input
                          className={styles['markings__input']}
                          value={level.text}
                          placeholder="Level name"
                          aria-label={`Level ${index + 1} text`}
                          onChange={(e) => updateLevel(level.id, { text: e.target.value })}
                        />
                      )}
                    </div>

                    <div className={styles['markings__cell']} role="cell">
                      {level.color ? (
                        <label className={styles['markings__color']}>
                          <input
                            type="color"
                            className={styles['markings__swatch-input']}
                            value={level.color}
                            aria-label={`Color for ${level.text || `level ${index + 1}`}`}
                            onChange={(e) => updateLevel(level.id, { color: e.target.value })}
                          />
                          <span
                            className={styles['markings__swatch']}
                            style={{ background: level.color }}
                            aria-hidden="true"
                          />
                          <span className={styles['markings__hex']}>
                            {level.color.toUpperCase()}
                          </span>
                        </label>
                      ) : (
                        <button
                          type="button"
                          className={styles['markings__set-color']}
                          onClick={() =>
                            updateLevel(level.id, {
                              color: rememberedColor(level.text) ?? '#3F4350',
                            })
                          }
                        >
                          <Icon size="12" glyph={<AlertOutlineIcon />} />
                          {COPY.setColor}
                        </button>
                      )}
                    </div>

                    <div className={styles['markings__cell']} role="cell">
                      <span className={styles['markings__rank']}>{index + 1}</span>
                      {level.color == null && (
                        <span className={styles['markings__needs-color']}>
                          {COPY.rowNeedsColor}
                        </span>
                      )}
                    </div>

                    <div className={styles['markings__cell-actions']}>
                      {!locked && (
                        <IconButton
                          size="Small"
                          icon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
                          aria-label={`Delete ${level.text || `level ${index + 1}`}`}
                          onClick={() => deleteLevel(level.id)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!locked && (
                <div className={styles['markings__add']}>
                  <Button
                    emphasis="Tertiary"
                    size="Small"
                    leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                    onClick={addLevel}
                  >
                    {COPY.levelsAdd}
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {enabled && (
          <section className={styles['markings__card']}>
            <div className={styles['markings__card-head']}>
              <div className={styles['markings__card-head-text']}>
                <h2 className={styles['markings__card-title']}>{COPY.globalTitle}</h2>
                <p className={styles['markings__card-subtitle']}>{COPY.globalSubtitle}</p>
              </div>
            </div>

            <div className={styles['markings__card-body']}>
              <div className={styles['markings__field']}>
                <div className={[styles['markings__label'], styles['markings__label--with-radios']].join(' ')}>
                  {COPY.globalEnabledLabel}
                </div>
                <div className={styles['markings__control']}>
                  <div className={styles['markings__radios']}>
                    <Radio
                      className={styles['markings__radio']}
                      name={`${radioNs}-global-classification`}
                      checked={globalClassificationEnabled}
                      onChange={() => {
                        setGlobalClassificationEnabled(true);
                        markDirty();
                      }}
                    >
                      True
                    </Radio>
                    <Radio
                      className={styles['markings__radio']}
                      name={`${radioNs}-global-classification`}
                      checked={!globalClassificationEnabled}
                      onChange={() => {
                        setGlobalClassificationEnabled(false);
                        markDirty();
                      }}
                    >
                      False
                    </Radio>
                  </div>
                  <p className={styles['markings__help']}>{COPY.globalEnabledHelp}</p>
                </div>
              </div>

              {globalClassificationEnabled && (
                <>
                  <div className={styles['markings__field']}>
                    <label className={styles['markings__label']} htmlFor="global-level">
                      {COPY.globalLevelLabel}
                    </label>
                    <div className={styles['markings__control']}>
                      <div className={styles['markings__level-select']}>
                        <span
                          className={styles['markings__swatch']}
                          style={{
                            background:
                              levels.find((level) => level.text === resolvedGlobalLevel)
                                ?.color ?? 'rgba(var(--center-channel-color-rgb), 0.24)',
                          }}
                          aria-hidden="true"
                        />
                        <Select
                          id="global-level"
                          size="Medium"
                          value={resolvedGlobalLevel}
                          aria-label={COPY.globalLevelLabel}
                          onChange={(e) => {
                            setGlobalLevel(e.target.value);
                            markDirty();
                          }}
                        >
                          {levels.map((level) => (
                            <option key={level.id} value={level.text}>
                              {level.text || `Level ${levels.indexOf(level) + 1}`}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <p className={styles['markings__help']}>{COPY.globalLevelHelp}</p>
                    </div>
                  </div>

                  <div className={styles['markings__field']}>
                    <div className={[styles['markings__label'], styles['markings__label--with-radios']].join(' ')}>
                      {COPY.globalBannerPositionLabel}
                    </div>
                    <div className={styles['markings__control']}>
                      <div className={styles['markings__radios']}>
                        <Radio
                          className={styles['markings__radio']}
                          name={`${radioNs}-banner-position`}
                          checked={globalBannerPosition === 'top'}
                          onChange={() => {
                            setGlobalBannerPosition('top');
                            markDirty();
                          }}
                        >
                          {COPY.globalBannerPositionTopOnly}
                        </Radio>
                        <Radio
                          className={styles['markings__radio']}
                          name={`${radioNs}-banner-position`}
                          checked={globalBannerPosition === 'both'}
                          onChange={() => {
                            setGlobalBannerPosition('both');
                            markDirty();
                          }}
                        >
                          {COPY.globalBannerPositionTopBottom}
                        </Radio>
                      </div>
                      <p className={styles['markings__help']}>{COPY.globalBannerPositionHelp}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        <ConsolePanel
          title="Applies to"
          subtitle="Resources this attribute applies to, and who can set the value on each."
          trailing={
            <AddResourceMenu
              applied={attribute.appliesTo.map((c) => c.resource)}
              onAdd={onAddResource}
              align="end"
              allowedResources={
                channelAlignment ? (['Channels', 'Posts'] as ResourceKind[]) : undefined
              }
            />
          }
        >
          <AppliesToSection
            attribute={attribute}
            onBindingChange={onBindingChange}
            onAddResourceValue={onAddResourceValue}
            onReadIntoFilteringChange={onReadIntoFilteringChange}
            onAddResource={onAddResource}
            onRemoveResource={onRemoveResource}
            rowSummaryVariant={appliesToRowSummary}
            channelAlignment={channelAlignment}
            perResourceEditability={perResourceEditability}
          />
        </ConsolePanel>
      </div>

      {pendingSource && (
        <div className={styles['markings__scrim']} role="presentation">
          <Modal
            size="Medium"
            title={
              pendingSource.kind === 'preset'
                ? COPY.dialogChangeTitlePreset
                : pendingSource.kind === 'custom'
                  ? COPY.dialogChangeTitleCustom
                  : COPY.dialogChangeTitleLevels
            }
            onClose={() => setPendingSource(null)}
            footer={
              <div className={styles['markings__dialog-footer']}>
                <Button emphasis="Tertiary" onClick={() => setPendingSource(null)}>
                  {COPY.dialogCancel}
                </Button>
                <Button
                  emphasis="Primary"
                  destructive={pendingSource.kind !== 'custom'}
                  onClick={() => applySource(pendingSource)}
                >
                  {pendingSource.kind === 'preset'
                    ? COPY.dialogChangeConfirmPreset
                    : pendingSource.kind === 'custom'
                      ? COPY.dialogChangeConfirmCustom
                      : COPY.dialogChangeConfirmLevels}
                </Button>
              </div>
            }
          >
            <p className={styles['markings__dialog-body']}>
              {pendingSource.kind === 'attribute' && (
                <>
                  Linking <strong>“{sourceLabel(pendingSource, rankedAttributes)}”</strong>{' '}
                  {COPY.dialogChangeBodyAttr}
                </>
              )}
              {pendingSource.kind === 'preset' && <>{COPY.dialogChangeBodyPreset}</>}
              {pendingSource.kind === 'custom' && <>{COPY.dialogChangeBodyCustom}</>}
            </p>
          </Modal>
        </div>
      )}
    </div>
  );
}
