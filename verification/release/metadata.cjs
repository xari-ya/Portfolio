const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const title = 'Sarith Dodangodage | Engineering Portfolio';
const description = 'Explore my work in robotics, embedded systems, automation, and AI through an interactive 3D engineering workshop.';
const origin = process.env.SITE_ORIGIN || 'https://portfolio-bu2.pages.dev';
const imagePath = 'assets/social/portfolio-preview-final.jpg';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function validate(html, expectedOrigin, label) {
  const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1];
  assert.ok(head, `${label}: initial HTML head`);
  assert.equal([...head.matchAll(/<title>/g)].length, 1);
  assert.ok(head.includes(`<title>${title}</title>`));
  assert.doesNotMatch(head, /Assembly Required/);
  const expected = {
    description, 'og:type': 'website', 'og:title': title, 'og:description': description,
    'og:url': expectedOrigin + '/', 'og:image': expectedOrigin + '/' + imagePath,
    'og:image:width': '1200', 'og:image:height': '630', 'twitter:card': 'summary_large_image',
    'twitter:title': title, 'twitter:description': description, 'twitter:image': expectedOrigin + '/' + imagePath
  };
  for (const [key, value] of Object.entries(expected)) {
    const tags = [...head.matchAll(/<meta\s+[^>]+>/g)].map(m => m[0]).filter(t => t.includes(`name="${key}"`) || t.includes(`property="${key}"`));
    assert.equal(tags.length, 1, `${label}: unique ${key}`);
    assert.ok(tags[0].includes(`content="${value}"`), `${label}: ${key}`);
  }
  const canonical = [...head.matchAll(/<link rel="canonical" href="([^"]+)">/g)];
  assert.equal(canonical.length, 1);
  assert.equal(canonical[0][1], expectedOrigin + '/');
  console.log(`PASS ${label}: title, description, Open Graph, Twitter, canonical; no duplicates`);
}
function dimensions(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'JPEG signature');
  let offset = 2;
  while (offset < bytes.length) {
    assert.equal(bytes[offset++], 0xff);
    const marker = bytes[offset++];
    const size = bytes.readUInt16BE(offset);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) return [bytes.readUInt16BE(offset + 5), bytes.readUInt16BE(offset + 3)];
    offset += size;
  }
  throw Error('JPEG frame not found');
}
(async () => {
  validate(fs.readFileSync('index.html', 'utf8'), 'https://portfolio-bu2.pages.dev', 'source');
  validate(fs.readFileSync('dist/index.html', 'utf8'), origin, 'build');
  const artwork = fs.readFileSync(imagePath);
  assert.deepEqual(dimensions(artwork), [1200, 630]);
  assert.ok(artwork.length < 300000);
  assert.equal(hash(artwork), hash(fs.readFileSync('dist/' + imagePath)));
  if (process.argv[2]) {
    const response = await fetch(process.argv[2]);
    assert.equal(response.status, 200);
    validate(await response.text(), origin, process.argv[2]);
    const image = await fetch(origin + '/' + imagePath);
    assert.equal(image.status, 200);
    assert.match(image.headers.get('content-type'), /^image\/jpeg/);
    const bytes = Buffer.from(await image.arrayBuffer());
    assert.deepEqual(dimensions(bytes), [1200, 630]);
    assert.equal(hash(bytes), hash(artwork));
    console.log('PASS publicly accessible image: JPEG, 1200 × 630, unchanged approved bytes');
  }
  console.log(`PASS approved artwork: ${artwork.length} bytes, 1200 × 630`);
})().catch(e => { console.error(e); process.exitCode = 1; });
