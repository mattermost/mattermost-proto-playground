import { AdminConsoleFooter } from '@mattermost/compass-ui/components/admin-console-footer';
import { AdminConsoleHeader } from '@mattermost/compass-ui/components/admin-console-header';
import { AdminPanel } from '@mattermost/compass-ui/components/admin-panel';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { SectionNotice } from '@mattermost/compass-ui/components/section-notice';
import { Select } from '@mattermost/compass-ui/components/select';
import { TextArea } from '@mattermost/compass-ui/components/text-area';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import {
  BooleanSetting,
  SettingRow,
} from '@/pages/prototypes/calls-admin-console/components/SettingRow';
import {
  CALLS_DOCS_URL,
  DEFAULT_ICE_SERVERS,
  RECORDING_QUALITY_OPTIONS,
  TRANSCRIBER_MODEL_OPTIONS,
} from '@/pages/prototypes/calls-admin-console/callsAdminConsoleData';
import styles from '@/pages/prototypes/calls-admin-console/CallsAdminConsole.module.scss';

/** Calls plugin System Console page: header, beta notice, settings panels, Save / Cancel. */
export function SettingsScene() {
  return (
    <>
      <div className={styles['calls-admin__header']}>
        <AdminConsoleHeader title="Calls" />
      </div>

      <div className={styles['calls-admin__scroll']}>
        <Scrollbar>
          <div className={styles['calls-admin__panels']}>
            <SectionNotice
              type="hint"
              title={
                <>
                  Calls plugin enables voice calls with screensharing in
                  channels. See{' '}
                  <a href={CALLS_DOCS_URL} target="_blank" rel="noreferrer">
                    documentation
                  </a>{' '}
                  to learn more.
                </>
              }
            />

            <AdminPanel
              title="General settings"
              subtitle="Settings for participants, screen sharing, ringing and more"
            >
              <div className={styles['calls-admin__settings']}>
                <BooleanSetting
                  label="Test mode"
                  defaultValue={false}
                  help="When test mode is enabled, only system admins are able to start calls in channels. This allows testing to confirm calls are working as expected."
                />
                <SettingRow
                  label="Max call participants"
                  help="The maximum number of participants that can join a call. If left empty, or set to 0, it means unlimited."
                >
                  <TextInput
                    type="number"
                    defaultValue="0"
                    aria-label="Max call participants"
                  />
                </SettingRow>
                <BooleanSetting
                  label="Allow screen sharing"
                  defaultValue
                  help="When set to true it allows call participants to share their screen."
                />
                <BooleanSetting
                  label="Enable simulcast for screen sharing (Experimental)"
                  defaultValue={false}
                  help="When set to true it enables simulcast for screen sharing. This can help to improve screen sharing quality."
                />
                <BooleanSetting
                  label="Enable call ringing (Beta)"
                  defaultValue
                  help="When set to true the RTC service will work in dual-stack mode, listening for IPv6 connections and generating candidates in addition to IPv4 ones."
                />
                <BooleanSetting
                  label="Enable IPv6 support (Experimental)"
                  defaultValue
                  help="When set to true the RTC service will work in dual-stack mode, listening for IPv6 connections and generating candidates in addition to IPv4 ones."
                />
              </div>
            </AdminPanel>

            <AdminPanel
              title="RTCD Service"
              subtitle="This setting can be used to override the host addresses that get advertised to clients when connecting to calls."
              showEnterpriseLabel
            >
              <div className={styles['calls-admin__settings']}>
                <SettingRow
                  label="RTCD service URL"
                  help="(Optional) The URL to a running RTCD service instance that should host the calls. When set (non empty) all calls will be handled by the external service."
                >
                  <TextInput
                    defaultValue="http://someClientID1:@localhost:8045"
                    type="url"
                    aria-label="RTCD service URL"
                  />
                </SettingRow>
              </div>
            </AdminPanel>

            <AdminPanel
              title="RTC Server"
              subtitle="This setting controls the IP address and port that the RTC server listens for UDP connections."
            >
              <div className={styles['calls-admin__settings']}>
                <SettingRow
                  label="RTC Server Address (UDP)"
                  help="The local IP address used by the RTC server to listen on for UDP connections."
                >
                  <TextInput
                    placeholder="127.0.0.1"
                    aria-label="RTC Server Address (UDP)"
                  />
                </SettingRow>
                <SettingRow
                  label="RTC Server Address (TCP)"
                  help="The local IP address used by the RTC server to listen on for TCP connections."
                >
                  <TextInput
                    placeholder="127.0.0.1"
                    aria-label="RTC Server Address (TCP)"
                  />
                </SettingRow>
                <SettingRow
                  label="RTC Server Port (UDP)"
                  help="The UDP port the RTC server will listen on."
                >
                  <TextInput
                    type="number"
                    defaultValue="8443"
                    aria-label="RTC Server Port (UDP)"
                  />
                </SettingRow>
                <SettingRow
                  label="RTC Server Port (TCP)"
                  help="The TCP port the RTC server will listen on."
                >
                  <TextInput
                    type="number"
                    defaultValue="8443"
                    aria-label="RTC Server Port (TCP)"
                  />
                </SettingRow>
              </div>
            </AdminPanel>

            <AdminPanel title="ICE and TURN Configuration">
              <div className={styles['calls-admin__settings']}>
                <SettingRow
                  label="ICE Host Override"
                  help="(Optional) The IP (or hostname) to be used as the host ICE candidate. If empty, it defaults to resolving via STUN."
                >
                  <TextInput aria-label="ICE Host Override" />
                </SettingRow>
                <SettingRow
                  label="ICE Host Port Override"
                  help={
                    <>
                      (Optional) A port number to be used as an override for
                      host candidates in place of the one used to listen on.
                      <br />
                      Note: this port will apply to both UDP and TCP host
                      candidates
                    </>
                  }
                >
                  <TextInput
                    type="number"
                    aria-label="ICE Host Port Override"
                  />
                </SettingRow>
                <SettingRow
                  label="ICE Servers Configurations"
                  help="(Optional) A list of ICE servers (STUN/TURN) configurations to use. This field should contain a valid JSON array."
                >
                  <TextArea
                    defaultValue={DEFAULT_ICE_SERVERS}
                    rows={3}
                    aria-label="ICE Servers Configurations"
                  />
                </SettingRow>
                <SettingRow
                  label="TURN Static Auth Secret"
                  help="(Optional) The secret key used to generate TURN short-lived authentication credentials."
                >
                  <TextInput aria-label="TURN Static Auth Secret" />
                </SettingRow>
                <SettingRow
                  label="TURN Credentials Expiration (minutes)"
                  help="(Optional) The number of minutes that the generated TURN credentials will be valid for. Note: this port will apply to both UDP and TCP host candidates"
                >
                  <TextInput
                    type="number"
                    defaultValue="1440"
                    aria-label="TURN Credentials Expiration (minutes)"
                  />
                </SettingRow>
                <BooleanSetting
                  label="Server Side TURN"
                  defaultValue={false}
                  help="(Optional) When set to on it will pass and use configured TURN candidates to server initiated connections."
                />
              </div>
            </AdminPanel>

            <AdminPanel
              title="Call recording"
              subtitle="Recordings include the entire call window view along with participants’ audio track and any shared screen video. Recordings are stored in Mattermost."
              showEnterpriseLabel
            >
              <div className={styles['calls-admin__settings']}>
                <BooleanSetting
                  label="Enable call recordings (Beta)"
                  defaultValue
                  help="When set to true, call recordings are enabled."
                />
                <SettingRow
                  label="Job service URL"
                  help="The URL to a running calls job service instance used for call recordings. This is required for recording, transcription and live captions."
                >
                  <TextInput
                    defaultValue="http://someClientID1:@localhost:8045"
                    type="url"
                    aria-label="Job service URL"
                  />
                </SettingRow>
                <SettingRow
                  label="Maximum call recording duration"
                  help="The maximum duration (in minutes) for call recordings between 15 and 180."
                >
                  <TextInput
                    type="number"
                    defaultValue="60"
                    aria-label="Maximum call recording duration"
                  />
                </SettingRow>
                <SettingRow
                  label="Call recording quality"
                  help="The audio and video quality of call recordings. This setting can affect the overall performance of the job service and the number of concurrent recording jobs that can be run."
                >
                  <Select
                    options={RECORDING_QUALITY_OPTIONS}
                    defaultValue="low"
                    aria-label="Call recording quality"
                  />
                </SettingRow>
              </div>
            </AdminPanel>

            <AdminPanel
              title="Call transcription"
              subtitle="Allows calls to be transcribed to text files. Recording must be enabled."
              showEnterpriseLabel
            >
              <div className={styles['calls-admin__settings']}>
                <BooleanSetting
                  label="Enable call transcriptions (Experimental)"
                  defaultValue
                  help="(Optional) When set to true, call transcriptions are enabled."
                />
                <SettingRow
                  label="Call transcriber model size"
                  help="The speech-to-text model size to use. Heavier models will produce more accurate results at the expense of processing time and resources usage."
                >
                  <Select
                    options={TRANSCRIBER_MODEL_OPTIONS}
                    defaultValue="tiny"
                    aria-label="Call transcriber model size"
                  />
                </SettingRow>
                <SettingRow
                  label="Call transcriber threads"
                  help="The number of threads used by the post-call transcriber. This must be in the range [1, numCPUs]."
                >
                  <TextInput
                    type="number"
                    defaultValue="2"
                    aria-label="Call transcriber threads"
                  />
                </SettingRow>
              </div>
            </AdminPanel>

            <AdminPanel
              title="Live captions"
              subtitle="Allows you to read the words that are spoken during calls. Recording must be enabled."
              showEnterpriseLabel
            >
              <div className={styles['calls-admin__settings']}>
                <BooleanSetting
                  label="Enable live captions (Experimental)"
                  defaultValue={false}
                  help="(Optional) When set to true, live captions are enabled."
                />
                <SettingRow
                  label="Live captions: Model size"
                  help="The speech-to-text model size to use for live captions. Heavier models will produce more accurate results at the expense of processing time and resources usage."
                >
                  <Select
                    options={TRANSCRIBER_MODEL_OPTIONS}
                    defaultValue="tiny"
                    aria-label="Live captions model size"
                  />
                </SettingRow>
                <SettingRow
                  label="Live captions: Number of transcribers used per call"
                  help="The number of separate live-captions transcribers for each call. Each transcribes one audio stream at a time. The product of LiveCaptionsNumTranscribers * LiveCaptionsNumThreadsPerTranscriber must be in the range [1, numCPUs]."
                >
                  <TextInput
                    type="number"
                    defaultValue="1"
                    aria-label="Live captions number of transcribers"
                  />
                </SettingRow>
                <SettingRow
                  label="Live captions: Number of threads per transcriber"
                  help="The number of threads per live-captions transcriber. The product of LiveCaptionsNumTranscribers * LiveCaptionsNumThreadsPerTranscriber must be in the range [1, numCPUs]."
                >
                  <TextInput
                    type="number"
                    defaultValue="2"
                    aria-label="Live captions threads per transcriber"
                  />
                </SettingRow>
                <SettingRow
                  label="Live captions language"
                  help="The language passed to the live captions transcriber. Should be a 2-letter ISO 639 Set 1 language code, e.g. 'en'. If blank, will be set to English 'en' as default."
                >
                  <TextInput
                    defaultValue="en"
                    aria-label="Live captions language"
                  />
                </SettingRow>
              </div>
            </AdminPanel>
          </div>
        </Scrollbar>
      </div>

      <div className={styles['calls-admin__footer']}>
        <AdminConsoleFooter />
      </div>
    </>
  );
}
