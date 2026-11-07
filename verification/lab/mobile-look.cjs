const {launch}=require('../browser.cjs'),assert=require('node:assert/strict');
async function drag(page,cdp,from,to){
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:from[0],y:from[1]}]});
 for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from[0]+(to[0]-from[0])*i/12,y:from[1]+(to[1]-from[1])*i/12}]});await page.waitForTimeout(16);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(200);
}
(async()=>{
 const browser=await launch();
 try{
  for(const viewport of [{width:390,height:844},{width:320,height:568},{width:740,height:390}]){
   const page=await browser.newPage({viewport,isMobile:true,hasTouch:true,reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence.active);
   await page.evaluate(()=>WorkshopNavigation.navigate('lab',{instant:true}));await page.waitForTimeout(500);
   const initial=await page.evaluate(()=>({eye:__labScene.getState().camera.eye,target:__labScene.getState().camera.target,scroll:scrollY}));
   const cdp=await page.context().newCDPSession(page),area=await page.evaluate(()=>LabPhone.viewport()),right=area.width||viewport.width,y=area.top+area.height*.5;
   await drag(page,cdp,[20,y],[right-20,y]);
   assert.equal(await page.evaluate(()=>LabPhone.getLook().yaw),.4);
   assert.equal(await page.evaluate(()=>LabPhone.getLook().dragging),false);
   const moved=await page.evaluate(()=>({eye:__labScene.getState().camera.eye,target:__labScene.getState().camera.target,scroll:scrollY}));
   assert.deepEqual(moved.eye,initial.eye,'Look rotates from a fixed camera position');
   assert.equal(moved.scroll,initial.scroll,'Looking does not navigate the page');
   assert.ok(Math.hypot(...moved.target.map((n,i)=>n-initial.target[i]))>1);
   await page.screenshot({path:`verification/lab/look-${viewport.width}-left.png`});
   await drag(page,cdp,[right-20,y],[20,y]);
   await drag(page,cdp,[right-20,y],[20,y]);
   assert.equal(await page.evaluate(()=>LabPhone.getLook().yaw),-.4);
   await page.screenshot({path:`verification/lab/look-${viewport.width}-right.png`});
   await page.locator('[data-phone-look-reset]').click();
   assert.deepEqual(await page.evaluate(()=>LabPhone.getLook()),{yaw:0,pitch:0,dragging:false});
   await drag(page,cdp,[right*.5,area.top+10],[right*.5,area.top+area.height-10]);
   assert.equal(await page.evaluate(()=>LabPhone.getLook().pitch),-.12,'Vertical tilt is bounded too');
   await page.locator('#labPhone [data-phone-nav="skills"]').click();await page.waitForFunction(()=>EngineeringLab.getState().mode==='skills');
   await drag(page,cdp,[20,y],[right-20,y]);
   assert.equal(await page.evaluate(()=>LabPhone.getLook().yaw),.4);
   const reading=await page.locator('.lab-phone-skills .lab-phone-reading').boundingBox();
   if(reading.height>60){await drag(page,cdp,[reading.x+reading.width*.5,reading.y+reading.height-15],[reading.x+reading.width*.5,reading.y+15]);assert.equal(await page.evaluate(()=>LabPhone.getLook().yaw),.4,'Reading-panel scrolling leaves the room orientation alone');}
   await page.locator('[data-phone-category="robotics"]').click();
   assert.equal(await page.evaluate(()=>EngineeringLab.getState().category),'robotics');
   assert.equal(await page.evaluate(()=>LabPhone.getLook().yaw),.4);
   await page.locator('#labPhone [data-phone-nav="experience"]').click();await page.waitForFunction(()=>EngineeringLab.getState().mode==='experience');
   assert.equal(await page.evaluate(()=>LabPhone.getLook().yaw),0,'Changing workstation restores its authored view');
   assert.deepEqual(errors,[]);
   console.log(`PASS ${viewport.width}x${viewport.height}: bounded touch look, fixed eye, reset, panel controls and navigation`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
