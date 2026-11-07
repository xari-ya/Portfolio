const {launch}=require('../browser.cjs'),assert=require('node:assert/strict'),fs=require('node:fs');
const report={views:[],errors:[]};
(async()=>{
 const browser=await launch();
 try{
  for(const viewport of [{width:390,height:844},{width:320,height:568},{width:740,height:390},{width:1440,height:900}]){
   const mobile=viewport.width<800;
   const page=await browser.newPage({viewport,isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
   page.on('pageerror',error=>report.errors.push(error.message));
   await page.goto('http://127.0.0.1:4173/');
   await page.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence.active);
   await page.evaluate(()=>LabArchiveDisplay.ready);
   assert.deepEqual(await page.evaluate(()=>LabArchiveDisplay.getState().failures),[]);
   const stretched=await page.evaluate(()=>{
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=714;
    const c=canvas.getContext('2d'),draw=c.drawImage.bind(c),bad=[];
    c.drawImage=(im,...args)=>{if(im instanceof HTMLImageElement&&args.length===4){const ratio=args[2]/args[3],natural=im.naturalWidth/im.naturalHeight;if(Math.abs(ratio-natural)>.001)bad.push(im.src);}return draw(im,...args);};
    for(const journey of ['leadership','experience','achievements'])LabArchiveDisplay.paint(c,canvas,journey);
    return bad;
   });
   assert.deepEqual(stretched,[],'Canvas logos preserve their original aspect ratios');
   await page.evaluate(()=>WorkshopNavigation.navigate('lab',{instant:true}));
   await page.waitForTimeout(500);
   await page.screenshot({path:`verification/lab/reference-${viewport.width}-overview.png`});
   if(mobile){
    const frame=await page.locator('.lab-phone-instrument').boundingBox();
    assert.ok(frame.x>=0&&frame.x+frame.width<=viewport.width+1&&frame.y+frame.height<=viewport.height+1);
    if(viewport.width<viewport.height){assert.ok(Math.abs(frame.x)<1&&Math.abs(frame.width-viewport.width)<1&&Math.abs(frame.y+frame.height-viewport.height)<1,'Overview panel meets both sides and the bottom');}
    await page.locator('#labPhone [data-phone-nav="skills"]').click();
    await page.waitForFunction(()=>EngineeringLab.getState().mode==='skills');
    for(const id of ['embedded','robotics','software','design']){
     await page.locator(`[data-phone-category="${id}"]`).click();
     assert.equal(await page.evaluate(()=>EngineeringLab.getState().category),id);
    }
    await page.locator('#labPhone [data-phone-nav="experience"]').click();
   }else await page.evaluate(()=>WorkshopNavigation.navigate('experience',{instant:true}));
   await page.waitForFunction(()=>EngineeringLab.getState().mode==='experience');
   for(const journey of ['leadership','experience','achievements']){
    await page.evaluate(journey=>EngineeringLab.selectJourney(journey),journey);
    await page.waitForTimeout(150);
    if(mobile){
     const count=await page.evaluate(journey=>LabRefinement.records[journey].length,journey);
     for(let i=0;i<count;i++){
      await page.waitForFunction(()=>[...document.querySelectorAll('#labPhoneRecord img')].every(im=>im.complete&&im.naturalWidth>0));
      const expected=await page.evaluate(({journey,i})=>LabArchiveDisplay.sections[journey].symbols[i],{journey,i});
      if(['university','aiesec','mahara-youth','paffrel','rupavahini','welfare','hemas'].includes(expected))assert.equal(await page.locator('#labPhoneRecord .archive-organization').count(),1,expected);
      assert.ok(await page.locator('#labPhoneRecord .archive-logo').evaluateAll(images=>images.every(im=>{const s=getComputedStyle(im);return s.width==='64px'&&s.height==='64px'&&s.objectFit==='contain'&&s.backgroundColor==='rgba(0, 0, 0, 0)'&&new URL(im.src).pathname.endsWith('.png');})),'Uniform transparent PNG mobile logos');
      if(expected==='mahara-youth')await page.screenshot({path:`verification/lab/reference-${viewport.width}-mahara-youth.png`});
      if(i===0)await page.screenshot({path:`verification/lab/reference-${viewport.width}-${journey}.png`});
      await page.locator('[data-phone-record="1"]').click();
     }
    }else{
     await page.waitForFunction(()=>[...document.querySelectorAll('#labJourneyRecord img')].every(im=>im.complete&&im.naturalWidth>0));
     assert.ok(await page.locator('#labJourneyRecord .archive-logo').evaluateAll(images=>images.every(im=>{const s=getComputedStyle(im);return s.width==='64px'&&s.height==='64px'&&s.objectFit==='contain'&&s.backgroundColor==='rgba(0, 0, 0, 0)'&&new URL(im.src).pathname.endsWith('.png');})),'Uniform transparent PNG desktop logos');
     await page.screenshot({path:`verification/lab/reference-desktop-${journey}.png`});
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   }
   report.views.push({viewport,logos:await page.evaluate(()=>LabArchiveDisplay.getState().loaded)});
   console.log(`PASS ${viewport.width}x${viewport.height}: room, skills navigation, all archive records and logos`);
   await page.close();
  }
  assert.deepEqual(report.errors,[]);
 }finally{fs.writeFileSync('verification/lab/mobile-reference-logos-report.json',JSON.stringify(report,null,2)+'\n');await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
