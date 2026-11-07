import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const manifest = JSON.parse(fs.readFileSync('tools/runtime-assets.json', 'utf8')).files;
const state = JSON.parse(fs.readFileSync('.build-state.json', 'utf8'));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const files = walk('dist');
assert.ok(files.length <= 20000);
assert.equal(files.length, state.files.length);
const secrets = /(?:github_pat_[A-Za-z0-9_]{30,}|gh[pousr]_[A-Za-z0-9]{30,}|AKIA[A-Z0-9]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sk-[A-Za-z0-9]{25,})/;
const privatePath = /[A-Z]:[\\/](?:Users|Projects|People)[\\/]/i;
for (const file of files) {
  const relative = path.relative('dist', file).split(path.sep).join('/');
  assert.ok(!/^(?:tools|verification|release|node_modules|audit)\//.test(relative), file);
  assert.ok(!relative.split('/').some(p => p.startsWith('.')), file);
  const bytes = fs.readFileSync(file);
  assert.ok(bytes.length <= 25 * 1024 ** 2, file);
  assert.equal(sha(bytes), state.assets.find(a => a.path === relative)?.sha256, file);
  if (/\.(?:html|css|js|mjs|json|txt|md|svg|xml)$/.test(file)) {
    const text = bytes.toString('utf8');
    assert.ok(!secrets.test(text), `Possible credential: ${file}`);
    assert.ok(!privatePath.test(text), `Private path: ${file}`);
    assert.ok(!/https?:\/\/(?:localhost|127\.0\.0\.1)(?=[:/"'])/i.test(text), `Development URL: ${file}`);
  }
}
// Validate static references and their exact case through the generated artifact.
function reference(from, value) {
  if (!value || /^(?:#|%23|data:|blob:|https?:|mailto:|tel:)/i.test(value)) return;
  const relative = path.posix.normalize(path.posix.join(value.startsWith('/') ? '' : path.posix.dirname(from), value.split(/[?#]/)[0])).replace(/^\//, '');
  if (!relative || relative === '.') return;
  assert.ok(state.files.includes(relative), `Missing/case-mismatched static reference ${from} -> ${relative}`);
}
for (const file of state.files) {
  if (file.endsWith('.html')) for (const match of fs.readFileSync(path.join('dist', file), 'utf8').matchAll(/(?:src|href)=["']([^"']+)["']/g)) reference(file, match[1]);
  if (file.endsWith('.css')) for (const match of fs.readFileSync(path.join('dist', file), 'utf8').matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/g)) reference(file, match[1]);
}
for (const model of ['compact', 'iphone']) {
  const from = `assets/showcase/phones/${model}.json`, json = JSON.parse(fs.readFileSync(path.join('dist', from), 'utf8'));
  for (const file of [json.binary, ...json.textures.map(t => t.file)]) reference(from, file);
  assert.equal(sha(fs.readFileSync(path.join('dist/assets/showcase/phones', json.binary))), json.binarySHA256);
  for (const texture of json.textures) assert.equal(sha(fs.readFileSync(path.join('dist/assets/showcase/phones', texture.file))), texture.sha256);
}
// Inspect every object reachable through the intended publication history.
const objects = execFileSync('git', ['rev-list', '--objects', '--all'], { encoding: 'utf8', maxBuffer: 16 * 1024 ** 2 }).trim().split('\n').filter(Boolean).map(line => line.split(' ')[0]);
const details = execFileSync('git', ['cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)'], { input: objects.join('\n') + '\n', encoding: 'utf8', maxBuffer: 16 * 1024 ** 2 }).trim().split('\n');
let largestGitBlob = 0, textBlobsScanned = 0;
for (const line of details) {
  const [id, type, sizeText] = line.split(' '), size = Number(sizeText);
  if (type !== 'blob') continue;
  largestGitBlob = Math.max(largestGitBlob, size); assert.ok(size < 100 * 1024 ** 2, `Oversized Git object ${id}`);
  const bytes = execFileSync('git', ['cat-file', 'blob', id], { maxBuffer: 16 * 1024 ** 2 });
  if (!bytes.includes(0)) { const text = bytes.toString('utf8'); assert.ok(!secrets.test(text), `Possible credential in history: ${id}`); assert.ok(!privatePath.test(text), `Private path in history: ${id}`); textBlobsScanned++; }
}
assert.ok(manifest.includes('index.html') && manifest.includes('404.html'));
console.log(JSON.stringify({ status: 'PASS', deploymentFiles: files.length, deploymentBytes: files.reduce((n, f) => n + fs.statSync(f).size, 0), largestGitBlob, historyObjects: objects.length, textBlobsScanned, note: 'Pattern scanning supplements manual provenance/security review; no scanner proves absence of every possible secret.' }, null, 2));
