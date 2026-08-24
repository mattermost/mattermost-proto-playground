import AttributeHubSimplified from '@/pages/AttributeHubSimplified/AttributeHubSimplified';
import ChannelConfigurationPage from './ChannelConfigurationPage';

/**
 * Channel-attributes aligned hub with the "Changing the value" rule moved out
 * of Definition and onto each resource inside Applies to. Scoping the rule to
 * the binding removes the "applies to X, Y, Z" explainer the attribute-level
 * version needed, so the copy shortens to a self-describing option list.
 */
export default function AttributeHubChannelAlignedPerResource() {
  const params =
    typeof window === 'undefined'
      ? new URLSearchParams()
      : new URLSearchParams(window.location.search);
  const screen = params.get('screen');

  if (screen === 'channel-settings') {
    return (
      <ChannelConfigurationPage
        channelName={params.get('channel') ?? 'off-topic'}
        adminName={params.get('admin') ?? 'Channel admin'}
        onBack={() => {
          const next = new URLSearchParams(window.location.search);
          next.delete('screen');
          next.delete('channel');
          next.delete('admin');
          const qs = next.toString();
          window.location.href = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
        }}
      />
    );
  }

  return (
    <AttributeHubSimplified
      appliesToRowSummary="inline"
      channelAlignment
      perResourceEditability
    />
  );
}
