const {launch}=require('../browser.cjs'),fs=require('node:fs'),assert=require('node:assert/strict');
const result={checks:[],errors:[],collisions:[],minimumRobotClearance:Infinity};
const check=(s,c=true)=>{assert.ok(c,s);result.checks.push(s);console.log('PASS',s);};
const ready=async p=>{p.on('pageerror',e=>result.errors.push(e.message));await p.goto('http://127.0.0.1:4173/?workshopDebug');await p.waitForFunction(()=>window.__portfolioReady);await p.evaluate(()=>{if(__kiraSequence.active&&!__kiraSequence.entering)document.getElementById('kiraSkip')?.click()});await p.waitForFunction(()=>!__kiraSequence.active);await p.waitForFunction(()=>__engineerScene.renderer.getState().ready);};
(async()=>{const b=await launch();try{
 const p=await b.newPage({viewport:{width:1440,height:900}});await ready(p);
 const facing=await p.evaluate(()=>__engineerScene.getClearances());
 check('Forward station angles inward toward the production room',facing.facing[0]>.90&&facing.facing[2]>.2&&facing.platform[0][0]>-13.2);
 check('Display mounts to the forward infill wall independently of columns',facing.screenWall[0]>-12&&facing.screenWall[0]<-11.3&&facing.supports.every(p=>Math.hypot(p[0]-facing.screenWall[0],p[2]-facing.screenWall[2])>.8));
 const layout=await p.evaluate(()=>({position:EngineerStationLayout.position,rotation:EngineerStationLayout.rotation}));
 await p.evaluate(()=>{window.__path=[];window.__intentAt=0;window.addEventListener('workshop:navigate',()=>window.__intentAt=performance.now());window.__pathTimer=setInterval(()=>{const s=__workshopDev.state();__path.push({camera:s.cameraPose,pose:s.pose,about:EngineerAbout.getState().active,nav:WorkshopNavigation.getState(),since:performance.now()-__intentAt,columns:__engineerScene.getClearances().supports});},20);});
 for(const destination of ['about','production','overview']){await p.evaluate(n=>WorkshopNavigation.navigate(n),destination);await p.waitForTimeout(1900);}
 result.path=await p.evaluate(()=>{clearInterval(__pathTimer);return __path;});
 check('Direct navigation suppresses intermediate About Me popups',result.path.filter(s=>s.since>80&&s.nav.intent&&s.nav.intent.destination!=='about').every(s=>!s.about));
 const inside=(p,min,max)=>p.every((x,i)=>x>min[i]&&x<max[i]);
 for(const s of result.path){const eye=s.camera.eye;
  for(const c of s.columns)if(inside(eye,[c[0]-.35,.4,c[2]-.35],[c[0]+.35,7.5,c[2]+.35]))result.collisions.push({object:'column',eye});
  const dx=eye[0]-layout.position[0],dz=eye[2]-layout.position[2],c=Math.cos(layout.rotation),sn=Math.sin(layout.rotation),local=[c*dx-sn*dz,eye[1]-layout.position[1],sn*dx+c*dz];
  for(const [name,min,max] of [['station wall',[-2.65,-.25,-1.19],[2.95,7.35,-1.01]],['left bay jamb',[-2.91,0,-1.155],[-2.39,6.9,-.705]],['right bay jamb',[2.69,0,-1.155],[3.21,6.9,-.705]],['bench',[-.624,.16,.13],[1.752,.68,1.178]],['display bezel',[-2.38,.62,-.90],[2.68,3.88,-.65]]])if(inside(local,min,max))result.collisions.push({object:name,eye,local});
  for(const [name,min,max] of [['rear wall',[-11.25,-.2,-9.93],[11.25,8.3,-9.57]],['control display',[-9.345,2.49,-3.5],[-4.695,4.47,-3.1]]])if(inside(eye,min,max))result.collisions.push({object:name,eye});
 }
 check('Camera travel clears columns, wall and server monitor',result.collisions.length===0);
 await p.evaluate(()=>WorkshopNavigation.navigate('about'));await p.waitForTimeout(1800);
 const measure=()=>p.evaluate(()=>{const c=__workshopDev.state().cameraPose,L=EngineerStationLayout,panel=document.querySelector('#engineerAbout').getBoundingClientRect(),norm=a=>{const l=Math.hypot(...a);return a.map(x=>x/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),f=norm(c.target.map((x,i)=>x-c.eye[i])),r=norm(cross(f,[0,1,0]));
 const xs=[];for(const dx of [-1,1])for(const dy of [-1,1]){const pt=L.worldPoint([L.screen[0]+dx*L.screenSize[0]/2,L.screen[1]+dy*L.screenSize[1]/2,L.screen[2]+.04]),v=pt.map((x,i)=>x-c.eye[i]),z=dot(v,f);xs.push(innerWidth*(.5+dot(v,r)/(2*z*Math.tan(c.fov/2)*c.aspect)));}return {displayRight:Math.max(...xs),panelLeft:panel.left,viewport:c.viewport,panelTop:panel.top};});
 result.desktopLayout=await measure();check('Desktop biography is registered to the physical display',await p.evaluate(()=>EngineerAbout.getState().projection==='wall'&&document.querySelector('#engineerAbout').classList.contains('on-wall-screen')));
 result.laptopViewingCosine=await p.evaluate(()=>{const L=EngineerStationLayout,dx=L.character[0]-L.laptop[0],dz=L.character[2]-L.laptop[2];return (dx*Math.sin(L.laptopYaw)+dz*Math.cos(L.laptopYaw))/Math.hypot(dx,dz);});check('Laptop display faces the engineer at a useful viewing angle',result.laptopViewingCosine>.75);
 result.idleLoopError=await p.evaluate(()=>{const a=new EngineerAvatar(__engineerScene.renderer.avatar.asset);let error=0;for(const name of ['ENGINEER_IDLE','ENGINEER_RELAXED_IDLE']){a.clip=a.clips.get(name);a.loop=false;a.oneShot=false;a.nextIdle=1e9;a.age=0;a.previous=null;a.blendAge=1;a.update(0,true);const first=Array.from(a.skins[0].matrices);a.age=a.clip.duration;a.update(0,true);error=Math.max(error,...Array.from(a.skins[0].matrices).map((x,i)=>Math.abs(x-first[i])));}return error;});check('Both idle clips meet at continuous loop endpoints',result.idleLoopError<1e-5);
 await p.waitForTimeout(2000);const point=await p.evaluate(()=>{const c=__workshopDev.state().cameraPose,p=__engineerScene.renderer.getState().position,pnt=[p[0],p[1]+1.0,p[2]],norm=a=>{const l=Math.hypot(...a);return a.map(x=>x/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),f=norm(c.target.map((x,i)=>x-c.eye[i])),r=norm(cross(f,[0,1,0])),up=cross(r,f),v=pnt.map((x,i)=>x-c.eye[i]),z=dot(v,f),t=Math.tan(c.fov/2);return {x:innerWidth*(.5+dot(v,r)/(2*z*t*c.aspect)),y:innerHeight*(.5-dot(v,up)/(2*z*t))};});await p.mouse.click(point.x,point.y);await p.waitForTimeout(70);const firstAck=await p.evaluate(()=>__engineerScene.renderer.avatar.getState());await p.mouse.click(point.x,point.y);await p.waitForTimeout(70);const nextAck=await p.evaluate(()=>__engineerScene.renderer.avatar.getState());check('Click acknowledgement has a cooldown and does not restart navigation',firstAck.clip==='ENGINEER_ACKNOWLEDGE'&&nextAck.age>=firstAck.age&&await p.evaluate(()=>WorkshopNavigation.getState().destination==='about'));

 await p.screenshot({path:'verification/engineer/final-desktop.png'});
 await p.setViewportSize({width:1100,height:1000});await p.waitForTimeout(900);result.portrait=await measure();check('Tall desktop viewport uses a separate reading layout',result.portrait.viewport.height<500);
 const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await ready(m);await m.evaluate(()=>WorkshopNavigation.navigate('about'));await m.waitForTimeout(1800);
 const start=await m.evaluate(()=>({y:scrollY,progress:WorkshopNavigation.getState().progress}));
 const session=await m.context().newCDPSession(m),rect=await m.locator('.engineer-reading').boundingBox(),x=rect.x+rect.width/2,y=rect.y+rect.height-10;
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let i=1;i<=10;i++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*8}]});await m.waitForTimeout(18);}
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await m.waitForTimeout(200);
 const after=await m.evaluate(()=>({y:scrollY,top:document.querySelector('.engineer-reading').scrollTop,progress:WorkshopNavigation.getState().progress}));
 check('Actual touch swipe scrolls biography without moving scene',after.top>25&&Math.abs(after.y-start.y)<2&&Math.abs(after.progress-start.progress)<.002);
 await m.screenshot({path:'verification/engineer/final-mobile.png'});
 check('Follow-up checks have no browser errors',result.errors.length===0);
}finally{fs.writeFileSync('verification/engineer/final-navigation-report.json',JSON.stringify(result,null,2));await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
