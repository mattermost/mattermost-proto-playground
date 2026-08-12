import AttributeHubSimplified from '@/pages/AttributeHubSimplified/AttributeHubSimplified';

/**
 * Channel-attributes aligned hub with the "Changing the value" rule moved out
 * of Definition and onto each resource inside Applies to. Scoping the rule to
 * the binding removes the "applies to X, Y, Z" explainer the attribute-level
 * version needed, so the copy shortens to a self-describing option list.
 */
export default function AttributeHubChannelAlignedPerResource() {
  return (
    <AttributeHubSimplified
      appliesToRowSummary="inline"
      channelAlignment
      perResourceEditability
    />
  );
}
