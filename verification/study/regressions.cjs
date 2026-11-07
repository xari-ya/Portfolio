const {launch}=require('../browser.cjs'),assert=require('node:assert/strict'),fs=require('node:fs');
const report={checks:[],errors:[],entryTransitions:[],layouts:[]},check=(name,ok)=>{assert.ok(ok,name);report.checks.push(name);console.log('PASS',name);};
async function settled(p,id){await p.waitForFunction(id=>ProjectStudy.active&&ProjectStudy.frame().project.id===id&&ProjectStudy.frame().ready&&ProjectStudy.frame().intro===1&&!ProjectStudy.frame().visual.transitioning,id);}
async function open(p,id,{skip=false}={}){await p.evaluate(id=>ProjectStudy.open(id,{resume:false}),id);await p.waitForFunction(id=>ProjectStudy.frame().project.id===id&&ProjectStudy.frame().ready,id);if(skip){await p.evaluate(()=>ProjectStudy.skipIntro());await settled(p,id);}}
async function startTrace(p){await p.evaluate(()=>{window.__regressionTrace={active:true,frames:[]};function sample(){const f=ProjectStudy.frame();__regressionTrace.frames.push({id:f.project.id,intro:f.intro,chapter:f.chapter,visualChapter:f.visual.chapter,p:f.visual.legacyProgress,opacity:f.visual.opacity,weights:f.visual.weights.slice(),layers:window.__jellycastLayers?{...__jellycastLayers}:null});if(__regressionTrace.active)requestAnimationFrame(sample);}requestAnimationFrame(sample);});}
(async()=>{const b=await launch();try{
 const p=await b.newPage({viewport:{width:1600,height:1400}});p.on('pageerror',e=>report.errors.push(e.message));await p.goto('http://127.0.0.1:4173/?workshopDebug');await p.waitForFunction(()=>window.__portfolioReady&&!__kiraSequence.active);await p.addStyleTag({content:'#hallFocusTools{display:none!important}'});
 for(const id of ['obsidian','terravita','jellycast']){
  await open(p,id);await p.waitForFunction(()=>ProjectStudy.frame().intro>.01&&ProjectStudy.frame().intro<.6);await startTrace(p);
  for(const chapter of [1,2,0]){
   const value=await p.evaluate(c=>{const before=ProjectStudy.frame();document.querySelector('[data-study-chapter="'+c+'"]').click();const after=ProjectStudy.frame();return {id:after.project.id,chapter:c,before:before.intro,after:after.intro,visualBefore:before.visual,visualAfter:after.visual};},chapter);report.entryTransitions.push(value);
   check(id+' chapter '+(chapter+1)+' preserves the in-flight assembly pose',value.before<1&&value.after===value.before&&value.visualAfter.opacity===value.visualBefore.opacity&&value.visualAfter.legacyProgress===value.visualBefore.legacyProgress);
   await p.waitForTimeout(65);
  }
  await settled(p,id);const frames=await p.evaluate(()=>{__regressionTrace.active=false;return __regressionTrace.frames;});
  check(id+' buttons blend through intermediate assembly frames to the requested scene',new Set(frames.map(f=>f.intro)).size>8&&frames.at(-1).intro===1&&frames.at(-1).chapter===0&&frames.at(-1).weights[0]===1);
  if(id==='jellycast')check('Coastline and device remain separate during entry interruption',frames.every(f=>!f.layers||f.layers.device===0||f.layers.map===0));
 }
 const serial=await p.evaluate(()=>__productionScene.controller.carrierSerial);await p.locator('#studyNextProject').click();await p.waitForFunction(()=>ProjectStudy.frame().project.id==='sentinel');
 check('Next still starts the normal product-view assembly',await p.evaluate(()=>ProjectStudy.frame().intro<.3&&!document.querySelector('#studySkipIntro')));
 const interrupted=await p.evaluate(()=>{const a=ProjectStudy.frame().intro;ProjectStudy.selectChapter(2);return {before:a,after:ProjectStudy.frame().intro};});check('A chapter click after Next also avoids snapping to an assembled model',interrupted.before===interrupted.after&&interrupted.after<1);await settled(p,'sentinel');
 await p.locator('#studyPreviousProject').click();await p.waitForFunction(()=>ProjectStudy.frame().project.id==='jellycast');check('Previous retains its assembly entrance',await p.evaluate(()=>ProjectStudy.frame().intro<.3));await p.evaluate(()=>ProjectStudy.skipIntro());check('Internal completion API remains immediate without a visible skip control',await p.evaluate(()=>ProjectStudy.frame().intro===1));await settled(p,'jellycast');
 check('Chapter fixes and project changes never redispatch the conveyor',await p.evaluate(s=>__productionScene.controller.carrierSerial===s&&Math.abs(WorkshopNavigation.getState().progress-.47)<.001,serial));
 const ids=await p.evaluate(()=>WorkshopProjectRegistry.list().map(x=>x.id));
 for(const size of [[3440,800],[3840,1080],[1600,1400],[1080,1920],[1440,2560]]){
  await p.setViewportSize({width:size[0],height:size[1]});await p.waitForTimeout(120);
  for(const id of ids){await open(p,id,{skip:true});for(const chapter of [0,2]){
   await p.evaluate(c=>ProjectStudy.selectChapter(c),chapter);await settled(p,id);
   const l=await p.evaluate(()=>{const area=document.querySelector('.study-layout'),copy=document.querySelector('.study-copy').getBoundingClientRect(),m=document.querySelector('#studyModel').getBoundingClientRect(),a=document.querySelector('#studyCategory').getBoundingClientRect(),z=document.querySelector('#studyReading .study-chapter:not([hidden])').getBoundingClientRect(),r=area.getBoundingClientRect();return {mode:getComputedStyle(area).display,textMiddle:(a.top+z.bottom)/2,modelMiddle:(m.top+m.bottom)/2,copyRight:copy.right,modelLeft:m.left,textTop:a.top,textBottom:z.bottom,areaTop:r.top,areaBottom:r.bottom,overflow:document.documentElement.scrollWidth>innerWidth,glError:document.querySelector('#stage').getContext('webgl2').getError()};});report.layouts.push({size,id,chapter,...l});
   check(size[0]+'×'+size[1]+' '+id+' chapter '+(chapter+1)+' retains centred desktop content',l.mode==='grid'&&l.copyRight<l.modelLeft&&Math.abs(l.textMiddle-l.modelMiddle)<30&&l.textTop>=l.areaTop&&l.textBottom<=l.areaBottom+1&&!l.overflow&&l.glError===0);
  }}
  if(size[0]===1080||size[0]===3440){await open(p,'obsidian',{skip:true});await p.screenshot({path:'verification/study/fixed-layout-'+size[0]+'x'+size[1]+'.png'});}
 }
 for(const width of [390,320]){await p.setViewportSize({width,height:width===390?844:740});await p.waitForTimeout(150);await open(p,'terravita',{skip:true});check(width+'px mobile retains the model above readable content',await p.evaluate(()=>{const m=document.querySelector('#studyModel').getBoundingClientRect(),c=document.querySelector('.study-copy').getBoundingClientRect();return m.bottom<=c.top+1&&document.documentElement.scrollWidth<=innerWidth&&getComputedStyle(document.querySelector('#studyReading')).overflowY==='visible';}));}
 check('Header, footer and removed model buttons remain intact',await p.locator('.study-toolbar,.study-footer').count()===2&&await p.locator('#studyReset,[data-study-rotate]').count()===0);
 check('No runtime errors while interrupting assembly or resizing desktop layouts',report.errors.length===0);
}catch(e){report.failure=e.stack;throw e;}finally{fs.writeFileSync('verification/study/regressions-report.json',JSON.stringify(report,null,2)+'\n');await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
