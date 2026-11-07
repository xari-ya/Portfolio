const {launch}=require('../browser.cjs'),assert=require('node:assert/strict'),fs=require('node:fs');
const report={views:[],errors:[]};
(async()=>{
 const browser=await launch();
 try{
  for(const viewport of [{width:390,height:844},{width:320,height:740},{width:740,height:390}]){
   const page=await browser.newPage({viewport,isMobile:true,hasTouch:true});
   page.on('pageerror',error=>report.errors.push(error.message));
   await page.goto('http://127.0.0.1:4173/?workshopDebug');
   await page.addStyleTag({content:'#hallFocusTools{display:none!important}'});
   await page.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence.active);
   await page.evaluate(()=>WorkshopNavigation.navigate('production',{instant:true}));
   await page.waitForFunction(()=>ProductionDiscovery.getState().active&&!ProductionDiscovery.getState().transitioning);
   await page.evaluate(()=>{
    window.__followTrace=[];window.__followStart=performance.now();
    function sample(){
     const s=__workshopDev.state(),camera=s.cameraPose;
     if(s.job&&!ProjectStudy.active)__followTrace.push({phase:s.phase,box:s.component,camera,carrier:s.job.carrierId});
     if(!ProjectStudy.active)requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);ProductionDiscovery.select();
   });
   if(viewport.width===390||viewport.width===740)for(const phase of ['arrival','shuttle','transport','inspection']){
    await page.waitForFunction(phase=>__productionScene.controller.phase===phase,phase);
    if(phase==='arrival')await page.waitForTimeout(500);
    await page.screenshot({path:`verification/production/mobile-follow-${phase}${viewport.width===740?'-landscape':''}.png`});
   }
   await page.waitForFunction(()=>ProjectStudy.active&&ProjectStudy.frame().intro===1,null,{timeout:12000});
   const result=await page.evaluate(()=>({elapsed:performance.now()-__followStart,trace:__followTrace}));
   const trace=result.trace.filter(s=>s.camera?.followCarrierId);
   assert.ok(trace.length>50);
   assert.ok(result.elapsed>10000&&result.elapsed<12000);
   assert.ok(trace.every(s=>s.camera.followCarrierId===s.carrier));
   assert.ok(trace.every(s=>s.camera.viewport.top===0&&s.camera.viewport.height===viewport.height));
   const distances=trace.map(s=>Math.hypot(...s.camera.eye.map((n,i)=>n-s.camera.target[i])));
   assert.ok(Math.min(...distances)>4.7&&Math.max(...distances)>6.7,'Wider camera distance from conveyor through inspection');
   const errors=trace.map(s=>Math.hypot(...s.box.map((n,i)=>n-s.camera.target[i])));
   assert.ok(Math.max(...errors)<1,`Tracking drift ${Math.max(...errors)}`);
   for(const phase of ['arrival','shuttle','pickup','transport','inspection'])assert.ok(trace.some(s=>s.phase===phase),phase);
   await page.evaluate(()=>ProjectStudy.close());
   await page.waitForFunction(()=>ProductionDiscovery.getState().active&&!ProductionDiscovery.getState().transitioning);
   assert.equal(await page.evaluate(()=>__workshopDev.state().cameraPose.followCarrierId),null);
   report.views.push({viewport,elapsed:result.elapsed,maxDrift:Math.max(...errors),samples:trace.filter((_,i)=>i%15===0)});
   console.log(`PASS ${viewport.width}x${viewport.height}: box tracked through inspection, ${(result.elapsed/1000).toFixed(2)}s, clean return to discovery`);
   await page.close();
  }
  assert.deepEqual(report.errors,[]);
 }finally{fs.writeFileSync('verification/production/mobile-delivery-follow-report.json',JSON.stringify(report,null,2)+'\n');await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
