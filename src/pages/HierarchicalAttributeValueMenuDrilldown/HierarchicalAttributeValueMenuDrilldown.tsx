import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ColoredRankedInputChip from '@/components/ui/ColoredRankedInputChip/ColoredRankedInputChip';
import Select from '@/components/ui/Select/Select';
import ChannelInfoSurface from '@/pages/HierarchicalAttributeValueMenu/_components/ChannelInfoSurface';
import ClassificationBanner from '@/pages/HierarchicalAttributeValueMenu/_components/ClassificationBanner';
import CreateChannelSurface from '@/pages/HierarchicalAttributeValueMenu/_components/CreateChannelSurface';
import FlatValueMenu from '@/pages/HierarchicalAttributeValueMenu/_components/FlatValueMenu';
import ProgramChips from '@/pages/HierarchicalAttributeValueMenu/_components/ProgramChips';
import UserAttributesSurface from '@/pages/HierarchicalAttributeValueMenu/_components/UserAttributesSurface';
import ValueMenuField, {
  FieldNotice,
} from '@/pages/HierarchicalAttributeValueMenu/_components/ValueMenuField';
import {
  NOTHING_QUALIFIES_WARNING,
  inertMarkingWarning,
  redundancyHint,
} from '@/pages/HierarchicalAttributeValueMenu/valueMenuCopy';
import {
  FIELD_NAME,
  RANKING_LABELS,
  SUBJECT_USER,
  SURFACE_KEYS,
  SURFACE_LABELS,
  classificationById,
  labelOf,
  parseRanking,
  parseSurface,
  qualifyingUsers,
  sideOf,
  type RankingMode,
  type SurfaceKey,
} from '@/pages/HierarchicalAttributeValueMenu/valueMenuModel';
import ValueDrilldownMenu from './_components/ValueDrilldownMenu';
import {
  DRILL_SEEDED_MENU,
  DRILL_SEEDED_SELECTION,
  DRILL_STATE_KEYS,
  DRILL_STATE_LABELS,
  parseDrillState,
  type DrillStateKey,
} from './drilldownModel';
import styles from '@/pages/HierarchicalAttributeValueMenu/HierarchicalAttributeValueMenu.module.scss';

type OpenMenu = 'program' | 'classification' | null;

export interface ValueMenuDrilldownPageProps {
  /** Pins the surface for a per-surface route; otherwise `?surface=` decides. */
  forcedSurface?: SurfaceKey;
}

/**
 * Hierarchical (`graph`) attribute — the value picker as DRILL-IN SUBMENUS.
 *
 * Variation of `HierarchicalAttributeValueMenu`, built to sit beside it for a
 * side-by-side call. Same hosts, same field trigger, same flat Classification
 * menu, same footer line, same warnings, same seed — the ONLY difference is what
 * happens when you go into a parent. The inline build expands children beneath the
 * parent row; this one replaces the panel body with that parent's level.
 *
 * That swap is what lets the popup be a real `role="menu"`. Inline, a branch row
 * had to both expand and be selectable, which ARIA does not permit on a
 * `menuitem`, so the inline build is a `combobox` over a `tree`. Here a branch row
 * navigates and only navigates, and its checkbox is the first row of its own
 * level — so Enter keeps one meaning per row and the APG menu contract applies as
 * written. See `ValueDrilldownMenu` for the full argument.
 *
 * Reused read-only from the inline build: all three host surfaces, the field
 * trigger with chips, `ProgramChips`, `FlatValueMenu`, `ClassificationBanner`, the
 * copy module, the model, and the demo-band styles. New here: the drill-in menu,
 * its row, and the level/deep-link delta in `drilldownModel`.
 *
 *   ?surface=user           System Console ▸ User Configuration
 *   ?surface=create-channel Create a new channel
 *   ?surface=channel-info   Channel Info sidebar (the 400px stress test)
 *
 * Deep links: `?surface=` · `?ranking=unranked|ranked` · `?state=` · `?demo=off`.
 * `?state=drilled` lands two levels deep; `expanded` and `submenu` alias to it so
 * links from the inline build still resolve.
 */
