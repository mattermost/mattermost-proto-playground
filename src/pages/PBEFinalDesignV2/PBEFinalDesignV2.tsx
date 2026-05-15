/**
 * PBE Final Design V2 — wired state machine.
 *
 * 11-state state machine for the Program-Based Encryption prototype. URL
 * deep-linking via `?state=<key>`. When `?dev=1` is present, a floating
 * dev toolbar lets you cycle through all states.
 */
import { useCallback, useEffect, useState } from 'react';
import AdminConsole from './_states/AdminConsole';
import EMConfigurations from './_states/EMConfigurations';
import EMChannels from './_states/EMChannels';
import EMAddConfig from './_states/EMAddConfig';
import EMEditConfig from './_states/EMEditConfig';
import EMTestConfig from './_states/EMTestConfig';
import EMCreateStep1 from './_states/EMCreateStep1';
import EMCreateStep2 from './_states/EMCreateStep2';
import InChannelMain from './_states/InChannelMain';
import InChannelEncryption from './_states/InChannelEncryption';
import InChannelMember from './_states/InChannelMember';
import DevToolbar from './_components/DevToolbar';
import styles from './PBEFinalDesignV2.module.scss';

const STATES = [
  { key: 'admin-console', label: 'Admin: System Console' },
  { key: 'em-configurations', label: 'EM: Configurations' },
  { key: 'em-channels', label: 'EM: My Channels' },
  { key: 'em-add-config', label: 'EM: Add Configuration' },
  { key: 'em-edit-config', label: 'EM: Edit Configuration' },
  { key: 'em-test-config', label: 'EM: Test Configuration' },
  { key: 'em-create-step1', label: 'Create Channel — Step 1' },
  { key: 'em-create-step2', label: 'Create Channel — Step 2' },
  { key: 'in-channel-main', label: 'In-Channel: Main' },
  { key: 'in-channel-encryption', label: 'In-Channel: Encryption' },
  { key: 'in-channel-member', label: 'In-Channel: Member View' },
] as const;

type StateKey = (typeof STATES)[number]['key'];

const VALID_KEYS = new Set<string>(STATES.map((s) => s.key));

function readSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function readInitialState(): StateKey {
  const k = readSearchParams().get('state');
  return k && VALID_KEYS.has(k) ? (k as StateKey) : 'admin-console';
}

function readDevMode(): boolean {
  return readSearchParams().get('dev') === '1';
}

export default function PBEFinalDesignV2() {
  const [activeState, setActiveState] = useState<StateKey>(readInitialState);
  const [devMode] = useState<boolean>(readDevMode);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('state', activeState);
    window.history.replaceState({}, '', url);
  }, [activeState]);

  const navigate = useCallback((k: StateKey) => setActiveState(k), []);

  return (
    <div className={styles['pbe']}>
      <div className={styles['pbe__frame']}>
        {activeState === 'admin-console' && <AdminConsole />}
        {activeState === 'em-configurations' && (
          <EMConfigurations
            onClose={() => navigate('in-channel-main')}
            onAddConfig={() => navigate('em-add-config')}
            onEditConfig={() => navigate('em-edit-config')}
            onTestConfig={() => navigate('em-test-config')}
            onNavigateChannels={() => navigate('em-channels')}
          />
        )}
        {activeState === 'em-channels' && (
          <EMChannels
            onClose={() => navigate('in-channel-main')}
            onCreateChannel={() => navigate('em-create-step1')}
            onManageChannel={() => navigate('in-channel-encryption')}
            onNavigateConfigurations={() => navigate('em-configurations')}
          />
        )}
        {activeState === 'em-add-config' && (
          <EMAddConfig
            onClose={() => navigate('in-channel-main')}
            onDismissForm={() => navigate('em-configurations')}
          />
        )}
        {activeState === 'em-edit-config' && (
          <EMEditConfig
            onClose={() => navigate('in-channel-main')}
            onDismissForm={() => navigate('em-configurations')}
          />
        )}
        {activeState === 'em-test-config' && (
          <EMTestConfig
            onClose={() => navigate('in-channel-main')}
            onAddConfig={() => navigate('em-add-config')}
            onEditConfig={() => navigate('em-edit-config')}
            onTestConfig={() => navigate('em-test-config')}
            onNavigateChannels={() => navigate('em-channels')}
          />
        )}
        {activeState === 'em-create-step1' && (
          <EMCreateStep1
            onCancel={() => navigate('in-channel-main')}
            onNext={() => navigate('em-create-step2')}
          />
        )}
        {activeState === 'em-create-step2' && (
          <EMCreateStep2
            onCancel={() => navigate('in-channel-main')}
            onBack={() => navigate('em-create-step1')}
            onCreate={() => navigate('in-channel-main')}
          />
        )}
        {activeState === 'in-channel-main' && (
          <InChannelMain
            onOpenEncryption={() => navigate('in-channel-encryption')}
            onOpenEncryptionManagement={() => navigate('em-configurations')}
          />
        )}
        {activeState === 'in-channel-encryption' && (
          <InChannelEncryption
            onCloseEncryption={() => navigate('in-channel-main')}
            onOpenEncryptionManagement={() => navigate('em-configurations')}
          />
        )}
        {activeState === 'in-channel-member' && (
          <InChannelMember
            onCloseEncryption={() => navigate('in-channel-main')}
            onOpenEncryptionManagement={() => navigate('em-configurations')}
          />
        )}
      </div>

      {devMode && (
        <DevToolbar
          activeKey={activeState}
          options={STATES}
          onChange={(k) => navigate(k as StateKey)}
        />
      )}
    </div>
  );
}
