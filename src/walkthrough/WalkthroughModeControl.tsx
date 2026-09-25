import ExitToAppIcon from '@mattermost/compass-icons/components/exit-to-app';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import MapLegendIcon from '@/walkthrough/MapLegendIcon';
import { useWalkthrough } from '@/walkthrough/useWalkthrough';

/** Top-right playground chrome: enter / exit walkthrough mode. */
export default function WalkthroughModeControl() {
  const { document, active, enter, exit } = useWalkthrough();

  if (!document) return null;

  if (!active) {
    return (
      <Button
        emphasis="tertiary"
        size="small"
        leadingIcon={<Icon size="16" glyph={<MapLegendIcon />} />}
        onClick={enter}
      >
        Start walkthrough
      </Button>
    );
  }

  return (
    <Button
      emphasis="tertiary"
      size="small"
      leadingIcon={<Icon size="16" glyph={<ExitToAppIcon />} />}
      onClick={exit}
      aria-pressed
    >
      Exit walkthrough
    </Button>
  );
}
