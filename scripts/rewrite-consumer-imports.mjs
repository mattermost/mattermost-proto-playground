#!/usr/bin/env node
/**
 * Rewrites consumer imports from @/components/ui/* to @mattermost/compass-ui
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const IMPORT_RE =
  /import\s+(type\s+)?((?:\{[^}]+\}|\w+)\s+from\s+)?['"]@\/components\/ui\/([^'"]+)['"]/g;

const DEFAULT_IMPORT_RE =
  /import\s+(\w+)\s+from\s+['"]@\/components\/ui\/([^'"]+)['"]/g;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|mdx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function rewriteFile(file) {
  let text = fs.readFileSync(file, 'utf8');
  const original = text;

  text = text.replace(
    /import\s+type\s+\{([^}]+)\}\s+from\s+['"]@\/components\/ui\/[^'"]+['"]/g,
    "import type {$1} from '@mattermost/compass-ui'",
  );

  text = text.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"]@\/components\/ui\/[^'"]+['"]/g,
    "import {$1} from '@mattermost/compass-ui'",
  );

  text = text.replace(
    /import\s+(\w+)\s+from\s+['"]@\/components\/ui\/[^'"]+['"]/g,
    "import { $1 } from '@mattermost/compass-ui'",
  );

  text = text.replace(
    /import\s+(\w+)\s+from\s+['"]@\/components\/icons\/[^'"]+['"]/g,
    "import { $1 } from '@mattermost/compass-ui'",
  );

  if (text !== original) {
    fs.writeFileSync(file, text);
    return true;
  }
  return false;
}

let count = 0;
for (const file of walk(path.join(root, 'src'))) {
  if (rewriteFile(file)) count++;
}
console.log(`Updated imports in ${count} files`);
