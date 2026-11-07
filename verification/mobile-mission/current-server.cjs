/* Reuse this workspace's existing server for legacy suites with hardcoded
 * ports. Only loopback test URLs on 4173/4174 are redirected to 4175. */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const original=chromium.launch.bind(chromium),patched=new WeakSet();
function patch(page){if(patched.has(page))return;patched.add(page);const goto=page.goto.bind(page);const baseline=process.env.WORKSHOP_MISSION_BASELINE==='1'?page.route('**/*',r=>{const f=new URL(r.request().url()).pathname.slice(1)||'index.html',local=path.join('verification/test-results/mobile-mission-baseline',f);return fs.existsSync(local)&&fs.statSync(local).isFile()?r.fulfill({body:fs.readFileSync(local),contentType:f.endsWith('.html')?'text/html':f.endsWith('.css')?'text/css':'application/javascript'}):r.continue()}):Promise.resolve();page.goto=async(url,...args)=>{await baseline;return goto(url.replace(/^http:\/\/(127\.0\.0\.1|localhost):417[34](?=\/|$)/,process.env.WORKSHOP_BASE_URL||'http://127.0.0.1:4175'),...args);};}
chromium.launch=async(...args)=>{const browser=await original(...args),page=browser.newPage.bind(browser),context=browser.newContext.bind(browser);browser.newPage=async(...a)=>{const p=await page(...a);patch(p);return p;};browser.newContext=async(...a)=>{const c=await context(...a);c.on('page',patch);return c;};return browser;};
