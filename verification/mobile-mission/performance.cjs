const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
const {ready,nav,base,snapshot}=require('./capture.cjs');
const output='verification/mobile-mission/performance.json';
async function sample(p){return p.evaluate(()=>new Promise(resolve=>{
 const frames=[],cpu=[],tasks=[];let previous=performance.now(),old=__workshopDev.state().metrics.frames;
 const observer=new PerformanceObserver(list=>tasks.push(...list.getEntries().map(e=>e.duration)));observer.observe({type:'longtask',buffered:false});
 const start=performance.now();function step(t){const s=__workshopDev.state();if(s.metrics.frames!==old){frames.push(t-previous);cpu.push(s.metrics.frameMs);previous=t;old=s.metrics.frames;}if(performance.now()-start<4500)return requestAnimationFrame(step);
 observer.disconnect();frames.shift();frames.sort((a,b)=>a-b);cpu.sort((a,b)=>a-b);const quantile=(a,q)=>a[Math.min(a.length-1,Math.floor(a.length*q))]??null;
 resolve({samples:frames.length,meanFrameMs:frames.reduce((s,v)=>s+v,0)/frames.length,medianMs:quantile(frames,.5),p95Ms:quantile(frames,.95),cpuSubmissionMedianMs:quantile(cpu,.5),longTasks:tasks.length,longTaskTotalMs:tasks.reduce((s,v)=>s+v,0),drawCalls:s.metrics.drawCalls,resources:s.gpuResources,canvas:[stage.width,stage.height],renderer:stage.getContext('webgl2').getParameter(stage.getContext('webgl2').RENDERER)});
 }requestAnimationFrame(step);
 }));}
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=d3d11']});const report={environment:'Chrome Windows D3D11 desktop GPU; 390x844 touch emulation, DPR1, normal motion; balanced raster, auto scaling off. Paired warmed 4.5s samples, alternating baseline/current. Not physical smartphone measurements.',runs:[],errors:[]};try{
 for(let run=0;run<3;run++)for(const baseline of run%2?[false,true]:[true,false]){const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p.on('pageerror',e=>report.errors.push(e.message));if(baseline)await p.route('**/*',r=>{const f=new URL(r.request().url()).pathname.slice(1)||'index.html',local=path.join(snapshot,f);return fs.existsSync(local)&&fs.statSync(local).isFile()?r.fulfill({body:fs.readFileSync(local),contentType:f.endsWith('.html')?'text/html':f.endsWith('.css')?'text/css':'application/javascript'}):r.continue()});await ready(p);await p.evaluate(()=>__workshopDev.run());
  for(const destination of ['overview','about','production','skills','experience','communications']){await nav(p,destination);await p.waitForTimeout(1200);report.runs.push({run,baseline,destination,...await sample(p)});console.log('measured',run,baseline,destination);}
  await p.close();fs.writeFileSync(output,JSON.stringify(report,null,2));
 }
 }finally{fs.writeFileSync(output,JSON.stringify(report,null,2));await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
