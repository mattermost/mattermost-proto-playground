#!/usr/bin/env node
/**
 * Copies UI library sources into packages/compass-ui and rewrites @/ imports.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkgRoot = path.join(root, 'packages/compass-ui');
const pkgSrc = path.join(pkgRoot, 'src');

const COPY_DIRS = [
  { from: 'src/components/ui', to: 'components' },
  { from: 'src/components/icons', to: 'icons' },
  { from: 'src/hooks', to: 'hooks' },
  { from: 'src/styles', to: 'styles', exclude: ['library-demo'] },
];

const COPY_FILES = [
  { from: 'src/utils/string.ts', to: 'utils/string.ts' },
  { from: 'src/types/callParticipant.ts', to: 'types/callParticipant.ts' },
  { from: 'src/scss-modules.d.ts', to: 'scss-modules.d.ts' },
];

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dest, exclude = []) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (exclude.includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath, exclude);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function rewriteContent(content) {
  return (
    content
      .replace(/@\/components\/ui\//g, '@/components/')
      .replace(/@\/components\/icons\//g, '@/icons/')
      .replace(/@\/hooks\//g, '@/hooks/')
      .replace(/@\/utils\//g, '@/utils/')
      .replace(/@\/types\//g, '@/types/')
      .replace(/@\/styles\//g, '@/styles/')
      .replace(/@\/assets\//g, '@/assets/')
  );
}

function rewriteTree(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) rewriteTree(full);
    else if (/\.(tsx?|scss)$/.test(entry.name)) {
      const text = fs.readFileSync(full, 'utf8');
      fs.writeFileSync(full, rewriteContent(text));
    }
  }
}

function componentDirs() {
  const dir = path.join(pkgSrc, 'components');
  const names = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) names.push(entry.name);
  }
  return names.sort();
}

function writeStylesEntry() {
  const entry = `@use 'tokens';
@use 'reset';
@use 'themes';
`;
  fs.writeFileSync(path.join(pkgSrc, 'styles/entry.scss'), entry);
}

function writeIndex() {
  const names = componentDirs();
  const lines = [
    ...names.flatMap((name) => {
      const indexPath = path.join(pkgSrc, 'components', name, 'index.ts');
      if (fs.existsSync(indexPath)) {
        return [`export * from './components/${name}/index';`];
      }
      const tsxPath = path.join(pkgSrc, 'components', name, `${name}.tsx`);
      if (fs.existsSync(tsxPath)) {
        return [
          `export { default as ${name} } from './components/${name}/${name}';`,
          `export type * from './components/${name}/${name}';`,
        ];
      }
      return [];
    }),
    '',
    "export * from './hooks/useControllable';",
    "export * from './hooks/useOutsideClose';",
    "export * from './hooks/usePopoverTransition';",
    "export { toKebab } from './utils/string';",
    "export type * from './types/callParticipant';",
    "export { default as DialpadIcon } from './icons/DialpadIcon';",
    "export { default as OutboundCallIcon } from './icons/OutboundCallIcon';",
    "export { default as PhoneLockIcon } from './icons/PhoneLockIcon';",
    '',
  ];
  fs.writeFileSync(path.join(pkgSrc, 'index.ts'), lines.join('\n'));
}

function copyAssets() {
  const avatarsFrom = path.join(root, 'src/assets/avatars');
  const avatarsTo = path.join(pkgSrc, 'assets/avatars');
  if (fs.existsSync(avatarsFrom)) copyDir(avatarsFrom, avatarsTo);
}

// --- run ---
rmrf(pkgSrc);
fs.mkdirSync(pkgSrc, { recursive: true });

for (const { from, to, exclude } of COPY_DIRS) {
  copyDir(path.join(root, from), path.join(pkgSrc, to), exclude ?? []);
}

for (const { from, to } of COPY_FILES) {
  const dest = path.join(pkgSrc, to);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(root, from), dest);
}

copyAssets();
rewriteTree(pkgSrc);
writeStylesEntry();
writeIndex();

console.log(`Migrated ${componentDirs().length} components to packages/compass-ui`);
