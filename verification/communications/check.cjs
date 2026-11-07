const {chromium}=require('playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.WORKSHOP_BASE_URL||'http://127.0.0.1:4173';
const report={checks:[],errors:[],state:null};
function check(name,condition){assert.ok(condition,name);report.checks.push(name);console.log('PASS',name);}
async function enter(page){
 await page.evaluate(()=>{
  if(window.__kiraSequence?.active&&!window.__kiraSequence.entering)document.querySelector('#kiraSkip')?.click();
 });
 await page.waitForFunction(()=>!window.__kiraSequence?.active);
 await page.evaluate(()=>WorkshopNavigation.navigate('communications',{instant:true}));
}
(async()=>{
 const browser=await chromium.launch({
  executablePath:process.env.WORKSHOP_BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']
 });
 try{
  const p=await browser.newPage({viewport:{width:1440,height:900}});
  p.on('pageerror',e=>report.errors.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('Failed to load resource'))report.errors.push(m.text());});
  p.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('Sarith_Dodangodage_CV.pdf'))report.errors.push(r.status()+' '+r.url());});
  await p.goto(base+'/?workshopDebug');
  await p.waitForFunction(()=>window.__portfolioReady);
  await enter(p);
  await p.waitForTimeout(2500);
  await p.waitForFunction(()=>window.__communicationsScene?.getState().doorAperture<.05);
  await p.screenshot({path:'verification/communications/desktop.png'});
  report.state=await p.evaluate(()=>({
   room:__communicationsScene.getState(),
   links:[...document.querySelectorAll('#communicationsPanel a')].map(a=>a.getAttribute('href')),
   visible:!communicationsPanel.hidden,layout:communicationsPanel.dataset.layout
  }));
  check('Desktop contact controls align to the physical display',report.state.visible&&report.state.layout==='wall');
  check('All four existing contact actions are represented',report.state.links.length===4);
  check('Reception doors close after the visitor arrives',report.state.room.doorAperture<.05);
  check('Room stays below the 320 scene draw-call budget',report.state.room.metrics.drawCalls<320);
  const resources=await p.evaluate(()=>__communicationsScene.getState().resources);
  for(let i=0;i<20;i++){
   await p.evaluate(()=>WorkshopNavigation.navigate('lab',{instant:true}));
   await p.evaluate(()=>new Promise(requestAnimationFrame));
   await p.evaluate(()=>WorkshopNavigation.navigate('communications',{instant:true}));
   await p.evaluate(()=>new Promise(requestAnimationFrame));
  }
  assert.deepEqual(await p.evaluate(()=>__communicationsScene.getState().resources),resources);
  check('Twenty visits reuse the same buffers and textures',true);
  await p.setViewportSize({width:390,height:844});
  await p.waitForTimeout(1500);
  await p.screenshot({path:'verification/communications/mobile.png'});
  check('Mobile uses readable controls and a separate room viewport',await p.evaluate(()=>
   communicationsPanel.dataset.layout==='reading'&&__communicationsScene.getState().camera.viewport.height<innerHeight/2));
  await p.evaluate(()=>WorkshopNavigation.navigate('skills',{instant:true}));
  await p.waitForTimeout(500);
  check('Returning to Skills removes the contact overlay',!await p.locator('#communicationsPanel').isVisible());
  await p.emulateMedia({reducedMotion:'reduce'});
  await enter(p);
  await p.waitForTimeout(500);
  const frozen=await p.evaluate(()=>CommunicationsRoom.time);
  await p.waitForTimeout(500);
  check('Reduced motion freezes daylight and foliage time',await p.evaluate(()=>CommunicationsRoom.time)===frozen);
  await p.setViewportSize({width:1440,height:900});
  await p.waitForTimeout(750);
  check('Desktop display keeps its wall placement between reduced-motion render frames',await p.evaluate(()=>{
   CommunicationsInterface.update(.99,null);
   return communicationsPanel.dataset.layout==='wall';
  }));
  const fallback=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  fallback.on('pageerror',e=>report.errors.push(e.message));
  await fallback.addInitScript(()=>{
   const original=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args);};
  });
  await fallback.goto(base+'/#contact');
  await fallback.waitForFunction(()=>window.__portfolioReady);
  await enter(fallback);
  await fallback.waitForTimeout(750);
  check('Contact remains available without WebGL',await fallback.locator('#communicationsPanel').isVisible());
  check('Fallback email control is reachable above the illustration',await fallback.evaluate(()=>{
   const a=communicationsPanel.querySelector('a'),r=a.getBoundingClientRect();
   return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('a')===a;
  }));
  await fallback.screenshot({path:'verification/communications/fallback.png'});
  await fallback.close();
  await p.close();
  const arrived=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  arrived.on('pageerror',e=>report.errors.push(e.message));
  await arrived.goto(base+'/#communications',{waitUntil:'domcontentloaded',timeout:60000});
  await arrived.waitForFunction(()=>window.__portfolioReady);
  await enter(arrived);
  await arrived.waitForFunction(()=>window.__communicationsScene?.getState().doorAperture<.05);
  report.entry=[];
  for(const progress of [.935,.94,.943,.948]){
   await arrived.evaluate(progress=>WorkshopNavigation.navigateProgress(progress,'communications',{instant:true}),progress);
   await arrived.waitForFunction(progress=>Math.abs(__communicationsScene.getState().progress-progress)<.0005,progress,{timeout:15000});
   const s=await arrived.evaluate(()=>__communicationsScene.getState());
   report.entry.push({progress,eye:s.camera.eye,aperture:s.doorAperture});
   if(progress===.943)await arrived.screenshot({path:'verification/communications/entrance.png'});
  }
  check('Shared doors open fully throughout the entry crossing',report.entry.every(s=>s.aperture>.9));
  check('Camera crosses the shared opening within its clear width and height',report.entry.every(s=>
   s.eye[2]>=-24.1||s.eye[2]<=-26.8||Math.abs(s.eye[0])<=.68&&s.eye[1]<=2.65));
  await arrived.evaluate(()=>WorkshopNavigation.navigate('communications',{instant:true}));
  await arrived.waitForTimeout(750);
  check('Single existing Kira parks on the charging pad',await arrived.evaluate(()=>{
   const p=__labScene.getState().kira,d=CommunicationsLayout.point(CommunicationsLayout.dock);
   return Math.hypot(p[0]-d[0],p[2]-d[2])<.01&&__labScene.getState().sharedKira;
  }));
  await arrived.screenshot({path:'verification/communications/arrived.png'});
  await arrived.close();
  check('No JavaScript, shader or unexpected HTTP errors',report.errors.length===0);
 }finally{
  fs.writeFileSync('verification/communications/report.json',JSON.stringify(report,null,2));
  await browser.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
