import { useSearchParams } from 'react-router-dom';
import HierarchicalAttributeValueMenu from './HierarchicalAttributeValueMenu';

/**
 * Route entry for the two channel surfaces.
 * `/prototypes/hierarchical-attribute-value-menu-channel`
 *
 * Defaults to the Channel Info sidebar — the narrowest host and the real test of
 * the design — and honours `?surface=create-channel` for the create-channel
 * modal, since both are the resource side of the same relation.
 */
export default function ValueMenuChannelPage() {
  const [params] = useSearchParams();
  const surface =
    params.get('surface') === 'create-channel'
      ? 'create-channel'
      : 'channel-info';
  return <HierarchicalAttributeValueMenu forcedSurface={surface} />;
}
