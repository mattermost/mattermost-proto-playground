import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { useHref } from 'react-router-dom';
import styles from './DocsPagePreviewCard.module.scss';

type DocsPagePreviewCardProps = {
  approved?: boolean;
  showActions?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
};

export default function DocsPagePreviewCard({ approved, showActions = true, onApprove, onReject }: DocsPagePreviewCardProps) {
  const previewHref = useHref('/agents-docs-preview');

  function openPreview() {
    window.open(previewHref, 'agents-docs-preview', 'width=960,height=700,left=200,top=100,resizable=yes');
  }

  return (
    <div className={[styles['preview-card'], approved ? styles['preview-card--approved'] : ''].filter(Boolean).join(' ')}>

      {/* Live iframe preview scaled to fit */}
      <div className={styles['preview-card__preview']}>
        <iframe
          src={previewHref}
          className={styles['preview-card__iframe']}
          title="Docs staging preview"
          tabIndex={-1}
          aria-hidden="true"
          scrolling="no"
        />
      </div>

      {/* Title + subtitle — full card width */}
      <div className={styles['preview-card__body']}>
        <p className={styles['preview-card__title']}>docs.mattermost.com — Staging Preview</p>
        <p className={styles['preview-card__subtitle']}>SSO setup page — ready to review</p>
      </div>

      {/* Actions row */}
      <div className={styles['preview-card__footer']}>
        <div className={styles['preview-card__footer-actions']}>
          {showActions && (
            approved ? (
              <span className={styles['preview-card__approved-label']}>Approved by Jordan</span>
            ) : (
              <>
                <Button emphasis="primary" size="small" onClick={onApprove}>Approve</Button>
                <Button emphasis="quaternary" size="small" onClick={onReject}>Request changes</Button>
              </>
            )
          )}
        </div>
        <IconButton
          aria-label="Open preview"
          size="small"
          padding="compact"
          icon={<Icon size="16" glyph={<ArrowExpandIcon />} />}
          onClick={openPreview}
        />
      </div>

    </div>
  );
}
