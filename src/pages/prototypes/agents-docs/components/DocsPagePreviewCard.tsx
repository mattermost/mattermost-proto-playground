import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import CloseIcon from '@mattermost/compass-icons/components/close';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { useState } from 'react';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import styles from './DocsPagePreviewCard.module.scss';

type DocsPagePreviewCardProps = {
  approved?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
};

function DocsThumbnail() {
  return (
    <div className={styles['preview-card__thumbnail']}>
      <div className={styles['preview-card__thumbnail-topbar']}>
        <div className={styles['preview-card__thumbnail-dot']} />
        <div className={styles['preview-card__thumbnail-dot']} />
        <div className={styles['preview-card__thumbnail-dot']} />
        <div className={styles['preview-card__thumbnail-url']} />
      </div>
      <div className={styles['preview-card__thumbnail-body']}>
        <div className={styles['preview-card__thumbnail-sidebar']}>
          <div className={styles['preview-card__thumbnail-nav-item']} />
          <div className={styles['preview-card__thumbnail-nav-item']} />
          <div className={[styles['preview-card__thumbnail-nav-item'], styles['preview-card__thumbnail-nav-item--active']].join(' ')} />
          <div className={styles['preview-card__thumbnail-nav-item']} />
        </div>
        <div className={styles['preview-card__thumbnail-content']}>
          <div className={styles['preview-card__thumbnail-heading']} />
          <div className={[styles['preview-card__thumbnail-line'], styles['preview-card__thumbnail-line--full']].join(' ')} />
          <div className={[styles['preview-card__thumbnail-line'], styles['preview-card__thumbnail-line--medium']].join(' ')} />
          <div className={[styles['preview-card__thumbnail-line'], styles['preview-card__thumbnail-line--short']].join(' ')} />
          <div className={[styles['preview-card__thumbnail-line'], styles['preview-card__thumbnail-line--full']].join(' ')} />
        </div>
      </div>
    </div>
  );
}

function DocsFullView({ onApprove, onReject, onClose, approved }: {
  onApprove?: () => void;
  onReject?: () => void;
  onClose: () => void;
  approved?: boolean;
}) {
  const { rendered, exiting } = useExitAnimation(true, 300);

  const steps = [
    'Log in to your identity provider (IdP) admin console.',
    'Create a new SAML application and set the ACS URL to your Mattermost server.',
    'Download the IdP metadata XML file from your identity provider.',
    'In Mattermost System Console, go to Authentication > SAML 2.0.',
    'Upload the metadata XML file and enable SAML.',
    'Map the required attributes: Username, Email, and optionally FirstName, LastName.',
    'Test the connection using the "Test SAML" button, then save.',
  ];

  if (!rendered) return null;

  return (
    <div
      className={[
        styles['preview-card__overlay'],
        exiting ? styles['preview-card__overlay--exiting'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['preview-card__overlay-header']}>
        <h2 className={styles['preview-card__overlay-title']}>
          docs.mattermost.com — Staging Preview
        </h2>
        <IconButton
          aria-label="Close preview"
          size="small"
          padding="compact"
          icon={<Icon size="16" glyph={<CloseIcon />} />}
          onClick={onClose}
        />
      </div>
      <div className={styles['preview-card__overlay-body']}>
        <nav className={styles['preview-card__docs-sidebar']}>
          <span className={styles['preview-card__docs-nav-section']}>Onboarding</span>
          <button type="button" className={styles['preview-card__docs-nav-item']}>Overview</button>
          <button type="button" className={styles['preview-card__docs-nav-item']}>Invite users</button>
          <button type="button" className={[styles['preview-card__docs-nav-item'], styles['preview-card__docs-nav-item--active']].join(' ')}>SSO setup</button>
          <button type="button" className={styles['preview-card__docs-nav-item']}>Channels</button>
          <span className={styles['preview-card__docs-nav-section']}>Authentication</span>
          <button type="button" className={styles['preview-card__docs-nav-item']}>SAML 2.0</button>
          <button type="button" className={styles['preview-card__docs-nav-item']}>OAuth 2.0</button>
          <button type="button" className={styles['preview-card__docs-nav-item']}>MFA</button>
        </nav>
        <div className={styles['preview-card__docs-content']}>
          <h1 className={styles['preview-card__docs-heading']}>SSO setup</h1>
          <p className={styles['preview-card__docs-body']}>
            Mattermost supports SAML 2.0 and OAuth 2.0 for single sign-on. Follow the steps below to configure SAML-based SSO for your workspace.
          </p>
          <h2 className={styles['preview-card__docs-subheading']}>Configure SAML 2.0</h2>
          <ol className={styles['preview-card__docs-steps']}>
            {steps.map((step, i) => (
              <li key={i} className={styles['preview-card__docs-step']}>
                <span className={styles['preview-card__docs-step-num']}>{i + 1}</span>
                <span className={styles['preview-card__docs-step-text']}>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {!approved && (
        <div className={styles['preview-card__overlay-footer']}>
          <Button emphasis="quaternary" onClick={onReject}>Reject</Button>
          <Button emphasis="primary" onClick={onApprove}>Approve</Button>
        </div>
      )}
    </div>
  );
}

export default function DocsPagePreviewCard({ approved, onApprove, onReject }: DocsPagePreviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={[styles['preview-card'], approved ? styles['preview-card--approved'] : ''].filter(Boolean).join(' ')}>
      <DocsThumbnail />
      <div className={styles['preview-card__info']}>
        <div className={styles['preview-card__info-text']}>
          <p className={styles['preview-card__title']}>docs.mattermost.com — Staging Preview</p>
          <p className={styles['preview-card__subtitle']}>SSO setup page — ready to review</p>
        </div>
        <div className={styles['preview-card__info-actions']}>
          {approved ? (
            <span className={styles['preview-card__approved-label']}>Approved by Jordan</span>
          ) : (
            <>
              <Button emphasis="quaternary" size="small" onClick={onReject}>Reject</Button>
              <Button emphasis="primary" size="small" onClick={onApprove}>Approve</Button>
            </>
          )}
          <IconButton
            aria-label="Expand preview"
            size="small"
            padding="compact"
            icon={<Icon size="16" glyph={<ArrowExpandIcon />} />}
            onClick={() => setExpanded(true)}
          />
        </div>
      </div>
      {expanded && (
        <DocsFullView
          onApprove={() => { onApprove?.(); setExpanded(false); }}
          onReject={() => { onReject?.(); setExpanded(false); }}
          onClose={() => setExpanded(false)}
          approved={approved}
        />
      )}
    </div>
  );
}
