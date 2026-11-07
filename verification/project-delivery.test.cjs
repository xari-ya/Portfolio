const {test}=require('node:test'),assert=require('node:assert/strict');
const {Factory:Base,datums:D}=require('../workshop-system.js'),{Factory}=require('../project-delivery.js'),registry=require('../project-registry.js');
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const job=id=>registry.get(id),make=()=>{const f=new Factory();f.started=true;return f;};
function until(f,condition,limit=60){for(let i=0;i<limit*120;i++){if(condition(f.snapshot()))return;f.tick(1/120);}throw Error('Timed out: '+JSON.stringify(f.snapshot().project));}
function advance(f,seconds){for(let i=0;i<seconds*120;i++)f.tick(1/120);}

test('unselected factory retains the exact autonomous sequence and timing',()=>{
 const a=new Base(),b=make();a.started=true;for(let i=0;i<120*135;i++){a.tick(1/120);b.tick(1/120);const s=a.snapshot(),t=b.snapshot();for(const key of Object.keys(s))assert.deepEqual(t[key],s[key],key);}
});
test('featured preview does not dispatch a physical project',()=>{const f=make();assert.equal(f.handoff().featured,true);assert.equal(f.handoff().explicit,false);assert.equal(f.job,null);assert.equal(f.carrierSerial,0);assert.ok(registry.list().length>=4);});
test('entering discovery cancels an active operation and freezes an empty parked line',()=>{
 const f=make();f.seek(30);assert.equal(f.snapshot().owner,'gripper');f.enterDiscovery();const s=f.snapshot();assert.equal(s.project.mode,'discovery');assert.equal(s.visible,false);assert.equal(s.inspection,false);assert.equal(s.completed,false);assert.equal(s.grip,D.open);assert.ok(distance(s.arm,D.park)<1e-8);assert.equal(s.rotation,0);assert.equal(s.clampAmount,0);assert.equal(s.job,null);advance(f,10);assert.deepEqual(f.snapshot(),s);
});
test('selection immediately cancels a held ordinary part without completing it',()=>{
 const f=make();f.seek(30);f.paused=false;const cycle=f.count,events=f.events.length;f.requestProject(job('terravita'));const s=f.snapshot();assert.equal(s.project.stage,'prepared');assert.equal(s.job.id,'terravita');assert.equal(s.pendingProject,undefined);assert.equal(f.pendingProject,null);assert.equal(f.count,cycle);assert.equal(s.inspection,false);assert.equal(s.completed,false);assert.ok(distance(s.component,D.input)<1e-8);assert.ok(distance(s.arm,D.park)<1e-8);assert.equal(s.inputGate,0);assert.ok(f.events.slice(events).every(e=>!['inspection','complete','output'].includes(e.phase)));
});
test('only the latest selection remains, and duplicate clicks never create a second copy',()=>{
 const f=make();f.enterDiscovery();f.requestProject(job('obsidian'));advance(f,2);f.requestProject(job('terravita'));f.requestProject(job('jellycast'));assert.equal(f.job.id,'jellycast');assert.equal(f.pendingProject,null);assert.equal(f.returning,null);assert.ok(distance(f.snapshot().component,D.input)<1e-8);const serial=f.carrierSerial;for(let i=0;i<20;i++)assert.equal(f.requestProject(job('jellycast')),false);assert.equal(f.carrierSerial,serial);
});
test('selected delivery still uses the real sensor, supported shuttle and reachable parked arm',()=>{
 const f=make();f.enterDiscovery();f.requestProject(job('obsidian'));let prior=f.snapshot(),detected=false,maxJump=0;until(f,s=>{if(s.project.identified&&!detected){assert.ok(s.component[2]+.215>=D.sensorZ-1e-7);detected=true;}maxJump=Math.max(maxJump,distance(s.component,prior.component));assert.ok(distance(s.arm,D.park)<1e-8);assert.equal(s.grip,D.open);prior=s;return s.project.ready;},20);assert.ok(detected);assert.ok(maxJump<.18);assert.equal(f.snapshot().owner,'shuttle');assert.ok(distance(f.snapshot().component,D.pickup)<1e-8);assert.equal(f.handoff().carrierReadyForPickup,true);
});
test('the original arm pickup, attachment, placement and inspection remain coordinated',()=>{
 const f=make();f.requestProject(job('obsidian'));until(f,s=>s.project.ready);f.presentProject();let held=false,placed=false,scanned=false;until(f,s=>{if(s.owner==='gripper'){held=true;assert.ok(distance(s.component,s.tool)<1e-7);}if(s.owner==='stage')placed=true;if(s.inspection)scanned=true;return s.project.stage==='complete';});assert.ok(held&&placed&&scanned);assert.equal(f.snapshot().owner,'stage');
});
test('leaving the arm clears the carrier and workholding immediately at any project phase',()=>{
 for(const phase of ['pickup','grip','lift','transport','placement','release','retract','inspection','complete']){const f=make();f.requestProject(job('kira'));f.presentProject();until(f,s=>s.phase===phase);f.leavePresentation({standby:true});const s=f.snapshot();assert.equal(s.job,null,phase);assert.equal(s.visible,false,phase);assert.equal(s.grip,D.open,phase);assert.ok(distance(s.arm,D.park)<1e-8,phase);assert.equal(s.clampAmount,0,phase);assert.equal(s.rotation,0,phase);assert.equal(f.handoff().projectId,'kira');assert.equal(f.handoff().carrierId,null);assert.equal(f.handoff().carrierReadyForPickup,false);}
});
test('the next project dispatches immediately after clearing a partial presentation',()=>{
 const f=make();f.requestProject(job('obsidian'));f.presentProject();until(f,s=>s.phase==='transport');f.leavePresentation({standby:true});f.requestProject(job('terravita'));assert.equal(f.snapshot().project.stage,'prepared');assert.equal(f.job.id,'terravita');assert.equal(f.count,1);assert.equal(f.carrierSerial,2);assert.equal(f.pendingProject,null);
});
test('leaving discovery resumes autonomous work from empty ready, preserving metadata',()=>{
 const f=make();f.requestProject(job('kira'));f.enterDiscovery();f.resumeAutonomous();assert.equal(f.discoveryHold,false);assert.equal(f.job,null);assert.equal(f.phase,'ready');assert.equal(f.handoff().projectId,'kira');advance(f,4);assert.equal(f.phase,'arrival');
});
test('pause remains exact during project delivery',()=>{const f=make();f.requestProject(job('kira'));advance(f,2);f.paused=true;const before=f.snapshot();advance(f,4);assert.deepEqual(f.snapshot(),before);});
test('skip replays only the selected job and matches the unskipped inspected result',()=>{
 const f=make(),g=make();f.seek(30);g.seek(30);f.paused=g.paused=false;f.requestProject(job('kira'));g.requestProject(job('kira'));g.presentProject();assert.equal(f.finishPresentation(),true);until(g,s=>s.project.stage==='complete');for(const key of ['phase','component','owner','pose','detected','completed','rollerDistance'])assert.deepEqual(f.snapshot()[key],g.snapshot()[key],key);assert.equal(f.carrierSerial,1);assert.equal(f.finishPresentation(),true);assert.equal(f.carrierSerial,1);
});
test('a configured unknown carrier representation uses the standard path',()=>{registry.register({id:'new-project',name:'New project',description:'Configurable fixture test.',carrierKind:'unknown'});const f=make();f.requestProject(registry.get('new-project'));until(f,s=>s.project.ready);assert.equal(f.handoff().projectId,'new-project');registry.remove('new-project');});
test('clearing and inspecting metadata alone never fabricates a replacement job',()=>{const f=make();f.requestProject(job('obsidian'));f.leavePresentation({standby:true});assert.equal(f.presentProject(),false);assert.equal(f.finishPresentation(),false);assert.equal(f.job,null);assert.equal(f.handoff().carrierId,null);assert.equal(f.handoff().explicit,true);});

