import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import ChannelRowPill from '../shared/ChannelRowPill';
import type { MarkingStyle } from '../shared/SceneHarness';
import { CHANNEL_LIST, type ChannelListItem } from '../shared/channelListData';
import styles from './autocomplete.module.scss';

// The ~-autocomplete lists CHANNELS the user can reference, not DMs. The order
// matches the switcher's channel ordering so reviewers can compare like-for-like.
const CHANNEL_IDS = [
  'feature-proposals',
  'bugs',
  'ask-r-and-d',
  'operation-aurora',
  'orion-launch-ops',
  'quick-wins-design-sprint',
  'town-square',
];

function byId(id: string): ChannelListItem {
  const found = CHANNEL_LIST.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown channel id: ${id}`);
  return found;
}

// The partial the user has typed to trigger the dropdown (context for reviewers).
const TYPED = '~fea';

function AutocompleteRow({ item, variant }: { item: ChannelListItem; variant: MarkingStyle }) {
  const glyph = item.kind === 'private' ? <LockOutlineIcon /> : <GlobeIcon />;
  return (
    <div className={styles['ac__row']}>
      <span className={styles['ac__icon']} aria-hidden>
        <Icon size="16" glyph={glyph} />
      </span>
      <span className={styles['ac__name']}>{item.name}</span>
      {/* Same placement rule as the switcher: pill after name, before ~handle.
          No-trace masking → the masked `Bugs` (classification undefined) renders
          no pill and is a valid ~ref exactly like a genuinely unmarked channel. */}
      <ChannelRowPill item={item} variant={variant} />
      <span className={styles['ac__handle']}>{item.handle}</span>
    </div>
  );
}

/**
 * Surface #2 — the `~`-channel composer autocomplete. Faithful to the standard
 * Mattermost autocomplete dropdown: a "MY CHANNELS" section header, rows of
 * globe/lock icon + bold channel name + grey ~handle, no unread badges. The
 * dropdown is anchored above a minimal message composer that shows a partially
 * typed `~` to set context.
 *
 * Server-filtered autocomplete: the list is what the SERVER returned for this
 * viewer — cleared channels carry a value (pill renders), the masked `Bugs`
 * carries `classification: undefined` (member channel, valid ~ref, no pill, no
 * trace). We do not invent an "excluded / not-suggested" state beyond what
 * CHANNEL_LIST encodes.
 */
export default function ChannelAutocomplete({ variant = 'abbrev' }: { variant?: MarkingStyle }) {
  return (
    <div className={styles.ac}>
      <div className={styles['ac__dropdown']} role="listbox" aria-label="Channel suggestions">
        <div className={styles['ac__group-label']}>My Channels</div>
        {CHANNEL_IDS.map((id) => (
          <AutocompleteRow key={id} item={byId(id)} variant={variant} />
        ))}
      </div>

      <div className={styles['ac__composer']}>
        <div className={styles['ac__composer-input']}>
          <span className={styles['ac__composer-typed']}>{TYPED}</span>
          <span className={styles['ac__composer-caret']} aria-hidden />
        </div>
      </div>
    </div>
  );
}
