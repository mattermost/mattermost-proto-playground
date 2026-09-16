import GithubCircleIcon from '@mattermost/compass-icons/components/github-circle';
import SourcePullIcon from '@mattermost/compass-icons/components/source-pull';
import { Button } from '@mattermost/compass-ui/components/button';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import styles from './GitHubPrCard.module.scss';

type GitHubPrCardProps = {
  title: string;
  branch: string;
  authorName: string;
  authorAvatarSrc: string;
  prNumber: number;
  repoSlug: string;
  reviewers?: Array<{ name: string; avatarSrc: string }>;
  approved?: boolean;
  merged?: boolean;
  onApprove?: () => void;
};

export default function GitHubPrCard({
  title,
  branch,
  authorName,
  authorAvatarSrc,
  prNumber,
  repoSlug,
  reviewers,
  approved = false,
  merged = false,
  onApprove,
}: GitHubPrCardProps) {
  const statusLabel = merged ? 'Merged' : approved ? 'Approved' : 'Awaiting review';
  return (
    <div className={[styles['gh-pr-card'], merged ? styles['gh-pr-card--merged'] : ''].filter(Boolean).join(' ')}>
      <div className={styles['gh-pr-card__border']} />
      <div className={styles['gh-pr-card__body']}>
        <div className={styles['gh-pr-card__header']}>
          <Icon
            glyph={<SourcePullIcon />}
            size="16"
            className={styles['gh-pr-card__pr-icon']}
          />
          <div className={styles['gh-pr-card__title-row']}>
            <span className={styles['gh-pr-card__title']}>{title}</span>
            <Chip size="small" className={styles['gh-pr-card__status-chip']}>
              {statusLabel}
            </Chip>
          </div>
        </div>

        <div className={styles['gh-pr-card__meta']}>
          <UserAvatar src={authorAvatarSrc} alt={authorName} size="16" />
          <span className={styles['gh-pr-card__meta-text']}>
            <strong>{authorName}</strong>
            {' · '}
            <span className={styles['gh-pr-card__mono']}>{repoSlug}</span>
            {' · '}
            <span className={styles['gh-pr-card__mono']}>{branch}</span>
            {' → main'}
          </span>
        </div>
        {reviewers && reviewers.length > 0 && (
          <div className={styles['gh-pr-card__meta']}>
            <UserAvatar src={reviewers[0].avatarSrc} alt={reviewers[0].name} size="16" />
            <span className={styles['gh-pr-card__meta-text']}>
              <strong>{reviewers[0].name}</strong>
              {' · Reviewer'}
            </span>
          </div>
        )}

        <div className={styles['gh-pr-card__footer']}>
          <div className={styles['gh-pr-card__repo-badge']}>
            <Icon glyph={<GithubCircleIcon />} size="14" />
            <span className={styles['gh-pr-card__pr-number']}>#{prNumber}</span>
          </div>
          <div className={styles['gh-pr-card__actions']}>
            <Button emphasis="tertiary" size="small">
              View PR
            </Button>
            {!approved && !merged && (
              <Button emphasis="primary" size="small" onClick={onApprove}>
                Approve
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
