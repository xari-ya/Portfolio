const {launch}=require('../browser.cjs'),assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process');
const report={checks:[],errors:[],chapters:[]};
const check=(label,ok)=>{assert.ok(ok,label);report.checks.push(label);console.log('PASS',label);};
(async()=>{const b=await launch();try{
 const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>report.errors.push(e.message));
 await p.goto('http://127.0.0.1:4173/?workshopDebug');await p.waitForFunction(()=>window.__portfolioReady&&!__kiraSequence.active);await p.addStyleTag({content:'#hallFocusTools{display:none!important}'});
 const before=cp.execFileSync('git',['show','restore/before-study-ui-refinement-2026-11-03:project-study.css'],{encoding:'utf8'}),css=fs.readFileSync('project-study.css','utf8');
 for(const name of ['study-toolbar','study-footer']){const re=new RegExp('\\.'+name+'\\{[^}]*\\}','g');check(name+' retains the approved bar styling',JSON.stringify(before.match(re))===JSON.stringify(css.match(re)));}
 await p.evaluate(()=>ProjectStudy.open('obsidian',{resume:false}));await p.waitForFunction(()=>ProjectStudy.getState().intro===1);
 const bar=await p.evaluate(()=>Object.fromEntries(['.topbar','.study-toolbar','.study-footer'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return [s,{x:r.x,y:r.y,w:r.width,h:r.height}];})));
 check('Header and study bars retain desktop placement',bar['.topbar'].h===78&&bar['.study-toolbar'].h===72&&bar['.study-footer'].h===76&&bar['.study-footer'].y===1004);
 check('Hover scrollbars and redundant left scroll prompts are hidden',await p.locator('.study-layout').evaluate(el=>getComputedStyle(el).scrollbarWidth==='none')&&await p.locator('.obs-maze-instruction').evaluate(el=>getComputedStyle(el).display==='none'));
 check('Manual reset and rotation buttons are removed',await p.locator('#studyReset,[data-study-rotate]').count()===0);
 check('Project switching occupies the lower-right model area',await p.evaluate(()=>{const n=document.querySelector('.study-project-nav').getBoundingClientRect(),m=document.querySelector('#studyModel').getBoundingClientRect();return Math.abs(m.right-n.right)<1&&m.bottom-n.bottom<20;}));
 check('Removed workshop footer action and absent gallery/view toggles stay absent',await p.locator('#projectStudy [data-study-nav="overview"],#projectStudy [data-view]').count()===0&&!/3D VIEW|GALLERY/.test(await p.locator('#projectStudy').innerText()));
 check('Desktop reading and model use the screen width',await p.evaluate(()=>{const c=document.querySelector('.study-copy').getBoundingClientRect(),m=document.querySelector('#studyModel').getBoundingClientRect();return c.width===620&&m.width>1000&&c.right<m.left&&parseFloat(getComputedStyle(document.querySelector('#studyTitle')).fontSize)>=70;}));
 const filled=selector=>p.locator(selector).evaluate(el=>{const c=getComputedStyle(el).backgroundColor.match(/[\d.]+/g)?.map(Number);return c&&c[0]>200&&c[1]>35&&c[1]<130&&c[2]<100&&(c.length<4||c[3]>.9);});
 async function tab(i){await p.locator('[data-study-chapter="'+i+'"]').click();await p.waitForFunction(i=>ProjectStudy.frame().chapter===i,i);await p.waitForFunction(()=>!ProjectStudy.frame().visual.transitioning);await p.waitForTimeout(70);}
 for(const id of ['obsidian','jellycast','terravita']){
  await p.evaluate(id=>ProjectStudy.open(id,{resume:false}),id);await p.waitForFunction(id=>ProjectStudy.getState().project.id===id&&ProjectStudy.getState().ready&&!ProjectStudy.frame().visual.transitioning,id);await p.evaluate(()=>ProjectStudy.skipIntro());
  for(let i=0;i<3;i++){
   await tab(i);let s=await p.evaluate(()=>({id:ProjectStudy.frame().project.id,chapter:ProjectStudy.frame().chapter,scene:ProjectStudy.frame().scene,p:ProjectStudy.frame().legacyProgress,weights:ProjectStudy.frame().chapterWeights,layers:window.__jellycastLayers}));report.chapters.push(s);
   check(id+' chapter '+(i+1)+' selects a finite scene and filled button',s.chapter===i&&s.weights[i]===1&&await filled('[data-study-chapter="'+i+'"]'));
   if(id==='jellycast')check('JellyCast chapter '+(i+1)+' has the correct actual rendered layers',Math.abs(s.layers.device-(i===1?0:1))<1e-9&&Math.abs(s.layers.map-(i===1?1:0))<1e-9);
   if(id==='obsidian')check('Obsidian miniature maze only accompanies the maze chapter',await p.locator('#obsMapHud').getAttribute('aria-hidden')===(i===1?'false':'true'));
   check(id+' chapter '+(i+1)+' shows its complete text without an internal scrollbar',await p.evaluate(()=>{const r=document.querySelector('#studyReading');return getComputedStyle(r).overflowY==='visible'&&[...r.querySelectorAll('.study-chapter')].filter(p=>!p.hidden).length===1&&r.scrollHeight<=r.clientHeight+1;}));
  }
  if(id==='obsidian'){
   await tab(1);const step=await p.locator('#obsStep').innerText();await p.locator('#studyModel').hover();await p.mouse.wheel(0,450);await p.waitForTimeout(150);check('Maze animation still progresses within its own chapter',await p.locator('#obsStep').innerText()!==step&&await p.evaluate(()=>ProjectStudy.frame().scene==='maze'));
   await p.locator('[data-obs-mode="replay"]').click();check('Selected maze mode is filled',(await p.waitForTimeout(250),await filled('[data-obs-mode="replay"]')));await tab(2);await p.locator('[data-obs-sub="2"]').click();check('Selected subsystem is filled',(await p.waitForTimeout(250),await filled('[data-obs-sub="2"]')));
   await tab(0);await p.screenshot({path:'verification/study/refined-desktop.png'});
  }
  if(id==='jellycast'){await tab(1);await p.locator('.jelly-step').nth(1).click();check('Selected coastline station is filled',(await p.waitForTimeout(250),await filled('.jelly-step.current')));await p.screenshot({path:'verification/study/refined-jellycast-blue.png'});}
  if(id==='terravita'){await tab(1);await p.locator('[data-sensor="2"]').click();check('Selected sensor is filled',(await p.waitForTimeout(250),await filled('[data-sensor="2"]')));await tab(0);await p.screenshot({path:'verification/study/refined-terravita-green.png'});}
 }
 check('JellyCast has a stronger blue background and TerraVita keeps its forest green',await p.evaluate(()=>{const j=WorkshopProjectRegistry.get('jellycast').theme,t=WorkshopProjectRegistry.get('terravita').theme;return j.rgb[2]>j.rgb[1]&&j.tintStrength===.42&&t.colour==='#1a4434';}));
 await p.evaluate(()=>ProjectStudy.open('obsidian',{resume:false}));await p.waitForTimeout(200);const serial=await p.evaluate(()=>__productionScene.controller.carrierSerial),camera=await p.evaluate(()=>WorkshopNavigation.getState().progress);
 await p.locator('#studyPreviousProject').click();await p.waitForFunction(()=>ProjectStudy.frame().project.id==='prajaa');check('Previous project wraps directly to the last project',await p.evaluate(()=>WorkshopNavigation.getState().destination==='study'));
 await p.locator('#studyNextProject').click();await p.waitForFunction(()=>ProjectStudy.frame().project.id==='obsidian');check('Next project wraps directly to the first project',await p.locator('#studyNextProject').getAttribute('aria-label').then(t=>t.includes('TerraVita')));
 await p.locator('#studyNextProject').focus();await p.keyboard.press('Enter');await p.waitForFunction(()=>ProjectStudy.frame().project.id==='terravita');check('Project switching is keyboard accessible',await p.locator('#studyTitle').textContent().then(t=>t==='TerraVita'));
 await p.evaluate(()=>{for(let i=0;i<9;i++)ProjectStudy.changeProject(1);});await p.waitForTimeout(300);check('Rapid project changes preserve the final selection without dispatching a carrier',await p.evaluate(a=>ProjectStudy.frame().project.id==='terravita'&&WorkshopNavigation.getState().destination==='study'&&Math.abs(WorkshopNavigation.getState().progress-a.camera)<.001&&__productionScene.controller.carrierSerial===a.serial,{serial,camera}));
 check('Background is native resolution with no blur pass and no CSS filter on the live canvas',await p.evaluate(()=>{const c=document.querySelector('#stage'),s=__projectStudyRender().backdrop;return s.width===c.width&&s.height===c.height&&s.textures===1&&s.blurPasses===0&&getComputedStyle(c).filter==='none';}));
 for(const size of [[1440,900],[1366,768]]){
  await p.setViewportSize({width:size[0],height:size[1]});await p.waitForTimeout(200);
  for(const id of ['obsidian','terravita','jellycast']){await p.evaluate(id=>ProjectStudy.open(id,{resume:false}),id);await p.waitForFunction(id=>ProjectStudy.frame().project.id===id&&!ProjectStudy.frame().visual.transitioning,id);for(let i=0;i<3;i++){
   await tab(i);const bounds=await p.evaluate(()=>{const l=document.querySelector('.study-layout'),r=document.querySelector('#studyReading .study-chapter:not([hidden])').getBoundingClientRect();return {bottom:r.bottom,limit:l.getBoundingClientRect().bottom,scroll:l.scrollHeight,height:l.clientHeight};});
   check(size[0]+'px '+id+' chapter '+(i+1)+' fits complete text at once',bounds.bottom<=bounds.limit+1);
  }}
 }
 await p.evaluate(()=>ProjectStudy.open('terravita',{resume:false}));await p.waitForFunction(()=>ProjectStudy.frame().project.id==='terravita'&&!ProjectStudy.frame().visual.transitioning);
 for(const width of [390,320]){
  await p.setViewportSize({width,height:width===390?844:740});await p.waitForTimeout(350);
  check(width+'px keeps both project controls inside the viewport',await p.evaluate(()=>[...document.querySelectorAll('.study-project-nav button')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.height>=44;})&&document.documentElement.scrollWidth<=innerWidth));
  check(width+'px retains mobile header/bars and readable text below the model',await p.evaluate(()=>{const r=document.querySelector('#projectStudy').getBoundingClientRect(),m=document.querySelector('#studyModel').getBoundingClientRect(),c=document.querySelector('.study-copy').getBoundingClientRect();return r.top===65&&document.querySelector('.study-toolbar').getBoundingClientRect().height===52&&document.querySelector('.study-footer').getBoundingClientRect().height===58&&m.bottom<=c.top+1&&c.height>200;}));
  await p.screenshot({path:'verification/study/refined-mobile-'+width+'.png'});
 }
 await p.evaluate(()=>ProjectStudy.selectChapter(2));await p.locator('#studyReading').focus();const currentChapter=await p.evaluate(()=>ProjectStudy.frame().chapter);await p.keyboard.press('End');await p.waitForTimeout(250);
 check('Keyboard reading reaches long mobile content without changing the chapter or camera',await p.evaluate(c=>{const l=document.querySelector('.study-layout');return l.scrollTop>50&&ProjectStudy.frame().chapter===c&&Math.abs(WorkshopNavigation.getState().progress-.47)<.001;},currentChapter));
 await p.locator('.study-close').click();await p.waitForFunction(()=>ProductionDiscovery.getState().active);check('Closing restores discovery and normal page scrolling',await p.evaluate(()=>!ProjectStudy.active&&document.body.style.overflow===''));
 check('No application errors during chapter and project switching',!report.errors.length);
}catch(e){report.failure=e.stack;throw e;}finally{fs.writeFileSync('verification/study/refinement-report.json',JSON.stringify(report,null,2)+'\n');await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
