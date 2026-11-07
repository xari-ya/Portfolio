/* Public-route appearance/navigation checks, alongside the debug regression
 * suites which continue to exercise the original machinery controls. */
const {launch}=require('../browser.cjs'),fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const dir='verification/homepage',report={checks:[],errors:[],consoleErrors:[],performance:{}};
const check=(name,value)=>{assert.ok(value,name);report.checks.push(name);console.log('PASS',name);};
const base='http://127.0.0.1:4173';
async function shot(p,name){await p.screenshot({path:dir+'/'+name+'.png'});}
async function ready(p,url='/'){
 p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
 await p.goto(base+url);await p.waitForFunction(()=>window.__portfolioReady);await p.waitForFunction(()=>!__kiraSequence.active,null,{timeout:20000});await p.waitForFunction(()=>__engineerScene.renderer.getState().ready);await p.waitForTimeout(800);
}
async function measure(p,key){const before=await p.evaluate(()=>({frames:__workshopDev.state().metrics.frames,t:performance.now()}));await p.waitForTimeout(4000);report.performance[key]=await p.evaluate(s=>({fps:(__workshopDev.state().metrics.frames-s.frames)*1000/(performance.now()-s.t),...__workshopDev.state().metrics}),before);}
(async()=>{const browser=await launch();try{
 const p=await browser.newPage({viewport:{width:1920,height:1080}});
 await p.addInitScript(()=>{
  window.__loadingStages=[];window.__surfaces=new Set();const original=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...args){const g=original.call(this,type,...args);if(g&&/^webgl/.test(type))__surfaces.add(this.id);return g;};
  const timer=setInterval(()=>{const s=window.__kiraSequence;if(!s)return;if(__loadingStages.at(-1)!==s.stage)__loadingStages.push(s.stage);if(!s.active)clearInterval(timer);},15);
 });
 p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
 await p.goto(base+'/#about',{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>window.__portfolioReady);
 await p.waitForFunction(()=>__kiraSequence.stage>=2);
 if(await p.evaluate(()=>!__kiraSequence.entering))await shot(p,'loading-desktop');
 await p.waitForFunction(()=>__kiraSequence.entering);await p.waitForTimeout(1700);await shot(p,'loading-doorway');
 await p.waitForFunction(()=>!__kiraSequence.active);await p.waitForFunction(()=>__engineerScene.renderer.getState().ready);await p.waitForTimeout(1200);
 check('Original five-stage loading sequence completes',await p.evaluate(()=>[0,1,2,3,4].every(n=>__loadingStages.includes(n))));
 check('Loading finishes on home even with an initial About hash',await p.evaluate(()=>location.hash==='#home'&&WorkshopNavigation.getState().destination==='overview'&&!EngineerAbout.getState().active));
 check('Loader and homepage share one WebGL surface',await p.evaluate(()=>[...__surfaces].join(',')==='stage'));
 check('Normal homepage has no workshop control toolbar',await p.locator('#hallFocusTools').count()===0);
 check('Desktop introduction occupies the lower-left floor without scrolling the canvas',await p.locator('.home-intro').evaluate(el=>{const r=el.getBoundingClientRect(),stage=document.querySelector('#stage').getBoundingClientRect();return r.left<innerWidth*.1&&r.right<innerWidth*.5&&r.top>innerHeight*.55&&Math.abs(stage.top)<1&&Math.abs(stage.bottom-innerHeight)<1;}));
 check('Headline and original résumé URL are preserved',await p.locator('#home h1').innerText().then(t=>/SYSTEMS/.test(t)&&/THEMSELVES/.test(t))&&await p.locator('#home .button-outline').getAttribute('href')==='./Sarith_Dodangodage_CV.pdf');
 const cvStatus=(await p.request.get(base+'/Sarith_Dodangodage_CV.pdf')).status();if(cvStatus!==200)report.missingResources=[{url:'Sarith_Dodangodage_CV.pdf',status:cvStatus,reason:'Pre-existing missing PDF, absent from restore point.'}];
 await shot(p,'overview-1920');
 await p.locator('.topnav a[href="#about"]').click();await p.waitForTimeout(2000);
 check('Existing header opens About Me without the toolbar',await p.evaluate(()=>EngineerAbout.getState().active));
 check('Reference icon tabs and SYSTEMS accent are present',await p.locator('.engineer-tab-icon').count()===4&&await p.locator('#engineerAbout h2 strong').innerText()==='SYSTEMS.');
 check('About Me keeps a flat readable screen layer',await p.evaluate(()=>new DOMMatrixReadOnly(getComputedStyle(document.querySelector('#engineerAbout')).transform).is2D));
 await p.locator('[data-engineer-tab="education"]').click();check('Screen tabs remain interactive',await p.locator('#engineerEducation').isVisible());
 await p.locator('[data-engineer-tab="intro"]').click();await shot(p,'about-desktop');
 await p.evaluate(()=>__engineerScene.selectStation('intelligence'));await p.waitForTimeout(1800);
 check('Inspection entered from About Me closes the biography surface',await p.evaluate(()=>!EngineerAbout.getState().active)&&await p.locator('.hall-station-info').isVisible());
 await p.locator('#hallReturn').click();await p.waitForTimeout(1800);
 check('Inspection return from About Me restores the overview state',await p.evaluate(()=>WorkshopNavigation.getState().destination==='overview'&&!EngineerAbout.getState().active));
 await p.evaluate(()=>__engineerScene.selectStation('assembly'));await p.waitForTimeout(1700);await p.locator('#hallReturn').click();
 check('Public inspection return focuses existing home navigation',await p.evaluate(()=>document.activeElement.classList.contains('brand')));
 await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(800);await shot(p,'overview-1440');
 const baseline=JSON.parse(fs.readFileSync(dir+'/baseline.json'));
 for(const [file,hash] of Object.entries(baseline.protected))check('Protected file preserved: '+file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')===hash);
 const old=cp.execFileSync('git',['show','restore/before-homepage-redesign-2026-11-02:workshop-hall.js'],{encoding:'utf8'}),current=fs.readFileSync('workshop-hall.js','utf8');
 for(const [label,start,end] of [
  ['Kira geometry','function buildApprovedKira(){','const kira=buildApprovedKira();'],
  ['robotic arm geometry','// Robot pedestal','// Workpiece modules'],
  ['conveyor geometry','// Central conveyor lane','// V21 — One physically traceable']]){
  const block=(s)=>s.slice(s.indexOf(start),s.indexOf(end,s.indexOf(start)));
  check('Protected procedural model preserved: '+label,block(old)===block(current));
 }
 const m=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await m.goto(base,{waitUntil:'domcontentloaded'});await m.waitForFunction(()=>window.__portfolioReady);await m.waitForFunction(()=>__kiraSequence.stage>=2);if(await m.evaluate(()=>!__kiraSequence.entering))await shot(m,'loading-mobile');await m.waitForFunction(()=>!__kiraSequence.active);await m.waitForTimeout(700);await shot(m,'overview-mobile');
 check('Public mobile toolbar is absent',await m.locator('#hallFocusTools').count()===0);
 check('Mobile statement fits without clipping',await m.locator('.home-statement').evaluate(el=>el.getBoundingClientRect().right<=innerWidth&&el.scrollWidth<=el.clientWidth+1));
 await m.locator('#menuButton').tap();await m.locator('#mobileNav a[href="#about"]').tap();await m.waitForTimeout(1800);
 check('Mobile menu still reaches the engineer',await m.evaluate(()=>EngineerAbout.getState().active));
 await shot(m,'about-mobile');
 await m.setViewportSize({width:320,height:740});await m.waitForTimeout(700);check('Narrow mobile content fits horizontally',await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await m.close();await p.close();
 const debug=await browser.newPage({viewport:{width:1440,height:900}});await ready(debug,'/?workshopDebug');
 check('Development controls remain in the explicit debug view',await debug.locator('#hallFocusTools').isVisible());
 await measure(debug,'desktop');report.dressing=await debug.evaluate(()=>__workshopDev.state().appearance);
 check('Desktop uses the selective workcell shadow pass',report.dressing.shadows.enabled&&report.dressing.shadows.drawCalls>0&&report.dressing.shadows.drawCalls<20);
 check('Static dressing stays within its triangle budget',report.dressing.triangles<20000);
 await debug.evaluate(()=>{__workshopDev.setTime(26.8);__engineerScene.selectStation('intelligence');});await debug.waitForTimeout(2000);
 report.jointMatrices=await debug.evaluate(()=>{const s=__workshopDev.state(),m=s.monitor.matrices,mul=(a,b)=>{const o=Array(16).fill(0);for(let col=0;col<4;col++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[col*4+r]+=a[k*4+r]*b[col*4+k];return o;};let combined=[1,0,0,0,0,1,0,0,0,0,1,0,-2.1,0,-.25,1];for(const j of m)combined=mul(combined,j.matrix);const tool=[combined[12]-combined[4]*.6,combined[13]-combined[5]*.6,combined[14]-combined[6]*.6],angles=m.map((j,i)=>i===0||i===4?Math.atan2(j.matrix[8],j.matrix[0]):Math.atan2(j.matrix[1],j.matrix[0]));return {joints:m,toolError:Math.hypot(...tool.map((n,i)=>n-s.tool[i])),angleError:Math.max(...angles.map((n,i)=>Math.abs(Math.atan2(Math.sin(n-m[i].angle),Math.cos(n-m[i].angle)))))};});
 check('Five displayed joint matrices reconstruct the actual tool transform',report.jointMatrices.joints.length===5&&report.jointMatrices.toolError<1e-5&&report.jointMatrices.angleError<1e-6);
 await shot(debug,'control-joints');await debug.locator('.hall-joint-details summary').click();await debug.waitForFunction(()=>document.querySelector('#hallJointMatrices').textContent.includes('TOOL ROLL'));
 check('All joint matrices have accessible text readouts',await debug.locator('#hallJointMatrices pre').count()===5&&await debug.locator('#hallJointMatrices').innerText().then(t=>t.includes('SHOULDER')&&t.includes('TOOL ROLL')));await shot(debug,'control-matrices');
 check('Laptop shows a distinct noninteractive electronics workspace',await debug.evaluate(()=>{const s=__engineerScene.renderer.getState().laptopScreen;return s.static&&!s.interactive&&s.title==='Sensor interface PCB study'&&s.subject==='embedded electronics';}));
 await debug.locator('#hallQuality').selectOption('low');await debug.waitForTimeout(300);check('Low quality disables the shadow pass',await debug.evaluate(()=>!__workshopDev.state().appearance.shadows.enabled));await debug.close();
 const md=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await ready(md,'/?workshopDebug');await measure(md,'mobile');check('Mobile avoids the dynamic shadow pass',await md.evaluate(()=>!__workshopDev.state().appearance.shadows.enabled));
 check('Draw-call increase stays within 20 percent',report.performance.desktop.drawCalls<=baseline.metrics.drawCalls*1.2);
 check('No application browser errors',report.errors.length===0&&report.consoleErrors.length===0);
}finally{fs.writeFileSync(dir+'/report.json',JSON.stringify(report,null,2));await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
