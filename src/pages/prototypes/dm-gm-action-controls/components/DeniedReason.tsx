// [AI DRAFT] Neutral denial copy. Never names an attribute, a policy, or a member.
// Direction B appends "Contact support", which opens the deployment's Help Link
// (Site Configuration > Customization). It is the same link for every policy.
// Copy is draft for the first pass.
import type { DirectionId } from '../dmgmScenes';
import { DENIED_COPY, HELP_LINK_URL, type DeniedKind } from '../deniedCopy';
import styles from './DeniedReason.module.scss';

export interface DeniedReasonProps {
  kind: DeniedKind;
  direction: DirectionId;
  id?: string;
  /** Render as an inline span instead of a paragraph. */
  inline?: boolean;
}

export function SupportLink() {
  return (
    <a
      className={styles['denied-reason__link']}
      href={HELP_LINK_URL}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.preventDefault()}
    >
      Contact support
    </a>
  );
}

export default function DeniedReason({
  kind,
  direction,
  id,
  inline = false,
}: DeniedReasonProps) {
  const Tag = inline ? 'span' : 'p';
  return (
    <Tag id={id} className={styles['denied-reason']}>
      {DENIED_COPY[kind]}
      {direction === 'b' ? (
        <>
          {' '}
          <SupportLink />
        </>
      ) : null}
    </Tag>
  );
}
