import HierarchicalAttributeValueMenu from './HierarchicalAttributeValueMenu';

/**
 * Route entry for the System Console surface.
 * `/prototypes/hierarchical-attribute-value-menu-user`
 *
 * Same page component as the switcher route, with the surface pinned so the
 * demo band drops its surface control. `?ranking=`, `?state=` and `?demo=off`
 * still apply.
 */
export default function ValueMenuUserPage() {
  return <HierarchicalAttributeValueMenu forcedSurface="user" />;
}
