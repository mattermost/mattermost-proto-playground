import { ReactionPill } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function ReactionPillLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Types</span>
          <ReactionPill type="Reaction" emoji="🎉" label="Leonard R." />
          <ReactionPill type="Hand Raise" label="Danielle O." />
          <ReactionPill
            type="Other"
            message="You have been muted by the host"
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <ReactionPill
            type="Reaction"
            emoji="👍"
            label="Marco R."
            size="Small"
          />
          <ReactionPill
            type="Reaction"
            emoji="👍"
            label="Marco R."
            size="Medium"
          />
          <ReactionPill
            type="Reaction"
            emoji="👍"
            label="Marco R."
            size="Large"
          />
        </div>
      </div>
    </>
  );
}
