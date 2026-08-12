import AttributeHubSimplified from '@/pages/AttributeHubSimplified/AttributeHubSimplified';

/**
 * Inline-summary hub carrying the Channel Attributes walkthrough decisions
 * (2026-08-06). Everything else matches the inline-summary variation.
 */
export default function AttributeHubChannelAligned() {
  return (
    <AttributeHubSimplified appliesToRowSummary="inline" channelAlignment />
  );
}
