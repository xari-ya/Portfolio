const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{launch}=require('../browser.cjs');
assert.ok(process.env.WORKSHOP_BASELINE_URL,'Serve the protected original and set WORKSHOP_BASELINE_URL');
const output=path.resolve(process.env.WORKSHOP_OUTPUT||'verification/test-results/visual');fs.mkdirSync(output,{recursive:true});
const report={method:'Reduced motion, seeded random source, fixed renderer timestamps, fixed manufacturing time; static geometry/material comparison. Normal-motion captures and physical delivery tests are separate.',captures:[],errors:[]};
const states=['overview','about','production','lab','skills','experience','communications','obsidian','terravita','jellycast','click-claim','analog-fsk','habitseed','prajaa','jellycast-map'];
async function settle(p,time){for(let i=0;i<6;i++){await p.evaluate(t=>{window.__releaseTimestamp=t;},time+i*200);await p.waitForTimeout(90);}}
(async()=>{const b=await launch();try{for(const [width,height] of [[1440,900],[390,844]])for(const [name,url] of [['baseline',process.env.WORKSHOP_BASELINE_URL],['production',process.env.WORKSHOP_BASE_URL||'http://127.0.0.1:4174']]){
 const p=await b.newPage({viewport:{width,height},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce'});p.on('pageerror',e=>report.errors.push(e.message));
 await p.addInitScript(()=>{let seed=12345;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);const raf=requestAnimationFrame;window.requestAnimationFrame=callback=>raf(time=>callback(window.__releaseTimestamp??time));});
 await p.goto(url+'/?workshopDebug');await p.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence.active&&__engineerScene.renderer.getState().ready);await p.evaluate(()=>document.fonts.ready);await p.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}#hallFocusTools{display:none!important}'});
 for(let i=0;i<states.length;i++){const state=states[i];if(i<7)await p.evaluate(id=>WorkshopNavigation.navigate(id,{instant:true}),state);else{const id=state==='jellycast-map'?'jellycast':state;await p.evaluate(id=>ProjectStudy.open(id,{resume:false}),id);await p.waitForFunction(id=>ProjectStudy.frame().project.id===id&&ProjectStudy.frame().ready,id);if(state==='jellycast-map')await p.locator('[data-study-chapter="1"]').click();}
  await p.evaluate(()=>__workshopDev.setTime(8));await settle(p,1000000+i*4000);const file=`${name}-${width}-${state}.png`;await p.screenshot({path:path.join(output,file),animations:'disabled'});report.captures.push({name,width,height,state,file,camera:await p.evaluate(()=>__workshopDev.state().cameraPose)});
 }await p.close();console.log('Fixed-time captures',name,width);}
 assert.equal(report.errors.length,0);
 }finally{fs.writeFileSync(path.join(output,'visual.json'),JSON.stringify(report,null,2));await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
