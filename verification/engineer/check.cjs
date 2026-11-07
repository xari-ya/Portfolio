const {launch}=require('../browser.cjs');
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const base='http://127.0.0.1:4173',dir='verification/engineer';
const report={checks:[],errors:[],consoleErrors:[],screenshots:[],performance:{}};
const check=(name,pass=true)=>{assert.ok(pass,name);report.checks.push(name);console.log('PASS',name);};
const distance=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
async function shot(p,name){await p.screenshot({path:`${dir}/${name}.png`});report.screenshots.push(`${name}.png`);}
async function ready(p,url='/?workshopDebug'){
 p.on('pageerror',e=>report.errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
 await p.goto(base+url);await p.waitForFunction(()=>window.__portfolioReady,null,{timeout:60000});
 await p.evaluate(()=>{if(window.__kiraSequence?.active&&!window.__kiraSequence.entering)document.getElementById('kiraSkip')?.click();});await p.waitForFunction(()=>!window.__kiraSequence.active,null,{timeout:30000});
 if(await p.evaluate(()=>!!window.__engineerScene))await p.waitForFunction(()=>__engineerScene.renderer.getState().ready,null,{timeout:30000});
 await p.waitForTimeout(350);
}
async function destination(p,name){await p.evaluate(name=>WorkshopNavigation.navigate(name),name);await p.waitForTimeout(1600);}
async function project(p,point){return p.evaluate(point=>{
 const c=__workshopDev.state().cameraPose,r=document.querySelector('#stage').getBoundingClientRect(),norm=a=>{const l=Math.hypot(...a);return a.map(x=>x/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),f=norm(c.target.map((v,i)=>v-c.eye[i])),right=norm(cross(f,[0,1,0])),up=cross(right,f),v=point.map((x,i)=>x-c.eye[i]),z=dot(v,f),h=Math.tan(c.fov/2),vh=c.viewport?.height||r.height;
 return {x:r.left+r.width*(.5+dot(v,right)/(2*z*h*c.aspect)),y:r.top+(c.viewport?.top||0)+vh*(.5-dot(v,up)/(2*z*h))};
 },point);}
async function metrics(p,key){const start=await p.evaluate(()=>({frames:__workshopDev.state().metrics.frames,time:performance.now()}));await p.waitForTimeout(3500);report.performance[key]=await p.evaluate(start=>{const s=__workshopDev.state(),e=__engineerScene.renderer.getState();return {fps:1000*(s.metrics.frames-start.frames)/(performance.now()-start.time),drawCalls:s.metrics.drawCalls,cpuSubmitMs:s.metrics.frameMs,renderIntervalMs:s.metrics.intervalMs,characterTriangles:e.triangles,characterBytes:e.avatar.bytes,resources:e.resources};},start);}
async function sample(p,name,seconds){await p.evaluate(({name,seconds})=>{const a=__engineerScene.renderer.avatar;a.play(name,{priority:true});a.age=seconds;a.blendAge=1;a.nextIdle=1e9;}, {name,seconds});await p.waitForTimeout(80);}

(async()=>{const browser=await launch();try{
 const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
 await context.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;window.__surfaces=new Set();HTMLCanvasElement.prototype.getContext=function(type,...args){const value=original.call(this,type,...args);if(value&&/^webgl/.test(type))__surfaces.add(this.id);return value;};});
 const page=await context.newPage();await ready(page);
 check('Single existing WebGL surface',await page.evaluate(()=>[...__surfaces].join(',')==='stage'));
 check('Homepage headline preserved',await page.locator('.home h1').innerText().then(t=>/SYSTEMS/.test(t)&&/THEMSELVES/.test(t)));
 const assets=await page.evaluate(()=>__engineerScene.renderer.getState());
 check('Final supplied V4 laptop, optimized animated character',assets.ready&&assets.laptop.includes('final V4')&&assets.avatar.bones===44&&assets.avatar.clips.length===8);
 check('No greeting on initial arrival',!assets.avatar.greeted&&assets.avatar.clip==='ENGINEER_IDLE');
 const clearance=await page.evaluate(()=>__engineerScene.getClearances());report.clearances=clearance;
 check('Only two front left structural bays move',clearance.supports.some(p=>distance(p,[-13.2,0,-3.55])<1e-6)&&clearance.supports.some(p=>distance(p,[-13.2,0,2.05])<1e-6)&&clearance.supports.some(p=>distance(p,[-10.35,0,-8.5])<1e-6));
 check('Server-side rear wall and conveyor retain their datums',distance(clearance.rearWall,[0,4.05,-9.75])<1e-6&&distance(clearance.conveyor,[6.43,0,-1.27])<1e-6);
 check('Forward station remains separated from Kira route and robot workspace',clearance.platform[1][0]<-7.5&&clearance.kira[0]>1);
 await metrics(page,'desktopOverview');await shot(page,'01-overview');
 const hitPoint=await page.evaluate(()=>{const p=__engineerScene.renderer.getState().position;return [p[0],p[1]+.77,p[2]];});const hit=await project(page,hitPoint);await page.mouse.move(hit.x,hit.y);await page.waitForTimeout(80);
 check('Character has scene-based hover picking',await page.evaluate(()=>__workshopDev.state().hover==='about'));
 await page.mouse.click(hit.x,hit.y);await page.waitForTimeout(1400);
 check('Selecting the engineer enters shared About Me state',await page.evaluate(()=>WorkshopNavigation.getState().destination==='about'&&EngineerAbout.getState().active&&__workshopDev.state().camera==='guided'));
 check('First entry plays authored Blender greeting',await page.evaluate(()=>__engineerScene.renderer.avatar.getState().clip==='ENGINEER_GREETING'));
 await shot(page,'02-greeting');
 check('Primary introduction readable in semantic HTML',await page.locator('#engineerIntro').innerText().then(t=>t.includes('hardware, software, and the physical world')&&t.includes('designing, prototyping, programming, and testing')));
 for(const tab of ['education','interests','direction']){await page.click(`[data-engineer-tab="${tab}"]`);await page.waitForTimeout(100);check(`${tab} panel uses accessible tab selection`,await page.locator(`[data-engineer-tab="${tab}"]`).getAttribute('aria-selected')==='true');await shot(page,`03-${tab}`);}
 check('Both degree programmes marked undergraduate',await page.locator('#engineerEducation').innerText().then(t=>t.includes('Instrumentation and Automation')&&t.includes('External Degree')&&(t.match(/UNDERGRADUATE/g)||[]).length===2));
 check('No duplicated projects subsection',!await page.locator('#engineerAbout').innerText().then(t=>/SELECTED PROJECTS|THINGS I'M BUILDING/.test(t)));
 check('Existing résumé opens in new tab',await page.locator('.engineer-actions a').getAttribute('href')==='./Sarith_Dodangodage_CV.pdf'&&await page.locator('.engineer-actions a').getAttribute('target')==='_blank');
 const cvStatus=(await page.request.get(base+'/Sarith_Dodangodage_CV.pdf')).status();
 if(cvStatus===200)check('Existing résumé resource succeeds');else{report.missingResources=[{url:'Sarith_Dodangodage_CV.pdf',status:cvStatus,reason:'Pre-existing missing PDF; source links retained.'}];console.warn('EXISTING MISSING RESOURCE: résumé PDF / '+cvStatus);}
 await page.click('[data-engineer-tab="intro"]');await page.waitForTimeout(100);
 const scrollBefore=await page.evaluate(()=>scrollY),reading=page.locator('.engineer-reading');await reading.hover();await page.mouse.wheel(0,400);await page.waitForTimeout(200);
 check('Reading the interface does not advance the scene',Math.abs(await page.evaluate(()=>scrollY)-scrollBefore)<2&&await reading.evaluate(el=>el.scrollHeight<=el.clientHeight+2||el.scrollTop>0));
 // Every exported clip is evaluated through the real browser playback code.
 report.animation=await page.evaluate(()=>{const live=__engineerScene.renderer.avatar,a=new EngineerAvatar(live.asset),result={};for(const [name,clip] of a.clips){const frames=[];for(const time of [0,clip.duration*.25,clip.duration*.5,clip.duration*.75,clip.duration-1e-5]){a.clip=clip;a.loop=false;a.oneShot=false;a.age=time;a.previous=null;a.blendAge=1;a.nextIdle=1e9;a.update(0,true);const index=n=>a.json.nodes.findIndex(node=>node.name===n);frames.push({finite:a.skins.every(s=>Array.from(s.matrices).every(Number.isFinite)),head:Array.from(a.world[index('head')]),rightHand:Array.from(a.world[index('hand.R')]),feet:['foot.R','foot.L'].map(n=>Array.from(a.world[index(n)]))});}const baseline=frames[0].feet;result[name]={finite:frames.every(f=>f.finite),maxFootMatrixChange:Math.max(...frames.flatMap(f=>f.feet.flatMap((m,i)=>m.map((x,j)=>Math.abs(x-baseline[i][j]))))),headChanges:Math.max(...frames.map(f=>Math.hypot(...f.head.map((x,i)=>x-frames[0].head[i])))),handTravel:Math.max(...frames.map(f=>Math.hypot(f.rightHand[12]-frames[0].rightHand[12],f.rightHand[13]-frames[0].rightHand[13],f.rightHand[14]-frames[0].rightHand[14])))};}a.play('ENGINEER_GREETING',{priority:true});a.age=1.4;a.blendAge=1;a.update(0,true);const before=a.pose.map(p=>p.r.slice());a.play('ENGINEER_ACKNOWLEDGE',{priority:true});a.update(0,true);result.blendMaxJump=Math.max(...a.pose.flatMap((p,i)=>p.r.map((x,j)=>Math.abs(x-before[i][j]))));return result;});
 check('All eight clips produce finite skin matrices and stationary feet',Object.entries(report.animation).filter(([k])=>k!=='blendMaxJump').every(([,v])=>v.finite&&v.maxFootMatrixChange<1e-6));
 check('Head observation and articulated greeting move real joints',report.animation.ENGINEER_WORKSTATION_CHECK.headChanges>.2&&report.animation.ENGINEER_GREETING.handTravel>.01);
 check('Clip handoff preserves the current pose',report.animation.blendMaxJump<1e-6);
 for(const [name,time,file] of [['ENGINEER_IDLE',2,'04-idle'],['ENGINEER_WORKSTATION_CHECK',3.3,'05-laptop-check'],['ENGINEER_OBSERVE_FACTORY',3,'06-observation'],['ENGINEER_PRESENT',1.8,'07-presentation'],['ENGINEER_ACKNOWLEDGE',.7,'08-acknowledgement'],['ENGINEER_RELAXED_IDLE',2,'09-relaxed-idle'],['ENGINEER_EXIT',1,'10-exit']]){await sample(page,name,time);await shot(page,file);}
 await metrics(page,'desktopAbout');
 await destination(page,'overview');check('Back to overview restores homepage',await page.evaluate(()=>!EngineerAbout.getState().active&&WorkshopNavigation.getState().destination==='overview'));
 // Native forward page scrolling reaches About Me before production.
 await page.mouse.move(1300,700);await page.mouse.wheel(0,1150);await page.waitForTimeout(1600);
 check('First forward scroll destination is About Me',await page.evaluate(()=>WorkshopNavigation.getState().destination==='about'));
 check('Repeat entry uses short acknowledgement',await page.evaluate(()=>__engineerScene.renderer.avatar.getState().greeted&&__engineerScene.renderer.avatar.getState().clip!=='ENGINEER_GREETING'));
 await page.click('[data-engineer-nav="production"]');await page.waitForTimeout(1700);
 check('Explore My Work leads to existing conveyor destination',await page.evaluate(()=>WorkshopNavigation.getState().destination==='production'&&__workshopDev.state().camera==='guided'&&!EngineerAbout.getState().active));
 check('Current production discovery and existing project records remain',await page.evaluate(()=>ProductionDiscovery.getState().active)&&await page.locator('.project-choice').count()===9);
 await destination(page,'about');await page.keyboard.press('Escape');await page.waitForTimeout(1600);
 check('Escape returns to workshop without reload',await page.evaluate(()=>WorkshopNavigation.getState().destination==='overview'));
 await page.evaluate(()=>{WorkshopNavigation.navigate('about');WorkshopNavigation.navigate('production');WorkshopNavigation.navigate('about');WorkshopNavigation.navigate('overview');});await page.waitForTimeout(1700);
 check('Rapid retargeting leaves one coherent camera state',await page.evaluate(()=>WorkshopNavigation.getState().destination==='overview'&&__workshopDev.state().camera==='guided'&&!EngineerAbout.getState().active));
 await destination(page,'about');await page.click('[data-engineer-tab="intro"]');await page.locator('[data-engineer-tab="intro"]').focus();await page.keyboard.press('ArrowRight');
 check('Keyboard navigation switches accessible tabs',await page.locator('[data-engineer-tab="education"]').getAttribute('aria-selected')==='true');
 await destination(page,'overview');
 if(!process.env.ENGINEER_QUICK){
  await page.evaluate(()=>{__workshopDev.setTime(0);__workshopDev.run();});await destination(page,'about');
  const start=await page.evaluate(()=>__workshopDev.state().count);await page.waitForFunction(start=>__livingWorkshopState.cycle>start,start,{timeout:100000});
  check('Manufacturing completes a full live cycle during About Me',await page.evaluate(()=>EngineerAbout.getState().active));
 }
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await ready(mobile);await shot(mobile,'11a-mobile-overview');await mobile.locator('[data-hall="about"]').tap();await mobile.waitForTimeout(1800);
 check('Mobile tap entry reaches About Me',await mobile.evaluate(()=>EngineerAbout.getState().active));
 check('Mobile has a dedicated clear 3D viewport',await mobile.evaluate(()=>__workshopDev.state().cameraPose.viewport.height<innerHeight*.5));
 check('Mobile has no horizontal overflow',await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 check('Mobile continue and back actions remain visible',await mobile.locator('.engineer-primary').isVisible()&&await mobile.locator('.engineer-back').isVisible());
 const mobY=await mobile.evaluate(()=>scrollY);await mobile.locator('.engineer-reading').evaluate(el=>el.scrollTop=el.scrollHeight);await mobile.waitForTimeout(150);
 check('Mobile reading keeps scene progress fixed',Math.abs(await mobile.evaluate(()=>scrollY)-mobY)<2);
 await shot(mobile,'11-mobile');await metrics(mobile,'mobileAbout');
 await mobile.setViewportSize({width:320,height:740});await mobile.waitForTimeout(600);check('Narrow mobile layout fits horizontally',await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.querySelector('.engineer-tabs').scrollWidth<=document.querySelector('.engineer-tabs').clientWidth));await shot(mobile,'12-mobile-narrow');
 await mobile.setViewportSize({width:1000,height:700});await mobile.waitForTimeout(800);check('Resize produces a valid view and readable panel',await mobile.evaluate(()=>Number.isFinite(__workshopDev.state().cameraPose.aspect)&&document.querySelector('#engineerAbout').getBoundingClientRect().height>300));
 const reduced=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});await ready(reduced);await destination(reduced,'about');
 const one=await reduced.evaluate(()=>Array.from(__engineerScene.renderer.avatar.skins[0].matrices));await reduced.waitForTimeout(600);const two=await reduced.evaluate(()=>Array.from(__engineerScene.renderer.avatar.skins[0].matrices));check('Reduced motion holds the character still',distance(one,two)<1e-8);await shot(reduced,'13-reduced-motion');
 const fallback=await browser.newPage({viewport:{width:390,height:844}});await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl|experimental-webgl/.test(type)?null:original.call(this,type,...args);};});await ready(fallback);await destination(fallback,'about');
 check('WebGL failure preserves introduction and résumé',await fallback.locator('#engineerAbout').isVisible()&&await fallback.locator('#engineerIntro').isVisible()&&await fallback.locator('.engineer-actions a').isVisible());await shot(fallback,'14-webgl-fallback');
 const deep=await browser.newPage({viewport:{width:1280,height:800}});await ready(deep,'/?workshopDebug#about');check('An initial About Me hash still finishes loading at home',await deep.evaluate(()=>location.hash==='#home'&&WorkshopNavigation.getState().destination==='overview'&&!EngineerAbout.getState().active));
 await deep.evaluate(()=>{location.hash='about';});await deep.waitForTimeout(1700);check('Later About Me hash changes use shared navigation',await deep.evaluate(()=>WorkshopNavigation.getState().destination==='about'));
 const resources=await deep.evaluate(()=>__engineerScene.renderer.getState().resources);for(const name of ['overview','about','production','about'])await destination(deep,name);check('Repeated navigation does not grow GPU resources',JSON.stringify(resources)===JSON.stringify(await deep.evaluate(()=>__engineerScene.renderer.getState().resources)));
 await deep.evaluate(()=>document.querySelector('#stage').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await deep.waitForTimeout(500);check('Context loss keeps About Me accessible',await deep.locator('#engineerAbout').isVisible()&&await deep.locator('.engineer-actions a').isVisible());
 const hash=crypto.createHash('sha256').update(fs.readFileSync('character-assets/refined-character/the-builder-refined.blend')).digest('hex');check('Approved unrigged Blender source remains byte-identical',hash===JSON.parse(fs.readFileSync(`${dir}/baseline-hashes.json`))['character-assets/refined-character/the-builder-refined.blend']);
 check('No browser errors',report.errors.length===0&&report.consoleErrors.length===0);
}finally{fs.writeFileSync(`${dir}/report.json`,JSON.stringify(report,null,2));await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
