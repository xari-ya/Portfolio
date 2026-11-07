const {launch}=require('../browser.cjs'),assert=require('node:assert/strict');
(async()=>{const b=await launch();try{
 const p=await b.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4173/');await p.waitForFunction(()=>window.__portfolioReady&&window.__labScene&&!window.__kiraSequence.active);
 await p.evaluate(()=>WorkshopNavigation.navigate('lab',{instant:true}));
 await p.waitForFunction(()=>__labScene.getState().kiraRoute.arrived&&__labScene.getState().kiraRoute.targetMode==='centre');
 const before=await p.evaluate(()=>({resources:__labScene.getState().resources,camera:__labScene.getState().camera}));
 await p.waitForFunction(()=>__labScene.getState().kiraBehaviour.leg==='inspect',null,{timeout:30000});
 const during=await p.evaluate(()=>__labScene.getState());assert.ok(Math.abs(during.kira[0])<.66&&during.kira[2]>=-21.41);
 for(const key of ['eye','target'])during.camera[key].forEach((v,i)=>assert.ok(Math.abs(v-before.camera[key][i])<.002,'Ambient motion leaves camera unchanged'));
 await p.evaluate(()=>WorkshopNavigation.navigate('experience',{instant:true}));
 await p.waitForFunction(()=>__labScene.getState().kiraRoute.arrived&&__labScene.getState().kiraRoute.targetMode==='experience',null,{timeout:20000});
 await p.screenshot({path:'verification/lab/kira-life-archives.png'});
 await p.evaluate(()=>EngineeringLab.selectJourney('leadership'));await p.waitForFunction(()=>__labScene.getState().kiraPose.gesture==='selection');
 // Compare reactions after initial asynchronous model/font loading has settled.
 const warmResources=await p.evaluate(()=>__labScene.getState().resources);
 for(let i=0;i<8;i++){await p.evaluate(i=>EngineeringLab.selectJourney(i%2?'leadership':'achievements'),i);await p.waitForTimeout(100);}
 assert.deepEqual(await p.evaluate(()=>__labScene.getState().resources),warmResources);
 await p.evaluate(()=>WorkshopNavigation.navigate('communications',{instant:true}));
 await p.waitForFunction(()=>CommunicationsRoom.behaviour.snapshot().docked,null,{timeout:45000});
 const parked=await p.evaluate(()=>__labScene.getState().kira);
 await p.evaluate(()=>CommunicationsRoom.behaviour.contact('click',0));await p.waitForTimeout(200);
 assert.equal(await p.evaluate(()=>CommunicationsRoom.behaviour.snapshot().gesture),'ack');assert.deepEqual(await p.evaluate(()=>__labScene.getState().kira),parked);
 await p.screenshot({path:'verification/lab/kira-life-contact.png'});
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(600);assert.equal(await p.evaluate(()=>CommunicationsRoom.behaviour.snapshot().gesture),'','Mobile Contact has no new desktop gestures');
 const reduced=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await reduced.goto('http://127.0.0.1:4173/');await reduced.waitForFunction(()=>window.__portfolioReady&&window.__labScene&&!window.__kiraSequence.active);await reduced.evaluate(()=>WorkshopNavigation.navigate('skills',{instant:true}));await reduced.waitForTimeout(300);
 const quiet=await reduced.evaluate(()=>__labScene.getState());assert.equal(quiet.kiraPose.roll,0);assert.equal(quiet.kiraPose.tilt,0);assert.equal(quiet.kiraRoute.leased,false);
 assert.equal(await p.locator('canvas#stage').count(),1);assert.deepEqual(errors,[]);
 console.log('PASS: inspection, interruption, archives, fixed camera, stable GPU resources, desktop docking, mobile Contact and reduced motion');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
