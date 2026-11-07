const {chromium}=require('playwright'),fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const baseline=process.argv.includes('--baseline'),name=baseline?'baseline':'current',dir='verification/phone-ui';fs.mkdirSync(dir,{recursive:true});
const files=['index.html','engine.js','workshop-hall.js','production-station.js','project-discovery.js'];
const old=baseline?Object.fromEntries(files.map(f=>[f,cp.execFileSync('git',['show','10cc8bc:'+f],{maxBuffer:20*1024*1024})])):{};
const selectors=['.topbar','.home-intro','.home h1','.intro-actions','.engineer-actions','.engineer-reading','.project-discovery','.production-heading','.production-browser','.production-preview','.production-footer','#communicationsPanel','.comms-navigation'];
function compare(report){const before=JSON.parse(fs.readFileSync(dir+'/baseline.json'));for(const[key,v]of Object.entries(report.views)){const a=before.views[key];for(const[s,c]of Object.entries(v.controls)){const active=s==='.topbar'||(key.endsWith('-overview')&&['.home-intro','.home h1','.intro-actions'].includes(s))||(key.endsWith('-about')&&s.startsWith('.engineer'))||(key.endsWith('-production')&&s.startsWith('.production')||key.endsWith('-production')&&s==='.project-discovery')||(key.endsWith('-communications')&&['#communicationsPanel','.comms-navigation'].includes(s));if(!active)continue;assert.equal(!!c,!!a.controls[s],key+' '+s);if(!c)continue;for(const[k,n]of Object.entries(c)){const old=a.controls[s][k];if(typeof n==='number')assert.ok(Math.abs(n-old)<.05,key+' '+s+' '+k+': '+n+' vs '+old);else assert.equal(n,old,key+' '+s+' '+k);}}for(const k of ['eye','target'])for(let i=0;i<3;i++)assert.ok(Math.abs(v.camera[k][i]-a.camera[k][i])<.002,key+' camera '+k);assert.ok(Math.abs(v.camera.fov-a.camera.fov)<1e-6,key+' FOV');}report.desktopPreserved=true;report.comparedViews=Object.keys(report.views).length;console.log('PASS tablet/desktop active controls and cameras match checkpoint across '+report.comparedViews+' views');}
(async()=>{if(process.argv.includes('--compare-only')){const report=JSON.parse(fs.readFileSync(dir+'/current.json'));compare(report);fs.writeFileSync(dir+'/current.json',JSON.stringify(report,null,2));return;}const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const report={views:{},errors:[]};try{
const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});p.on('pageerror',e=>report.errors.push(e.message));
if(baseline)await p.route('**/*',r=>{const f=new URL(r.request().url()).pathname.slice(1);return old[f]?r.fulfill({body:old[f],contentType:f.endsWith('.html')?'text/html':'application/javascript'}):r.continue();});
await p.goto('http://127.0.0.1:4174/?workshopDebug');await p.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence?.active,null,{timeout:90000});
for(const [w,h]of [[761,900],[768,1024],[1024,768],[1440,900],[1920,1080],[1080,1920]]){
 const previousFrame=await p.evaluate(()=>__workshopDev.state().metrics.frames);
 await p.setViewportSize({width:w,height:h});
 await p.waitForFunction(n=>__workshopDev.state().metrics.frames>=n+2,previousFrame,{timeout:60000});
 for(const dest of ['overview','about','production','communications']){
  await p.evaluate(d=>WorkshopNavigation.navigate(d,{instant:true}),dest);
  await p.waitForFunction(d=>Math.abs(__communicationsScene.getState().progress-WorkshopNavigation.destinations[d])<.002,dest,{timeout:60000});
  if(dest==='production')await p.waitForFunction(()=>ProductionDiscovery.getState().cameraArrived,null,{timeout:60000});
  if(dest==='communications')await p.waitForFunction(()=>__communicationsScene.getState().cars?.every(c=>c.ready),null,{timeout:60000});
  await p.waitForFunction(()=>!ProductionDiscovery.getState().transitioning,null,{timeout:60000});
  await p.waitForTimeout(350);
  const key=w+'x'+h+'-'+dest;
  report.views[key]=await p.evaluate(selectors=>({camera:__workshopDev.state().cameraPose,controls:Object.fromEntries(selectors.map(s=>{const n=document.querySelector(s);if(!n)return[s,null];const r=n.getBoundingClientRect(),c=getComputedStyle(n);return[s,{x:r.x,y:r.y,width:r.width,height:r.height,display:c.display,fontSize:c.fontSize,background:c.backgroundImage,borderRadius:c.borderRadius}];}))}),selectors);
  if(w===1440||w===768)await p.screenshot({path:dir+'/'+name+'-'+key+'.png'});
 }
 console.log(name,w,h);
}
assert.deepEqual(report.errors,[]);
if(!baseline)compare(report);
}finally{fs.writeFileSync(dir+'/'+name+'.json',JSON.stringify(report,null,2));await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
