import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import Icon from '@/components/ui/Icon/Icon';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Select from '@/components/ui/Select/Select';
import Spinner from '@/components/ui/Spinner/Spinner';
import BrowseHierarchyModal from './_components/BrowseHierarchyModal';
import ChannelMarkingHost from './_components/ChannelMarkingHost';
import ConsequenceSummary from './_components/ConsequenceSummary';
import SubjectAssignmentHost from './_components/SubjectAssignmentHost';
import ValuePickerField from './_components/ValuePickerField';
import {
  FIELD_NAME,
  LOAD_ERROR,
  RESTRICTED_VIEWER_HOLDS,
  SEEDED_SELECTION,
  STATE_KEYS,
  STATE_LABELS,
  SUBJECT_USER,
  graphForViewer,
  labelsFor,
  listLabels,
  qualifyingUsers,
  rootIdsOf,
  rootsOfGraph,
  type PickerSide,
  type StateKey,
  type ViewerMode,
} from './pickerModel';
import styles from './HierarchicalAttributeValuePicker.module.scss';

const SIDE_LABELS: Record<PickerSide, string> = {
  subject: 'Subject — assign programs to a user',
  resource: 'Resource — mark a channel',
};

const VIEWER_LABELS: Record<ViewerMode, string> = {
  admin: 'Fully-cleared admin',
  restricted: 'Partially-cleared viewer',
};

/**
 * Hierarchical (`graph`) attribute — VALUE PICKER.
 *
 * The surface a senior engineer deferred to design: "how do we present the UX
 * for selecting a classification or a clearance when it's different trees?"
 *
 * Both sides of the relation live on this one page, switchable, because the
 * option list is identical and only the consequence inverts. Building them apart
 * would let each read as reasonable in isolation while remaining impossible to
 * tell apart in the product.
 *
 * Deep links: ?side=subject|resource · ?state=… · ?viewer=admin|restricted ·
 * ?demo=off to hide the prototype band.
 */
