import type { ReactNode } from 'react';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import AiSummarizeIcon from '@mattermost/compass-icons/components/ai-summarize';
import MessageArrowRightOutlineIcon from '@mattermost/compass-icons/components/message-arrow-right-outline';
import AutoFixIcon from '@mattermost/compass-icons/components/auto-fix';
import type { AutomationIconKey } from '../channelAutomationsData';

/** Resolve an automation type's icon key to a compass icon glyph. */
export function automationGlyph(key: AutomationIconKey): ReactNode {
  switch (key) {
    case 'clock':
      return <ClockOutlineIcon />;
    case 'recap':
      return <AiSummarizeIcon />;
    case 'responder':
      return <MessageArrowRightOutlineIcon />;
    case 'custom':
      return <AutoFixIcon />;
  }
}
