/**
 * A2 — Leave-and-Rejoin overlay surface (§3.2.6).
 *
 * Same surface as A1 — Browse Channels with the "Channels you can rejoin"
 * filter chip. Rendered as a compact callout so the prototype highlights
 * the rejoin entry point without duplicating the full BrowseChannels list.
 *
 * Crucially: rejoin requests route through the standard Request-to-Join
 * modal. The wizard is admin-side only and never re-fires on rejoin.
 */
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import { CHANNELS, usePersona } from '@/pages/dpc/shared';
import type { A2StoreApi } from '@/pages/dpc/a2/useA2Store';
import styles from './RejoinableChannelsSurface.module.scss';

export interface RejoinableChannelsSurfaceProps {
  store: A2StoreApi;
  onRequestClick: (channelId: string) => void;
}

export default function RejoinableChannelsSurface({
  store,
  onRequestClick,
}: RejoinableChannelsSurfaceProps) {
  const { persona } = usePersona();

  if (persona === 'guest' || persona === 'channel-admin') {
    return (
      <section className={styles['rejoin-surface']}>
        <header className={styles['rejoin-surface__head']}>
          <Icon glyph={<ClockOutlineIcon />} size="16" />
          <h3 className={styles['rejoin-surface__title']}>
            Channels you can rejoin
          </h3>
        </header>
        <p className={styles['rejoin-surface__copy']}>
          This filter is user-scoped (PRD AC-3.1). Switch to a tenured-member
          persona to see rejoin candidates.
        </p>
      </section>
    );
  }

  const rejoinable = CHANNELS.filter((c) =>
    store.rejoinableChannels.includes(c.id),
  );

  return (
    <section className={styles['rejoin-surface']}>
      <header className={styles['rejoin-surface__head']}>
        <Icon glyph={<ClockOutlineIcon />} size="16" />
        <h3 className={styles['rejoin-surface__title']}>
          Channels you can rejoin
        </h3>
        <LabelTag
          label={`${rejoinable.length} channels`}
          type="Info Dim"
          size="X-Small"
        />
      </header>

      {rejoinable.length === 0 ? (
        <EmptyState
          title="You haven't left any discoverable channels yet"
          description="Channels you've previously left will show here so you can rejoin them."
        />
      ) : (
        <ul className={styles['rejoin-surface__list']}>
          {rejoinable.map((c) => (
            <li key={c.id} className={styles['rejoin-surface__row']}>
              <div>
                <div className={styles['rejoin-surface__row-name']}>
                  #{c.displayName}
                </div>
                <div className={styles['rejoin-surface__row-purpose']}>
                  {c.purpose}
                </div>
              </div>
              <Button
                emphasis="Secondary"
                size="Small"
                onClick={() => onRequestClick(c.id)}
              >
                Request to Join
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
