const {launch}=require('../browser.cjs'),fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const dir='verification/production',report={checks:[],errors:[],consoleErrors:[],performance:{},requests:[]};
const check=(name,value)=>{assert.ok(value,name);report.checks.push(name);console.log('PASS',name);};
const base='http://127.0.0.1:4173';
async function ready(page,options={}){
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))report.consoleErrors.push(m.text());});page.on('request',r=>report.requests.push(r.url()));
 await page.goto(base+(options.debug?'/?workshopDebug':'/'));await page.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence.active);if(options.debug)await page.addStyleTag({content:'#hallFocusTools{display:none!important}'});await page.waitForTimeout(400);
}
async function shot(p,name){await p.screenshot({path:dir+'/'+name+'.png'});}
async function measure(p,key){const s=await p.evaluate(()=>({t:performance.now(),frames:__workshopDev.state().metrics.frames}));await p.waitForTimeout(3500);report.performance[key]=await p.evaluate(s=>({fps:(__workshopDev.state().metrics.frames-s.frames)*1000/(performance.now()-s.t),...__workshopDev.state().metrics,resources:__workshopDev.state().gpuResources}),s);}
function projection(camera,point,w,h){const norm=a=>{const d=Math.hypot(...a);return a.map(v=>v/d);},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),f=norm(camera.target.map((n,i)=>n-camera.eye[i])),r=norm(cross(f,[0,1,0])),u=cross(r,f),v=point.map((n,i)=>n-camera.eye[i]),z=dot(v,f),q=Math.tan(camera.fov/2);return {x:w*(.5+dot(v,r)/(2*z*q*camera.aspect)),y:camera.viewport.top+camera.viewport.height*(.5-dot(v,u)/(2*z*q))};}
(async()=>{const browser=await launch();try{
 const p=await browser.newPage({viewport:{width:1440,height:900}});await ready(p,{debug:true});
 check('Loading still lands on the overview',await p.evaluate(()=>WorkshopNavigation.getState().destination==='overview'&&!ProductionDiscovery.getState().active));
 await p.evaluate(()=>WorkshopNavigation.navigate('about',{instant:true}));await p.waitForTimeout(500);check('Completed About experience still opens',await p.evaluate(()=>EngineerAbout.getState().active));
 await p.evaluate(()=>{window.__productionCameraSamples=[];window.__productionCameraSampler=setInterval(()=>{const c=__workshopDev.state().cameraPose;if(c)__productionCameraSamples.push(c.eye);},40);});
 await p.locator('[data-engineer-nav="production"]').click();await p.waitForFunction(()=>ProductionDiscovery.getState().active);await p.waitForTimeout(1800);
 check('Camera approach avoids the workcell and structural columns',await p.evaluate(()=>{clearInterval(__productionCameraSampler);const columns=__engineerScene.getClearances().supports;return __productionCameraSamples.every(([x,y,z])=>!(x>-3.15&&x<2.2&&y>.2&&y<3.65&&z>-1.62&&z<1.65)&&!columns.some(c=>Math.abs(x-c[0])<.45&&Math.abs(z-c[2])<.45&&y<7.8));}));
 check('About Explore My Work enters shared production destination',await p.evaluate(()=>WorkshopNavigation.getState().destination==='production'&&!EngineerAbout.getState().active));
 check('All seven enabled project identities are browsable',await p.locator('[data-project-preview]').count()===7);
 check('Nothing is dispatched by the featured preview',await p.evaluate(()=>__productionScene.controller.carrierSerial===0&&ProductionDiscovery.getHandoff().featured));
 const camera=await p.evaluate(()=>__workshopDev.state().cameraPose);check('Discovery camera is parallel to conveyor travel',Math.abs(camera.eye[2]-camera.target[2])<.04&&camera.eye[0]>camera.target[0]+8);
 await shot(p,'discovery-desktop');
 const initial=await p.evaluate(()=>WorkshopNavigation.getState().progress);await p.locator('[data-project-preview="terravita"]').hover();await p.waitForTimeout(150);
 check('Hover changes preview without dispatching',await p.evaluate(()=>ProductionDiscovery.getState().previewId==='terravita'&&__productionScene.controller.carrierSerial===0));
 await p.locator('[data-project-step="1"]').click();check('Arrow button browses next project',await p.evaluate(()=>ProductionDiscovery.getState().previewId==='jellycast'));
 await p.locator('[data-project-preview="jellycast"]').focus();await p.keyboard.press('ArrowDown');check('Up/down keys browse projects for PC users',await p.evaluate(()=>ProductionDiscovery.getState().previewId==='click-claim'));
 await p.mouse.move(900,500);await p.mouse.wheel(0,100);await p.waitForTimeout(250);check('Mouse wheel over conveyor browses without moving journey',await p.evaluate(v=>ProductionDiscovery.getState().previewId==='analog-fsk'&&Math.abs(WorkshopNavigation.getState().progress-v)<.003,initial));
 check('Projected fixtures show a bounded window of the configurable registry',await p.evaluate(()=>__productionScene.getState().carrier.catalogue.ids.length<=6&&__productionScene.getState().carrier.catalogue.ids.length>=5));
 await measure(p,'desktop');
 check('Discovery reuses small captures without loading heavy project geometry',!report.requests.some(url=>/terravita-rev|terra.*geometry/i.test(url)));
 // Observe a real unskipped job, including the actual sensor and existing arm.
 await p.evaluate(()=>{__productionScene.controller.seek(0);__productionScene.controller.paused=false;ProductionDiscovery.setPreview('obsidian');});
 await p.locator('#productionSelect').click();await p.waitForFunction(()=>__productionScene.controller.job?.id==='obsidian');check('Selection feedback is immediate and returns to a whole-room shot',await p.evaluate(()=>ProductionDiscovery.getState().project.selectedId==='obsidian'&&WorkshopNavigation.getState().intent?.destination==='delivery'));
 await p.waitForTimeout(1300);check('The glowing skip action is immediately available',await p.locator('#productionSkip').isVisible());check('Homepage introduction is concealed during delivery',await p.locator('.home-intro').evaluate(el=>getComputedStyle(el).visibility==='hidden'));await shot(p,'delivery-overview');
 await p.waitForFunction(()=>__productionScene.controller.snapshot().project.stage==='detected',null,{timeout:15000});
 check('Real position-driven sensor identifies selected project',await p.evaluate(()=>{const s=__productionScene.getState();return s.detected&&s.component[2]+.215>=WorkshopSystem.datums.sensorZ&&s.job.id==='obsidian';}));await shot(p,'carrier-detected');
 await p.waitForFunction(()=>__productionScene.controller.snapshot().project.stage==='transfer');await p.waitForTimeout(1600);await shot(p,'carrier-shuttle');
 await p.waitForFunction(()=>WorkshopNavigation.getState().destination==='assembly',null,{timeout:15000});
 check('Delivery continues into the existing robotic station',await p.evaluate(()=>__projectHandoff.projectId==='obsidian'&&__productionScene.controller.presentationRequested));
 await p.waitForFunction(()=>__productionScene.controller.snapshot().owner==='gripper',null,{timeout:8000});await shot(p,'selected-carrier-pickup');
 check('Selected carrier remains attached to the existing gripper',await p.evaluate(()=>{const s=__productionScene.getState();return s.job.id==='obsidian'&&Math.hypot(...s.actualComponent.map((n,i)=>n-s.tool[i]))<1e-6;}));
 await p.waitForFunction(()=>__productionScene.controller.snapshot().inspection,null,{timeout:15000});await shot(p,'selected-carrier-inspection');
 await p.waitForFunction(()=>ProjectStudy.active,null,{timeout:10000});await shot(p,'assembly-complete');
 check('Existing inspection opens the selected study and starts supported output',await p.evaluate(()=>ProjectStudy.getState().project.id==='obsidian'&&__productionScene.controller.phase==='output'));
 check('Kira uses contextual production attention',await p.evaluate(()=>__workshopDev.state().productionAwareness.reactions>=3));
 // Persistence, idempotence, rapid changes and explicit skip.
 const serial=await p.evaluate(()=>__productionScene.controller.carrierSerial);await p.evaluate(()=>WorkshopNavigation.navigate('production',{instant:true}));await p.waitForTimeout(400);
 check('Returning preserves selected project without replay',await p.evaluate(n=>ProductionDiscovery.getState().project.selectedId==='obsidian'&&__productionScene.controller.carrierSerial===n,serial));
 check('Returning to discovery clears the physical carrier into standby',await p.evaluate(()=>__productionScene.controller.job===null&&__productionScene.controller.discoveryHold));
 await p.evaluate(()=>{ProductionDiscovery.select('terravita');ProductionDiscovery.select('jellycast');ProductionDiscovery.select('click-claim');ProductionDiscovery.select('click-claim');});
 await p.waitForFunction(()=>__productionScene.controller.job?.id==='click-claim');
 check('Rapid clicks dispatch only the latest request without waiting for the old job',await p.evaluate(()=>{const c=__productionScene.controller;return c.job.id==='click-claim'&&c.pendingProject===null&&c.carrierSerial===2;}));
 await p.locator('#productionSkip').click();await p.waitForFunction(()=>WorkshopNavigation.getState().destination==='study');await p.waitForTimeout(350);
 check('Skip resolves the actual latest job without duplicates',await p.evaluate(()=>{const s=__productionScene.getState();return s.job.id==='click-claim'&&ProjectStudy.getState().project.id==='click-claim'&&s.owner==='output'&&__productionScene.controller.carrierSerial===2;}));
 await shot(p,'skip-result');check('Skip curtain is removed after covered transition',await p.locator('.production-skip-curtain').evaluate(el=>el.hidden));
 const resources=await p.evaluate(()=>__workshopDev.state().gpuResources);for(let i=0;i<7;i++)await p.evaluate(i=>{ProductionDiscovery.setPreview(WorkshopProjectRegistry.list()[i].id);WorkshopNavigation.navigate(i%2?'production':'assembly',{instant:true});},i);
 check('Preview and camera changes allocate no new GL resources',await p.evaluate(before=>JSON.stringify(__workshopDev.state().gpuResources)===JSON.stringify(before),resources));
 await p.evaluate(()=>WorkshopNavigation.navigate('about',{instant:true}));await p.waitForTimeout(600);check('Reverse navigation returns to completed About without resetting selection',await p.evaluate(()=>EngineerAbout.getState().active&&ProductionDiscovery.getHandoff().projectId==='click-claim'));
 await p.evaluate(()=>WorkshopNavigation.navigate('overview',{instant:true}));await p.locator('.topnav a[href="#work"]').click();await p.waitForTimeout(1700);check('Existing Work navigation now reaches the conveyor catalogue',await p.evaluate(()=>ProductionDiscovery.getState().active));
 // A catalogue can be added through data alone, with a missing-asset fallback.
 await p.evaluate(()=>WorkshopProjectRegistry.register({id:'fixture-test',name:'Fixture test',description:'Registry fallback verification.',preview:'missing-project-preview.png'}));await p.waitForTimeout(150);await p.evaluate(()=>ProductionDiscovery.setPreview('fixture-test'));await p.waitForTimeout(300);
 check('Missing preview uses a fallback without breaking discovery',await p.locator('#productionImage').evaluate(img=>img.complete&&img.naturalWidth>0&&img.src.startsWith('data:image/svg+xml')));await p.evaluate(()=>WorkshopProjectRegistry.remove('fixture-test'));
 // Check rendered ray selection, not just HTML controls.
 await p.evaluate(()=>ProductionDiscovery.setPreview('obsidian'));await p.waitForTimeout(300);const pose=await p.evaluate(()=>__workshopDev.state().cameraPose);const point=projection(pose,[6.43,1.77,-.65],1440,900);await p.mouse.click(point.x,point.y);await p.waitForTimeout(250);check('A projected project can be selected directly on the belt',await p.evaluate(()=>ProductionDiscovery.getState().delivery));
 await p.close();

 const m=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await ready(m,{debug:true});await m.evaluate(()=>WorkshopNavigation.navigate('production',{instant:true}));await m.waitForTimeout(700);await shot(m,'discovery-mobile');
 check('Mobile has a dedicated top conveyor viewport',await m.evaluate(()=>Math.abs(__workshopDev.state().cameraPose.viewport.height-(innerHeight*.45-65))<1));
 check('Mobile selector remains an accessible HTML list',await m.locator('#productionProjects [role="listitem"]').count()===7);
 const start=await m.evaluate(()=>WorkshopNavigation.getState().progress);await m.locator('#projectDiscovery').evaluate(el=>el.scrollTop=250);await m.waitForTimeout(150);await shot(m,'mobile-reading');
 check('Mobile reading does not advance guided navigation',await m.evaluate(v=>Math.abs(WorkshopNavigation.getState().progress-v)<.002,start));
 await m.locator('#projectDiscovery').evaluate(el=>el.scrollTop=0);await m.locator('[data-project-step="1"]').tap();await m.locator('#productionSelect').tap();await m.waitForTimeout(800);check('Touch selection registers a job without Skip',await m.evaluate(()=>ProductionDiscovery.getState().project.explicit)&&!await m.locator('#productionSkip').isVisible());await m.waitForFunction(()=>ProjectStudy.active,null,{timeout:12000});await shot(m,'mobile-assembly');
 await m.setViewportSize({width:320,height:740});await m.evaluate(()=>WorkshopNavigation.navigate('production',{instant:true}));await m.waitForTimeout(400);check('320px layout has no horizontal overflow',await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await shot(m,'discovery-320');
 await m.setViewportSize({width:390,height:844});await m.waitForTimeout(300);await measure(m,'mobile');await m.close();

 const r=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});await ready(r);await r.evaluate(()=>WorkshopNavigation.navigate('production',{instant:true}));await r.waitForTimeout(350);await r.locator('#productionSelect').click();await r.waitForTimeout(350);check('Reduced motion resolves selection without a forced cinematic',await r.evaluate(()=>WorkshopNavigation.getState().destination==='study'&&ProjectStudy.getState().intro===1));await r.close();
 const f=await browser.newPage({viewport:{width:390,height:844}});await f.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl/.test(type)?null:original.call(this,type,...args);};});await ready(f);await f.evaluate(()=>WorkshopNavigation.navigate('production',{instant:true}));await f.waitForTimeout(350);check('WebGL failure retains project descriptions and selection',await f.locator('#productionName').isVisible());await f.locator('#productionSelect').click();await f.waitForTimeout(350);check('Fallback selection and navigation work without a rendering context',await f.evaluate(()=>ProductionDiscovery.getHandoff().explicit&&ProductionDiscovery.getState().fallback));await shot(f,'fallback');await f.close();
 const baseline=JSON.parse(fs.readFileSync(dir+'/baseline.json'));for(const [file,hash] of Object.entries(baseline.protected))check('Approved asset preserved: '+file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')===hash);
 check('No unhandled runtime errors',report.errors.length===0);check('No application console errors',report.consoleErrors.length===0);delete report.requests;
 fs.writeFileSync(dir+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.performance,null,2));
}catch(error){fs.writeFileSync(dir+'/report.json',JSON.stringify({...report,failure:error.stack},null,2)+'\n');throw error;}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
