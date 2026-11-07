const {launch}=require('./browser.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.WORKSHOP_URL||'http://127.0.0.1:4173';
const report={checks:[],pageErrors:[],consoleErrors:[],screenshots:[],cycle:[],performance:{}};
const distance=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
function within(promise,milliseconds,label){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label+' timed out')),milliseconds);})]).finally(()=>clearTimeout(timer));}
const check=(label,condition=true)=>{assert.ok(condition,label);report.checks.push(label);console.log('PASS',label);};
const state=p=>p.evaluate(()=>window.__workshopDev.state());
async function ready(p){
 p.on('pageerror',e=>report.pageErrors.push(e.stack));
 p.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text())});
 await p.goto(base+'/?workshopDebug',{waitUntil:'load'});
 await p.waitForFunction(()=>window.__portfolioReady,null,{timeout:60000});
 await p.evaluate(()=>{if(window.__kiraSequence?.active&&!window.__kiraSequence.entering)document.getElementById('kiraSkip')?.click();});
 await p.waitForFunction(()=>window.__kiraSequence&&!window.__kiraSequence.active,null,{timeout:30000});
 await p.waitForTimeout(700);
}
async function seek(p,time){await p.evaluate(t=>window.__workshopDev.setTime(t),time);await p.waitForTimeout(450);}
async function focus(p,name){await p.locator('[data-hall="'+name+'"]').click();await p.waitForTimeout(1600);}
async function shot(p,name){const file='verification/'+name+'.png';await p.screenshot({path:file});report.screenshots.push(file);}
async function project(p,point){return p.evaluate(point=>{
 const c=window.__workshopDev.state().cameraPose,r=document.querySelector('#stage').getBoundingClientRect();
 const norm=a=>{const l=Math.hypot(...a);return a.map(v=>v/l)},dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const f=norm(c.target.map((v,i)=>v-c.eye[i])),right=norm(cross(f,[0,1,0])),up=cross(right,f),v=point.map((x,i)=>x-c.eye[i]),z=dot(v,f),h=Math.tan(c.fov/2);
 return {x:r.left+r.width*(.5+dot(v,right)/(2*z*h*c.aspect)),y:r.top+r.height*(.5-dot(v,up)/(2*z*h))};
 },point);}
async function scrollTo(p,progress){await p.evaluate(n=>window.scrollTo({top:n*innerHeight*7.7,behavior:'instant'}),progress);await p.waitForTimeout(1400);}