test('project inspection makes two turns and releases through the existing supported output path',()=>{
 const f=make();f.requestProject(job('obsidian'));f.presentProject();until(f,s=>s.inspection);
 let prior=0;until(f,s=>{if(s.inspection){assert.ok(s.rotation>=prior);assert.ok(s.rotation<=Math.PI*4);prior=s.rotation;}return s.project.stage==='complete';});
 assert.equal(f.snapshot().rotation,Math.PI*4);assert.equal(f.events.filter(e=>e.type==='presentation-completed').length,1);
 const position=f.snapshot().component.slice();assert.equal(f.releaseToStudy(),true);assert.equal(f.releaseToStudy(),false);assert.equal(f.phase,'output');assert.ok(distance(f.snapshot().component,position)<1e-8);
 let last=f.snapshot(),cassette=false;until(f,s=>{if(s.visible&&last.visible)assert.ok(distance(s.component,last.component)<.1);if(!s.visible)cassette=true;last=s;return s.project.mode==='autonomous';},15);
 assert.ok(cassette);assert.equal(f.job,null);assert.equal(f.selection.id,'obsidian');assert.equal(f.discoveryHold,false);assert.equal(f.phase,'ready');advance(f,4);assert.equal(f.phase,'arrival');
});
test('hiding deferred and companion projects leaves seven deployed study references intact',()=>{
 assert.equal(registry.get('kira').discoverable,false);assert.equal(registry.list().some(p=>p.id==='kira'||p.id==='small-business-pos'),false);assert.equal(registry.list().length,7);assert.equal(registry.get('sentinel'),null);assert.ok(registry.list().every(p=>Number.isInteger(p.legacyIndex)&&p.theme.colour));
});

test('selected projects finish the physical sequence within 8 seconds at 20–120 fps',()=>{
 for(const fps of [20,30,60,120]){
  const f=make();f.requestProject(job('obsidian'));
  let elapsed=0,readyAt=null;const phases=new Set();
  while(elapsed<9){
   f.tick(1/fps);elapsed+=1/fps;const s=f.snapshot();phases.add(s.phase);
   if(s.project.ready){readyAt??=elapsed;if(elapsed-readyAt>=.1)f.presentProject();}
   if(s.completed)break;
  }
  assert.equal(f.snapshot().completed,true);
  assert.ok(elapsed<8,`${fps} fps completed in ${elapsed}s`);
  for(const phase of ['arrival','detected','shuttle','pickup','grip','lift','transport','placement','release','retract','inspection'])assert.ok(phases.has(phase),`${fps} fps retains ${phase}`);
  assert.equal(f.snapshot().rotation,Math.PI*4);
 }
});

test('mobile delivery adds breathing room while keeping the physical sequence under ten seconds',()=>{
 for(const fps of [20,30,60,120]){
  const f=make();f.requestProject(job('obsidian'),{mobile:true});f.presentProject();
  let elapsed=0;
  while(elapsed<11&&!f.snapshot().completed){f.tick(1/fps);elapsed+=1/fps;}
  assert.equal(f.snapshot().completed,true);
  assert.ok(elapsed>9.3&&elapsed<10,`${fps} fps: ${elapsed}s`);
  assert.equal(f.snapshot().rotation,Math.PI*4);
 }
});
