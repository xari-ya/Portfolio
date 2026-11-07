const {launch}=require('../browser.cjs'),assert=require('node:assert/strict'),fs=require('node:fs');
const report={runs:[],errors:[]};
(async()=>{
 const browser=await launch();
 try{
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport,isMobile:viewport.width<760,hasTouch:viewport.width<760});
   page.on('pageerror',error=>report.errors.push(error.message));
   await page.goto('http://127.0.0.1:4173/');
   await page.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence.active);
   const requested=process.env.WORKSHOP_TIMING_PROJECTS?.split(',');
   const ids=await page.evaluate(()=>WorkshopProjectRegistry.list().map(p=>p.id));
   for(const id of ids.filter(id=>!requested||requested.includes(id))){
    await page.evaluate(id=>{WorkshopNavigation.navigate('production',{instant:true});ProductionDiscovery.setPreview(id);},id);
    await page.waitForFunction(()=>ProductionDiscovery.getState().active&&!ProductionDiscovery.getState().transitioning);
    await page.evaluate(()=>{window.__deliveryTestStart=performance.now();ProductionDiscovery.select();});
    await page.waitForFunction(id=>ProjectStudy.active&&ProjectStudy.frame().project.id===id&&ProjectStudy.frame().ready&&ProjectStudy.frame().intro===1,id,{timeout:14000});
    const result=await page.evaluate(()=>({id:ProjectStudy.frame().project.id,width:innerWidth,elapsed:performance.now()-__deliveryTestStart,error:ProjectStudy.frame().error}));
    report.runs.push(result);console.log(`${result.width}px ${id}: ${(result.elapsed/1000).toFixed(2)}s`);
    assert.equal(result.error,null);assert.ok(result.elapsed<(viewport.width<760?12000:10000),`${id} took ${result.elapsed}ms`);
   }
   await page.close();
  }
  assert.deepEqual(report.errors,[]);
 }finally{fs.writeFileSync('verification/production/delivery-timing-report.json',JSON.stringify(report,null,2)+'\n');await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
