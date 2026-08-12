import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Select from '@/components/ui/Select/Select';
import { rankAndGraphAgree } from './boundsModel';
import { schemeFor } from './seedData';
import {
  STATES_BY_SURFACE,
  STATE_LABELS,
  SURFACE_OPTIONS,
  parseSurface,
  resolveSchemeKey,
  resolveState,
  type StateKey,
  type SurfaceKey,
} from './urlState';
import AttributeSetupSurface from './_components/AttributeSetupSurface';
import ChannelSettingsSurface from './_components/ChannelSettingsSurface';
import PostComposerSurface from './_components/PostComposerSurface';
import styles from './HierarchicalAttributeBoundedValue.module.scss';

/**
 * Bounded values + derivation — three surfaces on one page. [AI DRAFT]
 *
 * Route: `/prototypes/hierarchical-attribute-bounded-value`
 *
 * Two backend behaviours with no existing UX are given one here:
 *
 *  • BOUNDS — a value capped by another entity's value, through a linked-field
 *    relationship. `write.value.bounds` is the guard (server-side, every save,
 *    including edits). `read.option.bounds` is a convenience (shapes the
 *    picker; the client is never trusted). Caps chain: post ≤ channel ≤ system,
 *    and an unresolvable cap fails closed — nothing offered, nothing saved.
 *  • DERIVATION — inherit from the container, with NO per-value provenance
 *    flag. A stored value is explicit; no stored value means the value is
 *    computed on read. Revert is delete: an author re-inherits by clearing.
 *
 * The same model is shown from the three places it surfaces: the author's
 * composer, the channel that acts as their cap, and the admin page where the
 * cap and the inheritance are configured.
 *
 * Deep links:
 *   ?surface = post | channel | setup
 *   ?state   = inherited | explicit | rejected | cap-unresolved | conflict | graph-cap
 *   ?scheme  = levels | programs
 *   ?demo    = off
 */
export default function HierarchicalAttributeBoundedValue() {
  const [params, setParams] = useSearchParams();

  const surface = parseSurface(params.get('surface'));
  const { state, fellBack } = resolveState(surface, params.get('state'));
  const schemeKey = resolveSchemeKey(state, params.get('scheme'));
  const scheme = schemeFor(schemeKey);
  const showDemoBand = params.get('demo') !== 'off';

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params);
      next.set(key, value);
      if (key === 'surface') {
        // States are surface-specific; drop a state the new surface cannot show.
        const allowed = STATES_BY_SURFACE[value as SurfaceKey];
        const current = next.get('state');
        if (!current || !(allowed as string[]).includes(current)) {
          next.set('state', allowed[0]);
        }
      }
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const goToChannelSurface = useCallback(() => {
    const next = new URLSearchParams(params);
    next.set('surface', 'channel');
    next.set('state', 'cap-unresolved');
    setParams(next, { replace: true });
  }, [params, setParams]);

  const schemePinned = state === 'graph-cap';

  return (
    <div className={styles['bounded-value']}>
      {showDemoBand && (
        <div className={styles['bounded-value__demo']}>
          <span className={styles['bounded-value__demo-label']}>
            Prototype demo
          </span>

          <div className={styles['bounded-value__demo-control']}>
            <label
              className={styles['bounded-value__demo-control-label']}
              htmlFor="bv-demo-surface"
            >
              Surface
            </label>
            <Select
              id="bv-demo-surface"
              size="Small"
              width="fit"
              value={surface}
              onChange={(e) => setParam('surface', e.target.value)}
            >
              {SURFACE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className={styles['bounded-value__demo-control']}>
            <label
              className={styles['bounded-value__demo-control-label']}
              htmlFor="bv-demo-state"
            >
              State
            </label>
            <Select
              id="bv-demo-state"
              size="Small"
              width="fit"
              value={state}
              onChange={(e) => setParam('state', e.target.value)}
            >
              {STATES_BY_SURFACE[surface].map((key: StateKey) => (
                <option key={key} value={key}>
                  {STATE_LABELS[key]}
                </option>
              ))}
            </Select>
          </div>

          <div className={styles['bounded-value__demo-control']}>
            <label
              className={styles['bounded-value__demo-control-label']}
              htmlFor="bv-demo-scheme"
            >
              Value list
            </label>
            <Select
              id="bv-demo-scheme"
              size="Small"
              width="fit"
              value={schemeKey}
              readOnly={schemePinned}
              onChange={(e) => setParam('scheme', e.target.value)}
            >
              <option value="levels">
                Classification levels (ranked · ordered)
              </option>
              <option value="programs">Programs (graph · “within”)</option>
            </Select>
          </div>

          <span className={styles['bounded-value__demo-note']}>
            {fellBack
              ? 'That state does not apply to this surface — showing the first one it does.'
              : schemePinned
                ? 'Graph cap pins the Programs list. [AI DRAFT]'
                : `Rank/graph agreement: ${rankAndGraphAgree(scheme) ? 'consistent' : 'DRIFTED'} · [AI DRAFT]`}
          </span>
        </div>
      )}

      <div
        className={[
          styles['bounded-value__stage'],
          surface === 'setup'
            ? styles['bounded-value__stage--console']
            : styles['bounded-value__stage--channel'],
        ].join(' ')}
      >
        {surface === 'post' && (
          <PostComposerSurface
            key={`${state}-${schemeKey}`}
            scheme={scheme}
            state={state}
            showDemoExtras={showDemoBand}
            onOpenChannelSurface={goToChannelSurface}
          />
        )}
        {surface === 'channel' && (
          <ChannelSettingsSurface
            key={`${state}-${schemeKey}`}
            scheme={scheme}
            state={state}
            showDemoExtras={showDemoBand}
          />
        )}
        {surface === 'setup' && (
          <AttributeSetupSurface
            key={`${state}-${schemeKey}`}
            scheme={scheme}
            state={state}
          />
        )}
      </div>
    </div>
  );
}
