import { Button } from '@mattermost/compass-ui/components/button';
import { useWalkthrough } from '@/walkthrough/useWalkthrough';

/** Top-right playground chrome: enter / exit walkthrough mode. */
export default function WalkthroughModeControl() {
  const { document, active, enter, exit } = useWalkthrough();

  if (!document) return null;

  if (!active) {
    return (
      <Button emphasis="tertiary" size="small" onClick={enter}>
        Walkthrough
      </Button>
    );
  }

  return (
    <Button emphasis="secondary" size="small" onClick={exit} aria-pressed>
      Exit
    </Button>
  );
}
