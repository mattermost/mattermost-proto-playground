import SceneHarness, { type SceneDef } from '../shared/SceneHarness';
import QuickSwitcher from './QuickSwitcher';
import ChannelAutocomplete from './ChannelAutocomplete';
import SearchResults from './SearchResults';
import GlobalThreadsView from './GlobalThreadsView';

/**
 * Propagation surfaces harness — the shared scaffold for the ~14 surfaces that
 * echo channel classification markings across the product (switcher, search,
 * sidebar, threads, mentions, notifications, …). Surfaces #1 (quick switcher) and
 * #2 (~channel composer autocomplete) are live; #3–#14 land here as scenes over
 * time. The scene-picker chrome — including the Abbreviated/Full marking-style
 * toggle — is playground-only; the product surfaces on the stage stay pristine.
 *
 * The marking style is deep-linkable via `?style=abbrev|full` (default `abbrev`)
 * and applies to EVERY propagation scene through each scene's `variant` prop.
 */
const SCENES: SceneDef[] = [
  {
    id: 'switcher',
    label: 'Quick channel switcher',
    group: 'Navigation surfaces',
    render: (ctx) => <QuickSwitcher variant={ctx.markingStyle} />,
  },
  {
    id: 'autocomplete',
    label: '~channel composer autocomplete',
    group: 'Composer surfaces',
    render: (ctx) => <ChannelAutocomplete variant={ctx.markingStyle} />,
  },
  {
    id: 'search',
    label: 'Search results panel',
    group: 'Search & discovery',
    render: (ctx) => <SearchResults variant={ctx.markingStyle} />,
  },
  {
    id: 'threads',
    label: 'Global threads view',
    group: 'Search & discovery',
    render: (ctx) => <GlobalThreadsView variant={ctx.markingStyle} />,
  },
];

export default function PropagationHarness() {
  return (
    <SceneHarness
      title="Channel Attributes · Propagation"
      scenes={SCENES}
      initialSceneId="switcher"
      showMarkingStyleToggle
    />
  );
}
