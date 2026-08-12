import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ColoredRankedInputChip from '@/components/ui/ColoredRankedInputChip/ColoredRankedInputChip';
import Select from '@/components/ui/Select/Select';
import ChannelInfoSurface from './_components/ChannelInfoSurface';
import ClassificationBanner from './_components/ClassificationBanner';
import CreateChannelSurface from './_components/CreateChannelSurface';
import FlatValueMenu from './_components/FlatValueMenu';
import HierarchyValueMenu from './_components/HierarchyValueMenu';
import ProgramChips from './_components/ProgramChips';
import UserAttributesSurface from './_components/UserAttributesSurface';
import ValueMenuField, { FieldNotice } from './_components/ValueMenuField';
import {
  NOTHING_QUALIFIES_WARNING,
  inertMarkingWarning,
  redundancyHint,
} from './valueMenuCopy';
import {
  FIELD_NAME,
  RANKING_LABELS,
  SEEDED_MENU,
  SEEDED_SELECTION,
  STATE_KEYS,
  STATE_LABELS,
  SUBJECT_USER,
  SURFACE_KEYS,
  SURFACE_LABELS,
  classificationById,
  labelOf,
  parseRanking,
  parseState,
  parseSurface,
  qualifyingUsers,
  sideOf,
  type RankingMode,
  type StateKey,
  type SurfaceKey,
} from './valueMenuModel';
import styles from './HierarchicalAttributeValueMenu.module.scss';

type OpenMenu = 'program' | 'classification' | null;

export interface ValueMenuPageProps {
  /** Pins the surface for the per-surface routes; otherwise `?surface=` decides. */
  forcedSurface?: SurfaceKey;
}

/**
 * Hierarchical (`graph`) attribute — the value picker as a DROPDOWN.
 *
 * The instruction this is built to: "We don't have such a big surface to just
 * select values for single field. We need to do it all in a popover menu similar
 * to a dropdown. We can still have nested sub-menus and also search in the top
 * menu popover. It needs to be simple, obvious, and lightweight."
 *
 * So the whole design is one ~300px popover anchored to its field: search at the
 * top, the value hierarchy expanding INLINE beneath it, a checkbox on what is
 * selected, and exactly one footer line of consequence. Everything the earlier
 * full-page version carried — live consequence panels, reachability tables,
 * user-population lists — is gone. The two genuinely dangerous cases survive as
 * one-line notices under the field, where they do not turn a dropdown into a
 * dashboard.
 *
 * The "nested sub-menus" half of that instruction did not survive review, and for
 * accessibility reasons rather than taste: a menu cannot host a selectable parent
 * (ARIA 1.2 gives Enter to the submenu), Compass caps submenus at one level while
 * this hierarchy is three deep, and flyouts do not fit a 400px sidebar. The
 * picker is a `combobox` opening a `tree` that expands in place. The reasoning
 * lives in `HierarchyValueMenu`.
 *
 * One component, three hosts, no per-host branch in the menu itself:
 *   ?surface=user           System Console ▸ User Configuration
 *   ?surface=create-channel Create a new channel
 *   ?surface=channel-info   Channel Info sidebar (the 400px stress test)
 *
 * Deep links: `?surface=` · `?ranking=unranked|ranked` · `?state=` · `?demo=off`.
 * `?state=submenu` is kept as an alias of `?state=expanded` so older links land.
 */
export default function HierarchicalAttributeValueMenu({
  forcedSurface,
}: ValueMenuPageProps = {}) {
  const [params, setParams] = useSearchParams();

  const surface = forcedSurface ?? parseSurface(params.get('surface'));
  const ranking = parseRanking(params.get('ranking'));
  const stateKey = parseState(params.get('state'));
  const showDemoBand = params.get('demo') !== 'off';
  const side = sideOf(surface);

  const seededSelection = SEEDED_SELECTION[stateKey];
  const seededMenu = SEEDED_MENU[stateKey];

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
  // is harmless and only hints.
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
      popup="tree"
      menu={(popupId) => (
        <HierarchyValueMenu
          key={`${scenarioKey}|program`}
          title={FIELD_NAME.toUpperCase()}
          popupId={popupId}
          side={side}
          ranking={ranking}
          selectedIds={selected}
          onToggle={toggle}
          subjectFirstName={SUBJECT_USER.firstName}
          initialQuery={seededMenu.query}
          initialExpandedIds={seededMenu.expandedIds}
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
        Prototype demo
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
          {STATE_KEYS.map((key: StateKey) => (
            <option key={key} value={key}>
              {STATE_LABELS[key]}
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
