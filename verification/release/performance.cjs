const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {launch}=require('../browser.cjs');
const output=path.resolve(process.env.WORKSHOP_OUTPUT||'verification/test-results/performance');fs.mkdirSync(output,{recursive:true});
const targets=process.env.WORKSHOP_BASELINE_URL?[{name:'baseline',url:process.env.WORKSHOP_BASELINE_URL},{name:'production',url:process.env.WORKSHOP_BASE_URL||'http://127.0.0.1:4174'}]:[{name:'production',url:process.env.WORKSHOP_BASE_URL||'http://127.0.0.1:4174'}];
const report={started:new Date().toISOString(),environment:'Windows desktop GPU, Chromium headless; DPR 1; normal motion; desktop and touch viewport emulation. No physical phone or driver memory measurement.',runs:[],loads:[],errors:[]};
const save=()=>fs.writeFileSync(path.join(output,'performance.json'),JSON.stringify(report,null,2));
async function sample(p,destination){return p.evaluate(destination=>new Promise(resolve=>{
 const frames=[],cpu=[],longTasks=[];let previous=0;const before=__workshopDev.state(),start=performance.now(),frameStart=before.metrics.frames,heapStart=performance.memory?.usedJSHeapSize;let lastFrame=frameStart;
 const observer=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(e=>e.duration)));observer.observe({type:'longtask'});
 function step(now){const state=__workshopDev.state(),frame=state.metrics.frames;if(frame!==lastFrame){if(previous)frames.push(now-previous);previous=now;lastFrame=frame;cpu.push(state.metrics.frameMs);}
  if(now-start<4000)return requestAnimationFrame(step);
  observer.disconnect();frames.sort((a,b)=>a-b);cpu.sort((a,b)=>a-b);const q=(a,v)=>a[Math.min(a.length-1,Math.floor(a.length*v))]??null;
  resolve({destination,frames:lastFrame-frameStart,durationMs:now-start,fps:(lastFrame-frameStart)*1000/(now-start),medianMs:q(frames,.5),p95Ms:q(frames,.95),cpuSubmissionMedianMs:q(cpu,.5),drawCalls:state.metrics.drawCalls,resources:state.gpuResources,heapStart,heapEnd:performance.memory?.usedJSHeapSize,longTasks,canvas:[stage.width,stage.height],glError:stage.getContext('webgl2').getError()});
 }requestAnimationFrame(step);
}),destination);}
(async()=>{const b=await launch();report.browser=b.version();try{
 for(let run=0;run<3;run++)for(const [width,height] of [[1440,900],[390,844]])for(const target of (run%2?[...targets].reverse():targets)){
  const p=await b.newPage({viewport:{width,height},isMobile:width<760,hasTouch:width<760,deviceScaleFactor:1});p.setDefaultTimeout(90000);p.on('pageerror',e=>report.errors.push(e.message));
  for(let load=0;load<2;load++){
   const start=Date.now();if(load)await p.reload();else await p.goto(target.url+'/?workshopDebug');
   await p.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence.active&&__engineerScene.renderer.getState().ready);await p.waitForTimeout(600);
   report.loads.push({run,width,height,target:target.name,repeat:!!load,wallReadyMs:Date.now()-start,...await p.evaluate(()=>({navigation:performance.getEntriesByType('navigation')[0].toJSON(),resourceCount:performance.getEntriesByType('resource').length,transferBytes:performance.getEntriesByType('resource').reduce((s,r)=>s+r.transferSize,0),encodedBodyBytes:performance.getEntriesByType('resource').reduce((s,r)=>s+r.encodedBodySize,0),largest:performance.getEntriesByType('resource').map(r=>({url:new URL(r.name).pathname,bytes:r.encodedBodySize})).sort((a,b)=>b.bytes-a.bytes).slice(0,5)}))});
  }
  report.renderer=await p.evaluate(()=>{const g=stage.getContext('webgl2');return g.getParameter(g.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL)});
  for(const destination of ['overview','about','production','lab','skills','experience','communications']){await p.evaluate(id=>WorkshopNavigation.navigate(id,{instant:true}),destination);await p.waitForTimeout(1200);report.runs.push({run,width,height,target:target.name,...await sample(p,destination)});save();}
  await p.close();console.log('Measured',run,width,target.name);save();
 }
 assert.equal(report.errors.length,0);assert.ok(report.runs.every(r=>r.glError===0&&r.frames>0));
 }finally{report.completed=new Date().toISOString();save();await b.close();}
})().catch(e=>{report.failure=e.stack;save();console.error(e);process.exitCode=1});
