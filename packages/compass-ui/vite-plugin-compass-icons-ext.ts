import type { OutputBundle, Plugin } from 'vite';

const ICON_DEFAULT_IMPORT =
  /import\s+([A-Za-z_$][\w$]*)\s+from\s*(["'])(@mattermost\/compass-icons\/[^"']+)\2\s*;?/g;

function withJsExtension(specifier: string): string {
  if (!specifier.startsWith('@mattermost/compass-icons/')) {
    return specifier;
  }
  if (/\.(js|css|json|svg)$/.test(specifier)) {
    return specifier;
  }
  return `${specifier}.js`;
}

function rewriteEsmIconImports(code: string): string {
  let next = code.replace(
    ICON_DEFAULT_IMPORT,
    (_m, id: string, quote: string, spec: string) => {
      const path = withJsExtension(spec);
      const tmp = `__${id}`;
      return `import ${tmp} from ${quote}${path}${quote};const ${id}=${tmp}&&${tmp}.default?${tmp}.default:${tmp};`;
    },
  );

  next = next.replace(/@mattermost\/compass-icons\/[^'"]+/g, (spec) =>
    withJsExtension(spec),
  );

  return next;
}

function rewriteCjsIconSpecs(code: string): string {
  return code.replace(/@mattermost\/compass-icons\/[^'"]+/g, (spec) =>
    withJsExtension(spec),
  );
}

function rewriteBundle(bundle: OutputBundle) {
  for (const item of Object.values(bundle)) {
    if (item.type !== 'chunk' || !item.code.includes('@mattermost/compass-icons/')) {
      continue;
    }
    if (item.fileName.endsWith('.cjs')) {
      item.code = rewriteCjsIconSpecs(item.code);
    } else if (item.fileName.endsWith('.js')) {
      item.code = rewriteEsmIconImports(item.code);
    }
  }
}

/**
 * - Append .js for webpack 5 ESM fullySpecified resolution.
 * - Unwrap CJS default exports so icon components are functions under webpack,
 *   not `{ default: fn }` module namespace objects.
 */
export function compassIconsJsExtensions(): Plugin {
  return {
    name: 'compass-icons-js-extensions',
    enforce: 'post',
    generateBundle(_options, bundle) {
      rewriteBundle(bundle);
    },
  };
}