(async()=>{
 const browser=await launch();
 try{
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  await context.addInitScript(()=>{
   const original=HTMLCanvasElement.prototype.getContext;window.__webglSurfaces=new Set();
   HTMLCanvasElement.prototype.getContext=function(type,...args){const result=original.call(this,type,...args);if(result&&/^webgl/.test(type))window.__webglSurfaces.add(this.id);return result;};
  });
  const page=await context.newPage();await ready(page);
  check('Loader completes into the existing main canvas',await page.evaluate(()=>[...window.__webglSurfaces].join(',')==='stage'));
  report.renderer=await page.evaluate(()=>{const g=document.querySelector('#stage').getContext('webgl2'),e=g.getExtension('WEBGL_debug_renderer_info');return e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):'unavailable';});
  if(!process.env.WORKSHOP_QUICK){
  const before=await state(page);await seek(page,0);await page.evaluate(()=>window.__workshopDev.run());
  await page.exposeFunction('__qaPhase',entry=>{report.cycle.push(entry);console.log('CYCLE',entry.cycle,entry.phase);});
  await page.evaluate(()=>{
   window.__cycleSamples=[];window.__lastTrace='';window.__traceTimer=setInterval(()=>{
    const s=window.__workshopDev.state(),key=s.count+':'+s.phase;
    window.__cycleSamples.push({t:performance.now(),motionTime:s.kiraRoutine.elapsed,cycle:s.count,phase:s.phase,owner:s.owner,expected:s.component,actual:s.actualComponent,tool:s.tool,visible:s.visible,gate:s.outputGate,kira:s.kira,kiraPhase:s.kiraRoutine.phase,heading:s.kiraHeading,tracks:s.trackPhases,roller:s.rollerAngle,encounter:s.engineerEncounter,engineerClip:s.engineerClip,eyes:s.eyes,headTilt:s.kiraHeadTilt});
    if(key!==window.__lastTrace){window.__lastTrace=key;window.__qaPhase({phase:s.phase,cycle:s.count,clock:s.clock});}
   },90);
  });
  const started=Date.now(),startFrame=(await state(page)).metrics.frames;
  const tour=(async()=>{await page.waitForFunction(()=>__workshopDev.state().kiraRoutine.phase==='observe',null,{timeout:45000});await page.waitForTimeout(1300);await shot(page,'10-kira-left-patrol');await page.waitForFunction(()=>__workshopDev.state().kiraRoutine.phase==='turnAcross');await page.waitForTimeout(800);await shot(page,'12-engineer-kira-farewell');await page.waitForFunction(()=>__workshopDev.state().kiraRoutine.phase==='observeRight',null,{timeout:65000});await shot(page,'11-kira-right-patrol');await page.waitForFunction(()=>__workshopDev.state().kiraRoutine.phase==='dock',null,{timeout:40000});})();
  await page.waitForFunction(()=>window.__livingWorkshopState.cycle>=2,null,{timeout:110000});
  await tour;
  const ended=await state(page),wall=(Date.now()-started)/1000;
  const samples=await page.evaluate(()=>{clearInterval(window.__traceTimer);return window.__cycleSamples});
  check('Live browser completes all 16 manufacturing phases',new Set(report.cycle.filter(x=>x.cycle===1).map(x=>x.phase)).size===16);
  const attachmentError=Math.max(...samples.filter(s=>s.owner==='gripper').map(s=>distance(s.actual,s.tool)));
  const arriving=samples.filter(s=>s.phase==='arrival'&&s.cycle===1);
  const firstArrival=arriving[0],lastArrival=arriving[arriving.length-1];
  check('Conveyor rollers drive their top surfaces with the component',lastArrival.roller>firstArrival.roller&&Math.abs((lastArrival.roller-firstArrival.roller)*.075-(lastArrival.expected[2]-firstArrival.expected[2]))<.00001);
  const placementError=Math.max(...samples.filter(s=>['shuttle','stage','output','gripper'].includes(s.owner)).map(s=>distance(s.actual,s.expected)));
  check('Real scene hierarchy retains component during grip, placement and output',attachmentError<.00002&&placementError<.00002);
  check('Finished component is removed only after the output gate closes',samples.every((s,i)=>s.visible||(s.owner==='cassette'&&s.actual[2]<-5.3&&(!i||!samples[i-1].visible||s.gate===0))));
  check('Kira remains grounded across the full safe foreground lane',samples.every(s=>s.kira[0]>=-9.201&&s.kira[0]<=9.201&&Math.abs(s.kira[1]-.004)<.001&&s.kira[2]>=4.649&&s.kira[2]<=5.301));
  const minX=Math.min(...samples.map(s=>s.kira[0])),maxX=Math.max(...samples.map(s=>s.kira[0]));
  check('Kira reaches both sides of the floor and returns to his dock',minX< -9.19&&maxX>9.19&&ended.kiraRoutine.phase==='dock'&&Math.abs(ended.kira[0]-3.52)<1e-6);
  check('Engineer uses skeletal greeting and departure gestures for Kira',samples.some(s=>s.encounter.phase==='arrival'&&s.engineerClip==='ENGINEER_GREETING')&&samples.some(s=>s.encounter.phase==='farewell'&&s.engineerClip==='ENGINEER_EXIT')&&ended.engineerEncounter.greetings>=1&&ended.engineerEncounter.farewells>=1);
  check('Kira replies to both gestures with his face and articulated head',ended.engineerEncounter.robotReplies>=2&&['arrival','farewell'].every(phase=>samples.some(s=>s.encounter.phase===phase&&s.encounter.robotReplied&&s.eyes==='happy'&&s.headTilt>-.01)));
  let peakSpeed=0,peakWallSampleSpeed=0,trackError=0;
  for(let i=1;i<samples.length;i++){const a=samples[i-1],b=samples[i],dx=b.kira[0]-a.kira[0],dz=b.kira[2]-a.kira[2],distance=Math.hypot(dx,dz),elapsed=b.motionTime-a.motionTime;if(elapsed>0)peakSpeed=Math.max(peakSpeed,distance/elapsed);peakWallSampleSpeed=Math.max(peakWallSampleSpeed,distance*1000/(b.t-a.t));if(a.kiraPhase===b.kiraPhase&&['out','across','home'].includes(a.kiraPhase)&&Math.abs(a.heading-b.heading)<.003){const phase=b.tracks[0]-a.tracks[0],wrapped=phase-Math.round(phase);trackError=Math.max(trackError,Math.abs(wrapped*3.35-dx*Math.sin(b.heading)-dz*Math.cos(b.heading)));}}
  const clearsMotor=s=>{const d=[6.85-s.kira[0],4.23-s.kira[2]],f=[Math.sin(s.heading),Math.cos(s.heading)],r=[Math.cos(s.heading),-Math.sin(s.heading)],dot=(a,b)=>a[0]*b[0]+a[1]*b[1];return [[1,0],[0,1],f,r].some(axis=>Math.abs(dot(d,axis))>.70*Math.abs(dot(f,axis))+.50*Math.abs(dot(r,axis))+.22*Math.abs(axis[0])+.25*Math.abs(axis[1])+.03);};
  check('Full-width route clears the conveyor motor with the oriented chassis footprint',samples.every(clearsMotor));
  report.kiraTour={minX,maxX,peakSpeed,peakWallSampleSpeed,trackError};check('Full-width patrol preserves bounded speed and travel-driven tracks',peakSpeed<1.1&&trackError<.002);
  check('No GPU resources grow over a complete cycle',JSON.stringify(before.gpuResources)===JSON.stringify(ended.gpuResources));
  report.performance.desktop={fps:+((ended.metrics.frames-startFrame)/wall).toFixed(1),wallSeconds:+wall.toFixed(2),drawCalls:ended.metrics.drawCalls,cpuSubmitMs:+ended.metrics.frameMs.toFixed(2),attachmentError,placementError};
  }else report.liveCycleSkipped=true;
  await seek(page,4);await focus(page,'overview');await shot(page,'01-workshop-overview');
  await focus(page,'assembly');await seek(page,25);await shot(page,'02-assembly-workstation');
  await seek(page,26.8);await shot(page,'03-component-pickup');
  await seek(page,40.5);await shot(page,'04-assembly-inspection');
  await focus(page,'intelligence');await shot(page,'05-server-monitor');
  let s=await state(page);check('Digital twin reads actual physical joint transforms',distance(s.monitor.joints,s.joints)<.00001&&s.monitor.label.startsWith(s.id));
  await page.locator('[data-display="control"]').click();await page.waitForTimeout(400);check('Signal display mode works',(await state(page)).monitor.mode==='control');
  await page.locator('[data-display="software"]').click();await page.waitForTimeout(400);check('Logic display mode works',(await state(page)).monitor.mode==='software');
  await page.locator('[data-display="twin"]').click();
  await page.keyboard.press('Escape');await page.waitForTimeout(1500);check('Escape returns to guided workshop',!(await page.locator('body').getAttribute('class')).includes('hall-inspecting'));
  await focus(page,'conveyor');await seek(page,11.3);await shot(page,'08-component-detection');
  await focus(page,'overview');await seek(page,30);
  let point=await project(page,[-2.1,2.0,-.1]);await page.mouse.move(point.x,point.y);await page.waitForTimeout(150);
  check('Machinery hover uses scene picking',(await state(page)).hover==='assembly');
  await page.mouse.click(point.x,point.y);await page.waitForTimeout(1500);check('Clicking machinery opens the station',(await state(page)).camera==='assembly');
  await page.locator('#hallReturn').click();await page.waitForTimeout(1500);
  s=await state(page);point=await project(page,[s.kira[0],.8,s.kira[2]]);await page.mouse.click(point.x,point.y);await page.waitForTimeout(200);
  check('Kira can be selected at his actual projected position',(await state(page)).kiraRoutine.greeting>0);
  await shot(page,'06-kira-environment');
  const greetings=(await state(page)).kiraRoutine.greeting;await page.locator('#hallGreet').click();check('Kira interaction cooldown prevents repeated triggering',(await state(page)).kiraRoutine.greeting===greetings);
  s=await state(page);await page.waitForTimeout(450);check('Pause holds the current pose and component',Math.abs((await state(page)).clock-s.clock)<1e-8);
  await page.locator('#hallRestart').click();await page.waitForTimeout(200);s=await state(page);check('Restart is queued without a visible reset',s.restartRequested&&s.phase==='transport'&&s.clock>=30);
  await page.locator('#hallPause').click();
  for(const n of [0,.22,.43,.52,.22,0]){
   await scrollTo(page,n);s=await state(page);check('Guided scroll reaches '+n,s.camera==='guided'&&s.cameraPose.eye.every(Number.isFinite));
   assert.ok(s.cameraPose.eye[1]>.5,'guided camera stays above the floor');
  }
  await focus(page,'assembly');await page.mouse.move(1100,600);await page.mouse.wheel(0,250);await page.waitForTimeout(600);
  check('Normal scrolling exits inspection without capturing scroll',(await state(page)).camera==='guided'&&await page.evaluate(()=>scrollY)>0);
  await scrollTo(page,0);
  // Invoke the real visibility handlers while preserving the browser's default state afterward.
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  s=await state(page);await page.waitForTimeout(500);check('Visibility handler freezes the simulation',(await state(page)).clock===s.clock);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await page.locator('.topnav a[href="#work"]').click();await page.waitForTimeout(1800);check('Existing Work navigation reaches project discovery',await page.evaluate(()=>ProductionDiscovery.getState().active));
  await page.evaluate(()=>WorkshopNavigation.navigate('work'));await page.waitForTimeout(1400);check('Existing archive remains available',await page.locator('#work').evaluate(e=>e.classList.contains('active')));
  await page.locator('[data-project="1"]').click();await page.waitForTimeout(600);check('Existing project selection still works',await page.locator('#projectHeading').textContent().then(t=>t.startsWith('TERRAVITA')));
  await page.locator('.topnav a[href="#about"]').click();await page.waitForTimeout(1800);check('Existing About navigation still works',await page.evaluate(()=>EngineerAbout.getState().active));
  await page.locator('.topnav a[href="#contact"]').click();await page.waitForTimeout(1800);check('Existing contact links remain accessible',await page.locator('#contact').evaluate(e=>e.classList.contains('active'))&&await page.locator('a[href="mailto:sarithdodangodage@outlook.com"]').count()>0);
  const cvStatus=(await page.request.get(base+'/Sarith_Dodangodage_CV.pdf')).status();
  if(cvStatus===200)check('Résumé still serves successfully');
  else{report.missingResources=[{url:'Sarith_Dodangodage_CV.pdf',status:cvStatus,reason:'PDF is absent from this checkout and the restore-point commit; original links retained.'}];console.warn('EXISTING MISSING RESOURCE: résumé PDF / '+cvStatus);}

  await page.locator('.brand').click();await page.waitForTimeout(2000);
  await page.evaluate(()=>document.querySelector('#stage').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await page.waitForTimeout(600);
  check('Context loss cleans up the scene and retains accessible portfolio',await page.locator('#livingHallFallback').isVisible()&&await page.locator('#home h1').isVisible()&&await page.locator('#hallFocusTools').count()===0);
  await context.close();
  const mobileContext=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const mobile=await mobileContext.newPage();await mobile.bringToFront();await ready(mobile);await seek(mobile,30);await focus(mobile,'overview');
  await shot(mobile,'07-mobile-workshop');
  check('Mobile has no horizontal overflow',await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await mobile.locator('#menuButton').tap();check('Existing mobile navigation opens',await mobile.locator('#menuButton').getAttribute('aria-expanded')==='true');await mobile.locator('#menuButton').tap();
  await focus(mobile,'intelligence');check('Control station is reachable by touch',await mobile.locator('.hall-station-info').isVisible());await shot(mobile,'09-mobile-control');
  const cdp=await mobileContext.newCDPSession(mobile);
  await mobile.bringToFront();
  const touchEvents=[cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:210,y:600}]})];
  for(let i=1;i<=12;i++){touchEvents.push(cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:210,y:600-i*25}]}));await mobile.waitForTimeout(25);}
  touchEvents.push(cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}));
  await within(Promise.all(touchEvents),15000,'Touch gesture acknowledgements');await mobile.waitForTimeout(900);
  check('Touch scrolling remains native and exits inspection',await mobile.evaluate(()=>scrollY)>0&&(await state(mobile)).camera==='guided');
  await scrollTo(mobile,0);await mobile.locator('#hallPause').click();
  const mobileStart=(await state(mobile)).metrics.frames,ms=Date.now();await mobile.waitForTimeout(4000);s=await state(mobile);
  report.performance.mobile={fps:+((s.metrics.frames-mobileStart)/((Date.now()-ms)/1000)).toFixed(1),drawCalls:s.metrics.drawCalls,renderSize:await mobile.locator('#stage').evaluate(c=>[c.width,c.height])};
  await mobile.setViewportSize({width:844,height:390});await mobile.waitForTimeout(1200);check('Landscape resize has no overflow or invalid camera',await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)&&(await state(mobile)).cameraPose.eye.every(Number.isFinite));
  await mobileContext.close();

  const reducedContext=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});
  const reduced=await reducedContext.newPage();await ready(reduced);s=await state(reduced);await reduced.waitForTimeout(1200);
  const afterReduced=await state(reduced);check('Reduced motion starts paused with stationary tracks',s.paused&&s.clock===0&&afterReduced.clock===0&&distance(s.trackPhases,afterReduced.trackPhases)<1e-9);
  await focus(reduced,'assembly');check('Reduced motion permits station navigation',(await state(reduced)).camera==='assembly');await reducedContext.close();

  const fallbackContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await fallbackContext.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/.test(type)?null:original.call(this,type,...args);};});
  const fallback=await fallbackContext.newPage();await ready(fallback);
  check('WebGL failure exposes the hall fallback and original content',await fallback.locator('#livingHallFallback').isVisible()&&await fallback.locator('#home h1').isVisible());
  await fallback.locator('#menuButton').click();await fallback.locator('#mobileNav a[href="#contact"]').click();await fallback.waitForTimeout(500);
  check('Portfolio navigation remains usable without WebGL',await fallback.locator('#contact').evaluate(e=>e.classList.contains('active')));await fallbackContext.close();

  check('No browser JavaScript errors',report.pageErrors.length===0);
  check('No browser console errors',report.consoleErrors.length===0);
  report.success=true;
 }catch(error){report.success=false;report.failure=error.stack;console.error(error);process.exitCode=1;}
 finally{fs.writeFileSync('verification/browser-report.json',JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify({success:report.success,checks:report.checks.length,performance:report.performance,errors:report.pageErrors},null,2));}
})().catch(error=>{console.error(error);process.exitCode=1;});
