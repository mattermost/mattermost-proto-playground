// [AI DRAFT] Save confirmation. The page already shows the reading and the
// warnings, so this asks once, with the single consequence of saving.
// Cancel is the safe default; Save is the one primary action.
import { Button } from '@mattermost/compass-ui/components/button';
import { Modal } from '@mattermost/compass-ui/components/modal';
import { noOnePasses, type NewlyAllowed } from '../model/behaviourDiff';
import type { Policy } from '../model/rules';
import type { Vocabulary } from '../model/vocabulary';
import { SAVE } from '../copy';
import { impactLines, provenLooser, vocabForRole } from './pageHelpers';
import styles from './SaveConfirmModal.module.scss';

function consequence(
  noOne: ReturnType<typeof noOnePasses> | null,
  widening: string[],
  lines: string[],
): string {
  if (noOne && noOne.permissions.length > 0) {
    return noOne.all ? SAVE.noOne : SAVE.noOneSome;
  }
  if (widening.length > 0) {
    return provenLooser(widening) ? SAVE.looser : SAVE.uncompared;
  }
  const facts =
    lines.length <= 1 ? lines[0] ?? '' : `${lines.slice(0, -1).join(', ')} and ${lines[lines.length - 1]}`;
  return SAVE.missing(facts);
}

export default function SaveConfirmModal({
  policy,
  vocab: baseVocab,
  widening = [],
  cel,
  onClose,
}: {
  /** Sample pairs newly allowed (behavioural check). Kept for the caller. */
  pairs?: NewlyAllowed;
  policy: Policy;
  saved: Policy;
  vocab: Vocabulary;
  widening?: string[];
  /** The expression as written, when it can't be read back as rules. */
  cel?: string;
  onClose: () => void;
}) {
  const vocab = vocabForRole(baseVocab, policy.role);
  const lines = cel ? [] : impactLines(policy.root, vocab);
  const noOne = cel ? null : noOnePasses(policy);
  return (
    <Modal
      size="small"
      title={SAVE.title}
      onClose={onClose}
      footer={
        <>
          <Button emphasis="tertiary" onClick={onClose}>
            {SAVE.cancel}
          </Button>
          <Button emphasis="primary" onClick={onClose}>
            {SAVE.confirm}
          </Button>
        </>
      }
    >
      <p className={styles['save-confirm__text']}>{consequence(noOne, widening, lines)}</p>
    </Modal>
  );
}
