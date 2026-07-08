import AttributeHubSimplified from '@/pages/AttributeHubSimplified/AttributeHubSimplified';

/**
 * Simplified hub copy — Applies-to rows use a single-line secondary summary
 * instead of summary chips. All other behavior matches the Simplified variation.
 */
export default function AttributeHubSimplifiedInlineSummary() {
  return <AttributeHubSimplified appliesToRowSummary="inline" />;
}
