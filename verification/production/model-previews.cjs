const {launch}=require('../browser.cjs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await launch();
 try{
  for(const viewport of [{width:1440,height:900},{width:1366,height:768},{width:390,height:844}]){
   const page=await browser.newPage({viewport,reducedMotion:'reduce',hasTouch:viewport.width<760});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:4173/');
   await page.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence.active);
   await page.evaluate(()=>WorkshopNavigation.navigate('production',{instant:true}));
   await page.waitForFunction(()=>ProductionDiscovery.getState().active);
   assert.equal(await page.locator('.production-job').count(),0);
   assert.ok(!(await page.locator('#projectDiscovery').innerText()).includes('LINE STANDBY'));
   for(const id of await page.evaluate(()=>WorkshopProjectRegistry.list().map(p=>p.id))){
    await page.evaluate(id=>ProductionDiscovery.setPreview(id),id);
    await page.waitForFunction(()=>{const im=document.querySelector('#productionImage');return im.complete&&im.naturalWidth>0;});
    await page.waitForTimeout(150);
    const state=await page.evaluate(()=>{
     const image=document.querySelector('#productionImage'),frame=image.parentElement,r=frame.getBoundingClientRect();
     return {src:image.getAttribute('src'),ratio:r.width/r.height,visible:getComputedStyle(frame).display!=='none',fit:getComputedStyle(image).objectFit,blend:getComputedStyle(image).mixBlendMode,background:getComputedStyle(frame).backgroundImage,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    assert.equal(state.src,`assets/projects/${id}-model.jpg`);
    assert.equal(state.overflow,false);
    if(state.visible){assert.ok(state.ratio>=1.5&&state.ratio<3.5);assert.equal(state.fit,'contain');assert.equal(state.blend,'lighten');assert.ok(state.background.includes('radial-gradient'),JSON.stringify({id,...state}));}
    await page.waitForTimeout(100);
   }
   await page.evaluate(()=>ProductionDiscovery.setPreview('terravita'));
   await page.waitForTimeout(500);
   await page.screenshot({path:`verification/production/model-previews-${viewport.width}.png`});
   assert.deepEqual(errors,[]);
   console.log(`PASS ${viewport.width}px: all enabled model previews load, correct framing, no horizontal overflow or runtime errors`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
