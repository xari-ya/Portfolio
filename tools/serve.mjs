import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
const option = name => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
const root = path.resolve(option('--root') || (process.argv.includes('--dist') ? 'dist' : '.'));
const port = Number(option('--port') || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };
const cache = new Map();
const server = http.createServer((req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
    const urlPath = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    const parts = urlPath.split('/').filter(Boolean);
    if (parts.some(p => p.startsWith('.') || p.includes('\\') || p === '_headers' || p === '_redirects')) { res.writeHead(404); return res.end(); }
    if (!parts.length) parts.push('index.html');
    let file = root, exists = true;
    for (const part of parts) { if (!fs.statSync(file).isDirectory() || !fs.readdirSync(file).includes(part)) { exists = false; break; } file = path.join(file, part); }
    if (exists && !fs.statSync(file).isFile()) exists = false;
    const status = exists ? 200 : 404;
    if (!exists) file = path.join(root, '404.html');
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end('Not found'); }
    const stat = fs.statSync(file), key = file + ':' + stat.mtimeMs;
    let entry = cache.get(key);
    if (!entry) { const body = fs.readFileSync(file); entry = { body, tag: '"' + crypto.createHash('sha256').update(body).digest('hex') + '"' }; cache.set(key, entry); }
    const mime = types[path.extname(file)] || 'application/octet-stream';
    const headers = { 'Content-Type': mime, 'Cache-Control': 'public, max-age=0, must-revalidate', ETag: entry.tag, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'DENY', Vary: 'Accept-Encoding' };
    if (req.headers['if-none-match'] === entry.tag && status === 200) { res.writeHead(304, headers); return res.end(); }
    let body = entry.body;
    if (/text\/|json|xml|svg/.test(mime) && body.length > 1024 && /\bbr\b/.test(req.headers['accept-encoding'] || '')) { entry.br ||= zlib.brotliCompressSync(body); body = entry.br; headers['Content-Encoding'] = 'br'; }
    headers['Content-Length'] = body.length; res.writeHead(status, headers); res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(400); res.end('Bad request'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Serving ${root} at http://127.0.0.1:${port}/ (case-sensitive paths)`));
