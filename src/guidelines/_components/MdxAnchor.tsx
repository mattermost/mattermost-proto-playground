import type { AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

/**
 * MDX default anchor: markdown `[label](/path)` becomes a root-absolute URL and
 * ignores Vite `base` + React Router `basename`. Use `<Link>` so in-app paths
 * resolve under `import.meta.env.BASE_URL`.
 */
export default function MdxAnchor({
  href,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal =
    !href ||
    href.startsWith('#') ||
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('//');

  if (isExternal) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }

  if (href.startsWith('/')) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
