#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

  // default + named from ui path (multiline)
  text = text.replace(
    /import\s+(\w+)\s*,\s*\{([^}]+)\}\s*from\s+['"]@\/components\/ui\/[^'"]+['"]/gs,
    "import {$2, $1} from '@mattermost/compass-ui'",
  );

  text = text.replace(
    /import\s+(\w+)\s*,\s*\{([^}]+)\}\s*from\s+['"]@\/components\/ui\/[^'"]+['"]/g,
    "import {$2, $1} from '@mattermost/compass-ui'",
  );

  // default only from ui
  text = text.replace(
    /import\s+(\w+)\s+from\s+['"]@\/components\/ui\/[^'"]+['"]/g,
    "import { $1 } from '@mattermost/compass-ui'",
  );

  // named from ui (multiline)
  text = text.replace(
    /import\s+\{([^}]+)\}\s*from\s+['"]@\/components\/ui\/[^'"]+['"]/gs,
    "import {$1} from '@mattermost/compass-ui'",
  );

  // Icon with SVG_SIZE_MAP default import
  text = text.replace(
    /import\s+(\w+)\s*,\s*\{\s*SVG_SIZE_MAP\s*\}\s*from\s+['"]@\/components\/ui\/Icon\/Icon['"]/g,
    "import { $1, SVG_SIZE_MAP } from '@mattermost/compass-ui'",
  );

  text = text.replace(
    /import\s+(\w+)\s*,\s*\{\s*([^}]+)\s*\}\s*from\s+['"]@\/components\/ui\/IconButton\/IconButton['"]/g,
    "import { $1, $2 } from '@mattermost/compass-ui'",
  );

  text = text.replace(
    /import\s+(\w+)\s*,\s*\{\s*([^}]+)\s*\}\s*from\s+['"]@\/components\/ui\/AdminPanelHeader\/AdminPanelHeader['"]/g,
    "import { $1, $2 } from '@mattermost/compass-ui'",
  );

  text = text.replace(
    /import\s+(\w+)\s*,\s*\{\s*type\s+([^}]+)\s*\}\s*from\s+['"]@\/components\/ui\/AdminPanel\/AdminPanel['"]/g,
    "import { $1, type $2 } from '@mattermost/compass-ui'",
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
console.log(`Fixed ${count} remaining import files`);
