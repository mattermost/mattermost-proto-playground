import { useEffect, useRef, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';

import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import ConsoleFooter from '@/components/ui/ConsoleFooter/ConsoleFooter';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
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
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { useOutsideClose } from '@/hooks/useOutsideClose';

import HoverTip from './_components/HoverTip';

import avatarLeonard from '@/assets/avatars/Leonard Riley.png';

import {
  CM_SIDEBAR_CATEGORIES,
  PRESETS,
  RANKED_ATTRIBUTES,
  CLEARANCE_LEVEL_DRIFTED,
  COPY,
  presetById,
  attributeById,
  levelsFromAttribute,
  rememberedColor,
  type Level,
  type SourceValue,
} from './classificationData';
import styles from './ClassificationMarkingsConfig.module.scss';

/* ------------------------------------------------------------------ *
 * Scenes
 * ------------------------------------------------------------------ */

type SceneId = 'preset' | 'linked' | 'drift' | 'broken' | 'no-attrs';

const SCENES = [
  { id: 'preset', label: 'Preset' },
  { id: 'linked', label: 'Linked attribute' },
  { id: 'drift', label: 'Drift' },
  { id: 'broken', label: 'Broken link' },
  { id: 'no-attrs', label: 'No ranked attributes' },
];

/** Serialized value for the source <select>. */
function encodeSource(s: SourceValue): string {
  return s.kind === 'custom' ? 'custom' : `${s.kind}:${s.id}`;
}
function decodeSource(raw: string): SourceValue {
  if (raw === 'custom') return { kind: 'custom', id: null };
  const [kind, id] = raw.split(':');
  return { kind: kind as SourceValue['kind'], id: id ?? null };
}

function sourceLabel(s: SourceValue): string {
  if (s.kind === 'custom') return COPY.sourceOptionCustom;
  if (s.kind === 'preset') return presetById(s.id)?.label ?? '';
  return attributeById(s.id)?.label ?? '';
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default function ClassificationMarkingsConfig() {
  const { setCenterSlot } = usePrototypeChrome();
  const [scene, setScene] = useState<SceneId>('preset');

  const [enabled, setEnabled] = useState(true);
  const [source, setSource] = useState<SourceValue>({ kind: 'preset', id: 'us' });
  const [levels, setLevels] = useState<Level[]>(presetById('us')!.levels);
  const [useAsClearance, setUseAsClearance] = useState(true);

  const [globalBanner, setGlobalBanner] = useState(true);
  const [bannerVisibility, setBannerVisibility] = useState('top');
  const [globalLevel, setGlobalLevel] = useState('UNCLASSIFIED');

  const [pendingSource, setPendingSource] = useState<SourceValue | null>(null);
  const [activeNav, setActiveNav] = useState('classification-markings');
  /** Real state, not scene-derived — choosing any new source resolves the break. */
  const [linkBroken, setLinkBroken] = useState(false);

  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);
  const sourceMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClose(sourceMenuRef, sourceMenuOpen, () => setSourceMenuOpen(false));

  /* Scene → state. Each scene is a distinct configuration worth reviewing. */
  useEffect(() => {
    setLinkBroken(scene === 'broken');
    if (scene === 'preset') {
      setSource({ kind: 'preset', id: 'us' });
      setLevels(presetById('us')!.levels);
      setUseAsClearance(true);
    } else if (scene === 'linked') {
      setSource({ kind: 'attribute', id: 'clearance-level' });
      setLevels(levelsFromAttribute(attributeById('clearance-level')!));
    } else if (scene === 'drift') {
      setSource({ kind: 'attribute', id: 'clearance-level' });
      setLevels(levelsFromAttribute(CLEARANCE_LEVEL_DRIFTED));
    } else if (scene === 'broken') {
      setSource({ kind: 'attribute', id: 'clearance-level' });
      setLevels(levelsFromAttribute(attributeById('clearance-level')!));
    } else if (scene === 'no-attrs') {
      setSource({ kind: 'preset', id: 'us' });
      setLevels(presetById('us')!.levels);
      setUseAsClearance(false);
    }
  }, [scene]);

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={SCENES}
        activeId={scene}
        onChange={(id) => setScene(id as SceneId)}
        ariaLabel="Classification markings scenes"
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, setCenterSlot]);

  /* ---------------- derived ---------------- */

  const isAttributeMode = source.kind === 'attribute';
  /* A break only exists while a linked attribute is still the declared source. */
  const isBroken = linkBroken && isAttributeMode;
  const hasRankedAttributes = scene !== 'no-attrs';
  /** Locked = names and order come from somewhere else. Colors never lock. */
  const locked = isAttributeMode;

  const linkedAttrLabel = isAttributeMode
    ? (attributeById(source.id)?.label ?? 'Clearance level')
    : '';

  /* ---------------- handlers ---------------- */

  function selectSource(raw: string) {
    setSourceMenuOpen(false);
    const next = decodeSource(raw);
    // Re-picking the current source is a no-op, not a destructive change.
    if (encodeSource(next) === encodeSource(source)) return;
    if (levels.length === 0) {
      applySource(next);
      return;
    }
    setPendingSource(next);
  }

  function applySource(next: SourceValue) {
    setSource(next);
    // Declaring a new source resolves any broken link, whatever the new source is.
    setLinkBroken(false);
    if (next.kind === 'preset') {
      // Seed semantics: copy the preset's rows in, restoring remembered colors.
      const preset = presetById(next.id);
      if (preset) {
        setLevels(
          preset.levels.map((l) => ({ ...l, color: l.color ?? rememberedColor(l.text) })),
        );
      }
    } else if (next.kind === 'attribute') {
      const attr = attributeById(next.id);
      if (attr) setLevels(levelsFromAttribute(attr));
    }
    // Custom keeps the current rows and simply unlocks them.
    setPendingSource(null);
  }

  function updateLevel(id: string, patch: Partial<Level>) {
    setLevels((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function deleteLevel(id: string) {
    setLevels((prev) => prev.filter((l) => l.id !== id));
  }

  function addLevel() {
    setLevels((prev) => [
      ...prev,
      { id: `new-${prev.length + 1}-${prev.length}`, text: '', color: null },
    ]);
  }

  /** Adopt the frozen last-known-good rows (colors included) as an editable list. */
  function convertToCustom() {
    setSource({ kind: 'custom', id: null });
    setLinkBroken(false);
  }

  /* ---------------- render ---------------- */

  return (
    <div className={styles['cm']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="leonard.riley"
        categories={CM_SIDEBAR_CATEGORIES}
        activeItemId={activeNav}
        onItemClick={setActiveNav}
      />

      <div className={styles['cm__center']}>
        <ConsolePageHeader title={COPY.pageTitle} />

        <div className={styles['cm__scroll']}>
          <div className={styles['cm__page']}>
            {/* ───────── Section 1 — markings + levels source ───────── */}
            <section className={styles['cm__card']}>
              <div className={styles['cm__field']}>
                <div className={styles['cm__label']}>{COPY.enableLabel}</div>
                <div className={styles['cm__control']}>
                  <div className={styles['cm__radios']}>
                    <Radio
                      name="enable"
                      checked={enabled}
                      onChange={() => setEnabled(true)}
                    >
                      True
                    </Radio>
                    <Radio
                      name="enable"
                      checked={!enabled}
                      onChange={() => setEnabled(false)}
                    >
                      False
                    </Radio>
                  </div>
                  <p className={styles['cm__help']}>{COPY.enableHelp}</p>
                </div>
              </div>

              {enabled && (
                <>
                  <div className={styles['cm__divider']} />

                  {/* The one control that declares where levels come from. */}
                  <div className={styles['cm__field']}>
                    <span className={styles['cm__label']} id="levels-source-label">
                      {COPY.sourceLabel}
                    </span>
                    <div className={styles['cm__control']}>
                      <div className={styles['cm__select-wrap']} ref={sourceMenuRef}>
                        <button
                          type="button"
                          id="levels-source"
                          className={styles['cm__source-trigger']}
                          aria-labelledby="levels-source-label levels-source"
                          aria-haspopup="listbox"
                          aria-expanded={sourceMenuOpen}
                          onClick={() => setSourceMenuOpen((o) => !o)}
                        >
                          <span className={styles['cm__source-trigger-label']}>
                            {sourceLabel(source)}
                          </span>
                          <Icon size="12" glyph={<ChevronDownIcon />} />
                        </button>

                        {sourceMenuOpen && (
                          <div className={styles['cm__source-menu']} role="listbox">
                            <PopoverMenu>
                              <PopoverMenuGroup aria-label={COPY.sourceGroupPresets}>
                                <PopoverMenuGroupTitle>
                                  {COPY.sourceGroupPresets}
                                </PopoverMenuGroupTitle>
                                {PRESETS.map((p) => (
                                  <MenuItem
                                    key={p.id}
                                    leadingElement={false}
                                    label={p.label}
                                    active={source.kind === 'preset' && source.id === p.id}
                                    trailingElement={
                                      source.kind === 'preset' && source.id === p.id
                                    }
                                    onClick={() => selectSource(`preset:${p.id}`)}
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
                                  RANKED_ATTRIBUTES.map((a) => (
                                    <MenuItem
                                      key={a.id}
                                      leadingElement={false}
                                      label={a.label}
                                      active={
                                        source.kind === 'attribute' && source.id === a.id
                                      }
                                      trailingElement={
                                        source.kind === 'attribute' && source.id === a.id
                                      }
                                      onClick={() => selectSource(`attribute:${a.id}`)}
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
                      <p className={styles['cm__help']}>{COPY.sourceHelp}</p>
                      {!hasRankedAttributes && (
                        <p className={styles['cm__help']}>
                          No ranked user attributes exist yet.{' '}
                          <a className={styles['cm__link']} href="#user-attributes">
                            Create one in User attributes
                          </a>
                        </p>
                      )}

                      {/* Enforcement lives with the source it depends on, not in a
                          section of its own. In attribute mode there is nothing to
                          create — the source already is a user attribute — so the
                          option collapses to a line of help text. */}
                      {isAttributeMode ? (
                        <p className={styles['cm__help']}>
                          {COPY.clearanceLinkedHelp}{' '}
                          <a className={styles['cm__link']} href="#membership-policy">
                            {COPY.clearanceHelpLink}
                          </a>
                        </p>
                      ) : (
                        <div className={styles['cm__suboption']}>
                          <Checkbox
                            checked={useAsClearance}
                            onChange={(e) => setUseAsClearance(e.target.checked)}
                          >
                            {COPY.clearanceLabel}
                          </Checkbox>
                          <p className={styles['cm__help']}>
                            {COPY.clearanceHelp}{' '}
                            <a className={styles['cm__link']} href="#membership-policy">
                              {COPY.clearanceHelpLink}
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* No notices here by design. A level with no color is already
                      self-evident in the table (warning row + "Set color" + "Needs
                      color"), and upstream changes to the attribute belong on the
                      attribute page or the policy that consumes it — not on the page
                      that only defines the list. */}
                </>
              )}
            </section>

            {/* ───────── Section 2 — classification levels ───────── */}
            {enabled && (
              <section className={styles['cm__card']}>
                <div className={styles['cm__card-head']}>
                  <div className={styles['cm__card-head-text']}>
                    <h2 className={styles['cm__card-title']}>{COPY.levelsTitle}</h2>
                    <p className={styles['cm__card-subtitle']}>{COPY.levelsHelp}</p>
                  </div>

                  {/* Where the levels come from is standing context, not an alert —
                      a quiet action with a tooltip, never a full-width notice. */}
                  {isAttributeMode && !isBroken && (
                    <>
                      <span id="cm-linked-desc" className={styles['cm__sr-only']}>
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
                          aria-describedby="cm-linked-desc"
                          trailingIcon={<Icon size="16" glyph={<OpenInNewIcon />} />}
                          onClick={() => undefined}
                        >
                          {COPY.levelsNoticeLinkedLink}
                        </Button>
                      </HoverTip>
                    </>
                  )}
                </div>

                <div className={styles['cm__card-body']}>
                  {isBroken && (
                    <SectionNotice
                      type="Danger"
                      title={COPY.errorAttrDeletedTitle}
                      description={`“${linkedAttrLabel}” ${COPY.errorAttrDeletedBody}`}
                      primaryButtonLabel={COPY.errorActionConvert}
                      onPrimaryAction={convertToCustom}
                    />
                  )}

                  <div className={styles['cm__table']} role="table">
                    <div className={styles['cm__thead']} role="row">
                      <div className={styles['cm__th-handle']} />
                      <div className={styles['cm__th']} role="columnheader">
                        {COPY.levelsColText}
                      </div>
                      <div className={styles['cm__th']} role="columnheader">
                        {COPY.levelsColColor}
                      </div>
                      <div className={styles['cm__th']} role="columnheader">
                        {COPY.levelsColRank}
                      </div>
                      <div className={styles['cm__th-actions']} />
                    </div>

                    {levels.length === 0 && (
                      <div className={styles['cm__empty']}>{COPY.levelsEmptyCustom}</div>
                    )}

                    {levels.map((level, i) => (
                      <div
                        key={level.id}
                        className={[
                          styles['cm__row'],
                          level.color == null ? styles['cm__row--warn'] : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        role="row"
                      >
                        <div className={styles['cm__cell-handle']}>
                          {locked ? (
                            <span
                              className={styles['cm__lock']}
                              title={COPY.lockTooltip}
                              aria-label={COPY.lockAria}
                            >
                              <Icon size="16" glyph={<LockOutlineIcon />} />
                            </span>
                          ) : (
                            <span className={styles['cm__drag']} aria-hidden="true">
                              <Icon size="16" glyph={<DragVerticalIcon />} />
                            </span>
                          )}
                        </div>

                        {/* Text — one source. Locked in attribute mode. */}
                        <div className={styles['cm__cell']} role="cell">
                          {locked ? (
                            <span className={styles['cm__text-locked']} aria-readonly="true">
                              {level.text}
                            </span>
                          ) : (
                            <input
                              className={styles['cm__input']}
                              value={level.text}
                              placeholder="Level name"
                              aria-label={`Level ${i + 1} text`}
                              onChange={(e) =>
                                updateLevel(level.id, { text: e.target.value })
                              }
                            />
                          )}
                        </div>

                        {/* Color — always authored here, in every mode. */}
                        <div className={styles['cm__cell']} role="cell">
                          {level.color ? (
                            <label className={styles['cm__color']}>
                              <input
                                type="color"
                                className={styles['cm__swatch-input']}
                                value={level.color}
                                aria-label={`Color for ${level.text || `level ${i + 1}`}`}
                                onChange={(e) =>
                                  updateLevel(level.id, { color: e.target.value })
                                }
                              />
                              <span
                                className={styles['cm__swatch']}
                                style={{ background: level.color }}
                                aria-hidden="true"
                              />
                              <span className={styles['cm__hex']}>
                                {level.color.toUpperCase()}
                              </span>
                            </label>
                          ) : (
                            <button
                              type="button"
                              className={styles['cm__set-color']}
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

                        <div className={styles['cm__cell']} role="cell">
                          <span className={styles['cm__rank']}>{i + 1}</span>
                          {level.color == null && (
                            <span className={styles['cm__needs-color']}>
                              {COPY.rowNeedsColor}
                            </span>
                          )}
                        </div>

                        <div className={styles['cm__cell-actions']}>
                          {!locked && (
                            <IconButton
                              size="Small"
                              icon={
                                <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                              }
                              aria-label={`Delete ${level.text || `level ${i + 1}`}`}
                              onClick={() => deleteLevel(level.id)}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!locked && (
                    <div className={styles['cm__add']}>
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

            {/* ───────── Section 3 — global indicators ───────── */}
            {enabled && (
              <section className={styles['cm__card']}>
                <div className={styles['cm__card-head']}>
                  <div className={styles['cm__card-head-text']}>
                    <h2 className={styles['cm__card-title']}>{COPY.globalTitle}</h2>
                    <p className={styles['cm__card-subtitle']}>{COPY.globalSubtitle}</p>
                  </div>
                </div>

                <div className={styles['cm__card-body']}>
                  <div className={styles['cm__field']}>
                    <div className={styles['cm__label']}>{COPY.globalBannerLabel}</div>
                    <div className={styles['cm__control']}>
                      <div className={styles['cm__radios']}>
                        <Radio
                          name="global-banner"
                          checked={globalBanner}
                          onChange={() => setGlobalBanner(true)}
                        >
                          True
                        </Radio>
                        <Radio
                          name="global-banner"
                          checked={!globalBanner}
                          onChange={() => setGlobalBanner(false)}
                        >
                          False
                        </Radio>
                      </div>
                      <p className={styles['cm__help']}>{COPY.globalBannerHelp}</p>
                    </div>
                  </div>

                  {globalBanner && (
                    <>
                      <div className={styles['cm__divider']} />
                      <div className={styles['cm__field']}>
                        <div className={styles['cm__label']}>
                          {COPY.globalVisibilityLabel}
                        </div>
                        <div className={styles['cm__control']}>
                          <div className={styles['cm__radios']}>
                            <Radio
                              name="visibility"
                              checked={bannerVisibility === 'top'}
                              onChange={() => setBannerVisibility('top')}
                            >
                              {COPY.globalVisibilityTopOnly}
                            </Radio>
                            <Radio
                              name="visibility"
                              checked={bannerVisibility === 'both'}
                              onChange={() => setBannerVisibility('both')}
                            >
                              {COPY.globalVisibilityTopBottom}
                            </Radio>
                          </div>
                        </div>
                      </div>

                      <div className={styles['cm__divider']} />
                      <div className={styles['cm__field']}>
                        <label className={styles['cm__label']} htmlFor="global-level">
                          {COPY.globalLevelLabel}
                        </label>
                        <div className={styles['cm__control']}>
                          <div className={styles['cm__level-select']}>
                            <span
                              className={styles['cm__swatch']}
                              style={{
                                background:
                                  levels.find((l) => l.text === globalLevel)?.color ??
                                  'rgba(var(--center-channel-color-rgb), 0.24)',
                              }}
                              aria-hidden="true"
                            />
                            <Select
                              id="global-level"
                              value={globalLevel}
                              onChange={(e) => setGlobalLevel(e.target.value)}
                            >
                              {levels.map((l) => (
                                <option key={l.id} value={l.text}>
                                  {l.text}
                                </option>
                              ))}
                            </Select>
                          </div>
                          <p className={styles['cm__help']}>{COPY.globalLevelHelp}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        <ConsoleFooter onSave={() => undefined} onCancel={() => undefined} />
      </div>

      {/* Change-source confirmation — the switch is destructive to names and order. */}
      {pendingSource && (
        <div className={styles['cm__scrim']} role="presentation">
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
              <div className={styles['cm__dialog-footer']}>
                <Button emphasis="Tertiary" onClick={() => setPendingSource(null)}>
                  {COPY.dialogCancel}
                </Button>
                {/* Replacing the level list can strip markings in use — that is a
                    destructive act. Switching to custom keeps every row, so it is not. */}
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
            <p className={styles['cm__dialog-body']}>
              {pendingSource.kind === 'attribute' && (
                <>
                  Linking <strong>“{sourceLabel(pendingSource)}”</strong>{' '}
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
