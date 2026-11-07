const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const dir='verification/phone-ui',report={checks:[],errors:[],views:{}};
const check=(name,value)=>{assert.ok(value,name);report.checks.push(name);console.log('PASS',name);};
async function frames(p,n=2){const at=await p.evaluate(()=>__workshopDev.state().metrics.frames);await p.waitForFunction(({at,n})=>__workshopDev.state().metrics.frames>=at+n,{at,n},{timeout:60000});}
async function go(p,d='communications'){await p.evaluate(d=>WorkshopNavigation.navigate(d,{instant:true}),d);await p.waitForFunction(d=>Math.abs(WorkshopNavigation.getState().progress-WorkshopNavigation.destinations[d])<.002,d,{timeout:60000});await frames(p);if(d==='communications')await p.waitForFunction(()=>window.__communicationsScene?.getState().progress>=.98&&!communicationsPanel.hidden,null,{timeout:20000});}
async function swipe(p,a,b){const c=await p.context().newCDPSession(p);await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a[0],y:a[1],id:1}]});for(let i=1;i<=8;i++){await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a[0]+(b[0]-a[0])*i/8,y:a[1]+(b[1]-a[1])*i/8,id:1}]});await p.waitForTimeout(30);}await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await c.detach();await frames(p);}
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('Failed to load resource'))report.errors.push(m.text());});
 await p.goto('http://localhost:4174/?workshopDebug');await p.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence?.active,null,{timeout:90000});await go(p);await p.waitForFunction(()=>window.__communicationsScene?.getState().cars?.every(c=>c.ready),null,{timeout:90000});await frames(p);
 for(const [w,h]of [[390,844],[430,932],[320,568],[360,640],[760,900]]){
  await p.setViewportSize({width:w,height:h});await p.waitForFunction(h=>innerHeight===h,h);await frames(p,3);await go(p);
  const view=await p.evaluate(()=>({layout:communicationsPanel.dataset.layout,phone:CommunicationsPhone.getState(),camera:__workshopDev.state().cameraPose,overflow:document.documentElement.scrollWidth>innerWidth+1,docked:CommunicationsRoom.behaviour.docked,scrollable:communicationsPanel.scrollHeight>communicationsPanel.clientHeight,controls:[...document.querySelectorAll('.comms-actions a'),...document.querySelectorAll('.comms-navigation button')].map(a=>({text:a.textContent,href:a.getAttribute('href'),rect:a.getBoundingClientRect().toJSON()}))}));
  report.views[w+'x'+h]=view;
  check(w+' phone board replaces detached reading panel',view.layout==='phone'&&!view.overflow);
  check(w+' all content fits without board scrolling',!view.scrollable);
  check(w+' contacts fit inside physical board',view.controls.every(c=>c.rect.width>0&&c.rect.x>=0&&c.rect.right<=w+1)&&(view.scrollable||view.controls.every(c=>c.rect.y>=65&&c.rect.bottom<h)));
  for(const a of await p.locator('.comms-actions a').all()){await a.scrollIntoViewIfNeeded();check(w+' contact has a 44px touch target',(await a.boundingBox()).height>=43.5);}await p.locator('[data-comms-back]').scrollIntoViewIfNeeded();
  check(w+' navigation is equal size above communications actions',Math.abs(view.controls[4].rect.width-view.controls[5].rect.width)<1&&view.controls[4].rect.bottom<view.controls[0].rect.y);
  check(w+' KIRA stays docked in the phone placement',view.docked);
  await p.screenshot({path:dir+'/office-'+w+'.png'});
 }
 if(process.argv.includes('--visual-only'))return;
 await p.setViewportSize({width:390,height:844});await frames(p,3);
 const urls=await p.locator('.comms-actions a').evaluateAll(a=>a.map(a=>a.href));
 check('Original native destinations retained',urls[0]==='mailto:sarithdodangodage@outlook.com'&&urls[1].includes('linkedin.com/in/sarith-dodangodage-889113216')&&urls[2]==='https://github.com/xari-ya'&&urls[3].endsWith('/Sarith_Dodangodage_CV.pdf'));
 for(let i=0;i<4;i++){
  const link=p.locator('[data-comms-action="'+i+'"]');await link.focus();await frames(p);
  check('Keyboard contact reaction '+i,await p.evaluate(i=>CommunicationsRoom.behaviour.selected===i,i));
  await p.evaluate(()=>window.__phoneNativeClicks=[]);
  await link.evaluate(a=>a.addEventListener('click',e=>{window.__phoneNativeClicks.push({href:a.href,prevented:e.defaultPrevented});e.preventDefault();},{once:true}));
  await link.tap();check('Touch action '+i+' is native and immediate',await p.evaluate(()=>__phoneNativeClicks.length===1&&!__phoneNativeClicks[0].prevented));
 }
 await p.locator('[data-comms-action="3"]').blur();await p.evaluate(()=>CommunicationsRoom.behaviour.contact('focus',-1));
 const eye=await p.evaluate(()=>__workshopDev.state().cameraPose.eye);
 await swipe(p,[350,710],[160,710]);
 check('Phone room view stays locked during native swipes',await p.evaluate(eye=>CommunicationsCamera.yaw===0&&!CommunicationsCamera.enabled&&__workshopDev.state().cameraPose.eye.every((v,i)=>Math.abs(v-eye[i])<.01),eye));
 await p.screenshot({path:dir+'/office-look-left.png'});
 await swipe(p,[160,710],[350,710]);await p.evaluate(()=>CommunicationsCamera.reset());await frames(p);
 check('Swipe releases pointer capture',await p.evaluate(()=>!CommunicationsCamera.drag));
 await p.locator('[data-comms-back]').tap();await frames(p,3);check('Skills navigation uses existing destination',await p.evaluate(()=>Math.abs(WorkshopNavigation.getState().progress-WorkshopNavigation.destinations.lab)<.002));await go(p);
 await p.locator('[data-comms-home]').tap();await frames(p,3);check('Start over returns to workshop',await p.evaluate(()=>Math.abs(WorkshopNavigation.getState().progress-WorkshopNavigation.destinations.overview)<.002));await go(p);
 const resources=await p.evaluate(()=>__communicationsScene.getState().resources);
 for(let i=0;i<3;i++){await p.setViewportSize({width:844,height:390});await frames(p,2);await p.setViewportSize({width:390,height:844});await frames(p,2);await go(p,'skills');await go(p);}
 assert.deepEqual(await p.evaluate(()=>__communicationsScene.getState().resources),resources);check('Repeated orientation and navigation reuse GPU resources',true);
 await p.setViewportSize({width:761,height:900});await frames(p,3);await go(p);check('761px restores existing reading layout',await p.evaluate(()=>!CommunicationsPhone.active&&CommunicationsPhone.amount===0&&communicationsPanel.dataset.layout==='reading'));
 await p.setViewportSize({width:390,height:844});await frames(p,3);
 await p.evaluate(()=>{CommunicationsRoom.behaviour.lastActivity=CommunicationsRoom.behaviour.time-91;});await frames(p,3);check('Phone resting uses actual dock state',await p.evaluate(()=>CommunicationsRoom.behaviour.state==='RESTING'&&CommunicationsRoom.behaviour.docked));await p.locator('[data-comms-action="2"]').focus();await frames(p);check('Contact focus wakes KIRA',await p.evaluate(()=>CommunicationsRoom.behaviour.state==='ACTIVE'));
 await p.evaluate(()=>{document.documentElement.style.setProperty('--comms-safe-top','44px');document.documentElement.style.setProperty('--comms-safe-bottom','34px');dispatchEvent(new Event('resize'));});await frames(p,3);check('Notch and home-indicator safe areas are respected',await p.evaluate(()=>__workshopDev.state().cameraPose.viewport.top===109&&__workshopDev.state().cameraPose.viewport.height===701&&communicationsPanel.scrollHeight<=communicationsPanel.clientHeight+1));
 check('No browser errors',report.errors.length===0);
}finally{fs.writeFileSync(dir+'/office-report.json',JSON.stringify(report,null,2));await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
