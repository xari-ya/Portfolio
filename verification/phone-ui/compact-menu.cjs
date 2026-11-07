const {launch}=require('../browser.cjs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await launch();
 try{
  for(const viewport of [{width:390,height:844},{width:320,height:568},{width:740,height:390}]){
   const page=await browser.newPage({viewport,isMobile:true,hasTouch:true,reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence.active);
   await page.locator('#menuButton').tap();await page.waitForTimeout(150);
   const size=await page.locator('#mobileNav').boundingBox();
   assert.ok(size.width<=264&&size.x>0&&size.x+size.width<=viewport.width&&size.y+size.height<viewport.height);
   assert.equal(await page.locator('#menuButton').getAttribute('aria-expanded'),'true');
   assert.equal(await page.locator('#mobileNav a[aria-current="location"]').getAttribute('href'),'#home');
   assert.ok(await page.locator('#mobileNav a').evaluateAll(a=>a.every(el=>el.getBoundingClientRect().height>=44)));
   assert.equal(await page.locator('#mobileNav').evaluate(el=>el.inert),false);
   assert.ok(await page.locator('#mobileNav').evaluate(el=>el.scrollHeight<=el.clientHeight+1),'Every menu item fits without clipping');
   await page.screenshot({path:`verification/phone-ui/compact-menu-${viewport.width}.png`});
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#mobileNav').evaluate(el=>el.inert),true);
   assert.equal(await page.evaluate(()=>document.activeElement.id),'menuButton');
   await page.locator('#menuButton').tap();await page.locator('#mobileNavBackdrop').tap({position:{x:10,y:viewport.height-100}});
   assert.equal(await page.locator('#menuButton').getAttribute('aria-expanded'),'false');
   await page.locator('#menuButton').tap();await page.locator('#mobileNav a[href="#work"]').tap();
   await page.waitForFunction(()=>ProductionDiscovery.getState().active);
   assert.equal(await page.locator('#menuButton').getAttribute('aria-expanded'),'false');
   await page.locator('#menuButton').tap();
   assert.equal(await page.locator('#mobileNav a[aria-current="location"]').getAttribute('href'),'#work');
   const links=await page.locator('#mobileNav a').all();await links.at(-1).focus();await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.activeElement.id),'menuButton');
   await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(150);
   assert.equal(await page.locator('#mobileNav').isVisible(),false);
   assert.equal(await page.locator('#mobileNavBackdrop').isVisible(),false);
   assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('mobile-menu-open')),false);
   assert.deepEqual(errors,[]);
   console.log(`PASS ${viewport.width}px: compact menu, current location, dismissal, focus and navigation`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
