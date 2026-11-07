/* Verify the entrance rollback and the actual hologram/sensor lifecycle. */
const {launch}=require('../browser.cjs'),assert=require('node:assert/strict'),fs=require('node:fs');
const dir='verification/glass',report={checks:[],errors:[],entrance:{}};
const check=(name,value)=>{assert.ok(value,name);report.checks.push(name);console.log('PASS',name);};
const skin=el=>{const s=getComputedStyle(el);return {background:s.background,border:s.border,borderRadius:s.borderRadius,shadow:s.boxShadow,filter:s.backdropFilter,color:s.color};};
(async()=>{const browser=await launch();try{
 for(const [name,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const page=await browser.newPage({viewport,isMobile:name==='mobile',hasTouch:name==='mobile'});
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');
  await page.waitForFunction(()=>window.__kiraSequence?.stage>=1&&!__kiraSequence.entering);
  const entrance=await page.evaluate(skin=>{
   const read=Function('return ('+skin+')')(),selectors=['.kira-loader-progress','.kira-loader-bottom','.kira-loader-mark','.topbar'];
   const current=selectors.map(s=>read(document.querySelector(s))),sheet=[...document.styleSheets].find(s=>s.href?.includes('workshop-glass.css'));
   sheet.disabled=true;const original=selectors.map(s=>read(document.querySelector(s)));sheet.disabled=false;
   return {matches:JSON.stringify(current)===JSON.stringify(original),status:current[0],footer:current[1],entryRadius:getComputedStyle(document.querySelector('#kiraSkip')).borderRadius};
  },skin.toString());report.entrance[name]=entrance;
  check(name+': loading status is unboxed, entry button is gently rounded and entrance styling stays coherent',entrance.matches&&entrance.status.border==='0px none rgb(242, 237, 227)'&&entrance.status.filter==='none'&&entrance.status.shadow==='none'&&entrance.entryRadius==='6px'&&entrance.footer.filter==='none');
  await page.screenshot({path:dir+'/entrance-'+name+'.png'});
  await page.waitForFunction(()=>window.__portfolioReady&&!__kiraSequence.active);
  await page.waitForTimeout(900);
  check(name+': homepage label and actions have no separate backdrop',await page.evaluate(()=>['.home .eyebrow','.home .intro-actions'].every(selector=>{const s=getComputedStyle(document.querySelector(selector));return s.backgroundColor==='rgba(0, 0, 0, 0)'&&s.backgroundImage==='none'&&s.borderWidth==='0px'&&s.boxShadow==='none'&&s.backdropFilter==='none';})));
  check(name+': portfolio label matches the engineer name colour',await page.evaluate(()=>getComputedStyle(document.querySelector('.home .eyebrow')).color===getComputedStyle(document.querySelector('.home-statement strong')).color));
  check(name+': one feathered shade covers label, headline and actions',await page.locator('.home-intro').evaluate(el=>{const s=getComputedStyle(el,'::before');return s.backgroundImage.includes('radial-gradient')&&parseFloat(s.top)<=-65&&parseFloat(s.bottom)<=-65&&s.pointerEvents==='none';}));
  check(name+': homepage primary action keeps bright orange and opens About Me',await page.locator('.home .button-solid').evaluate(el=>el.getAttribute('href')==='#about'&&getComputedStyle(el).backgroundColor==='rgba(250, 65, 32, 0.97)'));
  check(name+': header retains its full-width straight edge',await page.locator('.topbar').evaluate(el=>{const r=el.getBoundingClientRect();return getComputedStyle(el).borderRadius==='0px'&&r.left===0&&r.width===innerWidth;}));
  await page.screenshot({path:dir+'/home-'+name+'.png'});
  if(name==='desktop'){
   check('Sensor post starts fully opaque on the homepage',await page.evaluate(()=>__productionScene.getState().architecture.sensorPostOpacity===1));
   await page.evaluate(()=>WorkshopNavigation.navigate('production',{instant:true}));
   await page.waitForFunction(()=>ProductionDiscovery.getState().active&&!ProductionDiscovery.getState().transitioning);
   await page.waitForTimeout(1000);
   check('Sensor post becomes translucent while the projected catalogue is visible',await page.evaluate(()=>{const s=__productionScene.getState();return s.architecture.sensorPostOpacity<.20&&s.carrier.catalogue.transparentPreview&&s.carrier.catalogue.opacity>.85&&s.carrier.catalogue.imageOpacity<.8;}));
   await page.screenshot({path:dir+'/translucent-holograms.png'});
   await page.locator('#productionSelect').click();await page.waitForFunction(()=>__productionScene.controller.job?.id==='obsidian');
   await page.waitForTimeout(1000);
   check('Sensor post returns fully opaque when the holograms close for delivery',await page.evaluate(()=>__productionScene.getState().architecture.sensorPostOpacity===1));
   await page.waitForFunction(()=>__productionScene.controller.snapshot().project.stage==='detected',null,{timeout:15000});
   check('The restored sensor still detects the actual carrier position',await page.evaluate(()=>{const s=__productionScene.getState();return s.detected&&s.architecture.sensorPostOpacity===1;}));
   await page.screenshot({path:dir+'/opaque-sensor-delivery.png'});
   await page.evaluate(()=>WorkshopNavigation.navigate('overview',{instant:true}));await page.waitForTimeout(1000);
   check('Leaving discovery leaves no residual sensor transparency',await page.evaluate(()=>__productionScene.getState().architecture.sensorPostOpacity===1));
  }else{
   await page.setViewportSize({width:320,height:740});await page.waitForTimeout(400);
   check('Home actions and text fit a narrow phone',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('.home .intro-actions a')].every(el=>el.getBoundingClientRect().right<=innerWidth)));
  }
  await page.close();
 }
 check('No runtime JavaScript errors',report.errors.length===0);
}catch(e){report.failure=e.stack;throw e;}finally{fs.writeFileSync(dir+'/entrance-report.json',JSON.stringify(report,null,2)+'\n');await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