export default function HierarchicalAttributeValuePicker() {
  const [params, setParams] = useSearchParams();

  const side: PickerSide =
    params.get('side') === 'resource' ? 'resource' : 'subject';
  const rawState = params.get('state') as StateKey | null;
  const stateKey: StateKey =
    rawState != null && STATE_KEYS.includes(rawState) ? rawState : 'empty';
  const viewer: ViewerMode =
    params.get('viewer') === 'restricted' ? 'restricted' : 'admin';
  const showDemoBand = params.get('demo') !== 'off';

  const options = useMemo(() => graphForViewer(viewer), [viewer]);
  const inScopeIds = useMemo(
    () => new Set(options.map((o) => o.id)),
    [options],
  );

  const seed = useMemo(
    () => SEEDED_SELECTION[stateKey][viewer].filter((id) => inScopeIds.has(id)),
    [stateKey, viewer, inScopeIds],
  );

  const [selected, setSelected] = useState<string[]>(seed);
  const [browseOpen, setBrowseOpen] = useState(stateKey === 'browse');
  const [zeroConfirmed, setZeroConfirmed] = useState(false);

  // Re-seed on any deep-link change without an effect round-trip, matching the
  // pattern used by the authoring prototypes.
  const scenarioKey = `${side}|${stateKey}|${viewer}`;
  const [prevScenario, setPrevScenario] = useState(scenarioKey);
  if (scenarioKey !== prevScenario) {
    setPrevScenario(scenarioKey);
    setSelected(seed);
    setBrowseOpen(stateKey === 'browse');
    setZeroConfirmed(false);
  }

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  };

  const loading = stateKey === 'loading';
  const errored = stateKey === 'error';

  const qualifiers = side === 'resource' ? qualifyingUsers(selected) : [];
  const zeroQualifying =
    side === 'resource' && selected.length > 0 && qualifiers.length === 0;
  const saveBlocked = zeroQualifying && !zeroConfirmed;

  const removeIds = (ids: string[]) => {
    const drop = new Set(ids);
    setSelected((prev) => prev.filter((id) => !drop.has(id)));
    setZeroConfirmed(false);
  };

  const toggleId = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
    setZeroConfirmed(false);
  };

  const field = (
    <>
      {errored && (
        <SectionNotice
          type="Danger"
          icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
          title={LOAD_ERROR.title}
          description={LOAD_ERROR.description}
          secondaryButtonLabel="Retry"
          onSecondaryAction={() => setParam('state', 'selected')}
        />
      )}

      {loading ? (
        <div className={styles['vp__loading']}>
          <Spinner size={24} aria-label={`Loading ${FIELD_NAME} values`} />
          <span className={styles['vp__loading-text']}>
            Loading {FIELD_NAME} values and their relationships…
          </span>
        </div>
      ) : (
        <ValuePickerField
          options={options}
          selected={selected}
          onChange={(next) => {
            setSelected(next);
            setZeroConfirmed(false);
          }}
          onOpenBrowse={() => setBrowseOpen(true)}
          disabled={errored}
          summarySlot={
            <ConsequenceSummary
              side={side}
              viewer={viewer}
              options={options}
              selected={selected}
              personName={SUBJECT_USER.name.split(' ')[0]}
              onRemove={removeIds}
              zeroConfirmed={zeroConfirmed}
              onConfirmZero={() => setZeroConfirmed(true)}
            />
          }
        />
      )}
    </>
  );

  const band = showDemoBand ? (
    <div className={styles['vp__band']}>
      <span className={styles['vp__band-label']}>Prototype demo</span>

      <label className={styles['vp__band-control']}>
        <span>Side</span>
        <Select
          size="Small"
          width="fit"
          value={side}
          aria-label="Picker side"
          onChange={(e) => setParam('side', e.target.value)}
        >
          {(Object.keys(SIDE_LABELS) as PickerSide[]).map((key) => (
            <option key={key} value={key}>
              {SIDE_LABELS[key]}
            </option>
          ))}
        </Select>
      </label>

      <label className={styles['vp__band-control']}>
        <span>State</span>
        <Select
          size="Small"
          width="fit"
          value={stateKey}
          aria-label="Demo state"
          onChange={(e) => setParam('state', e.target.value)}
        >
          {STATE_KEYS.map((key) => (
            <option key={key} value={key}>
              {STATE_LABELS[key]}
            </option>
          ))}
        </Select>
      </label>

      <label className={styles['vp__band-control']}>
        <span>Viewer</span>
        <Select
          size="Small"
          width="fit"
          value={viewer}
          aria-label="Viewer scope"
          onChange={(e) => setParam('viewer', e.target.value)}
        >
          {(Object.keys(VIEWER_LABELS) as ViewerMode[]).map((key) => (
            <option key={key} value={key}>
              {VIEWER_LABELS[key]}
            </option>
          ))}
        </Select>
      </label>

      <span className={styles['vp__band-note']}>
        {viewer === 'restricted'
          ? `Viewer holds ${listLabels(
              labelsFor(options, RESTRICTED_VIEWER_HOLDS),
            )}. Pool is ${options.length} values across ${
              rootsOfGraph(options).length
            } hierarchies — out-of-scope values are absent, never counted. · [AI DRAFT]`
          : `Full pool: ${options.length} values across ${
              rootsOfGraph(options).length
            } unrelated hierarchies. · [AI DRAFT]`}
      </span>
    </div>
  ) : null;

  return (
    <div className={styles['vp']}>
      {side === 'subject' ? (
        <SubjectAssignmentHost banner={band}>{field}</SubjectAssignmentHost>
      ) : (
        <ChannelMarkingHost
          banner={band}
          saveBlocked={saveBlocked}
          saveBlockedReason="No one can enter this channel as marked. Confirm the warning, or change the values."
        >
          {field}
        </ChannelMarkingHost>
      )}

      {browseOpen && !loading && !errored && (
        <BrowseHierarchyModal
          options={options}
          selected={selected}
          initialRootId={
            selected.length > 0
              ? (rootIdsOf(options, selected[0])[0] ?? null)
              : null
          }
          onToggle={toggleId}
          onClose={() => setBrowseOpen(false)}
        />
      )}
    </div>
  );
}
