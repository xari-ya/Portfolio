const {launch}=require('../browser.cjs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await launch();
 try{
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   const mobile=viewport.width<760,page=await browser.newPage({viewport,isMobile:mobile,hasTouch:mobile}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:4173/?workshopDebug');
   await page.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence.active);
   assert.equal(await page.evaluate(()=>WorkshopProjectRegistry.list().length),7);
   assert.equal(await page.evaluate(()=>WorkshopProjectRegistry.get('sentinel')),null);
   assert.equal(await page.locator('[data-project="3"]').count(),0);
   assert.equal(await page.evaluate(()=>ProjectStudy.open('sentinel')),false);
   await page.evaluate(()=>{document.querySelector('[data-project="2"]').click();document.querySelector('#dossierNext').click();});
   assert.equal(await page.locator('#dossierTitle').textContent(),'CLICK CLAIM','Legacy navigation skips the reserved Sentinel index');
   await page.evaluate(()=>WorkshopNavigation.navigate('production',{instant:true}));
   await page.waitForFunction(()=>ProductionDiscovery.getState().active&&!ProductionDiscovery.getState().transitioning);
   const accent=await page.evaluate(()=>({assembly:getComputedStyle(document.querySelector('.production-navigation [data-production-nav="assembly"]')).color,about:getComputedStyle(document.documentElement).getPropertyValue('--workshop-footer-accent').trim()}));
   assert.equal(accent.assembly,'rgb(231, 136, 105)');
   assert.equal(accent.about,'#e78869');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.screenshot({path:`verification/production/final-polish-${viewport.width}-discovery.png`});
   assert.equal(await page.locator('.production-arm-actions [data-production-nav]').count(),0);
   await page.evaluate(()=>{
    window.__polishFlashes=[];window.__polishStart=performance.now();
    function sample(){
     const job=__productionScene.controller.job,cover=document.querySelector('.production-skip-curtain');
     if(job&&cover.hidden&&!ProjectStudy.active){
      const home=getComputedStyle(document.querySelector('.frame.home')),tools=getComputedStyle(document.querySelector('#hallFocusTools'));
      if(home.visibility==='visible'&&+home.opacity>.01)__polishFlashes.push('home');
      if(tools.display!=='none'&&tools.visibility==='visible')__polishFlashes.push('menu');
      if(innerWidth<760)for(const id of ['productionSkip','productionAssemblySkip','studySkipIntro']){const control=document.getElementById(id);if(control&&getComputedStyle(control).display!=='none')__polishFlashes.push(id);}
     }
     if(!ProjectStudy.active)requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);ProductionDiscovery.select('obsidian');
   });
   await page.waitForFunction(()=>__productionScene.controller.phase==='pickup',null,{timeout:9000});
   await page.screenshot({path:`verification/production/final-polish-${viewport.width}-arm.png`});
   await page.waitForFunction(()=>ProjectStudy.active&&ProjectStudy.frame().intro===1,null,{timeout:12000});
   assert.deepEqual(await page.evaluate(()=>__polishFlashes),[],'No home/menu flash during the complete delivery');
   const elapsed=await page.evaluate(()=>performance.now()-__polishStart);
   assert.ok(elapsed<(mobile?12000:10000));
   await page.evaluate(()=>WorkshopNavigation.navigate('overview',{instant:true}));
   await page.waitForTimeout(400);
   assert.equal(await page.evaluate(()=>document.body.classList.contains('project-delivery-active')),false);
   assert.equal(await page.locator('.frame.home').evaluate(el=>getComputedStyle(el).visibility),'visible');
   if(!mobile){
    await page.evaluate(()=>{WorkshopNavigation.navigate('experience',{instant:true});EngineeringLab.selectJourney('leadership');});
    await page.waitForTimeout(400);
    assert.equal(await page.locator('.archive-summary img').count(),0);
    assert.equal(await page.locator('.archive-summary-symbol .archive-symbol').count(),1);
    assert.ok(await page.locator('.archive-records img[alt="University of Colombo logo"]').count()>0);
    await page.screenshot({path:'verification/production/final-polish-archive-icon.png'});
   }
   assert.deepEqual(errors,[]);
   console.log(`PASS ${viewport.width}px: orange Assembly, deferred Sentinel, clean delivery, correct controls (${(elapsed/1000).toFixed(2)}s)`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
