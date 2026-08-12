import EyeOffOutlineIcon from '@mattermost/compass-icons/components/eye-off-outline';
import Chip from '@/components/ui/Chip/Chip';
import Icon from '@/components/ui/Icon/Icon';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  MEMBER_MASK_NOTICE,
  VIEWER_DISPLAY_NAME,
  grantsSentence,
  heldSentence,
  labelOf,
  memberReachSentence,
  memberWhySentence,
  pathsTo,
  type CoverageResult,
  type GraphOption,
} from '../accessModel';
import styles from './MemberAccessSummary.module.scss';

export interface MemberAccessSummaryProps {
  /** The SCOPED graph — the viewer's down-set and nothing else. */
  scoped: GraphOption[];
  heldIds: readonly string[];
  /** Coverage result computed on the scoped graph. Null when nothing selected. */
  result: CoverageResult | null;
  onSelect: (id: string) => void;
}

/**
 * "What access do I have?" — the member-side answer.
 *
 * MASKED-EXPLANATION CONSTRAINT BEING HONOURED HERE
 * -------------------------------------------------
 * The obvious explanation for why a member reaches a value is to name the value
 * above it: "you can enter because Falcon Wing is above you". That sentence
 * discloses the existence of Falcon Wing, which may sit OUTSIDE the viewer's
 * down-set — the identical leak the masked value list exists to prevent. Every
 * sentence on this surface is therefore generated from `scoped`, which contains
 * only the viewer's own values, so the only things it can name are values the
 * viewer holds or values they can already reach. Ancestors above the viewer are
 * not named, not counted, and not alluded to.
 *
 * Corollary, also honoured: absolute count suppression. There is no "+N more",
 * no "some values hidden", and no total of anything withheld anywhere on this
 * surface. A value outside the down-set is indistinguishable from a value that
 * does not exist.
 */
export default function MemberAccessSummary({
  scoped,
  heldIds,
  result,
  onSelect,
}: MemberAccessSummaryProps) {
  const held = new Set(heldIds);
  const reachable = scoped.filter((o) => !held.has(o.id));

  return (
    <aside className={styles['me']} aria-label="Your access">
      <header className={styles['me__header']}>
        <UserAvatar size="40" src={avatarLeonard} alt={VIEWER_DISPLAY_NAME} />
        <div className={styles['me__identity']}>
          <p className={styles['me__name']}>{VIEWER_DISPLAY_NAME}</p>
          <p className={styles['me__held']}>{heldSentence(scoped, heldIds)}</p>
        </div>
      </header>

      <section className={styles['me__section']}>
        <p className={styles['me__section-title']}>Programs you hold</p>
        <ul className={styles['me__chips']}>
          {heldIds.map((id) => (
            <li key={id} className={styles['me__chip']}>
              <Chip
                size="Small"
                as="button"
                tone="success"
                onClick={() => onSelect(id)}
              >
                {labelOf(scoped, id)}
              </Chip>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles['me__section']}>
        <p className={styles['me__section-title']}>What that reaches</p>
        <p className={styles['me__sentence']}>
          {memberReachSentence(scoped, heldIds)}
        </p>
        {reachable.length > 0 && (
          <ul className={styles['me__chips']}>
            {reachable.map((o) => (
              <li key={o.id} className={styles['me__chip']}>
                <Chip size="Small" as="button" onClick={() => onSelect(o.id)}>
                  {o.label}
                </Chip>
              </li>
            ))}
          </ul>
        )}
      </section>

      {result && (
        <section className={styles['me__section']}>
          <p className={styles['me__section-title']}>{result.label}</p>
          {/* Masked explanation: names only the value the viewer holds. */}
          <p className={styles['me__sentence']}>
            {memberWhySentence(scoped, result.id, heldIds)}
          </p>
          <p className={styles['me__sentence']}>
            {grantsSentence(scoped, result)}
          </p>
          <div className={styles['me__paths']}>
            <p className={styles['me__paths-title']}>Path from what you hold</p>
            <ul className={styles['me__path-list']}>
              {pathsTo(scoped, result.id).map((path) => (
                <li key={path.join('>')} className={styles['me__path']}>
                  {path.join(' ▸ ')}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <SectionNotice
        type="Info"
        icon={<Icon size="20" glyph={<EyeOffOutlineIcon />} />}
        title="You are seeing only your own access"
        description={MEMBER_MASK_NOTICE}
      />
    </aside>
  );
}
