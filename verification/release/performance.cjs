const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {launch}=require('../browser.cjs');
const output=path.resolve(process.env.WORKSHOP_OUTPUT||'verification/test-results/performance');fs.mkdirSync(output,{recursive:true});
const targets=process.env.WORKSHOP_BASELINE_URL?[{name:'baseline',url:process.env.WORKSHOP_BASELINE_URL},{name:'production',url:process.env.WORKSHOP_BASE_URL||'http://127.0.0.1:4174'}]:[{name:'production',url:process.env.WORKSHOP_BASE_URL||'http://127.0.0.1:4174'}];
const report={started:new Date().toISOString(),environment:'Windows desktop GPU, Chromium headless; DPR 1; normal motion; desktop and touch viewport emulation. No physical phone or driver memory measurement.',runs:[],loads:[],projectLoads:[],errors:[]};
const save=()=>fs.writeFileSync(path.join(output,'performance.json'),JSON.stringify(report,null,2));
async function sample(p,destination){return p.evaluate(destination=>new Promise(resolve=>{
 const longTasks=[],m=window.__releaseMetrics,before=__workshopDev.state(),start=performance.now(),frameStart=m.frames,drawStart=m.draws,heapStart=performance.memory?.usedJSHeapSize;m.intervals=[];m.cpu=[];m.last=0;m.active=true;
 const observer=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(e=>e.duration)));observer.observe({type:'longtask'});
 setTimeout(()=>{const now=performance.now(),state=__workshopDev.state();m.active=false;observer.disconnect();m.intervals.sort((a,b)=>a-b);m.cpu.sort((a,b)=>a-b);const q=(a,v)=>a[Math.min(a.length-1,Math.floor(a.length*v))]??null;
  resolve({destination,frames:m.frames-frameStart,legacyFrames:state.metrics.frames-before.metrics.frames,durationMs:now-start,fps:(m.frames-frameStart)*1000/(now-start),medianMs:q(m.intervals,.5),p95Ms:q(m.intervals,.95),cpuSubmissionMedianMs:q(m.cpu,.5),cpuSubmissionP95Ms:q(m.cpu,.95),drawCalls:(m.draws-drawStart)/(m.frames-frameStart),resources:state.gpuResources,heapStart,heapEnd:performance.memory?.usedJSHeapSize,longTasks,canvas:[stage.width,stage.height],glError:stage.getContext('webgl2').getError()});
 },4000);
}),destination);}
(async()=>{const b=await launch();report.browser=b.version();try{
 for(let run=0;run<Number(process.env.WORKSHOP_PERF_RUNS||3);run++)for(const [width,height] of (process.env.WORKSHOP_PERF_VIEWPORTS?JSON.parse(process.env.WORKSHOP_PERF_VIEWPORTS):[[1440,900],[390,844]]))for(const target of (run%2?[...targets].reverse():targets)){
  const p=await b.newPage({viewport:{width,height},isMobile:width<760,hasTouch:width<760,deviceScaleFactor:1});p.setDefaultTimeout(90000);p.on('pageerror',e=>report.errors.push(e.message));
  await p.addInitScript(()=>{const m=window.__releaseMetrics={frames:0,draws:0,active:false,intervals:[],cpu:[],last:0};for(const name of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){const original=WebGL2RenderingContext.prototype[name];WebGL2RenderingContext.prototype[name]=function(...args){m.draws++;return original.apply(this,args);};}const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=callback=>raf(function(time){const draws=m.draws,start=performance.now();try{return callback(time);}finally{if(m.draws!==draws){m.frames++;if(m.active){if(m.last)m.intervals.push(time-m.last);m.last=time;m.cpu.push(performance.now()-start);}}}});});
  const cdp=await p.context().newCDPSession(p);await cdp.send('Performance.enable');
  for(let load=0;load<2;load++){
   const start=Date.now();if(load)await p.reload();else await p.goto(target.url+'/?workshopDebug');
   await p.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence.active&&__engineerScene.renderer.getState().ready);await p.waitForTimeout(600);
   if(process.env.WORKSHOP_PERF_FIXED_QUALITY==='1')await p.evaluate(()=>{window.__workshopQuality='balanced';window.__workshopAutoScale=1;});
   report.loads.push({run,width,height,target:target.name,repeat:!!load,wallReadyMs:Date.now()-start,...await p.evaluate(()=>({navigation:performance.getEntriesByType('navigation')[0].toJSON(),resourceCount:performance.getEntriesByType('resource').length,transferBytes:performance.getEntriesByType('resource').reduce((s,r)=>s+r.transferSize,0),encodedBodyBytes:performance.getEntriesByType('resource').reduce((s,r)=>s+r.encodedBodySize,0),largest:performance.getEntriesByType('resource').map(r=>({url:new URL(r.name).pathname,bytes:r.encodedBodySize})).sort((a,b)=>b.bytes-a.bytes).slice(0,5)}))});
  }
  report.renderer=await p.evaluate(()=>{const g=stage.getContext('webgl2');return g.getParameter(g.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL)});
  for(const destination of ['overview','about','production','lab','skills','experience','communications']){await p.evaluate(id=>WorkshopNavigation.navigate(id,{instant:true}),destination);await p.waitForTimeout(1200);const before=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));const result=await sample(p,destination);const after=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));report.runs.push({run,width,height,target:target.name,...result,mainThread:Object.fromEntries(['ScriptDuration','LayoutDuration','RecalcStyleDuration','TaskDuration'].map(k=>[k+'Ms',(after[k]-before[k])*1000]))});save();}
  if(process.env.WORKSHOP_PERF_PROJECTS==='1')for(const id of ['habitseed','click-claim','prajaa']){
   const start=Date.now(),before=await p.evaluate(()=>performance.getEntriesByType('resource').length);
   await p.evaluate(id=>ProjectStudy.open(id,{resume:false}),id);
   await p.waitForFunction(id=>ProjectStudy.active&&ProjectStudy.frame().project.id===id&&ProjectStudy.frame().ready,id);
   await p.waitForFunction(()=>{const phones=__projectStudyRender().phones?.models;return phones?.length&&phones.every(m=>m.loaded&&!m.error);});
   await p.waitForTimeout(800);
   report.projectLoads.push({run,width,height,target:target.name,id,readyMs:Date.now()-start,...await p.evaluate(before=>{const resources=performance.getEntriesByType('resource').slice(before);return {transferBytes:resources.reduce((n,r)=>n+r.transferSize,0),encodedBodyBytes:resources.reduce((n,r)=>n+r.encodedBodySize,0),resources:resources.map(r=>({path:new URL(r.name).pathname,bytes:r.encodedBodySize})),phones:__projectStudyRender().phones};},before)});save();
  }
  await p.close();console.log('Measured',run,width,target.name);save();
 }
 assert.equal(report.errors.length,0);assert.ok(report.runs.every(r=>r.glError===0&&r.frames>0));
 }finally{report.completed=new Date().toISOString();save();await b.close();}
})().catch(e=>{report.failure=e.stack;save();console.error(e);process.exitCode=1});
