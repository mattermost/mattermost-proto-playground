import { useState } from 'react';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import CheckIcon from '@mattermost/compass-icons/components/check';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import { Icon } from '@mattermost/compass-ui';
import { IconButton } from '@mattermost/compass-ui';
import { Switch } from '@mattermost/compass-ui';
import { Button } from '@mattermost/compass-ui';
import styles from './CallInfoPanel.module.scss';

export type CallInfoPanelVariant = 'host' | 'guest';

export interface CallInfoPanelProps {
  className?: string;
  /** Panel variant. 'host' shows internal link + external-participants toggle. 'guest' shows only external details (for external-link participants). Default: 'host'. */
  variant?: CallInfoPanelVariant;
  /** Internal channel join URL. Ignored in 'guest' variant. */
  internalLink?: string;
  /** External guest URL shown when external participants are enabled. */
  externalLink: string;
  /** Dial-in phone number shown when SIP is enabled. */
  dialInNumber: string;
  /** Dial-in PIN shown when SIP is enabled. */
  dialInPin: string;
  /** Whether the "Enable external participants" toggle is on. Ignored in 'guest' variant (always treated as enabled). */
  externalEnabled?: boolean;
  /** Toggle handler. Ignored in 'guest' variant. */
  onExternalEnabledChange?: (next: boolean) => void;
  /** Settings cog click (opens link-type/SIP settings popover — wired to console.log for now). Ignored in 'guest' variant. */
  onSettingsClick?: () => void;
  /** When true, panel fills its container's width instead of its fixed 366px. */
  fullWidth?: boolean;
  /** When provided, shows a close IconButton in the header that triggers this. */
  onClose?: () => void;
}

export default function CallInfoPanel({
  className = '',
  variant = 'host',
  internalLink,
  externalLink,
  dialInNumber,
  dialInPin,
  externalEnabled,
  onExternalEnabledChange,
  onSettingsClick,
  fullWidth = false,
  onClose,
}: CallInfoPanelProps) {
  const isGuest = variant === 'guest';
  const externalVisible = isGuest || externalEnabled === true;
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
    } catch {
      // no-op: prototype
    }
  };

  const rootClass = [
    styles['call-info'],
    fullWidth ? styles['call-info--full-width'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} role="dialog" aria-label="Call info">
      <header className={styles['call-info__header']}>
        <span className={styles['call-info__title']}>Call info</span>
        {onClose && (
          <IconButton
            size="Small"
            padding="Compact"
            aria-label="Close call info"
            icon={<Icon size="16" glyph={<CloseIcon />} />}
            onClick={onClose}
          />
        )}
      </header>

      {!isGuest && internalLink && (
        <>
          <section className={styles['call-info__section']}>
            <div className={styles['call-info__eyebrow']}>INTERNAL LINK</div>
            <div className={styles['call-info__kv']}>
              <span className={styles['call-info__value']}>{internalLink}</span>
              <IconButton
                size="Small"
                padding="Compact"
                aria-label={
                  copied === 'internal'
                    ? 'Copied internal link'
                    : 'Copy internal link'
                }
                icon={
                  <Icon
                    size="16"
                    glyph={
                      copied === 'internal' ? (
                        <CheckIcon />
                      ) : (
                        <ContentCopyIcon />
                      )
                    }
                  />
                }
                onClick={() => copy('internal', internalLink)}
              />
            </div>
          </section>

          <div className={styles['call-info__divider']} role="separator" />
        </>
      )}

      <section className={styles['call-info__section']}>
        {!isGuest && (
          <div className={styles['call-info__toggle-row']}>
            <Switch
              className={styles['call-info__switch']}
              size="Medium"
              semiBold
              checked={externalEnabled}
              onChange={(e) =>
                onExternalEnabledChange?.(e.currentTarget.checked)
              }
            >
              {fullWidth
                ? 'External participants'
                : 'Enable external participants'}
            </Switch>
            <IconButton
              size="Small"
              padding="Compact"
              aria-label="External link settings"
              icon={<Icon size="16" glyph={<CogOutlineIcon />} />}
              onClick={onSettingsClick}
            />
          </div>
        )}

        {externalVisible && (
          <div className={styles['call-info__external']}>
            <div className={styles['call-info__group']}>
              <div className={styles['call-info__eyebrow']}>EXTERNAL LINK</div>
              <div className={styles['call-info__kv']}>
                <span className={styles['call-info__value']}>
                  {externalLink}
                </span>
                <IconButton
                  size="Small"
                  padding="Compact"
                  aria-label={
                    copied === 'external'
                      ? 'Copied external link'
                      : 'Copy external link'
                  }
                  icon={
                    <Icon
                      size="16"
                      glyph={
                        copied === 'external' ? (
                          <CheckIcon />
                        ) : (
                          <ContentCopyIcon />
                        )
                      }
                    />
                  }
                  onClick={() => copy('external', externalLink)}
                />
              </div>
            </div>

            <div className={styles['call-info__group']}>
              <div className={styles['call-info__inline']}>
                <span className={styles['call-info__label']}>Dial-in:</span>
                <span className={styles['call-info__value']}>
                  {dialInNumber}
                </span>
              </div>
              <div className={styles['call-info__inline']}>
                <span className={styles['call-info__label']}>PIN:</span>
                <span className={styles['call-info__value']}>{dialInPin}</span>
              </div>
            </div>

            <Button
              size="Small"
              emphasis="Tertiary"
              leadingIcon={
                <Icon
                  size="12"
                  glyph={
                    copied === 'full' ? <CheckIcon /> : <ContentCopyIcon />
                  }
                />
              }
              onClick={() =>
                copy(
                  'full',
                  `${externalLink}\nDial-in: ${dialInNumber}\nPIN: ${dialInPin}`,
                )
              }
            >
              {copied === 'full' ? 'Copied' : 'Copy full details'}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
