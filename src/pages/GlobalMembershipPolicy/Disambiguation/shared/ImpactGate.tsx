/**
 * Always-confirm impact gate (shared across the three disambiguation options).
 *
 * Async three-state (computing → results → error), public de-recommend vs
 * destructive private removal split, skipped-channel count. Mirrors the
 * committed LongForm gate (C13 / VP-2) so the terminal Save experience is
 * identical no matter which option a stakeholder picks.
 */

import { useRef, useState } from 'react';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';

import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import Modal from '@/components/ui/Modal/Modal';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Spinner from '@/components/ui/Spinner/Spinner';

import {
  SEED_IMPACT,
  type GateState,
} from '@/pages/GlobalMembershipPolicy/gmpData';

import styles from './ImpactGate.module.scss';

export default function ImpactGate({
  policyName,
  onClose,
  startError = false,
  initialState,
}: {
  policyName: string;
  onClose: () => void;
  startError?: boolean;
  initialState?: GateState;
}) {
  const [state, setState] = useState<GateState>(initialState ?? 'computing');
  const startedRef = useRef(initialState != null);

  if (!startedRef.current) {
    startedRef.current = true;
    window.setTimeout(() => setState(startError ? 'error' : 'results'), 900);
  }

  const impact = SEED_IMPACT;

  const footer =
    state === 'computing' ? (
      <Button emphasis="Tertiary" onClick={onClose}>
        Cancel
      </Button>
    ) : state === 'error' ? (
      <div className={styles['gate__actions']}>
        <Button emphasis="Tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button emphasis="Primary" onClick={() => setState('computing')}>
          Retry
        </Button>
      </div>
    ) : (
      <div className={styles['gate__actions']}>
        <Button emphasis="Tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button emphasis="Primary" onClick={onClose}>
          {impact.usersRemoved > 0
            ? `Apply policy — remove ${impact.usersRemoved} members`
            : 'Apply policy'}
        </Button>
      </div>
    );

  return (
    <div className={styles['scrim']} role="presentation">
      <div className={styles['gate']}>
        <Modal
          size="Medium"
          title="Review policy impact"
          subtitle={policyName || 'New membership policy'}
          onClose={onClose}
          footer={footer}
        >
          {state === 'computing' && (
            <div className={styles['gate__computing']}>
              <Spinner size={28} />
              <p className={styles['gate__computing-copy']}>Calculating impact…</p>
            </div>
          )}

          {state === 'error' && (
            <SectionNotice
              type="Danger"
              title="Couldn’t calculate the full impact"
              description="We couldn’t compute this policy’s impact right now. No changes have been applied. Retry, or cancel and try again later."
            />
          )}

          {state === 'results' && (
            <div className={styles['gate__results']}>
              <div className={styles['gate__scope']}>
                <span className={styles['gate__scope-count']}>
                  {impact.channelsInScope}
                </span>
                <span className={styles['gate__scope-label']}>
                  channels in scope
                </span>
                <span className={styles['gate__scope-split']}>
                  {impact.publicChannels} public · {impact.privateChannels} private
                </span>
              </div>

              <div className={styles['gate__effect']}>
                <span className={styles['gate__effect-icon']} aria-hidden>
                  <Icon size="20" glyph={<InformationOutlineIcon />} />
                </span>
                <div>
                  <p className={styles['gate__effect-title']}>
                    {impact.usersDeRecommended} users will be de-recommended from{' '}
                    {impact.publicChannels} public channels.
                  </p>
                  <p className={styles['gate__effect-body']}>
                    They keep access; only the recommendation is withdrawn.
                  </p>
                </div>
              </div>

              <div
                className={[
                  styles['gate__effect'],
                  styles['gate__effect--destructive'],
                ].join(' ')}
              >
                <span className={styles['gate__effect-icon']} aria-hidden>
                  <Icon size="20" glyph={<AlertOutlineIcon />} />
                </span>
                <div>
                  <p className={styles['gate__effect-title']}>
                    {impact.usersRemoved} members will be removed from{' '}
                    {impact.privateChannels} private channels.
                  </p>
                  <p className={styles['gate__effect-body']}>
                    This is destructive. Removed members lose access immediately
                    after you apply.
                  </p>
                </div>
              </div>

              <div className={styles['gate__skipped']}>
                <Icon size="16" glyph={<AlertCircleOutlineIcon />} />
                <span>
                  {impact.skippedMissingAttr} channels were not evaluated — a
                  referenced attribute isn’t set.
                </span>
              </div>

              <p className={styles['gate__footnote']}>
                Takes effect within ~15 minutes.
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
