/* Cross-browser display check using the already installed Firefox/geckodriver.
 * Start geckodriver on localhost:4457 with a project-local --profile-root. */
const fs=require('node:fs');
const base='http://127.0.0.1:4457',out=process.env.FIREFOX_OUT||'verification/engineer/revision-screen';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
let session;
async function call(path,body,method=body?'POST':'GET'){
 const response=await fetch(base+path,{method,headers:{'content-type':'application/json'},body:body?JSON.stringify(body):undefined});
 const result=await response.json();if(result.value?.error)throw Error(JSON.stringify(result.value));return result.value;
}
const run=(script,args=[])=>call('/session/'+session+'/execute/sync',{script,args});
async function until(script,timeout=30000){const end=Date.now()+timeout;while(Date.now()<end){if(await run('return !!('+script+');'))return;await pause(250);}throw Error('Timed out: '+script);}
async function shot(name){const data=await call('/session/'+session+'/screenshot');fs.writeFileSync(out+'/'+name+'.png',Buffer.from(data,'base64'));}
(async()=>{try{
 const created=await call('/session',{capabilities:{alwaysMatch:{browserName:'firefox','moz:firefoxOptions':{args:process.env.FIREFOX_HEADED?[]:['--headless']}}}});session=created.sessionId;
 await call('/session/'+session+'/window/rect',{width:1920,height:1080});
 await call('/session/'+session+'/url',{url:process.env.FIREFOX_URL||'http://127.0.0.1:4173/?workshopDebug'});
 await until('window.__portfolioReady',60000);
 await run('if(__kiraSequence.active&&!__kiraSequence.entering)document.getElementById("kiraSkip")?.click();');
 await until('!__kiraSequence.active');
 await until('__engineerScene.renderer.getState().ready');
 const opening=await run('return {hash:location.hash,destination:WorkshopNavigation.getState().destination,about:EngineerAbout.getState().active};');
 if(process.env.FIREFOX_HOME_SHOT){await pause(800);await shot(process.env.FIREFOX_HOME_SHOT);}
 await run('WorkshopNavigation.navigate("about");');await pause(3200);
 const state=await run('return {userAgent:navigator.userAgent,about:EngineerAbout.getState(),webgl:!document.body.classList.contains("has-no-webgl"),matrix:getComputedStyle(document.getElementById("engineerAbout")).transform,laptop:__engineerScene.renderer.getState().laptopScreen,viewport:[innerWidth,innerHeight]};');state.opening=opening;
 await shot(process.env.FIREFOX_SHOT||'text-firefox');console.log(JSON.stringify(state,null,2));
 if(process.env.FIREFOX_LAPTOP_SHOT){const png=await run('return createWorkshopLaptopScreen().canvas.toDataURL("image/png").split(",")[1];');fs.writeFileSync(out+'/'+process.env.FIREFOX_LAPTOP_SHOT+'.png',Buffer.from(png,'base64'));}
 if(process.env.FIREFOX_CONTROL_SHOT){await run('WorkshopNavigation.navigate("overview");');await pause(1800);await run('__engineerScene.selectStation("intelligence");');await pause(2300);await shot(process.env.FIREFOX_CONTROL_SHOT);}
 if(process.env.FIREFOX_VARIANTS){
  for(const [name,css] of [
   ['flat','.on-wall-screen{transform-style:flat;backface-visibility:hidden;will-change:transform}'],
   ['layers','.on-wall-screen>*{transform:translateZ(0);backface-visibility:hidden}'],
   ['paint','.on-wall-screen{contain:paint;isolation:auto}']]){
   await run('const style=document.createElement("style");style.textContent=arguments[0];document.head.appendChild(style);',[css]);await pause(1200);await shot('text-firefox-'+name);
  }
 }
}finally{if(session)await call('/session/'+session,undefined,'DELETE');}})().catch(e=>{console.error(e);process.exitCode=1;});
