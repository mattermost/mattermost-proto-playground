import { useEffect, useRef, useState } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { VIEWER, type AgentToolAuthCard as AuthCardData } from '../agentsData';
import {
  isAgentsProtoOAuthResult,
  openFakeProviderOAuth,
} from './openFakeProviderOAuth';
import styles from './AgentToolAuthCard.module.scss';

type AgentToolAuthCardProps = {
  card: AuthCardData;
  onConnected?: (card: AuthCardData) => void;
};

function providerLabel(provider: AuthCardData['provider']): string {
  if (provider === 'github') return 'GitHub';
  if (provider === 'atlassian') return 'Atlassian';
  return 'Google';
}

/**
 * Interactive message attachment: fake provider OAuth in a popup window.
 * Completing Allow marks the tool connected in the chat (no real OAuth).
 */
export default function AgentToolAuthCard({
  card,
  onConnected,
}: AgentToolAuthCardProps) {
  const label = providerLabel(card.provider);
  const [waiting, setWaiting] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const connected = Boolean(card.connected);

  useEffect(() => {
    if (!waiting) return;

    const onMessage = (event: MessageEvent) => {
      if (event.source !== popupRef.current) return;
      if (!isAgentsProtoOAuthResult(event.data)) return;
      if (event.data.toolId !== card.toolId) return;

      setWaiting(false);
      popupRef.current = null;
      if (event.data.status === 'success') {
        onConnected?.(card);
      }
    };

    const pollClosed = window.setInterval(() => {
      if (popupRef.current && popupRef.current.closed) {
        setWaiting(false);
        popupRef.current = null;
      }
    }, 400);

    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      window.clearInterval(pollClosed);
    };
  }, [waiting, card, onConnected]);

  return (
    <div
      className={[
        styles['tool-auth-card'],
        connected ? styles['tool-auth-card--connected'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['tool-auth-card__body']}>
        <h3 className={styles['tool-auth-card__title']}>
          {connected ? `Connected to ${label}` : `Authenticate with ${label}`}
        </h3>
        <p className={styles['tool-auth-card__description']}>
          {connected
            ? `${card.toolLabel} is ready for Matty to use.`
            : `Continue to ${label} to grant access to ${card.toolLabel}.`}
        </p>
        {connected ? (
          <div className={styles['tool-auth-card__connected']}>
            <Icon glyph={<CheckIcon />} size="16" />
            <span>Authentication complete</span>
          </div>
        ) : (
          <Button
            emphasis="primary"
            size="medium"
            disabled={waiting}
            onClick={() => {
              const popup = openFakeProviderOAuth(card, {
                name: VIEWER.name,
                email: 'priya.shah@example.com',
              });
              if (!popup) {
                // Popup blocked — complete in-place so the prototype still works.
                onConnected?.(card);
                return;
              }
              popupRef.current = popup;
              setWaiting(true);
            }}
          >
            {waiting ? 'Waiting for sign-in…' : `Continue with ${label}`}
          </Button>
        )}
      </div>
    </div>
  );
}
