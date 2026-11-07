const {chromium}=require('playwright'),fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const files=['index.html','engine.js','workshop-hall.js','communications-room/room.js','communications-room/camera.js','communications-room/graphics.js','communications-room/interface.js','communications-room/behaviour.js','communications-room/room.css','communications-room/daylight.js'];
const old=Object.fromEntries(files.map(f=>[f,cp.execFileSync('git',['show','981b51c:'+f],{maxBuffer:20*1024*1024})]));
const report={checkpoint:'981b51c',environment:'Chrome SwiftShader, reduced motion; physical GPU and Safari not measured',baseline:{},current:{},errors:[]};
async function frame(p,n=3){const start=await p.evaluate(()=>__workshopDev.state().metrics.frames);await p.waitForFunction(({start,n})=>__workshopDev.state().metrics.frames>=start+n,{start,n},{timeout:90000});}
async function sample(p){await frame(p,6);return p.evaluate(()=>new Promise(resolve=>{let count=__workshopDev.state().metrics.frames,last=performance.now();const times=[];function tick(now){const s=__workshopDev.state();if(s.metrics.frames!==count){times.push(now-last);last=now;count=s.metrics.frames;}if(times.length<12)requestAnimationFrame(tick);else{times.sort((a,b)=>a-b);resolve({medianMs:times[6],p95Ms:times[11],cpuMs:s.metrics.frameMs,drawCalls:s.metrics.drawCalls,resources:s.gpuResources});}}requestAnimationFrame(tick);}));}
async function state(p){return p.evaluate(()=>({camera:__workshopDev.state().cameraPose,controls:Object.fromEntries(['.topbar','#communicationsPanel','.comms-navigation','.engineer-actions','.production-preview','#engineeringLab'].map(selector=>{const n=document.querySelector(selector);if(!n)return [selector,null];const r=n.getBoundingClientRect(),s=getComputedStyle(n);return[selector,{x:r.x,y:r.y,width:r.width,height:r.height,font:s.font,background:s.backgroundImage,display:s.display}];}))}));}
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 for(const baseline of [true,false]){
  const result=report[baseline?'baseline':'current'];
  const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('Failed to load resource'))report.errors.push(m.text());});
  if(baseline)await p.route('**/*',r=>{const f=new URL(r.request().url()).pathname.slice(1)||'index.html';return old[f]?r.fulfill({body:old[f],contentType:f.endsWith('.html')?'text/html':f.endsWith('.css')?'text/css':'application/javascript'}):r.continue();});
  await p.goto('http://localhost:4174/?workshopDebug');await p.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence?.active,null,{timeout:90000});
  for(const [w,h]of [[1440,900],[768,1024],[761,900]]){
   await p.setViewportSize({width:w,height:h});await frame(p);
   for(const d of ['overview','production','skills','communications']){
    await p.evaluate(d=>WorkshopNavigation.navigate(d,{instant:true}),d);await frame(p);
    await p.waitForFunction(d=>Math.abs(WorkshopNavigation.getState().progress-WorkshopNavigation.destinations[d])<.002,d,{timeout:60000});
    if(d==='production')await p.waitForFunction(()=>!ProductionDiscovery.getState().transitioning,null,{timeout:60000});
    if(d==='communications')await p.waitForFunction(()=>window.__communicationsScene?.getState().cars?.every(c=>c.ready),null,{timeout:90000});
    result[w+'x'+h+'-'+d]=await state(p);
    if(d==='communications'&&w===1440){await p.screenshot({path:'verification/phone-ui/office-'+(baseline?'baseline':'current')+'-desktop.png'});result.desktopPerformance=await sample(p);}
   }
  }
  await p.setViewportSize({width:390,height:844});await frame(p);await p.evaluate(()=>WorkshopNavigation.navigate('communications',{instant:true}));await frame(p,4);result.phonePerformance=await sample(p);await p.close();console.log('Captured',baseline?'baseline':'current');
 }
 for(const [key,before]of Object.entries(report.baseline)){
  if(key.endsWith('Performance'))continue;const after=report.current[key];
  for(const k of ['eye','target'])before.camera[k].forEach((v,i)=>assert.ok(Math.abs(v-after.camera[k][i])<.002,key+' camera '+k));assert.ok(Math.abs(before.camera.fov-after.camera.fov)<1e-6,key+' FOV');
  const relevant=key.endsWith('-communications')?['.topbar','#communicationsPanel','.comms-navigation']:key.endsWith('-skills')?['.topbar','#engineeringLab']:key.endsWith('-production')?['.topbar','.production-preview']:['.topbar'];
  for(const selector of relevant){const a=before.controls[selector],c=after.controls[selector];assert.equal(!!a,!!c,key+selector);if(!a)continue;for(const [k,v]of Object.entries(a)){if(typeof v==='number')assert.ok(Math.abs(v-c[k])<.05,key+selector+k);else assert.equal(v,c[k],key+selector+k);}}
 }
 assert.deepEqual(report.errors,[]);report.preservedViews=12;
 for(const name of ['desktop','phone']){const a=report.baseline[name+'Performance'],c=report.current[name+'Performance'];report[name+'Change']={medianPercent:100*(c.medianMs/a.medianMs-1),drawCalls:c.drawCalls-a.drawCalls,buffers:c.resources.buffers-a.resources.buffers,textures:c.resources.textures-a.resources.textures};}
 console.log('PASS 12 desktop/tablet views preserved');console.log(JSON.stringify({desktop:report.desktopChange,phone:report.phoneChange}));
}finally{fs.writeFileSync('verification/phone-ui/office-preservation.json',JSON.stringify(report,null,2));await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
