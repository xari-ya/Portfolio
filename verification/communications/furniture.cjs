const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const perfOnly=process.argv.includes('--perf-only');
const report={errors:[],performance:{},checks:[]},base='http://127.0.0.1:4174';
const files=['room.js','materials.js','daylight.js'];
const baseline=Object.fromEntries(files.map(f=>[f,execFileSync('git',['show','92e5a96:communications-room/'+f],{encoding:'utf8'})]));
async function frames(p,n){const start=await p.evaluate(()=>__communicationsScene.getState().metrics.frames);await p.waitForFunction(s=>__communicationsScene.getState().metrics.frames>=s.n+s.start,{start,n},{timeout:90000});}
async function measure(p){await frames(p,30);return p.evaluate(()=>new Promise(resolve=>{let last=performance.now(),frame=__communicationsScene.getState().metrics.frames;const intervals=[];function sample(t){const s=__communicationsScene.getState();if(s.metrics.frames!==frame){intervals.push(t-last);last=t;frame=s.metrics.frames;}if(intervals.length<48)requestAnimationFrame(sample);else{intervals.sort((a,b)=>a-b);resolve({median:intervals[24],p95:intervals[45],drawCalls:s.metrics.drawCalls,resources:s.resources,geometry:s.geometry,materials:s.materialTextures});}}requestAnimationFrame(sample);}));}
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
for(const old of [true,false]){
 const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});p.on('pageerror',e=>report.errors.push(e.message));
 if(old)await p.route('**/communications-room/*.js',r=>{const f=new URL(r.request().url()).pathname.split('/').pop();return baseline[f]?r.fulfill({body:baseline[f],contentType:'application/javascript'}):r.continue();});
 await p.goto(base+'/#communications');await p.waitForFunction(()=>window.__communicationsScene?.getState().behaviour.docked,null,{timeout:90000});
 if(!old&&!perfOnly){
  await p.screenshot({path:'verification/communications/furniture-overview.png'});
  await p.evaluate(()=>CommunicationsCamera.yaw=.27);await frames(p,2);await p.screenshot({path:'verification/communications/furniture-lounge.png'});
  await p.evaluate(()=>CommunicationsCamera.yaw=-.25);await frames(p,2);await p.screenshot({path:'verification/communications/furniture-left.png'});
  await p.evaluate(()=>CommunicationsCamera.reset());
  const resources=await p.evaluate(()=>__communicationsScene.getState().resources);
  for(let i=0;i<20;i++){await p.evaluate(()=>WorkshopNavigation.navigate('lab',{instant:true}));await frames(p,1);await p.evaluate(()=>WorkshopNavigation.navigate('communications',{instant:true}));await frames(p,1);}
  assert.deepEqual(await p.evaluate(()=>__communicationsScene.getState().resources),resources);report.checks.push('Twenty visits reuse GPU resources');
  await p.locator('[data-comms-action="2"]').hover();await frames(p,2);assert.equal(await p.evaluate(()=>__communicationsScene.getState().equipment.workstationPhase),2);report.checks.push('GitHub still activates workstation');await p.mouse.move(700,750);
 }
 await p.emulateMedia({reducedMotion:'no-preference'});report.performance[old?'baseline':'current']={};
 for(const [name,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){await p.setViewportSize(viewport);report.performance[old?'baseline':'current'][name]=await measure(p);if(!old&&name==='mobile'){assert.equal(await p.evaluate(()=>communicationsPanel.dataset.layout),'reading');await p.screenshot({path:'verification/communications/furniture-mobile.png'});report.checks.push('Mobile contact reading panel remains usable');}}
 await p.close();console.log(old?'Baseline measured':'Furniture checked and measured');
}
for(const view of ['desktop','mobile']){const a=report.performance.baseline[view],c=report.performance.current[view];assert.ok(c.drawCalls<320);assert.equal(c.resources.textures,a.resources.textures+1);report.checks.push(view+' draw-call budget and single added texture');report.performance[view+'Change']={medianPercent:100*(c.median/a.median-1),p95Percent:100*(c.p95/a.p95-1)};assert.ok(c.median<=a.median*1.1,view+' median within 10 percent');assert.ok(c.p95<=a.p95*1.1,view+' p95 within 10 percent');}
assert.deepEqual(report.errors,[]);report.checks.push('No browser runtime errors');
}finally{fs.writeFileSync('verification/communications/'+(perfOnly?'furniture-performance.json':'furniture-report.json'),JSON.stringify(report,null,2));await b.close();}console.log(JSON.stringify(report,null,2));})().catch(e=>{console.error(e);process.exitCode=1;});
