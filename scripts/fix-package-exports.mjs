#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgSrc = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'packages/compass-ui/src',
);
const componentsDir = path.join(pkgSrc, 'components');

for (const name of fs.readdirSync(componentsDir)) {
  const dir = path.join(componentsDir, name);
  if (!fs.statSync(dir).isDirectory()) continue;

  const indexPath = path.join(dir, 'index.ts');
  if (!fs.existsSync(indexPath)) {
    const tsx = path.join(dir, `${name}.tsx`);
    if (fs.existsSync(tsx)) {
      fs.writeFileSync(
        indexPath,
        `export { default as ${name} } from './${name}';\nexport type * from './${name}';\n`,
      );
    }
    continue;
  }

  let text = fs.readFileSync(indexPath, 'utf8');
  const original = text;
  text = text.replace(
    /export\s+\{\s*default\s*\}\s+from\s+(['"]\.\/[^'"]+['"])/g,
    `export { default as ${name} } from $1`,
  );
  if (text !== original) fs.writeFileSync(indexPath, text);
}

// ChannelsSidebar model exports
const csIndex = path.join(componentsDir, 'ChannelsSidebar', 'index.ts');
if (!fs.existsSync(csIndex)) {
  fs.writeFileSync(
    csIndex,
    `export { default as ChannelsSidebar } from './ChannelsSidebar';
export type { ChannelsSidebarProps } from './ChannelsSidebar';
export * from './channelsSidebarModel';
`,
  );
}

const indexPath = path.join(pkgSrc, 'index.ts');
let index = fs.readFileSync(indexPath, 'utf8');
const styleExports = `
export { default as shellStyles } from './components/ChannelShell/ChannelShell.module.scss';
export { default as layoutStyles } from './components/ChannelShell/ChannelShell.module.scss';
export { default as btnStyles } from './components/Button/Button.module.scss';
export { default as messageStyles } from './components/Message/Message.module.scss';
export { default as DialpadIcon } from './icons/DialpadIcon';
export { default as OutboundCallIcon } from './icons/OutboundCallIcon';
export { default as PhoneLockIcon } from './icons/PhoneLockIcon';
`;

if (!index.includes('shellStyles')) {
  index = index.trimEnd() + styleExports;
  fs.writeFileSync(indexPath, index);
}

console.log('Fixed package exports');
