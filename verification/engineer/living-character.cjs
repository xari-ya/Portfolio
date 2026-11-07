/* Exercise the exported skeleton and the live page's pointer/display bindings. */
const {launch}=require('../browser.cjs');
const fs=require('node:fs'),assert=require('node:assert/strict');
const dir='verification/engineer/revision-screen',report={checks:[],errors:[]};
function check(name,ok){assert.ok(ok,name);report.checks.push(name);console.log('PASS',name);}
function projectCode(point){
 const c=__workshopDev.state().cameraPose,norm=a=>{const l=Math.hypot(...a);return a.map(x=>x/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),f=norm(c.target.map((x,i)=>x-c.eye[i])),r=norm(cross(f,[0,1,0])),up=cross(r,f),v=point.map((x,i)=>x-c.eye[i]),z=dot(v,f),q=Math.tan(c.fov/2);
 return {x:innerWidth*(.5+dot(v,r)/(2*z*q*c.aspect)),y:innerHeight*(.5-dot(v,up)/(2*z*q))};
}
(async()=>{const browser=await launch();try{
 const p=await browser.newPage({viewport:{width:1500,height:1000}});
 p.on('pageerror',e=>report.errors.push(e.message));
 await p.goto('http://127.0.0.1:4173/?workshopDebug');await p.waitForFunction(()=>window.__portfolioReady);
 await p.evaluate(()=>{if(__kiraSequence.active&&!__kiraSequence.entering)document.getElementById('kiraSkip')?.click()});
 await p.waitForFunction(()=>!__kiraSequence.active);await p.waitForFunction(()=>__engineerScene.renderer.getState().ready);
 await p.waitForTimeout(1200);
 const home=await p.locator('.home-intro').boundingBox();
 check('Overview text uses the open lower-left floor area',home.x<150&&home.y>500&&home.x+home.width<800&&home.y+home.height<960);
 await p.screenshot({path:dir+'/desktop-overview.png'});
 await p.evaluate(()=>WorkshopNavigation.navigate('about'));await p.waitForTimeout(2200);
 check('Desktop content uses the physical wall display',await p.evaluate(()=>EngineerAbout.getState().projection==='wall'&&document.querySelector('#engineerAbout').classList.contains('on-wall-screen')));
 const colors=await p.evaluate(()=>[...document.querySelector('.engineer-actions').children].map(el=>getComputedStyle(el).backgroundColor));
 report.buttonColors=colors;
 check('Reference button hierarchy uses red primary, outlined résumé and graphite Exit',await p.evaluate(()=>{const css=s=>getComputedStyle(document.querySelector(s));return css('.engineer-primary').backgroundImage.includes('gradient')&&css('.engineer-resume').borderTopColor==='rgb(186, 107, 80)'&&css('.engineer-back').color==='rgb(238, 234, 222)';}));
 report.motion=await p.evaluate(()=>{
  const a=new EngineerAvatar(__engineerScene.renderer.avatar.asset);a.nextBlink=1e9;a.nextIdle=1e9;a.previous=null;a.blendAge=1;
  const index=n=>a.json.nodes.findIndex(node=>node.name===n),names=['pelvis','thigh.L','shin.L','clavicle.L','hand.L','middle_01.L','ring_01.R'];
  const samples=[];for(let time=0;time<8;time+=.5){a.age=time;a.update(0,true);samples.push({world:names.map(n=>Array.from(a.world[index(n)])),feet:['foot.L','foot.R'].map(n=>Array.from(a.world[index(n)]))});}
  const maxDiff=(x,y)=>Math.max(...x.map((v,i)=>Math.abs(v-y[i])));
  const ranges=Object.fromEntries(names.map((name,i)=>[name,Math.max(...samples.map(s=>maxDiff(s.world[i],samples[0].world[i])))]));
  const footError=Math.max(...samples.flatMap(s=>s.feet.map((f,i)=>maxDiff(f,samples[0].feet[i]))));
  a.age=0;a.update(0,true);
  const palms=['L','R'].map(side=>{const i=a.skins[0].joints.indexOf(index('hand.'+side)),m=a.skins[0].matrices,v=Array.from(m.slice(i*16+8,i*16+11)),length=Math.hypot(...v);return v.map(x=>x/length);});
  return {ranges,footError,palms,bones:a.skins[0].joints.length};
 });
 check('Idle articulates pelvis, knees, shoulders and fingers',Object.values(report.motion.ranges).every(x=>x>1e-4));
 check('Idle keeps both feet planted',report.motion.footError<1e-6);
 check('Neutral palms face inward rather than toward the visitor',report.motion.palms[0][0]<-.8&&report.motion.palms[1][0]>.8&&report.motion.palms.every(v=>Math.abs(v[2])<.15));
 report.gaze=await p.evaluate(()=>{
  const a=new EngineerAvatar(__engineerScene.renderer.avatar.asset);a.nextIdle=1e9;a.nextBlink=1e9;a.lookAtTarget(.26,.10);a.update(.10);const early=a.getState();for(let i=0;i<30;i++)a.update(.02);const settled=a.getState();for(let i=0;i<190;i++)a.update(.02);return {early,settled,released:a.getState()};
 });
 check('Head leads the delayed torso response',report.gaze.early.gaze[0]>.10&&report.gaze.early.bodyGaze<report.gaze.early.gaze[0]*.10&&report.gaze.settled.bodyGaze>report.gaze.early.bodyGaze*4);
 check('A stationary cursor releases the gaze naturally',report.gaze.released.gaze.every(v=>Math.abs(v)<.001)&&Math.abs(report.gaze.released.bodyGaze)<.005);
 report.blink=await p.evaluate(()=>{
  const a=new EngineerAvatar(__engineerScene.renderer.avatar.asset);a.nextIdle=1e9;const events=[],closed=[];let count=0;
  for(let i=0;i<1800;i++){a.update(1/60);if(a.blinkIndex!==count){events.push(a.time);count=a.blinkIndex;}if(a.blink>.99)closed.push(a.time);}
  const reduced=new EngineerAvatar(a.asset,{reduced:true});reduced.update(12);return {bones:a.lids.length,events,closedSamples:closed.length,reduced:reduced.blink,finite:a.skins.every(s=>Array.from(s.matrices).every(Number.isFinite))};
 });
 const intervals=report.blink.events.slice(1).map((v,i)=>v-report.blink.events[i]);
 check('Fitted eyelids blink at varied natural intervals',report.blink.bones===2&&report.blink.closedSamples>0&&intervals.length>=4&&intervals.every(t=>t>3&&t<7)&&Math.max(...intervals)-Math.min(...intervals)>.5&&report.blink.finite);
 check('Reduced motion suppresses blinking',report.blink.reduced===0);
 await p.evaluate(()=>{const a=__engineerScene.renderer.avatar;a.playIdle();a.nextIdle=1e9;});await p.waitForTimeout(450);
 const headPoint=await p.evaluate(()=>{const q=EngineerStationLayout.worldPoint(EngineerStationLayout.character);q[1]+=1.2;return q;});
 const head=await p.evaluate(projectCode,headPoint);
 await p.mouse.move(head.x+75,head.y+25);await p.waitForTimeout(450);
 const liveGaze=await p.evaluate(()=>__engineerScene.renderer.avatar.getState());report.liveGaze=liveGaze;
 check('Real pointer movement reaches the character controller',Math.abs(liveGaze.gaze[0])>.02&&Math.abs(liveGaze.bodyGaze)>.001);
 await p.mouse.move(1450,970);await p.waitForTimeout(600);
 await p.screenshot({path:dir+'/desktop-screen.png'});
 const firstBlink=await p.evaluate(()=>__engineerScene.renderer.avatar.blinkIndex);await p.waitForTimeout(6700);
 check('The live renderer continues blinking without input',await p.evaluate(first=>__engineerScene.renderer.avatar.blinkIndex>first,firstBlink));
 await p.locator('.engineer-back').click();await p.waitForTimeout(1700);
 check('The ash Exit button returns to the workshop',await p.evaluate(()=>WorkshopNavigation.getState().destination==='overview'&&!EngineerAbout.getState().active));
 check('Focused character checks have no browser errors',report.errors.length===0);
}finally{fs.writeFileSync(dir+'/living-character-report.json',JSON.stringify(report,null,2));await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
