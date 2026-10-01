import { SUPPORT_LINK_TEXT, TARGET_NOUN } from '../copy';

// [AI DRAFT] Shared reviewer notes. Rendered in the caption ABOVE the frame only.

export const ENGINE_NOTE = `Engineering dependency: conditions on the ${TARGET_NOUN} need a target variable in the policy engine, which does not exist yet. This prototype shows the finished product.`;

export const SUPPORT_LINK_NOTE_B = `Direction B adds “${SUPPORT_LINK_TEXT}” after the message. It opens the Help Link set under Site Configuration > Customization, and is shown only when an admin has set a custom value. The link is the same for every policy, so it reveals nothing about why.`;

export const SUPPORT_LINK_NOTE_A =
  'Direction A shows the neutral message only, with no route to help. Switch to Direction B to see the support link.';
