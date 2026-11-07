import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const runtime = JSON.parse(fs.readFileSync('tools/runtime-assets.json', 'utf8')).files;
const files = [...new Set([...runtime, ...walk('tools'), ...walk('verification')])].filter(f => /\.(?:c?js|mjs)$/.test(f));
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`Syntax checked ${files.length} JavaScript files.`);
