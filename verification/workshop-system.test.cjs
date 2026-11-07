const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Factory,datums:D,ik,fk}=require('../workshop-system.js');
const distance=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
function advance(f,seconds,step=1/120){for(let t=0;t<seconds-1e-8;t+=step)f.tick(step);}

test('sensor event requires the physical leading edge to cross the optical beam',()=>{
 const f=new Factory();f.started=true;f.enter(1);f.age=100;
 f.tick(1/120);assert.equal(f.phase,'arrival');assert.equal(f.detected,false);
 while(f.phase==='arrival')f.tick(1/120);
 const s=f.snapshot();assert.equal(s.phase,'detected');assert.equal(s.sensor,true);
 assert.ok(Math.abs(s.component[2]+.215-D.sensorZ)<1e-6);
});

test('two complete cycles keep valid ownership, continuous positions and reachable joints',()=>{
 const f=new Factory();f.started=true;const visited=new Set();let previous=f.snapshot(),maxJump=0,held=0;
 for(let i=0;i<120*135;i++){
  f.tick(1/120);const s=f.snapshot();visited.add(s.phase);
  assert.ok(s.component.every(Number.isFinite));assert.ok(s.shuttle.every(Number.isFinite));
  assert.ok(distance(fk(s.pose),s.arm)<1e-9,'FK must reach the requested component datum');
  if(s.count===previous.count)maxJump=Math.max(maxJump,distance(s.component,previous.component));
  if(s.owner==='gripper'){
   held++;assert.equal(s.grip,D.closed);assert.ok(distance(s.tool,s.component)<1e-9);
  }
  if(s.phase==='release')assert.equal(s.owner,'stage','support precedes opening');
  if(!s.visible){assert.equal(s.owner,'cassette');assert.ok(s.component[2]<-5.3);if(previous.visible)assert.equal(s.outputGate,0);}
  // Rail return uses the same two orthogonal axes as the loaded transfer.
  if(s.index>=7)assert.ok(Math.abs(s.shuttle[0]+.62)<1e-6||Math.abs(s.shuttle[2]-3.5)<1e-6);
  previous=s;
 }
 assert.ok(f.count>=3);assert.equal(visited.size,16);assert.ok(held>500);
 assert.ok(maxJump<.03,'No visible parent swap or placement jump');
});

test('fixed steps produce the same cycle at 20, 30, 60 and 120 updates per second',()=>{
 const samples=[20,30,60,120].map(fps=>{const f=new Factory();f.started=true;advance(f,44,1/fps);return f.snapshot();});
 for(const s of samples){assert.equal(s.phase,samples[0].phase);assert.ok(distance(s.component,samples[0].component)<1e-7);assert.ok(Math.abs(s.clock-samples[0].clock)<1/120+.0001);}
});

test('pause freezes every manufacturing datum; restart drains through output before ready',()=>{
 const f=new Factory();f.started=true;advance(f,30);f.paused=true;
 const before=f.snapshot();advance(f,5);assert.deepEqual(f.snapshot(),before);
 f.restart();assert.equal(f.paused,false);assert.equal(f.phase,'transport');
 const transitions=[];f.onEvent=e=>transitions.push(e.phase);
 while(f.count===1)f.tick(1/60);
 assert.ok(transitions.includes('output'));assert.ok(transitions.includes('reset'));
 assert.equal(f.phase,'ready');assert.equal(f.restartRequested,false);
});

test('inspection holds the actual part on a rotating fixture and leaves time to inspect completion',()=>{
 const f=new Factory();f.started=true;advance(f,40);let s=f.snapshot();
 assert.equal(s.phase,'inspection');assert.equal(s.owner,'stage');assert.ok(s.rotation>0&&s.rotation<Math.PI*2);
 advance(f,5);s=f.snapshot();assert.equal(s.phase,'complete');assert.equal(s.visible,true);
 assert.equal(s.completed,true);assert.equal(s.rotation,Math.PI*2);assert.ok(distance(s.component,D.stage)<1e-9);
 advance(f,3);assert.equal(f.phase,'complete');
});

test('infeed and output are separate, standardized variants repeat without new objects',()=>{
 const f=new Factory();f.started=true;const variants=[];
 for(let cycle=1;cycle<=3;cycle++){variants.push(f.snapshot().type);while(f.count===cycle)f.tick(1/60);}
 assert.deepEqual(variants,[0,1,2]);assert.equal(f.snapshot().type,0);
});

test('invalid reach is rejected and the same kinematics solve real cell datums',()=>{
 for(const point of [D.park,D.pickup,D.stage,[-.62,1.65,.73],[.6,1.41,-.12]])assert.ok(distance(fk(ik(point)),point)<1e-9);
 assert.throws(()=>ik([9,4,0]),/outside robot reach/);
});

test('roller travel and the shared ambient clock remain continuous across cycle boundaries',()=>{
 const f=new Factory();f.started=true;let previous=f.snapshot();
 for(let i=0;i<120*135;i++){
  f.tick(1/120);const s=f.snapshot();
  assert.ok(s.totalTime>=previous.totalTime);
  assert.ok(s.rollerDistance>=previous.rollerDistance-1e-9);
  assert.ok(s.rollerDistance-previous.rollerDistance<.02);
  previous=s;
 }
});
