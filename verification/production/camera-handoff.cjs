/* Desktop regression; mobile tracking is covered by mobile-delivery-follow.cjs.
 * Observe the rendered camera through the real, unskipped delivery. A direct
 * overview-to-arm handoff must stay in that corridor, even though page scroll
 * passes the About and conveyor milestones on its way to assembly. */
const {launch}=require('../browser.cjs'),assert=require('node:assert/strict'),fs=require('node:fs');
const report={checks:[],errors:[],views:{}},check=(name,ok)=>{assert.ok(ok,name);report.checks.push(name);console.log('PASS',name);};
(async()=>{const browser=await launch();try{
 for(const [name,viewport,mobile] of [['desktop',{width:1440,height:900},false]]){
  const p=await browser.newPage({viewport,isMobile:mobile,hasTouch:mobile});p.on('pageerror',e=>report.errors.push(e.message));await p.goto('http://127.0.0.1:4173/?workshopDebug');await p.waitForFunction(()=>window.__portfolioReady&&!__kiraSequence.active);await p.addStyleTag({content:'#hallFocusTools{display:none!important}'});await p.waitForTimeout(700);
  await p.evaluate(()=>WorkshopNavigation.navigate('production',{instant:true}));await p.waitForFunction(()=>ProductionDiscovery.getState().active&&!ProductionDiscovery.getState().transitioning);
  await p.evaluate(()=>{
   window.__handoffTrace=[];window.__handoffStarted=0;window.__handoffEnd=0;
   window.addEventListener('workshop:navigate',e=>{if(e.detail.destination==='assembly'&&!__handoffStarted){__handoffStarted=performance.now();__handoffEnd=__handoffStarted+2800;}});
   function sample(){const now=performance.now();if(__handoffStarted){const s=__workshopDev.state(),c=s.cameraPose;__handoffTrace.push({at:now-__handoffStarted,progress:WorkshopNavigation.getState().progress,eye:c.eye,target:c.target,viewport:c.viewport,discovery:ProductionDiscovery.getViewState().active,owner:s.owner,job:s.job?.id});}if(!__handoffStarted||now<__handoffEnd)requestAnimationFrame(sample);}requestAnimationFrame(sample);
  });
  await p.locator('#productionSelect').click();await p.waitForFunction(()=>window.__handoffStarted>0,null,{timeout:16000});await p.waitForTimeout(2950);const trace=await p.evaluate(()=>__handoffTrace);
  const start=trace[0].target,end=mobile?[-.7,1.75,.15]:[-1.85,1.60,.05];
  report.views[name]={frames:trace.length,start,end,xRange:[Math.min(...trace.map(s=>s.target[0])),Math.max(...trace.map(s=>s.target[0]))],viewportHeights:[...new Set(trace.map(s=>+s.viewport.height.toFixed(2)))],samples:trace.filter((_,i)=>i%30===0||i===trace.length-1)};
  check(name+': actual delivery reaches the arm with the selected carrier',trace.length>50&&trace.every(s=>s.job==='obsidian')&&await p.evaluate(()=>__productionScene.controller.presentationRequested));
  check(name+': rendered camera never detours back through the conveyor',trace.every(s=>s.target.every((n,i)=>n>=Math.min(start[i],end[i])-.04&&n<=Math.max(start[i],end[i])+.04)));
  check(name+': discovery interface stays closed throughout the handoff',trace.every(s=>!s.discovery));
  check(name+': intermediate section viewports never interrupt the arm transition',trace.every(s=>Math.abs(s.viewport.top)<.1&&Math.abs(s.viewport.height-viewport.height)<.1));
  const last=trace.at(-1);check(name+': camera settles at the assembly destination',Math.hypot(...last.target.map((n,i)=>n-end[i]))<.015);
  await p.screenshot({path:'verification/production/camera-handoff-'+name+'.png'});
  await p.evaluate(()=>WorkshopNavigation.navigate('production'));await p.waitForFunction(()=>ProductionDiscovery.getState().active&&!ProductionDiscovery.getState().transitioning);await p.waitForTimeout(1100);
  check(name+': returning to discovery remains available and clears the carrier',await p.evaluate(()=>__productionScene.controller.discoveryHold&&__productionScene.controller.job===null&&__productionScene.getState().architecture.parallelCutaway));await p.close();
 }
 check('No runtime JavaScript errors',report.errors.length===0);
}catch(e){report.failure=e.stack;throw e;}finally{fs.writeFileSync('verification/production/camera-handoff-report.json',JSON.stringify(report,null,2)+'\n');await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
