const {launch}=require('../browser.cjs');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{const browser=await launch();const checks={errors:[],desktop:{},mobile:{},reduced:{}};
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 page.on('pageerror',e=>checks.errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/refined-character.html?debug');
 await page.waitForFunction(()=>window.__refinedReady,null,{timeout:40000});
 for(const view of ['front','righthand','lefthand','side','back','crest']){
  await page.click(`[data-view="${view}"]`);await page.waitForTimeout(1300);
  assert.equal(await page.getAttribute(`[data-view="${view}"]`,'aria-pressed'),'true');
  await page.screenshot({path:`verification/refined-character/final-${view}.png`});
 }
 checks.desktop=await page.evaluate(()=>refinedCharacter.getState());assert.ok(checks.desktop.bytes<6e6);
 await page.click('[data-model="source"]');await page.waitForFunction(()=>refinedCharacter.getState().variant==='source',null,{timeout:30000});
 await page.click('[data-model="refined"]');await page.waitForFunction(()=>refinedCharacter.getState().variant==='refined',null,{timeout:30000});
 await page.evaluate(()=>{const d=__refinedDebug;d.camera.view='hand';d.camera.yaw=.65;d.camera.pitch=.04;d.camera.dist=42;d.camera.at=[51,77,0];d.camera.target=[.65,.04,42,77,51,0];window.dispatchEvent(new Event('resize'));d.camera.target=[.65,.04,42,77,51,0];});
 await page.waitForTimeout(1500);await page.locator('canvas').screenshot({path:'verification/refined-character/final-hand-oblique.png'});
 await page.evaluate(()=>{const c=__refinedDebug.camera;c.target=[Math.PI,.03,42,77,51,0];});
 await page.waitForTimeout(1600);await page.screenshot({path:'verification/refined-character/final-hand-rear.png'});
 for(const a of await page.locator('.downloads a').all()){
  const url=new URL(await a.getAttribute('href'),page.url()).href;const response=await page.request.head(url);assert.equal(response.status(),200,url);
 }
 const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 mobile.on('pageerror',e=>checks.errors.push(e.message));await mobile.goto('http://127.0.0.1:4173/refined-character.html?debug');
 await mobile.waitForFunction(()=>window.__refinedReady,null,{timeout:40000});checks.mobile=await mobile.evaluate(()=>({...refinedCharacter.getState(),overflow:document.documentElement.scrollWidth>innerWidth}));
 assert.ok(checks.mobile.bytes<3.5e6);assert.equal(checks.mobile.overflow,false);
 await mobile.screenshot({path:'verification/refined-character/final-mobile.png',fullPage:true});
 await mobile.click('[data-view="lefthand"]');await mobile.waitForTimeout(1400);await mobile.screenshot({path:'verification/refined-character/final-mobile-hand.png'});
 const reduced=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});await reduced.goto('http://127.0.0.1:4173/refined-character.html');
 await reduced.waitForFunction(()=>window.__refinedReady,null,{timeout:40000});assert.equal(await reduced.locator('#turntable').isDisabled(),true);checks.reduced=await reduced.evaluate(()=>refinedCharacter.getState());
 assert.deepEqual(checks.errors,[]);fs.writeFileSync('verification/refined-character/final-browser-check.json',JSON.stringify(checks,null,2));console.log(JSON.stringify(checks));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