export default function HierarchicalAttributeValueMenuDrilldown({
  forcedSurface,
}: ValueMenuDrilldownPageProps = {}) {
  const [params, setParams] = useSearchParams();

  const surface = forcedSurface ?? parseSurface(params.get('surface'));
  const ranking = parseRanking(params.get('ranking'));
  const stateKey = parseDrillState(params.get('state'));
  const showDemoBand = params.get('demo') !== 'off';
  const side = sideOf(surface);

  const seededSelection = DRILL_SEEDED_SELECTION[stateKey];
  const seededMenu = DRILL_SEEDED_MENU[stateKey];

  const [selected, setSelected] = useState<string[]>(seededSelection);
  const [classificationId, setClassificationId] = useState<string | null>(
    'unclassified',
  );
  const [openMenu, setOpenMenu] = useState<OpenMenu>(
    seededMenu.open ? 'program' : null,
  );
  const [dirty, setDirty] = useState(false);

  // Re-seed on any deep-link change without an effect round-trip, matching the
  // pattern the other attribute prototypes use.
  const scenarioKey = `${surface}|${ranking}|${stateKey}`;
  const [prevScenario, setPrevScenario] = useState(scenarioKey);
  if (scenarioKey !== prevScenario) {
    setPrevScenario(scenarioKey);
    setSelected(seededSelection);
    setOpenMenu(seededMenu.open ? 'program' : null);
    setDirty(false);
  }

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  };

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
    setDirty(true);
  };

  const remove = (id: string) => {
    setSelected((prev) => prev.filter((s) => s !== id));
    setDirty(true);
  };

  const classification = classificationById(classificationId);

  // ── Inline notices. Two resource-side dangers warn; subject-side redundancy
  // is harmless and only hints. Identical to the inline build by design.
  const inert = side === 'resource' ? inertMarkingWarning(selected) : null;
  const nothingQualifies =
    side === 'resource' &&
    selected.length > 0 &&
    qualifyingUsers(selected).length === 0;
  const hint = side === 'subject' ? redundancyHint(selected) : null;

  const notice = (
    <>
      {inert != null && <FieldNotice tone="warning">{inert}</FieldNotice>}
      {nothingQualifies && (
        <FieldNotice tone="warning">{NOTHING_QUALIFIES_WARNING}</FieldNotice>
      )}
      {hint != null && (
        <FieldNotice
          tone="hint"
          action={{
            label: hint.fixLabel,
            onClick: () => remove(hint.pair.innerId),
          }}
        >
          {hint.text}
        </FieldNotice>
      )}
    </>
  );

  const programField = (
    <ValueMenuField
      variant={surface === 'channel-info' ? 'chips' : 'control'}
      label={`${FIELD_NAME} — choose values`}
      placeholder={surface === 'user' ? 'Select an option' : 'Select a value'}
      hasValue={selected.length > 0}
      open={openMenu === 'program'}
      onOpenChange={(next) => setOpenMenu(next ? 'program' : null)}
      align={surface === 'channel-info' ? 'end' : 'start'}
      // The popup really is a menu in this variation, so the trigger says `menu`
      // rather than the inline build's `combobox` over a tree.
      popup="menu"
      menu={(popupId) => (
        <ValueDrilldownMenu
          key={`${scenarioKey}|program`}
          title={FIELD_NAME.toUpperCase()}
          popupId={popupId}
          side={side}
          ranking={ranking}
          selectedIds={selected}
          onToggle={toggle}
          subjectFirstName={SUBJECT_USER.firstName}
          initialQuery={seededMenu.query}
          initialPath={seededMenu.path}
          compact={surface === 'channel-info'}
        />
      )}
      notice={notice}
    >
      <ProgramChips
        ids={selected}
        onRemove={surface === 'channel-info' ? undefined : remove}
      />
    </ValueMenuField>
  );

  const classificationField = (
    <ValueMenuField
      variant={surface === 'channel-info' ? 'chips' : 'control'}
      label="Classification — choose a value"
      placeholder="Select a value"
      hasValue={classification != null}
      open={openMenu === 'classification'}
      onOpenChange={(next) => setOpenMenu(next ? 'classification' : null)}
      align={surface === 'channel-info' ? 'end' : 'start'}
      popup="menu"
      menu={(popupId) => (
        <FlatValueMenu
          key={`${scenarioKey}|classification`}
          title="CLASSIFICATION"
          popupId={popupId}
          selectedId={classificationId}
          onSelect={(id) => {
            setClassificationId(id);
            setDirty(true);
            setOpenMenu(null);
          }}
          compact={surface === 'channel-info'}
        />
      )}
    >
      {classification != null && (
        <ColoredRankedInputChip
          label={classification.label}
          scheme={classification.scheme}
        />
      )}
    </ValueMenuField>
  );

  const band = showDemoBand ? (
    <div className={styles['value-menu-page__band']}>
      <span className={styles['value-menu-page__band-label']}>
        Prototype demo · drill-in
      </span>

      {forcedSurface == null && (
        <label className={styles['value-menu-page__band-control']}>
          <span>Surface</span>
          <Select
            size="Small"
            width="fit"
            value={surface}
            aria-label="Host surface"
            onChange={(e) => setParam('surface', e.target.value)}
          >
            {SURFACE_KEYS.map((key) => (
              <option key={key} value={key}>
                {SURFACE_LABELS[key]}
              </option>
            ))}
          </Select>
        </label>
      )}

      <label className={styles['value-menu-page__band-control']}>
        <span>Ranking</span>
        <Select
          size="Small"
          width="fit"
          value={ranking}
          aria-label="Attribute ranking setting"
          onChange={(e) => setParam('ranking', e.target.value)}
        >
          {(Object.keys(RANKING_LABELS) as RankingMode[]).map((key) => (
            <option key={key} value={key}>
              {RANKING_LABELS[key]}
            </option>
          ))}
        </Select>
      </label>

      <label className={styles['value-menu-page__band-control']}>
        <span>State</span>
        <Select
          size="Small"
          width="fit"
          value={stateKey}
          aria-label="Demo state"
          onChange={(e) => setParam('state', e.target.value)}
        >
          {DRILL_STATE_KEYS.map((key: DrillStateKey) => (
            <option key={key} value={key}>
              {DRILL_STATE_LABELS[key]}
            </option>
          ))}
        </Select>
      </label>

      <span className={styles['value-menu-page__band-note']}>
        {side === 'resource'
          ? `Marking a channel: every value is required, so each one added narrows entry. ${
              selected.length > 0
                ? `${qualifyingUsers(selected).length} of 12 members qualify.`
                : 'An empty marking denies everyone.'
            } · [AI DRAFT]`
          : `Assigning to ${SUBJECT_USER.name}: values add up, so each one added only grants more. Reaching ${
              selected.length > 0 ? labelOf(selected[0]) : 'nothing'
            } and below. · [AI DRAFT]`}
      </span>
    </div>
  ) : null;

  if (surface === 'user') {
    return (
      <UserAttributesSurface
        programField={programField}
        banner={band}
        dirty={dirty}
        onSave={() => setDirty(false)}
        onCancel={() => {
          setSelected(seededSelection);
          setDirty(false);
        }}
      />
    );
  }

  if (surface === 'create-channel') {
    return (
      <CreateChannelSurface
        classificationField={classificationField}
        programField={programField}
        banner={band}
      />
    );
  }

  return (
    <ChannelInfoSurface
      classificationField={classificationField}
      programField={programField}
      classificationBanner={<ClassificationBanner value={classification} />}
      banner={band}
    />
  );
}
