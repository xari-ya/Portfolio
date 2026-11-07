const {launch}=require('../browser.cjs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await launch();
 try{
  for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:568}]){
   const mobile=viewport.width<760,page=await browser.newPage({viewport,isMobile:mobile,hasTouch:mobile}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4173/?workshopDebug');
   await page.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence.active);
   assert.deepEqual(await page.locator('.topnav a').evaluateAll(els=>els.map(e=>e.hash)),['#about','#work','#skills','#contact']);
   assert.equal(await page.locator('.brand-sub em,.intro-actions .button-outline,#studySkipIntro').count(),0);
   assert.equal(await page.locator('.intro-actions a').count(),1);
   const entrance=await page.locator('.intro-actions a').boundingBox();
   assert.ok(entrance.width>=220&&entrance.width<=250&&entrance.height>=48,'Compact home entrance keeps an accessible tap target');
   if(!mobile){
    const widths=await page.locator('.intro-actions').evaluate(e=>[e.clientWidth,e.querySelector('a').offsetWidth]);
    assert.ok(widths[1]>=220&&widths[1]<=250,'Home entrance stays compact');
    await page.screenshot({path:'verification/engineer/home-single-entrance.png'});
   }
   await page.evaluate(()=>WorkshopNavigation.navigate('about',{instant:true}));
   await page.waitForFunction(()=>EngineerAbout.getState().active&&document.querySelector('#engineerAbout').classList.contains('is-ready'));
   for(const tab of ['education','interests','direction','intro','education']){
    const target=page.locator(`[data-engineer-tab="${tab}"]`);
    await target.click();
    assert.equal(await target.getAttribute('aria-selected'),'true');
    const hovered=await target.evaluate(e=>getComputedStyle(e).backgroundImage);
    await page.mouse.move(1,1);
    assert.equal(await target.evaluate(e=>getComputedStyle(e).backgroundImage),hovered,'Selected tab retains orange after hovering/clicking');
    assert.ok(hovered.includes('255, 223, 183'));
   }
   const logos=await page.locator('#engineerEducation img').evaluateAll(els=>els.map(e=>({loaded:e.complete&&e.naturalWidth>0,width:e.width,height:e.height,fit:getComputedStyle(e).objectFit,src:e.src})));
   assert.equal(logos.length,3);
   for(const logo of logos){assert.ok(logo.loaded);assert.equal(logo.width,logo.height);assert.equal(logo.fit,'contain');assert.ok(logo.src.endsWith('.png'));}
   assert.equal(new Set(logos.map(l=>l.width)).size,1);
   const reading=page.locator('.engineer-reading');
   if(!mobile)assert.ok(await reading.evaluate(e=>e.scrollHeight<=e.clientHeight+2),'All education rows fit the wall display');
   await page.screenshot({path:`verification/engineer/education-updated-${viewport.width}.png`});
   if(mobile){
    await reading.evaluate(e=>e.scrollTop=e.scrollHeight);
    const school=await page.locator('#engineerEducation .engineer-academic').last().boundingBox(),bounds=await reading.boundingBox();
    assert.ok(school.y+school.height<=bounds.y+bounds.height+2,'School remains reachable by scrolling');
   }
   await page.evaluate(()=>WorkshopNavigation.navigate('production',{instant:true}));
   await page.waitForFunction(()=>ProductionDiscovery.getState().active&&!ProductionDiscovery.getState().transitioning);
   const assembly=page.locator('.production-navigation [data-production-nav="assembly"]');
   assert.equal(await assembly.evaluate(e=>getComputedStyle(e).color),'rgb(231, 136, 105)');
   assert.equal(await assembly.evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
   await page.screenshot({path:`verification/production/discovery-footer-${viewport.width}.png`});
   const lab=page.locator('.production-navigation [data-production-nav="lab"]');
   assert.equal(await lab.innerText(),'SKILLS LAB ↗');await lab.click();
   await page.waitForFunction(()=>WorkshopNavigation.getState().destination==='lab'&&EngineeringLab.getState().active);
   await page.waitForTimeout(1500);
   const back=page.locator(mobile?'.lab-phone-footer [data-phone-nav="production"]':'.lab-navigation [data-lab-nav="production"]');
   assert.equal((await back.innerText()).trim(),'← BACK TO PROJECTS');await back.click();
   await page.waitForFunction(()=>ProductionDiscovery.getState().active&&!ProductionDiscovery.getState().transitioning);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.deepEqual(errors,[]);
   console.log(`PASS ${viewport.width}px: education, stable tab accent, home/header and project/lab round trip`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
