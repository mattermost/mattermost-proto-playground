import { useState } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import Button from '@/components/ui/Button/Button';
import ConsoleSetting from '@/components/ui/ConsoleSetting/ConsoleSetting';
import Icon from '@/components/ui/Icon/Icon';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import Switch from '@/components/ui/Switch/Switch';
import TextInput from '@/components/ui/TextInput/TextInput';
import ConsoleFrame from '../shared/ConsoleFrame';
import styles from './SettingsPage.module.scss';

interface SettingsPageProps {
  onBack?: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const [enforceDeviceId, setEnforceDeviceId] = useState(true);
  const [concurrentLimit, setConcurrentLimit] = useState('10');
  const [saved, setSaved] = useState(false);

  const limitNum = Number(concurrentLimit);
  const limitError = (() => {
    if (!Number.isFinite(limitNum) || limitNum < 1) return 'Minimum: 1';
    if (limitNum > 50) return 'Maximum: 50';
    return null;
  })();

  function handleSave() {
    if (limitError) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }

  return (
    <ConsoleFrame
      title="Session Attributes — Settings"
      activeItemId="session-attributes"
      enterpriseTag
      backButton
      onBack={onBack}
      trailing={
        <Button
          emphasis="Primary"
          size="Small"
          disabled={Boolean(limitError)}
          onClick={handleSave}
          leadingIcon={saved ? <Icon size="16" glyph={<CheckIcon />} /> : undefined}
        >
          {saved ? 'Saved' : 'Save'}
        </Button>
      }
    >
      <SectionNotice
        type="Info"
        title="Refresh timing is now per-attribute"
        description="TTL and grace period are configured per attribute on the Session Attributes listing page. Use this Settings page for system-wide controls only."
      />

      <div className={styles['settings__panel']}>
        <div className={styles['settings__panel-header']}>
          Security
        </div>
        <div className={styles['settings__panel-body']}>
          <ConsoleSetting
            label="Enforce device-ID consistency"
            helpText={
              <>
                When on, sessions whose reported <code>device_id</code> changes mid-session are
                revoked and the affected user is signed out for re-authentication.
                When off, mismatches silently overwrite the cached value.
                {' '}<strong>Default: On.</strong>
              </>
            }
          >
            <Switch
              checked={enforceDeviceId}
              onChange={(e) => setEnforceDeviceId(e.target.checked)}
              aria-label="Enforce device-ID consistency"
            >
              {enforceDeviceId ? 'On' : 'Off'}
            </Switch>
          </ConsoleSetting>
        </div>
      </div>

      <div className={styles['settings__panel']}>
        <div className={styles['settings__panel-header']}>
          Session limits
          <LabelTag label="Pending confirmation" type="Warning" size="X-Small" />
        </div>
        <div className={styles['settings__panel-body']}>
          <ConsoleSetting
            label="Concurrent session limit"
            helpText="Maximum simultaneous sessions per user. When the limit is reached, the oldest session is terminated to make room for a new one. Pending backend-team confirmation that this is owned here (see UX spec §10.3)."
          >
            <div className={styles['settings__row']}>
              <TextInput
                size="Medium"
                value={concurrentLimit}
                invalid={Boolean(limitError)}
                onChange={(e) => setConcurrentLimit(e.target.value)}
                className={styles['settings__numeric']}
                inputMode="numeric"
              />
              <span className={styles['settings__unit-label']}>sessions</span>
            </div>
            {limitError && (
              <p className={styles['settings__error']}>{limitError}</p>
            )}
          </ConsoleSetting>
        </div>
      </div>

      <div className={styles['settings__panel']}>
        <div className={styles['settings__panel-header']}>Feature gate</div>
        <div className={styles['settings__panel-body']}>
          <dl className={styles['settings__readonly-dl']}>
            <div className={styles['settings__readonly-row']}>
              <dt>Feature flag</dt>
              <dd>
                <code>SessionAttributes</code>
                <LabelTag label="On" type="Success" size="X-Small" />
              </dd>
            </div>
            <div className={styles['settings__readonly-row']}>
              <dt>License gate</dt>
              <dd>Enterprise Advanced</dd>
            </div>
          </dl>
        </div>
      </div>

      <p className={styles['settings__footnote']}>
        Per-decision audit logging is not part of V1; it lands with the access-control team's
        separate audit workstream. See UX spec §10.2.
      </p>
    </ConsoleFrame>
  );
}
