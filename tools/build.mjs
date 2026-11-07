import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools/runtime-assets.json'), 'utf8'));
const statePath = path.join(root, '.build-state.json');
const safePath = (base, relative) => {
  if (relative.includes('\\') || relative.split('/').some(p => !p || p === '.' || p === '..')) throw Error(`Unsafe asset: ${relative}`);
  const absolute = path.resolve(base, relative);
  if (!absolute.startsWith(base + path.sep)) throw Error(`Asset escapes root: ${relative}`);
  return absolute;
};
function exactFile(relative) {
  let directory = root;
  for (const part of relative.split('/')) {
    if (!fs.readdirSync(directory).includes(part)) throw Error(`Missing file or incorrect case: ${relative}`);
    directory = path.join(directory, part);
    if (fs.lstatSync(directory).isSymbolicLink()) throw Error(`Source symlink is not supported: ${relative}`);
  }
  if (!fs.statSync(directory).isFile()) throw Error(`Not a regular file: ${relative}`);
  return directory;
}
function files(base, prefix = '') {
  if (!fs.existsSync(base)) return [];
  if (fs.lstatSync(base).isSymbolicLink()) throw Error('Deployment directory must not be a symlink or junction');
  return fs.readdirSync(base, { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink()) throw Error('Symlinks are not supported in deployment output');
    const relative = prefix + entry.name;
    return entry.isDirectory() ? files(path.join(base, entry.name), relative + '/') : [relative];
  });
}
const sources = [...manifest.files].sort();
if (new Set(sources).size !== sources.length) throw Error('Duplicate manifest entries');
for (const file of sources) { safePath(root, file); exactFile(file); }
const old = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')).files : [];
const existing = files(output);
for (const file of existing) if (!old.includes(file)) throw Error(`Unrecognized dist file; preserve or move it before building: ${file}`);
const origin = process.env.SITE_ORIGIN || 'https://portfolio-bu2.pages.dev';
if (origin && (new URL(origin).protocol !== 'https:' || new URL(origin).origin !== origin || !/^[a-z0-9.-]+$/i.test(new URL(origin).hostname))) throw Error('SITE_ORIGIN must be an HTTPS domain origin without a trailing slash');
const preview = process.env.CF_PAGES === '1' && process.env.CF_PAGES_BRANCH !== 'release/production';
const built = [];
const prepared = new Map();
for (const file of sources) {
  let bytes = fs.readFileSync(exactFile(file));
  if (file === 'index.html') {
    let html = bytes.toString('utf8');
    html = html.replaceAll('https://portfolio-bu2.pages.dev/', origin + '/');
    if (preview) html = html.replace('</head>', '<meta name="robots" content="noindex,nofollow">\n</head>');
    bytes = Buffer.from(html);
  }
  if (file === 'robots.txt') bytes = Buffer.from(preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''}`);
  if (file === '_headers' && preview) bytes = Buffer.concat([bytes, Buffer.from('\n/*\n  X-Robots-Tag: noindex, nofollow\n')]);
  if (bytes.length > 25 * 1024 ** 2) throw Error(`Cloudflare Pages asset exceeds 25 MiB: ${file}`);
  prepared.set(file, bytes);
  built.push({ path: file, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
}
if (origin) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>\n`;
  prepared.set('sitemap.xml', Buffer.from(xml)); built.push({ path: 'sitemap.xml', bytes: Buffer.byteLength(xml), sha256: crypto.createHash('sha256').update(xml).digest('hex') });
}
if (built.length > 20000) throw Error('Cloudflare Pages Free file limit exceeded');
// Validate the entire next artifact before replacing any previous generated file.
for (const file of existing) safePath(output, file);
for (const file of existing) fs.unlinkSync(safePath(output, file));
fs.mkdirSync(output, { recursive: true });
for (const [file, bytes] of prepared) {
  const target = safePath(output, file);
  fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, bytes);
}
fs.writeFileSync(statePath, JSON.stringify({ files: built.map(f => f.path), assets: built }, null, 2) + '\n');
console.log(JSON.stringify({ files: built.length, bytes: built.reduce((n, f) => n + f.bytes, 0), output: 'dist', largest: [...built].sort((a, b) => b.bytes - a.bytes).slice(0, 5), preview }, null, 2));
